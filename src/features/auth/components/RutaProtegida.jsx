import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerUsuario } from "../services/authServices";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import PropTypes from "prop-types";

const RutaProtegida = ({ children }) => {
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verificarSesion = async () => {
      const user = await obtenerUsuario();
      if (!user || !user.nombre) {
        navigate("/login-erp", { replace: true });
      }
      setCargando(false);
    };

    verificarSesion();
  }, [navigate]);

  if (cargando) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return children;
};

RutaProtegida.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RutaProtegida;
