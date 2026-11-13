const db = require("../config/db");

const clinicTimes = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];
const activeStatuses = "('pending', 'confirmed', 'scheduled', 'rescheduled')";

function bookingError(status, message) {
  return Object.assign(new Error(message), { status });
}

async function reserveSlot(doctorId, date, time, bookingId, save) {
  if (!Number.isInteger(Number(doctorId)) || Number(doctorId) <= 0 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) || !clinicTimes.includes(time)) {
    throw bookingError(400, "Choose a doctor and valid date and time");
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    // Serialize competing requests for the same doctor's slot.
    await client.query("SELECT pg_advisory_xact_lock(hashtext('booking-slot'), hashtext($1))", [
      `${Number(doctorId)}:${date}:${time}`,
    ]);
    const { rows: [slot] } = await client.query(
      `SELECT (($2::date + $3::time) AT TIME ZONE 'Asia/Kolkata') > clock_timestamp() AS future,
         EXISTS (SELECT 1 FROM therapy_bookings
           WHERE doctor_id = $1 AND scheduled_date = $2 AND scheduled_time = $3
             AND ($4::int IS NULL OR booking_id <> $4)
             AND (status IS NULL OR status IN ${activeStatuses})) AS occupied`,
      [doctorId, date, time, bookingId]
    );
    if (!slot.future) throw bookingError(400, "Choose a future appointment time");
    if (slot.occupied) throw bookingError(409, "This time is already booked");
    const result = await save(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

function bookingScope(user) {
  if (user.role === "patient") return [user.id, null];
  if (user.role === "doctor") return [null, user.id];
  return [null, null];
}

// Create a new booking
const createBooking = async (bookingData) => {
  const {
    patient_id,
    therapy_type,
    scheduled_date,
    scheduled_time,
    doctor_id,
    center_id,
    mobile_number,
    symptoms,
    preferences,
    status,
    dosha_type,
  } = bookingData;

  const query = `
    INSERT INTO therapy_bookings 
      (patient_id, therapy_type, scheduled_date, scheduled_time, doctor_id, center_id, mobile_number, symptoms, preferences, status, dosha_type)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *;
  `;

  const values = [
    patient_id,
    therapy_type,
    scheduled_date,
    scheduled_time,
    doctor_id,
    center_id,
    mobile_number,
    symptoms,
    preferences,
    status,
    dosha_type,
  ];

  if (typeof therapy_type !== "string" || !therapy_type.trim()) throw bookingError(400, "Choose a therapy");
  return reserveSlot(doctor_id, scheduled_date, scheduled_time, null, async (client) => {
    const result = await client.query(query, values);
    return result.rows[0];
  });
};

// Get all bookings
const getAllBookings = async (user) => {
  const result = await db.query(
    "SELECT * FROM therapy_bookings WHERE ($1::int IS NULL OR patient_id = $1) AND ($2::int IS NULL OR doctor_id = $2) ORDER BY booking_id DESC",
    bookingScope(user)
  );
  return result.rows;
};

// Get booking by ID
const getBookingById = async (id, user) => {
  const result = await db.query(
    "SELECT * FROM therapy_bookings WHERE booking_id = $1 AND ($2::int IS NULL OR patient_id = $2) AND ($3::int IS NULL OR doctor_id = $3)",
    [id, ...bookingScope(user)]
  );
  return result.rows[0];
};

const searchBooking = async ({ booking_id, patient_id }) => {
  const result = await db.query(
    "SELECT *, scheduled_date::text AS scheduled_date FROM therapy_bookings WHERE booking_id = $1 AND patient_id = $2",
    [booking_id, patient_id]
  );
  return result.rows;
};

const rescheduleBooking = async (id, patientId, date, time) => {
  const booking = await getBookingById(id, { id: patientId, role: "patient" });
  if (!booking) return null;

  return reserveSlot(booking.doctor_id, date, time, id, async (client) => {
    const { rows } = await client.query(
      `UPDATE therapy_bookings SET scheduled_date = $1, scheduled_time = $2, status = 'rescheduled'
       WHERE booking_id = $3 AND patient_id = $4 AND status IN ${activeStatuses}
         AND ((scheduled_date + scheduled_time) AT TIME ZONE 'Asia/Kolkata') > clock_timestamp() + interval '48 hours'
       RETURNING *`,
      [date, time, id, patientId]
    );
    if (!rows.length) throw bookingError(409, "This booking can no longer be rescheduled");
    return rows[0];
  });
};

const cancelBooking = async (id, patientId) => {
  const booking = await getBookingById(id, { id: patientId, role: "patient" });
  if (!booking) return null;
  if (booking.status === "cancelled") return booking;

  const { rows } = await db.query(
    `UPDATE therapy_bookings SET status = 'cancelled'
     WHERE booking_id = $1 AND patient_id = $2 AND status IN ${activeStatuses}
       AND ((scheduled_date + scheduled_time) AT TIME ZONE 'Asia/Kolkata') > clock_timestamp() + interval '24 hours'
     RETURNING *`,
    [id, patientId]
  );
  if (rows.length) return rows[0];
  const current = await getBookingById(id, { id: patientId, role: "patient" });
  if (current?.status === "cancelled") return current;
  throw bookingError(409, "This booking can no longer be cancelled");
};

async function availableTimes(doctorId, date) {
  if (!Number.isInteger(Number(doctorId)) || Number(doctorId) <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw bookingError(400, "Choose a doctor and a valid date");
  }
  const { rows } = await db.query(
    `SELECT slot FROM unnest($3::text[]) AS slots(slot)
     WHERE EXISTS (SELECT 1 FROM doctors WHERE doctor_id = $1)
       AND (($2::date + slot::time) AT TIME ZONE 'Asia/Kolkata') > clock_timestamp()
       AND NOT EXISTS (SELECT 1 FROM therapy_bookings
         WHERE doctor_id = $1 AND scheduled_date = $2 AND scheduled_time = slot::time
           AND (status IS NULL OR status IN ${activeStatuses}))`,
    [doctorId, date, clinicTimes]
  );
  return rows.map(({ slot }) => slot);
}

module.exports = {
  availableTimes,
  createBooking,
  getAllBookings,
  getBookingById,
  searchBooking,
  rescheduleBooking,
  cancelBooking,
};
