const express = require("express");
const db = require("../config/db");
const { protect, authorize } = require("../middleware/authMiddleware");
const { clinicError, validId, validDate } = require("../models/clinicTransaction");
const { createPlan } = require("../models/treatmentPlan");
const waitlist = require("../models/clinicWaitlist");

const router = express.Router();
const route = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    if (error.code === "23505") return res.status(409).json({ message: "You already have an active entry for this doctor, branch and therapy" });
    if (error.code === "23503") return res.status(400).json({ message: "Choose an existing doctor and branch" });
    next(error);
  }
};
router.use(protect);

router.get("/options", route(async (req, res) => {
  const [centers, doctors, therapies, patients] = await Promise.all([
    db.query("SELECT id, name FROM clinic_centers ORDER BY id"),
    db.query("SELECT doctor_id AS id, name FROM doctors ORDER BY name"),
    db.query("SELECT DISTINCT name FROM therapies ORDER BY name"),
    req.user.role === "doctor" ? db.query(
      `SELECT patient_id AS id, concat_ws(' ', first_name, last_name) AS name FROM patients
       WHERE patient_id IN (SELECT patient_id FROM therapy_bookings WHERE doctor_id = $1
         UNION SELECT patient_id FROM appointments WHERE doctor_id = $1)
       ORDER BY name, patient_id`, [req.user.id]
    ) : { rows: [] },
  ]);
  res.json({ centers: centers.rows, doctors: doctors.rows, therapies: therapies.rows, patients: patients.rows });
}));

router.get("/calendar", authorize("admin", "doctor"), route(async (req, res) => {
  const { date, centerId } = req.query;
  if (!validDate(date) || !validId(centerId)) throw clinicError(400, "Choose a calendar date and branch");
  const doctor = req.user.role === "doctor" ? req.user.id : null;
  const values = [date, centerId, doctor];
  const [branch, shifts, leave, appointments, offers] = await Promise.all([
    db.query("SELECT id, name, room_capacity FROM clinic_centers WHERE id = $1", [centerId]),
    db.query(
      `SELECT s.id, d.name AS doctor, s.starts_at, s.ends_at FROM clinic_shifts s JOIN doctors d USING(doctor_id)
       WHERE s.center_id = $2 AND s.weekday = extract(dow FROM $1::date)
         AND ($3::int IS NULL OR s.doctor_id = $3) ORDER BY s.starts_at, d.name`, values
    ),
    db.query(
      `SELECT l.doctor_id, d.name AS doctor FROM clinic_leave l JOIN doctors d USING(doctor_id)
       WHERE l.date = $1 AND ($3::int IS NULL OR l.doctor_id = $3)
         AND EXISTS (SELECT 1 FROM clinic_shifts WHERE doctor_id = l.doctor_id AND center_id = $2)
       ORDER BY d.name`, values
    ),
    db.query(
      `SELECT b.booking_id AS id, b.scheduled_time AS time, b.duration_minutes, b.status, d.name AS doctor,
              CASE WHEN $3::int IS NULL OR b.doctor_id = $3 THEN b.therapy_type END AS therapy,
              CASE WHEN $3::int IS NULL OR b.doctor_id = $3 THEN b.treatment_plan_id END AS plan_id
       FROM therapy_bookings b LEFT JOIN doctors d USING(doctor_id)
       WHERE b.scheduled_date = $1 AND b.center_id = $2 ORDER BY b.scheduled_time, b.booking_id`, values
    ),
    db.query(
      `SELECT o.id, o.scheduled_time AS time, o.duration_minutes, o.expires_at
       FROM clinic_waitlist_offers o JOIN clinic_waitlist w ON w.id = o.entry_id
       WHERE o.scheduled_date = $1 AND w.center_id = $2 AND o.closed_at IS NULL
         AND o.expires_at > clock_timestamp() AND ($3::int IS NULL OR w.doctor_id = $3)
       ORDER BY o.scheduled_time`, values
    ),
  ]);
  if (!branch.rows.length) throw clinicError(404, "Branch unavailable");
  res.json({ branch: branch.rows[0], shifts: shifts.rows, leave: leave.rows, appointments: appointments.rows, offers: offers.rows });
}));

