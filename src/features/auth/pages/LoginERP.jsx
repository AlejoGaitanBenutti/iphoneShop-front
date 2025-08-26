import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton
} from "@mui/material";
import { login } from "../services/login";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Lock from "@mui/icons-material/Lock";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { GoogleLogin } from '@react-oauth/google';
import { token } from "stylis";


const LoginERP = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const apiUrlGoogle = "/api/usuarios/google-login.php"; 

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const user = await login(email, password);

      if (!user || !user.usuario || !user.usuario.nombre) {
        throw new Error("Usuario no válido.");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
        window.location.reload();
      }, 1000);
    } catch (error) {
      setError("❌ Error al iniciar sesión. Verifica tus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0e0e0e, #1a1a1a)",
          p: 2
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            width: "100%",
            maxWidth: 960,
            height: { xs: "auto", md: 500 },
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            borderRadius: 3,
            overflow: "hidden",
            backgroundColor: "#121212"
          }}
        >
          <Box
            sx={{
              flex: 1,
              backgroundColor: "#1f1f1f",
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 4,
            }}
          >
            <img src="./assets/AdminTrust.png" alt="Logo TrustAdmin" style={{ width: 200, marginBottom: 20 }} />
          </Box>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 4
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: 350,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography component="h1" variant="h5" sx={{ color: "white!important", mb: 2 }}>
                Inicia sesión
              </Typography>
              <form onSubmit={handleLogin} style={{ width: "100%" }}>
                <TextField
                  fullWidth
                  label="Usuario o Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  InputLabelProps={{ style: { color: '#ccc' } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircle sx={{ color: "#ccc" }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    "& .MuiInputBase-input": {
                      color: "#fff",
                      caretColor: "#fff"
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#444"
                      },
                      "&:hover fieldset": {
                        borderColor: "#f57c00"
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#f57c00"
                      }
                    },
                    backgroundColor: '#1e1e1e'
                  }}
                />

                <TextField
                  fullWidth
                  label="Contraseña"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  InputLabelProps={{ style: { color: '#ccc' } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "#ccc" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleTogglePassword} edge="end" sx={{ color: '#ccc' }}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    "& .MuiInputBase-input": {
                      color: "#fff",
                      caretColor: "#fff"
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#444"
                      },
                      "&:hover fieldset": {
                        borderColor: "#f57c00"
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#f57c00"
                      }
                    },
                    backgroundColor: '#1e1e1e'
                  }}
                />

                {error && (
                  <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                    {error}
                  </Typography>
                )}

                <FormControlLabel
                  sx={{ display: "flex", paddingLeft: "8px" }}
                  control={<Checkbox sx={{ color: "#fff" }} />}
                  label={<Typography sx={{ color: '#ccc', fontSize: "1rem" }}>Recuérdame</Typography>}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 2,
                    mb:2,
                    backgroundColor: "#f57c00",
                    '&:hover': { backgroundColor: "#ffa040" },
                  }}
                  disabled={loading || success}
                >
                  {loading ? <CircularProgress size={30} sx={{ color: "#f57c00" }} /> : success ? <CheckCircleOutlineIcon sx={{ color: '#f57c00', fontSize: '2rem' }} /> : "Iniciar sesión"}
                </Button>

                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                   
                    // Enviá ese token al backend si lo vas a verificar del lado del servidor
                    const token = credentialResponse.credential;
                    
                   fetch(apiUrlGoogle ,{
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ token }),
                      credentials: "include",
                    })
                    .then((res)=> res.json())
                    .then((data) => {
                       if (data?.usuario?.rol) {
                      // ✅ Redirigir si el login fue exitoso
                      navigate("/dashboard");
                    }
                    })
                    .catch((err)=> console.error("Error en loguear con google", err));

                    
                  }}
                  onError={() => {
                    console.log("Falló el login con Google");
                  }}
                />

                <Typography variant="body2" align="center" sx={{ mt: 2, color: '#ccc' }}>
                  ¿No tenés cuenta? <span style={{ color: "#ffa040", cursor: "pointer" }}>Registrate</span>
                </Typography>
              </form>
            </Box>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default LoginERP;
