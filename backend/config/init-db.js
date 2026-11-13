const { readdir, readFile } = require("node:fs/promises");
const path = require("node:path");
const pool = require("./db");

async function migrate() {
  const directory = path.join(__dirname, "../../database/migrations");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(478213)");
    await client.query("CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY)");
    const { rows } = await client.query("SELECT name FROM schema_migrations");
    const applied = new Set(rows.map(({ name }) => name));
    for (const name of (await readdir(directory)).filter((file) => file.endsWith(".sql")).sort()) {
      if (applied.has(name)) continue;
      await client.query(await readFile(path.join(directory, name), "utf8"));
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [name]);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = migrate;
