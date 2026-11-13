require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const pool = require("./config/db");
const migrate = require("./config/init-db");
const { getJwtSecret } = require("./config/auth");

const adminRoutes = require("./routes/adminRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const therapistRoutes = require("./routes/therapistRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const recordRoutes = require("./routes/recordRoutes");
const billingRoutes = require("./routes/billingRoutes");
const therapyRoutes = require("./routes/therapyRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const sitemapRoutes = require('./routes/sitemap');

const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan(":method :status :response-time ms"));

// API routes
app.use("/api/admin", adminRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/therapists", therapistRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/therapy", therapyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/queue", require("./routes/queueRoutes"));
app.use('/sitemap.xml', sitemapRoutes);

// Root health check
app.get("/", (req, res) => {
  res.send(`🌿 AyurSutra API is running in ${process.env.NODE_ENV} mode`);
});

app.get("/health/ready", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ready" });
  } catch {
    res.status(503).json({ status: "unavailable" });
  }
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
async function start() {
  getJwtSecret();
  await migrate();
  return app.listen(PORT, process.env.HOST, () => console.log("AyurSutra API listening"));
}

if (require.main === module) {
  start().catch(async (error) => {
    console.error("API startup failed:", error.code || error.message);
    await pool.end();
    process.exitCode = 1;
  });
}

module.exports = { app, start };