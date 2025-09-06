const pool = require("../config/db");

const Billing = {
  async findAll() {
    const { rows } = await pool.query(
      "SELECT * FROM billing ORDER BY created_at DESC"
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(
      "SELECT * FROM billing WHERE bill_id = $1",
      [id]
    );
    return rows[0];
  },

  async create({ patient_id, appointment_id, amount, status }) {
    const { rows } = await pool.query(
      `INSERT INTO billing (patient_id, appointment_id, amount, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [patient_id, appointment_id, amount, status]
    );
    return rows[0];
  },

  async update(id, { amount, status }) {
    const { rows } = await pool.query(
      `UPDATE billing 
       SET amount = $1, status = $2, updated_at = CURRENT_TIMESTAMP
       WHERE bill_id = $3
       RETURNING *`,
      [amount, status, id]
    );
    return rows[0];
  },

  async remove(id) {
    await pool.query("DELETE FROM billing WHERE bill_id = $1", [id]);
    return true;
  },
};

module.exports = Billing;
