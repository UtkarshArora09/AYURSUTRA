CREATE TABLE IF NOT EXISTS queue_tickets (
  id BIGSERIAL PRIMARY KEY,
  patient_id INT NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  date DATE NOT NULL,
  hospital TEXT NOT NULL,
  service TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE UNIQUE INDEX IF NOT EXISTS queue_one_active_ticket
  ON queue_tickets(patient_id) WHERE status = 'waiting';
CREATE INDEX IF NOT EXISTS queue_waiting_date ON queue_tickets(date) WHERE status = 'waiting';
