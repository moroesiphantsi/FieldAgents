import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  InputAdornment,
  Snackbar,
  Alert,
  Modal,
  Fade,
  Backdrop,
} from "@mui/material";



import {
  Person,
  Badge,
  Email,
  Phone,
  Send,
  Star,
  WhatsApp,
  Engineering,
  Paid,
  Router,
  VerifiedUser,
  Block,
  SupportAgent,
  CalendarMonth,
  Call,
  Mail,
  LocationOn,
  Wifi,
  Speed,
} from "@mui/icons-material";

import { push, ref } from "firebase/database";
import { db } from "../firebase";

import bgImage from "../assets/background.jpg";

const Home = () => {
 const [form, setForm] = useState({
  idNumber: "",
  name: "",
  surname: "",
  contact: "",
  email: "",
  address: "",
});

  const [openSnack, setOpenSnack] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [packagePlan, setPackagePlan] = useState("");
const [price, setPrice] = useState("");

const handlePackageChange = (e: any) => {
  const value = e.target.value;
  setPackagePlan(value);

  if (value === "20/10") setPrice("R349.00 p/m");
  if (value === "25/25") setPrice("R499.00 p/m");
  if (value === "50/25") setPrice("R700.00 p/m");
};

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    if (!form.name || !form.surname || !form.contact || !form.email || !form.address || !packagePlan) {
      alert("Please fill in required fields");
      return;
    }

    await push(ref(db, "fibreLeads"), {
  ...form,
  packagePlan,
  price,
  status: "New Lead",
  createdAt: new Date().toISOString(),
});

    setForm({
  idNumber: "",
  name: "",
  surname: "",
  contact: "",
  email: "",
  address: "",
});
   setPackagePlan("");
  setPrice("");
  


    setOpenSnack(true);
    setOpenForm(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        position: "relative",
      }}
    >
      {/* DARK OVERLAY */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(120deg, rgba(0,0,0,0.75), rgba(0,20,40,0.85))",
        }}
      />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2, py: 8 }}>
        <Grid container spacing={6} alignItems="center">

          {/* LEFT SIDE */}
          <Grid item xs={12} md={12}>
  <Box sx={{ textAlign: "left" }}>
            <Typography variant="h2" fontWeight="bold" sx={{ color: "white" }}>
              GET CONNECTED WITH
            </Typography>

            <Typography variant="h2" fontWeight="bold" sx={{ color: "#4DA3FF" }}>
              OPENSERVE
            </Typography>

            <Typography variant="h2" fontWeight="bold" sx={{ color: "#ff4d4d" }}>
              FIBRE!
            </Typography></Box>

            <Typography variant="h2" fontWeight="bold"
              sx={{
                color: "#ddd",
                mt: 2,
                fontSize: "18px",
                maxWidth: "600px",
              }}
            >
              GET CONNECTED TODAY AND ENJOY ALL THESE AMAZING BENEFITS
            </Typography>

            {/* FEATURE CARDS */}
            <Grid
  container
  spacing={2}
  sx={{
    mt: 4,
    justifyContent: "center",
    maxWidth: "1200px",
  }}
>

              <Grid item xs={12} md={4}>
                <Paper sx={glassCard}>
                  <Wifi sx={{ fontSize: 40, color: "#4DA3FF" }} />
                  <Typography fontWeight="bold">Uncapped Data</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={glassCard}>
                  <Engineering sx={{ fontSize: 40, color: "#4DA3FF" }} />
                  <Typography fontWeight="bold">Free Installation</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={glassCard}>
                  <Speed sx={{ fontSize: 40, color: "#4DA3FF" }} />
                  <Typography fontWeight="bold">Fast and Reliable</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={glassCard}>
                  <Paid sx={{ fontSize: 40, color: "#4DA3FF" }} />
                  <Typography fontWeight="bold">Affordale</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={glassCard}>
                  <Router sx={{ fontSize: 40, color: "#4DA3FF" }} />
                  <Typography fontWeight="bold">Free WiFi Router</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={glassCard}>
                  <VerifiedUser sx={{ fontSize: 40, color: "#4DA3FF" }} />
                  <Typography fontWeight="bold">No Credit Checks</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={glassCard}>
                  <Block sx={{ fontSize: 40, color: "#4DA3FF" }} />
                  <Typography fontWeight="bold">No Contracts</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={glassCard}>
                  <SupportAgent sx={{ fontSize: 40, color: "#4DA3FF" }} />
                  <Typography fontWeight="bold">Dedicated Fibre Specialist Support</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={glassCard}>
                  <CalendarMonth sx={{ fontSize: 40, color: "#4DA3FF" }} />
                  <Typography fontWeight="bold">14 Days FRee TRial For New Prepaid Customers</Typography>
                </Paper>
              </Grid>

            </Grid>

           {/* 🌟 APPLY BUTTON (NEW) */}
