const Record = require("../models/recordModel");

exports.getRecords = async (req, res) => {
  try {
    const records = await Record.findAll(req.user);
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Record request failed" });
  }
};

exports.getRecordById = async (req, res) => {
  try {
    const record = await Record.findById(req.params.id, req.user);
    if (!record) return res.status(404).json({ message: "Record not found" });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: "Record request failed" });
  }
};

exports.createRecord = async (req, res) => {
  try {
    const record = await Record.create(req.body, req.user);
    if (!record) return res.status(404).json({ message: "Patient assignment not found" });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: "Record request failed" });
  }
};

exports.updateRecord = async (req, res) => {
  try {
    const record = await Record.update(req.params.id, req.body, req.user);
    if (!record) return res.status(404).json({ message: "Record not found" });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: "Record request failed" });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    const removed = await Record.remove(req.params.id, req.user);
    if (!removed) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Record deleted" });
  } catch (err) {
    res.status(500).json({ message: "Record request failed" });
  }
};
