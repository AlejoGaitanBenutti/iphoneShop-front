// components/FloatingSidenavToggle.jsx
import { useEffect, useState } from "react";
import { useMaterialUIController, setMiniSidenav } from "context";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Box, Typography } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

function FloatingSidenavToggle() {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const isLargeScreen = useMediaQuery("(min-width:1200px)");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(isLargeScreen && miniSidenav);
  }, [isLargeScreen, miniSidenav]);

  const handleToggle = () => {
    setMiniSidenav(dispatch, false); // expandir sidenav
  };

  if (!visible) return null;

  return (
    <Box
      onClick={handleToggle}
      sx={{
        position: "fixed",
        top: "50%",
        left: 0,
        transform: "translateY(-50%)",
        zIndex: 1300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ff6f00", // naranja visible
        color: "#fff",
        width: "32px",
        height: "60px",
        borderRadius: "0 6px 6px 0",
        cursor: "pointer",
        boxShadow: "2px 2px 8px rgba(0,0,0,0.2)",
        transition: "background-color 0.3s ease-in-out",
        "&:hover": {
          backgroundColor: "#ff8800",
        },
      }}
    >
      <ChevronRightIcon fontSize="small" />
    </Box>
  );
}

export default FloatingSidenavToggle;
