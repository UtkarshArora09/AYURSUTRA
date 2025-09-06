const Therapist = require("../models/therapistModel");

// Get all therapists
exports.getTherapists = async (req, res) => {
  try {
    const therapists = await Therapist.findAll();
    res.json(therapists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get therapist by ID
exports.getTherapistById = async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.params.id);
    if (!therapist)
      return res.status(404).json({ message: "Therapist not found" });
    res.json(therapist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Update therapist
exports.updateTherapist = async (req, res) => {
  try {
    const updatedTherapist = await Therapist.update(req.params.id, req.body);
    if (!updatedTherapist)
      return res.status(404).json({ message: "Therapist not found" });
    res.json(updatedTherapist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Delete therapist
exports.deleteTherapist = async (req, res) => {
  try {
    const deletedTherapist = await Therapist.remove(req.params.id);
    if (!deletedTherapist)
      return res.status(404).json({ message: "Therapist not found" });
    res.json({ message: "Therapist deleted", deletedTherapist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
