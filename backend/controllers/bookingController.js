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

// 🔍 Search bookings
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

    res.json(result);
  } catch (err) {
    console.error("Error searching booking:", err);
    res.status(500).json({ message: "Search failed" });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  search,
};
