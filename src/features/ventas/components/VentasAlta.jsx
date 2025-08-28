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
  ListSubheader,
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
          maxHeight: 420,
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

function n2(v) {
  const x = Number(v || 0);
  return Number.isFinite(x) ? x : 0;
}
const f2 = (n) =>
  n2(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const usd = (n) => `US$ ${f2(n)}`;
const ars = (n) => `ARS ${f2(n)}`;

const METODOS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "debito", label: "Débito" },
  { value: "credito", label: "Crédito" },
  { value: "transferencia", label: "Transferencia" },
];

const MONEDAS = [
  { value: "USD", label: "USD" },
  { value: "ARS", label: "ARS" },
];

/* ======= Listas de modelos ======= */
const IPHONE_MODELOS = [
  "iPhone X","iPhone XR","iPhone XS","iPhone XS Max",
  "iPhone 11","iPhone 11 Pro","iPhone 11 Pro Max",
  "iPhone 12 mini","iPhone 12","iPhone 12 Pro","iPhone 12 Pro Max",
  "iPhone 13 mini","iPhone 13","iPhone 13 Pro","iPhone 13 Pro Max",
  "iPhone 14","iPhone 14 Plus","iPhone 14 Pro","iPhone 14 Pro Max",
  "iPhone 15","iPhone 15 Plus","iPhone 15 Pro","iPhone 15 Pro Max",
  "iPhone 16","iPhone 16 Plus","iPhone 16 Pro","iPhone 16 Pro Max",
];
const WATCH_MODELOS = [
  "Apple Watch Series 3","Apple Watch Series 4","Apple Watch Series 5",
  "Apple Watch Series 6","Apple Watch SE (1ª gen)","Apple Watch SE (2ª gen)",
  "Apple Watch Series 7","Apple Watch Series 8","Apple Watch Series 9",
  "Apple Watch Ultra","Apple Watch Ultra 2",
];
const MACBOOK_MODELOS = [
  'MacBook Air 13" (Intel)','MacBook Air 13" M1','MacBook Air 13" M2',
  'MacBook Air 15" M2','MacBook Air 13" M3','MacBook Air 15" M3',
  'MacBook Pro 13" (Intel)','MacBook Pro 13" M1',
  'MacBook Pro 14" M1 Pro','MacBook Pro 14" M2 Pro','MacBook Pro 14" M3 Pro',
  'MacBook Pro 16" M1 Pro/Max','MacBook Pro 16" M2 Pro/Max','MacBook Pro 16" M3 Pro/Max',
];

/* Almacenamientos fijos */
const ALMACENAMIENTOS = [32, 64, 128, 256, 512, 1000];

// etiqueta legible del item
const makeLabel = (o) =>
  `${o.modelo ?? ""} ${o.almacenamiento_gb ?? ""}GB • ${o.color ?? ""}${
    o.bateria_salud ? ` • Bat ${o.bateria_salud}%` : ""
  }${o.sku ? ` • #${o.sku}` : ""}`.trim();

