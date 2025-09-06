const db = require("../config/db");

const Admin = {
  async create({ name, email, password, role = "admin" }) {
    const result = await db.query(
      `INSERT INTO admins
       (name, email, password, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [name, email, password, role]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await db.query(
      `SELECT admin_id AS id, name, email, role, created_at, updated_at
       FROM admins
       WHERE admin_id=$1`,
      [id]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await db.query(
      `SELECT admin_id AS id, name, email, password, role
       FROM admins
       WHERE email=$1`,
      [email]
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await db.query(
      `SELECT admin_id AS id, name, email, role, created_at, updated_at
       FROM admins ORDER BY created_at DESC`
    );
    return result.rows;
  },

  async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((key, i) => `${key}=$${i + 1}`).join(", ");
    const result = await db.query(
      `UPDATE admins SET ${setClause}, updated_at=NOW() WHERE admin_id=$${keys.length + 1} RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  },

  async remove(id) {
    const result = await db.query(
      `DELETE FROM admins WHERE admin_id=$1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },
};

module.exports = Admin;
