// const pool = require("../config/db");

// const Billing = {
//   async findAll() {
//     const { rows } = await pool.query(
//       "SELECT * FROM billing ORDER BY created_at DESC"
//     );
//     return rows;
//   },

//   async findById(id) {
//     const { rows } = await pool.query(
//       "SELECT * FROM billing WHERE bill_id = $1",
//       [id]
//     );
//     return rows[0];
//   },

//   async create({ patient_id, appointment_id, amount, status }) {
//     const { rows } = await pool.query(
//       `INSERT INTO billing (patient_id, appointment_id, amount, status)
//        VALUES ($1, $2, $3, $4)
//        RETURNING *`,
//       [patient_id, appointment_id, amount, status]
//     );
//     return rows[0];
//   },

//   async update(id, { amount, status }) {
//     const { rows } = await pool.query(
//       `UPDATE billing
//        SET amount = $1, status = $2, updated_at = CURRENT_TIMESTAMP
//        WHERE bill_id = $3
//        RETURNING *`,
//       [amount, status, id]
//     );
//     return rows[0];
//   },

//   async remove(id) {
//     await pool.query("DELETE FROM billing WHERE bill_id = $1", [id]);
//     return true;
//   },
// };

// module.exports = Billing;

const Billing = require("../models/billingModel");

const billingController = {
  // GET /billing
  async findAll(req, res) {
    try {
      const bills = await Billing.findAll();
      res.status(200).json(bills);
    } catch (error) {
      console.error("Error fetching billing records:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // GET /billing/:id
  async findById(req, res) {
    const { id } = req.params;
    try {
      const bill = await Billing.findById(id);
      if (!bill) {
        return res.status(404).json({ error: "Billing record not found" });
      }
      res.status(200).json(bill);
    } catch (error) {
      console.error("Error fetching billing record:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // POST /billing
  async create(req, res) {
    const { patient_id, appointment_id, amount, status } = req.body;

    if (!patient_id || !appointment_id || !amount || !status) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const newBill = await Billing.create({
        patient_id,
        appointment_id,
        amount,
        status,
      });
      res.status(201).json(newBill);
    } catch (error) {
      console.error("Error creating billing record:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // PUT /billing/:id
  async update(req, res) {
    const { id } = req.params;
    const { amount, status } = req.body;

    if (!amount || !status) {
      return res.status(400).json({ error: "Amount and status are required" });
    }

    try {
      const updatedBill = await Billing.update(id, { amount, status });
      if (!updatedBill) {
        return res.status(404).json({ error: "Billing record not found" });
      }
      res.status(200).json(updatedBill);
    } catch (error) {
      console.error("Error updating billing record:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // DELETE /billing/:id
  async remove(req, res) {
    const { id } = req.params;

    try {
      const result = await Billing.remove(id);
      if (!result) {
        return res.status(404).json({ error: "Billing record not found" });
      }
      res.status(200).json({ message: "Billing record deleted successfully" });
    } catch (error) {
      console.error("Error deleting billing record:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = billingController;
