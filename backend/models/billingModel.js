const db = require("../config/db");

const Billing = {
  // CREATE billing record
  async create({ patient_id, appointment_id, amount, status }) {
    const result = await db.query(
      `INSERT INTO billing (patient_id, appointment_id, amount, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
      [patient_id, appointment_id, amount, status]
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
    const result = await db.query("SELECT * FROM billing WHERE id=$1", [id]);
    return result.rows[0];
  },

  // UPDATE billing record
  async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    if (keys.length === 0) return null;

    const setClause = keys.map((key, i) => `${key}=$${i + 1}`).join(", ");
    const result = await db.query(
      `UPDATE billing SET ${setClause}, updated_at=NOW() WHERE id=$${
        keys.length + 1
      } RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  },

  // DELETE billing record
  async remove(id) {
    const result = await db.query(
      "DELETE FROM billing WHERE id=$1 RETURNING *",
      [id]
    );
    return result.rows[0];
  },
};

module.exports = Billing;

// const db = require("../config/db");

// const Billing = {
//   // Create a new billing record with custom bill_id
//   async create({ patient_id, appointment_id, amount, status }) {
//     // Step 1: Get the last bill_id (if any)
//     const { rows: lastRows } = await db.query(
//       "SELECT bill_id FROM billing ORDER BY created_at DESC LIMIT 1"
//     );

//     let nextNumber = 1;

//     if (lastRows.length > 0) {
//       const lastId = lastRows[0].bill_id;
//       const lastNum = parseInt(lastId.replace("Ayur_BILL", ""));
//       nextNumber = isNaN(lastNum) ? 1 : lastNum + 1;
//     }

//     const paddedNumber = String(nextNumber).padStart(3, "0");
//     const billId = `Ayur_BILL${paddedNumber}`;

//     // Step 2: Insert the bill
//     const result = await db.query(
//       `INSERT INTO billing (bill_id, patient_id, appointment_id, amount, status, created_at, updated_at)
//        VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
//       [billId, patient_id, appointment_id, amount, status]
//     );

//     return result.rows[0];
//   },

//   // Get all billing records
//   async findAll() {
//     const result = await db.query("SELECT * FROM billing ORDER BY created_at DESC");
//     return result.rows;
//   },

//   // Get a single billing record by custom bill_id
//   async findById(billId) {
//     const result = await db.query("SELECT * FROM billing WHERE bill_id = $1", [billId]);
//     return result.rows[0];
//   },

//   // Update a billing record by bill_id
//   async update(billId, fields) {
//     const keys = Object.keys(fields);
//     const values = Object.values(fields);

//     if (keys.length === 0) return null;

//     const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
//     const query = `
//       UPDATE billing
//       SET ${setClause}, updated_at = NOW()
//       WHERE bill_id = $${keys.length + 1}
//       RETURNING *
//     `;

//     const result = await db.query(query, [...values, billId]);
//     return result.rows[0];
//   },

//   // Delete a billing record by bill_id
//   async remove(billId) {
//     const result = await db.query(
//       "DELETE FROM billing WHERE bill_id = $1 RETURNING *",
//       [billId]
//     );
//     return result.rows[0];
//   },
// };

// module.exports = Billing;
