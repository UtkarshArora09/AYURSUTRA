const db = require("../config/db");

function clinicError(status, message) {
  return Object.assign(new Error(message), { status });
}

async function transaction(work) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

function validId(value) {
  return /^\d+$/.test(String(value)) && Number(value) > 0 && Number(value) <= 2147483647;
}

function validDate(value) {
  if (typeof value !== "string" || !/^[1-9]\d{3}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validTime(value) {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

module.exports = { clinicError, transaction, validId, validDate, validTime };
