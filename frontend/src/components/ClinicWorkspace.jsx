import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authHeaders } from "../api/auth";

const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const input = "rounded-lg border border-green-200 bg-white px-3 py-2";
const button = "rounded-lg bg-green-800 px-3 py-2 font-medium text-white";
const panel = "rounded-xl border border-green-100 bg-white p-5 shadow-sm";

async function request(path, options = {}) {
  const response = await fetch(apiBase + path, {
    ...options, headers: { ...authHeaders(), ...options.headers },
  });
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).message || "Unable to complete this request");
  return response;
}

function send(path, body, method = "POST") {
  return request(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

function Session({ session, role, therapists, reload, setError, reportsOnly }) {
  const patient = role === "patient";
  const doctor = role === "doctor";
  const [invoiceCreated, setInvoiceCreated] = useState(false);
  const save = async (event) => {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const payload = { followUp: fields.followUp, sessionNotes: fields.sessionNotes, status: fields.status || undefined };
    if (doctor) {
      payload.preparation = fields.preparation;
      payload.therapistId = fields.therapistId || null;
    }
    try {
      await send(`/api/clinic/worklist/${session.booking_id}`, payload, "PATCH");
      reload();
    } catch (error) { setError(error.message); }
  };
  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await request(`/api/clinic/reports/${session.booking_id}?filename=${encodeURIComponent(file.name)}`, {
        method: "POST", headers: { "Content-Type": "application/pdf" }, body: file,
      });
      reload();
    } catch (error) { setError(error.message); }
    event.target.value = "";
  };
  const download = async (report) => {
    try {
      const response = await request(`/api/clinic/reports/${report.id}`);
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = report.name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) { setError(error.message); }
  };

  return (
    <article className={panel}>
      <h2 className="text-lg font-semibold">{session.therapy_type}{session.patient && ` · ${session.patient}`}</h2>
      <p className="text-sm text-green-800">{session.date} {session.time?.slice(0, 5)} · {session.duration_minutes} min · {(session.status || "pending").replaceAll("_", " ")}</p>
      {!reportsOnly && (
        <>
          {session.preparation && <p className="mt-3 whitespace-pre-wrap"><strong>Preparation</strong> {session.preparation}</p>}
          {session.follow_up && <p className="mt-2 whitespace-pre-wrap"><strong>Follow-up</strong> {session.follow_up}</p>}
          {!patient && !["cancelled", "completed", "no_show"].includes(session.status) && (
            <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={save}>
              {doctor && <label>Preparation<textarea name="preparation" maxLength={4000} className={`${input} block w-full`} defaultValue={session.preparation || ""} /></label>}
              <label>Internal session notes<textarea name="sessionNotes" maxLength={4000} className={`${input} block w-full`} defaultValue={session.session_notes || ""} /></label>
              <label>Follow-up<textarea name="followUp" maxLength={4000} className={`${input} block w-full`} defaultValue={session.follow_up || ""} /></label>
              {doctor && <label>Assigned therapist<select className={`${input} block w-full`} name="therapistId" defaultValue={session.therapist_id || ""}>
                <option value="">Unassigned</option>
                {therapists.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
              </select></label>}
              <label>Status<select className={`${input} block w-full`} name="status" defaultValue="">
                <option value="">Keep current status</option>
                {doctor && <option value="confirmed">Confirmed</option>}
                <option value="completed">Completed</option>
                <option value="no_show">No-show</option>
              </select></label>
              <button className={button}>Save session</button>
            </form>
          )}
          {session.invoices?.map((invoice) => <p key={invoice.id} className="mt-2">Invoice #{invoice.id} · ₹{invoice.amount} · {invoice.status}</p>)}
        </>
      )}
      {doctor && !reportsOnly && <form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const amount = new FormData(form).get("amount");
        try {
          await send("/api/billing", { patient_id: session.patient_id, booking_id: session.booking_id, amount, status: "pending" });
          form.reset();
          setInvoiceCreated(true);
          setError("");
        } catch (error) { setError(error.message); }
      }}>
        <label>Invoice amount (₹)<input className={`${input} block`} name="amount" type="number" min="0.01" step="0.01" required /></label>
        <button className={button}>Create invoice</button>
        {invoiceCreated && <p role="status">Invoice created.</p>}
      </form>}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {session.reports?.map((report) => <button className="text-green-800 underline" key={report.id} onClick={() => download(report)}>{report.name}</button>)}
        {doctor && <label className="text-sm">Upload report <input type="file" accept="application/pdf,.pdf" onChange={upload} /></label>}
        {!doctor && reportsOnly && !session.reports?.length && <p>No reports for this session.</p>}
      </div>
    </article>
  );
}

export default function ClinicWorkspace({ reportsOnly = false, embedded = false }) {
  const [role] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ayursutra_user"))?.role?.toLowerCase(); }
    catch { return null; }
  });
  const [sessions, setSessions] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [offset, setOffset] = useState(0);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState("");
  const allowed = ["patient", "doctor", "therapist"].includes(role);
  useEffect(() => {
    if (!allowed) return;
    let active = true;
    const load = async () => {
      try {
        const [list, people, visits] = await Promise.all([
          request(`/api/clinic/worklist?offset=${offset}`).then((response) => response.json()),
          role === "doctor" ? request("/api/clinic/therapists").then((response) => response.json()) : [],
          role === "doctor" && !reportsOnly ? request("/api/appointments").then((response) => response.json()) : [],
        ]);
        if (active) { setSessions(list); setTherapists(people); setAppointments(visits); setError(""); }
      } catch (error) { if (active) setError(error.message); }
    };
    load();
    return () => { active = false; };
  }, [allowed, offset, role, version, reportsOnly]);

  if (!allowed && embedded) return null;
  return (
    <section className={`mx-auto max-w-5xl space-y-4 px-4 pb-10 ${embedded ? "" : "pt-24"}`}>
      <h1 className="text-2xl font-bold text-green-950">{reportsOnly ? "Medical reports" : role === "doctor" ? "Clinic schedule" : role === "therapist" ? "Assigned sessions" : "Your care timeline"}</h1>
      {!allowed && <p>Sign in to view your clinic workspace.</p>}
      {role === "doctor" && !reportsOnly && <Link className="underline text-green-800" to="/queue/manage">Manage the consultation queue</Link>}
      {error && <p role="alert" className="text-red-700">{error}</p>}
      {allowed && !sessions && !error && <p>Loading sessions…</p>}
      {sessions?.length === 0 && <p>No sessions on this page.</p>}
      {appointments.length > 0 && <div className={panel}><h2 className="font-semibold">Consultations</h2>
        {appointments.map((visit) => <p key={visit.appointment_id}>{new Date(visit.appointment_date).toLocaleString()} · {visit.status}</p>)}
      </div>}
      {sessions?.map((session) => <Session key={`${session.booking_id}-${version}`} session={session} role={role} therapists={therapists} reportsOnly={reportsOnly} reload={() => setVersion((value) => value + 1)} setError={setError} />)}
      {sessions && <div className="flex gap-4">
        <button disabled={!offset} onClick={() => setOffset(offset - 50)}>Previous</button>
        <button disabled={sessions.length < 50} onClick={() => setOffset(offset + 50)}>Next</button>
      </div>}
    </section>
  );
}
