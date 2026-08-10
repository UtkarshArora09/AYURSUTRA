// const Booking = require("../models/bookingModel");

// // Create booking
// const createBooking = async (req, res) => {
//   try {
//     const booking = await Booking.createBooking(req.body);
//     res.status(201).json({
//       message: "Booking created successfully",
//       data: booking,
//     });
//   } catch (error) {
//     console.error("Error creating booking:", error);
//     res.status(500).json({ error: "Internal server error", details: error.message });
//   }
// };

// // Get all bookings
// const getAllBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.getAllBookings();
//     res.status(200).json(bookings);
//   } catch (error) {
//     console.error("Error fetching bookings:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// // Get booking by ID
// const getBookingById = async (req, res) => {
//   try {
//     const booking = await Booking.getBookingById(req.params.id);
//     if (!booking) return res.status(404).json({ error: "Booking not found" });
//     res.status(200).json(booking);
//   } catch (error) {
//     console.error("Error fetching booking:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// exports.search = async (req, res) => {
//   try {
//     const { booking_id, patient_id, mobile_number } = req.body;
//     const result = await searchBooking({ booking_id, patient_id, mobile_number });

//     if (result.length === 0) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     res.json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Search failed" });
//   }
// };

// module.exports = {
//   createBooking,
//   getAllBookings,
//   getBookingById,
//   search
// };
const Booking = require("../models/bookingModel");

// Create booking
const createBooking = async (req, res) => {
  try {
    const booking = await Booking.createBooking(req.body);
    res.status(201).json({
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.getAllBookings();
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.status(200).json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const db = require("../config/db");

// 🔍 Search bookings (mapped to camelCase structured object expected by frontend)
const search = async (req, res) => {
  try {
    const { booking_id, patient_id, mobile_number } = req.body;
    const result = await Booking.searchBooking({
      booking_id,
      patient_id,
      mobile_number,
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

    // Fetch patient name & aadhar from database
    let patientName = "N/A";
    let aadharNumber = "N/A";
    if (row.patient_id) {
      const patRes = await db.query("SELECT first_name, last_name, aadhar_number FROM patients WHERE patient_id = $1", [row.patient_id]);
      if (patRes.rows.length > 0) {
        patientName = `${patRes.rows[0].first_name} ${patRes.rows[0].last_name}`.trim();
        aadharNumber = patRes.rows[0].aadhar_number || "N/A";
      }
    }

    const mockCenters = {
      1: { name: "AyurSutra Wellness Center - Mumbai", address: "Bandra West, Mumbai, Maharashtra" },
      2: { name: "Vedic Healing Center - Pune", address: "Koregaon Park, Pune, Maharashtra" },
      3: { name: "Holistic Ayurveda Clinic - Delhi", address: "Greater Kailash, New Delhi" }
    };
    const center = mockCenters[row.center_id] || mockCenters[1];

    const mapped = {
      bookingId: String(row.booking_id),
      patientId: `AYR-2026-${String(row.patient_id).padStart(3, "0")}`,
      patientName: patientName,
      aadharNumber: aadharNumber,
      mobileNumber: row.mobile_number || "",
      currentDate: row.scheduled_date ? new Date(row.scheduled_date).toISOString().split('T')[0] : "",
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
      bookingDate: row.scheduled_date ? new Date(row.scheduled_date).toISOString().split('T')[0] : "",
      canReschedule: true,
      canCancel: true,
      rescheduleDeadline: row.scheduled_date ? new Date(new Date(row.scheduled_date).getTime() - 48*60*60*1000).toISOString().split('T')[0] : "",
      cancellationDeadline: row.scheduled_date ? new Date(new Date(row.scheduled_date).getTime() - 24*60*60*1000).toISOString().split('T')[0] : ""
    };

    res.json(mapped);
  } catch (err) {
    console.error("Error searching booking:", err);
    res.status(500).json({ message: "Search failed" });
  }
};

// Reschedule booking
const rescheduleBooking = async (req, res) => {
  try {
    const { new_date, new_time } = req.body;
    const booking = await Booking.rescheduleBooking(req.params.id, new_date, new_time);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.status(200).json({ message: "Booking rescheduled successfully", data: booking });
  } catch (error) {
    console.error("Error rescheduling booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.cancelBooking(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.status(200).json({ message: "Booking cancelled successfully", data: booking });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all bookings for a patient
const getBookingsByPatientId = async (req, res) => {
  try {
    const patient_id = req.params.id;
    const result = await db.query(
      `SELECT b.*, d.name as doctor_name, d.specialization as doctor_specialization 
       FROM therapy_bookings b
       LEFT JOIN doctors d ON b.doctor_id = d.doctor_id
       WHERE b.patient_id = $1
       ORDER BY b.scheduled_date DESC`,
      [patient_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching bookings by patient ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  search,
  rescheduleBooking,
  cancelBooking,
  getBookingsByPatientId,
};
