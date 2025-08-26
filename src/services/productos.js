// src/services/productos.js
// CRA proxy -> /api/* apunta a tu backend

const API = "/api";

// Helper: parsea JSON y lanza error coherente
async function jsonOrThrow(res) {
  let data = null;
  try { data = await res.json(); } catch (_) {}
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  // algunos endpoints devuelven {success: true/false}
  if (data && typeof data === "object" && "success" in data && !data.success) {
    throw new Error(data.error || "Operación rechazada");
  }
  return data;
}

// ========== LISTAR ==========
export async function apiListarProductos() {
  const res = await fetch(`${API}/productos/index.php`, {
    credentials: "include",
    cache: "no-store",
  });
  return jsonOrThrow(res);
}

// ========== AGREGAR ==========
export async function apiAgregarTelefono(campos, imagenes = []) {
  const fd = new FormData();
  fd.append("accion", "guardar");
  Object.entries(campos).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") fd.append(k, v);
  });
  imagenes.slice(0, 4).forEach((file, i) => file && fd.append(`imagen_${i}`, file));

  const res = await fetch(`${API}/productos/index.php`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  return jsonOrThrow(res); // { success:true, id }
}

// ========== ELIMINAR ==========
export async function apiEliminarProducto(id) {
  const fd = new FormData();
  fd.append("accion", "eliminar");
  fd.append("id", id);
  const res = await fetch(`${API}/productos/index.php`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  return jsonOrThrow(res);
}

// ========== EDITAR (sin imágenes) ==========
export async function apiEditarProducto(producto) {
  const res = await fetch(`${API}/productos/index.php`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accion: "editar", ...producto }),
  });
  return jsonOrThrow(res);
}

// ========== EDITAR (con imágenes) ==========
export async function apiEditarProductoConImagenes(producto, imagenes = []) {
  const fd = new FormData();
  fd.append("accion", "editar");
  Object.entries(producto).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") fd.append(k, v);
  });
  imagenes.slice(0, 4).forEach((file, i) => file && fd.append(`imagen_${i}`, file));

  const res = await fetch(`${API}/productos/index.php`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  return jsonOrThrow(res);
}

// ========== PROVEEDORES ==========
export async function apiListarProveedores() {
  const res = await fetch(`${API}/proveedores/listar.php`, {
    credentials: "include",
    cache: "no-store",
  });
  return jsonOrThrow(res); // [{id, razon_social, ...}]
}

// (Opcional) Alta rápida de N copias sin fotos (hace N POSTs consecutivos)
export async function apiAgregarTelefonoCopias(campos, copias = 1) {
  const ids = [];
  for (let i = 0; i < copias; i++) {
    const { id } = await apiAgregarTelefono(campos, []);
    ids.push(id);
  }
  return ids;
}
