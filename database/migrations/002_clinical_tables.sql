ALTER TABLE patients ADD COLUMN IF NOT EXISTS dosha VARCHAR(50);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = 'appointments' AND column_name = 'appointment_id'
  ) THEN
    ALTER TABLE appointments RENAME COLUMN id TO appointment_id;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS therapists (
  therapist_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  expertise VARCHAR(100),
  experience_years INT,
  qualification VARCHAR(100),
  assigned_doctor_id INT REFERENCES doctors(doctor_id) ON DELETE SET NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'therapist',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS therapies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration INT,
  cost NUMERIC(12, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS records (
  id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  doctor_id INT REFERENCES doctors(doctor_id) ON DELETE SET NULL,
  diagnosis TEXT,
  dosha_type VARCHAR(50),
  prescribed_therapy_id INT REFERENCES therapies(id) ON DELETE SET NULL,
  progress_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS billing (
  bill_id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  booking_id INT NOT NULL REFERENCES therapy_bookings(booking_id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS bookings_patient_idx ON therapy_bookings(patient_id);
CREATE INDEX IF NOT EXISTS appointments_patient_idx ON appointments(patient_id);
