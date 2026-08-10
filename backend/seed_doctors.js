require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./config/db");

const newDoctors = [
  {
    name: "Dr. Rajesh Kumar",
    email: "rajesh@example.com",
    password: "@doctor123",
    phone: "9876543211",
    specialization: "Vata Dosha Specialist",
    experience_years: 12,
    qualification: "BAMS, MD",
    clinic_address: "123 Bandra West, Mumbai City",
    aadhar_number: "2345-6789-0123",
    role: "doctor",
  },
  {
    name: "Dr. Meera Patel",
    email: "meera@example.com",
    password: "@doctor123",
    phone: "9876543212",
    specialization: "Pitta Dosha Specialist",
    experience_years: 9,
    qualification: "BAMS, MS",
    clinic_address: "789 Koregaon Park, Pune City",
    aadhar_number: "3456-7890-1234",
    role: "doctor",
  },
  {
    name: "Dr. Amit Sharma",
    email: "amit@example.com",
    password: "@doctor123",
    phone: "9876543213",
    specialization: "Kapha Dosha Specialist",
    experience_years: 15,
    qualification: "BAMS, PhD",
    clinic_address: "567 Indiranagar, Bengaluru City",
    aadhar_number: "4567-8901-2345",
    role: "doctor",
  },
  {
    name: "Dr. Sunita Rao",
    email: "sunita@example.com",
    password: "@doctor123",
    phone: "9876543214",
    specialization: "General Ayurvedic Physician",
    experience_years: 8,
    qualification: "BAMS",
    clinic_address: "890 Salt Lake, Kolkata City",
    aadhar_number: "5678-9012-3456",
    role: "doctor",
  }
];

async function seed() {
  try {
    for (const doc of newDoctors) {
      const hashedPassword = await bcrypt.hash(doc.password, 10);
      
      // Get next doctor_id
      const lastIdResult = await db.query(
        "SELECT doctor_id FROM doctors ORDER BY doctor_id DESC LIMIT 1"
      );

      let newId = 1;
      if (lastIdResult.rows.length > 0) {
        const lastId = lastIdResult.rows[0].doctor_id;
        newId = parseInt(lastId, 10) + 1;
      }

      // Check if email already exists
      const checkEmail = await db.query("SELECT doctor_id FROM doctors WHERE email = $1", [doc.email]);
      if (checkEmail.rows.length > 0) {
        console.log(`Doctor with email ${doc.email} already exists. Skipping.`);
        continue;
      }

      const result = await db.query(
        `INSERT INTO doctors (doctor_id, name, email, password, phone, specialization, experience_years, qualification, clinic_address, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
         RETURNING *`,
        [
          newId,
          doc.name,
          doc.email,
          hashedPassword,
          doc.phone,
          doc.specialization,
          doc.experience_years,
          doc.qualification,
          doc.clinic_address,
          doc.role,
        ]
      );
      console.log("Doctor created:", result.rows[0]);
    }
  } catch (error) {
    console.error("Error seeding doctors:", error);
  } finally {
    process.exit();
  }
}

seed();
