import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Box, Grid, Card, CardContent, Typography, TextField, InputAdornment, Select, MenuItem,
  FormControl, OutlinedInput, Chip, ToggleButtonGroup, ToggleButton, Button, LinearProgress,
  Avatar, Switch, FormControlLabel, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, Snackbar, Alert,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import HistoryIcon from "@mui/icons-material/History";
import EditIcon from "@mui/icons-material/Edit";

// MUY IMPORTANTE: usar el layout para que no tape el sidenav
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";

// ================== helpers ==================
const API_BASE = process.env.REACT_APP_API_URL || ""; // ej: http://localhost/iphoneShop-backend
const INVENTARIO_URL = `${API_BASE}/api/inventario/index.php`;
const PRODUCTOS_URL  = `${API_BASE}/api/productos/index.php`;

const PLACEHOLDER = `${process.env.PUBLIC_URL || ""}/placeholder-product.jpg`;
function handleImgError(e) {
  const img = e.currentTarget;
  if (img.dataset.fallback === "1") return;
  img.dataset.fallback = "1";
  img.src = PLACEHOLDER;
}

const fUSD = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const batteryColor = (val) => {
  const n = Number(val ?? 0);
  if (n >= 90) return "success";
  if (n >= 70) return "warning";
  return "error";
};

const batteryBarSx = () => ({
  height: 8,
  borderRadius: 999,
  "& .MuiLinearProgress-bar": { borderRadius: 999 },
});

const kpiCard = (title, value, Icon, color = "primary") => (
  <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Box
        sx={(t) => ({
          p: 1.4,
          borderRadius: "50%",
          bgcolor: t.palette[color].light,
          color: t.palette[color].main,
          display: "grid",
          placeItems: "center",
        })}
      >
        <Icon />
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>
          {title}
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          {value}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

// ================== tipos ==================
const productShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  sku: PropTypes.string,
  marca: PropTypes.string,
  modelo: PropTypes.string.isRequired,
  almacenamiento_gb: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  bateria_salud: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  bateria_ciclos: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  color: PropTypes.string.isRequired,
  estado: PropTypes.oneOf(["nuevo", "usado"]).isRequired,
  origen: PropTypes.string,
  costo: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  precio_lista: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  garantia_meses: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  status_stock: PropTypes.string,
  imagen_url: PropTypes.string,
  imei_1: PropTypes.string,
  imei_2: PropTypes.string,
});

const renderImeis = (p) => {
  const i1 = p.imei_1 && String(p.imei_1).trim();
  const i2 = p.imei_2 && String(p.imei_2).trim();
  if (!i1 && !i2) return "—";
  if (i1 && i2) return `${i1} / ${i2}`;
  return i1 || i2;
};

