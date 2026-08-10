const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

// Routes
router.post("/", bookingController.createBooking);
router.get("/", bookingController.getAllBookings);
router.get("/:id", bookingController.getBookingById);
router.get("/patient/:id", bookingController.getBookingsByPatientId);
router.post("/search", bookingController.search);
router.put("/:id/reschedule", bookingController.rescheduleBooking);
router.put("/:id/cancel", bookingController.cancelBooking);
module.exports = router;
