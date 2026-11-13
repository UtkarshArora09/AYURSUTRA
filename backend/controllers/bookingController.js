const Booking = require("../models/bookingModel");

function rejectBookingError(error, res) {
  if (error.status >= 400 && error.status < 500) return res.status(error.status).json({ message: error.message });
  if (["22P02", "22008", "22007", "23503", "22003"].includes(error.code)) {
    return res.status(400).json({ message: "Invalid booking details" });
  }
  return res.status(500).json({ message: "Booking request failed" });
}



function rejectBookingError(error, res) {
  if (error.status >= 400 && error.status < 500) return res.status(error.status).json({ message: error.message });
  if (["22P02", "22008", "22007", "23503", "22003"].includes(error.code)) {
    return res.status(400).json({ message: "Invalid booking details" });
  }
  return res.status(500).json({ message: "Booking request failed" });
}

// Create booking
const createBooking = async (req, res) => {
  try {
    const booking = await Booking.createBooking({ ...req.body, patient_id: req.user.id, status: "pending" });
    res.status(201).json({
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    return rejectBookingError(error, res);
  }
};

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.getAllBookings(req.user);
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.getBookingById(req.params.id, req.user);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const db = require("../config/db");

// 🔍 Search bookings (mapped to camelCase structured object expected by frontend)
const search = async (req, res) => {
  try {
    const booking_id = String(req.body.booking_id ?? req.body.bookingId ?? "").trim();
    if (!/^\d{1,10}$/.test(booking_id)) return res.status(400).json({ message: "Enter a numeric booking ID" });
    const result = await Booking.searchBooking({
      booking_id,
      patient_id: req.user.id,
    });

    if (result.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const row = result[0];
    
    // Fetch doctor name from database
    let doctor = { name: "Dr. Priya Sharma", specialization: "Panchakarma Specialist" };
    if (row.doctor_id) {
      const docRes = await db.query("SELECT name, specialization FROM doctors WHERE doctor_id = $1", [row.doctor_id]);
      if (docRes.rows.length > 0) {
        doctor = docRes.rows[0];
      }
    }

    const mockCenters = {
      1: { name: "AyurSutra Wellness Center - Mumbai", address: "Bandra West, Mumbai, Maharashtra" },
      2: { name: "Vedic Healing Center - Pune", address: "Koregaon Park, Pune, Maharashtra" },
      3: { name: "Holistic Ayurveda Clinic - Delhi", address: "Greater Kailash, New Delhi" }
    };
    const center = mockCenters[row.center_id] || mockCenters[1];

    const scheduled = row.scheduled_date && row.scheduled_time
      ? new Date(`${row.scheduled_date}T${row.scheduled_time}+05:30`) : null;
    const active = ["pending", "confirmed", "scheduled", "rescheduled"].includes(row.status);
    const deadline = (hours) => scheduled ? new Date(scheduled.getTime() - hours * 3600000).toISOString() : null;
    const mapped = {
      bookingId: String(row.booking_id),
      patientId: `AYR-2026-${String(row.patient_id).padStart(3, "0")}`,
      mobileNumber: row.mobile_number || "",
      currentDate: row.scheduled_date || "",
      currentTime: row.scheduled_time ? row.scheduled_time.slice(0, 5) : "",
      doshaType: (row.dosha_type || "vata").toLowerCase(),
      doctor: {
        id: row.doctor_id,
        name: doctor.name,
        specialization: doctor.specialization,
        avatar: "https://randomuser.me/api/portraits/women/45.jpg"
      },
      center: center,
      treatment: {
        name: row.therapy_type || "Vamana",
        duration: "90 minutes"
      },
      status: row.status ? row.status.toLowerCase() : "pending",
      bookingDate: row.scheduled_date || "",
      canReschedule: Boolean(active && deadline(48) && new Date(deadline(48)) > new Date()),
      canCancel: Boolean(active && deadline(24) && new Date(deadline(24)) > new Date()),
      rescheduleDeadline: deadline(48),
      cancellationDeadline: deadline(24)
    };

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: "Search failed" });
  }
};

// Reschedule booking
const rescheduleBooking = async (req, res) => {
  try {
    const { new_date, new_time } = req.body;
    const booking = await Booking.rescheduleBooking(req.params.id, req.user.id, new_date, new_time);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.status(200).json({ message: "Booking rescheduled successfully", data: booking });
  } catch (error) {
    return rejectBookingError(error, res);
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.cancelBooking(req.params.id, req.user.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.status(200).json({ message: "Booking cancelled successfully", data: booking });
  } catch (error) {
    return rejectBookingError(error, res);
  }
};

// Get all bookings for a patient
const getBookingsByPatientId = async (req, res) => {
  try {
    const patient_id = req.params.id;
    if (req.user.role === "patient" && String(req.user.id) !== patient_id) return res.status(404).json({ message: "Bookings not found" });
    const doctor = req.user.role === "doctor" ? req.user.id : null;
    const result = await db.query(
      `SELECT b.*, d.name as doctor_name, d.specialization as doctor_specialization 
       FROM therapy_bookings b
       LEFT JOIN doctors d ON b.doctor_id = d.doctor_id
       WHERE b.patient_id = $1 AND ($2::int IS NULL OR b.doctor_id = $2)
       ORDER BY b.scheduled_date DESC`,
      [patient_id, doctor]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const availability = async (req, res) => {
  try {
    res.json(await Booking.availableTimes(req.query.doctorId, req.query.date));
  } catch (error) {
    return rejectBookingError(error, res);
  }
};

module.exports = {
  availability,
  createBooking,
  getAllBookings,
  getBookingById,
  search,
  rescheduleBooking,
  cancelBooking,
  getBookingsByPatientId,
};
