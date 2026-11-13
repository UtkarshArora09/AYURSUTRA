const express = require("express");
const db = require("../config/db");
const { protect, authorize } = require("../middleware/authMiddleware");
const router = express.Router();

const order = "CASE WHEN priority = 'emergency' THEN 0 ELSE 1 END, created_at, id";
const columns = "id, name, phone, date::text AS date, hospital, service, priority, status, extract(epoch FROM created_at) * 1000 AS timestamp";
const handle = (action) => (req, res, next) => Promise.resolve(action(req, res)).catch((error) => {
  if (["22P02", "22008", "22007"].includes(error.code)) {
    return res.status(400).json({ message: "Invalid queue details" });
  }
  next(error);
});

router.use(protect);

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
    `SELECT id, name, phone, date, hospital, service, priority, status, timestamp, position
     FROM (
       SELECT ${columns}, patient_id, row_number() OVER (PARTITION BY date, hospital, service ORDER BY ${order}) AS position
       FROM queue_tickets WHERE status = 'waiting'
         AND date >= (now() AT TIME ZONE 'Asia/Kolkata')::date
     ) queue WHERE patient_id = $1`, [req.user.id]
  );
  res.json(rows[0] || null);
}));

router.get("/", authorize("doctor", "admin"), handle(async (req, res) => {
  const { rows } = await db.query(
    `SELECT ${columns} FROM queue_tickets WHERE date = $1 AND status = 'waiting' ORDER BY ${order}`,
    [req.query.date]
  );
  res.json(rows);
}));

router.patch("/:id", authorize("doctor", "admin"), handle(async (req, res) => {
  const { action } = req.body;
  if (!["prioritize", "call", "remove"].includes(action)) {
    return res.status(400).json({ message: "Unknown queue action" });
  }
  const { rowCount } = await db.query(
    `UPDATE queue_tickets
     SET status = CASE $2 WHEN 'call' THEN 'called' WHEN 'remove' THEN 'cancelled' ELSE status END,
         priority = CASE $2 WHEN 'prioritize' THEN 'emergency' ELSE priority END
     WHERE id = $1 AND status = 'waiting'`, [req.params.id, action]
  );
  if (!rowCount) return res.status(404).json({ message: "Waiting ticket not found" });
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
