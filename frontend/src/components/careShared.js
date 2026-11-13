import { useEffect, useState } from "react";
import { authHeaders } from "../api/auth";

const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
export const field = "block w-full rounded-lg border border-green-200 bg-white px-3 py-2";
export const button = "rounded-lg bg-green-800 px-3 py-2 font-medium text-white disabled:opacity-50";
export const card = "space-y-3 rounded-xl border border-green-100 bg-white p-5 shadow-sm";

export async function careRequest(path, method = "GET", body) {
  const response = await fetch(`${apiBase}/api/${path}`, {
    method,
    headers: body === undefined ? authHeaders() : { ...authHeaders(), "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || "Unable to complete this request");
  return data;
}

export function useCareData(path, revision = 0) {
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (!path) return;
    let active = true;
    careRequest(path).then(
      (data) => { if (active) setResult({ path, revision, data }); },
      (error) => { if (active) setResult({ path, revision, error: error.message }); },
    );
    return () => { active = false; };
  }, [path, revision]);
  return result?.path === path ? result : {};
}

export function clinicDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const { year, month, day } = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${year}-${month}-${day}`;
}

export function careRole() {
  try { return JSON.parse(localStorage.getItem("ayursutra_user"))?.role?.toLowerCase(); }
  catch { return null; }
}
