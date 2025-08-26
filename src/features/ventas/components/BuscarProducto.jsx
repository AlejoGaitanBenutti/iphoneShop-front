// src/features/ventas/components/BuscarProducto.jsx
import * as React from "react";
import {
  Autocomplete,
  TextField,
  Chip,
  Stack,
  Typography,
  Paper,
  Popper,
} from "@mui/material";
import PropTypes from "prop-types";

// Popper con forwardRef (MUI lo necesita) y z-index alto
const ZPopper = React.forwardRef(function ZPopper(props, ref) {
  const { style, ...other } = props;
  return (
    <Popper
      ref={ref}
      {...other}
      style={{ zIndex: 2147483647, ...(style || {}) }}
    />
  );
});
ZPopper.propTypes = { style: PropTypes.object };

// ⚠️ DEBUG: fuerza apertura SIEMPRE y normaliza opciones
export default function BuscarProducto({
  options,
  loading = false,
  inputValue,
  onInputChange,   // (event, value)
  onPick,          // (option)
  label = "Buscar iPhone disponible",
  placeholder = "Modelo, color, IMEI, SKU…",
  textFieldProps = {},
}) {
  // Normalizo las opciones a { id, label } pase lo que pase
  const normOptions = Array.isArray(options)
    ? options.map((o, i) => {
        if (o && typeof o === "object") {
          const id =
            o.id ?? o.value ?? o.key ?? o.sku ?? o.imei ?? `row-${i}`;
          // intento varias propiedades comunes por si tu API cambió
          const label =
            o.label ??
            o.nombre ??
            o.modelo ??
            o.text ??
            o.title ??
            "";
          return { id, label: String(label) };
        }
        return { id: `row-${i}`, label: String(o ?? "") };
      }).filter(o => o.label.trim().length > 0)
    : [];

  // Log para ver qué recibe
  console.log("AUTO DEBUG:", {
    inputValue,
    count: normOptions.length,
    first: normOptions[0],
    originalFirst: options?.[0],
  });

  return (
    <Autocomplete
      // 🔥 DEBUG: SIEMPRE ABIERTO y SIN portal (se ve dentro del Paper)
      open
      disablePortal
      keepMounted
      options={normOptions}
      loading={loading}
      value={null}
      isOptionEqualToValue={(o, v) => o?.id === v?.id}
      filterOptions={(x) => x} // no re-filtrar, ya viene listo
      getOptionLabel={(o) => (o && typeof o === "object" ? o.label ?? "" : "")}

      inputValue={inputValue}
      onInputChange={(e, v) => onInputChange(e, v)}
      onChange={(_, v) => v && onPick(v)}

      PopperComponent={ZPopper}
      PaperComponent={(paperProps) => (
        <Paper
          {...paperProps}
          elevation={8}
          sx={{
            bgcolor: "background.paper",
            color: "text.primary",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        />
      )}
      ListboxProps={{
        sx: {
          maxHeight: 320,
          overflow: "auto",
          "& .MuiAutocomplete-option": {
            py: 1,
            "&[aria-selected='true']": { bgcolor: "action.selected" },
            "&.Mui-focused": { bgcolor: "action.hover" },
          },
        },
      }}
      noOptionsText={inputValue ? "Sin resultados" : "Escribí para buscar"}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          {...textFieldProps}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip size="small" label={`#${option.id}`} />
            <Typography>{option.label}</Typography>
          </Stack>
        </li>
      )}
    />
  );
}

BuscarProducto.propTypes = {
  options: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  inputValue: PropTypes.string.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onPick: PropTypes.func.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  textFieldProps: PropTypes.object,
};
