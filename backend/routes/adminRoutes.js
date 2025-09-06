const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Login
router.post("/auth/login", adminController.loginAdmin);

// Protect all admin routes
router.use(protect);
router.use(authorize("admin"));

// Doctor CRUD
router.get("/doctors", adminController.getDoctors);
router.get("/doctors/:id", adminController.getDoctorById);
router.post("/doctors", adminController.registerDoctor);
router.put("/doctors/:id", adminController.updateDoctor);
router.delete("/doctors/:id", adminController.deleteDoctor);

// Therapist CRUD
router.get("/therapists", adminController.getTherapists);
router.get("/therapists/:id", adminController.getTherapistById);
router.post("/therapists", adminController.registerTherapist);
router.put("/therapists/:id", adminController.updateTherapist);
router.delete("/therapists/:id", adminController.deleteTherapist);

// Patient CRUD
router.get("/patients", adminController.getPatients);

// Therapy CRUD
router.get("/therapies", adminController.getTherapies);

module.exports = router;
