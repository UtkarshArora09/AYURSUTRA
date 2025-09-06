const db = require("../config/db");

const Billing = {
  async create({ patient_id, amount, status }) {
    const result = await db.query(
      `INSERT INTO billing (patient_id, amount, status, created_at, updated_at)
       VALUES ($1,$2,$3,NOW(),NOW()) RETURNING *`,
      [patient_id, amount, status]
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await db.query("SELECT * FROM billing ORDER BY created_at DESC");
    return result.rows;
  },

  async findById(id) {
    const result = await db.query("SELECT * FROM billing WHERE id=$1", [id]);
    return result.rows[0];
  },

  async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    const setClause = keys.map((key, i) => `${key}=$${i + 1}`).join(", ");
    const result = await db.query(
      `UPDATE billing SET ${setClause}, updated_at=NOW() WHERE id=$${keys.length + 1} RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  },

  async remove(id) {
    const result = await db.query("DELETE FROM billing WHERE id=$1 RETURNING *", [id]);
    return result.rows[0];
  },
};

module.exports = Billing;
