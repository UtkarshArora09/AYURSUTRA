require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./config/db");

async function createTherapist() {
  try {
    const name = "Therapist Radhika";
    const email = "radhika@example.com";
    const password = "@123456";
    const phone = "9123456780";
    const expertise = "Physical Therapy";
    const experience_years = 6;
    const qualification = "Bachelor of Physiotherapy";
    const assigned_doctor_id = "Ayur_doc1";
    const aadhar_number = "9876-5432-1992";
    const role = "therapist";

    const hashedPassword = await bcrypt.hash(password, 10);

    const lastIdResult = await db.query(
      "SELECT therapist_id FROM therapists ORDER BY created_at DESC LIMIT 1"
    );

    let newId = "Ayur_thp1";
    if (lastIdResult.rows.length > 0) {
      const lastId = lastIdResult.rows[0].therapist_id;
      const num = parseInt(lastId.replace("Ayur_thp", ""), 10) + 1;
      newId = "Ayur_thp" + num;
    }

    const result = await db.query(
      `INSERT INTO therapists (therapist_id, name, email, password, phone, expertise, experience_years, qualification, assigned_doctor_id, aadhar_number, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
       RETURNING *`,
      [
        newId,
        name,
        email,
        hashedPassword,
        phone,
        expertise,
        experience_years,
        qualification,
        assigned_doctor_id,
        aadhar_number,
        role,
      ]
    );

    console.log("Therapist created:", result.rows[0]);
  } catch (error) {
    console.error("Error creating therapist:", error);
  } finally {
    process.exit();
  }
}

createTherapist();
