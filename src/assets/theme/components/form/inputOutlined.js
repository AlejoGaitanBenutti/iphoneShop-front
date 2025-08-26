import colors from "assets/theme/base/colors";
import borders from "assets/theme/base/borders";
import typography from "assets/theme/base/typography";
import pxToRem from "assets/theme/functions/pxToRem";

const { primary, grey, background, text, divider } = colors;
const { borderRadius } = borders;
const { size } = typography;

const inputOutlined = {
  defaultProps: {
    notched: false, // 👈 sin notch globalmente (evita el “agujerito”)
  },
  styleOverrides: {
    root: {
      backgroundColor: background.paper,
      fontSize: size.sm,
      borderRadius: borderRadius.md,
      transition: "border-color .15s ease, box-shadow .15s ease",

      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: divider,
        borderWidth: "1px",
        transition: "border-color .15s ease, border-width .15s ease",
      },

      // por si algún campo re-habilita el notch
      "& .MuiOutlinedInput-notchedOutline legend": { maxWidth: "1000px" },
      "& .MuiOutlinedInput-notchedOutline legend span": {
        backgroundColor: background.paper,
        padding: "0 6px",
      },

      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: grey[500] },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: primary.main,
        borderWidth: "2px",
      },
      "&.Mui-disabled .MuiOutlinedInput-notchedOutline": { borderColor: grey[700] },

      // Select dentro del OutlinedInput
      "& .MuiSelect-select.MuiOutlinedInput-input": { backgroundColor: "inherit" },
      "& .MuiSelect-select.MuiOutlinedInput-input:focus": {
        backgroundColor: `${background.paper} !important`,
      },
    },

    input: {
      color: text.main,
      padding: pxToRem(12),
      backgroundColor: "transparent",
      "&::placeholder": { color: grey[500], opacity: 1 },
    },

    inputSizeSmall: { fontSize: size.xs, padding: pxToRem(10) },
    multiline: { color: text.main, padding: pxToRem(12) },
  },
};

export default inputOutlined;
