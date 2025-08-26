import * as React from "react";
import { Autocomplete, TextField, Chip, Stack, Typography, Paper, Popper } from "@mui/material";
import PropTypes from "prop-types";

// Popper con z-index alto (forwardRef requerido por MUI)
const ZPopper = React.forwardRef(function ZPopper(props, ref) {
  const { style, ...other } = props;
  return <Popper ref={ref} {...other} style={{ zIndex: 2147483647, ...(style || {}) }} />;
});
ZPopper.propTypes = { style: PropTypes.object };

export default function BuscarProductoLite({
  options,
  loading = false,
  onSearch,      // (texto) => void  -> dispara tu fetch
  onPick,        // (opcion) => void -> agrega al carrito
  label = "Buscar iPhone disponible",
  placeholder = "Modelo, color, IMEI, SKU…",
  textFieldProps = {},
  disablePortal = true, // 👈 por defecto SIN portal (render local)
}) {
  const [text, setText] = React.useState("");
  const [open, setOpen] = React.useState(false);

  // Cuando cambia el texto, avisamos al padre para que busque
  const handleInput = (_e, v) => {
    setText(v);
    onSearch?.(v);
  };

  // Abrimos/cerramos cuando llegan opciones o cambia el texto
  React.useEffect(() => {
    setOpen(Boolean(text) && options.length > 0);
  }, [text, options]);

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(Boolean(text) && options.length > 0)}
      onClose={() => setOpen(false)}
      keepMounted
      disablePortal={disablePortal}     // 👈 SIN portal (si quieres probá poner false/true)
      options={options}
      loading={loading}
      filterOptions={(x) => x}          // sin filtro extra del cliente
      getOptionLabel={(o) => (o && typeof o === "object" ? o.label ?? "" : "")}
      onInputChange={handleInput}
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
          bgcolor: "background.paper",
          color: "text.primary",
          "& .MuiAutocomplete-option": {
            py: 1,
            "&[aria-selected='true']": { bgcolor: "action.selected" },
            "&.Mui-focused": { bgcolor: "action.hover" },
          },
        },
      }}
      noOptionsText={text ? "Sin resultados" : "Escribí para buscar"}
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

BuscarProductoLite.propTypes = {
  options: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onSearch: PropTypes.func,
  onPick: PropTypes.func.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  textFieldProps: PropTypes.object,
  disablePortal: PropTypes.bool,
};
