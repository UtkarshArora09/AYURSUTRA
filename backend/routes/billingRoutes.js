const express = require("express");
const router = express.Router();
const billingController = require("../controllers/billingController");
const { protect, authorize } = require("../middleware/authMiddleware");

// GET all billings — doctor or patient
router.get(
  "/",
  protect,
  authorize("doctor", "patient"),
  billingController.findAll
);

// GET billing by ID
router.get(
  "/:id",
  protect,
  authorize("doctor", "patient"),
  billingController.findById
);

// CREATE billing — doctor only
router.post("/", protect, authorize("doctor"), billingController.create);

// UPDATE billing
router.put("/:id", protect, authorize("doctor"), billingController.update);

// DELETE billing
router.delete("/:id", protect, authorize("doctor"), billingController.remove);

module.exports = router;
