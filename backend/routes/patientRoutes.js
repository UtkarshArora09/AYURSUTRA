// const express = require("express");
// const router = express.Router();
// const {
//   registerPatient,
//   loginPatient,
// } = require("../controllers/authPatientController");
// const patientController = require("../controllers/patientController");
// const { protect, authorize } = require("../middleware/authMiddleware");

// // Auth routes
// router.post("/auth/register", registerPatient);
// router.post("/auth/login", loginPatient);

// // Patient protected routes
// router.get("/", protect, authorize("doctor"), patientController.getPatients);
// router.get(
//   "/:id",
//   protect,
//   authorize("patient"),
//   patientController.getPatientById
// );
// router.put(
//   "/:id",
//   protect,
//   authorize("patient"),
//   patientController.updatePatient
// );
// router.delete(
//   "/:id",
//   protect,
//   authorize("patient"),
//   patientController.deletePatient
// );

// router.post("/auth/forgot-password", authController.forgotPassword);
// router.post("/auth/reset-password", authController.resetPassword);

// module.exports = router;

const express = require("express");
const router = express.Router();
const {
  registerPatient,
  loginPatient,
} = require("../controllers/authPatientController");
const patientController = require("../controllers/patientController");
const authPatientController = require("../controllers/authPatientController"); // <-- add this
const { protect, authorize } = require("../middleware/authMiddleware");

// Auth routes
router.post("/auth/register", registerPatient);
router.post("/auth/login", loginPatient);

// Forgot/reset password routes
router.post("/auth/forgot-password", authPatientController.forgotPassword);
router.post("/auth/reset-password", authPatientController.resetPassword);

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
