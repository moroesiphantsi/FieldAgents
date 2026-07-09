import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";

import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Login,
} from "@mui/icons-material";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <Box sx={container}>
      <Paper sx={card}>
        <Typography variant="h4" fontWeight="bold" textAlign="center">
          Admin Login
        </Typography>

        <Typography textAlign="center" sx={{ color: "gray", mb: 3 }}>
          Fibre CRM Control Panel
        </Typography>

        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Password"
          type={show ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShow(!show)}>
                  {show ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          fullWidth
          variant="contained"
          startIcon={<Login />}
          onClick={login}
          sx={buttonStyle}
        >
          Login
        </Button>

<Box
  sx={{
    mt: 2,
    textAlign: "center",
  }}
>
  <Typography
    variant="body2"
    sx={{ color: "gray", fontSize: 13 }}
  >
    Don&apos;t have an account?
  </Typography>

  <Typography
    onClick={() => navigate("/admin/signup")}
    sx={{
      color: "#4DA3FF",
      fontWeight: "bold",
      cursor: "pointer",
      mt: 0.5,
      fontSize: 14,
      transition: "0.3s",
      "&:hover": {
        color: "#0066FF",
        textDecoration: "underline",
      },
    }}
  >
    Create Admin Account
  </Typography>
</Box>

        <Typography
          textAlign="center"
          sx={{ mt: 2, fontSize: 13, color: "gray" }}
        >
          Secure Fibre Network Access
        </Typography>
      </Paper>
    </Box>
  );
};

export default AdminLogin;

/* STYLES */
const container = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background:
    "linear-gradient(135deg,#0f172a,#1e3a8a,#0ea5e9)",
};

const card = {
  width: 380,
  p: 4,
  borderRadius: 4,
  backdropFilter: "blur(15px)",
  background: "rgba(255,255,255,0.9)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
};

const buttonStyle = {
  mt: 3,
  py: 1.5,
  fontWeight: "bold",
  background: "linear-gradient(90deg,#4DA3FF,#0066FF)",
};