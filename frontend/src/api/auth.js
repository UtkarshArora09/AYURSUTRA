export function authHeaders() {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function availableTimes(apiBase, doctorId, date) {
  const query = new URLSearchParams({ doctorId, date });
  const response = await fetch(`${apiBase}/api/bookings/availability?${query}`, {
    headers: authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Unable to load appointment times");
  return data;
}
