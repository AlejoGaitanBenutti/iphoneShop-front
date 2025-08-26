// assets/theme/base/colors.js

const colors = {
  background: {
    default: "#f8fafc", // fondo general claro
    sidenav: "#ffffff",
    paper: "#ffffff",   // cards, inputs
  },

  text: {
    main: "#111827",       // gris muy oscuro
    secondary: "#6b7280",  // gris medio
    focus: "#2563eb",      // azul foco
  },

  primary:   { main: "#2563eb", focus: "#1e40af" },  // azul
  secondary: { main: "#64748b", focus: "#475569" },  // gris azulado
  info:      { main: "#06b6d4", focus: "#0e7490" },
  success:   { main: "#10b981", focus: "#047857" },
  warning:   { main: "#f97316", focus: "#c2410c" },
  error:     { main: "#ef4444", focus: "#b91c1c" },

  dark:      { main: "#111827", focus: "#0b1220" },
  light:     { main: "#f8fafc", focus: "#f1f5f9" },

  white:     { main: "#ffffff", focus: "#f9fafb" },
  black:     { main: "#000000" },

  transparent: { main: "transparent" },

  grey: {
    100: "#f5f5f5",
    200: "#eeeeee",
    300: "#e5e7eb",
    400: "#d1d5db",
    500: "#9ca3af",
    600: "#6b7280",
    700: "#4b5563",
    800: "#374151",
    900: "#111827",
  },

  divider: "#e5e7eb",

  tabs: {
    indicator: { boxShadow: "#2563eb" },
  },

  gradients: {
    primary:  { main: "#93c5fd", state: "#2563eb" },
    dark:     { main: "#1f2937", state: "#111827" },
    info:     { main: "#67e8f9", state: "#06b6d4" },
    success:  { main: "#86efac", state: "#10b981" },
    warning:  { main: "#fdba74", state: "#f97316" },
    error:    { main: "#fca5a5", state: "#ef4444" },
    light:    { main: "#f8fafc", state: "#e5e7eb" },
  },
};

export default colors;
