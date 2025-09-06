const express = require("express");
const router = express.Router();
const authDoctorController = require("../controllers/authDoctorController");
const doctorController = require("../controllers/doctorController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Auth routes
// router.post("/auth/register", authDoctorController.registerDoctor);
router.post("/auth/login", authDoctorController.loginDoctor);

// Doctor protected routes
router.get("/", protect, authorize("doctor"), doctorController.getDoctors);
router.get(
  "/:id",
  protect,
  authorize("doctor"),
  doctorController.getDoctorById
);
router.put("/:id", protect, authorize("doctor"), doctorController.updateDoctor);
router.delete(
  "/:id",
  protect,
  authorize("doctor"),
  doctorController.deleteDoctor
);

module.exports = router;
