export function authHeaders() {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function availableTimes(apiBase, doctorId, date, centerId, therapy) {
  const query = new URLSearchParams({ doctorId, date });
  if (centerId != null) query.set("centerId", centerId);
  if (therapy) query.set("therapy", therapy);
  const response = await fetch(`${apiBase}/api/bookings/availability?${query}`, {
    headers: authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Unable to load appointment times");
  return data;
}

export function watchQueue(apiBase, query, refresh) {
  const controller = new AbortController();
  const run = async () => {
    while (!controller.signal.aborted) {
      try {
        const response = await fetch(`${apiBase}/api/queue/events?${query}`, {
          headers: authHeaders(), signal: controller.signal,
        });
        if ([401, 403].includes(response.status)) return;
        if (!response.ok || !response.body) throw new Error("Queue updates unavailable");
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
        let pending = "";
        while (!controller.signal.aborted) {
          const { done, value } = await reader.read();
          if (done) break;
          pending += value;
          const messages = pending.split("\n\n");
          pending = messages.pop();
          if (messages.some((message) => message === "data: refresh")) await refresh();
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Queue updates interrupted", error);
      }
      if (!controller.signal.aborted) await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  };
  run();
  return () => controller.abort();
}
