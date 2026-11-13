const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

const { protect, authorize } = require("../middleware/authMiddleware");
router.use(protect, authorize("patient", "doctor", "admin"));
router.post("/", authorize("patient"), bookingController.createBooking);
router.get("/", bookingController.getAllBookings);
router.get("/availability", authorize("patient"), bookingController.availability);
router.get("/:id", bookingController.getBookingById);
router.get("/patient/:id", bookingController.getBookingsByPatientId);
router.post("/search", authorize("patient"), bookingController.search);
router.put("/:id/reschedule", authorize("patient"), bookingController.rescheduleBooking);
router.put("/:id/cancel", authorize("patient"), bookingController.cancelBooking);
module.exports = router;
