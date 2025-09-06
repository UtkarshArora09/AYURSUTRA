const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Doctors & Therapists can view all appointments
router.get(
  "/",
  protect,
  authorize("doctor", "therapist"),
  appointmentController.getAppointments
);

//  Patients, Doctors, Therapists can view specific appointment
router.get(
  "/:id",
  protect,
  authorize("patient", "doctor", "therapist"),
  appointmentController.getAppointmentById
);

// Patients create appointment (optionally doctors/therapists can too)
router.post(
  "/",
  protect,
  authorize("patient"),
  appointmentController.createAppointment
);

// Doctors & Therapists can update appointment
router.put(
  "/:id",
  protect,
  authorize("doctor", "therapist"),
  appointmentController.updateAppointment
);

// Doctors & Therapists can delete appointment
router.delete(
  "/:id",
  protect,
  authorize("doctor", "therapist"),
  appointmentController.deleteAppointment
);

module.exports = router;
