const active = "(status IS NULL OR lower(status) IN ('pending', 'confirmed', 'scheduled', 'rescheduled'))";
const legacyTimes = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

async function durationFor(client, therapy, existingDuration) {
  if (existingDuration) return existingDuration;
  const { rows } = await client.query(
    "SELECT duration FROM therapies WHERE (lower(name) = lower($1) OR lower(name) = lower(split_part($1, ' (', 1))) AND duration > 0 ORDER BY id LIMIT 1",
    [therapy]
  );
  return rows[0]?.duration || 90;
}

async function findSlots(client, { doctorId, centerId, date, duration, bookingId = null, offerId = null, patientId = null }) {
  const { rows } = await client.query(
    `WITH candidates AS (
       SELECT generate_series(
         $3::date + starts_at, $3::date + ends_at - make_interval(mins => $4), interval '15 minutes'
       ) AS begins
       FROM clinic_shifts
       WHERE doctor_id = $1 AND center_id = $2 AND weekday = extract(dow FROM $3::date)
       UNION
       SELECT $3::date + slot::time FROM unnest($6::text[]) slot WHERE $2::int IS NULL AND EXISTS (SELECT 1 FROM doctors WHERE doctor_id = $1)
     ), eligible AS (
       SELECT begins, begins + make_interval(mins => $4) AS ends FROM candidates
       WHERE begins AT TIME ZONE 'Asia/Kolkata' > clock_timestamp()
         AND NOT EXISTS (SELECT 1 FROM clinic_leave WHERE doctor_id = $1 AND date = $3)
     ), existing AS (
       SELECT doctor_id, center_id, patient_id, scheduled_date + scheduled_time AS begins,
              scheduled_date + scheduled_time + make_interval(mins => duration_minutes) AS ends
       FROM therapy_bookings
       WHERE scheduled_date = $3 AND ${active}
         AND (doctor_id = $1 OR center_id = $2 OR patient_id = $8)
         AND ($5::int IS NULL OR booking_id <> $5)
       UNION ALL
       SELECT w.doctor_id, w.center_id, w.patient_id, o.scheduled_date + o.scheduled_time,
              o.scheduled_date + o.scheduled_time + make_interval(mins => o.duration_minutes)
       FROM clinic_waitlist_offers o JOIN clinic_waitlist w ON w.id = o.entry_id
       WHERE o.scheduled_date = $3 AND o.closed_at IS NULL AND o.expires_at > clock_timestamp()
         AND (w.doctor_id = $1 OR w.center_id = $2 OR w.patient_id = $8)
         AND ($7::int IS NULL OR o.id <> $7)
     )
     SELECT to_char(e.begins, 'HH24:MI') AS time FROM eligible e
     WHERE NOT EXISTS (
       SELECT 1 FROM existing b WHERE (b.doctor_id = $1 OR b.patient_id = $8) AND b.begins < e.ends AND b.ends > e.begins
     )
     AND ($2::int IS NULL OR NOT EXISTS (
       SELECT 1 FROM (
         SELECT e.begins AS point UNION
         SELECT b.begins FROM existing b WHERE b.center_id = $2 AND b.begins > e.begins AND b.begins < e.ends
       ) points
       WHERE (SELECT count(*) FROM existing b WHERE b.center_id = $2 AND b.begins <= points.point AND b.ends > points.point)
         >= (SELECT room_capacity FROM clinic_centers WHERE id = $2)
     ))
     ORDER BY e.begins`,
    [doctorId, centerId, date, duration, bookingId, legacyTimes, offerId, patientId]
  );
  return rows.map(({ time }) => time);
}

async function lockSchedule(client) {
  // Configuration edits and reservations share the same transaction lock.
  await client.query("SELECT pg_advisory_xact_lock(478214)");
}

module.exports = { durationFor, findSlots, lockSchedule };
