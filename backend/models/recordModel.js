const db = require("../config/db");

const access = `(
  ($1 = 'doctor' AND doctor_id = $2) OR EXISTS (
    SELECT 1 FROM appointments a
    WHERE a.patient_id = records.patient_id AND a.doctor_id = records.doctor_id
      AND $1 = 'therapist' AND a.therapist_id = $2
  )
)`;
const editable = ["diagnosis", "dosha_type", "prescribed_therapy_id", "progress_notes"];

async function findAll(user) {
  const { rows } = await db.query(
    `SELECT * FROM records WHERE ${access} ORDER BY created_at DESC`, [user.role, user.id]
  );
  return rows;
}

async function findById(id, user) {
  const { rows } = await db.query(
    `SELECT * FROM records WHERE ${access} AND id = $3`, [user.role, user.id, id]
  );
  return rows[0];
}

async function create(fields, user) {
  const { patient_id, doctor_id, diagnosis, dosha_type, prescribed_therapy_id, progress_notes } = fields;
  const doctorId = user.role === "doctor" ? user.id : doctor_id;
  const { rows } = await db.query(
    `INSERT INTO records (patient_id, doctor_id, diagnosis, dosha_type, prescribed_therapy_id, progress_notes)
     SELECT $3, $4, $5, $6, $7, $8 WHERE EXISTS (
       SELECT 1 FROM appointments WHERE patient_id = $3 AND doctor_id = $4
         AND ($1 = 'doctor' OR therapist_id = $2)
     ) OR ($1 = 'doctor' AND EXISTS (
       SELECT 1 FROM therapy_bookings WHERE patient_id = $3 AND doctor_id = $4
     )) RETURNING *`,
    [user.role, user.id, patient_id, doctorId, diagnosis, dosha_type, prescribed_therapy_id, progress_notes]
  );
  return rows[0];
}

async function update(id, fields, user) {
  const keys = Object.keys(fields).filter((key) => editable.includes(key));
  if (!keys.length) return findById(id, user);
  const assignments = keys.map((key, i) => `${key} = $${i + 4}`).join(", ");
  const { rows } = await db.query(
    `UPDATE records SET ${assignments}, updated_at = NOW() WHERE ${access} AND id = $3 RETURNING *`,
    [user.role, user.id, id, ...keys.map((key) => fields[key])]
  );
  return rows[0];
}

async function remove(id, user) {
  const { rowCount } = await db.query(
    `DELETE FROM records WHERE ${access} AND id = $3`, [user.role, user.id, id]
  );
  return rowCount;
}

module.exports = { findAll, findById, create, update, remove };
