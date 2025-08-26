import colors from "assets/theme/base/colors";
import typography from "assets/theme/base/typography";
import pxToRem from "assets/theme/functions/pxToRem";
import rgba from "assets/theme/functions/rgba";

const { text, grey, primary } = colors;
const { size } = typography;

const menuItem = {
  styleOverrides: {
    root: {
      minWidth: pxToRem(160),
      minHeight: "unset",
      padding: `${pxToRem(8)} ${pxToRem(16)}`,
      borderRadius: 8,
      fontSize: size.sm,
      color: text.main,
      transition: "background-color .15s ease, color .15s ease",

      "&:hover": {
        backgroundColor: grey[800],                 // hover dark
      },
      "&.Mui-selected": {
        backgroundColor: rgba(primary.main, 0.18),  // seleccionado con tinte primary
      },
      "&.Mui-selected:hover": {
        backgroundColor: rgba(primary.main, 0.24),
      },
    },
  },
};

export default menuItem;
