// src/features/productos/pages/AltaTelefono.jsx
import {
  Grid,
  Paper,
  TextField,
  Typography,
  Button,
  MenuItem,
  Box,
  Stack,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useForm, useWatch } from "react-hook-form";
import { useMemo, useState } from "react";
import UploadIcon from "@mui/icons-material/UploadFile";
import PropTypes from "prop-types";
import { apiAgregarTelefono } from "../../../services/productos";

// ---------- UI ----------
const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  minHeight: 200,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  cursor: "pointer",
  overflow: "hidden",
  backgroundColor: theme.palette.background.paper,
  transition: "border-color .15s ease, box-shadow .15s ease",
  "&:hover": {
    borderColor: theme.palette.grey[500],
    boxShadow: "0 0 0 3px rgba(255,111,0,.15)",
  },
}));

// ---------- Datos fijos ----------
const MODELOS_IPHONE = [
  "iPhone X", "iPhone XR", "iPhone XS", "iPhone XS Max",
  "iPhone SE (2016)", "iPhone SE (2020)", "iPhone SE (2022)",
  "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max",
  "iPhone 12 mini", "iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max",
  "iPhone 13 mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max",
  "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
  "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
  "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max",
];

const CAPACIDADES_GB = [64, 128, 256, 512, 1024];

const PROVEEDORES_FIJOS = [
  { id: 1, nombre: "Proveedor 1" },
  { id: 2, nombre: "Proveedor 2" },
];

// Fix select en dark
const selectFixProps = {
  InputProps: { notched: false },
  InputLabelProps: {
    shrink: true,
    sx: { bgcolor: "background.paper", px: 0.75, zIndex: 1 },
  },
  SelectProps: {
    MenuProps: {
      PaperProps: {
        sx: {
          bgcolor: "background.paper",
          color: "text.main",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        },
      },
    },
    sx: { bgcolor: "background.paper" },
  },
  sx: {
    "& .MuiOutlinedInput-root": { bgcolor: "background.paper" },
    "& .MuiOutlinedInput-notchedOutline legend span": {
      bgcolor: "background.paper",
      px: 0.75,
    },
  },
};

