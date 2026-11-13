CREATE TABLE clinic_centers (
  id INT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  room_capacity INT NOT NULL CHECK (room_capacity > 0)
);
INSERT INTO clinic_centers VALUES
  (1, 'AyurSutra Wellness Center - Mumbai', 'Bandra West, Mumbai', 1),
  (2, 'Vedic Healing Center - Pune', 'Koregaon Park, Pune', 1),
  (3, 'Holistic Ayurveda Clinic - Delhi', 'Greater Kailash, Delhi', 1);

CREATE TABLE clinic_shifts (
  id SERIAL PRIMARY KEY,
  doctor_id INT NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
  center_id INT NOT NULL REFERENCES clinic_centers(id),
  weekday INT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  starts_at TIME NOT NULL,
  ends_at TIME NOT NULL CHECK (ends_at > starts_at),
  UNIQUE (doctor_id, center_id, weekday, starts_at)
);
CREATE TABLE clinic_leave (
  doctor_id INT NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  PRIMARY KEY (doctor_id, date)
);
ALTER TABLE therapy_bookings ADD COLUMN duration_minutes INT NOT NULL DEFAULT 90 CHECK (duration_minutes > 0);
ALTER TABLE therapy_bookings ADD COLUMN therapist_id INT REFERENCES therapists(therapist_id) ON DELETE SET NULL;
ALTER TABLE therapy_bookings ADD COLUMN preparation TEXT;
ALTER TABLE therapy_bookings ADD COLUMN follow_up TEXT;
ALTER TABLE therapy_bookings ADD COLUMN session_notes TEXT;
ALTER TABLE queue_tickets ADD COLUMN called_at TIMESTAMPTZ;
ALTER TABLE queue_tickets ADD COLUMN completed_at TIMESTAMPTZ;

CREATE INDEX bookings_doctor_date ON therapy_bookings(doctor_id, scheduled_date);
CREATE INDEX bookings_center_date ON therapy_bookings(center_id, scheduled_date);
CREATE INDEX bookings_therapist_date ON therapy_bookings(therapist_id, scheduled_date);
CREATE INDEX queue_scope_order ON queue_tickets(date, hospital, service, created_at, id)
  WHERE status IN ('waiting', 'called');
CREATE INDEX queue_service_times ON queue_tickets(hospital, service, completed_at DESC)
  WHERE status = 'served';
CREATE INDEX patients_directory_order ON patients(created_at DESC, patient_id DESC);

CREATE TABLE clinic_audit (
  id BIGSERIAL PRIMARY KEY,
  actor_role TEXT NOT NULL,
  actor_id INT NOT NULL,
  action TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE clinic_reports (
  id SERIAL PRIMARY KEY,
  booking_id INT NOT NULL REFERENCES therapy_bookings(booking_id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  content BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE clinic_notifications (
  id BIGSERIAL PRIMARY KEY,
  booking_id INT NOT NULL REFERENCES therapy_bookings(booking_id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('confirmation', 'reminder', 'cancellation', 'reschedule')),
  available_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  attempts INT NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ,
  discarded_at TIMESTAMPTZ
);
CREATE INDEX clinic_notifications_pending ON clinic_notifications(available_at, id)
  WHERE sent_at IS NULL AND discarded_at IS NULL;

CREATE FUNCTION announce_queue_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_notify('queue_changes', json_build_object(
    'patient', NEW.patient_id, 'date', NEW.date, 'hospital', NEW.hospital, 'service', NEW.service
  )::text);
  IF TG_OP = 'UPDATE' AND (OLD.date, OLD.hospital, OLD.service) IS DISTINCT FROM (NEW.date, NEW.hospital, NEW.service) THEN
    PERFORM pg_notify('queue_changes', json_build_object(
      'patient', OLD.patient_id, 'date', OLD.date, 'hospital', OLD.hospital, 'service', OLD.service
    )::text);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER queue_change AFTER INSERT OR UPDATE ON queue_tickets
  FOR EACH ROW EXECUTE FUNCTION announce_queue_change();
