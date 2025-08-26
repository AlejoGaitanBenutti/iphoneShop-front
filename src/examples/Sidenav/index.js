// src/examples/Sidenav/index.js
import { useEffect } from "react";
import { useLocation, NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";
import { useMaterialUIController, setMiniSidenav } from "context";

function Sidenav({ color, brand, brandName, routes = [], setIsAddingProduct }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode, sidenavColor } = controller;
  const location = useLocation();
  const collapseName = location.pathname.replace("/", "");

  useEffect(() => {
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
    }

    window.addEventListener("resize", handleMiniSidenav);
    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch]);

  const textColor = (transparentSidenav && !darkMode && !whiteSidenav) ? "dark" : "white";

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  const renderRoutes = routes.length > 0 ? (
    routes.map(({ type, name, icon, key, route }) =>
      type === "collapse" ? (
        <NavLink key={key} to={route} style={{ textDecoration: "none" }}>
          <SidenavCollapse name={name} icon={icon} active={key === collapseName} />
        </NavLink>
      ) : null
    )
  ) : (
    <MDTypography variant="body2" color="error" textAlign="center" sx={{ mt: 2, fontWeight: "bold" }}>
      ❌ No hay elementos en el menú
    </MDTypography>
  );

  return (
    <SidenavRoot
      variant="permanent"
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode, sidenavColor }}
    >
      <MDBox pt={3} pb={1} px={4} textAlign="center" position="relative">
        {!miniSidenav && (
          <MDBox
            display="flex"
            justifyContent="flex-end"
            position="absolute"
            top={0}
            right={0}
            p={1.625}
            onClick={closeSidenav}
            sx={{ cursor: "pointer", zIndex: 10 }}
          >
            <MDTypography variant="h6" color={textColor}>
              <Icon sx={{ fontWeight: "bold" }}>close</Icon>
            </MDTypography>
          </MDBox>
        )}

       <MDBox component={NavLink} to="/" display="flex" alignItems="center" gap={1}>
  <img src="/assets/AdminTrust.png" alt="AdminTrust" width={120} />
 
</MDBox>

      </MDBox>

      <Divider light />
      <List>{renderRoutes}</List>
    </SidenavRoot>
  );
}

Sidenav.defaultProps = {
  color: "info",
  brand: "",
  brandName: "Panel",
  setIsAddingProduct: () => {},
};

Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object),
  setIsAddingProduct: PropTypes.func,
};

export default Sidenav;
