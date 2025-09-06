const Patient = require("../models/patientModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//  Register a new patient
exports.registerPatient = async (req, res) => {
  try {
    const { name, email, password, age, gender, phone, address, dosha_type, medical_history } = req.body;

    // Check if email exists
    const existing = await Patient.findByEmail(email);
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newPatient = await Patient.create({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      phone,
      address,
      dosha_type,
      medical_history,
    });

    res.status(201).json(newPatient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Login patient
exports.loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    const patient = await Patient.findByEmail(email);
    if (!patient)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: patient.patient_id, role: "patient" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