router.get("/waitlist", authorize("patient"), route(async (req, res) => {
  const { rows } = await db.query(
    `SELECT w.id, d.name AS doctor, c.name AS branch, w.therapy, w.earliest::text, w.latest::text,
            CASE WHEN w.status = 'offered' AND o.expires_at <= clock_timestamp() THEN 'expired'
                 WHEN w.status = 'waiting' AND w.latest < (now() AT TIME ZONE 'Asia/Kolkata')::date THEN 'expired'
                 ELSE w.status END AS status,
            o.scheduled_date::text AS date, o.scheduled_time AS time, o.expires_at, o.booking_id
     FROM clinic_waitlist w JOIN doctors d USING(doctor_id) JOIN clinic_centers c ON c.id = w.center_id
     LEFT JOIN clinic_waitlist_offers o ON o.entry_id = w.id
     WHERE w.patient_id = $1 ORDER BY (w.status = 'offered') DESC, (w.status = 'waiting') DESC, w.id DESC LIMIT 50`,
    [req.user.id]
  );
  res.json(rows);
}));

router.post("/waitlist", authorize("patient"), route(async (req, res) => {
  const { doctorId, centerId, therapy, earliest, latest } = req.body;
  if (!validId(doctorId) || !validId(centerId) || !validDate(earliest) || !validDate(latest) ||
      earliest > latest || typeof therapy !== "string" || !therapy.trim() || therapy.length > 100) {
    throw clinicError(400, "Enter a doctor, branch, therapy and valid date range");
  }
  const { rows: [entry] } = await db.query(
    `INSERT INTO clinic_waitlist(patient_id, doctor_id, center_id, therapy, earliest, latest)
     SELECT $1,$2,$3,$4,$5,$6 WHERE $5::date >= (now() AT TIME ZONE 'Asia/Kolkata')::date
       AND $6::date <= (now() AT TIME ZONE 'Asia/Kolkata')::date + 180
     ON CONFLICT (patient_id, doctor_id, center_id, lower(therapy)) WHERE status IN ('waiting','offered')
     DO UPDATE SET earliest = EXCLUDED.earliest, latest = EXCLUDED.latest
       WHERE clinic_waitlist.status = 'waiting' AND clinic_waitlist.latest < (now() AT TIME ZONE 'Asia/Kolkata')::date
     RETURNING id`, [req.user.id, doctorId, centerId, therapy.trim(), earliest, latest]
  );
  if (!entry) throw clinicError(409, "Check your active entries and choose dates within the next 180 days");
  res.status(201).json(entry);
}));

router.post("/waitlist/:id/:action", authorize("patient"), route(async (req, res) => {
  const { id, action } = req.params;
  if (!validId(id) || !["accept", "decline", "withdraw"].includes(action)) throw clinicError(400, "Choose a valid waitlist action");
  res.json(await waitlist.respond(req.user.id, id, action));
}));

router.get("/plans", authorize("doctor", "patient"), route(async (req, res) => {
  const scope = req.user.role === "doctor" ? "doctor_id" : "patient_id";
  const { rows } = await db.query(
    `SELECT p.id, p.title, p.instructions, p.follow_up, c.name AS branch,
       concat_ws(' ', a.first_name, a.last_name) AS patient, d.name AS doctor,
       COALESCE((SELECT json_agg(json_build_object(
          'id', b.booking_id, 'date', b.scheduled_date::text, 'time', b.scheduled_time,
          'therapy', b.therapy_type, 'status', b.status, 'followUp', b.follow_up
        ) ORDER BY b.scheduled_date, b.scheduled_time, b.booking_id)
        FROM therapy_bookings b WHERE b.treatment_plan_id = p.id), '[]') AS sessions
     FROM treatment_plans p JOIN clinic_centers c ON c.id = p.center_id
     JOIN patients a USING(patient_id) LEFT JOIN doctors d ON d.doctor_id = p.doctor_id
     WHERE p.${scope} = $1 ORDER BY p.id DESC LIMIT 50`, [req.user.id]
  );
  res.json(rows);
}));

router.post("/plans", authorize("doctor"), route(async (req, res) => {
  res.status(201).json(await createPlan(req.user.id, req.body));
}));

router.patch("/plans/:id", authorize("doctor"), route(async (req, res) => {
  const { followUp } = req.body;
  if (!validId(req.params.id) || typeof followUp !== "string" || followUp.length > 4000) {
    throw clinicError(400, "Enter valid follow-up instructions");
  }
  const { rowCount } = await db.query(
    `WITH updated AS (
       UPDATE treatment_plans SET follow_up = $3 WHERE id = $1 AND doctor_id = $2 RETURNING id
     )
     INSERT INTO clinic_audit(actor_role, actor_id, action, resource_id)
     SELECT 'doctor', $2, 'plan.follow_up', id::text FROM updated`,
    [req.params.id, req.user.id, followUp.trim()]
  );
  if (!rowCount) throw clinicError(404, "Treatment plan unavailable");
  res.sendStatus(204);
}));

module.exports = router;
