import React from "react";
import PropTypes from "prop-types";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";

const TarjetaEstadistica = ({ titulo, valor, icono }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      height: "100%",
      background: "linear-gradient(145deg, #1f1f1f, #2a2a2a)",
      borderRadius: 3,
      color: "#ffffff",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.4)",
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-3px)",
        boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.6)",
      },
    }}
  >
    <Box display="flex" alignItems="center" mb={1}>
      <Box
        sx={{
          background: "rgba(255, 111, 0, 0.15)",
          border: "1px solid #ff6f00",
          borderRadius: "50%",
          width: 48,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mr: 2,
        }}
      >
        <Icon sx={{ color: "#ff6f00", fontSize: 24 }}>{icono}</Icon>
      </Box>
      <Box>
        <Typography variant="body2" sx={{ color: "#bdbdbd", fontWeight: 500 }}>
          {titulo}
        </Typography>
        <Typography variant="h5" sx={{ color: "#ffffff", fontWeight: "bold" }}>
          {valor}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

TarjetaEstadistica.propTypes = {
  titulo: PropTypes.string.isRequired,
  valor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icono: PropTypes.string.isRequired,
};

export default TarjetaEstadistica;
