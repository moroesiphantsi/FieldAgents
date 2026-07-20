import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  MenuItem,
} from "@mui/material";
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Login,
  Badge,
} from "@mui/icons-material";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";


const FieldAgentsLogin = () => {
  const [selectedAgentName, setSelectedAgentName] = useState("");
  const [agentsList, setAgentsList] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  // Fetch registered agents from the real-time database pool
  useEffect(() => {
    const agentsRef = ref(db, "agents");
    const unsubscribe = onValue(agentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loaded = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        setAgentsList(loaded);
      } else {
        setAgentsList([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (!selectedAgentName) {
      alert("Please select your Agent Profile name before signing in.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Optional: Save the verified agent name to session storage to track who is logging forms
      sessionStorage.setItem("activeAgentName", selectedAgentName);
      navigate("/field-updates");
    } catch (err) {
      alert("Invalid credentials. Please verify your email and security key.");
    }
  };

  return (
    <Box sx={styles.container}>
      <Paper sx={styles.card}>
        <Typography variant="h4" fontWeight="900" textAlign="center" sx={{ color: "#fff" }}>
          Agent Login
        </Typography>

        <Typography textAlign="center" sx={{ color: "#94a3b8", mb: 3, fontSize: 14 }}>
          The Connection Hub • Agents Portal
        </Typography>

        {/* Dynamic Firebase Agent Selector Dropdown */}
        <TextField
          select
          fullWidth
          label="Select Your Agent Name"
          value={selectedAgentName}

          onChange={(e) => setSelectedAgentName(e.target.value)}
          margin="normal"
          sx={styles.input}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Badge sx={{ color: "#94a3b8" }} />
              </InputAdornment>
            ),
          }}
        >
          {agentsList.length === 0 ? (
            <MenuItem value="">No Agents Available</MenuItem>
          ) : (
            agentsList.map((agent) => {
              const nameValue = agent.fullName || agent.id;
              return (
                <MenuItem key={agent.id} value={nameValue}>
                  {nameValue}
                </MenuItem>

              );
            })
          )}
        </TextField>

        <TextField
          fullWidth
          label="Agent Corporate Email"
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
          label="Security Password"

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
          startIcon={<Login />}
          onClick={handleLogin}
          sx={styles.buttonStyle}
        >
          Authenticate & Enter Portal
        </Button>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: 13 }}>
            New  Agents?
          </Typography>
          <Typography
            onClick={() => navigate("/field-agents/signup")}
            sx={styles.link}
          >
            Register Agent Profile
          </Typography>
        </Box>

        <Typography textAlign="center" sx={{ mt: 3, fontSize: 12, color: "#64748b" }}>
          Secure OpenServe Fibre Network Deployment Access
        </Typography>
      </Paper>
    </Box>
  );
};

export default FieldAgentsLogin;


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
