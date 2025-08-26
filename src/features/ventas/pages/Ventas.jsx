// src/features/ventas/pages/Ventas.jsx
import { Box } from "@mui/material";
import VentasAlta from "../components/VentasAlta";

export default function Ventas() {
  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",   // ajustá si tu header tiene otra altura
        display: "flex",
        justifyContent: "center",          // centra horizontal
        alignItems: "flex-start",          // poné "center" si querés centrar también vertical
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 980 }}>
        <VentasAlta />
      </Box>
    </Box>
  );
}
