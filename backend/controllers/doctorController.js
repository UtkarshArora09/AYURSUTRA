const Doctor = require("../models/doctorModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// CRUD operations
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.update(req.params.id, req.body);
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    await Doctor.remove(req.params.id);
    res.json({ message: "Doctor deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
