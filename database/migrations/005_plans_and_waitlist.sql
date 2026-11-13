CREATE TABLE treatment_plans (
  id SERIAL PRIMARY KEY,
  doctor_id INT REFERENCES doctors(doctor_id) ON DELETE SET NULL,
  patient_id INT NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  center_id INT NOT NULL REFERENCES clinic_centers(id),
  title VARCHAR(120) NOT NULL,
  instructions TEXT NOT NULL DEFAULT '',
  follow_up TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE therapy_bookings ADD COLUMN treatment_plan_id INT REFERENCES treatment_plans(id) ON DELETE SET NULL;
CREATE INDEX therapy_bookings_plan ON therapy_bookings(treatment_plan_id);
CREATE INDEX treatment_plans_doctor ON treatment_plans(doctor_id, id DESC);
CREATE INDEX treatment_plans_patient ON treatment_plans(patient_id, id DESC);

CREATE TABLE clinic_waitlist (
  id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  doctor_id INT NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
  center_id INT NOT NULL REFERENCES clinic_centers(id),
  therapy VARCHAR(100) NOT NULL,
  earliest DATE NOT NULL,
  latest DATE NOT NULL CHECK (latest >= earliest),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','offered','accepted','declined','withdrawn','expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX clinic_waitlist_active ON clinic_waitlist(patient_id, doctor_id, center_id, lower(therapy))
  WHERE status IN ('waiting','offered');
CREATE INDEX clinic_waitlist_fifo ON clinic_waitlist(doctor_id, center_id, id) WHERE status = 'waiting';

CREATE TABLE clinic_waitlist_offers (
  id SERIAL PRIMARY KEY,
  entry_id INT NOT NULL UNIQUE REFERENCES clinic_waitlist(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  expires_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ,
  booking_id INT REFERENCES therapy_bookings(booking_id) ON DELETE SET NULL
);
CREATE INDEX clinic_waitlist_open ON clinic_waitlist_offers(expires_at) WHERE closed_at IS NULL;
