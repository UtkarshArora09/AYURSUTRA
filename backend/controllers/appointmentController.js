const pool = require("../config/db");

// GET ALL APPOINTMENTS
exports.getAppointments = async (req, res) => {
  try {
    let query = "SELECT * FROM appointments";

    // Patients should only see their own appointments
    if (req.user.role === "patient") {
      query += " WHERE patient_id = $1";
      const { rows } = await pool.query(query, [req.user.id]);
      return res.json(rows);
    }

    // Doctors & Therapists can see all appointments
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  GET APPOINTMENT BY ID
exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM appointments WHERE appointment_id = $1",
      [id]
    );
    const appointment = rows[0];

    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    // Patients can only see their own appointment
    if (req.user.role === "patient" && appointment.patient_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  CREATE APPOINTMENT
exports.createAppointment = async (req, res) => {
  try {
    const { doctor_id, therapist_id, appointment_date } = req.body;

    const patient_id =
      req.user.role === "patient" ? req.user.id : req.body.patient_id;

    // Validate doctor_id
    if (doctor_id) {
      const doc = await pool.query(
        "SELECT 1 FROM doctors WHERE doctor_id = $1",
        [doctor_id]
      );
      if (doc.rowCount === 0) {
        return res.status(400).json({ message: "Invalid doctor_id" });
      }
    }

    // Validate therapist_id
    if (therapist_id) {
      const ther = await pool.query(
        "SELECT 1 FROM therapists WHERE therapist_id = $1",
        [therapist_id]
      );
      if (ther.rowCount === 0) {
        return res.status(400).json({ message: "Invalid therapist_id" });
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO appointments (
         patient_id, doctor_id, therapist_id, appointment_date
       ) VALUES ($1, $2, $3, $4) RETURNING *`,
      [patient_id, doctor_id || null, therapist_id || null, appointment_date]
    );

    res
      .status(201)
      .json({ message: "Appointment created", appointment: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE APPOINTMENT
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { appointment_date, status, notes } = req.body;

    const { rows } = await pool.query(
      "SELECT * FROM appointments WHERE appointment_id = $1",
      [id]
    );
    const appointment = rows[0];

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only doctors, therapists, or admins can update
    if (req.user.role === "patient") {
      return res.status(403).json({ message: "Access denied" });
    }

    const updated = await pool.query(
      `UPDATE appointments 
       SET 
         appointment_date = $1,
         status = $2,
         notes = $3,
         updated_at = NOW()
       WHERE appointment_id = $4
       RETURNING *`,
      [
        appointment_date || appointment.appointment_date,
        status || appointment.status,
        notes ?? appointment.notes,
        id,
      ]
    );

    res.json({
      message: "Appointment updated successfully",
      appointment: updated.rows[0],
    });
  } catch (err) {
    console.error("Update appointment error:", err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE APPOINTMENT
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      "SELECT * FROM appointments WHERE appointment_id = $1",
      [id]
    );
    const appointment = rows[0];

    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    // Patients cannot delete, only doctors/therapists
    if (req.user.role === "patient") {
      return res.status(403).json({ message: "Access denied" });
    }

    await pool.query("DELETE FROM appointments WHERE appointment_id = $1", [
      id,
    ]);
    res.json({ message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
