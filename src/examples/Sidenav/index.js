// src/examples/Sidenav/index.js
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Drawer,
  Box,
  IconButton,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

import AdminTrustLogo from "./AdminTrustLogo";

const NAV_WIDTH = 280;
const NAV_MINI = 80;

const sections = [
  { title: "Dashboard", items: [{ label: "Inicio", to: "/", icon: <HomeRoundedIcon /> }] },
  {
    title: "Productos",
    items: [
      { label: "Alta de Productos", to: "/alta-productos", icon: <Inventory2OutlinedIcon /> },
      { label: "Inventario", to: "/inventario", icon: <ArchiveOutlinedIcon /> },
    ],
  },
  {
    title: "Ventas",
    items: [
      { label: "Cargar Venta", to: "/cargar-venta", icon: <ShoppingCartOutlinedIcon /> },
      { label: "Clientes", to: "/clientes", icon: <GroupOutlinedIcon /> },
    ],
  },
  { title: "Reportes", items: [{ label: "Historial", to: "/historial", icon: <HistoryOutlinedIcon /> }] },
];

export default function Sidenav() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const renderNavList = (showHeaders, collapsedLocal) => (
    <Box sx={{ flex: 1, py: 1, overflowY: "auto" }}>
      {sections.map((section) => (
        <List
          key={section.title}
          dense
          sx={{ px: 1.5, mb: 1.5 }}
          subheader={
            showHeaders ? (
              <ListSubheader
                disableSticky
                sx={{
                  lineHeight: 2,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  color: "text.secondary",
                  bgcolor: "transparent",
                  fontSize: 12,
                  fontWeight: 700,
                  px: 1,
                }}
              >
                {section.title}
              </ListSubheader>
            ) : null
          }
        >
          {section.items.map((item) => {
            const active = location.pathname === item.to;

            const ButtonContent = (
              <ListItemButton
                key={item.label}
                component={NavLink}
                to={item.to}
                onClick={() => isMobile && setMobileOpen(false)}
                sx={{
                  my: 0.5,
                  px: collapsedLocal ? 1 : 1.25,
                  borderRadius: 2,
                  minHeight: 44,
                  ...(active && {
                    bgcolor: "warning.main",
                    color: "#fff",
                    boxShadow: "0 4px 10px rgba(255,165,0,0.35)",
                    "& .MuiListItemIcon-root": { color: "#fff" },
                    "&:hover": { bgcolor: "warning.dark" },
                  }),
                  ...(!active && { color: "text.primary", "&:hover": { bgcolor: "action.hover" } }),
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: active ? "#fff" : "text.secondary" }}>
                  {item.icon}
                </ListItemIcon>
                {!collapsedLocal && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ variant: "body2", fontWeight: active ? 700 : 500 }}
                  />
                )}
              </ListItemButton>
            );

            return collapsedLocal ? (
              <Tooltip key={item.label} title={item.label} placement="right">
                <Box>{ButtonContent}</Box>
              </Tooltip>
            ) : (
              ButtonContent
            );
          })}
        </List>
      ))}
    </Box>
  );

  /* ===================== MOBILE ===================== */
  if (isMobile) {
    return (
      <>
        {/* Botón flotante para abrir */}
        <Box
          onClick={() => setMobileOpen(true)}
          sx={(t) => ({
            position: "fixed",
            top: { xs: 64, sm: 72 },
            left: 12,
            zIndex: t.zIndex.drawer + 2,
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: "#fff",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: 2,
            display: mobileOpen ? "none" : "grid",
            placeItems: "center",
            cursor: "pointer",
          })}
          aria-label="Abrir menú"
        >
          <ChevronRightIcon />
        </Box>

        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: {
              width: NAV_WIDTH,
              overflowX: "hidden",
              borderRight: "1px solid",
              borderColor: "divider",
              backgroundColor: "#fff",
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          {/* Header móvil: logo grande y botón cerrar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              px: 2,
              py: 2.25,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <AdminTrustLogo size="md" />
            <Box sx={{ ml: "auto" }}>
              <IconButton
                size="small"
                onClick={() => setMobileOpen(false)}
                sx={{ color: "text.secondary", "&:hover": { bgcolor: "action.hover" } }}
                aria-label="Cerrar menú"
              >
                <CloseRoundedIcon />
              </IconButton>
            </Box>
          </Box>

          {renderNavList(true, false)}

          <Divider />

          <Box sx={{ p: 1.5 }}>
            <List dense sx={{ px: 0.5 }}>
              <ListItemButton
                component={NavLink}
                to="/logout"
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  minHeight: 44,
                  color: "error.main",
                  "&:hover": { bgcolor: "error.lighter", color: "error.dark" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: "error.main" }}>
                  <LogoutOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary="Salir" primaryTypographyProps={{ variant: "body2", fontWeight: 600 }} />
              </ListItemButton>
            </List>
          </Box>
        </Drawer>
      </>
    );
  }

  /* ===================== DESKTOP ===================== */
  return (
    <Drawer
      variant="permanent"
      PaperProps={{
        sx: {
          width: collapsed ? NAV_MINI : NAV_WIDTH,
          overflowX: "hidden",
          borderRight: "1px solid",
          borderColor: "divider",
          backgroundColor: "#fff",
          transition: (t) =>
            t.transitions.create("width", {
              duration: t.transitions.duration.standard,
              easing: t.transitions.easing.sharp,
            }),
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header desktop */}
      <Box
        sx={{
          display: "flex",
          flexDirection: collapsed ? "column" : "row",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: collapsed ? 1 : 1.25,
          px: collapsed ? 0.5 : 2,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box component={NavLink} to="/" sx={{ textDecoration: "none", color: "inherit", display: "flex" }}>
          {/* Logo MÁS GRANDE cuando está colapsado */}
          {collapsed ? <AdminTrustLogo size="md" iconOnly /> : <AdminTrustLogo size="md" />}
        </Box>

        {/* Flecha debajo del logo cuando está cerrado */}
        {collapsed ? (
          <IconButton
            size="small"
            onClick={() => setCollapsed(false)}
            sx={{ color: "text.secondary", "&:hover": { bgcolor: "action.hover" }, mt: 0.5 }}
            aria-label="Expandir menú"
          >
            <ChevronRightIcon />
          </IconButton>
        ) : (
          <Box sx={{ ml: "auto" }}>
            <IconButton
              size="small"
              onClick={() => setCollapsed(true)}
              sx={{ color: "text.secondary", "&:hover": { bgcolor: "action.hover" } }}
              aria-label="Colapsar menú"
            >
              <ChevronLeftIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      {renderNavList(!collapsed, collapsed)}

      <Divider />

      {/* Footer / Salir */}
      <Box sx={{ p: 1.5 }}>
        <List dense sx={{ px: 0.5 }}>
          <ListItemButton
            component={NavLink}
            to="/logout"
            sx={{
              borderRadius: 2,
              minHeight: 44,
              color: "error.main",
              "&:hover": { bgcolor: "error.lighter", color: "error.dark" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "error.main" }}>
              <LogoutOutlinedIcon />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText primary="Salir" primaryTypographyProps={{ variant: "body2", fontWeight: 600 }} />
            )}
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
}
