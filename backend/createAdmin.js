require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./config/db");
const migrate = require("./config/init-db");

async function createAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12 ||
      Buffer.byteLength(ADMIN_PASSWORD) > 72) {
    throw new Error("Set ADMIN_NAME, ADMIN_EMAIL and a password of at least 12 characters and at most 72 bytes");
  }
  await migrate();
  const { rowCount } = await db.query(
    "INSERT INTO admins (name, email, password) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING",
    [ADMIN_NAME, ADMIN_EMAIL.trim().toLowerCase(), await bcrypt.hash(ADMIN_PASSWORD, 12)]
  );
  console.log(rowCount ? "Admin account created" : "Admin account already exists");
}

createAdmin().catch((error) => {
  console.error(error.code || error.message);
  process.exitCode = 1;
}).finally(() => db.end());
