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
  Person,
  Visibility,
  VisibilityOff,
  PersonAdd,
} from "@mui/icons-material";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const AdminSignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const navigate = useNavigate();

  const signup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Admin account created");
      navigate("/admin/login");
    } catch (err) {
      alert("Signup failed");
    }
  };

  return (
    <Box sx={container}>
      <Paper sx={card}>
        <Typography variant="h4" fontWeight="bold" textAlign="center">
          Admin Signup
        </Typography>

        <Typography textAlign="center" sx={{ color: "gray", mb: 3 }}>
          Create Fibre CRM Admin Account
        </Typography>

        <TextField
          fullWidth
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person />
              </InputAdornment>
            ),
          }}
        />

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
          startIcon={<PersonAdd />}
          onClick={signup}
          sx={buttonStyle}
        >
          Create Admin Account
        </Button>

        <Typography
          textAlign="center"
          sx={{ mt: 2, fontSize: 13, color: "gray" }}
        >
          Secure Access Required
        </Typography>
      </Paper>
    </Box>
  );
};

export default AdminSignUp;

/* STYLES */
const container = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background:
    "linear-gradient(135deg,#020617,#0f172a,#1e40af)",
};

const card = {
  width: 380,
  p: 4,
  borderRadius: 4,
  backdropFilter: "blur(15px)",
  background: "rgba(255,255,255,0.92)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
};

const buttonStyle = {
  mt: 3,
  py: 1.5,
  fontWeight: "bold",
  background: "linear-gradient(90deg,#22c55e,#4DA3FF)",
};