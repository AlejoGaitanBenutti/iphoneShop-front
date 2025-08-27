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
  Chip,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  FormControl,
  Select,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import PaymentsIcon from "@mui/icons-material/Payments";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import GroupIcon from "@mui/icons-material/Group";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import HandshakeIcon from "@mui/icons-material/Handshake";
import AddIcon from "@mui/icons-material/Add";
import PropTypes from "prop-types";

// 🔁 Buscador pro
import BuscarProductoPro from "./BuscarProductoPro";

import {
  apiProductosDisponibles,
  apiCrearVenta,
  apiListarVentas,
} from "../../../services/ventas";

// ---------- helpers ----------
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

const METODOS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "debito", label: "Débito" },
  { value: "credito", label: "Crédito" },
  { value: "transferencia", label: "Transferencia" },
];

// Genera la etiqueta legible del item agregado al carrito
const makeLabel = (o) =>
  `${o.modelo ?? ""} ${o.almacenamiento_gb ?? ""}GB • ${o.color ?? ""}${
    o.bateria_salud ? ` • Bat ${o.bateria_salud}%` : ""
  }${o.sku ? ` • #${o.sku}` : ""}`.trim();

// =======================================================
// Componente
// =======================================================
export default function VentasAlta({ onCreated }) {
  // --------- búsqueda productos
  const [query, setQuery] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [opciones, setOpciones] = useState([]);
  const tRef = useRef(null);

  // --------- carrito
  // guardamos datos para la confirmación (modelo, gb, color, estado, imei)
  const [items, setItems] = useState([]); // [{ id, label, precio_unit, modelo, almacenamiento_gb, color, estado, imei_1, imei_2 }]
  const addItem = (opt) => {
    if (!opt) return;
    if (items.some((it) => it.id === opt.id)) {
      setSnack({ sev: "info", msg: "Ese producto ya está en la lista" });
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        id: opt.id,
        label: makeLabel(opt),
        precio_unit: Number(opt.precio_lista ?? opt.precio ?? 0),
        modelo: opt.modelo ?? null,
        almacenamiento_gb: opt.almacenamiento_gb ?? null,
        color: opt.color ?? null,
        estado: opt.estado ?? "usado",
        imei_1: opt.imei_1 ?? null,
        imei_2: opt.imei_2 ?? null,
      },
    ]);
    setQuery("");
  };
  const removeItem = (id) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  // --------- totales básicos
  const [descuento, setDescuento] = useState(0);
  const [impuestos, setImpuestos] = useState(0);
  const subtotal = useMemo(
    () => items.reduce((acc, it) => acc + Number(it.precio_unit || 0), 0),
    [items]
  );
  const total = useMemo(
    () => Math.max(0, Number(subtotal) - Number(descuento || 0) + Number(impuestos || 0)),
    [subtotal, descuento, impuestos]
  );

  // --------- trade-in (parte de pago)
  const [tradeInEnabled, setTradeInEnabled] = useState(false);
  const [tradeIn, setTradeIn] = useState({
    modelo: "",
    almacenamiento_gb: "",
    color: "",
    condicion: "usado",
    imei_1: "",
    imei_2: "",
    valor_toma: 0,
    notas: "",
  });
  const valorToma = tradeInEnabled ? Number(tradeIn.valor_toma || 0) : 0;

  // --------- pagos múltiples
  const [pagos, setPagos] = useState([{ id: 1, metodo: "efectivo", monto: "" }]);
  const addPago = () => {
    const maxId = pagos.reduce((m, p) => Math.max(m, p.id), 0);
    setPagos((prev) => [...prev, { id: maxId + 1, metodo: "efectivo", monto: "" }]);
  };
  const removePago = (id) => setPagos((prev) => prev.filter((p) => p.id !== id));
  const updatePago = (id, patch) =>
    setPagos((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const totalACobrar = useMemo(() => Math.max(0, total - valorToma), [total, valorToma]);
  const totalPagado = useMemo(() => pagos.reduce((a, p) => a + Number(p.monto || 0), 0), [pagos]);
  const restante = useMemo(() => Number((totalACobrar - totalPagado).toFixed(2)), [totalACobrar, totalPagado]);

  // --------- cliente
  const [cliente, setCliente] = useState({
    nombre: "",
    telefono: "",
    email: "",
    documento: "",
    direccion: "",
  });

  // --------- tarjetas resumen y snack
  const [ventasHoy, setVentasHoy] = useState({ total: 0, cantidad: 0 });
  const [stockCount, setStockCount] = useState(0);
  const [snack, setSnack] = useState(null);

  // --------- confirmación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ---------- buscar productos (debounced)
  useEffect(() => {
    window.clearTimeout(tRef.current);
    tRef.current = window.setTimeout(async () => {
      try {
        setLoadingSearch(true);
        const data = await apiProductosDisponibles(query);
        // Pasamos info para dropdown y carrito
        setOpciones(
          data.map((p) => ({
            id: p.id,
            modelo: p.modelo,
            almacenamiento_gb: p.almacenamiento_gb,
            color: p.color,
            estado: p.estado, // por si tu API lo envía
            bateria_salud: p.bateria_salud,
            imei_1: p.imei_1,
            imei_2: p.imei_2,
            sku: p.sku,
            status_stock: p.status_stock,
            precio_lista: Number(p.precio_lista || 0),
            precio: Number(p.precio_lista || 0),
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

  // ---------- métricas de hoy
  useEffect(() => {
    (async () => {
      try {
        const data = await apiListarVentas();
        const hoy = new Date().toISOString().slice(0, 10);
        let totalH = 0;
        let cant = 0;
        for (const v of data) {
          if ((v.fecha_venta || "").slice(0, 10) === hoy) {
            cant += 1;
            totalH += Number(v.total || 0);
          }
        }
        setVentasHoy({ total: totalH, cantidad: cant });
      } catch {
        setVentasHoy({ total: 0, cantidad: 0 });
      }
    })();
  }, []);

  // ---------- validar + abrir confirmación
  function handleSubmitAsk(e) {
    e.preventDefault();
    if (items.length === 0) {
      setSnack({ sev: "warning", msg: "Agregá al menos un producto" });
      return;
    }
    if (totalACobrar > 0 && pagos.length === 0) {
      setSnack({ sev: "warning", msg: "Agregá al menos un pago" });
      return;
    }
    if (Math.abs(restante) > 0.01) {
      setSnack({
        sev: "warning",
        msg:
          restante > 0
            ? `Falta imputar $ ${currency(restante)}`
            : `Hay vuelto/extra imputado por $ ${currency(-restante)}`,
      });
      return;
    }
    setConfirmOpen(true);
  }

  // ---------- submit real si confirma
  async function doSubmit() {
    try {
      setSubmitting(true);
      const payload = {
        cliente: {
          nombre: (cliente.nombre || "").trim() || null,
          telefono: (cliente.telefono || "").trim() || null,
          email: (cliente.email || "").trim() || null,
          documento: (cliente.documento || "").trim() || null,
          direccion: (cliente.direccion || "").trim() || null,
        },
        items: items.map((it) => ({
          producto_id: it.id,
          precio_unit: Number(it.precio_unit || 0),
        })),
        descuento: Number(descuento || 0),
        impuestos: Number(impuestos || 0),
        subtotal: Number(subtotal || 0),
        total: Number(total || 0),
        trade_in: tradeInEnabled
          ? {
              modelo: (tradeIn.modelo || "").trim() || null,
              almacenamiento_gb: tradeIn.almacenamiento_gb
                ? Number(tradeIn.almacenamiento_gb)
                : null,
              color: (tradeIn.color || "").trim() || null,
              condicion: tradeIn.condicion || "usado",
              imei_1: (tradeIn.imei_1 || "").trim() || null,
              imei_2: (tradeIn.imei_2 || "").trim() || null,
              valor_toma: Number(tradeIn.valor_toma || 0),
              notas: (tradeIn.notas || "").trim() || null,
            }
          : null,
        pagos: pagos
          .filter((p) => Number(p.monto || 0) > 0)
          .map((p) => ({ metodo: p.metodo, monto: Number(p.monto || 0) })),
        total_a_cobrar: Number(totalACobrar || 0),
        total_pagado: Number(totalPagado || 0),
      };

      const res = await apiCrearVenta(payload);

      setSnack({
        sev: "success",
        msg: `Venta #${res?.venta_id ?? "—"} registrada (Total $ ${currency(
          res?.total ?? total
        )})`,
      });

      // reset
      setItems([]);
      setDescuento(0);
      setImpuestos(0);
      setPagos([{ id: 1, metodo: "efectivo", monto: "" }]);
      setTradeInEnabled(false);
      setTradeIn({
        modelo: "",
        almacenamiento_gb: "",
        color: "",
        condicion: "usado",
        imei_1: "",
        imei_2: "",
        valor_toma: 0,
        notas: "",
      });
      setCliente({
        nombre: "",
        telefono: "",
        email: "",
        documento: "",
        direccion: "",
      });
      onCreated?.(res);

      // refrescar tarjetas
      try {
        const data = await apiListarVentas();
        const hoy = new Date().toISOString().slice(0, 10);
        let totalH = 0;
        let cant = 0;
        for (const v of data) {
          if ((v.fecha_venta || "").slice(0, 10) === hoy) {
            cant += 1;
            totalH += Number(v.total || 0);
          }
        }
        setVentasHoy({ total: totalH, cantidad: cant });
      } catch {}
      try {
        const disp = await apiProductosDisponibles("");
        setStockCount(disp.length);
      } catch {}
    } catch (err) {
      setSnack({ sev: "error", msg: err.message || "Error al registrar la venta" });
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto" }}>
      <Typography
        variant="h4"
        fontWeight={800}
        sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, color: "text.main" }}
      >
        <SmartphoneIcon sx={{ color: "warning.main" }} /> Módulo de Ventas
      </Typography>

      <Paper
        sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, overflow: "visible", position: "relative" }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PaymentsIcon sx={{ color: "warning.main" }} /> Nueva Venta
        </Typography>
        <Typography variant="body2" color="text.main" sx={{ mb: 2 }}>
          Elegí los equipos a vender, cargá datos del cliente, pagos y (si aplica) parte de pago.
        </Typography>

        {/* ⚠️ ahora valida y abre confirmación */}
        <form onSubmit={handleSubmitAsk}>
          <Stack spacing={2}>
            {/* Buscar y agregar productos */}
            <Typography variant="caption" sx={{ display: "block", mb: 0.5, color: "text.main" }}>
              resultados: {opciones.length} {query ? `(q="${query}")` : ""}
            </Typography>

            <BuscarProductoPro
              options={opciones}
              loading={loadingSearch}
              onSearch={(v) => setQuery(v)}
              onPick={(opt) => addItem(opt)}
              textFieldProps={selectFixProps}
              disablePortal
              dropdownVariant="elevated"
            />

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
                <Box sx={{ p: 2, color: "text.secondary" }}>
                  No agregaste productos todavía.
                </Box>
              ) : (
                <Stack sx={{ p: 1.5 }} spacing={1}>
                  {items.map((it) => (
                    <Paper key={it.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ flex: 1, minWidth: 220 }}>
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

            {/* Datos del cliente */}
            <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  bgcolor: "background.default",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <GroupIcon color="warning" />
                <Typography fontWeight={700} sx={{ color: "text.main" }}>
                  Datos del cliente (opcional)
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Nombre y apellido"
                      fullWidth
                      value={cliente.nombre}
                      onChange={(e) => setCliente((c) => ({ ...c, nombre: e.target.value }))}
                      {...selectFixProps}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Documento (DNI/CUIL)"
                      fullWidth
                      value={cliente.documento}
                      onChange={(e) => setCliente((c) => ({ ...c, documento: e.target.value }))}
                      {...selectFixProps}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Teléfono"
                      fullWidth
                      value={cliente.telefono}
                      onChange={(e) => setCliente((c) => ({ ...c, telefono: e.target.value }))}
                      {...selectFixProps}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Email"
                      type="email"
                      fullWidth
                      value={cliente.email}
                      onChange={(e) => setCliente((c) => ({ ...c, email: e.target.value }))}
                      {...selectFixProps}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Dirección"
                      fullWidth
                      value={cliente.direccion}
                      onChange={(e) => setCliente((c) => ({ ...c, direccion: e.target.value }))}
                      {...selectFixProps}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>

            {/* Parte de pago (Trade-in) */}
            <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  bgcolor: "background.default",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <HandshakeIcon color="warning" />
                  <Typography fontWeight={700} sx={{ color: "text.main" }}>
                    Parte de pago (opcional)
                  </Typography>
                </Stack>
                <FormControlLabel
                  control={
                    <Switch
                      checked={tradeInEnabled}
                      onChange={(e) => setTradeInEnabled(e.target.checked)}
                    />
                  }
                  label="Recibe equipo como parte de pago"
                />
              </Box>

              {tradeInEnabled && (
                <Box sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Modelo"
                        fullWidth
                        value={tradeIn.modelo}
                        onChange={(e) => setTradeIn((t) => ({ ...t, modelo: e.target.value }))}
                        {...selectFixProps}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        label="Almacenamiento (GB)"
                        type="number"
                        fullWidth
                        value={tradeIn.almacenamiento_gb}
                        onChange={(e) =>
                          setTradeIn((t) => ({ ...t, almacenamiento_gb: e.target.value }))
                        }
                        {...selectFixProps}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        label="Color"
                        fullWidth
                        value={tradeIn.color}
                        onChange={(e) => setTradeIn((t) => ({ ...t, color: e.target.value }))}
                        {...selectFixProps}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth {...selectFixProps}>
                        <InputLabel>Condición</InputLabel>
                        <Select
                          label="Condición"
                          value={tradeIn.condicion}
                          onChange={(e) => setTradeIn((t) => ({ ...t, condicion: e.target.value }))}
                        >
                          <MenuItem value="nuevo">Nuevo</MenuItem>
                          <MenuItem value="usado">Usado</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        label="IMEI 1"
                        fullWidth
                        value={tradeIn.imei_1}
                        onChange={(e) => setTradeIn((t) => ({ ...t, imei_1: e.target.value }))}
                        {...selectFixProps}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        label="IMEI 2"
                        fullWidth
                        value={tradeIn.imei_2}
                        onChange={(e) => setTradeIn((t) => ({ ...t, imei_2: e.target.value }))}
                        {...selectFixProps}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        label="Valor de toma ($)"
                        type="number"
                        inputProps={{ step: "0.01", min: 0 }}
                        fullWidth
                        value={tradeIn.valor_toma}
                        onChange={(e) => setTradeIn((t) => ({ ...t, valor_toma: e.target.value }))}
                        {...selectFixProps}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        label="Notas"
                        fullWidth
                        value={tradeIn.notas}
                        onChange={(e) => setTradeIn((t) => ({ ...t, notas: e.target.value }))}
                        {...selectFixProps}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>

            {/* Pagos múltiples */}
            <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  bgcolor: "background.default",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <ReceiptLongIcon color="warning" />
                <Typography fontWeight={700} sx={{ color: "text.main" }}>
                  Pagos
                </Typography>
              </Box>

              <Stack spacing={1.25} sx={{ p: 2 }}>
                {/* Filas de pago */}
                {pagos.map((p) => (
                  <Paper key={p.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={5}>
                        <FormControl fullWidth {...selectFixProps}>
                          <InputLabel>Método</InputLabel>
                          <Select
                            label="Método"
                            value={p.metodo}
                            onChange={(e) => updatePago(p.id, { metodo: e.target.value })}
                          >
                            {METODOS.map((m) => (
                              <MenuItem key={m.value} value={m.value}>
                                {m.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <TextField
                          label="Monto"
                          type="number"
                          inputProps={{ step: "0.01", min: 0 }}
                          fullWidth
                          value={p.monto}
                          onChange={(e) => updatePago(p.id, { monto: e.target.value })}
                          {...selectFixProps}
                        />
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        md={2}
                        sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}
                      >
                        <IconButton color="error" onClick={() => removePago(p.id)} aria-label="Quitar pago">
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}

                <Button startIcon={<AddIcon />} onClick={addPago}>
                  Agregar pago
                </Button>

                {/* Resumen de pagos */}
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Chip label={`Total a cobrar: $ ${currency(totalACobrar)}`} />
                  <Chip label={`Pagado: $ ${currency(totalPagado)}`} color="success" variant="outlined" />
                  <Chip
                    label={
                      restante === 0
                        ? "OK sin saldo"
                        : restante > 0
                        ? `Falta: $ ${currency(restante)}`
                        : `Vuelto: $ ${currency(-restante)}`
                    }
                    color={restante === 0 ? "success" : restante > 0 ? "warning" : "info"}
                    variant={restante === 0 ? "filled" : "outlined"}
                  />
                </Stack>
              </Stack>
            </Box>

            {/* Totales globales */}
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
                  Totales
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
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
                  <Grid item xs={12} md={3}>
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
                  <Grid item xs={12} md={6}>
                    <Stack
                      direction="row"
                      spacing={4}
                      justifyContent="flex-end"
                      sx={{ height: "100%", alignItems: "center" }}
                    >
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
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Box>

            {/* Submit -> abre confirmación */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<AddShoppingCartIcon />}
              disabled={submitting}
            >
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
              <Typography variant="h5" fontWeight={800}>
                $ {currency(ventasHoy.total)}
              </Typography>
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
              <Typography variant="h5" fontWeight={800}>
                {ventasHoy.cantidad}
              </Typography>
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
              <Typography variant="h5" fontWeight={800}>
                {stockCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={!!snack}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {snack ? (
          <Alert onClose={() => setSnack(null)} severity={snack.sev} variant="filled">
            {snack.msg}
          </Alert>
        ) : null}
      </Snackbar>

      {/* Diálogo de confirmación */}
      <Dialog
        open={confirmOpen}
        onClose={() => !submitting && setConfirmOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>¿Confirmás la venta?</DialogTitle>
        <DialogContent dividers sx={{ display: "grid", gap: 1.25, pt: 2 }}>
          {items.map((it) => {
            const imei = it.imei_1 || it.imei_2 || "—";
            const condicion = it.estado === "nuevo" ? "Nuevo" : "Usado";
            return (
              <Typography key={it.id} variant="body2">
                • <strong>{it.modelo || "iPhone"}</strong>{" "}
                {it.almacenamiento_gb ? `${it.almacenamiento_gb}GB` : ""} —{" "}
                {it.color || "—"} — {condicion} — IMEI:{" "}
                <span
                  style={{
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                  }}
                >
                  {imei}
                </span>
              </Typography>
            );
          })}
          <Typography variant="subtitle2" sx={{ mt: 1.25 }}>
            Total a cobrar: <strong>${currency(totalACobrar)}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={doSubmit} disabled={submitting}>
            Sí, vender
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

VentasAlta.propTypes = { onCreated: PropTypes.func };
VentasAlta.defaultProps = { onCreated: () => {} };
