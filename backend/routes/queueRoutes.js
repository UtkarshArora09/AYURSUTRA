const express = require("express");
const db = require("../config/db");
const { protect, authorize } = require("../middleware/authMiddleware");
const router = express.Router();
const { subscribe } = require("../models/queueEvents");

const order = "CASE WHEN priority = 'emergency' THEN 0 ELSE 1 END, created_at, id";
const columns = "id, name, phone, date::text AS date, hospital, service, priority, status, extract(epoch FROM created_at) * 1000 AS timestamp";
const handle = (action) => (req, res, next) => Promise.resolve(action(req, res)).catch((error) => {
  if (["22P02", "22008", "22007"].includes(error.code)) {
    return res.status(400).json({ message: "Invalid queue details" });
  }
  next(error);
});

router.use(protect);

router.get("/events", authorize("patient", "doctor", "admin"), handle(async (req, res) => {
  const patient = req.user.role === "patient";
  const { date, hospital, service } = req.query;
  if (!patient && (typeof date !== "string" || !date || Boolean(hospital) !== Boolean(service))) {
    return res.status(400).json({ message: "Select a date, branch and service" });
  }
  let scope;
  if (patient) {
    const { rows } = await db.query(
      "SELECT date::text, hospital, service FROM queue_tickets WHERE patient_id = $1 ORDER BY (status IN ('waiting', 'called')) DESC, id DESC LIMIT 1",
      [req.user.id]
    );
    scope = rows[0];
  }
  res.set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no" });
  res.flushHeaders();
  const send = (change) => {
    const filter = patient ? scope : { date, hospital, service };
    if (!change || (patient && change.patient === req.user.id) ||
        (filter && change.date === filter.date && (!filter.hospital || (change.hospital === filter.hospital && change.service === filter.service)))) {
      res.write("data: refresh\n\n");
    }
  };
  const unsubscribe = subscribe(send);
  send(null);
  const heartbeat = setInterval(() => res.write(": heartbeat\n\n"), 20000);
  const expiry = setTimeout(() => res.end(), 60000);
  res.once("close", () => {
    clearInterval(heartbeat);
    clearTimeout(expiry);
    unsubscribe();
  });
}));

router.get("/scopes", authorize("doctor", "admin"), handle(async (req, res) => {
  const { rows } = await db.query(
    "SELECT DISTINCT hospital, service FROM queue_tickets WHERE date = $1 AND status IN ('waiting','called') ORDER BY hospital, service",
    [req.query.date]
  );
  res.json(rows);
}));

router.post("/", authorize("patient"), handle(async (req, res) => {
  const { name, phone, date, hospital, service } = req.body;
  if (![name, phone, date, hospital, service].every((value) =>
    typeof value === "string" && value.trim() && value.length <= 150
  )) return res.status(400).json({ message: "Complete all queue details" });

  await db.query(
    "UPDATE queue_tickets SET status = 'expired' WHERE patient_id = $1 AND status = 'waiting' AND date < (now() AT TIME ZONE 'Asia/Kolkata')::date",
    [req.user.id]
  );
  const { rows } = await db.query(
    `INSERT INTO queue_tickets (patient_id, name, phone, date, hospital, service)
     SELECT $1, $2, $3, $4::date, $5, $6 WHERE $4::date >= (now() AT TIME ZONE 'Asia/Kolkata')::date
     ON CONFLICT (patient_id) WHERE status = 'waiting' DO NOTHING
     RETURNING ${columns}`, [req.user.id, name, phone, date, hospital, service]
  );
  if (!rows.length) return res.status(409).json({ message: "Choose a current date or cancel your existing ticket first" });
  res.status(201).json(rows[0]);
}));

router.get("/mine", authorize("patient"), handle(async (req, res) => {
  const { rows } = await db.query(
    `WITH ticket AS (
      SELECT * FROM queue_tickets WHERE patient_id = $1
      ORDER BY (status IN ('waiting', 'called') AND date >= (now() AT TIME ZONE 'Asia/Kolkata')::date) DESC, id DESC LIMIT 1
    )
    SELECT ${columns},
      CASE WHEN status = 'waiting' AND ticket.date >= (now() AT TIME ZONE 'Asia/Kolkata')::date THEN 1 + (SELECT count(*) FROM queue_tickets q
        WHERE (q.date, q.hospital, q.service) = (ticket.date, ticket.hospital, ticket.service)
          AND (q.status = 'called' OR (q.status = 'waiting' AND
            (CASE WHEN q.priority = 'emergency' THEN 0 ELSE 1 END, q.created_at, q.id)
            < (CASE WHEN ticket.priority = 'emergency' THEN 0 ELSE 1 END, ticket.created_at, ticket.id)))) END AS position,
      (SELECT round(avg(extract(epoch FROM (completed_at - called_at)) / 60))
       FROM queue_tickets q WHERE q.status = 'served' AND q.hospital = ticket.hospital
       AND q.service = ticket.service AND q.completed_at > now() - interval '30 days') AS service_minutes
    FROM ticket`, [req.user.id]
  );
  res.json(rows[0] || null);
}));

router.get("/", authorize("doctor", "admin"), handle(async (req, res) => {
  const { rows } = await db.query(
    `SELECT ${columns} FROM queue_tickets WHERE date = $1 AND status IN ('waiting','called') AND hospital = $2 AND service = $3 ORDER BY ${order}`,
    [req.query.date, req.query.hospital, req.query.service]
  );
  res.json(rows);
}));

router.patch("/:id", authorize("doctor", "admin"), handle(async (req, res) => {
  const { action } = req.body;
  if (!["prioritize", "call", "serve", "remove"].includes(action)) {
    return res.status(400).json({ message: "Unknown queue action" });
  }
  const { rowCount } = await db.query(
    `UPDATE queue_tickets
     SET status = CASE $2 WHEN 'call' THEN 'called' WHEN 'serve' THEN 'served' WHEN 'remove' THEN 'cancelled' ELSE status END,
         called_at = CASE WHEN $2 = 'call' THEN now() ELSE called_at END,
         completed_at = CASE WHEN $2 = 'serve' THEN now() ELSE completed_at END,
         priority = CASE $2 WHEN 'prioritize' THEN 'emergency' ELSE priority END
     WHERE id = $1 AND status = CASE WHEN $2 = 'serve' THEN 'called' ELSE 'waiting' END`, [req.params.id, action]
  );
  if (!rowCount) return res.status(404).json({ message: "Waiting ticket not found" });
  res.sendStatus(204);
}));

router.put("/:id/date", authorize("patient"), handle(async (req, res) => {
  const { rowCount } = await db.query(
    `UPDATE queue_tickets SET date = $3, priority = 'normal', created_at = now()
     WHERE id = $1 AND patient_id = $2 AND status = 'waiting'
       AND $3::date >= (now() AT TIME ZONE 'Asia/Kolkata')::date`,
    [req.params.id, req.user.id, req.body.date]
  );
  if (!rowCount) return res.status(409).json({ message: "This ticket cannot be moved to that date" });
  res.sendStatus(204);
}));

router.delete("/:id", authorize("patient"), handle(async (req, res) => {
  const { rowCount } = await db.query(
    "UPDATE queue_tickets SET status = 'cancelled' WHERE id = $1 AND patient_id = $2 AND status = 'waiting'",
    [req.params.id, req.user.id]
  );
  if (!rowCount) return res.status(404).json({ message: "Waiting ticket not found" });
  res.sendStatus(204);
}));

module.exports = router;
