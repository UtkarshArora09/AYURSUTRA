const { test } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const { start } = require("../server");
const migrate = require("../config/init-db");
const db = require("../config/db");

test("fresh database and authorized clinic workflows", async (t) => {
  const server = await start();
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await db.end();
  });
  if (!server.listening) await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (path, { method = "GET", body, token, expected = 200 } = {}) => {
    const response = await fetch(base + path, {
      method,
      headers: {
        ...(body && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body && JSON.stringify(body),
    });
    const data = response.status === 204 ? null : await response.json();
    assert.equal(response.status, expected, `${method} ${path} (${JSON.stringify(data)})`);
    return data;
  };

  await migrate();
  assert.equal((await db.query("SELECT COUNT(*) FROM admins")).rows[0].count, "0");
  await call("/health/ready");

  const suffix = Date.now();
  const password = "Demo-Password-42!";
  const register = async (name) => {
    const email = `${name.toLowerCase()}-${suffix}@example.invalid`;
    const profile = await call("/api/patients/auth/register", {
      method: "POST", expected: 201,
      body: {
        firstName: name, lastName: "Test", dob: "1990-01-01", age: 36, gender: "Other",
        email, password, mobNumber: "0000000000", aadharNumber: "000000000000",
        bloodGroup: "O+", emergencyContactName: "Test", emergencyContactNumber: "0000000000",
      },
    });
    assert.deepEqual(Object.keys(profile).sort(), ["first_name", "patient_id"]);
    const login = await call("/api/patients/auth/login", { method: "POST", body: { email, password } });
    assert.equal(login.patient.password, undefined);
    assert.equal(login.patient.reset_token, undefined);
    return { id: profile.patient_id, token: login.token };
  };
  const patient = await register("Primary");
  const other = await register("Other");
  await call(`/api/patients/${patient.id}`, { expected: 401 });
  await call(`/api/patients/${patient.id}`, { token: other.token, expected: 404 });
  await call(`/api/patients/${patient.id}`, {
    token: patient.token, method: "PUT", body: { role: "admin" }, expected: 400,
  });
  const profile = await call(`/api/patients/${patient.id}`, { token: patient.token });
  assert.equal(profile.first_name, "Primary");
  assert.equal(profile.aadhar_number, undefined);

  const { rows: [doctor] } = await db.query(
    "INSERT INTO doctors (name, email, password) VALUES ($1, $2, $3) RETURNING doctor_id",
    ["Doctor Test", `doctor-${suffix}@example.invalid`, await bcrypt.hash(password, 10)]
  );
  await db.query(
    "INSERT INTO clinic_shifts(doctor_id, center_id, weekday, starts_at, ends_at) SELECT $1, 2, day, '09:00', '18:30' FROM generate_series(0, 6) day",
    [doctor.doctor_id]
  );
  const daysAhead = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
  const booking = {
    doctor_id: doctor.doctor_id, patient_id: other.id, therapy_type: "Basti", center_id: 2,
    scheduled_date: daysAhead(7), scheduled_time: "10:30",
  };
  const created = await call("/api/bookings", {
    method: "POST", body: booking, token: patient.token, expected: 201,
  });
  assert.equal(created.data.patient_id, patient.id);
  const id = created.data.booking_id;
  const availability = await call(
    `/api/bookings/availability?doctorId=${doctor.doctor_id}&centerId=2&date=${booking.scheduled_date}`,
    { token: patient.token }
  );
  assert.ok(availability.includes("12:00"));
  assert.ok(!availability.includes("10:30"));
  const doctorLogin = await call("/api/doctors/auth/login", {
    method: "POST", body: { email: `doctor-${suffix}@example.invalid`, password },
  });
  await call("/api/billing", {
    method: "POST", token: doctorLogin.token, expected: 201,
    body: { patient_id: patient.id, booking_id: id, amount: 100, status: "pending" },
  });
  assert.equal((await call("/api/billing", { token: patient.token })).length, 1);
  assert.deepEqual(await call("/api/billing", { token: other.token }), []);
  const record = await call("/api/records", {
    method: "POST", token: doctorLogin.token, expected: 201,
    body: { patient_id: patient.id, diagnosis: "Synthetic test record" },
  });
  await call(`/api/records/${record.id}`, { token: doctorLogin.token });
  await call(`/api/records/${record.id}`, { token: patient.token, expected: 403 });
  await call(`/api/bookings/${id}`, { token: other.token, expected: 404 });
  await call("/api/bookings/search", { method: "POST", body: { booking_id: id }, token: other.token, expected: 404 });
  const result = await call("/api/bookings/search", {
    method: "POST", body: { booking_id: id }, token: patient.token,
  });
  assert.equal(result.currentDate, booking.scheduled_date);
  assert.equal(result.canReschedule, true);
  await call("/api/bookings", { method: "POST", body: booking, token: other.token, expected: 409 });
  await call(`/api/bookings/${id}/reschedule`, {
    method: "PUT", body: { new_date: daysAhead(8), new_time: "14:00" }, token: patient.token,
  });
  await call(`/api/bookings/${id}/cancel`, { method: "PUT", token: other.token, expected: 404 });
  await call(`/api/bookings/${id}/cancel`, { method: "PUT", token: patient.token });
  const retry = await call(`/api/bookings/${id}/cancel`, { method: "PUT", token: patient.token });
  assert.equal(retry.data.status, "cancelled");

  const competingBooking = { ...booking, scheduled_date: daysAhead(9) };
  const competing = await Promise.all([patient, other].map(({ token }) =>
    fetch(base + "/api/bookings", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(competingBooking),
    })
  ));
  assert.deepEqual(competing.map(({ status }) => status).sort(), [201, 409]);
  await Promise.all(competing.map((response) => response.json()));
  const near = await call("/api/bookings", {
    method: "POST", token: patient.token, expected: 201,
    body: { ...booking, scheduled_date: daysAhead(1), scheduled_time: "09:00" },
  });
  await call(`/api/bookings/${near.data.booking_id}/reschedule`, {
    method: "PUT", token: patient.token, expected: 409,
    body: { new_date: daysAhead(10), new_time: "09:00" },
  });

  const appointment = await call("/api/appointments", {
    method: "POST", token: patient.token, expected: 201,
    body: { doctor_id: doctor.doctor_id, appointment_date: `${daysAhead(7)}T10:00:00` },
  });
  await call(`/api/appointments/${appointment.appointment.appointment_id}`, { token: patient.token });
  await call(`/api/appointments/${appointment.appointment.appointment_id}`, { token: other.token, expected: 404 });

  await call("/api/queue?hospital=Test&service=Consultation&date=" + daysAhead(1), { token: patient.token, expected: 403 });
  const ticket = await call("/api/queue", {
    method: "POST", token: patient.token, expected: 201,
    body: { name: "Patient Test", phone: "0000000000", date: daysAhead(1), hospital: "Test", service: "Consultation" },
  });
  assert.equal(await call("/api/queue/mine", { token: other.token }), null);
  assert.equal((await call("/api/queue/mine", { token: patient.token })).position, "1");
  const queue = await call("/api/queue?hospital=Test&service=Consultation&date=" + daysAhead(1), { token: doctorLogin.token });
  assert.equal(queue[0].id, ticket.id);
  await call(`/api/queue/${ticket.id}`, {
    method: "PATCH", body: { action: "prioritize" }, token: doctorLogin.token, expected: 204,
  });
  assert.equal((await call("/api/queue/mine", { token: patient.token })).priority, "emergency");
  await call(`/api/queue/${ticket.id}`, { method: "DELETE", token: other.token, expected: 404 });
  await call(`/api/queue/${ticket.id}`, { method: "DELETE", token: patient.token, expected: 204 });

  await db.query("INSERT INTO admins (name, email, password) VALUES ($1, $2, $3)",
    ["Admin Test", `admin-${suffix}@example.invalid`, await bcrypt.hash(password, 10)]);
  const admin = await call("/api/admin/auth/login", {
    method: "POST", body: { email: `admin-${suffix}@example.invalid`, password },
  });
  const scheduleDate = daysAhead(13);
  const weekday = new Date(scheduleDate).getUTCDay();
  const manage = (body) => call("/api/clinic/schedule", { token: admin.token, method: "POST", body, expected: 204 });
  await manage({ type: "shift", doctorId: doctor.doctor_id, centerId: 1, weekday, start: "09:00", end: "12:00" });
  const slots = () => call(`/api/bookings/availability?doctorId=${doctor.doctor_id}&centerId=1&date=${scheduleDate}&therapy=Basti`, { token: patient.token });
  await manage({ type: "therapy", name: "Basti", duration: 60 });
  assert.ok((await slots()).includes("09:15"));
  await manage({ type: "leave", doctorId: doctor.doctor_id, date: scheduleDate });
  assert.deepEqual(await slots(), []);
  await manage({ type: "remove-leave", doctorId: doctor.doctor_id, date: scheduleDate });
  const scheduled = await call("/api/bookings", {
    method: "POST", token: patient.token, expected: 201,
    body: { ...booking, center_id: 1, scheduled_date: scheduleDate, scheduled_time: "09:15" },
  });
  assert.equal(scheduled.data.duration_minutes, 60);
  assert.ok(!(await slots()).includes("09:00"));
  assert.ok((await slots()).includes("10:15"));
  const sessionId = scheduled.data.booking_id;
  await call(`/api/clinic/worklist/${sessionId}`, {
    method: "PATCH", token: doctorLogin.token, body: { preparation: "Synthetic preparation", sessionNotes: "Internal only" }, expected: 204,
  });
  const timeline = await call("/api/clinic/worklist", { token: patient.token });
  assert.equal(timeline.find((item) => item.booking_id === sessionId).preparation, "Synthetic preparation");
  assert.equal(timeline.find((item) => item.booking_id === sessionId).session_notes, null);
  assert.equal((await call(`/api/bookings/${sessionId}`, { token: patient.token })).session_notes, undefined);
  const pdf = "%PDF-1.4 synthetic report";
  const upload = await fetch(base + `/api/clinic/reports/${sessionId}?filename=test.pdf`, {
    method: "POST", headers: { Authorization: `Bearer ${doctorLogin.token}`, "Content-Type": "application/pdf" }, body: pdf,
  });
  assert.equal(upload.status, 201);
  const report = (await call("/api/clinic/worklist", { token: patient.token }))
    .find((item) => item.booking_id === sessionId).reports[0];
  const download = await fetch(base + `/api/clinic/reports/${report.id}`, { headers: { Authorization: `Bearer ${patient.token}` } });
  assert.equal(await download.text(), pdf);
  await call(`/api/clinic/reports/${report.id}`, { token: other.token, expected: 404 });
  const otherTimeline = await call("/api/clinic/worklist", { token: other.token });
  assert.ok(otherTimeline.every((item) => item.booking_id !== sessionId));
  await call("/api/clinic/metrics", { token: admin.token });
  const directory = await call("/api/admin/patients?search=Primary", { token: admin.token });
  assert.equal(directory.patients[0].patient_id, patient.id);
  const jobs = await db.query("SELECT kind FROM clinic_notifications WHERE booking_id = $1 ORDER BY id", [sessionId]);
  assert.deepEqual(jobs.rows.map(({ kind }) => kind), ["confirmation", "reminder"]);

  const queued = await call("/api/queue", {
    method: "POST", token: other.token, expected: 201,
    body: { name: "Queue Test", phone: "0000000000", date: daysAhead(1), hospital: "Test", service: "Consultation" },
  });
  await call(`/api/queue/${queued.id}/date`, {
    method: "PUT", token: other.token, body: { date: daysAhead(2) }, expected: 204,
  });
  const stream = new AbortController();
  t.after(() => stream.abort());
  const events = await fetch(base + "/api/queue/events", {
    headers: { Authorization: `Bearer ${other.token}` }, signal: AbortSignal.any([stream.signal, AbortSignal.timeout(8000)]),
  });
  assert.equal(events.status, 200);
  const reader = events.body.getReader();
  assert.match(Buffer.from((await reader.read()).value).toString(), /data: refresh/);
  for (const action of ["call", "serve"]) {
    await call(`/api/queue/${queued.id}`, {
      method: "PATCH", token: doctorLogin.token, body: { action }, expected: 204,
    });
    assert.match(Buffer.from((await reader.read()).value).toString(), /data: refresh/);
  }
  stream.abort();
  const served = await call("/api/queue/mine", { token: other.token });
  assert.equal(served.status, "served");
});
