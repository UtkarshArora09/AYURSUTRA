const Patient = require("../models/patientModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { getJwtSecret } = require("../config/auth");

// Register Patient
exports.registerPatient = async (req, res) => {
  try {

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

    res.status(201).json({ patient_id: newPatient.patient_id, first_name: newPatient.first_name });
  } catch (err) {
    res.status(500).json({ message: "Authentication request failed" });
  }
};

exports.loginPatient = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body missing" });
    }
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const patient = await Patient.findByEmail(email);

    if (!patient)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, patient.password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: patient.patient_id, role: "patient" },
      getJwtSecret(),
      { expiresIn: "1d" }
    );

    const { patient_id, first_name, last_name, email: patientEmail, role } = patient;
    const patientData = { patient_id, first_name, last_name, email: patientEmail, role };
    res.json({ token, patient: patientData });
  } catch (err) {
    res.status(500).json({ message: "Authentication request failed" });
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
      return res.json({ message: "If the account exists, a reset link will be sent" });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save token & expiry to patient record
    await Patient.setResetToken(email, crypto.createHash("sha256").update(resetToken).digest("hex"), resetTokenExpiry);

    // Send email (using nodemailer)
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "AyurSutra Password Reset",
      text: `Use this link within one hour to reset your password: ${resetUrl}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "If the account exists, a reset link will be sent" });
  } catch (err) {
    res.status(500).json({ message: "Authentication request failed" });
  }
};

exports.verifyResetToken = async (req, res) => {
  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({ valid: false, message: "Token and email required" });
    }

    // Check if patient exists with reset token
    const patient = await Patient.findByEmail(email);

    if (!patient || patient.reset_token !== crypto.createHash("sha256").update(String(token)).digest("hex") || new Date(patient.reset_token_expiry) < new Date()) {
      return res.status(400).json({ valid: false, message: "Invalid or expired reset link" });
    }

    return res.json({ valid: true, message: "Valid reset link" });
  } catch (err) {
    return res.status(500).json({ valid: false, message: "Server error" });
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

    const tokenHash = crypto.createHash("sha256").update(String(token)).digest("hex");
    const patient = await Patient.findByResetToken(tokenHash);

    if (!patient) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (Date.now() > patient.resetTokenExpiry) {
      return res.status(400).json({ message: "Token expired" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update patient password & remove token
    const updated = await Patient.updatePassword(patient.patient_id, hashedPassword, tokenHash);
    if (!updated) return res.status(400).json({ message: "Invalid or expired token" });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Authentication request failed" });
  }
};
