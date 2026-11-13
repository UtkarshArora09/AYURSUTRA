import { useState } from "react";
import { CareLinks } from "../components/CareLinks";
import { button, card, careRequest, careRole, clinicDate, field, useCareData } from "../components/careShared";

const blankSession = { date: "", time: "", therapy: "" };
const progress = { completed: "Completed", no_show: "Missed", cancelled: "Cancelled" };

function Plan({ plan, doctor, changed }) {
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  async function update(path, fields) {
    setSaving(true);
    setFeedback("");
    try {
      await careRequest(path, "PATCH", fields);
      changed();
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setSaving(false);
    }
  }

  return <article className={card}>
    <h2 className="text-xl font-semibold">{plan.title}</h2>
    <p>{doctor ? plan.patient : plan.doctor} · {plan.branch}</p>
    <p>{plan.sessions.filter((session) => session.status === "completed").length} of {plan.sessions.length} completed · {plan.sessions.filter((session) => session.status === "no_show").length} missed</p>
    {plan.instructions && <p className="whitespace-pre-wrap">{plan.instructions}</p>}
    <ol className="divide-y">
      {plan.sessions.map((session) => <li className="space-y-2 py-3" key={session.id}>
        <p><strong>{session.therapy}</strong> · {session.date} {session.time?.slice(0, 5)} IST · {progress[session.status] || "Scheduled"}</p>
        {session.followUp && <p className="whitespace-pre-wrap">Session follow-up: {session.followUp}</p>}
        {doctor && session.status !== "cancelled" && <form className="flex flex-wrap items-end gap-2" onSubmit={(event) => {
          event.preventDefault();
          const data = Object.fromEntries(new FormData(event.currentTarget));
          update(`clinic/worklist/${session.id}`, { status: data.status || undefined, followUp: data.followUp });
        }}>
          <label>Session follow-up<input name="followUp" className={field} defaultValue={session.followUp || ""} maxLength={4000} /></label>
          {!progress[session.status] && <label>Outcome<select name="status" className={field} defaultValue="">
            <option value="">Keep scheduled</option><option value="completed">Completed</option><option value="no_show">Missed visit</option>
          </select></label>}
          <button className={button} disabled={saving}>Save session</button>
        </form>}
      </li>)}
    </ol>
    {doctor ? <form className="space-y-2" onSubmit={(event) => {
      event.preventDefault();
      update(`care/plans/${plan.id}`, Object.fromEntries(new FormData(event.currentTarget)));
    }}>
      <label>Course follow-up<textarea className={field} name="followUp" maxLength={4000} defaultValue={plan.follow_up} /></label>
      <button className={button} disabled={saving}>Save course follow-up</button>
    </form> : plan.follow_up && <p className="whitespace-pre-wrap">Course follow-up: {plan.follow_up}</p>}
    {feedback && <p role="alert" className="text-red-700">{feedback}</p>}
  </article>;
}

export default function TreatmentPlans() {
  const role = careRole();
  const doctor = role === "doctor";
  const allowed = doctor || role === "patient";
  const [revision, setRevision] = useState(0);
  const [sessions, setSessions] = useState([{ ...blankSession }, { ...blankSession }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const options = useCareData(doctor ? "care/options" : null);
  const plans = useCareData(allowed ? "care/plans" : null, revision);
  const reload = () => setRevision((value) => value + 1);

  async function create(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await careRequest("care/plans", "POST", { ...Object.fromEntries(new FormData(form)), sessions });
      form.reset();
      setSessions([{ ...blankSession }, { ...blankSession }]);
      setMessage("Treatment plan scheduled.");
      reload();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setSaving(false);
    }
  }

  function editSession(index, fieldName, value) {
    setSessions((current) => current.map((session, position) => position === index ? { ...session, [fieldName]: value } : session));
  }

  return <section className="mx-auto max-w-5xl space-y-5 px-4 pb-12 pt-24">
    <h1 className="text-3xl font-bold text-green-950">Treatment plans</h1>
    <CareLinks role={role} />
    {!allowed && <p>Sign in as a doctor or patient to view treatment plans.</p>}
    {(error || options.error || plans.error) && <p role="alert" className="text-red-700">{error || options.error || plans.error}</p>}
    {message && <p role="status" className="text-green-800">{message}</p>}
    {options.data && <form className={card} onSubmit={create}>
      <h2 className="text-xl font-semibold">Prescribe and schedule a course</h2>
      {options.data.patients.length === 0 && <p>Patients appear here after they have a booking or consultation with you.</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <label>Patient<select className={field} name="patientId" required defaultValue="">
          <option value="">Choose a patient</option>
          {options.data.patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name} · #{patient.id}</option>)}
        </select></label>
        <label>Branch<select className={field} name="centerId" required>
          {options.data.centers.map((center) => <option key={center.id} value={center.id}>{center.name}</option>)}
        </select></label>
        <label>Course title<input className={field} name="title" maxLength={120} required /></label>
        <label>Patient instructions<textarea className={field} name="instructions" maxLength={4000} /></label>
      </div>
      <datalist id="plan-therapies">{options.data.therapies.map(({ name }) => <option key={name} value={name} />)}</datalist>
      {sessions.map((session, index) => <fieldset className="grid items-end gap-3 rounded-lg border p-3 sm:grid-cols-4" key={index}>
        <legend className="px-1 font-medium">Session {index + 1}</legend>
        <label>Therapy<input required list="plan-therapies" className={field} maxLength={100} value={session.therapy} onChange={(event) => editSession(index, "therapy", event.target.value)} /></label>
        <label>Date<input required type="date" min={clinicDate()} className={field} value={session.date} onChange={(event) => editSession(index, "date", event.target.value)} /></label>
        <label>Time (IST)<input required type="time" className={field} value={session.time} onChange={(event) => editSession(index, "time", event.target.value)} /></label>
        {sessions.length > 2 && <button type="button" className="underline" onClick={() => setSessions((current) => current.filter((_, position) => position !== index))}>Remove</button>}
      </fieldset>)}
      <div className="flex gap-3">
        <button type="button" className="rounded-lg border px-3 py-2" disabled={sessions.length === 20 || saving} onClick={() => setSessions((current) => [...current, { ...blankSession }])}>Add session</button>
        <button className={button} disabled={saving || options.data.patients.length === 0}>Schedule course</button>
      </div>
    </form>}
    {plans.data?.length === 0 && <p>No treatment plans yet.</p>}
    {plans.data?.map((plan) => <Plan key={`${plan.id}-${revision}`} plan={plan} doctor={doctor} changed={reload} />)}
  </section>;
}
