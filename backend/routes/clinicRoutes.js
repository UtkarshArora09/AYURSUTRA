const express = require("express");
const db = require("../config/db");
const { protect, authorize } = require("../middleware/authMiddleware");
const { lockSchedule } = require("../models/clinicSchedule");
const router = express.Router();
const route = (handler) => (req, res, next) => handler(req, res).catch(next);
const audit = (client, user, action, resourceId) => client.query(
  "INSERT INTO clinic_audit(actor_role, actor_id, action, resource_id) VALUES ($1, $2, $3, $4)",
  [user.role, user.id, action, String(resourceId)]
);

router.use(protect);

router.get("/worklist", authorize("doctor", "therapist", "patient"), route(async (req, res) => {
  const column = { doctor: "doctor_id", therapist: "therapist_id", patient: "patient_id" }[req.user.role];
  const { rows } = await db.query(
    `SELECT b.booking_id, CASE WHEN $2 = 'doctor' THEN b.patient_id END AS patient_id, b.therapy_type, b.scheduled_date::text AS date, b.scheduled_time AS time,
            b.status, b.duration_minutes, b.preparation, b.follow_up, b.therapist_id,
            CASE WHEN $2 <> 'patient' THEN b.session_notes END AS session_notes,
            CASE WHEN $2 = 'patient' THEN NULL ELSE concat_ws(' ', p.first_name, p.last_name) END AS patient,
            (SELECT json_agg(json_build_object('id', r.id, 'name', r.filename) ORDER BY r.id)
             FROM clinic_reports r WHERE r.booking_id = b.booking_id) AS reports,
            CASE WHEN $2 = 'patient' THEN (
              SELECT json_agg(json_build_object('id', bill_id, 'amount', amount, 'status', status) ORDER BY bill_id)
              FROM billing WHERE booking_id = b.booking_id AND patient_id = $1
            ) END AS invoices
     FROM therapy_bookings b JOIN patients p USING (patient_id)
     WHERE b.${column} = $1
     ORDER BY CASE WHEN b.scheduled_date >= current_date THEN 0 ELSE 1 END,
       CASE WHEN b.scheduled_date >= current_date THEN b.scheduled_date END,
       b.scheduled_date DESC NULLS LAST, b.scheduled_time, b.booking_id DESC LIMIT 50 OFFSET $3`,
    [req.user.id, req.user.role, Math.max(0, Math.min(10000, Number.parseInt(req.query.offset, 10) || 0))]
  );
  res.json(rows);
}));

router.get("/schedule", authorize("admin"), route(async (req, res) => {
  const [centers, shifts, leave, doctors, therapies] = await Promise.all([
    db.query("SELECT * FROM clinic_centers ORDER BY id"),
    db.query("SELECT s.*, d.name FROM clinic_shifts s JOIN doctors d USING(doctor_id) ORDER BY weekday, starts_at"),
    db.query("SELECT l.doctor_id, l.date::text, d.name FROM clinic_leave l JOIN doctors d USING(doctor_id) WHERE date >= current_date ORDER BY date"),
    db.query("SELECT doctor_id AS id, name FROM doctors ORDER BY name"),
    db.query("SELECT id, name, duration FROM therapies ORDER BY name"),
  ]);
  res.json({ centers: centers.rows, shifts: shifts.rows, leave: leave.rows, doctors: doctors.rows, therapies: therapies.rows });
}));

router.post("/schedule", authorize("admin"), route(async (req, res) => {
  const { type, doctorId, centerId, weekday, start, end, date, capacity, shiftId, name, duration } = req.body;
  const commands = {
    shift: ["INSERT INTO clinic_shifts(doctor_id, center_id, weekday, starts_at, ends_at) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (doctor_id, center_id, weekday, starts_at) DO UPDATE SET ends_at = EXCLUDED.ends_at", [doctorId, centerId, weekday, start, end]],
    leave: ["INSERT INTO clinic_leave VALUES ($1,$2) ON CONFLICT DO NOTHING", [doctorId, date]],
    capacity: ["UPDATE clinic_centers SET room_capacity = $2 WHERE id = $1", [centerId, capacity]],
    therapy: ["WITH updated AS (UPDATE therapies SET duration = $2 WHERE lower(name) = lower($1) RETURNING id) INSERT INTO therapies(name, duration) SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM updated)", [name, duration]],
    "remove-shift": ["DELETE FROM clinic_shifts WHERE id = $1", [shiftId]],
    "remove-leave": ["DELETE FROM clinic_leave WHERE doctor_id = $1 AND date = $2", [doctorId, date]],
  };
  if (type === "therapy" && (typeof name !== "string" || !name.trim() || !Number.isInteger(Number(duration)) || Number(duration) < 15 || Number(duration) > 480)) {
    return res.status(400).json({ message: "Use a therapy name and a duration from 15 to 480 minutes" });
  }
  if (!Object.hasOwn(commands, type)) return res.status(400).json({ message: "Choose a schedule change" });
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await lockSchedule(client);
    await client.query(...commands[type]);
    await audit(client, req.user, "schedule." + type, doctorId || centerId || shiftId || name);
    await client.query("COMMIT");
    res.sendStatus(204);
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code?.startsWith("22") || error.code?.startsWith("23")) {
      return res.status(400).json({ message: "Check the schedule details" });
    }
    throw error;
  } finally {
    client.release();
  }
}));

