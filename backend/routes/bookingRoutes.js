const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

// Routes
router.post("/", bookingController.createBooking);
router.get("/", bookingController.getAllBookings);
router.get("/:id", bookingController.getBookingById);
router.post("/search", bookingController.search);
module.exports = router;
