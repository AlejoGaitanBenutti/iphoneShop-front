// src/features/ventas/components/PopperSmokeTest.jsx
import * as React from "react";
import { Autocomplete, TextField } from "@mui/material";

export default function PopperSmokeTest() {
  return (
    <div style={{ position: "relative", zIndex: 1, marginBottom: 12 }}>
      <Autocomplete
        open                         // SIEMPRE abierto
        disablePortal               // SIN portal (se renderiza dentro del mismo contenedor)
        options={[                  // opciones estáticas
          { id: 1, label: "Uno" },
          { id: 2, label: "Dos" },
          { id: 3, label: "Tres" },
        ]}
        getOptionLabel={(o) => o.label}
        renderInput={(params) => (
          <TextField {...params} label="SMOKE TEST" />
        )}
      />
    </div>
  );
}
