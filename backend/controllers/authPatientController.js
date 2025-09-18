const Patient = require("../models/patientModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Register Patient
exports.registerPatient = async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const {
      firstName,
      lastName,
      email,
      password,
      dob,
      age,
      gender,
      mobNumber,
      aadharNumber,
      bloodGroup,
      address,
      emergencyContactName,
      emergencyContactNumber,
      allergies,
      medicalHistory,
    } = req.body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !dob ||
      !age ||
      !gender ||
      !mobNumber ||
      !aadharNumber ||
      !bloodGroup ||
      !emergencyContactName ||
      !emergencyContactNumber
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if email already exists
    const existing = await Patient.findByEmail(email.toLowerCase());
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create patient record
    const newPatient = await Patient.create({
      firstName,
      lastName,
      gender,
      dob,
      age,
      mobNumber,
      email: email.toLowerCase(),
      aadharNumber,
      bloodGroup,
      address,
      emergencyContactName,
      emergencyContactNumber,
      allergies,
      medicalHistory,
      password: hashedPassword,
      role: "patient", // explicitly pass role
    });

    // Remove password before sending response
    if (newPatient.password) delete newPatient.password;

    res.status(201).json(newPatient);
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.loginPatient = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body missing" });
    }
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    console.log("Login attempt:", email);

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const patient = await Patient.findByEmail(email);
    console.log("Patient found:", patient);

    if (!patient)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, patient.password);
    console.log("Password match:", isMatch);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: patient.patient_id, role: "patient" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: pwd, ...patientData } = patient;
    res.json({ token, patient: patientData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Forgot Password - send reset link
exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const patient = await Patient.findByEmail(email);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save token & expiry to patient record
    await Patient.setResetToken(email, resetToken, resetTokenExpiry);

    // Send email (using nodemailer)
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "AyurSutra Password Reset",
      html: `<p>Hello ${patient.firstName},</p>
             <p>Click the link below to reset your password. This link is valid for 1 hour.</p>
             <a href="${resetUrl}">${resetUrl}</a>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Reset Password - set new password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    const patient = await Patient.findByResetToken(token);

    if (!patient) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (Date.now() > patient.resetTokenExpiry) {
      return res.status(400).json({ message: "Token expired" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update patient password & remove token
    await Patient.updatePassword(patient.patient_id, hashedPassword);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
