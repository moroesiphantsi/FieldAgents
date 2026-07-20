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
  PersonAdd,
} from "@mui/icons-material";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const FieldAgentsSignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Please fill out all identity credentials.");
      return;
    }

    try {
      // 1. Authenticate Account Credential with Firebase Auth
      await createUserWithEmailAndPassword(auth, email, password);

      alert("Field Agent Profile Successfully Registered!");
      navigate("/field-agents-login");
    } catch (err: any) {
      alert(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <Box sx={styles.container}>
      <Paper sx={styles.card}>
        <Typography variant="h4" fontWeight="900" textAlign="center" sx={{ color: "#fff" }}>
          Agent Signup
        </Typography>

        <Typography textAlign="center" sx={{ color: "#94a3b8", mb: 3, fontSize: 14 }}>
          Register Your Account Profile
        </Typography>

        <TextField
          fullWidth
          label="Corporate Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          sx={styles.input}
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
          label="Create Security Password"
          type={show ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          sx={styles.input}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShow(!show)} sx={{ color: "#94a3b8" }}>
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
          onClick={handleSignUp}
          sx={styles.buttonStyle}
        >
          Complete Deployment Setup
        </Button>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: 13 }}>
            Already have a registered profile?
          </Typography>
          <Typography
            onClick={() => navigate("/field-agents-login")}
            sx={styles.link}
          >
            Return to Login Panel
          </Typography>
        </Box>

        <Typography textAlign="center" sx={{ mt: 3, fontSize: 12, color: "#64748b" }}>
          Authorized Agents Operations Only
        </Typography>
      </Paper>
    </Box>
  );
};

/* PLACE THIS RIGHT BELOW YOUR IMPORTS AT THE TOP OF BOTH FILES */
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #030712 0%, #0f172a 50%, #1e3a8a 100%)",
  },
  card: {
    width: 400,
    p: 4,
    borderRadius: "16px",
    background: "rgba(17, 24, 39, 0.75)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
  input: {
    "& .MuiOutlinedInput-root": {
      color: "#fff",
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      borderRadius: "10px",
      "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
      "&.Mui-focused fieldset": { borderColor: "#3b82f6" }
    },
    "& .MuiInputLabel-root": { color: "#94a3b8" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" },
    "& .MuiSvgIcon-root": { color: "#94a3b8" }
  },
  buttonStyle: {
    mt: 3,
    py: 1.5,
    fontWeight: "bold",
    borderRadius: "10px",
    textTransform: "none",
    fontSize: "1rem",
    background: "linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)",
    boxShadow: "0 4px 20px rgba(37, 99, 235, 0.3)",
    "&:hover": {
      background: "linear-gradient(90deg, #1d4ed8 0%, #6d28d9 100%)",
    }
  },
  link: {
    color: "#3b82f6",
    fontWeight: "bold",
    cursor: "pointer",
    mt: 0.5,
    fontSize: 14,
    transition: "0.2s",
    "&:hover": {
      color: "#60a5fa",
      textDecoration: "underline",
    },
  }
};

export default FieldAgentsSignUp;