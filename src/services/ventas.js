const BASE = "/api";

export async function apiProductosDisponibles(q = "") {
  const res = await fetch(
    `${BASE}/ventas/index.php?accion=disponibles&q=${encodeURIComponent(q)}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("No se pudo listar productos disponibles");
  return res.json();
}


export async function apiCrearVenta(payload) {
  const res = await fetch(`${BASE}/ventas/index.php`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accion: "crear", ...payload }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || data?.success !== true) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data;
}

export async function apiListarVentas() {
  const res = await fetch(`${BASE}/ventas/index.php`, { credentials: "include" });
  if (!res.ok) throw new Error("No se pudieron listar ventas");
  return res.json();
}

export async function apiVerVenta(id) {
  const res = await fetch(`${BASE}/ventas/index.php?accion=ver&id=${id}`, {
    credentials: "include",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || data?.success !== true) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data; // { success: true, venta, items }
}