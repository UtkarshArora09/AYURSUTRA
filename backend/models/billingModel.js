const db = require("../config/db");

const Billing = {
  // CREATE billing record
  async create({ patient_id, booking_id, amount, status, doctorId }) {
    const result = await db.query(
      `INSERT INTO billing (patient_id, booking_id, amount, status, created_at, updated_at)
       SELECT $1, $2, $3, $4, NOW(), NOW() FROM therapy_bookings
       WHERE booking_id = $2 AND patient_id = $1 AND doctor_id = $5 RETURNING *`,
      [patient_id, booking_id, amount, status, doctorId]
    );
    return result.rows[0];
  },

  // GET all billing records
  async findAll(user) {
    const result = await db.query(
      `SELECT b.* FROM billing b JOIN therapy_bookings t USING (booking_id)
       WHERE CASE WHEN $1 = 'patient' THEN b.patient_id = $2 ELSE t.doctor_id = $2 END ORDER BY b.created_at DESC`,
      [user.role, user.id]
    );
    return result.rows;
  },

  // GET billing record by ID
  async findById(id, user) {
    const result = await db.query(`SELECT b.* FROM billing b JOIN therapy_bookings t USING (booking_id)
       WHERE bill_id = $1 AND CASE WHEN $2 = 'patient' THEN b.patient_id = $3 ELSE t.doctor_id = $3 END`, [
      id, user.role, user.id,
    ]);
    return result.rows[0];
  },

  // UPDATE billing record
  async update(id, fields, doctorId) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    if (keys.length === 0) return null;

    const setClause = keys.map((key, i) => `${key}=$${i + 1}`).join(", ");
    const result = await db.query(
      `UPDATE billing 
       SET ${setClause}, updated_at=NOW() 
       WHERE bill_id=$${keys.length + 1} AND EXISTS (
         SELECT 1 FROM therapy_bookings t WHERE t.booking_id = billing.booking_id AND t.doctor_id = $${keys.length + 2})
       RETURNING *`,
      [...values, id, doctorId]
    );
    return result.rows[0];
  },

  // DELETE billing record
  async remove(id, doctorId) {
    const result = await db.query(
      `DELETE FROM billing USING therapy_bookings t WHERE billing.bill_id=$1
       AND billing.booking_id = t.booking_id AND t.doctor_id = $2 RETURNING billing.*`,
      [id, doctorId]
    );
    return result.rows[0];
  },
};

module.exports = Billing;

