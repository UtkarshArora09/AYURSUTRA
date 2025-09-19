const db = require("../config/db");

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

  const result = await db.query(query, values);
  return result.rows[0];
};

// Get all bookings
const getAllBookings = async () => {
  const result = await db.query(
    "SELECT * FROM therapy_bookings ORDER BY booking_id DESC"
  );
  return result.rows;
};

// Get booking by ID
const getBookingById = async (id) => {
  const result = await db.query(
    "SELECT * FROM therapy_bookings WHERE booking_id = $1",
    [id]
  );
  return result.rows[0];
};

const searchBooking = async ({ booking_id, patient_id, mobile_number }) => {
  let query = "SELECT * FROM therapy_bookings WHERE 1=1";
  const values = [];
  let count = 1;

  if (booking_id) {
    query += ` AND booking_id::text = $${count++}`; // cast to text
    values.push(String(booking_id));
  }

  if (patient_id) {
    query += ` AND patient_id = $${count++}`;
    values.push(String(patient_id));
  }

  if (mobile_number) {
    query += ` AND mobile_number = $${count++}`;
    values.push(String(mobile_number));
  }

  const result = await db.query(query, values);
  return result.rows;
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  searchBooking,
};
