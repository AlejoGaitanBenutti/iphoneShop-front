import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Sidenav from "examples/Sidenav";

import Dashboard from "layouts/dashboard";
import theme from "assets/theme";
import routes from "routes";
import { useMaterialUIController, setMiniSidenav } from "context";
import LoginERP from "./features/auth/pages/LoginERP"; // ✅ Importa el LoginERP
import Ventas from "features/ventas/pages/Ventas";
import InventarioPage from "./features/productos/pages/InventarioPage"
import FloatingSidenavToggle from "./layouts/dashboard/components/FloatingSidenavToggle";
import Logout from "features/auth/pages/Logout";
import RutaProtegida from "./features/auth/components/RutaProtegida";
import HistorialTabla from "features/productos/pages/TablaHistorial";
import { GoogleOAuthProvider } from '@react-oauth/google';
import AltaTelefono from "features/productos/pages/AltaTelefono";
import './styles.css';

export default function App() {
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, layout, sidenavColor, darkMode } = controller;
  const { pathname } = useLocation();
                
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const isLoginPage = pathname === "/login-erp";
  const clientId = "315974948397-idtppgrabhi09e6gvn643ecudmdsgctm.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <ThemeProvider theme={darkMode ? theme : theme}>
            <CssBaseline />
            {!isLoginPage && layout === "dashboard" && (
              <>
                <Sidenav color={sidenavColor} brandName="Dashboard" routes={routes} />

            
              
              </>
            )}
           {!isLoginPage && <FloatingSidenavToggle />}

          <Routes>
            <Route
              path="/dashboard"
              element={
                <RutaProtegida>
                  <Dashboard />
                </RutaProtegida>
              }
            />
            <Route
              path="/alta-productos"
              element={
                <RutaProtegida>
                  <AltaTelefono />
                </RutaProtegida>
              }
            />
            <Route
              path="/cargar-venta"
              element={
                <RutaProtegida>
                  <Ventas/>
                </RutaProtegida>
              }
            />
            <Route
              path="/inventario"
              element={
                <RutaProtegida>
                  <InventarioPage />
                </RutaProtegida>
              }
            />

            <Route path="/login-erp" element={<LoginERP />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
            <Route path="/historial" element={<HistorialTabla/>} />
          </Routes>

         

      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
