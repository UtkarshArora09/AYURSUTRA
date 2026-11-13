import { CareLinks } from "./CareLinks";
import { useEffect, useState } from "react";
import { authHeaders } from "../api/auth";

const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const field = "rounded border border-green-200 px-3 py-2";
const button = "rounded bg-green-800 px-3 py-2 text-white";

export default function ClinicAdmin() {
  const [schedule, setSchedule] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    Promise.all(["schedule", "metrics"].map(async (name) => {
      const response = await fetch(`${apiBase}/api/clinic/${name}`, { headers: authHeaders() });
      if (!response.ok) throw new Error("Clinic operations could not be loaded");
      return response.json();
    })).then(([nextSchedule, nextMetrics]) => {
      if (active) { setSchedule(nextSchedule); setMetrics(nextMetrics); }
    }).catch((error) => { if (active) setError(error.message); });
    return () => { active = false; };
  }, [version]);

  async function update(values) {
    setError("");
    try {
      const response = await fetch(`${apiBase}/api/clinic/schedule`, {
        method: "POST", headers: { ...authHeaders(), "Content-Type": "application/json" }, body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error((await response.json()).message);
      setVersion((value) => value + 1);
    } catch (error) { setError(error.message); }
  }

  function submit(event, type) {
    event.preventDefault();
    update({ ...Object.fromEntries(new FormData(event.currentTarget)), type });
  }

  return (
    <section className="mx-auto max-w-6xl space-y-4 px-4 pb-12">
      <h2 className="text-2xl font-bold">Clinic operations</h2>
      <CareLinks role="admin" />
      {error && <p role="alert" className="text-red-700">{error}</p>}
      {metrics && <div className="grid gap-3 sm:grid-cols-3">
        <p className="rounded border p-4">Average wait (30 days) <strong>{metrics.wait_minutes == null ? "—" : `${metrics.wait_minutes} min`}</strong></p>
        <p className="rounded border p-4">No-shows (30 days) <strong>{metrics.no_shows}</strong></p>
        <p className="rounded border p-4">Staff time used (30 days) <strong>{Number(metrics.scheduled_minutes) ? `${Math.round(100 * metrics.used_minutes / metrics.scheduled_minutes)}%` : "—"}</strong></p>
      </div>}
      {schedule && <>
        <form className="flex flex-wrap items-end gap-3 rounded border p-4" onSubmit={(event) => submit(event, "shift")}>
          <label>Doctor ID<select className={`${field} block`} name="doctorId" required><option value="">Select doctor</option>{schedule.doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}</select></label>
          <label>Branch<select className={`${field} block`} name="centerId">{schedule.centers.map((center) => <option key={center.id} value={center.id}>{center.name}</option>)}</select></label>
          <label>Weekday<select className={`${field} block`} name="weekday">{weekdays.map((day, index) => <option key={day} value={index}>{day}</option>)}</select></label>
          <label>From<input className={`${field} block`} name="start" type="time" required /></label>
          <label>Until<input className={`${field} block`} name="end" type="time" required /></label>
          <button className={button}>Save shift</button>
        </form>
        {schedule.shifts.map((shift) => <p key={shift.id}>{shift.name} · {weekdays[shift.weekday]} · {shift.starts_at.slice(0, 5)}–{shift.ends_at.slice(0, 5)} · {schedule.centers.find((center) => center.id === shift.center_id)?.name} <button className="underline" onClick={() => update({ type: "remove-shift", shiftId: shift.id })}>Remove</button></p>)}
        <form className="flex flex-wrap items-end gap-3 rounded border p-4" onSubmit={(event) => submit(event, "leave")}>
          <label>Doctor ID<select className={`${field} block`} name="doctorId" required><option value="">Select doctor</option>{schedule.doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}</select></label>
          <label>Leave date<input className={`${field} block`} name="date" type="date" required /></label>
          <button className={button}>Add leave</button>
        </form>
        {schedule.leave.map((leave) => <p key={`${leave.doctor_id}-${leave.date}`}>{leave.name} · {leave.date} <button className="underline" onClick={() => update({ type: "remove-leave", doctorId: leave.doctor_id, date: leave.date })}>Remove</button></p>)}
        <form className="flex flex-wrap items-end gap-3 rounded border p-4" onSubmit={(event) => submit(event, "therapy")}>
          <label>Therapy<input className={`${field} block`} name="name" list="clinic-therapies" maxLength={100} required /></label>
          <datalist id="clinic-therapies">{schedule.therapies.map((therapy) => <option key={therapy.id} value={therapy.name} />)}</datalist>
          <label>Minutes<input className={`${field} block`} type="number" name="duration" min="15" max="480" required /></label>
          <button className={button}>Save therapy duration</button>
        </form>
        {schedule.centers.map((center) => <form key={`${center.id}-${center.room_capacity}`} className="flex items-end gap-3" onSubmit={(event) => submit(event, "capacity")}>
          <input type="hidden" name="centerId" value={center.id} />
          <label>{center.name} rooms<input className={`${field} block`} type="number" min="1" name="capacity" required defaultValue={center.room_capacity} /></label>
          <button className={button}>Save capacity</button>
        </form>)}
      </>}
    </section>
  );
}
