import { CareLinks } from "../components/CareLinks";
import { useState } from "react";
import { Link } from "react-router-dom";
import { card, careRole, clinicDate, field, useCareData } from "../components/careShared";

function changeDate(date, days) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function clock(time) {
  return time?.slice(0, 5) || "Time unavailable";
}

export default function ClinicCalendar() {
  const role = careRole();
  const allowed = role === "admin" || role === "doctor";
  const [date, setDate] = useState(clinicDate);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [revision, setRevision] = useState(0);
  const options = useCareData(allowed ? "care/options" : null);
  const centers = options.data?.centers || [];
  const centerId = selectedBranch || centers[0]?.id;
  const calendar = useCareData(centerId && date ? `care/calendar?${new URLSearchParams({ date, centerId })}` : null, revision);
  const day = calendar.data;

  return <section className="mx-auto max-w-6xl space-y-5 px-4 pb-12 pt-24">
    <h1 className="text-3xl font-bold text-green-950">Clinic calendar</h1>
    <CareLinks role={role} />
    {!allowed && <p>Sign in as a doctor or admin to view the calendar.</p>}
    {allowed && <>
      <div className="flex flex-wrap items-end gap-3">
        <label>Branch<select className={field} value={centerId || ""} onChange={(event) => setSelectedBranch(event.target.value)}>
          {centers.map((center) => <option key={center.id} value={center.id}>{center.name}</option>)}
        </select></label>
        <label>Date<input className={field} type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <button className="rounded-lg border px-3 py-2" disabled={!date} onClick={() => setDate(changeDate(date, -1))}>Previous day</button>
        <button className="rounded-lg border px-3 py-2" disabled={!date} onClick={() => setDate(changeDate(date, 1))}>Next day</button>
        <button className="rounded-lg border px-3 py-2" onClick={() => setRevision((value) => value + 1)}>Refresh</button>
      </div>
      {(options.error || calendar.error) && <p role="alert" className="text-red-700">{options.error || calendar.error}</p>}
      {centerId && date && !day && !calendar.error && <p role="status">Loading calendar…</p>}
      {day && <>
        <p className="font-medium text-green-950">{day.branch.name} · {day.branch.room_capacity} treatment rooms · India time</p>
        <div className="grid gap-4 md:grid-cols-2">
          <section className={card}>
            <h2 className="text-lg font-semibold">Shifts</h2>
            {day.shifts.length === 0 && <p>No shifts for this day.</p>}
            {day.shifts.map((shift) => <p key={shift.id}>{clock(shift.starts_at)}–{clock(shift.ends_at)} · {shift.doctor}</p>)}
          </section>
          <section className={card}>
            <h2 className="text-lg font-semibold">Leave</h2>
            {day.leave.length === 0 && <p>No leave recorded.</p>}
            {day.leave.map((leave) => <p key={leave.doctor_id}>{leave.doctor}</p>)}
          </section>
          <section className={card}>
            <h2 className="text-lg font-semibold">Appointments</h2>
            {day.appointments.length === 0 && <p>No appointments for this day.</p>}
            {day.appointments.map((appointment) => <p key={appointment.id}>
              {clock(appointment.time)} · {appointment.doctor || "Unassigned"} · {appointment.therapy || "Reserved appointment"}
              {appointment.duration_minutes && ` · ${appointment.duration_minutes} min`} · {(appointment.status || "pending").replaceAll("_", " ")}
              {appointment.plan_id && role === "doctor" && <> · <Link className="underline" to="/clinic/treatment-plans">Treatment plan</Link></>}
            </p>)}
          </section>
          <section className={card}>
            <h2 className="text-lg font-semibold">Waitlist holds</h2>
            {day.offers.length === 0 && <p>No active holds.</p>}
            {day.offers.map((offer) => <p key={offer.id}>{clock(offer.time)} · {offer.duration_minutes} min · held until {new Date(offer.expires_at).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })}</p>)}
          </section>
        </div>
      </>}
    </>}
  </section>;
}
