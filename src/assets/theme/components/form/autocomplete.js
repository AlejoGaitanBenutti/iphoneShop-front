/**
 * Autocomplete (MUI) – overrides compatibles con modo claro/oscuro.
 * Sube el z-index del Popper y usa los colores del theme en vez de constantes fijas.
 */

import boxShadows from "assets/theme/base/boxShadows";
import typography from "assets/theme/base/typography";
import borders from "assets/theme/base/borders";
import pxToRem from "assets/theme/functions/pxToRem";

const { lg } = boxShadows;
const { size } = typography;
const { borderRadius } = borders;

const autocomplete = {
  styleOverrides: {
    // Contenedor del popper (no es la tarjeta)
    popper: ({ theme }) => ({
      zIndex: theme.zIndex.modal + 10, // por encima de todo
      boxShadow: lg,
      padding: pxToRem(8),
      textAlign: "left",
      // no seteamos background aquí; lo maneja "paper"
    }),

    // Tarjeta que envuelve la lista
    paper: ({ theme }) => ({
      boxShadow: "none",
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: borderRadius.md,
    }),

    // UL con las opciones
    listbox: ({ theme }) => ({
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      maxHeight: 320,
      overflow: "auto",
    }),

    // Cada opción de la lista
    option: ({ theme }) => ({
      padding: `${pxToRem(4.8)} ${pxToRem(16)}`,
      borderRadius: borderRadius.md,
      fontSize: size.sm,
      color: theme.palette.text.primary,
      transition: "background-color 300ms ease, color 300ms ease",

      "&:hover, &.Mui-focused": {
        backgroundColor: theme.palette.action.hover,
      },
      "&[aria-selected='true'], &.Mui-selected, &.Mui-selected:hover, &.Mui-selected.Mui-focused": {
        backgroundColor: theme.palette.action.selected,
      },
    }),

    noOptions: ({ theme }) => ({
      fontSize: size.sm,
      color: theme.palette.text.secondary,
    }),

    groupLabel: ({ theme }) => ({
      color: theme.palette.text.secondary,
    }),

    loading: ({ theme }) => ({
      fontSize: size.sm,
      color: theme.palette.text.secondary,
    }),

    // Chips cuando Autocomplete es "multiple"
    tag: ({ theme }) => ({
      display: "flex",
      alignItems: "center",
      height: "auto",
      padding: pxToRem(4),
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,

      "& .MuiChip-label": {
        lineHeight: 1.2,
        padding: `0 ${pxToRem(10)} 0 ${pxToRem(4)}`,
      },

      "& .MuiSvgIcon-root, & .MuiSvgIcon-root:hover, & .MuiSvgIcon-root:focus": {
        color: theme.palette.primary.contrastText,
        marginRight: 0,
      },
    }),
  },
};

export default autocomplete;
