const db = require("../config/db");
const nodemailer = require("nodemailer");

async function enqueue(client, booking, kind) {
  await client.query(
    "UPDATE clinic_notifications SET discarded_at = now() WHERE booking_id = $1 AND kind = 'reminder' AND sent_at IS NULL AND discarded_at IS NULL",
    [booking.booking_id]
  );
  await client.query("INSERT INTO clinic_notifications(booking_id, kind) VALUES ($1, $2)", [booking.booking_id, kind]);
  if (kind !== "cancellation") {
    await client.query(
      `INSERT INTO clinic_notifications(booking_id, kind, available_at)
       SELECT booking_id, 'reminder', ((scheduled_date + scheduled_time) AT TIME ZONE 'Asia/Kolkata') - interval '24 hours'
       FROM therapy_bookings WHERE booking_id = $1
       AND ((scheduled_date + scheduled_time) AT TIME ZONE 'Asia/Kolkata') > now() + interval '24 hours'`,
      [booking.booking_id]
    );
  }
}

function startNotifications(server) {
  const { EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS || process.env.NODE_ENV === "test") return;
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    connectionTimeout: 10000,
    socketTimeout: 15000,
  });
  let running = false;
  const deliver = async () => {
    if (running) return;
    running = true;
    let client;
    try {
      client = await db.connect();
      await client.query("BEGIN");
      const { rows: [job] } = await client.query(
        `SELECT n.id, n.kind, p.email FROM clinic_notifications n
         JOIN therapy_bookings b USING (booking_id) JOIN patients p USING (patient_id)
         WHERE n.sent_at IS NULL AND n.discarded_at IS NULL AND n.available_at <= now()
         ORDER BY n.available_at, n.id LIMIT 1 FOR UPDATE OF n SKIP LOCKED`
      );
      if (job) {
        try {
          await transport.sendMail({
            from: EMAIL_USER, to: job.email,
            subject: "AyurSutra appointment update",
            text: `Your appointment has a new ${job.kind} update. Sign in to AyurSutra to view the details.`,
          });
          await client.query("UPDATE clinic_notifications SET sent_at = now() WHERE id = $1", [job.id]);
        } catch {
          await client.query(
            `UPDATE clinic_notifications SET attempts = attempts + 1,
               available_at = now() + make_interval(mins => 5 * (attempts + 1)),
               discarded_at = CASE WHEN attempts >= 5 THEN now() END WHERE id = $1`, [job.id]
          );
        }
      }
      await client.query("COMMIT");
    } catch {
      await client?.query("ROLLBACK").catch(() => {});
      console.error("Appointment notification worker failed");
    } finally {
      client?.release();
      running = false;
    }
  };
  const timer = setInterval(deliver, 10000);
  timer.unref();
  server.once("close", () => clearInterval(timer));
}

module.exports = { enqueue, startNotifications };
