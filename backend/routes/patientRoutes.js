const express = require("express");
const router = express.Router();
const {
  registerPatient,
  loginPatient,
} = require("../controllers/authPatientController");
const patientController = require("../controllers/patientController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Auth routes
router.post("/auth/register", registerPatient);
router.post("/auth/login", loginPatient);

// Patient protected routes
router.get("/", protect, authorize("doctor"), patientController.getPatients);
router.get(
  "/:id",
  protect,
  authorize("patient"),
  patientController.getPatientById
);
router.put(
  "/:id",
  protect,
  authorize("patient"),
  patientController.updatePatient
);
router.delete(
  "/:id",
  protect,
  authorize("patient"),
  patientController.deletePatient
);

module.exports = router;
