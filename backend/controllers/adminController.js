const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/adminModel");
const Doctor = require("../models/doctorModel");
const Therapist = require("../models/therapistModel");
const Patient = require("../models/patientModel");
const Therapy = require("../models/therapyModel");

// Admin login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findByEmail(email);
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin.id || admin.admin_id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ token, admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin register Doctor
exports.registerDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      experience_years,
      qualification,
      clinic_address,
    } = req.body;
    const existing = await Doctor.findByEmail(email);
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newDoctor = await Doctor.create({
      name,
      email,
      password: hashedPassword,
      phone,
      specialization,
      experience_years,
      qualification,
      clinic_address,
    });
    res
      .status(201)
      .json({ message: "Doctor registered successfully", doctor: newDoctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Admin register Therapist
exports.registerTherapist = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      expertise,
      experience_years,
      qualification,
      assigned_doctor_id,
    } = req.body;
    const existing = await Therapist.findByEmail(email);
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newTherapist = await Therapist.create({
      name,
      email,
      password: hashedPassword,
      phone,
      expertise,
      experience_years,
      qualification,
      assigned_doctor_id,
    });
    res
      .status(201)
      .json({
        message: "Therapist registered successfully",
        therapist: newTherapist,
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Admin CRUD: Doctors
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
    const updated = await Doctor.update(req.params.id, req.body);
    res.json({ message: "Doctor updated", doctor: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.deleteDoctor = async (req, res) => {
  try {
    const deleted = await Doctor.remove(req.params.id);
    res.json({ message: "Doctor deleted", doctor: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Admin CRUD: Therapists
exports.getTherapists = async (req, res) => {
  try {
    const therapists = await Therapist.findAll();
    res.json(therapists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getTherapistById = async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.params.id);
    if (!therapist)
      return res.status(404).json({ message: "Therapist not found" });
    res.json(therapist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.updateTherapist = async (req, res) => {
  try {
    const updated = await Therapist.update(req.params.id, req.body);
    res.json({ message: "Therapist updated", therapist: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.deleteTherapist = async (req, res) => {
  try {
    const deleted = await Therapist.remove(req.params.id);
    res.json({ message: "Therapist deleted", therapist: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Admin CRUD: Patients
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.findAll();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Admin CRUD: Therapies
exports.getTherapies = async (req, res) => {
  try {
    const therapies = await Therapy.findAll();
    res.json(therapies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
