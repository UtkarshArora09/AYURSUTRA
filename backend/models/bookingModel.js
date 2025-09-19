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
  const result = await db.query("SELECT * FROM therapy_bookings ORDER BY booking_id DESC");
  return result.rows;
};

// Get booking by ID
const getBookingById = async (id) => {
  const result = await db.query("SELECT * FROM therapy_bookings WHERE booking_id = $1", [id]);
  return result.rows[0];
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
};
