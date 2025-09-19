const Doctor = require("../models/doctorModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// exports.loginDoctor = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const doctor = await Doctor.findByEmail(email);
//     if (!doctor)
//       return res.status(400).json({ message: "Invalid credentials" });

//     const isMatch = await bcrypt.compare(password, doctor.password);
//     if (!isMatch)
//       return res.status(400).json({ message: "Invalid credentials" });

//     const token = jwt.sign(
//       { id: doctor.doctor_id, role: "doctor" },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     // Simple object with only the fields you need
//     const doctorData = {
//       id: doctor.doctor_id,
//       name: doctor.name, // just use the name from DB
//       email: doctor.email,
//       role: "doctor",
//     };

//     res.status(200).json({ token, user: doctorData });
//   } catch (err) {
//     console.error("Doctor login error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findByEmail(email);
    if (!doctor)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // ✅ use doctor.id (aliased in model)
    const token = jwt.sign(
      { id: doctor.id, role: "doctor" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const doctorData = {
      id: doctor.id, // ✅ correct field
      name: doctor.name,
      email: doctor.email,
      role: "doctor",
    };

    res.status(200).json({ token, user: doctorData });
  } catch (err) {
    console.error("Doctor login error:", err);
    res.status(500).json({ error: err.message });
  }
};
