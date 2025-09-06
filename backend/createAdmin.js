require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./config/db"); // your database connection

async function createAdmin() {
  const name = "Super Admin";
  const email = "admin@example.com";
  const password = "admin123"; // plain password
  const role = "admin";

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await db.query(
    `INSERT INTO admins (name, email, password, role, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     RETURNING *`,
    [name, email, hashedPassword, role]
  );

  console.log("Admin created:", result.rows[0]);
  process.exit();
}

createAdmin();