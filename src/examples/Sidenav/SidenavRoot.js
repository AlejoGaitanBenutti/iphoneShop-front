import Drawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";

export default styled(Drawer)(({ theme, ownerState }) => {
  const { palette, boxShadows, transitions, breakpoints, functions } = theme;
  const { transparentSidenav, whiteSidenav, miniSidenav, darkMode, sidenavColor } = ownerState;

  const sidebarWidth = 250;
  const { transparent, gradients, white, background } = palette;
  const { xxl } = boxShadows;
  const { pxToRem, linearGradient } = functions;

  const colorKey = sidenavColor || "dark";
  let backgroundValue = darkMode
    ? background.sidenav
    : linearGradient(gradients[colorKey].main, gradients[colorKey].state);

  if (transparentSidenav) {
    backgroundValue = transparent.main;
  } else if (whiteSidenav) {
    backgroundValue = white.main;
  }

  return {
    "& .MuiDrawer-paper": {
      boxShadow: xxl,
      border: "none",
      background: backgroundValue,
      width: miniSidenav ? pxToRem(96) : sidebarWidth,
      overflowX: "hidden",
      transition: transitions.create(["width", "background-color", "transform"], {
        easing: transitions.easing.sharp,
        duration: transitions.duration.standard,
      }),
      transform: miniSidenav ? `translateX(${pxToRem(-320)})` : "translateX(0)",
      [breakpoints.up("xl")]: {
        width: miniSidenav ? pxToRem(96) : sidebarWidth,
        transform: miniSidenav ? `translateX(${pxToRem(-320)})` : "translateX(0)",
        transition: transitions.create(["width", "background-color", "transform"], {
          easing: transitions.easing.sharp,
          duration: transitions.duration.standard,
        }),
      },
    },
  };
});
