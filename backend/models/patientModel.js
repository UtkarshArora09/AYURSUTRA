const db = require("../config/db");

const Patient = {
  //  Create a new patient
  async create({
    name,
    email,
    password,
    age,
    gender,
    phone,
    address,
    dosha_type,
    medical_history,
    role,
  }) {
    const result = await db.query(
      `INSERT INTO patients 
        (name, email, password, age, gender, phone, address, dosha_type, medical_history, role, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW()) 
       RETURNING *`,
      [
        name,
        email,
        password,
        age,
        gender,
        phone,
        address,
        dosha_type,
        medical_history,
        role || "patient",
      ]
    );
    return result.rows[0];
  },

  // Get all patients
  async findAll() {
    const result = await db.query(
      "SELECT * FROM patients ORDER BY created_at DESC"
    );
    return result.rows;
  },

  // Get patient by ID
  async findById(id) {
    const result = await db.query(
      "SELECT * FROM patients WHERE patient_id = $1",
      [id]
    );
    return result.rows[0];
  },

  // Get patient by email
  async findByEmail(email) {
    const result = await db.query("SELECT * FROM patients WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  },

  //  Update patient
  async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    const setClause = keys.map((key, i) => `${key}=$${i + 1}`).join(", ");
    const result = await db.query(
      `UPDATE patients SET ${setClause}, updated_at=NOW() WHERE patient_id=$${
        keys.length + 1
      } RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  },

  //  Delete patient
  async remove(id) {
    const result = await db.query(
      "DELETE FROM patients WHERE patient_id=$1 RETURNING *",
      [id]
    );
    return result.rows[0];
  },
};

module.exports = Patient;
