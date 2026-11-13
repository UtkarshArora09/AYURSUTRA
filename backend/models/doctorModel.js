const bcrypt = require("bcryptjs");
const db = require("../config/db");

const Doctor = {
  //  Create a new doctor
  async create({
    name,
    email,
    password,
    phone,
    specialization,
    experience_years,
    qualification,
    clinic_address,
    role = "doctor",
  }) {
    const result = await db.query(
      `INSERT INTO doctors 
       (name, email, password, phone, specialization, experience_years, qualification, clinic_address, role, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW())
       RETURNING doctor_id AS id, name, email, role`,
      [
        name,
        email,
        password,
        phone,
        specialization,
        experience_years,
        qualification,
        clinic_address,
        role,
      ]
    );
    return result.rows[0];
  },

  //  Find all doctors
  async findAll() {
    const result = await db.query(
      `SELECT doctor_id AS id, name, email, phone, specialization, experience_years, qualification, clinic_address, role, created_at, updated_at
       FROM doctors
       ORDER BY created_at DESC`
    );
    return result.rows;
  },

  // Find doctor by ID
  async findById(id) {
    const result = await db.query(
      `SELECT doctor_id AS id, name, email, phone, specialization, experience_years, qualification, clinic_address, role, created_at, updated_at
       FROM doctors WHERE doctor_id=$1`,
      [id]
    );
    return result.rows[0];
  },

  //  Find doctor by email
  async findByEmail(email) {
    const result = await db.query(
      `SELECT doctor_id AS id, name, email, phone, specialization, experience_years, qualification, clinic_address, role, password
       FROM doctors WHERE email=$1`,
      [email]
    );
    return result.rows[0];
  },

  //  Update doctor
  async update(id, fields) {
    const keys = Object.keys(fields).filter((key) => ["name", "email", "password", "phone", "specialization", "experience_years", "qualification", "clinic_address"].includes(key));
    if (!keys.length) return this.findById(id);
    const values = await Promise.all(keys.map((key) => key === "password" ? bcrypt.hash(fields[key], 10) : fields[key]));

    const setClause = keys.map((key, i) => `${key}=$${i + 1}`).join(", ");
    const result = await db.query(
      `UPDATE doctors SET ${setClause}, updated_at=NOW() WHERE doctor_id=$${
        keys.length + 1
      } RETURNING doctor_id AS id, name, email, role`,
      [...values, id]
    );
    return result.rows[0];
  },

  //  Delete doctor
  async remove(id) {
    const result = await db.query(
      `DELETE FROM doctors WHERE doctor_id=$1 RETURNING doctor_id AS id, name, email, role`,
      [id]
    );
    return result.rows[0];
  },
};

module.exports = Doctor;
