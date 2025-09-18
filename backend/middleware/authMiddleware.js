const jwt = require("jsonwebtoken");
const pool = require("../config/db");

//  Protect Routes (Check if token is valid)
const protect = async (req, res, next) => {
  let token;

  // Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token
      token = req.headers.authorization.split(" ")[1];

      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let user;

      // Fetch user info based on role
      switch (decoded.role) {
        case "patient":
          {
            const { rows } = await pool.query(
              "SELECT patient_id AS id, email, role FROM patients WHERE patient_id=$1",
              [decoded.id]
            );
            user = rows[0];
          }
          break;

        case "doctor":
          {
            const { rows } = await pool.query(
              "SELECT doctor_id AS id, email, role FROM doctors WHERE doctor_id=$1",
              [decoded.id]
            );
            user = rows[0];
          }
          break;

        case "therapist":
          {
            const { rows } = await pool.query(
              "SELECT therapist_id AS id, email, role FROM therapists WHERE therapist_id=$1",
              [decoded.id]
            );
            user = rows[0];
          }
          break;

        case "admin":
          {
            const { rows } = await pool.query(
              "SELECT admin_id AS id, email, role FROM admins WHERE admin_id=$1",
              [decoded.id]
            );
            user = rows[0];
          }
          break;

        default:
          return res.status(401).json({ message: "Unknown role in token" });
      }

      // If no user found
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Attach user info to request
      req.user = user;

      next(); // continue to the next middleware/controller
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Not authorized, token failed", error: err.message });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Role-based Access Control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: `Role '${req.user.role}' is not authorized` });
    }
    next();
  };
};

module.exports = { protect, authorize };


