 const apiUrl = "/auth/me.php";

export const obtenerUsuario = async () => {
   try {
     const response = await fetch(apiUrl, {
       method: "GET",
       credentials: "include",
     });


    if (!response.ok) throw new Error("No se pudo obtener la sesión");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error al obtener usuario:", error);
    return null;
  }
};