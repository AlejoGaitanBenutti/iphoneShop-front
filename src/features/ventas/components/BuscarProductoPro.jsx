// src/features/ventas/components/BuscarProductoPro.jsx
import * as React from "react";
import PropTypes from "prop-types";
import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import Popper from "@mui/material/Popper";
import SearchIcon from "@mui/icons-material/Search";
import SmartphoneIcon from "@mui/icons-material/Smartphone";

// ---------- helpers ----------
const fUSD = (n) =>
  typeof n === "number" && Number.isFinite(n)
    ? `$ ${n.toLocaleString("es-AR")}`
    : "—";

const batteryChip = (val) => {
  const n = Number(val ?? 0);
  const color = n >= 90 ? "success" : n >= 70 ? "warning" : "error";
  return (
    <Chip
      size="small"
      label={`${n || 0}%`}
      color={color}
      variant="outlined"
      sx={{ height: 20, fontWeight: 700 }}
    />
  );
};

// resaltar coincidencias
function highlight(text, query) {
  if (!query) return text;
  const q = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!q) return text;
  const re = new RegExp(q, "ig");
  const parts = String(text).split(re);
  const matches = String(text).match(re) || [];
  const out = [];
  parts.forEach((part, i) => {
    out.push(<span key={`t${i}`}>{part}</span>);
    if (matches[i]) {
      out.push(
        <mark
          key={`m${i}`}
          style={{
            background: "transparent",
            color: "inherit",
            padding: 0,
            fontWeight: 800,
            textDecoration: "underline",
            textDecorationColor: "rgba(25,118,210,.5)",
            textDecorationThickness: "2px",
            textUnderlineOffset: "2px",
          }}
        >
          {matches[i]}
        </mark>
      );
    }
  });
  return out;
}

// ---------- Popper sin outlines y con leve animación ----------
function DropdownPopper(props) {
  return (
    <Popper
      {...props}
      placement="bottom-start"
      style={{ zIndex: 1400, outline: "none", border: "none" }}
      modifiers={[
        { name: "offset", options: { offset: [0, 8] } },
        { name: "preventOverflow", options: { padding: 8 } },
      ]}
    />
  );
}

export default function BuscarProductoPro({
  options,
  loading,
  onSearch,
  onPick,
  textFieldProps,
  disablePortal = true,
}) {
  const theme = useTheme();

  const [value, setValue] = React.useState(null);
  const [input, setInput] = React.useState("");

  // Fallback local (incluye IMEI y SKU)
  const localFilter = React.useMemo(() => {
    if (!input) return options;
    const q = input.toLowerCase().trim();
    return options.filter((o) => {
      const s =
        `${o.modelo ?? ""} ${o.almacenamiento_gb ?? ""} ${o.color ?? ""} ${
          o.sku ?? ""
        } ${o.imei_1 ?? ""} ${o.imei_2 ?? ""}`.toLowerCase();
      return s.includes(q);
    });
  }, [options, input]);

  return (
    <Autocomplete
      disablePortal={disablePortal}
      slots={{ popper: DropdownPopper, paper: Paper }}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            // CUADRADO
            borderRadius: 0,
            border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
            boxShadow: "0 10px 24px rgba(16,24,40,0.12)",
            bgcolor: theme.palette.background.paper,
            // animación sutil
            transformOrigin: "top left",
            animation: "dropIn 120ms cubic-bezier(.2,.8,.2,1)",
            "@keyframes dropIn": {
              from: { opacity: 0, transform: "translateY(-6px) scale(.985)" },
              to: { opacity: 1, transform: "translateY(0) scale(1)" },
            },
          },
        },
      }}
      value={value}
      onChange={(_, newVal) => {
        setValue(newVal);
        if (newVal) onPick?.(newVal);
      }}
      inputValue={input}
      onInputChange={(_, v) => {
        setInput(v);
        onSearch?.(v);
      }}
      options={localFilter}
      getOptionKey={(o) => String(o.id)}
      getOptionLabel={(o) =>
        o ? `${o.modelo ?? ""} ${o.almacenamiento_gb ?? ""}GB` : ""
      }
      filterOptions={(x) => x} // delegamos filtro
      noOptionsText="Sin resultados"
    renderOption={(props, o, { selected }) => (
  <Box
    component="li"
    {...props}
    key={o.id}
    sx={{
      m: 0,
      px: 1.25,
      py: 1,
      display: "flex",               // ⬅️ flex en vez de grid
      alignItems: "center",
      gap: 1.5,
      borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.8)}`,
      "&:last-of-type": { borderBottom: "none" },
      transition: "background-color .12s ease",
      "&:hover": (t) => ({
        bgcolor:
          t.palette.mode === "dark"
            ? alpha(t.palette.primary.main, 0.12)
            : alpha(t.palette.primary.main, 0.06),
      }),
      ...(selected && {
        bgcolor: (t) =>
          t.palette.mode === "dark"
            ? alpha(t.palette.primary.main, 0.18)
            : alpha(t.palette.primary.main, 0.12),
      }),
    }}
  >
    {/* Icono */}
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: 1,
        bgcolor: "grey.100",
        display: "grid",
        placeItems: "center",
        color: "text.secondary",
        flexShrink: 0,
      }}
    >
      <SmartphoneIcon fontSize="small" />
    </Box>

    {/* Texto (ocupa el espacio medio) */}
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography
        sx={{
          fontWeight: 800,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {highlight(`${o.modelo} ${o.almacenamiento_gb}GB`, input)}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
        {!!o.color && <Chip size="small" label={o.color} sx={{ height: 20, bgcolor: "grey.100" }} />}
        {batteryChip(o.bateria_salud)}
        {!!(o.imei_1 || o.imei_2) && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}
          >
            IMEI: {highlight(o.imei_1 || o.imei_2 || "—", input)}
          </Typography>
        )}
        {o.sku && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}
          >
            SKU: {highlight(o.sku, input)}
          </Typography>
        )}
      </Box>
    </Box>

    {/* Precio (empujado al final) */}
    <Box sx={{ ml: "auto", textAlign: "right", minWidth: 110 }}>
      <Typography sx={{ fontWeight: 900, color: "primary.main" }}>
        {fUSD(Number(o.precio_lista || o.precio))}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.3 }}>
        USD
      </Typography>
    </Box>
  </Box>
)}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Modelo, color, SKU o IMEI…"
          {...textFieldProps}
          label="Buscar producto"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <SearchIcon fontSize="small" sx={{ mr: 1, color: "text.disabled" }} />
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      sx={{
        // CUADRADO en el input
        "& .MuiOutlinedInput-root": { borderRadius: 0 },
        "& .MuiAutocomplete-listbox": { py: 0 },
      }}
      ListboxProps={{
        style: { padding: 0, maxHeight: 380, overflow: "auto" },
      }}
    />
  );
}

BuscarProductoPro.propTypes = {
  options: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onSearch: PropTypes.func,
  onPick: PropTypes.func,
  textFieldProps: PropTypes.object,
  disablePortal: PropTypes.bool,
};
