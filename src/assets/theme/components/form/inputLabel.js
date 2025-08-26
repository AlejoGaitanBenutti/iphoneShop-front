import colors from "assets/theme/base/colors";
import typography from "assets/theme/base/typography";

const { text, primary, error, background } = colors;
const { size } = typography;

const inputLabel = {
  styleOverrides: {
    root: {
      fontSize: size.sm,
      color: text.secondary,
      lineHeight: 1.2,
      transition: "color .15s ease",

      // foco / error
      "&&.Mui-focused": { color: primary.main },
      "&&.Mui-error": { color: error.main },

      // 👇 cuando el label está reducido (flotando), pintamos el fondo
      "&&.MuiInputLabel-shrink": {
        backgroundColor: background.paper,
        padding: "0 6px",
        zIndex: 2,
      },
    },

    sizeSmall: {
      fontSize: size.xs,
      lineHeight: 1.3,
      "&&.MuiInputLabel-shrink": {
        backgroundColor: background.paper,
        padding: "0 6px",
        zIndex: 2,
      },
    },
  },
};

export default inputLabel;
