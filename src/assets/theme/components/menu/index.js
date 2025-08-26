import colors from "assets/theme/base/colors";

const { background, text, divider } = colors;

const menu = {
  styleOverrides: {
    paper: {
      backgroundColor: background.paper,   // fondo oscuro del menú
      color: text.main,                    // texto claro
      border: `1px solid ${divider}`,      // borde sutil
      boxShadow: "0 8px 24px rgba(0,0,0,.4)",
      borderRadius: 10,
      minWidth: 180,
    },
    list: {
      paddingTop: 4,
      paddingBottom: 4,
    },
  },
};

export default menu;