export default function AltaTelefono({ onCreated }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      cantidad: 1,
      modelo: MODELOS_IPHONE[MODELOS_IPHONE.length - 1],
      almacenamiento_gb: 128,
      bateria_salud: 100,
      bateria_ciclos: "",
      proveedor_id: PROVEEDORES_FIJOS[0].id,
    },
  });

  // watch dinámicos
  const cantidad = useWatch({ control, name: "cantidad" }) || 1;
  const bateria_salud = useWatch({ control, name: "bateria_salud" });
  const estadoAuto = useMemo(() => {
    const val = Number(bateria_salud);
    if (!Number.isFinite(val)) return "nuevo";
    return val < 100 ? "usado" : "nuevo";
  }, [bateria_salud]);

  // galería
  const [preview, setPreview] = useState([null, null, null, null]);
  const [mainIndex, setMainIndex] = useState(0);
  const thumbs = useMemo(
    () => [0, 1, 2, 3].filter((i) => i !== mainIndex),
    [mainIndex]
  );

  const onImgChange = (e, idx) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB

    const reader = new FileReader();
    reader.onloadend = () => {
      const arr = [...preview];
      arr[idx] = { preview: reader.result, file };
      setPreview(arr);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data) => {
    // Valido cantidad
    const qty = Math.max(1, parseInt(data.cantidad, 10) || 1);

    // Construyo lista de IMEIs
    const imeis = [];
    for (let i = 0; i < qty; i++) {
      const v = data[`imei_1_${i}`];
      if (!v) {
        alert(`Falta el IMEI #${i + 1}`);
        return;
      }
      if (!/^\d{15}$/.test(String(v))) {
        alert(`El IMEI #${i + 1} debe tener 15 dígitos.`);
        return;
      }
      imeis.push(String(v));
    }

    // Evito IMEIs repetidos en la carga
    const unique = new Set(imeis);
    if (unique.size !== imeis.length) {
      alert("Hay IMEIs repetidos en la carga.");
      return;
    }

    // Campos comunes
    const base = {
      marca: "iPhone",
      modelo: data.modelo,
      almacenamiento_gb: Number(data.almacenamiento_gb),
      color: data.color?.trim(),
      bateria_salud: data.bateria_salud ? Number(data.bateria_salud) : null,
      bateria_ciclos: data.bateria_ciclos ? Number(data.bateria_ciclos) : null,
      estado: estadoAuto,        // auto por batería
      origen: "compra",          // fijo
      costo: Number(data.costo),
      precio_lista: Number(data.precio_lista),
      proveedor_id: Number(data.proveedor_id),
      garantia_meses: Number(data.garantia_meses || 0),
      notas: data.notas?.trim() || "",
      status_stock: "disponible",
    };

    // Orden de imágenes (solo para 1er equipo para no duplicar)
    const orderedImgs = [
      preview[mainIndex],
      ...[0, 1, 2, 3].filter((i) => i !== mainIndex).map((i) => preview[i]),
    ].filter(Boolean);

    try {
      let creados = 0;
      for (let i = 0; i < qty; i++) {
        const imgs = i === 0 ? orderedImgs.map((o) => o.file) : []; // solo primer alta con fotos
        await apiAgregarTelefono({ ...base, imei_1: imeis[i] }, imgs);
        creados++;
      }
      alert(`✅ Se cargó correctamente ${creados} iPhone(s).`);
      reset();
      setPreview([null, null, null, null]);
      setMainIndex(0);
      onCreated?.();
    } catch (e) {
      alert("⚠️ " + (e?.message || "Error al guardar"));
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, m: 2, borderRadius: 4 }} elevation={3}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Alta de iPhone
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={4}>
          {/* Galería */}
          <Grid item xs={12} md={5}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <label htmlFor="img-main">
                  <UploadBox sx={{ aspectRatio: "16 / 9" }}>
                    {preview[mainIndex]?.preview ? (
                      <img
                        src={preview[mainIndex].preview}
                        alt="principal"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <Box>
                        <UploadIcon sx={{ fontSize: 36, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          Click para cargar
                        </Typography>
                      </Box>
                    )}
                    <input
                      id="img-main"
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={(e) => onImgChange(e, mainIndex)}
                    />
                  </UploadBox>
                </label>
              </Grid>

              {thumbs.map((i) => (
                <Grid item xs={4} key={i}>
                  <label htmlFor={`img-${i}`}>
                    <UploadBox
                      onDoubleClick={() => preview[i] && setMainIndex(i)}
                      sx={{ aspectRatio: "1/1" }}
                    >
                      {preview[i]?.preview ? (
                        <img
                          src={preview[i].preview}
                          alt={`mini-${i}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <Box>
                          <UploadIcon sx={{ fontSize: 28, color: "text.secondary" }} />
                          <Typography variant="body2" color="text.secondary">
                            Click para cargar
                          </Typography>
                        </Box>
                      )}
                      <input
                        id={`img-${i}`}
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={(e) => onImgChange(e, i)}
                      />
                    </UploadBox>
                  </label>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Formulario */}
          <Grid item xs={12} md={7}>
            <Stack spacing={2}>
              {/* Marca fija + Cantidad */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField label="Marca" value="iPhone" fullWidth disabled />
                <input type="hidden" value="iPhone" {...register("marca")} />
                <TextField
                  label="Cantidad"
                  type="number"
                  fullWidth
                  inputProps={{ min: 1, max: 50 }}
                  {...register("cantidad", {
                    required: true,
                    valueAsNumber: true,
                    min: 1,
                  })}
                  error={!!errors.cantidad}
                  helperText={errors.cantidad && "Ingresá una cantidad válida"}
                />
              </Stack>

              {/* Modelo y Almacenamiento */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Modelo"
                  select
                  fullWidth
                  {...register("modelo", { required: true })}
                  error={!!errors.modelo}
                  helperText={errors.modelo && "Elegí un modelo"}
                  {...selectFixProps}
                >
                  {MODELOS_IPHONE.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Almacenamiento (GB)"
                  select
                  fullWidth
                  {...register("almacenamiento_gb", {
                    required: true,
                    valueAsNumber: true,
                  })}
                  error={!!errors.almacenamiento_gb}
                  helperText={errors.almacenamiento_gb && "Elegí capacidad"}
                  {...selectFixProps}
                >
                  {CAPACIDADES_GB.map((gb) => (
                    <MenuItem key={gb} value={gb}>
                      {gb} GB
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              {/* Batería y estado auto */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                <TextField
                  label="Batería (salud %)"
                  type="number"
                  fullWidth
                  inputProps={{ min: 50, max: 100 }}
                  {...register("bateria_salud", {
                    required: true,
                    valueAsNumber: true,
                    min: 50,
                    max: 100,
                  })}
                  error={!!errors.bateria_salud}
                  helperText={errors.bateria_salud && "Entre 50 y 100"}
                />
                <TextField
                  label="Ciclos (opcional)"
                  type="number"
                  fullWidth
                  inputProps={{ min: 0 }}
                  {...register("bateria_ciclos", { valueAsNumber: true })}
                />
                <Box sx={{ minWidth: 160, textAlign: "center" }}>
                  <Typography sx={{padding:"10px"}} variant="caption" color="text.secondary">
                    Estado :
                  </Typography>
                  <Chip
                    label={estadoAuto.toUpperCase()}
                    color={estadoAuto === "nuevo" ? "success" : "warning"}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Stack>

              {/* Color */}
              <TextField
                label="Color"
                fullWidth
                {...register("color", { required: "Requerido" })}
                error={!!errors.color}
                helperText={errors.color?.message}
              />

              {/* IMEIs dinámicos */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  IMEIs (uno por equipo)
                </Typography>
                <Grid container spacing={2}>
                  {Array.from({ length: Math.max(1, parseInt(cantidad, 10) || 1) }).map(
                    (_, i) => (
                      <Grid item xs={12} sm={6} key={i}>
                        <TextField
                          label={`IMEI #${i + 1}`}
                          fullWidth
                          {...register(`imei_1_${i}`, {
                            required: true,
                            pattern: /^\d{15}$/,
                          })}
                          error={!!errors[`imei_1_${i}`]}
                          helperText={
                            errors[`imei_1_${i}`]
                              ? "Debe tener 15 dígitos"
                              : " "
                          }
                        />
                      </Grid>
                    )
                  )}
                </Grid>
              </Box>

              {/* Precios */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Costo de compra"
                  type="number"
                  fullWidth
                  {...register("costo", { required: true, valueAsNumber: true })}
                  error={!!errors.costo}
                  helperText={errors.costo && "Requerido"}
                />
                <TextField
                  label="Precio de venta (lista)"
                  type="number"
                  fullWidth
                  {...register("precio_lista", { required: true, valueAsNumber: true })}
                  error={!!errors.precio_lista}
                  helperText={errors.precio_lista && "Requerido"}
                />
              </Stack>

              {/* Proveedor + Garantía */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Proveedor"
                  select
                  fullWidth
                  {...register("proveedor_id", { required: true, valueAsNumber: true })}
                  error={!!errors.proveedor_id}
                  helperText={errors.proveedor_id && "Seleccioná un proveedor"}
                  {...selectFixProps}
                >
                  {PROVEEDORES_FIJOS.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.nombre}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Garantía (meses)"
                  type="number"
                  fullWidth
                  {...register("garantia_meses", { valueAsNumber: true })}
                />
              </Stack>

              {/* Notas */}
              <TextField label="Notas" fullWidth multiline rows={3} {...register("notas")} />

              <Button type="submit" variant="contained">
                Guardar
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}

AltaTelefono.propTypes = {
  onCreated: PropTypes.func,
};

AltaTelefono.defaultProps = {
  onCreated: () => {},
};