<Box
  sx={{
    mt: 4,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  }}
>
  <Button
    onClick={() => setOpenForm(true)}
    startIcon={<Star />}
    sx={{
      px: 5,
      py: 1.8,
      borderRadius: "50px",
      fontWeight: "bold",
      fontSize: "16px",
      color: "white",
      background: "linear-gradient(90deg,#4DA3FF,#0066FF,#00C2FF)",
      boxShadow: "0 10px 30px rgba(77,163,255,0.4)",
      textTransform: "none",
      transition: "0.3s",
      "&:hover": {
        transform: "scale(1.05)",
        boxShadow: "0 15px 40px rgba(77,163,255,0.6)",
      },
    }}
  >
    Apply for Fibre Now
  </Button>
  
</Box>

{/* 🌍 COVERAGE CHECK CARD */}
<Box
  sx={{
    display: "flex",
    justifyContent: "center",
    mt: 5,
    mb: 4,
  }}
>
  <Paper
    elevation={10}
    sx={{
      p: 4,
      borderRadius: 5,
      width: "100%",
      maxWidth: 700,
      textAlign: "center",
      background: "rgba(255,255,255,0.08)",
      backdropFilter: "blur(18px)",
      border: "1px solid rgba(255,255,255,0.15)",
      color: "white",
      boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
    }}
  >
    {/* TITLE */}
    <Typography
      variant="h5"
      fontWeight="bold"
      sx={{
        mb: 1,
        background: "linear-gradient(90deg,#4DA3FF,#00C2FF)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      📡 Check Fibre Coverage Area
    </Typography>

    <Typography
      variant="body2"
      sx={{ color: "#cbd5e1", mb: 3 }}
    >
      Contact us instantly to confirm if fibre is available in your area
    </Typography>

    {/* ICON BUTTONS */}
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: 3,
        flexWrap: "wrap",
      }}
    >
      {/* WHATSAPP */}
      <Paper
        onClick={() =>
          window.open("https://wa.me/27685932102", "_blank")
        }
        sx={{
          p: 2,
          width: 160,
          textAlign: "center",
          cursor: "pointer",
          borderRadius: 4,
          bgcolor: "rgba(37, 211, 102, 0.08)",
          border: "1px solid rgba(37, 211, 102, 0.3)",
          transition: "0.3s",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: "0 10px 30px rgba(37,211,102,0.3)",
          },
        }}
      >
        <WhatsApp sx={{ fontSize: 40, color: "#25D366" }} />
        <Typography fontWeight="bold">WhatsApp</Typography>
        <Typography variant="body2">Instant Response</Typography>
      </Paper>

      {/* CALL */}
      <Paper
        onClick={() => window.open("tel:+27685932102")}
        sx={{
          p: 2,
          width: 160,
          textAlign: "center",
          cursor: "pointer",
          borderRadius: 4,
          bgcolor: "rgba(77,163,255,0.08)",
          border: "1px solid rgba(77,163,255,0.3)",
          transition: "0.3s",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: "0 10px 30px rgba(77,163,255,0.3)",
          },
        }}
      >
        <Call sx={{ fontSize: 40, color: "#4DA3FF" }} />
        <Typography fontWeight="bold">Call Us</Typography>
        <Typography variant="body2">Fast Support</Typography>
      </Paper>

      {/* EMAIL */}
      <Paper
        onClick={() =>
          window.open("mailto:lebo@miyfi.co.za")
        }
        sx={{
          p: 2,
          width: 160,
          textAlign: "center",
          cursor: "pointer",
          borderRadius: 4,
          bgcolor: "rgba(255,82,82,0.08)",
          border: "1px solid rgba(255,82,82,0.3)",
          transition: "0.3s",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: "0 10px 30px rgba(255,82,82,0.3)",
          },
        }}
      >
        <Mail sx={{ fontSize: 40, color: "#FF5252" }} />
        <Typography fontWeight="bold">Email</Typography>
        <Typography variant="body2">Get Info</Typography>
      </Paper>
    </Box>
  </Paper>
