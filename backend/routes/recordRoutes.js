const express = require("express");
const router = express.Router();
const recordController = require("../controllers/recordController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Protected routes example
router.get(
  "/",
  protect,
  authorize("doctor", "therapist"),
  recordController.getRecords
);
router.get(
  "/:id",
  protect,
  authorize("doctor", "therapist"),
  recordController.getRecordById
);
router.post(
  "/",
  protect,
  authorize("doctor", "therapist"),
  recordController.createRecord
);
router.put(
  "/:id",
  protect,
  authorize("doctor", "therapist"),
  recordController.updateRecord
);
router.delete(
  "/:id",
  protect,
  authorize("doctor", "therapist"),
  recordController.deleteRecord
);

module.exports = router;
