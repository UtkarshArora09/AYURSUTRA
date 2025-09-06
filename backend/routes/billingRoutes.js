const express = require("express");
const router = express.Router();
const billingController = require("../controllers/billingController"); // make sure path is correct
const { protect, authorize } = require("../middleware/authMiddleware");

// GET all billings — accessible by doctor or patient
router.get(
  "/",
  protect,
  authorize("doctor", "patient"),
  billingController.findAll
);

// GET billing by id
router.get(
  "/:id",
  protect,
  authorize("doctor", "patient"),
  billingController.findById
);

// CREATE billing — usually doctor or admin
router.post("/", protect, authorize("doctor"), billingController.create);

// UPDATE billing
router.put("/:id", protect, authorize("doctor"), billingController.update);

// DELETE billing
router.delete("/:id", protect, authorize("doctor"), billingController.remove);

module.exports = router;