export default function VentasAlta({ onCreated }) {
  // --------- búsqueda productos
  const [query, setQuery] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [opciones, setOpciones] = useState([]);
  const tRef = useRef(null);

  // --------- carrito
  const [items, setItems] = useState([]);
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
  const removeItem = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

  // --------- totales (USD)
  const [descuento, setDescuento] = useState(0);
  const [impuestos, setImpuestos] = useState(0);
  const subtotal = useMemo(
    () => items.reduce((acc, it) => acc + n2(it.precio_unit), 0),
    [items]
  );
  const total = useMemo(
    () => Math.max(0, n2(subtotal) - n2(descuento) + n2(impuestos)),
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
    bateria_salud: "", // NUEVO: salud de batería %
  });
  const valorToma = tradeInEnabled ? n2(tradeIn.valor_toma) : 0;

  // --------- pagos múltiples
  const [tasaArsUsd, setTasaArsUsd] = useState(1355);
  const [pagos, setPagos] = useState([
    { id: 1, metodo: "efectivo", moneda: "USD", monto: "" },
  ]);
  const addPago = () => {
    const maxId = pagos.reduce((m, p) => Math.max(m, p.id), 0);
    setPagos((prev) => [
      ...prev,
      { id: maxId + 1, metodo: "efectivo", moneda: "USD", monto: "" },
    ]);
  };
  const removePago = (id) => setPagos((prev) => prev.filter((p) => p.id !== id));
  const updatePago = (id, patch) =>
    setPagos((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = { ...p, ...patch };
        if (next.moneda === "ARS" && typeof next.tasa !== "undefined") {
          const t = Number(next.tasa || 0);
          if (t > 0) setTasaArsUsd(t);
        }
        return next;
      })
    );

  // helpers de conversión
  const pagoUSD = (p) =>
    p.moneda === "USD" ? n2(p.monto) : n2(p.monto) / (n2(p.tasa || tasaArsUsd) || 1);
  const totalACobrar = useMemo(() => Math.max(0, total - valorToma), [total, valorToma]);
  const totalPagadoUSD = useMemo(
    () => pagos.reduce((a, p) => a + pagoUSD(p), 0),
    [pagos, tasaArsUsd]
  );
  const restanteUSD = useMemo(
    () => Number((totalACobrar - totalPagadoUSD).toFixed(2)),
    [totalACobrar, totalPagadoUSD]
  );

  // equivalentes ARS
  const totalACobrarARS = useMemo(
    () => totalACobrar * n2(tasaArsUsd),
    [totalACobrar, tasaArsUsd]
  );
  const totalPagadoARS = useMemo(
    () => totalPagadoUSD * n2(tasaArsUsd),
    [totalPagadoUSD, tasaArsUsd]
  );
  const restanteARS = useMemo(
    () => restanteUSD * n2(tasaArsUsd),
    [restanteUSD, tasaArsUsd]
  );

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
        setOpciones(
          data.map((p) => ({
            id: p.id,
            modelo: p.modelo,
            almacenamiento_gb: p.almacenamiento_gb,
            color: p.color,
            estado: p.estado,
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
            totalH += n2(v.total);
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
    if (Math.abs(restanteUSD) > 0.01) {
      setSnack({
        sev: "warning",
        msg:
          restanteUSD > 0
            ? `Falta imputar ${usd(restanteUSD)} (≈ ${ars(restanteARS)})`
            : `Hay vuelto/extra imputado por ${usd(-restanteUSD)} (≈ ${ars(
                -restanteARS
              )})`,
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
          precio_unit: n2(it.precio_unit),
        })),
        descuento: n2(descuento),
        impuestos: n2(impuestos),
        subtotal: n2(subtotal),
        total: n2(total),
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
              valor_toma: n2(tradeIn.valor_toma),
              notas: (tradeIn.notas || "").trim() || null,
              bateria_salud:
                tradeIn.bateria_salud === "" ? null : Number(tradeIn.bateria_salud),
            }
          : null,
        pagos: pagos
          .filter((p) => n2(p.monto) > 0)
          .map((p) => ({
            metodo: p.metodo,
            moneda: p.moneda,
            monto: n2(p.monto),
            tasa: p.moneda === "ARS" ? n2(p.tasa || tasaArsUsd) : null,
          })),
        total_a_cobrar: n2(totalACobrar),
        total_pagado: n2(totalPagadoUSD),
        tasa_ars_usd: n2(tasaArsUsd),
      };

      const res = await apiCrearVenta(payload);

      setSnack({
        sev: "success",
        msg: `Venta #${res?.venta_id ?? "—"} registrada (Total ${usd(
          res?.total ?? total
        )})`,
      });

      // reset
      setItems([]);
      setDescuento(0);
      setImpuestos(0);
      setPagos([{ id: 1, metodo: "efectivo", moneda: "USD", monto: "" }]);
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
        bateria_salud: "",
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
            totalH += n2(v.total);
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

  // helper: clamp 0..100 para el input de batería
  const clampBattery = (val) => {
    if (val === "" || val === null) return "";
    const n = Number(val);
    if (!Number.isFinite(n)) return "";
    return Math.max(0, Math.min(100, Math.round(n)));
  };

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

        {/* valida y abre confirmación */}
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
                <Box sx={{ p: 2, color: "text.secondary" }}>No agregaste productos todavía.</Box>
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
                          label="Precio de venta (USD)"
                          type="number"
                          inputProps={{ step: "0.01", min: 0 }}
                          value={it.precio_unit}
                          onChange={(e) => {
                            const v = e.target.value;
                            setItems((prev) =>
                              prev.map((x) => (x.id === it.id ? { ...x, precio_unit: v } : x))
                            );
                          }}
                          sx={{ width: 200 }}
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
                  control={<Switch checked={tradeInEnabled} onChange={(e) => setTradeInEnabled(e.target.checked)} />}
                  label="Recibe equipo como parte de pago"
                />
              </Box>

              {tradeInEnabled && (
                <Box sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    {/* MODELO */}
                    <Grid item xs={12} md={5}>
                      <FormControl fullWidth {...selectFixProps}>
                        <InputLabel>Modelo (iPhone / Watch / MacBook)</InputLabel>
                        <Select
                          label="Modelo (iPhone / Watch / MacBook)"
                          value={tradeIn.modelo || ""}
                          onChange={(e) =>
                            setTradeIn((t) => ({ ...t, modelo: e.target.value }))
                          }
                          renderValue={(v) => v || ""}
                        >
                          <ListSubheader disableSticky>iPhone</ListSubheader>
                          {IPHONE_MODELOS.map((m) => (
                            <MenuItem key={`iph-${m}`} value={m}>
                              {m}
                            </MenuItem>
                          ))}
                          <ListSubheader disableSticky>Apple Watch</ListSubheader>
                          {WATCH_MODELOS.map((m) => (
                            <MenuItem key={`wat-${m}`} value={m}>
                              {m}
                            </MenuItem>
                          ))}
                          <ListSubheader disableSticky>MacBook</ListSubheader>
                          {MACBOOK_MODELOS.map((m) => (
                            <MenuItem key={`mac-${m}`} value={m}>
                              {m}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* ALMACENAMIENTO */}
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth {...selectFixProps}>
                        <InputLabel>Almacenamiento (GB)</InputLabel>
                        <Select
                          label="Almacenamiento (GB)"
                          value={tradeIn.almacenamiento_gb || ""}
                          onChange={(e) =>
                            setTradeIn((t) => ({
                              ...t,
                              almacenamiento_gb: e.target.value,
                            }))
                          }
                          renderValue={(v) => (v ? `${v}` : "")}
                        >
                          {ALMACENAMIENTOS.map((g) => (
                            <MenuItem key={g} value={g}>
                              {g === 1000 ? "1000 (1 TB)" : g}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* COLOR */}
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Color"
                        fullWidth
                        value={tradeIn.color}
                        onChange={(e) => setTradeIn((t) => ({ ...t, color: e.target.value }))}
                        {...selectFixProps}
                      />
                    </Grid>

                    {/* CONDICIÓN */}
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

                    {/* IMEIs */}
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

                    {/* Salud de Batería (NUEVO) */}
                    <Grid item xs={12} md={3}>
                      <TextField
                        label="Salud de batería (%)"
                        type="number"
                        inputProps={{ step: 1, min: 0, max: 100 }}
                        fullWidth
                        value={tradeIn.bateria_salud}
                        onChange={(e) =>
                          setTradeIn((t) => ({
                            ...t,
                            bateria_salud: clampBattery(e.target.value),
                          }))
                        }
                        {...selectFixProps}
                      />
                    </Grid>

                    {/* Valor toma + Notas */}
                    <Grid item xs={12} md={3}>
                      <TextField
                        label="Valor de toma (USD)"
                        type="number"
                        inputProps={{ step: "0.01", min: 0 }}
                        fullWidth
                        value={tradeIn.valor_toma}
                        onChange={(e) => setTradeIn((t) => ({ ...t, valor_toma: e.target.value }))}
                        {...selectFixProps}
                      />
                    </Grid>
                    <Grid item xs={12}>
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
                  justifyContent: "space-between",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <ReceiptLongIcon color="warning" />
                  <Typography fontWeight={700} sx={{ color: "text.main" }}>
                    Pagos
                  </Typography>
                </Stack>
                <Chip
                  size="small"
                  label={`Blue/ref.: 1 USD = ${f2(tasaArsUsd)}`}
                  sx={{ bgcolor: "warning.softBg", color: "warning.darker", fontWeight: 600 }}
                />
              </Box>

              <Stack spacing={1.25} sx={{ p: 2 }}>
                {pagos.map((p) => {
                  const eqUSD =
                    p.moneda === "ARS"
                      ? n2(p.monto) / (n2(p.tasa || tasaArsUsd) || 1)
                      : n2(p.monto);

                  return (
                    <Paper key={p.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
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

                        <Grid item xs={6} md={2}>
                          <FormControl fullWidth {...selectFixProps}>
                            <InputLabel>Moneda</InputLabel>
                            <Select
                              label="Moneda"
                              value={p.moneda}
                              onChange={(e) =>
                                updatePago(p.id, {
                                  moneda: e.target.value,
                                  ...(e.target.value === "USD" ? { tasa: undefined } : null),
                                })
                              }
                            >
                              {MONEDAS.map((m) => (
                                <MenuItem key={m.value} value={m.value}>
                                  {m.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={6} md={3}>
                          <TextField
                            label={p.moneda === "ARS" ? "Monto (ARS)" : "Monto (USD)"}
                            type="number"
                            inputProps={{ step: "0.01", min: 0 }}
                            fullWidth
                            value={p.monto}
                            onChange={(e) => updatePago(p.id, { monto: e.target.value })}
                            {...selectFixProps}
                          />
                        </Grid>

                        {p.moneda === "ARS" && (
                          <Grid item xs={12} md={2}>
                            <TextField
                              label="Tasa ARS→USD"
                              type="number"
                              inputProps={{ step: "0.01", min: 0 }}
                              fullWidth
                              value={p.tasa ?? tasaArsUsd}
                              onChange={(e) => updatePago(p.id, { tasa: e.target.value })}
                              {...selectFixProps}
                            />
                          </Grid>
                        )}

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

                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary">
                            Equivale a: <strong>{usd(eqUSD)}</strong>
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  );
                })}

                <Button startIcon={<AddIcon />} onClick={addPago}>
                  Agregar pago
                </Button>

                {/* Resumen de pagos */}
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={`Total a cobrar: ${usd(totalACobrar)}  •  ≈ ${ars(totalACobrarARS)}`} />
                  <Chip
                    label={`Pagado: ${usd(totalPagadoUSD)}  •  ≈ ${ars(totalPagadoARS)}`}
                    color="success"
                    variant="outlined"
                  />
                  <Chip
                    label={
                      restanteUSD === 0
                        ? "OK sin saldo"
                        : restanteUSD > 0
                        ? `Falta: ${usd(restanteUSD)}  (≈ ${ars(restanteARS)})`
                        : `Vuelto: ${usd(-restanteUSD)}  (≈ ${ars(-restanteARS)})`
                    }
                    color={restanteUSD === 0 ? "success" : restanteUSD > 0 ? "warning" : "info"}
                    variant={restanteUSD === 0 ? "filled" : "outlined"}
                  />
                </Stack>
              </Stack>
            </Box>

            {/* Totales (USD) */}
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
                  Totales (USD)
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Descuento (USD)"
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
                      label="Impuestos (USD)"
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
                          {usd(subtotal)}
                        </Typography>
                      </Stack>
                      <Stack alignItems="flex-end">
                        <Typography variant="body2" color="text.secondary">
                          Total
                        </Typography>
                        <Typography variant="h5" fontWeight={800} color="warning.main">
                          {usd(total)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Box>

            {/* Submit */}
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
              <Typography variant="h5" fontWeight={800}>{usd(ventasHoy.total)}</Typography>
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

      {/* Confirmación */}
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
            Total a cobrar: <strong>{usd(totalACobrar)}</strong> (≈ {ars(totalACobrarARS)})
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
