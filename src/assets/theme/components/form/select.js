import colors from "assets/theme/base/colors";
import pxToRem from "assets/theme/functions/pxToRem";

const { text, background } = colors;

const select = {
  styleOverrides: {
    select: {
      // duplicamos selector para subir especificidad
      "&&": {
        color: text.main,
        padding: `0 ${pxToRem(12)} !important`,
      },
      // foco
      "&&:focus": {
        backgroundColor: `${background.paper} !important`,
      },
      // menú abierto (MUI setea aria-expanded="true")
      "&&[aria-expanded='true']": {
        backgroundColor: `${background.paper} !important`,
      },
    },
    icon: {
      color: text.secondary,
    },
  },
};

export default select;
