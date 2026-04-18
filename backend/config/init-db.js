const pool = require("./db");
const bcrypt = require("bcryptjs");

const createTables = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS patients (
      patient_id SERIAL PRIMARY KEY,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      gender VARCHAR(20),
      dob DATE,
      age INT,
      mob_number VARCHAR(20),
      email VARCHAR(100) UNIQUE NOT NULL,
      aadhar_number VARCHAR(50),
      blood_group VARCHAR(10),
      address TEXT,
      emergency_contact_name VARCHAR(100),
      emergency_contact_number VARCHAR(20),
      allergies TEXT,
      medical_history TEXT,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'patient',
      reset_token VARCHAR(255),
      reset_token_expiry TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS doctors (
      doctor_id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      specialization VARCHAR(100),
      experience_years INT,
      qualification VARCHAR(100),
      clinic_address TEXT,
      role VARCHAR(50) DEFAULT 'doctor',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admins (
      admin_id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS therapy_bookings (
      booking_id SERIAL PRIMARY KEY,
      patient_id INT REFERENCES patients(patient_id) ON DELETE CASCADE,
      therapy_type VARCHAR(100),
      scheduled_date DATE,
      scheduled_time TIME,
      doctor_id INT REFERENCES doctors(doctor_id) ON DELETE SET NULL,
      center_id INT,
      mobile_number VARCHAR(20),
      symptoms TEXT,
      preferences TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      dosha_type VARCHAR(50)
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      patient_id INT REFERENCES patients(patient_id) ON DELETE CASCADE,
      doctor_id INT REFERENCES doctors(doctor_id) ON DELETE SET NULL,
      therapist_id INT,
      appointment_date TIMESTAMP NOT NULL,
      status VARCHAR(50) DEFAULT 'scheduled',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(queryText);
    console.log("✅ Database tables successfully initialized / verified.");

    // Seed Admin
    const adminPassword = await bcrypt.hash("@Ayadmin123", 10);
    await pool.query(
      `INSERT INTO admins (name, email, password, role) 
       VALUES ($1, $2, $3, 'admin') 
       ON CONFLICT (email) DO NOTHING;`,
      ["AyurAdmin", "adayur108@gmail.com", adminPassword]
    );

    // Seed Doctor
    const docPassword = await bcrypt.hash("@priya123", 10);
    await pool.query(
      `INSERT INTO doctors (name, email, password, phone, specialization, experience_years, qualification, clinic_address, role) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'doctor') 
       ON CONFLICT (email) DO NOTHING;`,
      [
        "Dr. Priya Singh",
        "priya@example.com",
        docPassword,
        "9876543332",
        "Mixed Dosha Specialist",
        7,
        "MBBS, MD",
        "456 Shiv Vihar, Delhi City",
      ]
    );
    console.log("✅ Seed accounts verified.");
  } catch (err) {
    console.error("❌ Error initializing database tables:", err.message);
  }
};

module.exports = createTables;
