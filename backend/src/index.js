const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AyurSutra Backend is running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on https://ayursutra-qhp0.onrender.com:${PORT}`);
});