</Box>

          </Grid>

          {/* RIGHT SIDE REMOVED FORM (NOW MODAL ONLY) */}
          <Grid item xs={12} md={5}></Grid>

        </Grid>
      </Container>

      {/* 🧾 MODAL FORM */}
      <Modal
  open={openForm}
  onClose={() => setOpenForm(false)}
  closeAfterTransition
  BackdropComponent={Backdrop}
  BackdropProps={{ timeout: 500 }}
  sx={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    p: 2,
  }}
>
        <Fade in={openForm}>
          <Box sx={modalStyle}>
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      gap: 1,
    }}
  >
            <Typography variant="h4" fontWeight="bold">
              Check Availability
            </Typography>

            <Typography sx={{ mb: 2, color: "gray" }}>
              Enter your details and we will contact you instantly.
            </Typography>


            <TextField
              fullWidth
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
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
              label="Surname"
              name="surname"
              value={form.surname}
              onChange={handleChange}
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
              label="ID Number (Optional)"
              name="idNumber"
              value={form.idNumber}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
  fullWidth
  label="Installation Address"
  name="address"
  value={form.address}
  onChange={handleChange}
  margin="normal"
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <LocationOn />
      </InputAdornment>
    ),
  }}
/>

            <TextField
              fullWidth
              label="Contact Number"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
  select
  fullWidth
  label="Select Fibre Package"
  value={packagePlan}
  onChange={handlePackageChange}
  margin="normal"
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <Wifi />
      </InputAdornment>
    ),
  }}
  SelectProps={{
    native: true,
  }}
>
  <option value="">-- Choose Package --</option>
  <option value="20/10">20/10 Mbps</option>
  <option value="25/25">25/25 Mbps</option>
  <option value="50/25">50/25 Mbps</option>
</TextField>
{price && (
  <Paper
    sx={{
      mt: 2,
      p: 2,
      textAlign: "center",
      borderRadius: 3,
      background: "linear-gradient(135deg,#0ea5e9,#2563eb)",
      color: "white",
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    }}
  >
    <Typography variant="h6" fontWeight="bold">
      Selected Package Price
    </Typography>

    <Typography variant="h5" fontWeight="bold">
      {price}
    </Typography>
  </Paper>
)}
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<Send />}
              onClick={submit}
              sx={{
                mt: 3,
                py: 1.5,
                fontWeight: "bold",
                background: "linear-gradient(90deg,#4DA3FF,#0066FF)",
              }}
            >
              Submit Request
            </Button>
          </Box>
           </Box>
           
        </Fade>
      </Modal>

      {/* SUCCESS SNACKBAR */}
      <Snackbar
        open={openSnack}
        autoHideDuration={4000}
        onClose={() => setOpenSnack(false)}
      >
        <Alert severity="success">
          Request submitted successfully!
        </Alert>
      </Snackbar>
    </Box>

    
  );
};

export default Home;

/* STYLE OBJECTS */
const glassCard = {
  p: 2,
  textAlign: "center",
  bgcolor: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(10px)",
  color: "white",
  borderRadius: 3,
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",

  width: {
    xs: "95%",
    sm: 450,
  },

  maxHeight: "90vh",
  overflowY: "auto",

  bgcolor: "white",
  borderRadius: 4,
  boxShadow: 24,
  p: 4,

  /* Nice modern scrollbar */
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#f1f1f1",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#4DA3FF",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: "#0066FF",
  },
};
