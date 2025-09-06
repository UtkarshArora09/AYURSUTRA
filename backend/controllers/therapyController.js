const Therapy = require("../models/therapyModel");

exports.getTherapies = async (req, res) => {
  try {
    const therapies = await Therapy.findAll();
    res.json(therapies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTherapyById = async (req, res) => {
  try {
    const therapy = await Therapy.findById(req.params.id);
    if (!therapy) return res.status(404).json({ message: "Therapy not found" });
    res.json(therapy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTherapy = async (req, res) => {
  try {
    const therapy = await Therapy.create(req.body);
    res.status(201).json(therapy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTherapy = async (req, res) => {
  try {
    const therapy = await Therapy.update(req.params.id, req.body);
    res.json(therapy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTherapy = async (req, res) => {
  try {
    await Therapy.remove(req.params.id);
    res.json({ message: "Therapy deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
