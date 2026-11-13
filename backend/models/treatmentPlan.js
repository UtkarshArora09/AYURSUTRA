const { clinicError, transaction, validId, validDate, validTime } = require("./clinicTransaction");
const { durationFor, findSlots, lockSchedule } = require("./clinicSchedule");
const { enqueue } = require("./notifications");

async function createPlan(doctorId, fields) {
  const { patientId, centerId, title, instructions = "", sessions } = fields;
  if (!validId(patientId) || !validId(centerId) || typeof title !== "string" || !title.trim() || title.length > 120 ||
      typeof instructions !== "string" || instructions.length > 4000 || !Array.isArray(sessions) ||
      sessions.length < 2 || sessions.length > 20 || !sessions.every((session) =>
        session && validDate(session.date) && validTime(session.time) &&
        typeof session.therapy === "string" && session.therapy.trim() && session.therapy.length <= 100)) {
    throw clinicError(400, "Enter a patient, branch, title and 2 to 20 valid sessions");
  }

  return transaction(async (client) => {
    await lockSchedule(client);
    const { rowCount } = await client.query(
      `SELECT 1 FROM therapy_bookings WHERE patient_id = $1 AND doctor_id = $2
       UNION ALL SELECT 1 FROM appointments WHERE patient_id = $1 AND doctor_id = $2 LIMIT 1`,
      [patientId, doctorId]
    );
    if (!rowCount) throw clinicError(404, "Patient is unavailable in your clinic schedule");
    const { rows: [plan] } = await client.query(
      "INSERT INTO treatment_plans(doctor_id, patient_id, center_id, title, instructions) VALUES ($1,$2,$3,$4,$5) RETURNING id",
      [doctorId, patientId, centerId, title.trim(), instructions.trim()]
    );
    for (const [index, session] of sessions.entries()) {
      const therapy = session.therapy.trim();
      const duration = await durationFor(client, therapy);
      const times = await findSlots(client, { doctorId, centerId, date: session.date, duration, patientId });
      if (!times.includes(session.time)) {
        throw clinicError(409, `Session ${index + 1} (${session.date} at ${session.time}) is unavailable. Choose another time.`);
      }
      const { rows: [booking] } = await client.query(
        `INSERT INTO therapy_bookings(patient_id, doctor_id, center_id, therapy_type, scheduled_date,
                                      scheduled_time, duration_minutes, status, treatment_plan_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'confirmed',$8) RETURNING *`,
        [patientId, doctorId, centerId, therapy, session.date, session.time, duration, plan.id]
      );
      await enqueue(client, booking, "confirmation");
    }
    await client.query(
      "INSERT INTO clinic_audit(actor_role, actor_id, action, resource_id) VALUES ('doctor',$1,'plan.create',$2)",
      [doctorId, String(plan.id)]
    );
    return plan;
  });
}

module.exports = { createPlan };
