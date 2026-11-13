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
  const daysAhead = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
  const booking = {
    doctor_id: doctor.doctor_id, patient_id: other.id, therapy_type: "Basti",
    scheduled_date: daysAhead(7), scheduled_time: "10:30",
  };
  const created = await call("/api/bookings", {
    method: "POST", body: booking, token: patient.token, expected: 201,
  });
  assert.equal(created.data.patient_id, patient.id);
  const id = created.data.booking_id;
  const availability = await call(
    `/api/bookings/availability?doctorId=${doctor.doctor_id}&date=${booking.scheduled_date}`,
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

  await call("/api/queue?date=" + daysAhead(1), { token: patient.token, expected: 403 });
  const ticket = await call("/api/queue", {
    method: "POST", token: patient.token, expected: 201,
    body: { name: "Patient Test", phone: "0000000000", date: daysAhead(1), hospital: "Test", service: "Consultation" },
  });
  assert.equal(await call("/api/queue/mine", { token: other.token }), null);
  assert.equal((await call("/api/queue/mine", { token: patient.token })).position, "1");
  const queue = await call("/api/queue?date=" + daysAhead(1), { token: doctorLogin.token });
  assert.equal(queue[0].id, ticket.id);
  await call(`/api/queue/${ticket.id}`, {
    method: "PATCH", body: { action: "prioritize" }, token: doctorLogin.token, expected: 204,
  });
  assert.equal((await call("/api/queue/mine", { token: patient.token })).priority, "emergency");
  await call(`/api/queue/${ticket.id}`, { method: "DELETE", token: other.token, expected: 404 });
  await call(`/api/queue/${ticket.id}`, { method: "DELETE", token: patient.token, expected: 204 });
});
