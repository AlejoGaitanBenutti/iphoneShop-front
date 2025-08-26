// src/services/login.js
const apiUrl = "/auth/login.php";

export const login = async (email, password) => {
  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      credentials: "include", // ← cookies
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ correo: email, password }),
    });

    // Leemos el body una sola vez y tratamos de parsearlo
    const raw = await res.text();
    let data = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch (_) {
      // si no es JSON válido, data queda en null
    }

    if (!res.ok) {
      const msg = data?.mensaje || data?.error || `HTTP ${res.status}`;
      throw new Error(msg);
    }

    // Pequeño delay opcional para asegurar que el navegador persista la cookie
    await new Promise((r) => setTimeout(r, 150));

    // En éxito devolvemos el JSON (p.ej. { mensaje, usuario })
    return data ?? { success: true };
  } catch (err) {
    console.error("Error al iniciar sesión:", err);
    return { success: false, message: err.message };
  }
};
