import React, { useState, useRef } from "react";
import {
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  MenuItem,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  InputAdornment,
  Dialog,
  DialogContent
} from "@mui/material";
import {
  Phone,
  Email,
  AddHome,
  Badge,

  Wifi,
  Send,
  Security,
  Bolt,
  RocketLaunch,
  Public,
  Apartment,
  Verified,
  ConfirmationNumber,
  Hub,
  PriceChange,
  FlashOn,
  CloudUpload
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { ref, push } from "firebase/database";
import { db } from "../firebase";

const MotionPaper = motion(Paper);
const MotionBox = motion(Box);
const MotionTypography = motion(Typography);

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    title: "",
    surnameOrBusinessName: "",
    firstNamesOrContactName: "",
    idOrRegistrationNumber: "",
    phone: "",
    email: "",
    address: "",
    suburb: "",
    city: "",
    province: "",
    postalCode: "",
    packageName: "",
    voucherPrice: "",

    technicianOrAgent: "",
    notes: "",
    createdAt: new Date().toISOString(),
    status: "Pending"
  });

  const [idPhoto, setIdPhoto] = useState<File | null>(null);
  const [idPhotoBase64, setIdPhotoBase64] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const packagePlans = [
    { name: "Prepaid Stream Connect 50/25Mbps 30days @ R700 voucher", price: "R700" },
    { name: "Prepaid Fibre 20/10Mbps 30Days @ R349 Voucher", price: "R349" },
    { name: "Prepaid Stream Connect 25/25Mbps 30days @ R499 voucher", price: "R499" },
    { name: "Not sure if my address is covered. Please contact me", price: "TBD" }
  ];

  const playCelebrationSound = () => {
    try {
      // 1. Play the built-in procedural Web Audio API tones
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      // Tone 1
      let osc1 = ctx.createOscillator();
      let gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain1.gain.setValueAtTime(0.25, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();

      osc1.stop(ctx.currentTime + 0.3);

      // Tone 2
      let osc2 = ctx.createOscillator();
      let gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(698.46, ctx.currentTime + 0.12); // F5
      gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.5);

      // Chord Tone 3
      let osc3 = ctx.createOscillator();
      let gain3 = ctx.createGain();
      osc3.type = "sine";
      osc3.frequency.setValueAtTime(880.00, ctx.currentTime + 0.24); // A5

      gain3.gain.setValueAtTime(0.35, ctx.currentTime + 0.24);
      gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(ctx.currentTime + 0.24);
      osc3.stop(ctx.currentTime + 0.8);

      // 2. Play a standard external notification chime file if needed
      const standardChime = new Audio("https://assets.mixkit.co/active_storage/sfx/2013/2013-84.wav");
      standardChime.volume = 0.5;
      standardChime.play().catch(e => console.log("Standard HTML5 Audio playback deferred: ", e));

    } catch (e: any) {
      console.log("Audio presentation skipped:", e);
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIdPhoto(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const submitApplication = async () => {
    // strict validation checking
    const requiredFields = [
      { key: "title", label: "Title" },
      { key: "firstNamesOrContactName", label: "First Names / Business Contact Name" },
      { key: "surnameOrBusinessName", label: "Surname or Business Name" },
      { key: "idOrRegistrationNumber", label: "ID Number / Passport / Registration" },
      { key: "phone", label: "Contact Number" },
      { key: "email", label: "Email Address" },
      { key: "address", label: "Street Address" },
      { key: "suburb", label: "Suburb" },
      { key: "city", label: "City / Town" },
      { key: "postalCode", label: "Postal Code" },
      { key: "province", label: "Province" },
      { key: "packageName", label: "Prepaid Fibre Package" },
      { key: "technicianOrAgent", label: "Technician Name or Sales Agent" },
      { key: "notes", label: "Additional Comments / Notes" }

    ];

    for (const field of requiredFields) {
      if (!form[field.key as keyof typeof form]?.trim()) {
        setErrorMsg(`Please complete the required field: ${field.label}`);
        return;
      }
    }

    if (!idPhoto || !idPhotoBase64) {
      setErrorMsg("Please upload your ID or Passport Photo. This is compulsory.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const payload = {
        ...form,
        idPhotoBase64: idPhotoBase64,

        idPhotoFileName: idPhoto.name
      };

      await push(ref(db, "prepaidFibreLeads"), payload);
      playCelebrationSound();
      setSuccess(true);
      setShowCelebration(true);
      setShowInsights(true);
      
      // Reset form
      setForm({
        title: "",
        surnameOrBusinessName: "",
        firstNamesOrContactName: "",
        idOrRegistrationNumber: "",
        phone: "",
        email: "",
        address: "",
        suburb: "",
        city: "",
        province: "",
        postalCode: "",
        packageName: "",

        voucherPrice: "",
        technicianOrAgent: "",
        notes: "",
        createdAt: new Date().toISOString(),
        status: "Pending"
      });
      setIdPhoto(null);
      setIdPhotoBase64("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      console.log(err);
      setErrorMsg("An error occurred while submitting your application. Please try again.");
    }
    setLoading(false);
  };

  const styles = {
    page: {
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",

      padding: "50px 20px",
      background: "linear-gradient(145deg, #020024 0%, #090979 35%, #00d4ff 100%)"
    },
    background: {
      position: "absolute",
      top: 0, left: 0, right: 0, bottom: 0,
      overflow: "hidden", zIndex: 0
    },
    glass: {
      position: "relative",
      zIndex: 5, maxWidth: 1400,
      margin: "auto", overflow: "hidden",
      borderRadius: "38px",
      background: "rgba(255, 255, 255, 0.07)",
      backdropFilter: "blur(30px)",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      boxShadow: "0 35px 90px rgba(0,0,0,.4)"
    },
    input: {
      "& .MuiOutlinedInput-root": {
        background: "#ffffff",
        borderRadius: "18px",
        transition: ".4s",

        "& fieldset": { borderColor: "#d6e4ff" },
        "&:hover fieldset": { borderColor: "#00d4ff" },
        "&.Mui-focused fieldset": { borderWidth: 2, borderColor: "#090979" }
      }
    },
    uploadArea: {
      border: "2px dashed rgba(255, 255, 255, 0.4)",
      borderRadius: "18px",
      padding: "30px",
      textAlign: "center",
      background: "rgba(255, 255, 255, 0.05)",
      cursor: "pointer",
      transition: "0.3s",
      "&:hover": {
        borderColor: "#00d4ff",
        background: "rgba(255, 255, 255, 0.1)"
      }
    }
  };

  return (
    <Box sx={styles.page}>
      {/* ANIMATED AMBIENT SHAPES */}

      <Box sx={styles.background}>
        <motion.div animate={{ x: [0, 100, 0], y: [0, -80, 0], scale: [1, 1.15, 1] }} transition={{ duration: 18, repeat: Infinity }} style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "rgba(0, 212, 255, 0.15)", filter: "blur(130px)", top: -150, left: -100 }} />
        <motion.div animate={{ x: [0, -120, 0], y: [0, 120, 0], scale: [1, 1.2, 1] }} transition={{ duration: 22, repeat: Infinity }} style={{ position: "absolute", width: 450, height: 450, borderRadius: "50%", background: "rgba(9, 9, 121, 0.3)", filter: "blur(130px)", bottom: 50, right: -100 }} />
      </Box>
      <MotionPaper sx={styles.glass} initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        
        {/* HEADER HERO SECTION */}
        <Grid container spacing={5} alignItems="center" sx={{ p: 5 }}>
          <Grid item xs={12} md={8}>

            <MotionTypography variant="h2" fontWeight={900}>
              <span style={{ color: "#00d4ff" }}>Prepaid</span>
              <span style={{ color: "#FFFFFF" }}> OpenServe </span>
              <span style={{ color: "#6EC6FF" }}>Fibre</span>
            </MotionTypography>
            <Typography variant="h6" sx={{ color: "#00d4ff", mt: 1, fontWeight: 700 }}>
              Telkom ISP — Includes 14 Days Free Access!
            </Typography>
            <Typography variant="body1" sx={{ color: "#fff", mt: 1, opacity: 0.9 }}>
              Control your Fibre Internet Spend with Prepaid Fibre. No contracts, No credit Vetting. Complete the form and get connected. <strong>Free installation till end of September 2026.</strong> Whatsapp: 083 607 8922
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>

            <MotionBox display="flex" justifyContent="center" animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity }}>
              <Avatar sx={{ width: 180, height: 180, background: "linear-gradient(135deg, #090979, #00d4ff)", boxShadow: "0 35px 80px rgba(0,212,255,0.4)" }}>
                <FlashOn sx={{ fontSize: 90, color: "#fff" }} />
              </Avatar>
            </MotionBox>
          </Grid>
        </Grid>
        
        <Divider sx={{ borderColor: "rgba(255,255,255,0.15)" }} />
        {/* INPUT APP FORM FRAME */}
        <Box sx={{ p: { xs: 2, md: 5 } }}>
          
          {/* CLIENT REGISTRATION DATA CARD */}
          <Paper sx={{ p: 4, borderRadius: "30px", background: "#ffffff", mb: 4, boxShadow: "0 15px 40px rgba(0,0,0,0.05)" }}>
            <Typography variant="h5" fontWeight={900} color="#020024" mb={3}>Account Information</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={2}>
                <TextField select fullWidth label="Title *" name="title" value={form.title} onChange={handleChange} sx={styles.input} required>
                  {["Mr", "Mrs", "Miss", "MS", "Dr", "PS", "Prof", "Business"].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField fullWidth label="First Names / Business Contact Name *" name="firstNamesOrContactName" value={form.firstNamesOrContactName} onChange={handleChange} sx={styles.input} required />
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField fullWidth label="Surname or Business Name *" name="surnameOrBusinessName" value={form.surnameOrBusinessName} onChange={handleChange} sx={styles.input} required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="ID Number / Passport / Registration *" name="idOrRegistrationNumber" value={form.idOrRegistrationNumber} onChange={handleChange} sx={styles.input} required
                  InputProps={{ startAdornment: <InputAdornment position="start"><Badge color="primary" /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Contact Number *" name="phone" value={form.phone} onChange={handleChange} sx={styles.input} required InputProps={{ startAdornment: <InputAdornment position="start"><Phone color="primary" /></InputAdornment> }} />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label="Email Address *" name="email" value={form.email} onChange={handleChange} sx={styles.input} required InputProps={{ startAdornment: <InputAdornment position="start"><Email color="primary" /></InputAdornment> }} />
              </Grid>
            </Grid>
          </Paper>

          {/* ATTACH ID / PASSPORT PHOTO (COMPULSORY) */}
          <Paper sx={{ p: 4, borderRadius: "30px", background: "linear-gradient(135deg, #1e293b, #0f172a)", color: "#fff", mb: 4, border: "1px solid rgba(255, 255, 255, 0.1)" }}>
            <Typography variant="h5" fontWeight={900} mb={1}>Identity Verification *</Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.7)" mb={3}>
              Please upload a clear copy of your ID Document or Passport. Required for processing setup profiles.
            </Typography>
            <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} />
            <Box sx={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
              <CloudUpload sx={{ fontSize: 48, color: "#00d4ff", mb: 2 }} />
              <Typography variant="h6" fontWeight={700}>
                {idPhoto ? idPhoto.name : "Click to select or drag document file"}
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.5)" mt={1}>
                PNG, JPG or PDF formats (Compulsory)
              </Typography>
            </Box>
          </Paper>

          {/* PHYSICAL ROUTE TERMINATION MAP */}
          <Paper sx={{ p: 4, borderRadius: "30px", background: "linear-gradient(135deg, #090979, #4a00e0)", color: "#fff", mb: 4 }}>
            <Typography variant="h5" fontWeight={900} mb={3}>Installation Address Location</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField fullWidth label="Street Address *" name="address" value={form.address} onChange={handleChange} sx={styles.input} required InputProps={{ startAdornment: <InputAdornment position="start"><AddHome sx={{ color: "#00d4ff" }} /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Suburb *" name="suburb" value={form.suburb} onChange={handleChange} sx={styles.input} required />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="City / Town *" name="city" value={form.city} onChange={handleChange} sx={styles.input} required InputProps={{ startAdornment: <InputAdornment position="start"><Apartment sx={{ color: "#00d4ff" }} /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Postal Code *" name="postalCode" value={form.postalCode} onChange={handleChange} sx={styles.input} required />
              </Grid>
              <Grid item xs={12}>
                <TextField select fullWidth label="Province *" name="province" value={form.province} onChange={handleChange} sx={styles.input} required>
                  {["Gauteng", "Limpopo", "Mpumalanga", "Free State", "KwaZulu-Natal", "North West", "Northern Cape", "Western Cape", "Eastern Cape"].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </TextField>

              </Grid>
            </Grid>
          </Paper>

          {/* PREPAID BUDGET PACKAGE PREFERENCE SELECTION */}
          <Paper sx={{ p: 4, borderRadius: "30px", background: "linear-gradient(135deg, #020024, #090979)", color: "#fff", mb: 4 }}>
            <Typography variant="h5" fontWeight={900} mb={3}>Choose the Right Prepaid Fibre Package</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <TextField select fullWidth label="Select Voucher Option *" name="packageName" value={form.packageName} onChange={(e) => {
                  const targetPlan = packagePlans.find(p => p.name === e.target.value);
                  setForm(prev => ({ ...prev, packageName: e.target.value, voucherPrice: targetPlan?.price || "" }));
                }} sx={styles.input} required InputProps={{ startAdornment: <InputAdornment position="start"><Wifi sx={{ color: "#00d4ff" }} /></InputAdornment> }}>
                  {packagePlans.map(item => <MenuItem key={item.name} value={item.name}>{item.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center', background: "rgba(255,255,255,0.12)", borderRadius: "18px", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <Typography variant="subtitle2">Voucher Value</Typography>
                  <Typography variant="h4" fontWeight={900} sx={{ color: "#00d4ff" }}>{form.voucherPrice || "---"}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Technician Name or Sales Agent *" name="technicianOrAgent" value={form.technicianOrAgent} onChange={handleChange} sx={styles.input} required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth multiline rows={2} label="Additional Comments / Notes *" name="notes" value={form.notes} onChange={handleChange} sx={styles.input} required />
              </Grid>
            </Grid>
          </Paper>

          {/* RUN APPLICATION EXECUTE TRIGGER */}
          <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
            {errorMsg && (
              <Alert severity="error" variant="filled" sx={{ borderRadius: "18px", mb: 3, maxWidth: 450, fontWeight: "bold" }}>
                {errorMsg}
              </Alert>
            )}
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: .97 }}>
              <Button size="large" variant="contained" onClick={submitApplication} disabled={loading} endIcon={loading ? <CircularProgress size={24} color="inherit" /> : <Send />}
                sx={{ height: 68, minWidth: 360, fontSize: 20, fontWeight: 900, borderRadius: "50px", textTransform: "none", background: "linear-gradient(90deg, #00d4ff, #090979)", boxShadow: "0 20px 50px rgba(0,212,255,0.35)" }}>
                {loading ? "Submitting Application..." : "Submit Prepaid Fibre Application"}
              </Button>
            </motion.div>
          </Box>
        </Box>

        {/* =========================================================
             POST-SUBMISSION CONDITIONAL RENDERING VIEWBLOCK
           ========================================================= */}
        <AnimatePresence>
          {showInsights && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 1 }}>
              
              {/* THE PREPAID CONNECTION HUB */}
              <Paper sx={{ m: 5, p: 5, borderRadius: "30px", background: "linear-gradient(135deg, #0f172a, #1e293b)", color: "#fff", border: "1px solid rgba(0, 212, 255, 0.2)" }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Hub sx={{ fontSize: 40, mr: 2, color: "#00d4ff" }} />
                  <Typography variant="h4" fontWeight={900}>The Connection Hub: Prepaid Portal</Typography>
                </Box>
                <Typography variant="body1" color="rgba(255,255,255,0.8)" mb={4}>
                  Your application has reached our operational distribution routing system. Since there are **no contracts and no credit checks**, provisioning is fast-tracked immediately.
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 3, background: "rgba(255,255,255,0.05)", borderRadius: "20px", height: "100%" }}>
                      <ConfirmationNumber color="primary" />
                      <Typography variant="h6" fontWeight={700} mt={1}>Voucher Integration</Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.7)">Top up whenever you want using standard OpenServe and Telkom retail voucher codes. You completely control your internet budget.</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 3, background: "rgba(255,255,255,0.05)", borderRadius: "20px", height: "100%" }}>
                      <PriceChange color="success" />
                      <Typography variant="h6" fontWeight={700} mt={1}>Zero Active Billing Risk</Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.7)">No hidden subscription debt profiles, automated account bank reversals, or surprise invoice penalties. Pay as you stream.</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 3, background: "rgba(255,255,255,0.05)", borderRadius: "20px", height: "100%" }}>
                      <Public sx={{ color: "#00d4ff" }} />
                      <Typography variant="h6" fontWeight={700} mt={1}>14-Days Free Window Activation</Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.7)">Once line physical verification finishes, enjoy your initial complementary 14-day promotional allocation directly from OpenServe.</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
              
              {/* WHY CHOOSE OPENSERVE PREPAID */}
              <Paper sx={{ m: 5, p: 5, borderRadius: "30px", background: "linear-gradient(135deg, #090979, #00d4ff)", color: "#fff" }}>
                <Typography variant="h4" fontWeight={900} textAlign="center" mb={4}>Why Choose OpenServe Prepaid Fibre?</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, height: "100%", textAlign: "center", borderRadius: "24px", background: "rgba(255,255,255,.15)", color: "#fff" }}>
                      <Avatar sx={{ mx: "auto", mb: 2, width: 75, height: 75, background: "linear-gradient(135deg,#020024,#090979)" }}><Bolt sx={{ fontSize: 40 }} /></Avatar>
                      <Typography fontWeight={800} fontSize={20} mb={1}>No Credit Vetting</Typography>
                      <Typography color="rgba(255,255,255,.85)" variant="body2">Everyone qualifies instantly. No credit scores checked, no banking statements assessed, and no complex approval pathways.</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, height: "100%", textAlign: "center", borderRadius: "24px", background: "rgba(255,255,255,.15)", color: "#fff" }}>
                      <Avatar sx={{ mx: "auto", mb: 2, width: 75, height: 75, background: "linear-gradient(135deg,#020024,#090979)" }}><Security sx={{ fontSize: 40 }} /></Avatar>
                      <Typography fontWeight={800} fontSize={20} mb={1}>No Fixed Commitment</Typography>

                      <Typography color="rgba(255,255,255,.85)" variant="body2">Not locked into standard long-term cycles. Stop recharging when you travel, restart seamlessly when you return home.</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, height: "100%", textAlign: "center", borderRadius: "24px", background: "rgba(255,255,255,.15)", color: "#fff" }}>
                      <Avatar sx={{ mx: "auto", mb: 2, width: 75, height: 75, background: "linear-gradient(135deg,#020024,#090979)" }}><RocketLaunch sx={{ fontSize: 40 }} /></Avatar>
                      <Typography fontWeight={800} fontSize={20} mb={1}>Free Installation</Typography>
                      <Typography color="rgba(255,255,255,.85)" variant="body2">Save big with zero initial infrastructural deployment costs for connections placed before the end of September 2026.</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, height: "100%", textAlign: "center", borderRadius: "24px", background: "rgba(255,255,255,.15)", color: "#fff" }}>
                      <Avatar sx={{ mx: "auto", mb: 2, width: 75, height: 75, background: "linear-gradient(135deg,#020024,#090979)" }}><Verified sx={{ fontSize: 40 }} /></Avatar>
                      <Typography fontWeight={800} fontSize={20} mb={1}>Pure Uncapped Speed</Typography>
                      <Typography color="rgba(255,255,255,.85)" variant="body2">Even on prepaid paths, get unthrottled streaming data capacities optimized for high-demand digital households.</Typography>
                    </Paper>
                  </Grid>

                </Grid>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </MotionPaper>

      {/* POPUP CELEBRATION COMPONENT MODAL */}
      <Dialog open={showCelebration} onClose={() => setShowCelebration(false)} PaperProps={{ sx: { borderRadius: "28px", p: 2, textAlign: "center" } }}>
        <DialogContent>
          <motion.div initial={{ scale: 0.3, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", bounce: 0.5 }}>
            <Typography variant="h2" sx={{ mb: 2 }}>⚡</Typography>
          </motion.div>
          <Typography variant="h4" fontWeight={900} color="primary" gutterBottom>Application Received!</Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Your OpenServe Prepaid Fibre submission is complete. No credit verification required—ready for allocation checks!
          </Typography>
          <Button variant="contained"
            onClick={() => {
              setShowCelebration(false);
              setTimeout(() => {
                window.scrollTo({
                  top: document.body.scrollHeight,
                  behavior: 'smooth'
                });
              }, 150);
            }}
            sx={{ borderRadius: "12px", px: 4, textTransform: "none", fontWeight: "bold", background: "linear-gradient(90deg, #00d4ff, #090979)" }}
          >
            View Prepaid Infrastructure Specs
          </Button>
        </DialogContent>
      </Dialog>

      
      {/* FIXED BASE SUCCESS ALERTS BANNER */}
      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity="success" variant="filled" sx={{ borderRadius: "18px", fontSize: 16, fontWeight: 700 }}>
          🎉 Prepaid application created successfully! Portal access activated below.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;