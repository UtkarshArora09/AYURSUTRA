const Billing = require("../models/billingModel");

const billingController = {
  async findAll(req, res) {
    try {
      const bills = await Billing.findAll();
      res.status(200).json(bills);
    } catch (error) {
      console.error("Error fetching billing records:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async findById(req, res) {
    const { id } = req.params;
    try {
      const bill = await Billing.findById(id);
      if (!bill) return res.status(404).json({ error: "Billing record not found" });
      res.status(200).json(bill);
    } catch (error) {
      console.error("Error fetching billing record:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async create(req, res) {
    const { patient_id, booking_id, amount, status } = req.body;

    if (!patient_id || !booking_id || !amount || !status) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const newBill = await Billing.create({
        patient_id,
        booking_id,
        amount,
        status,
      });
      res.status(201).json(newBill);
    } catch (error) {
      console.error("Error creating billing record:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async update(req, res) {
    const { id } = req.params;
    const { amount, status } = req.body;

    if (!amount || !status) {
      return res.status(400).json({ error: "Amount and status are required" });
    }

    try {
      const updatedBill = await Billing.update(id, { amount, status });
      if (!updatedBill) return res.status(404).json({ error: "Billing record not found" });
      res.status(200).json(updatedBill);
    } catch (error) {
      console.error("Error updating billing record:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async remove(req, res) {
    const { id } = req.params;
    try {
      const result = await Billing.remove(id);
      if (!result) return res.status(404).json({ error: "Billing record not found" });
      res.status(200).json({ message: "Billing record deleted successfully" });
    } catch (error) {
      console.error("Error deleting billing record:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = billingController;
