const { Pool } = require("pg");

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false } // needed for cloud DBs (Heroku, Railway, Supabase)
      : false,
});

// Test connection
pool
  .connect()
  .then((client) => {
    console.log(" PostgreSQL connected");
    client.release();
  })
  .catch((err) => {
    console.error(" PostgreSQL connection error:", err.stack);
  });

module.exports = pool;
