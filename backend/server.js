require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

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
app.use(morgan("dev"));

app.use("/api/admin", adminRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/therapists", therapistRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/therapy", therapyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use('/', sitemapRoutes);

app.get("/", (req, res) => {
  res.send(`🌿 AyurSutra API is running in ${process.env.NODE_ENV} mode`);
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    ` Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
  );
});
