import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const cerrarSesion = async () => {
      try {
        await fetch("/auth/logout.php", {
          method: "POST",
          credentials: "include", // importante para que borre la cookie
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
      } catch (error) {
        console.error("❌ Error al cerrar sesión:", error);
      } finally {
        // Asegurate de ir a la misma ruta de login que usás en la ruta protegida
        navigate("/login-erp", { replace: true });
      }
    };

    cerrarSesion();
  }, [navigate]);

  return null;
};

export default Logout;
