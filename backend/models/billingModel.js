const db = require("../config/db");

const Billing = {
  // CREATE billing record
  async create({ patient_id, booking_id, amount, status }) {
    const result = await db.query(
      `INSERT INTO billing (patient_id, booking_id, amount, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
      [patient_id, booking_id, amount, status]
    );
    return result.rows[0];
  },

  // GET all billing records
  async findAll() {
    const result = await db.query(
      "SELECT * FROM billing ORDER BY created_at DESC"
    );
    return result.rows;
  },

  // GET billing record by ID
  async findById(id) {
    const result = await db.query("SELECT * FROM billing WHERE bill_id=$1", [
      id,
    ]);
    return result.rows[0];
  },

  // UPDATE billing record
  async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    if (keys.length === 0) return null;

    const setClause = keys.map((key, i) => `${key}=$${i + 1}`).join(", ");
    const result = await db.query(
      `UPDATE billing 
       SET ${setClause}, updated_at=NOW() 
       WHERE bill_id=$${keys.length + 1}
       RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  },

  // DELETE billing record
  async remove(id) {
    const result = await db.query(
      "DELETE FROM billing WHERE bill_id=$1 RETURNING *",
      [id]
    );
    return result.rows[0];
  },
};

module.exports = Billing;

