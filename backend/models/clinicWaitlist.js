const { clinicError, transaction } = require("./clinicTransaction");
const { durationFor, findSlots, lockSchedule } = require("./clinicSchedule");
const { enqueue } = require("./notifications");

async function offerReleasedSlot(client, slot) {
  if (!slot.doctor_id || !slot.center_id || !slot.date || !slot.time) return;
  const { rows } = await client.query(
    `SELECT id, patient_id, therapy FROM clinic_waitlist
     WHERE status = 'waiting' AND doctor_id = $1 AND center_id = $2
       AND earliest <= $3 AND latest >= $3 ORDER BY id`,
    [slot.doctor_id, slot.center_id, slot.date]
  );
  for (const entry of rows) {
    const duration = await durationFor(client, entry.therapy);
    const times = await findSlots(client, {
      doctorId: slot.doctor_id, centerId: slot.center_id, date: slot.date, duration, patientId: entry.patient_id,
    });
    if (!times.includes(slot.time)) continue;
    const { rowCount } = await client.query(
      `INSERT INTO clinic_waitlist_offers(entry_id, scheduled_date, scheduled_time, duration_minutes, expires_at)
       SELECT $1, $2, $3, $4, LEAST(clock_timestamp() + interval '2 hours',
         (($2::date + $3::time) AT TIME ZONE 'Asia/Kolkata') - interval '15 minutes')
       WHERE (($2::date + $3::time) AT TIME ZONE 'Asia/Kolkata') > clock_timestamp() + interval '15 minutes'`,
      [entry.id, slot.date, slot.time, duration]
    );
    if (rowCount) await client.query("UPDATE clinic_waitlist SET status = 'offered' WHERE id = $1", [entry.id]);
    return;
  }
}

async function expireOffers() {
  await transaction(async (client) => {
    await lockSchedule(client);
    const { rows } = await client.query(
      `WITH expired AS (
         UPDATE clinic_waitlist_offers SET closed_at = now()
         WHERE closed_at IS NULL AND expires_at <= clock_timestamp()
         RETURNING entry_id, scheduled_date::text AS date, to_char(scheduled_time, 'HH24:MI') AS time
       )
       UPDATE clinic_waitlist w SET status = 'expired' FROM expired
       WHERE w.id = expired.entry_id RETURNING w.doctor_id, w.center_id, expired.date, expired.time`
    );
    for (const slot of rows) await offerReleasedSlot(client, slot);
  });
}

async function respond(patientId, id, action) {
  return transaction(async (client) => {
    await lockSchedule(client);
    const { rows: [entry] } = await client.query(
      `SELECT w.*, o.id AS offer_id, o.booking_id, o.expires_at > clock_timestamp() AS open,
              o.scheduled_date::text AS date, to_char(o.scheduled_time, 'HH24:MI') AS time, o.duration_minutes
       FROM clinic_waitlist w LEFT JOIN clinic_waitlist_offers o ON o.entry_id = w.id
       WHERE w.id = $1 AND w.patient_id = $2`,
      [id, patientId]
    );
    if (!entry) throw clinicError(404, "Waitlist entry unavailable");
    if (action === "accept" && entry.status === "accepted") return { bookingId: entry.booking_id };
    if (action === "withdraw" && entry.status === "withdrawn") return {};
    if (!["waiting", "offered"].includes(entry.status)) throw clinicError(409, "This waitlist entry is closed");

    if (action === "withdraw") {
      await client.query("UPDATE clinic_waitlist SET status = 'withdrawn' WHERE id = $1", [id]);
      if (entry.offer_id) {
        await client.query("UPDATE clinic_waitlist_offers SET closed_at = now() WHERE id = $1", [entry.offer_id]);
        await offerReleasedSlot(client, entry);
      }
      return {};
    }

    if (entry.status !== "offered" || !entry.open) throw clinicError(409, "The offer is no longer open");
    if (action === "decline") {
      await client.query("UPDATE clinic_waitlist SET status = 'declined' WHERE id = $1", [id]);
      await client.query("UPDATE clinic_waitlist_offers SET closed_at = now() WHERE id = $1", [entry.offer_id]);
      await offerReleasedSlot(client, entry);
      return {};
    }
    const times = await findSlots(client, {
      doctorId: entry.doctor_id, centerId: entry.center_id, date: entry.date, duration: entry.duration_minutes,
      offerId: entry.offer_id, patientId,
    });
    if (!times.includes(entry.time)) throw clinicError(409, "This time is no longer available");
    const { rows: [booking] } = await client.query(
      `INSERT INTO therapy_bookings(patient_id, doctor_id, center_id, therapy_type, scheduled_date, scheduled_time, duration_minutes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'confirmed') RETURNING *`,
      [patientId, entry.doctor_id, entry.center_id, entry.therapy, entry.date, entry.time, entry.duration_minutes]
    );
    await enqueue(client, booking, "confirmation");
    await client.query("UPDATE clinic_waitlist_offers SET closed_at = now(), booking_id = $2 WHERE id = $1", [entry.offer_id, booking.booking_id]);
    await client.query("UPDATE clinic_waitlist SET status = 'accepted' WHERE id = $1", [id]);
    return { bookingId: booking.booking_id };
  });
}

function startWaitlistWorker(server) {
  let active = false;
  const timer = setInterval(async () => {
    if (active) return;
    active = true;
    try {
      await expireOffers();
    } catch (error) {
      console.error("Waitlist expiry failed:", error.code || error.name);
    } finally {
      active = false;
    }
  }, 30000);
  timer.unref();
  server.once("close", () => clearInterval(timer));
}

module.exports = { offerReleasedSlot, respond, startWaitlistWorker };
