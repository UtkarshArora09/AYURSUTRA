import { Link } from "react-router-dom";

export function CareLinks({ role }) {
  return <nav className="flex flex-wrap gap-4 text-sm font-medium text-green-800">
    {["admin", "doctor"].includes(role) && <Link className="underline" to="/clinic/calendar">Clinic calendar</Link>}
    {["doctor", "patient"].includes(role) && <Link className="underline" to="/clinic/treatment-plans">Treatment plans</Link>}
    {role === "patient" && <Link className="underline" to="/clinic/waitlist">Waitlist and offers</Link>}
  </nav>;
}
