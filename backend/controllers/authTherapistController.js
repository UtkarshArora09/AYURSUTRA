const Therapist = require("../models/therapistModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// // Register a new therapist
// exports.registerTherapist = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       password,
//       phone,
//       expertise,
//       experience_years,
//       qualification,
//       assigned_doctor_id,
//     } = req.body;

//     // Check if email already exists
//     const existing = await Therapist.findByEmail(email);
//     if (existing)
//       return res.status(400).json({ message: "Email already registered" });

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newTherapist = await Therapist.create({
//       name,
//       email,
//       password: hashedPassword,
//       phone,
//       expertise,
//       experience_years,
//       qualification,
//       assigned_doctor_id,
//     });

//     res
//       .status(201)
//       .json({
//         message: "Therapist registered successfully",
//         therapist: newTherapist,
//       });
//   } catch (err) {
//     console.error("Therapist register error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// Login therapist
exports.loginTherapist = async (req, res) => {
  try {
    const { email, password } = req.body;

    const therapist = await Therapist.findByEmail(email);
    if (!therapist)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, therapist.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Create JWT token
    const token = jwt.sign(
      { id: therapist.id || therapist.therapist_id, role: "therapist" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("Therapist login successful, JWT:", token);
    res.json({ token, therapist });
  } catch (err) {
    console.error("Therapist login error:", err);
    res.status(500).json({ error: err.message });
  }
};
