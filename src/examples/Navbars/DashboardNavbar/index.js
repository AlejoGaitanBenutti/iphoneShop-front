import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import PropTypes from "prop-types";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";
import useMediaQuery from "@mui/material/useMediaQuery";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import MDBox from "components/MDBox";
import Breadcrumbs from "examples/Breadcrumbs";
import NotificationItem from "examples/Items/NotificationItem";

import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";

import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";

function DashboardNavbar({ absolute, light, isMini, setIsAddingProduct }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator, darkMode } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const route = useLocation().pathname.split("/").slice(1);

  const isLargeScreen = useMediaQuery("(min-width:1200px)");

  useEffect(() => {
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    window.addEventListener("scroll", handleTransparentNavbar);
    handleTransparentNavbar();

    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);

  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ mt: 2 }}
    >
      <NotificationItem icon={<Icon>email</Icon>} title="Check new messages" />
      <NotificationItem icon={<Icon>podcasts</Icon>} title="Manage Podcast sessions" />
      <NotificationItem icon={<Icon>shopping_cart</Icon>} title="Payment successfully completed" />
    </Menu>
  );

  const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;
      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }
      return colorValue;
    },
  });

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
     <Toolbar sx={(theme) => navbarContainer(theme)}>
  {/* Espacio a la izquierda (vacío o para futura personalización) */}
  <MDBox sx={{ flexGrow: 1 }} />

  {/* Íconos alineados a la derecha */}
  {!isMini && (
    <MDBox display="flex" alignItems="center" gap={1}>
      <Link to="/authentication/sign-in/basic">
        <IconButton size="small" disableRipple>
          <Icon sx={{ color: "#ffffff" }}>account_circle</Icon>
        </IconButton>
      </Link>

      {isLargeScreen && miniSidenav && (
        <IconButton
          onClick={handleMiniSidenav}
          sx={{
            mr: 1,
            animation: "wiggle 2s infinite",
            "@keyframes wiggle": {
              "0%, 100%": { transform: "translateX(0)" },
              "50%": { transform: "translateX(4px)" },
            },
          }}
        >
          <ChevronRightIcon sx={{ color: "#ffffff", fontSize: "2rem" }} />
        </IconButton>
      )}

      <IconButton
        size="small"
        disableRipple
        onClick={handleConfiguratorOpen}
      >
        <Icon sx={{ color: "#ffffff" }}>settings</Icon>
      </IconButton>

      <IconButton
        size="small"
        disableRipple
        aria-controls="notification-menu"
        aria-haspopup="true"
        onClick={handleOpenMenu}
      >
        <Icon sx={{ color: "#ffffff" }}>notifications</Icon>
      </IconButton>

      {renderMenu()}
    </MDBox>
  )}
</Toolbar>
    </AppBar>
  );
}

DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
  setIsAddingProduct: PropTypes.func.isRequired,
};

export default DashboardNavbar;
