const db = require("../config/db");

const Therapist = {
  // Create a new therapist
  async create({
    name,
    email,
    password,
    phone,
    expertise,
    experience_years,
    qualification,
    assigned_doctor_id,
  }) {
    const result = await db.query(
      `INSERT INTO therapists 
       (name, email, password, phone, expertise, experience_years, qualification, assigned_doctor_id, role, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'therapist',NOW(),NOW())
       RETURNING *`,

      [
        name,
        email,
        password,
        phone,
        expertise,
        experience_years,
        qualification,
        assigned_doctor_id,
      ]
    );
    return result.rows[0];
  },

  // Find therapist by email
  async findByEmail(email) {
    const result = await db.query(
      `SELECT therapist_id AS id, name, email, password, phone, expertise, experience_years, qualification, assigned_doctor_id, role
       FROM therapists WHERE email=$1`,
      [email]
    );
    return result.rows[0];
  },

  // Find therapist by ID
  async findById(id) {
    const result = await db.query(
      `SELECT therapist_id AS id, name, email, phone, expertise, experience_years, qualification, assigned_doctor_id, role
       FROM therapists WHERE therapist_id=$1`,
      [id]
    );
    return result.rows[0];
  },

  // Get all therapists
  async findAll() {
    const result = await db.query(
      `SELECT therapist_id AS id, name, email, phone, expertise, experience_years, qualification, assigned_doctor_id, role
       FROM therapists ORDER BY created_at DESC`
    );
    return result.rows;
  },

  // Update therapist
  async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((key, i) => `${key}=$${i + 1}`).join(", ");
    const result = await db.query(
      `UPDATE therapists SET ${setClause}, updated_at=NOW() WHERE therapist_id=$${
        keys.length + 1
      } RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  },

  // Delete therapist
  async remove(id) {
    const result = await db.query(
      `DELETE FROM therapists WHERE therapist_id=$1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },
};

module.exports = Therapist;
