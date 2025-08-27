// src/layouts/dashboard/index.js
import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Box,
  Typography,
  Card,
  Button,
  Paper,
  Chip,
  Divider,
} from "@mui/material";
import { keyframes } from "@mui/system";
import PropTypes from "prop-types";

// Layout base
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import MDBox from "components/MDBox";

// Componentes
import KpiCard from "./components/KpiCard";
import GraficoVentas from "./components/GraficoVentas";

// Features
import AltaTelefono from "../../features/productos/pages/AltaTelefono";
import { obtenerUsuario } from "../../features/auth/services/authServices";

// Íconos
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";

//
// ---------- LoadingScreen (spinner brand) ----------
//
function LoadingScreen({ text = "Cargando…", note = "" }) {
  const spin = keyframes`
    to { transform: rotate(360deg); }
  `;
  const pulse = keyframes`
    0%,100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  `;

  return (
    <Box
      sx={(t) => ({
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "grid",
        placeItems: "center",
        bgcolor: t.palette.background.default,
      })}
    >
      <Box sx={{ textAlign: "center" }}>
        <Box sx={{ position: "relative", width: 120, height: 120, mx: "auto" }}>
          {/* Anillo */}
          <Box
            sx={(t) => ({
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: `conic-gradient(${t.palette.warning.main} 12%, transparent 12%)`,
              animation: `${spin} 1.1s linear infinite`,
              WebkitMask:
                "radial-gradient(farthest-side,#0000 calc(100% - 10px),#000 calc(100% - 10px))",
              mask:
                "radial-gradient(farthest-side,#0000 calc(100% - 10px),#000 calc(100% - 10px))",
              filter: "drop-shadow(0 6px 16px rgba(255,165,0,.35))",
            })}
          />
          {/* Centro con icono */}
          <Box
            sx={(t) => ({
              position: "absolute",
              inset: 16,
              borderRadius: "50%",
              background: t.palette.common.white,
              display: "grid",
              placeItems: "center",
              boxShadow: "0 8px 24px rgba(16,24,40,.12)",
              animation: `${pulse} 1.6s ease-in-out infinite`,
            })}
          >
            <ShieldOutlinedIcon sx={(t) => ({ fontSize: 38, color: t.palette.warning.main })} />
          </Box>
        </Box>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          {text}
        </Typography>
        {note ? (
          <Typography variant="caption" color="text.secondary">
            {note}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

LoadingScreen.propTypes = {
  text: PropTypes.string,
  note: PropTypes.string,
};

// Helpers de formato
const fmt = (n) =>
  typeof n === "number" && Number.isFinite(n)
    ? `$${Math.round(n).toLocaleString("es-AR")}`
    : "—";

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // MÉTRICAS
  const [unidadesVendidas, setUnidadesVendidas] = useState(0);
  const [ingresosMes, setIngresosMes] = useState(0);
  const [stockTotal, setStockTotal] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const isMountedRef = useRef(true);

  const baseUrl = process.env.REACT_APP_BACKEND_URL;

  // ocultar/mostrar montos (persistente)
  const [hideAmounts, setHideAmounts] = useState(() => {
    try {
      return localStorage.getItem("hideAmounts") === "1";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("hideAmounts", hideAmounts ? "1" : "0");
    } catch {}
  }, [hideAmounts]);

  // Cotizaciones
  const [usd, setUsd] = useState({
    oficial: { compra: null, venta: null },
    blue: { compra: null, venta: null },
  });
  const [usdUpdatedAt, setUsdUpdatedAt] = useState(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Verificación de usuario
  useEffect(() => {
    const verificarUsuario = async () => {
      try {
        const user = await obtenerUsuario();
        if (!isMountedRef.current) return;

        if (!user || !user.correo) {
          setTimeout(() => {
            if (isMountedRef.current) navigate("/login-erp", { replace: true });
          }, 500);
        } else {
          setUsuario(user);
        }
      } catch {
        setTimeout(() => {
          if (isMountedRef.current) navigate("/login-erp", { replace: true });
        }, 500);
      }
    };

    verificarUsuario();
  }, [navigate]);

  // Fetch métricas principales
  useEffect(() => {
    if (!usuario) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const urls = [
          `${baseUrl}/api/ingresos.php`,
          `${baseUrl}/api/totalVentas.php`,
        ];

        const [ingresosData, totalVentasAPI] = await Promise.all(
          urls.map((url) =>
            fetch(url, { credentials: "include" })
              .then((res) => res.json())
              .catch(() => null)
          )
        );

        const ingresos = parseFloat(ingresosData?.total_ingresos ?? 0);
        setIngresosMes(Number.isFinite(ingresos) ? ingresos : 0);

        const unidades = Number(totalVentasAPI?.totalVentas ?? 0);
        setUnidadesVendidas(Number.isFinite(unidades) ? unidades : 0);

        // Stock total (placeholder hasta conectar endpoint)
        setStockTotal(0);
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    };

    setTimeout(fetchData, 200);
  }, [isAddingProduct, usuario, baseUrl]);

  // Fetch cotizaciones + auto-refresh 10 minutos
  useEffect(() => {
    if (!baseUrl) return;

    const fetchDolar = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/dolar.php`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        const o = data?.oficial || data?.official || {};
        const b = data?.blue || {};
        setUsd({
          oficial: {
            compra: toNum(o.compra ?? o.buy),
            venta: toNum(o.venta ?? o.sell ?? o.promedio),
          },
          blue: {
            compra: toNum(b.compra ?? b.buy),
            venta: toNum(b.venta ?? b.sell ?? b.promedio),
          },
        });
        setUsdUpdatedAt(new Date());
      } catch {
        // dejamos los placeholders
      }
    };

    // inicial
    fetchDolar();
    // intervalo 10 minutos
    const id = setInterval(fetchDolar, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [baseUrl]);

  // Derivados
  const ticketPromedio = useMemo(() => {
    if (unidadesVendidas <= 0) return 0;
    return ingresosMes / unidadesVendidas;
  }, [ingresosMes, unidadesVendidas]);

  const deltaVentas = 0;
  const deltaUnidades = 0;
  const deltaStock = 0;

  // Loaders “originales”
  if (!usuario)
    return (
      <LoadingScreen
        text="Verificando usuario…"
        note="Aguarde un instante mientras validamos su sesión"
      />
    );

  if (isLoading)
    return (
      <LoadingScreen
        text="Cargando datos…"
        note="Estamos preparando su panel en tiempo real"
      />
    );

  return (
    <DashboardLayout setIsAddingProduct={setIsAddingProduct} showPageHeader={false}>
      <MDBox py={3}>
        {isAddingProduct ? (
          <AltaTelefono onCreated={() => setIsAddingProduct(false)} />
        ) : (
          <>
            {/* HEADER */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 2,
                borderRadius: 3,
                border: "1px solid rgba(255,165,0,0.28)",
                background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                {/* Título / subtítulo */}
                <Box>
                  <Typography variant="h5" fontWeight={800} color="text.primary">
                    Dashboard de Ventas
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <SmartphoneIcon sx={{ fontSize: 18, color: "warning.main" }} />
                    <Typography variant="body2" color="text.secondary">
                      Gestión de iPhones
                    </Typography>
                  </Box>
                </Box>

                <Box flexGrow={1} />

                {/* Cotizaciones con separador en el medio (Oficial / Blue) */}
                <Box sx={{ minWidth: { md: 520, xs: "100%" }, width: { md: 520, xs: "100%" } }}>
                  <Box
                    sx={{
                      display: "grid",
                      alignItems: "center",
                      gap: 2,
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1px 1fr" },
                    }}
                  >
                    {/* OFICIAL */}
                    <Box sx={{ justifySelf: { md: "end", xs: "stretch" } }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                        USD Oficial
                      </Typography>
                      <Box display="flex" gap={2} mt={0.25}>
                        <Box display="flex" gap={0.75} alignItems="baseline">
                          <Typography variant="caption" color="text.secondary">
                            Compra
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "info.main" }}>
                            {fmt(usd.oficial.compra)}
                          </Typography>
                        </Box>
                        <Box display="flex" gap={0.75} alignItems="baseline">
                          <Typography variant="caption" color="text.secondary">
                            Venta
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "info.main" }}>
                            {fmt(usd.oficial.venta)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Divider vertical (md+) */}
                    <Box
                      sx={{
                        display: { xs: "none", md: "block" },
                        height: "100%",
                        width: 1,
                        bgcolor: "rgba(255,165,0,0.28)",
                        borderRadius: 1,
                      }}
                    />
                    {/* Divider horizontal (xs) */}
                    <Divider
                      sx={{
                        display: { xs: "block", md: "none" },
                        borderColor: "rgba(255,165,0,0.28)",
                        my: 0.5,
                      }}
                    />

                    {/* BLUE */}
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                        USD Blue
                      </Typography>
                      <Box display="flex" gap={2} mt={0.25}>
                        <Box display="flex" gap={0.75} alignItems="baseline">
                          <Typography variant="caption" color="text.secondary">
                            Compra
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "warning.main" }}>
                            {fmt(usd.blue.compra)}
                          </Typography>
                        </Box>
                        <Box display="flex" gap={0.75} alignItems="baseline">
                          <Typography variant="caption" color="text.secondary">
                            Venta
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "warning.main" }}>
                            {fmt(usd.blue.venta)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Última actualización */}
                  <Box sx={{ mt: 0.75, textAlign: { xs: "left", md: "right" } }}>
                    <Typography variant="caption" color="text.secondary">
                      Última actualización:{" "}
                      {usdUpdatedAt
                        ? usdUpdatedAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
                        : "—"}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* línea inferior + chip */}
              <Box
                display="flex"
                alignItems="center"
                gap={2}
                pt={2}
                sx={{ borderTop: "1px solid rgba(255,165,0,0.28)" }}
              >
                <Chip
                  icon={<TrendingUpIcon sx={{ color: "warning.main" }} />}
                  label="Métricas Principales"
                  sx={{
                    bgcolor: "warning.light",
                    color: "warning.dark",
                    fontWeight: 600,
                    "& .MuiChip-icon": { color: "warning.main" },
                  }}
                />
              </Box>
            </Paper>

            {/* Botón de acción (no mover) */}
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button
                size="small"
                variant="contained"
                startIcon={<AddOutlinedIcon />}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  bgcolor: "warning.main",
                  "&:hover": { bgcolor: "warning.dark" },
                }}
                onClick={() => navigate("/cargar-venta")}
              >
                Nueva venta
              </Button>
            </Box>

            {/* KPIs */}
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6} lg={3}>
                <KpiCard
                  title="Ventas del Mes"
                  icon={<AttachMoneyOutlinedIcon />}
                  value={ingresosMes.toLocaleString("es-AR")}
                  prefix="$"
                  color="warning"
                  hideable
                  hidden={hideAmounts}
                  onToggle={() => setHideAmounts((v) => !v)}
                  delta={deltaVentas}
                  hint="vs mes anterior"
                />
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <KpiCard
                  title="Unidades Vendidas"
                  icon={<ShoppingCartOutlinedIcon />}
                  value={unidadesVendidas.toLocaleString("es-AR")}
                  color="info"
                  delta={deltaUnidades}
                  hint="productos vendidos"
                />
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <KpiCard
                  title="Stock Total"
                  icon={<Inventory2OutlinedIcon />}
                  value={stockTotal.toLocaleString("es-AR")}
                  color="success"
                  delta={deltaStock}
                  hint="unidades disponibles"
                />
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <KpiCard
                  title="Ticket Promedio"
                  icon={<ReceiptLongOutlinedIcon />}
                  value={Math.round(ticketPromedio).toLocaleString("es-AR")}
                  prefix="$"
                  color="secondary"
                  hideable
                  hidden={hideAmounts}
                  onToggle={() => setHideAmounts((v) => !v)}
                  delta={deltaVentas}
                  hint="importe por venta"
                />
              </Grid>
            </Grid>

            {/* Gráfico */}
            <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid rgba(16,24,40,0.08)",
                    backgroundColor: "#fff",
                    boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
                    p: 2,
                  }}
                >
                  <GraficoVentas />
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </MDBox>
    </DashboardLayout>
  );
};

export default Dashboard;
