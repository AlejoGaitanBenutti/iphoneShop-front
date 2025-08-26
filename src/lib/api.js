// src/lib/api.js
export async function api(path, { method = "GET", body, headers = {} } = {}) {
  const url = path.startsWith("/") ? path : `/${path}`;
  const isForm = body instanceof FormData;

  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      ...(body && !isForm ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); msg = j?.error || j?.mensaje || msg; } catch {}
    throw new Error(msg);
  }

  return res.json();
}
