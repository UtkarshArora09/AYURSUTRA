const express = require("express");
const router = express.Router();
const authTherapistController = require("../controllers/authTherapistController");
const therapistController = require("../controllers/therapistController"); 
const { protect, authorize } = require("../middleware/authMiddleware");

// Auth routes (if any)
// router.post("/auth/register", authTherapistController.registerTherapist); 
router.post("/auth/login", authTherapistController.loginTherapist);

// Protected CRUD routes
router.get("/", protect, authorize("therapist"), therapistController.getTherapists);
router.get("/:id", protect, authorize("therapist"), therapistController.getTherapistById);
router.put("/:id", protect, authorize("therapist"), therapistController.updateTherapist);
router.delete("/:id", protect, authorize("therapist"), therapistController.deleteTherapist);

module.exports = router;
