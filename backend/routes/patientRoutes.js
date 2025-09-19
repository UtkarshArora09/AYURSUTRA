const express = require("express");
const router = express.Router();
const {
  registerPatient,
  loginPatient,
} = require("../controllers/authPatientController");
const patientController = require("../controllers/patientController");
const { protect, authorize } = require("../middleware/authMiddleware");
const authPatientController = require("../controllers/authPatientController");
// Auth routes
router.post("/auth/register", registerPatient);
router.post("/auth/login", loginPatient);

// Patient protected routes
router.get("/", patientController.getPatients);
router.get("/:id", patientController.getPatientById);
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
router.post("/verify-reset-token", authPatientController.verifyResetToken);
router.post("/auth/forgot-password", authPatientController.forgotPassword);
router.post("/auth/reset-password", authPatientController.resetPassword);

module.exports = router;
