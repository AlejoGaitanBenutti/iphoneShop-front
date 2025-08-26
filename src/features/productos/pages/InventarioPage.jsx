import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Icon from "@mui/material/Icon";
import { Box } from "@mui/material";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";

import {
  apiListarProductos,
  apiEliminarProducto,
  apiEditarProducto,
  apiEditarProductoConImagenes,
} from "../../../services/productos";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const InventarioPage = () => {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [abiertoModal, setAbiertoModal] = useState(false);

  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState(null);
  const [imagenesNuevas, setImagenesNuevas] = useState([null, null, null, null]);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroOrigen, setFiltroOrigen] = useState("todos");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Cargar productos
  useEffect(() => {
    (async () => {
      try {
        const lista = await apiListarProductos();
        setProductos(lista || []);
      } catch (err) {
        console.error("Error al obtener productos", err);
      }
    })();
  }, []);

  // Abrir modal de eliminación
  const eliminar = (id) => {
    const prod = productos.find((p) => p.id === id);
    setProductoSeleccionado(prod || null);
    setAbiertoModal(true);
  };

  // Confirmar eliminación
  const handleEliminarConfirmado = async () => {
    if (!productoSeleccionado) return;
    try {
      const res = await apiEliminarProducto(productoSeleccionado.id);
      if (res?.success) {
        setProductos((prev) => prev.filter((p) => p.id !== productoSeleccionado.id));
        setSnackbar({ open: true, message: "Producto eliminado", severity: "success" });
      } else {
        setSnackbar({ open: true, message: "No se pudo eliminar", severity: "error" });
      }
    } catch (e) {
      setSnackbar({ open: true, message: "Error al eliminar", severity: "error" });
    } finally {
      setAbiertoModal(false);
      setProductoSeleccionado(null);
    }
  };

  // Abrir editor
  const editar = (producto) => {
    setProductoAEditar({
      ...producto,
      // valores por si vienen null
      almacenamiento_gb: producto.almacenamiento_gb ?? "",
      garantia_meses: producto.garantia_meses ?? "",
      costo: producto.costo ?? "",
      precio_lista: producto.precio_lista ?? "",
      estado: producto.estado ?? "usado",
      origen: producto.origen ?? "compra",
      notas: producto.notas ?? "",
      imei_1: producto.imei_1 ?? "",
      imei_2: producto.imei_2 ?? "",
    });
    setImagenesNuevas([null, null, null, null]);
    setModoEdicion(true);
  };

  // Guardar cambios (sin imágenes)
  const handleGuardarEdicion = async () => {
    try {
      const res = await apiEditarProducto(productoAEditar);
      if (res?.success) {
        setProductos((prev) => prev.map((p) => (p.id === productoAEditar.id ? { ...p, ...productoAEditar } : p)));
        setSnackbar({ open: true, message: "Producto actualizado", severity: "success" });
        setModoEdicion(false);
      } else {
        setSnackbar({ open: true, message: "No se pudo actualizar", severity: "error" });
      }
    } catch (e) {
      setSnackbar({ open: true, message: "Error al actualizar", severity: "error" });
    }
  };

  // Guardar cambios (con imágenes si cargaron)
  const handleGuardarEdicionConImagenes = async () => {
    try {
      const hayImagenes = imagenesNuevas.some((img) => !!img);
      let res;
      if (hayImagenes) {
        res = await apiEditarProductoConImagenes(productoAEditar, imagenesNuevas);
      } else {
        res = await apiEditarProducto(productoAEditar);
      }
      if (res?.success) {
        setSnackbar({ open: true, message: "✅ Producto actualizado correctamente", severity: "success" });
        setModoEdicion(false);
        setImagenesNuevas([null, null, null, null]);
        // Refrescar listado simple
        const lista = await apiListarProductos();
        setProductos(lista || []);
      } else {
        setSnackbar({ open: true, message: "❌ Error al actualizar el producto", severity: "error" });
      }
    } catch (e) {
      setSnackbar({ open: true, message: "❌ Error al actualizar el producto", severity: "error" });
    }
  };

  // Filtro
  const productosFiltrados = productos.filter((p) => {
    const q = busqueda.trim().toLowerCase();
    const coincideBusqueda =
      (p.marca || "").toLowerCase().includes(q) ||
      (p.modelo || "").toLowerCase().includes(q) ||
      (p.imei_1 || "").toLowerCase().includes(q) ||
      (p.imei_2 || "").toLowerCase().includes(q);

    const coincideEstado = filtroEstado === "todos" || p.estado === filtroEstado;
    const coincideOrigen = filtroOrigen === "todos" || p.origen === filtroOrigen;

    return coincideBusqueda && coincideEstado && coincideOrigen;
  });

  return (
    <DashboardLayout>
      <MDBox pt={3} px={2}>
        <MDBox
          sx={{
            backgroundColor: "#1e1e1e",
            borderRadius: "12px",
            p: 3,
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            mb: 3,
          }}
        >
          <MDTypography variant="h4" fontWeight="bold" sx={{ color: "#fff", mb: 3 }}>
            Stock Disponible
          </MDTypography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Buscar por marca, modelo o IMEI"
                variant="outlined"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon sx={{ color: "#ff9100" }}>search</Icon>
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ sx: { color: "#aaa", "&.Mui-focused": { color: "#ff9100" } } }}
                sx={{
                  backgroundColor: "#2a2a2a",
                  borderRadius: "8px",
                  input: { color: "#fff" },
                  "& fieldset": { borderColor: "#444" },
                  "&:hover fieldset": { borderColor: "#ff9100" },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "#aaa", "&.Mui-focused": { color: "#ff9100" } }}>
                  Estado
                </InputLabel>
                <Select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  sx={{
                    backgroundColor: "#2a2a2a",
                    color: "#fff",
                    mt: "10px",
                    "& fieldset": { borderColor: "#444" },
                  }}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="nuevo">Nuevo</MenuItem>
                  <MenuItem value="usado">Usado</MenuItem>
                  <MenuItem value="reacond">Reacondicionado</MenuItem>
                  <MenuItem value="defectuoso">Defectuoso</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "#aaa", "&.Mui-focused": { color: "#ff9100" } }}>
                  Origen
                </InputLabel>
                <Select
                  value={filtroOrigen}
                  onChange={(e) => setFiltroOrigen(e.target.value)}
                  sx={{
                    backgroundColor: "#2a2a2a",
                    color: "#fff",
                    mt: "10px",
                    "& fieldset": { borderColor: "#444" },
                  }}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="compra">Compra</MenuItem>
                  <MenuItem value="permuta">Permuta</MenuItem>
                  <MenuItem value="consignacion">Consignación</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </MDBox>

        <Grid container spacing={2}>
          {productosFiltrados.map((p) => (
            <Grid item xs={12} sm={6} md={4} key={p.id}>
              <Card
                sx={{
                  backgroundColor: "#1e1e1e",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  border: "1px solid #2a2a2a",
                  transition: "transform 0.2s ease",
                  "&:hover": { transform: "scale(1.015)", boxShadow: "0 4px 12px rgba(255,145,0,.3)" },
                }}
              >
                <CardMedia
                  component="img"
                  height="180"
                  image={p.imagen_principal || "/assets/no-image.png"}
                  alt={`${p.marca} ${p.modelo}`}
                  sx={{ objectFit: "cover", borderTopLeftRadius: "12px", borderTopRightRadius: "12px" }}
                />
                <CardContent sx={{ color: "#e0e0e0", p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="#fff">
                    {p.marca} {p.modelo} • {p.almacenamiento_gb || "-"}GB
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#bbbbbb", mt: 0.5 }}>
                    Color: {p.color || "-"} • Estado: {p.estado || "-"} • Origen: {p.origen || "-"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#ff9100", fontWeight: "bold", mt: 1 }}>
                    Precio lista: ${Number(p.precio_lista || 0).toLocaleString()}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
                  <IconButton size="small" sx={{ color: "#ff9100" }} onClick={() => editar(p)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" sx={{ color: "#e53935" }} onClick={() => eliminar(p.id)}>
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Modal confirmación */}
        <Dialog open={abiertoModal} onClose={() => setAbiertoModal(false)}>
          <DialogTitle>¿Confirmar eliminación?</DialogTitle>
          <DialogContent>
            <MDTypography>
              ¿Estás seguro de eliminar {productoSeleccionado?.marca} {productoSeleccionado?.modelo}?
            </MDTypography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAbiertoModal(false)} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleEliminarConfirmado} color="error">
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de edición */}
        {modoEdicion && productoAEditar && (
          <Dialog open={modoEdicion} onClose={() => setModoEdicion(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ bgcolor: "#1e1e1e", color: "#fff" }}>Editar Teléfono</DialogTitle>

            <DialogContent
              sx={{
                backgroundColor: "#1e1e1e",
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                pt: 2,
              }}
            >
              {[
                { label: "Marca", key: "marca" },
                { label: "Modelo", key: "modelo" },
                { label: "Almacenamiento (GB)", key: "almacenamiento_gb", type: "number" },
                { label: "Color", key: "color" },
                { label: "IMEI 1", key: "imei_1" },
                { label: "IMEI 2", key: "imei_2" },
                { label: "Costo", key: "costo", type: "number" },
                { label: "Precio Lista", key: "precio_lista", type: "number" },
                { label: "Garantía (meses)", key: "garantia_meses", type: "number" },
                { label: "Notas", key: "notas" },
              ].map(({ label, key, type }) => (
                <TextField
                  key={key}
                  label={label}
                  type={type || "text"}
                  value={productoAEditar[key] ?? ""}
                  onChange={(e) => setProductoAEditar({ ...productoAEditar, [key]: e.target.value })}
                  fullWidth
                  sx={{
                    input: { color: "#fff" },
                    label: { color: "#aaa" },
                    "& label.Mui-focused": { color: "#ff9100" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#444" },
                      "&:hover fieldset": { borderColor: "#ff9100" },
                      "&.Mui-focused fieldset": { borderColor: "#ff9100" },
                      backgroundColor: "#2a2a2a",
                    },
                  }}
                />
              ))}

              {[
                { label: "Estado", key: "estado", options: ["nuevo", "usado", "reacond", "defectuoso"] },
                { label: "Origen", key: "origen", options: ["compra", "permuta", "consignacion"] },
              ].map(({ label, key, options }) => (
                <FormControl fullWidth key={key}>
                  <InputLabel sx={{ color: "#aaa", "&.Mui-focused": { color: "#ff9100" } }}>{label}</InputLabel>
                  <Select
                    value={productoAEditar[key] || ""}
                    label={label}
                    onChange={(e) => setProductoAEditar({ ...productoAEditar, [key]: e.target.value })}
                    sx={{
                      color: "#fff",
                      backgroundColor: "#2a2a2a",
                      pt: "16px",
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#444" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#ff9100" },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#ff9100" },
                    }}
                  >
                    {options.map((opt) => (
                      <MenuItem sx={{ backgroundColor: "#2a2a2a" }} key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}

              {[0, 1, 2, 3].map((i) => (
                <Box key={i} sx={{ my: 1, color: "#fff", width: "100%" }}>
                  <InputLabel sx={{ color: "#aaa" }}>{`Imagen ${i + 1}`}</InputLabel>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const archivos = [...imagenesNuevas];
                      archivos[i] = e.target.files?.[0] || null;
                      setImagenesNuevas(archivos);
                    }}
                    style={{ color: "#fff" }}
                  />
                </Box>
              ))}
            </DialogContent>

            <DialogActions sx={{ bgcolor: "#1e1e1e" }}>
              <Button onClick={() => setModoEdicion(false)} color="warning">
                Cancelar
              </Button>
              <Button
                onClick={handleGuardarEdicionConImagenes}
                color="success"
                variant="contained"
                sx={{
                  backgroundColor: "#ff9100",
                  color: "#000",
                  "&:hover": { backgroundColor: "#e07f00" },
                }}
              >
                Guardar Cambios
              </Button>
            </DialogActions>
          </Dialog>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </MDBox>
    </DashboardLayout>
  );
};

export default InventarioPage;
