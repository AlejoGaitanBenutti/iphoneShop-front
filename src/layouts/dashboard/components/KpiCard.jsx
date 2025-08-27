import PropTypes from "prop-types";
import { Card, CardContent, Box, Typography, IconButton, Tooltip } from "@mui/material";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import { alpha } from "@mui/material/styles";

export default function KpiCard({
  title,
  icon,
  value,
  prefix = "",
  suffix = "",
  hint = "",
  delta = 0,
  hideable = false,
  hidden = false,
  onToggle = () => {},
  footer = null,
  color = "primary", // NUEVO: “primary” | “info” | “warning” | “success” | “secondary”
}) {
  const isUp = Number(delta) >= 0;

  return (
    <Card
      elevation={0}
      sx={(theme) => {
        const c = theme.palette[color] || theme.palette.primary;
        return {
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(c.light, 0.10)} 0%, ${alpha(c.light, 0.04)} 100%)`,
          border: `1px solid ${alpha(c.main, 0.10)}`,
          boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
          transition: "transform .15s ease, box-shadow .15s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 10px 24px rgba(16,24,40,0.10)",
          },
        };
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        {/* título + icono arriba derecha */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="subtitle2" color="text.secondary">{title}</Typography>

          <Box
            sx={(theme) => {
              const c = theme.palette[color] || theme.palette.primary;
              return {
                width: 34,
                height: 34,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                backgroundColor: alpha(c.main, 0.12),
                color: c.main,
              };
            }}
          >
            {icon}
          </Box>
        </Box>

        {/* valor + delta + ojo */}
        <Box display="flex" alignItems="baseline" gap={1} mb={0.5}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary" }}>
            {hidden ? "•••••" : `${prefix}${value}${suffix}`}
          </Typography>

          <Box display="flex" alignItems="center" gap={0.5}>
            {isUp ? (
              <TrendingUpOutlinedIcon fontSize="small" sx={{ color: "success.main" }} />
            ) : (
              <TrendingDownOutlinedIcon fontSize="small" sx={{ color: "error.main" }} />
            )}
            <Typography
              variant="body2"
              sx={{ color: isUp ? "success.main" : "error.main", fontWeight: 700 }}
            >
              {isUp ? "+" : ""}{Number(delta).toFixed(1)}%
            </Typography>
          </Box>

          {hideable && (
            <Tooltip title={hidden ? "Mostrar" : "Ocultar"}>
              <IconButton size="small" onClick={onToggle}>
                {hidden ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {hint && (
          <Typography variant="caption" color="text.secondary">
            {hint}
          </Typography>
        )}

        {footer}
      </CardContent>
    </Card>
  );
}

KpiCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  prefix: PropTypes.string,
  suffix: PropTypes.string,
  hint: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  delta: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  hideable: PropTypes.bool,
  hidden: PropTypes.bool,
  onToggle: PropTypes.func,
  footer: PropTypes.node,
  color: PropTypes.oneOf(["primary", "info", "warning", "success", "secondary"]),
};

KpiCard.defaultProps = {
  prefix: "",
  suffix: "",
  hint: "",
  delta: 0,
  hideable: false,
  hidden: false,
  onToggle: () => {},
  footer: null,
  color: "primary",
};
