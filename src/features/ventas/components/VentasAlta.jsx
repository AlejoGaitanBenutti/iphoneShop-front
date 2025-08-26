// src/features/ventas/components/VentasAlta.jsx
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Divider,
  Chip,
  Autocomplete,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import PaymentsIcon from "@mui/icons-material/Payments";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import GroupIcon from "@mui/icons-material/Group";
import PropTypes from "prop-types";
import BuscarProducto from "./BuscarProducto";
import PopperSmokeTest from "./PopperSmokeTest";
import BuscarProductoLite from "./BuscarProductoLite";


import {
  apiProductosDisponibles,
  apiCrearVenta,
  apiListarVentas,
} from "../../../services/ventas";

// Fix para selects en dark (evita transparencias)
const selectFixProps = {
  InputProps: { notched: false },
  InputLabelProps: {
    shrink: true,
    sx: { bgcolor: "background.paper", px: 0.75, zIndex: 1 },
  },
  SelectProps: {
    MenuProps: {
      PaperProps: {
        sx: {
          bgcolor: "background.paper",
          color: "text.primary",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        },
      },
    },
    sx: { bgcolor: "background.paper" },
  },
  sx: {
    "& .MuiOutlinedInput-root": { bgcolor: "background.paper" },
    "& .MuiOutlinedInput-notchedOutline legend span": {
      bgcolor: "background.paper",
      px: 0.75,
    },
  },
};

