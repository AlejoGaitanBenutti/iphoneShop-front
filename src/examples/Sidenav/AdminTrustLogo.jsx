/* eslint-disable react/prop-types */
import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";

function AdminTrustLogo({ size = "md", iconOnly = false, subtitle = true, sx = {} }) {
  const map = {
    xs: { svg: 24, title: 16, gap: 0.75 },
    sm: { svg: 32, title: 18, gap: 1.25 },
    md: { svg: 48, title: 22, gap: 1.5 },
    lg: { svg: 64, title: 26, gap: 1.75 },
  };
  const dims = map[size] || map.md;

  return (
    <Box display="flex" alignItems="center" gap={dims.gap} sx={sx}>
      <Box component="svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" sx={{ height: dims.svg, width: "auto" }}>
        <circle cx="24" cy="24" r="22" fill="url(#outerGradient)" stroke="url(#borderGradient)" strokeWidth="2" />
        <circle cx="24" cy="24" r="16" fill="url(#innerGradient)" opacity="0.9" />
        <path d="M24 8 L32 16 L24 24 L16 16 Z" fill="url(#centerGradient)" />
        <path d="M24 24 L32 32 L24 40 L16 32 Z" fill="url(#centerGradient)" opacity="0.8" />
        <path d="M20 30 L24 18 L28 30 M22 26 L26 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="24" cy="24" r="18" stroke="url(#accentGradient)" strokeWidth="1" opacity="0.3" />
        <circle cx="24" cy="24" r="14" stroke="url(#accentGradient)" strokeWidth="1" opacity="0.2" />
        <defs>
          <linearGradient id="outerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1F2937" />
            <stop offset="50%" stopColor="#111827" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
          <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#111827" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
          <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#FDBA74" />
          </linearGradient>
        </defs>
      </Box>

      {!iconOnly && (
        <Box display="flex" flexDirection="column" minWidth={0}>
          <Typography
            variant="h6"
            sx={{
              fontSize: dims.title,
              fontWeight: 800,
              lineHeight: 1,
              color: "#111827",
              whiteSpace: "nowrap",
            }}
          >
            Admin<span style={{ color: "#F97316" }}>Trust</span>
          </Typography>

          {subtitle && (
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                letterSpacing: 1.2,
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Dashboard
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

AdminTrustLogo.propTypes = {
  size: PropTypes.oneOf(["xs", "sm", "md", "lg"]),
  iconOnly: PropTypes.bool,
  subtitle: PropTypes.bool,
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default AdminTrustLogo;
