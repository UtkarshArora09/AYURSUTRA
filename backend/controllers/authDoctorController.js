const Doctor = require("../models/doctorModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// // Register a new doctor
// exports.registerDoctor = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       password,
//       phone,
//       specialization,
//       experience_years,
//       qualification,
//       clinic_address,
//     } = req.body;

//     // Check if email already exists
//     const existing = await Doctor.findByEmail(email);
//     if (existing)
//       return res.status(400).json({ message: "Email already registered" });

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newDoctor = await Doctor.create({
//       name,
//       email,
//       password: hashedPassword,
//       phone,
//       specialization,
//       experience_years,
//       qualification,
//       clinic_address,
//     });

//     res
//       .status(201)
//       .json({ message: "Doctor registered successfully", doctor: newDoctor });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

//  Login doctor
exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findByEmail(email);
    if (!doctor)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: doctor.id, role: "doctor" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, doctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
