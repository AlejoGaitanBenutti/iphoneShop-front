import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import { Card } from "@mui/material";

import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import TarjetaEstadistica from "./components/TarjetaEstadistica";
import ClientesTable from "../../features/clientes/ClientesTable";
import AltaTelefono from "../../features/productos/pages/AltaTelefono";
import { obtenerUsuario } from "../../features/auth/services/authServices";
import GraficoVentas from "./components/GraficoVentas";

const formatCurrency = (value) =>
  `USD ${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(value)}`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const [ventasTotales, setVentasTotales] = useState(0);
  const [usuariosHoy, setUsuariosHoy] = useState(0);
  const [ingresos, setIngresos] = useState(0);
  const [nuevosClientes, setNuevosClientes] = useState(0);
  const [clientes, setClientes] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const isMountedRef = useRef(true);

  const apiUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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

  useEffect(() => {
    if (!usuario) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const urls = [
          `${apiUrl}/api/ventas.php`,
          `${apiUrl}/api/usuariosTotales.php`,
          `${apiUrl}/api/ingresos.php`,
          `${apiUrl}/api/nuevosClientes.php`,
          `${apiUrl}/api/clientes.php`,
          `${apiUrl}/api/totalVentas.php`,
        ];

        const responses = await Promise.all(
          urls.map((url) =>
            fetch(url, { credentials: "include" }).then((res) => res.json()).catch(() => null)
          )
        );

        const [
          /* ventasData */, usuariosData, ingresosData, nuevosClientesData, clientesAPI, totalVentasAPI,
        ] = responses;

        setClientes(clientesAPI || []);
        setVentasTotales(totalVentasAPI?.totalVentas || 0);
        setIngresos(formatCurrency(parseFloat(ingresosData?.total_ingresos) || 0));
        setUsuariosHoy(usuariosData?.total_usuarios || 0);
        setNuevosClientes(nuevosClientesData?.nuevos_clientes || 0);
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    };

    setTimeout(fetchData, 200);
  }, [isAddingProduct, usuario, apiUrl]);

  if (!usuario) return <h2>Verificando usuario...</h2>;
  if (isLoading) return <h2>Cargando datos...</h2>;

  return (
    <DashboardLayout setIsAddingProduct={setIsAddingProduct}>
      <MDBox py={3}>
        {isAddingProduct ? (
          <AltaTelefono onCreated={() => setIsAddingProduct(false)} />
        ) : (
          <>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TarjetaEstadistica titulo="Ventas del mes" valor={ventasTotales} icono="shopping_cart" color="success" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TarjetaEstadistica titulo="Usuarios Registrados" valor={usuariosHoy} icono="group" color="info" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TarjetaEstadistica titulo="Ingresos Totales" valor={ingresos} icono="attach_money" color="warning" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TarjetaEstadistica titulo="Nuevos Clientes" valor={nuevosClientes} icono="person_add" color="primary" />
              </Grid>
            </Grid>

            <MDBox mt={4}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={5} lg={4}>
                  <Card sx={{ backgroundColor: "#1e1e1e", borderRadius: "16px", p: 2, height: 450 }}>
                    <GraficoVentas />
                  </Card>
                </Grid>
              </Grid>
            </MDBox>

            <MDBox mt={4}>
              <ClientesTable clientes={clientes} />
            </MDBox>
          </>
        )}
      </MDBox>
    </DashboardLayout>
  );
};

export default Dashboard;
