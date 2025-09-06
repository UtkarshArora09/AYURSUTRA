const db = require("../config/db");

const Therapy = {
  async create({ name, description, duration, cost }) {
    const result = await db.query(
      `INSERT INTO therapies (name, description, duration, cost, created_at, updated_at)
       VALUES ($1,$2,$3,$4,NOW(),NOW()) RETURNING *`,
      [name, description, duration, cost]
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await db.query(
      "SELECT * FROM therapies ORDER BY created_at DESC"
    );
    return result.rows;
  },

  async findById(id) {
    const result = await db.query("SELECT * FROM therapies WHERE id=$1", [id]);
    return result.rows[0];
  },

  async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    const setClause = keys.map((key, i) => `${key}=$${i + 1}`).join(", ");
    const result = await db.query(
      `UPDATE therapies SET ${setClause}, updated_at=NOW() WHERE id=$${
        keys.length + 1
      } RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  },

  async remove(id) {
    const result = await db.query(
      "DELETE FROM therapies WHERE id=$1 RETURNING *",
      [id]
    );
    return result.rows[0];
  },
};

module.exports = Therapy;
