const db = require("../config/db");

const Appointment = {
  async create({
    patient_id,
    doctor_id,
    therapist_id,
    appointment_date,
    status,
    notes,
  }) {
    const result = await db.query(
      `INSERT INTO appointments (patient_id, doctor_id, therapist_id, appointment_date, status,notes, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,NOW(),NOW()) RETURNING *`,
      [patient_id, doctor_id, therapist_id, appointment_date, status, notes]
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await db.query(
      "SELECT * FROM appointments ORDER BY appointment_date DESC"
    );
    return result.rows;
  },

  async findById(id) {
    const result = await db.query("SELECT * FROM appointments WHERE id=$1", [
      id,
    ]);
    return result.rows[0];
  },

  async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    const setClause = keys.map((key, i) => `${key}=$${i + 1}`).join(", ");
    const result = await db.query(
      `UPDATE appointments SET ${setClause}, updated_at=NOW() WHERE id=$${
        keys.length + 1
      } RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  },

  async remove(id) {
    const result = await db.query(
      "DELETE FROM appointments WHERE id=$1 RETURNING *",
      [id]
    );
    return result.rows[0];
  },
};

module.exports = Appointment;
