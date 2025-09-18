// const db = require("../config/db");

// // Helper to convert camelCase keys to snake_case for update
// function camelToSnake(str) {
//   return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
// }

// const Patient = {
//   // Create a new patient
//   async create({
//     firstName,
//     lastName,
//     gender,
//     dob,
//     age,
//     mobNumber,
//     email,
//     aadharNumber,
//     bloodGroup,
//     address,
//     emergencyContactName,
//     emergencyContactNumber,
//     allergies,
//     medicalHistory,
//     password,
//     role = "patient",
//   }) {
//     const result = await db.query(
//       `INSERT INTO patients
//       (
//         first_name,
//         last_name,
//         gender,
//         dob,
//         age,
//         mob_number,
//         email,
//         aadhar_number,
//         blood_group,
//         address,
//         emergency_contact_name,
//         emergency_contact_number,
//         allergies,
//         medical_history,
//         password,
//         role,
//         created_at,
//         updated_at
//       )
//      VALUES (
//        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
//        $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
//      )
//      RETURNING *`,
//       [
//         firstName,
//         lastName,
//         gender,
//         dob,
//         age,
//         mobNumber,
//         email,
//         aadharNumber,
//         bloodGroup,
//         address,
//         emergencyContactName,
//         emergencyContactNumber,
//         allergies,
//         medicalHistory,
//         password,
//         role,
//       ]
//     );
//     return result.rows[0];
//   },

//   // Get all patients
//   async findAll() {
//     const result = await db.query(
//       "SELECT * FROM patients ORDER BY created_at DESC"
//     );
//     return result.rows;
//   },

//   // Get patient by ID
//   async findById(patientId) {
//     const result = await db.query(
//       "SELECT * FROM patients WHERE patient_id = $1",
//       [patientId]
//     );
//     return result.rows[0];
//   },

//   // Get patient by email
//   async findByEmail(email) {
//     const result = await db.query("SELECT * FROM patients WHERE email = $1", [
//       email,
//     ]);
//     return result.rows[0];
//   },

//   // Update patient
//   async update(patientId, fields) {
//     const keys = Object.keys(fields);
//     if (keys.length === 0) return null;

//     // Convert camelCase keys to snake_case column names
//     const snakeKeys = keys.map(camelToSnake);

//     const setClause = snakeKeys
//       .map((key, i) => `${key} = $${i + 1}`)
//       .join(", ");

//     const values = Object.values(fields);

//     const result = await db.query(
//       `UPDATE patients SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE patient_id = $${
//         keys.length + 1
//       } RETURNING *`,
//       [...values, patientId]
//     );

//     return result.rows[0];
//   },

//   // Delete patient
//   async remove(patientId) {
//     const result = await db.query(
//       "DELETE FROM patients WHERE patient_id = $1 RETURNING *",
//       [patientId]
//     );
//     return result.rows[0];
//   },
// };

// module.exports = Patient;

const db = require("../config/db");

// Helper to convert camelCase keys to snake_case for update
function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

const Patient = {
  // Create a new patient
  async create({
    firstName,
    lastName,
    gender,
    dob,
    age,
    mobNumber,
    email,
    aadharNumber,
    bloodGroup,
    address,
    emergencyContactName,
    emergencyContactNumber,
    allergies,
    medicalHistory,
    password,
    role = "patient",
    resetToken = null,
    resetTokenExpiry = null,
  }) {
    const result = await db.query(
      `INSERT INTO patients 
      (
        first_name,
        last_name,
        gender,
        dob,
        age,
        mob_number,
        email,
        aadhar_number,
        blood_group,
        address,
        emergency_contact_name,
        emergency_contact_number,
        allergies,
        medical_history,
        password,
        role,
        reset_token,
        reset_token_expiry,
        created_at,
        updated_at
      )
     VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
       $11, $12, $13, $14, $15, $16, $17, $18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
     )
     RETURNING *`,
      [
        firstName,
        lastName,
        gender,
        dob,
        age,
        mobNumber,
        email,
        aadharNumber,
        bloodGroup,
        address,
        emergencyContactName,
        emergencyContactNumber,
        allergies,
        medicalHistory,
        password,
        role,
        resetToken,
        resetTokenExpiry,
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
  async findById(patientId) {
    const result = await db.query(
      "SELECT * FROM patients WHERE patient_id = $1",
      [patientId]
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

  // Update patient
  async update(patientId, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return null;

    // Convert camelCase keys to snake_case column names
    const snakeKeys = keys.map(camelToSnake);

    const setClause = snakeKeys
      .map((key, i) => `${key} = $${i + 1}`)
      .join(", ");

    const values = Object.values(fields);

    const result = await db.query(
      `UPDATE patients SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE patient_id = $${
        keys.length + 1
      } RETURNING *`,
      [...values, patientId]
    );

    return result.rows[0];
  },

  // Delete patient
  async remove(patientId) {
    const result = await db.query(
      "DELETE FROM patients WHERE patient_id = $1 RETURNING *",
      [patientId]
    );
    return result.rows[0];
  },

  // Set reset token and expiry
  async setResetToken(email, token, expiry) {
    const result = await db.query(
      `UPDATE patients 
       SET reset_token = $1, reset_token_expiry = $2, updated_at = CURRENT_TIMESTAMP
       WHERE email = $3 RETURNING *`,
      [token, expiry, email]
    );
    return result.rows[0];
  },

  // Find patient by reset token
  async findByResetToken(token) {
    const result = await db.query(
      `SELECT * FROM patients 
       WHERE reset_token = $1 AND reset_token_expiry > NOW()`,
      [token]
    );
    return result.rows[0];
  },

  // Reset password
  async updatePassword(patientId, hashedPassword) {
    const result = await db.query(
      `UPDATE patients 
       SET password = $1, reset_token = NULL, reset_token_expiry = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE patient_id = $2 RETURNING *`,
      [hashedPassword, patientId]
    );
    return result.rows[0];
  },
};

module.exports = Patient;
