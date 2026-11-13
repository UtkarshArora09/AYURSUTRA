const { Pool } = require("pg");

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false } // needed for cloud DBs (Heroku, Railway, Supabase)
      : false,
});

module.exports = pool;
