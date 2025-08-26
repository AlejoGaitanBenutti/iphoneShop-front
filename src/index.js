import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "App";
// src/index.js
import './styles.css';

// MUI Theme
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./assets/theme";

// Material Dashboard 2 React Context Provider
import { MaterialUIControllerProvider } from "context";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MaterialUIControllerProvider>
        <App />
      </MaterialUIControllerProvider>
    </ThemeProvider>
  </BrowserRouter>
);