// ================== items ==================
function ProductCard({ p, showCost, onEdit, onDelete }) {
  const precio = Number(p.precio_lista || 0);
  const costo = Number(p.costo || 0);
  const margen = precio - costo;
  const margenPct = costo > 0 ? Math.round((margen / costo) * 100) : 0;

  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", height: "100%" }}>
      <Box sx={{ p: 2, pb: 0 }}>
        {/* Imagen más chica, siempre completa */}
        <Box
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "grey.100",
            display: "grid",
            placeItems: "center",
            height: { xs: 180, sm: 200, md: 220, lg: 240, xl: 260 }, // << tamaño controlado
          }}
        >
          <Box
            component="img"
            src={p.imagen_url || PLACEHOLDER}
            alt={p.modelo}
            loading="lazy"
            onError={handleImgError}
            sx={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain", // << muestra el equipo completo
              display: "block",
            }}
          />
        </Box>
      </Box>

      <CardContent sx={{ pt: 1.5 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          {p.modelo}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>
          {p.color}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            display: "block",
            mb: 0.5,
          }}
          color="text.secondary"
          title={renderImeis(p)}
        >
          IMEI: {renderImeis(p)}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Typography variant="body2">💾 {p.almacenamiento_gb}GB</Typography>
          <Chip
            size="small"
            label={p.estado === "nuevo" ? "Nuevo" : "Usado"}
            sx={(t) => ({
              height: 20,
              fontSize: 12,
              fontWeight: 700,
              bgcolor: p.estado === "nuevo" ? t.palette.success.main : t.palette.secondary.dark,
              color: "#fff",
            })}
          />
        </Box>

        <Typography variant="caption" color="text.secondary">
          🔋 Batería
        </Typography>
        <LinearProgress
          variant="determinate"
          value={Number(p.bateria_salud || 0)}
          color={batteryColor(p.bateria_salud)}
          sx={batteryBarSx()}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {p.bateria_salud ?? 0}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Stock
          </Typography>
        </Box>

        {showCost && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            Costo {fUSD.format(costo)} · Margen {margenPct >= 0 ? `+${margenPct}%` : `${margenPct}%`}
          </Typography>
        )}

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1.5 }}>
          <Typography variant="h6" fontWeight={800} color="primary.main">
            {fUSD.format(precio)}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => onEdit(p)}
              sx={{
                borderColor: "primary.main",
                color: "primary.main",
                fontWeight: 700,
                "&:hover": { bgcolor: "primary.main", color: "#fff", borderColor: "primary.main" },
              }}
            >
              Editar
            </Button>
            <Button size="small" variant="contained" color="error" onClick={() => onDelete(p)}>
              Eliminar
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
ProductCard.propTypes = {
  p: productShape.isRequired,
  showCost: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

function ProductRow({ p, showCost, onEdit, onDelete }) {
  const precio = Number(p.precio_lista || 0);
  const costo = Number(p.costo || 0);
  const margen = precio - costo;
  const margenPct = costo > 0 ? Math.round((margen / costo) * 100) : 0;

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        p: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 2,
        bgcolor: "background.paper",
      }}
    >
      <Avatar
        variant="rounded"
        src={p.imagen_url || PLACEHOLDER}
        alt={p.modelo}
        onError={handleImgError}
        sx={{ width: 64, height: 64, borderRadius: 2 }}
      />
      <Box sx={{ flex: 1, minWidth: 220 }}>
        <Typography fontWeight={700}>{p.modelo}</Typography>
        <Typography variant="body2" color="text.secondary">
          {p.color}
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}
          color="text.secondary"
          title={renderImeis(p)}
        >
          IMEI: {renderImeis(p)}
        </Typography>
      </Box>
      <Box sx={{ width: 110 }}>
        <Typography variant="body2">{p.almacenamiento_gb}GB</Typography>
      </Box>
      <Box sx={{ width: 120 }}>
        <Chip
          size="small"
          label={p.estado === "nuevo" ? "Nuevo" : "Usado"}
          sx={(t) => ({
            fontWeight: 700,
            bgcolor: p.estado === "nuevo" ? t.palette.success.main : t.palette.secondary.dark,
            color: "#fff",
          })}
        />
      </Box>
      <Box sx={{ width: 180 }}>
        <Typography variant="caption" color="text.secondary">
          Batería
        </Typography>
        <LinearProgress
          variant="determinate"
          value={Number(p.bateria_salud || 0)}
          color={batteryColor(p.bateria_salud)}
          sx={batteryBarSx()}
        />
      </Box>
      <Box sx={{ width: 140, textAlign: "right" }}>
        <Typography variant="h6" fontWeight={800} color="primary.main">
          {fUSD.format(precio)}
        </Typography>
        {showCost && (
          <Typography variant="caption" color="text.secondary">
            C {fUSD.format(costo)} · {margenPct >= 0 ? `+${margenPct}%` : `${margenPct}%`}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => onEdit(p)}
          sx={{
            borderColor: "primary.main",
            color: "primary.main",
            fontWeight: 700,
            "&:hover": { bgcolor: "primary.main", color: "#fff", borderColor: "primary.main" },
          }}
        >
          Editar
        </Button>
        <Button size="small" variant="contained" color="error" onClick={() => onDelete(p)}>
          Eliminar
        </Button>
      </Box>
    </Box>
  );
}
ProductRow.propTypes = {
  p: productShape.isRequired,
  showCost: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

// ================== página ==================
export default function InventarioPage() {
  const [view, setView] = useState("grid"); // 'grid' | 'list'
  const [query, setQuery] = useState("");
  const [modelo, setModelo] = useState("all");
  const [color, setColor] = useState("all");
  const [almacenamiento, setAlmacenamiento] = useState("all");
  const [estado, setEstado] = useState("all");
  const [minBat, setMinBat] = useState("");
  const [showCost, setShowCost] = useState(false);

  const [data, setData] = useState([]);
  const [kpis, setKpis] = useState({
    total: 0,
    valor_venta: 0,
    valor_costo: 0,
    nuevos: 0,
    usados: 0,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Diálogos
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [delOpen, setDelOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" });

  function openEdit(p) {
    setSelected(p);
    setEditData({
      id: p.id,
      sku: p.sku || "",
      precio_lista: p.precio_lista ?? 0,
      costo: p.costo ?? 0,
      estado: p.estado || "usado",
      bateria_salud: p.bateria_salud ?? "",
      bateria_ciclos: p.bateria_ciclos ?? "",
      color: p.color || "",
      almacenamiento_gb: p.almacenamiento_gb ?? "",
      status_stock: p.status_stock || "disponible",
    });
    setEditOpen(true);
  }
  function openDelete(p) {
    setSelected(p);
    setDelOpen(true);
  }
  function closeDialogs() {
    setEditOpen(false);
    setDelOpen(false);
    setSelected(null);
  }
  const toNumberOrNull = (v) => {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  async function saveEdit() {
    if (!editData?.id) return;
    try {
      const payload = {
        sku: editData.sku || null,
        precio_lista: toNumberOrNull(editData.precio_lista),
        costo: toNumberOrNull(editData.costo),
        estado: editData.estado,
        bateria_salud: toNumberOrNull(editData.bateria_salud),
        bateria_ciclos: toNumberOrNull(editData.bateria_ciclos),
        color: editData.color,
        almacenamiento_gb: toNumberOrNull(editData.almacenamiento_gb),
        status_stock: editData.status_stock,
      };

      const res = await fetch(`${PRODUCTOS_URL}?id=${editData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();

      setData((prev) => prev.map((x) => (String(x.id) === String(updated.id) ? { ...x, ...updated } : x)));
      setToast({ open: true, sev: "success", msg: "Producto actualizado" });
      closeDialogs();
    } catch (e) {
      setToast({ open: true, sev: "error", msg: e.message || "Error al actualizar" });
    }
  }

  async function confirmDelete() {
    if (!selected?.id) return;
    try {
      const res = await fetch(`${PRODUCTOS_URL}?id=${selected.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData((prev) => prev.filter((x) => String(x.id) !== String(selected.id)));
      setToast({ open: true, sev: "success", msg: "Producto eliminado" });
      closeDialogs();
    } catch (e) {
      setToast({ open: true, sev: "error", msg: e.message || "Error al eliminar" });
    }
  }

  // ---- fetch server-side filtering
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setErr("");

    const params = new URLSearchParams();
    params.set("status_stock", "disponible");
    if (query) params.set("q", query);
    if (modelo !== "all") params.set("modelo", modelo);
    if (color !== "all") params.set("color", color);
    if (almacenamiento !== "all") params.set("almacenamiento_gb", almacenamiento);
    if (estado !== "all") params.set("estado", estado);
    if (minBat !== "") params.set("min_bateria", minBat);

    fetch(`${INVENTARIO_URL}?${params.toString()}`, { signal: ctrl.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        const items = Array.isArray(json.items) ? json.items : [];
        setData(items);

        const meta = json.meta || {};
        const bkKpis = meta.kpis || {};

        const valorVenta = items.reduce((acc, p) => acc + Number(p.precio_lista || 0), 0);
        const valorCosto = items.reduce((acc, p) => acc + Number(p.costo || 0), 0);
        const nuevosF = items.filter((p) => p.estado === "nuevo").length;
        const usadosF = items.filter((p) => p.estado === "usado").length;

        setKpis({
          total: Number(bkKpis.total ?? items.length),
          valor_venta: Number(bkKpis.valor_venta ?? valorVenta),
          valor_costo: Number(bkKpis.valor_costo ?? valorCosto),
          nuevos: Number(bkKpis.nuevos ?? nuevosF),
          usados: Number(bkKpis.usados ?? usadosF),
        });
      })
      .catch((e) => {
        if (e.name !== "AbortError") setErr(e.message || "Error");
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [query, modelo, color, almacenamiento, estado, minBat]);

  // catálogos (desde la data actual)
  const modelos = useMemo(() => Array.from(new Set(data.map((d) => d.modelo))).sort(), [data]);
  const colores = useMemo(() => Array.from(new Set(data.map((d) => d.color))).sort(), [data]);
  const almacs = useMemo(
    () => Array.from(new Set(data.map((d) => String(d.almacenamiento_gb)))).sort((a, b) => Number(a) - Number(b)),
    [data]
  );

  // front styles helper
  const controlSx = (minWidth = 160) => ({
    minWidth,
    bgcolor: "background.paper",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "primary.light" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
    "& .MuiSelect-select, & input": { py: 1.1 },
  });

  const placeholder = (text) => (
    <Typography variant="body2" color="text.disabled">
      {text}
    </Typography>
  );

  return (
    <DashboardLayout showPageHeader={false}>
      <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
        <Typography variant="h4" fontWeight={800} sx={{ textAlign: "center" }}>
          Inventario iPhone
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mb: 3 }}>
          Gestión profesional de stock
        </Typography>

        {/* KPIs */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            {kpiCard("Total Dispositivos", kpis.total, Inventory2OutlinedIcon, "secondary")}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {kpiCard("Valor Potencial (venta)", fUSD.format(kpis.valor_venta), TrendingUpIcon, "warning")}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {kpiCard("Nuevos", kpis.nuevos, FiberNewIcon, "success")}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {kpiCard("Usados", kpis.usados, HistoryIcon, "secondary")}
          </Grid>

          {showCost && (
            <Grid item xs={12} sm={6} md={3}>
              {kpiCard("Valor Inventario (costo)", fUSD.format(kpis.valor_costo), PhoneIphoneIcon, "info")}
            </Grid>
          )}
        </Grid>

        {/* Filtros */}
        <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 2 }}>
          <CardContent sx={{ display: "flex", gap: 12 / 8, flexWrap: "wrap", alignItems: "center" }}>
            <TextField
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por modelo, color o SKU…"
              size="small"
              fullWidth
              variant="outlined"
              sx={controlSx(280)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={controlSx()}>
              <Select
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                input={<OutlinedInput />}
                displayEmpty
                renderValue={(v) => (v === "all" ? placeholder("Todos los modelos") : v)}
              >
                <MenuItem value="all">Todos los modelos</MenuItem>
                {modelos.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={controlSx()}>
              <Select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                input={<OutlinedInput />}
                displayEmpty
                renderValue={(v) => (v === "all" ? placeholder("Todos los colores") : v)}
              >
                <MenuItem value="all">Todos los colores</MenuItem>
                {colores.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={controlSx(190)}>
              <Select
                value={almacenamiento}
                onChange={(e) => setAlmacenamiento(e.target.value)}
                input={<OutlinedInput />}
                displayEmpty
                renderValue={(v) => (v === "all" ? placeholder("Todo el almacenamiento") : `${v} GB`)}
              >
                <MenuItem value="all">Todo el almacenamiento</MenuItem>
                {almacs.map((a) => (
                  <MenuItem key={a} value={a}>
                    {a} GB
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={controlSx()}>
              <Select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                input={<OutlinedInput />}
                displayEmpty
                renderValue={(v) => (v === "all" ? placeholder("Todos los estados") : v === "nuevo" ? "Nuevo" : "Usado")}
              >
                <MenuItem value="all">Todos los estados</MenuItem>
                <MenuItem value="nuevo">Nuevo</MenuItem>
                <MenuItem value="usado">Usado</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Batería mín. %"
              type="number"
              inputProps={{ min: 0, max: 100 }}
              value={minBat}
              onChange={(e) => setMinBat(e.target.value)}
              variant="outlined"
              sx={controlSx(140)}
            />

            <Box sx={{ flex: 1 }} />

            <FormControlLabel
              control={<Switch checked={showCost} onChange={(e) => setShowCost(e.target.checked)} size="small" />}
              label="Mostrar costos"
            />

            <ToggleButtonGroup size="small" value={view} exclusive onChange={(_, v) => v && setView(v)}>
              <ToggleButton
                value="grid"
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": { bgcolor: "primary.dark" },
                  },
                }}
              >
                <ViewModuleIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton
                value="list"
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": { bgcolor: "primary.dark" },
                  },
                }}
              >
                <ViewListIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </CardContent>
        </Card>

        {/* Resultados */}
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Resultados ({data.length})
        </Typography>

        {loading ? (
          <Box sx={{ py: 6, display: "grid", placeItems: "center" }}>
            <CircularProgress size={28} />
          </Box>
        ) : err ? (
          <Typography color="error">Error: {err}</Typography>
        ) : view === "grid" ? (
          <Grid container spacing={2}>
            {data.map((p) => (
              <Grid key={p.id} item xs={12} sm={6} md={4} lg={3} xl={2}>
                <ProductCard p={p} showCost={showCost} onEdit={openEdit} onDelete={openDelete} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={1}>
            {data.map((p) => (
              <Grid key={p.id} item xs={12}>
                <ProductRow p={p} showCost={showCost} onEdit={openEdit} onDelete={openDelete} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Dialogo Editar */}
        <Dialog open={editOpen} onClose={closeDialogs} fullWidth maxWidth="sm">
          <DialogTitle>Editar producto #{editData?.id}</DialogTitle>
          <DialogContent dividers sx={{ display: "grid", gap: 2, pt: 2 }}>
            <TextField label="SKU" value={editData?.sku ?? ""} onChange={(e) => setEditData((d) => ({ ...d, sku: e.target.value }))} size="small" />
            <TextField label="Precio lista (USD)" type="number" value={editData?.precio_lista ?? ""} onChange={(e) => setEditData((d) => ({ ...d, precio_lista: e.target.value }))} size="small" />
            <TextField label="Costo (USD)" type="number" value={editData?.costo ?? ""} onChange={(e) => setEditData((d) => ({ ...d, costo: e.target.value }))} size="small" />
            <FormControl size="small">
              <Select value={editData?.estado ?? "usado"} onChange={(e) => setEditData((d) => ({ ...d, estado: e.target.value }))} displayEmpty input={<OutlinedInput />}>
                <MenuItem value="nuevo">Nuevo</MenuItem>
                <MenuItem value="usado">Usado</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Batería salud (%)" type="number" inputProps={{ min: 0, max: 100 }} value={editData?.bateria_salud ?? ""} onChange={(e) => setEditData((d) => ({ ...d, bateria_salud: e.target.value }))} size="small" />
            <TextField label="Ciclos de batería" type="number" value={editData?.bateria_ciclos ?? ""} onChange={(e) => setEditData((d) => ({ ...d, bateria_ciclos: e.target.value }))} size="small" />
            <TextField label="Color" value={editData?.color ?? ""} onChange={(e) => setEditData((d) => ({ ...d, color: e.target.value }))} size="small" />
            <TextField label="Almacenamiento (GB)" type="number" value={editData?.almacenamiento_gb ?? ""} onChange={(e) => setEditData((d) => ({ ...d, almacenamiento_gb: e.target.value }))} size="small" />
            <FormControl size="small">
              <Select value={editData?.status_stock ?? "disponible"} onChange={(e) => setEditData((d) => ({ ...d, status_stock: e.target.value }))} input={<OutlinedInput />}>
                <MenuItem value="disponible">Disponible</MenuItem>
                <MenuItem value="reservado">Reservado</MenuItem>
                <MenuItem value="vendido">Vendido</MenuItem>
                <MenuItem value="en_reparacion">En reparación</MenuItem>
                <MenuItem value="eliminado">Eliminado</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialogs}>Cancelar</Button>
            <Button variant="contained" onClick={saveEdit}>Guardar</Button>
          </DialogActions>
        </Dialog>

        {/* Confirmar eliminar */}
        <Dialog open={delOpen} onClose={closeDialogs}>
          <DialogTitle>Eliminar producto</DialogTitle>
          <DialogContent dividers>
            <Typography>¿Seguro que querés eliminar el producto #{selected?.id}?</Typography>
            <Typography variant="caption" color="text.secondary">Esta acción elimina el registro y sus imágenes.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialogs}>Cancelar</Button>
            <Button color="error" variant="contained" onClick={confirmDelete}>Eliminar</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={toast.open}
          autoHideDuration={2500}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={toast.sev} onClose={() => setToast((t) => ({ ...t, open: false }))}>
            {toast.msg}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  );
}