function currency(n) {
  const x = Number(n || 0);
  return x.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function VentasAlta({ onCreated }) {
  // --------- estado del formulario
  const [query, setQuery] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [opciones, setOpciones] = useState([]);

  // abrir/cerrar Autocomplete de forma controlada
  const [openAuto, setOpenAuto] = useState(false);

  // carrito: [{ id, label, precio_unit }]
  const [items, setItems] = useState([]);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [descuento, setDescuento] = useState(0);
  const [impuestos, setImpuestos] = useState(0);
  const [clienteNombre, setClienteNombre] = useState(""); // por ahora nominal
  const [snack, setSnack] = useState(null);

  // --------- resumen (simple) para las cards
  const [ventasHoy, setVentasHoy] = useState({ total: 0, cantidad: 0 });
  const [stockCount, setStockCount] = useState(0);

  // Debounce de búsqueda
  const tRef = useRef(null);
  useEffect(() => {
    console.log("DEBUG opciones", opciones.slice(0,3));
    window.clearTimeout(tRef.current);
    tRef.current = window.setTimeout(async () => {
      try {
        setLoadingSearch(true);
        const data = await apiProductosDisponibles(query);
        setOpciones(
          data.map((p) => ({
            id: p.id,
            precio_lista: Number(p.precio_lista || 0),
            label: `${p.modelo} ${p.almacenamiento_gb ?? ""}GB • ${p.color}${
              p.bateria_salud ? ` • Bat ${p.bateria_salud}%` : ""
            }${p.sku ? ` • #${p.sku}` : ""}`,
          }))
        );
        setStockCount(data.length);
      } catch {
        setOpciones([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 300);
    return () => window.clearTimeout(tRef.current);
  }, [query]);

  // Cargar métricas de hoy
  useEffect(() => {
    (async () => {
      try {
        const data = await apiListarVentas();
        const hoy = new Date().toISOString().slice(0, 10);
        let total = 0;
        let cant = 0;
        for (const v of data) {
          if ((v.fecha_venta || "").slice(0, 10) === hoy) {
            cant += 1;
            total += Number(v.total || 0);
          }
        }
        setVentasHoy({ total, cantidad: cant });
      } catch {
        setVentasHoy({ total: 0, cantidad: 0 });
      }
    })();
  }, []);

  const subtotal = useMemo(
    () => items.reduce((acc, it) => acc + Number(it.precio_unit || 0), 0),
    [items]
  );
  const total = useMemo(
    () => Math.max(0, subtotal - Number(descuento || 0) + Number(impuestos || 0)),
    [subtotal, descuento, impuestos]
  );

  function addItem(opt) {
    if (!opt) return;
    if (items.some((it) => it.id === opt.id)) {
      setSnack({ sev: "info", msg: "Ese producto ya está en la lista" });
      return;
    }
    setItems((prev) => [
      ...prev,
      { id: opt.id, label: opt.label, precio_unit: opt.precio_lista },
    ]);
    setQuery(""); // limpio input
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (items.length === 0) {
      setSnack({ sev: "warning", msg: "Agregá al menos un producto" });
      return;
    }
    try {
      const payload = {
        cliente_id: null,
        metodo_pago: metodoPago,
        descuento: Number(descuento || 0),
        impuestos: Number(impuestos || 0),
        items: items.map((it) => ({
          producto_id: it.id,
          precio_unit: Number(it.precio_unit || 0),
        })),
      };
      const res = await apiCrearVenta(payload);
      setSnack({
        sev: "success",
        msg: `Venta #${res.venta_id} registrada (Total $ ${currency(res.total)})`,
      });
      // reset
      setItems([]);
      setDescuento(0);
      setImpuestos(0);
      setMetodoPago("efectivo");
      setClienteNombre("");
      onCreated?.(res);

      // refrescar tarjetas
      try {
        const data = await apiListarVentas();
        const hoy = new Date().toISOString().slice(0, 10);
        let total = 0;
        let cant = 0;
        for (const v of data) {
          if ((v.fecha_venta || "").slice(0, 10) === hoy) {
            cant += 1;
            total += Number(v.total || 0);
          }
        }
        setVentasHoy({ total, cantidad: cant });
      } catch {}
      try {
        const disp = await apiProductosDisponibles("");
        setStockCount(disp.length);
      } catch {}
    } catch (err) {
      setSnack({
        sev: "error",
        msg: err.message || "Error al registrar la venta",
      });
    }
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto" }}>
      <Typography
        variant="h4"
        fontWeight={800}
        sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, color: "text.main" }}
      >
        <SmartphoneIcon sx={{ color: "warning.main" }} /> Módulo de Ventas
      </Typography>

      {/* ¡Importante!: overflow visible para que nada recorte el popper */}
      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, overflow: "visible", position: "relative" }}>
        <Typography variant="h6" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PaymentsIcon sx={{ color: "warning.main" }} /> Nueva Venta
        </Typography>
        <Typography variant="body2" color="text.main" sx={{ mb: 2 }}>
          Elegí los equipos a vender, revisá los importes y registrá la venta.
        </Typography>

        <form onSubmit={onSubmit}>
          <Stack spacing={2}>
            {/* Buscar y agregar productos */}
            <Typography variant="caption" sx={{ display: "block", mb: 0.5, color: "text.main" }}>
              resultados: {opciones.length} {query ? `(q="${query}")` : ""}
            </Typography>


<BuscarProductoLite
  options={opciones}
  loading={loadingSearch}
  onSearch={(v) => setQuery(v)}     // dispara tu fetch con debounce que ya tenés
  onPick={(opt) => addItem(opt)}    // agrega al carrito
  textFieldProps={selectFixProps}
  disablePortal={true}              // 👈 importantísimo para descartar portal
/>


          
            <Typography variant="caption" sx={{ opacity: 0.6, color: "text.main" }}>
              query: “{query}” — opciones: {opciones.length}
            </Typography>

            {/* Carrito */}
            <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  bgcolor: "background.default",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography fontWeight={700} sx={{ color: "text.main" }}>
                  Ítems seleccionados
                </Typography>
              </Box>

              {items.length === 0 ? (
                <Box sx={{ p: 2, color: "text.secondary" }}>No agregaste productos todavía.</Box>
              ) : (
                <Stack sx={{ p: 1.5 }} spacing={1}>
                  {items.map((it) => (
                    <Paper key={it.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ flex: 1, minWidth: 200 }}>
                          <Typography fontWeight={600}>{it.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {it.id}
                          </Typography>
                        </Box>
                        <TextField
                          label="Precio de venta"
                          type="number"
                          inputProps={{ step: "0.01", min: 0 }}
                          value={it.precio_unit}
                          onChange={(e) => {
                            const v = e.target.value;
                            setItems((prev) =>
                              prev.map((x) => (x.id === it.id ? { ...x, precio_unit: v } : x))
                            );
                          }}
                          sx={{ width: 180 }}
                          {...selectFixProps}
                        />
                        <IconButton color="error" onClick={() => removeItem(it.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>

            <Divider />

            {/* Datos de venta */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Método de pago"
                  select
                  fullWidth
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  {...selectFixProps}
                >
                  <MenuItem value="efectivo">Efectivo</MenuItem>
                  <MenuItem value="debito">Débito</MenuItem>
                  <MenuItem value="credito">Crédito</MenuItem>
                  <MenuItem value="transferencia">Transferencia</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Descuento"
                  type="number"
                  inputProps={{ step: "0.01", min: 0 }}
                  fullWidth
                  value={descuento}
                  onChange={(e) => setDescuento(e.target.value)}
                  {...selectFixProps}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Impuestos"
                  type="number"
                  inputProps={{ step: "0.01", min: 0 }}
                  fullWidth
                  value={impuestos}
                  onChange={(e) => setImpuestos(e.target.value)}
                  {...selectFixProps}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Cliente (opcional)"
                  placeholder="Nombre del cliente"
                  fullWidth
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  {...selectFixProps}
                />
              </Grid>
            </Grid>

            {/* Totales */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 4, px: 1 }}>
              <Stack alignItems="flex-end">
                <Typography variant="body2" color="text.secondary">
                  Subtotal
                </Typography>
                <Typography sx={{ color: "text.main" }} variant="h6">
                  $ {currency(subtotal)}
                </Typography>
              </Stack>
              <Stack alignItems="flex-end">
                <Typography variant="body2" color="text.secondary">
                  Total
                </Typography>
                <Typography variant="h5" fontWeight={800} color="warning.main">
                  $ {currency(total)}
                </Typography>
              </Stack>
            </Box>

            <Button type="submit" variant="contained" size="large" startIcon={<AddShoppingCartIcon />}>
              Registrar Venta
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* Tarjetas resumen simples */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }} variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <PaymentsIcon color="warning" />
                <Typography variant="subtitle2" color="text.secondary">
                  Total ventas hoy
                </Typography>
              </Stack>
              <Typography variant="h5" fontWeight={800}>$ {currency(ventasHoy.total)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }} variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <SmartphoneIcon color="warning" />
                <Typography variant="subtitle2" color="text.secondary">
                  Ventas hoy
                </Typography>
              </Stack>
              <Typography variant="h5" fontWeight={800}>{ventasHoy.cantidad}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }} variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <GroupIcon color="warning" />
                <Typography variant="subtitle2" color="text.secondary">
                  Stock disponible
                </Typography>
              </Stack>
              <Typography variant="h5" fontWeight={800}>{stockCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={!!snack}
        autoHideDuration={3500}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {snack ? (
          <Alert onClose={() => setSnack(null)} severity={snack.sev} variant="filled">
            {snack.msg}
          </Alert>
        ) : null}
      </Snackbar>
    </Box>
  );
}

VentasAlta.propTypes = { onCreated: PropTypes.func };
VentasAlta.defaultProps = { onCreated: () => {} };
