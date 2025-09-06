const express = require("express");
const router = express.Router();
const therapyController = require("../controllers/therapyController");
const { protect, authorize } = require("../middleware/authMiddleware");

// GET all therapies (any authenticated role)
router.get("/", protect, authorize("doctor", "therapist", "patient"), therapyController.getTherapies);

//GET therapy by ID
router.get("/:id", protect, authorize("doctor", "therapist", "patient"), therapyController.getTherapyById);

//CREATE therapy (doctor only)
router.post("/", protect, authorize("doctor"), therapyController.createTherapy);

// UPDATE therapy (doctor only)
router.put("/:id", protect, authorize("doctor"), therapyController.updateTherapy);

// DELETE therapy (doctor only)
router.delete("/:id", protect, authorize("doctor"), therapyController.deleteTherapy);

module.exports = router;
