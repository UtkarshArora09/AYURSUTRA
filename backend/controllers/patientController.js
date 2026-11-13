const Patient = require("../models/patientModel");

//  Get all patients
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.findAll();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: "Patient request failed" });
  }
};

//  Get patient by ID
exports.getPatientById = async (req, res) => {
  if (String(req.user.id) !== req.params.id) return res.status(404).json({ message: "Patient not found" });
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: "Patient request failed" });
  }
};

// Update patient
exports.updatePatient = async (req, res) => {
  if (String(req.user.id) !== req.params.id) return res.status(404).json({ message: "Patient not found" });
  try {
    const patient = await Patient.update(req.params.id, req.body);
    if (!patient) return res.status(400).json({ message: "Invalid profile fields" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: "Patient request failed" });
  }
};

//  Delete patient
exports.deletePatient = async (req, res) => {
  if (String(req.user.id) !== req.params.id) return res.status(404).json({ message: "Patient not found" });
  try {
    await Patient.remove(req.params.id);
    res.json({ message: "Patient deleted" });
  } catch (err) {
    res.status(500).json({ message: "Patient request failed" });
  }
};
