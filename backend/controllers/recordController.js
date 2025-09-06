const Record = require("../models/recordModel");

exports.getRecords = async (req, res) => {
  try {
    const records = await Record.findAll();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecordById = async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createRecord = async (req, res) => {
  try {
    const record = await Record.create(req.body);
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRecord = async (req, res) => {
  try {
    const record = await Record.update(req.params.id, req.body);
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    await Record.remove(req.params.id);
    res.json({ message: "Record deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
