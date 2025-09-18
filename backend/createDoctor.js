require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./config/db");

async function createDoctor() {
  try {
    const name = "Dr. Priya Singh";
    const email = "priya@example.com";
    const password = "@priya123";
    const phone = "9876543332";
    const specialization = "Dermatology";
    const experience_years = 7;
    const qualification = "MBBS, MD";
    const clinic_address = "456 Shiv Vihar , Delhi City";
    const aadhar_number = "1234-4323-9012";
    const role = "doctor";

    const hashedPassword = await bcrypt.hash(password, 10);

    const lastIdResult = await db.query(
      "SELECT doctor_id FROM doctors ORDER BY created_at DESC LIMIT 1"
    );

    let newId = "Ayur_doc1";
    if (lastIdResult.rows.length > 0) {
      const lastId = lastIdResult.rows[0].doctor_id;
      const num = parseInt(lastId.replace("Ayur_doc", ""), 10) + 1;
      newId = "Ayur_doc" + num;
    }

    const result = await db.query(
      `INSERT INTO doctors (doctor_id, name, email, password, phone, specialization, experience_years, qualification, clinic_address, aadhar_number, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
       RETURNING *`,
      [
        newId,
        name,
        email,
        hashedPassword,
        phone,
        specialization,
        experience_years,
        qualification,
        clinic_address,
        aadhar_number,
        role,
      ]
    );

    console.log("Doctor created:", result.rows[0]);
  } catch (error) {
    console.error("Error creating doctor:", error);
  } finally {
    process.exit();
  }
}

createDoctor();