router.get("/therapists", authorize("doctor"), route(async (req, res) => {
  const { rows } = await db.query(
    "SELECT therapist_id AS id, name FROM therapists WHERE assigned_doctor_id = $1 ORDER BY name", [req.user.id]
  );
  res.json(rows);
}));

router.patch("/worklist/:id", authorize("doctor", "therapist"), route(async (req, res) => {
  const { preparation, followUp, status, therapistId, sessionNotes } = req.body;
  if (![preparation, followUp, sessionNotes].every((value) => value == null || typeof value === "string" && value.length <= 4000) ||
      (status != null && !["confirmed", "completed", "no_show"].includes(status))) {
    return res.status(400).json({ message: "Check the session details" });
  }
  if (req.user.role === "therapist" && (therapistId !== undefined || preparation !== undefined || status === "confirmed")) {
    return res.status(403).json({ message: "Only the doctor can change assignments, preparation or confirmation" });
  }
  const { rowCount } = await db.query(
    `WITH changed AS (
       UPDATE therapy_bookings SET preparation = COALESCE($4, preparation), follow_up = COALESCE($5, follow_up),
         session_notes = COALESCE($9, session_notes), status = COALESCE($6, status), therapist_id = CASE WHEN $7 THEN $8 ELSE therapist_id END
       WHERE booking_id = $3 AND CASE WHEN $1 = 'doctor' THEN doctor_id = $2 ELSE therapist_id = $2 END
         AND (status IS NULL OR lower(status) IN ('pending', 'confirmed', 'scheduled', 'rescheduled') OR ($6::text IS NULL AND lower(status) IN ('completed', 'no_show')))
         AND ($8::int IS NULL OR EXISTS (SELECT 1 FROM therapists WHERE therapist_id = $8 AND assigned_doctor_id = $2))
       RETURNING booking_id
     )
     INSERT INTO clinic_audit(actor_role, actor_id, action, resource_id)
     SELECT $1, $2, 'session.update', booking_id::text FROM changed`,
    [req.user.role, req.user.id, req.params.id, preparation, followUp, status, therapistId !== undefined, therapistId, sessionNotes]
  );
  if (!rowCount) return res.status(404).json({ message: "Session unavailable" });
  res.sendStatus(204);
}));

router.post("/reports/:bookingId", authorize("doctor"), express.raw({ type: "application/pdf", limit: "5mb" }), route(async (req, res) => {
  if (!Buffer.isBuffer(req.body) || req.body.subarray(0, 5).toString() !== "%PDF-") {
    return res.status(400).json({ message: "Upload a PDF file" });
  }
  const filename = String(req.query.filename || "report.pdf").replace(/[^a-z0-9_.-]/gi, "_").slice(-120);
  const { rowCount } = await db.query(
    `WITH uploaded AS (
       INSERT INTO clinic_reports(booking_id, filename, content)
       SELECT booking_id, $3, $4 FROM therapy_bookings WHERE booking_id = $1 AND doctor_id = $2 RETURNING id
     )
     INSERT INTO clinic_audit(actor_role, actor_id, action, resource_id)
     SELECT 'doctor', $2, 'report.upload', id::text FROM uploaded`,
    [req.params.bookingId, req.user.id, filename, req.body]
  );
  if (!rowCount) return res.status(404).json({ message: "Session unavailable" });
  res.sendStatus(201);
}));

router.get("/reports/:id", authorize("patient", "doctor", "therapist"), route(async (req, res) => {
  const column = { doctor: "doctor_id", therapist: "therapist_id", patient: "patient_id" }[req.user.role];
  const { rows: [report] } = await db.query(
    `WITH allowed AS (
       SELECT r.* FROM clinic_reports r JOIN therapy_bookings b USING (booking_id)
       WHERE r.id = $1 AND b.${column} = $2
     ), logged AS (
       INSERT INTO clinic_audit(actor_role, actor_id, action, resource_id)
       SELECT $3, $2, 'report.download', id::text FROM allowed
     ) SELECT filename, content FROM allowed`, [req.params.id, req.user.id, req.user.role]
  );
  if (!report) return res.status(404).json({ message: "Report unavailable" });
  res.set("Cache-Control", "no-store").attachment(report.filename).type("application/pdf").send(report.content);
}));

router.get("/metrics", authorize("admin"), route(async (req, res) => {
  const { rows: [metrics] } = await db.query(
    `SELECT
      (SELECT round(avg(extract(epoch FROM called_at - created_at) / 60), 1)
       FROM queue_tickets WHERE called_at >= now() - interval '30 days') AS wait_minutes,
      (SELECT count(*) FROM therapy_bookings WHERE status = 'no_show'
       AND scheduled_date BETWEEN current_date - 29 AND current_date) AS no_shows,
      (SELECT coalesce(sum(duration_minutes), 0) FROM therapy_bookings WHERE status = 'completed'
       AND scheduled_date BETWEEN current_date - 29 AND current_date) AS used_minutes,
      (SELECT coalesce(sum(extract(epoch FROM (ends_at - starts_at)) / 60), 0)
       FROM generate_series(current_date - 29, current_date, interval '1 day') days(day)
       JOIN clinic_shifts ON weekday = extract(dow FROM days.day)
       WHERE NOT EXISTS (SELECT 1 FROM clinic_leave l WHERE l.doctor_id = clinic_shifts.doctor_id AND l.date = days.day::date)) AS scheduled_minutes`
  );
  res.json(metrics);
}));

module.exports = router;
