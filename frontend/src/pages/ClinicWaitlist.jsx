import { CareLinks } from "../components/CareLinks";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { button, card, careRequest, careRole, clinicDate, field, useCareData } from "../components/careShared";

export default function ClinicWaitlist() {
  const role = careRole();
  const [query] = useSearchParams();
  const [revision, setRevision] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const options = useCareData(role === "patient" ? "care/options" : null);
  const entries = useCareData(role === "patient" ? "care/waitlist" : null, revision);
  const date = query.get("date") || clinicDate();

  useEffect(() => {
    if (role !== "patient") return;
    const timer = setInterval(() => setRevision((value) => value + 1), 30000);
    return () => clearInterval(timer);
  }, [role]);

  async function submit(path, body, success) {
    setPending(true);
    setError("");
    setMessage("");
    try {
      const result = await careRequest(path, "POST", body);
      setMessage(result?.bookingId ? `Offer accepted. Booking #${result.bookingId} appears in your care timeline.` : success);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setRevision((value) => value + 1);
      setPending(false);
    }
  }

  return <section className="mx-auto max-w-4xl space-y-5 px-4 pb-12 pt-24">
    <h1 className="text-3xl font-bold text-green-950">Waitlist and offers</h1>
    <CareLinks role={role} />
    {role !== "patient" && <p>Sign in as a patient to join the waitlist.</p>}
    {(error || options.error || entries.error) && <p role="alert" className="text-red-700">{error || options.error || entries.error}</p>}
    {message && <p role="status" className="text-green-800">{message}</p>}
    {options.data && <form className={card} onSubmit={(event) => {
      event.preventDefault();
      submit("care/waitlist", Object.fromEntries(new FormData(event.currentTarget)), "You joined the waitlist.");
    }}>
      <p>Choose a date range. If an appointment opens and your request is first in line, the slot is held for you for up to two hours.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>Doctor<select name="doctorId" className={field} required defaultValue={query.get("doctorId") || ""}>
          <option value="">Choose a doctor</option>
          {options.data.doctors.map((doctor) => <option value={doctor.id} key={doctor.id}>{doctor.name}</option>)}
        </select></label>
        <label>Branch<select name="centerId" className={field} required defaultValue={query.get("centerId") || ""}>
          <option value="">Choose a branch</option>
          {options.data.centers.map((center) => <option value={center.id} key={center.id}>{center.name}</option>)}
        </select></label>
        <label>Therapy<input name="therapy" className={field} maxLength={100} required list="waitlist-therapies" defaultValue={query.get("therapy") || ""} /></label>
        <datalist id="waitlist-therapies">{options.data.therapies.map(({ name }) => <option value={name} key={name} />)}</datalist>
        <label>From<input name="earliest" type="date" className={field} min={clinicDate()} required defaultValue={date} /></label>
        <label>Through<input name="latest" type="date" className={field} min={clinicDate()} required defaultValue={date} /></label>
      </div>
      <button className={button} disabled={pending}>Join waitlist</button>
    </form>}
    {role === "patient" && <div className="flex items-center gap-4">
      <h2 className="text-xl font-semibold">Your requests</h2>
      <button className="underline" onClick={() => setRevision((value) => value + 1)}>Refresh offers</button>
    </div>}
    {entries.data?.length === 0 && <p>You have no waitlist requests.</p>}
    {entries.data?.map((entry) => <article className={card} key={entry.id}>
      <h3 className="font-semibold">{entry.therapy} · {entry.doctor}</h3>
      <p>{entry.branch} · {entry.earliest} through {entry.latest} · {entry.status}</p>
      {entry.status === "offered" && <>
        <p>{entry.date} at {entry.time.slice(0, 5)} IST. Accept by {new Date(entry.expires_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST.</p>
        <div className="flex gap-3">
          <button className={button} disabled={pending} onClick={() => submit(`care/waitlist/${entry.id}/accept`, undefined, "Offer accepted.")}>Accept offer</button>
          <button className="underline" disabled={pending} onClick={() => submit(`care/waitlist/${entry.id}/decline`, undefined, "Offer declined.")}>Decline</button>
        </div>
      </>}
      {entry.status === "waiting" && <button className="underline" disabled={pending} onClick={() => submit(`care/waitlist/${entry.id}/withdraw`, undefined, "Request withdrawn.")}>Withdraw request</button>}
      {entry.status === "accepted" && <Link className="underline text-green-800" to="/patient-dashboard">View care timeline</Link>}
    </article>)}
  </section>;
}
