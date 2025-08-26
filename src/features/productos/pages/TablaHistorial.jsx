import { useEffect, useState } from "react";
import {
  Typography,
  Avatar,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Box,
  Chip,
  Stack,
  Card,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { format } from "date-fns";
import { motion } from "framer-motion";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { getHistorial } from "../api/getHistorial";

export default function HistorialTabla() {
  const [historial, setHistorial] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroAccion, setFiltroAccion] = useState("");

  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    const cargarHistorial = async () => {
      const data = await getHistorial();
      setHistorial(data);
    };
    cargarHistorial();
  }, []);

  const historialFiltrado = historial.filter((registro) => {
    const coincideNombre = registro.nombre?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideAccion = filtroAccion ? registro.accion === filtroAccion : true;
    return coincideNombre && coincideAccion;
  });

  const obtenerEstiloChip = (accion) => {
    switch (accion) {
      case "alta":
        return { label: "Alta", color: "success" };
      case "edicion":
        return { label: "Edición", color: "warning" };
      case "eliminacion":
        return { label: "Eliminación", color: "error" };
      default:
        return { label: "Otro", color: "default" };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: "2rem" }}
    >
      <DashboardLayout>
        <Card sx={{ p: 3, backgroundColor: "#1a1a1a", borderRadius: 3, cursor:"pointer" }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ mb: 3 }}>
            <TextField
              label="Buscar por nombre"
              variant="outlined"
              size="small"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#ccc" }} />
                  </InputAdornment>
                ),
                sx: {
                  color: "#fff",
                  backgroundColor: "#1e1e1e",
                  borderRadius: 1,
                }
              }}
              InputLabelProps={{ sx: { color: "#aaa" } }}
              sx={{
                width: "250px",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#ffa040" },
                  "&.Mui-focused fieldset": { borderColor: "#ffa040" }
                }
              }}
            />

            <Select
              value={filtroAccion}
              onChange={(e) => setFiltroAccion(e.target.value)}
              displayEmpty
              size="small"
              sx={{
                width: "200px",
                backgroundColor: "#1e1e1e",
                borderRadius: 1,
                color: "#fff",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#ffa040" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#ffa040" }
              }}
            >
              <MenuItem sx={{ color: "black!important" }} value=""><em>Todas las acciones</em></MenuItem>
              <MenuItem sx={{ color: "black!important" }} value="alta">Alta</MenuItem>
              <MenuItem sx={{ color: "black!important" }} value="edicion">Edición</MenuItem>
              <MenuItem sx={{ color: "black!important" }} value="eliminacion">Eliminación</MenuItem>
            </Select>
          </Stack>

          {!isMobile ? (
           <TableContainer
  component={Paper}
  elevation={3}
  sx={{
    width: "100%",
    overflowX: "auto",
    borderRadius: 2,
    backgroundColor: "#1e1e1e",
  }}
>
  <Table sx={{ minWidth: 900, tableLayout: "fixed" }}>
    <TableHead>
      <TableRow>
        <TableCell sx={{ width: "25%", color: "#f5f5f5", fontWeight: "bold" }}>
          Usuario
        </TableCell>
        <TableCell sx={{ width: "15%", color: "#f5f5f5", fontWeight: "bold" }}>
          Acción
        </TableCell>
        <TableCell sx={{ width: "45%", color: "#f5f5f5", fontWeight: "bold" }}>
          Detalles
        </TableCell>
        <TableCell sx={{ width: "15%", color: "#f5f5f5", fontWeight: "bold" }}>
          Fecha
        </TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
      {historialFiltrado.length === 0 ? (
        <TableRow>
          <TableCell colSpan={4} align="center" sx={{ color: "#fff" }}>
            No hay registros disponibles.
          </TableCell>
        </TableRow>
      ) : (
        historialFiltrado.map((registro, index) => {
          const chip = obtenerEstiloChip(registro.accion);
          return (
            <TableRow key={index} hover>
              <TableCell sx={{ color: "#fff" }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: "#333", color: "#ffa040" }}>
                    {registro.nombre?.slice(0, 2).toUpperCase()}
                  </Avatar>
                  <Typography variant="body2" sx={{ color: "#fff" }}>
                    {registro.nombre}
                  </Typography>
                </Box>
              </TableCell>

              <TableCell>
                <Chip label={chip.label} color={chip.color} size="small" />
              </TableCell>

              <TableCell sx={{ color: "#ccc" }}>{registro.detalles || "-"}</TableCell>

              <TableCell sx={{ color: "#aaa" }}>
                {format(new Date(registro.fecha), "dd/MM/yyyy HH:mm")}
              </TableCell>
            </TableRow>
          );
        })
      )}
    </TableBody>
  </Table>
</TableContainer>
          ) : (
            <Stack spacing={2}>
              {historialFiltrado.map((registro, index) => {
                const chip = obtenerEstiloChip(registro.accion);
                return (
                  <Box key={index} sx={{ backgroundColor: "#1e1e1e", p: 2, borderRadius: 2 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: "#333", color: "#ffa040" }}>
                        {registro.nombre?.slice(0, 2).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" sx={{ color: "#fff" }}>{registro.nombre}</Typography>
                    </Box>
                    <Chip label={chip.label} color={chip.color} size="small" />
                    <Typography variant="body2" sx={{ color: "#ccc", mt: 1 }}>{registro.detalles || "-"}</Typography>
                    <Typography variant="caption" sx={{ color: "#aaa" }}>
                      {format(new Date(registro.fecha), "dd/MM/yyyy HH:mm")}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Card>
      </DashboardLayout>
    </motion.div>
  );
}
