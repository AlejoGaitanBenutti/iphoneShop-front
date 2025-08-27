import Drawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";

export default styled(Drawer)(({ theme, ownerState }) => {
  const { transitions, functions, breakpoints, palette } = theme;
  const { pxToRem } = functions;
  const { miniSidenav } = ownerState;

  const fullWidth = 280;
  const miniWidth = 80;

  return {
    "& .MuiDrawer-paper": {
      width: miniSidenav ? pxToRem(miniWidth) : fullWidth,
      overflowX: "hidden",
      borderRight: `1px solid ${palette.divider}`,
      backgroundColor: palette.background.paper, // blanco del theme
      color: palette.text.primary,
      transition: transitions.create(["width", "transform"], {
        duration: transitions.duration.standard,
      }),
      boxShadow: "0 4px 18px rgba(16,24,40,0.06)",
      transform: miniSidenav ? `translateX(${pxToRem(-320)})` : "translateX(0)",

      [breakpoints.up("xl")]: {
        width: miniSidenav ? pxToRem(miniWidth) : fullWidth,
        transform: miniSidenav ? `translateX(${pxToRem(-320)})` : "translateX(0)",
      },
    },
  };
});
