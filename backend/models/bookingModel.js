const db = require("../config/db");

const { durationFor, findSlots, lockSchedule } = require("./clinicSchedule");
const { offerReleasedSlot } = require("./clinicWaitlist");
const { enqueue } = require("./notifications");
const activeStatuses = "('pending', 'confirmed', 'scheduled', 'rescheduled')";

function bookingError(status, message) {
  return Object.assign(new Error(message), { status });
}

async function reserveSlot({ doctorId, centerId, date, time, bookingId, therapy, existingDuration, patientId }, save) {
  if (!Number.isInteger(Number(doctorId)) || Number(doctorId) <= 0 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw bookingError(400, "Choose a doctor and valid date and time");
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await lockSchedule(client);
    const duration = await durationFor(client, therapy, existingDuration);
    const slots = await findSlots(client, { doctorId, centerId, date, duration, bookingId, patientId });
    if (!slots.includes(time)) throw bookingError(409, "This time is no longer available");
    const result = await save(client, duration);
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
      (patient_id, therapy_type, scheduled_date, scheduled_time, doctor_id, center_id, mobile_number, symptoms, preferences, status, dosha_type, duration_minutes)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
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

  if (!Number.isInteger(Number(center_id)) || Number(center_id) < 1) throw bookingError(400, "Choose a clinic branch");
  if (typeof therapy_type !== "string" || !therapy_type.trim()) throw bookingError(400, "Choose a therapy");
  return reserveSlot({ doctorId: doctor_id, centerId: center_id ?? null, date: scheduled_date, time: scheduled_time, therapy: therapy_type, patientId: patient_id }, async (client, duration) => {
    const { rows: [booking] } = await client.query(query, [...values, duration]);
    await enqueue(client, booking, "confirmation");
    return booking;
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

  return reserveSlot({ doctorId: booking.doctor_id, centerId: booking.center_id, date, time, bookingId: id, existingDuration: booking.duration_minutes, patientId }, async (client) => {
    const { rows: [released] } = await client.query(
      "SELECT doctor_id, center_id, scheduled_date::text AS date, to_char(scheduled_time, 'HH24:MI') AS time FROM therapy_bookings WHERE booking_id = $1", [id]
    );
    const { rows } = await client.query(
      `UPDATE therapy_bookings SET scheduled_date = $1, scheduled_time = $2, status = 'rescheduled'
       WHERE booking_id = $3 AND patient_id = $4 AND (status IS NULL OR lower(status) IN ${activeStatuses})
         AND ((scheduled_date + scheduled_time) AT TIME ZONE 'Asia/Kolkata') > clock_timestamp() + interval '48 hours'
       RETURNING *`,
      [date, time, id, patientId]
    );
    if (!rows.length) throw bookingError(409, "This booking can no longer be rescheduled");
    await enqueue(client, rows[0], "reschedule");
    if (released.date !== date || released.time !== time) await offerReleasedSlot(client, released);
    return rows[0];
  });
};

const cancelBooking = async (id, patientId) => {
  const booking = await getBookingById(id, { id: patientId, role: "patient" });
  if (!booking) return null;
  if (booking.status === "cancelled") return booking;

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await lockSchedule(client);
    const { rows } = await client.query(
      `UPDATE therapy_bookings SET status = 'cancelled'
       WHERE booking_id = $1 AND patient_id = $2 AND (status IS NULL OR lower(status) IN ${activeStatuses})
         AND ((scheduled_date + scheduled_time) AT TIME ZONE 'Asia/Kolkata') > clock_timestamp() + interval '24 hours'
       RETURNING *, scheduled_date::text AS date, to_char(scheduled_time, 'HH24:MI') AS time`, [id, patientId]
    );
    if (rows.length) {
      await enqueue(client, rows[0], "cancellation");
      await offerReleasedSlot(client, rows[0]);
    } else {
      const current = await client.query("SELECT * FROM therapy_bookings WHERE booking_id = $1 AND patient_id = $2", [id, patientId]);
      if (current.rows[0]?.status !== "cancelled") throw bookingError(409, "This booking can no longer be cancelled");
      rows.push(current.rows[0]);
    }
    await client.query("COMMIT");
    return rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

async function availableTimes(doctorId, date, centerId, therapy, patientId) {
  if (!Number.isInteger(Number(doctorId)) || Number(doctorId) <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw bookingError(400, "Choose a doctor and a valid date");
  }
  const duration = await durationFor(db, therapy);
  return findSlots(db, { doctorId, date, centerId: centerId ?? null, duration, patientId });
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
