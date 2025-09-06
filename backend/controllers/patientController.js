const Patient = require("../models/patientModel");

//  Get all patients
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.findAll();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Get patient by ID
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update patient
exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.update(req.params.id, req.body);
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Delete patient
exports.deletePatient = async (req, res) => {
  try {
    await Patient.remove(req.params.id);
    res.json({ message: "Patient deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
