import { useEffect } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";

import MDBox from "components/MDBox";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { Box, Typography } from "@mui/material";
import { useMaterialUIController, setLayout } from "context";

function DashboardLayout({
  children,
  setIsAddingProduct = () => {},
  showPageHeader = true,   // NUEVO
  showDate = true,         // NUEVO
}) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const { pathname } = useLocation();

  useEffect(() => {
    setLayout(dispatch, "dashboard");
  }, [pathname, dispatch]);

  const getTitulo = (path) => {
    if (path.includes("/usuarios")) return "Usuarios";
    if (path.includes("/inventario")) return "Inventario";
    if (path.includes("/historial")) return "Historial";
    return "Dashboard";
  };

  return (
    <>
      <DashboardNavbar setIsAddingProduct={setIsAddingProduct} />

      <MDBox
        bgcolor="background.default"
        sx={({ breakpoints, transitions, functions: { pxToRem } }) => ({
          p: 3,
          position: "relative",
          [breakpoints.up("xl")]: {
            marginLeft: miniSidenav ? pxToRem(120) : pxToRem(274),
            transition: transitions.create(["margin-left", "margin-right"], {
              easing: transitions.easing.easeInOut,
              duration: transitions.duration.standard,
            }),
          },
        })}
      >
        {showPageHeader && (
          <Box mb={3}>
            <Typography variant="h4" sx={{ color: "#ffffff", fontWeight: "bold" }}>
              {getTitulo(pathname)}
            </Typography>

            {showDate && (
              <Typography variant="body2" sx={{ color: "#9e9e9e", mt: 0.5 }}>
                {new Date().toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </Typography>
            )}
          </Box>
        )}

        {children}
        <Footer />
      </MDBox>
    </>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
  setIsAddingProduct: PropTypes.func,
  showPageHeader: PropTypes.bool, // NUEVO
  showDate: PropTypes.bool,        // NUEVO
};

export default DashboardLayout;
