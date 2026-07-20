
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
  Home,
  Badge,
  Wifi,

  Send,
  Security,
  Bolt,
  RocketLaunch,
  Apartment,
  Verified,
  AccountBalance,
  CalendarMonth,
  Payments,
  TrendingUp,
  Hub,
  Gavel,
  SupportAgent,
  CloudUpload,
  AttachFile
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { ref, push } from "firebase/database";
import { db } from "../firebase";

const MotionPaper = motion(Paper);
const MotionBox = motion(Box);
const MotionTypography = motion(Typography);


const ContractFibreLeads = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showInsights, setshowInsights] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    title: "",
    firstName: "",
    lastName: "",
    idNumber: "",
    phone: "",
    email: "",
    address: "",
    suburb: "",
    city: "",
    province: "",
    postalCode: "",
    companyName: "",

    companyAddress: "",
    companyPhone: "",
    grossIncome: "",
    netIncome: "",
    totalExpenses: "",
    paymentMethod: "Debit Order",
    bankName: "",
    accountNumber: "",
    debitOrderDate: "",
    packageName: "",
    monthlyPrice: "",
    technicianOrAgent: "",
    notes: "",
    createdAt: new Date().toISOString(),
    status: "Pending"
  });

  // Document Upload States
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idBase64, setIdBase64] = useState<string>("");

  const [bankFile, setBankFile] = useState<File | 

null>(null);
  const [bankBase64, setBankBase64] = useState<string>("");

  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [addressBase64, setAddressBase64] = useState<string>("");

  // Refs for custom inputs
  const idRef = useRef<HTMLInputElement>(null);
  const bankRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);

  const packagePlans = [
    { name: "50/25Mbps @ R695 x 12 months contract", price: "R695" },
    { name: "50/50Mbps @ R805 x 12 months contract", price: "R805" },
    { name: "100/100Mbps @ R1025 x 12 months contract", price: "R1025" },
    { name: "200/200Mbps @ R1365 x 12 months contract", price: "R1365" },
    { name: "300/150Mbps @ R1529 x 12 months contract", price: "R1529" },
    { name: "500/250Mbps @ R1699 x 12 months contract", price: "R1699" },
    { name: "Telkom Easy Connect WC 20/10 @ R345 pm x 12 months contract -Coverage dependant", price: "R345" },
    { name: "Telkom Easy Connect WC 40/20Mbps @ R425 pm x 12 months contract -Coverage dependant", price: "R425" },
    { name: "Telkom Stream Connect 50/25Mbps @ R695 pm x 12 months contract", price: "R695" },
    { name: "Telkom Stream Connect 25/25Mbps @ R499 pm x 12 months contract", price: "R499" },
    { name: "OpenServe Home Fibre 20 Mbps", price: "R399" },
    { name: "OpenServe Home Fibre 50 Mbps", price: "R599" },
    { name: "OpenServe Home Fibre 100 Mbps", price: "R799" },
    { name: "OpenServe Home Fibre 200 Mbps", price: "R999" },
    { name: "OpenServe Business Fibre 500 Mbps", 

price: "R1 499" },
    { name: "OpenServe Business Fibre 1 Gbps", price: "R1 999" }
  ];

  const playCelebrationSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      let osc1 = ctx.createOscillator();
      let gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc1.connect(gain1);

      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.4);

      let osc2 = ctx.createOscillator();
      let gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.6);

      let osc3 = ctx.createOscillator();
      let gain3 = ctx.createGain();
      osc3.type = "sine";
      osc3.frequency.setValueAtTime(880.00, ctx.currentTime + 0.3); // A5

      gain3.gain.setValueAtTime(0.4, ctx.currentTime + 0.3);
      gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.9);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(ctx.currentTime + 0.3);
      osc3.stop(ctx.currentTime + 0.9);
    } catch (e) {
      console.log("Audio failed to auto-play: ", e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setBase64: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitApplication = async () => {
    setErrorMsg(null);

    // Validation fields (all compulsory text fields except suburb, city, province, and postalCode)

    const requiredTextFields = [
      { key: "title", label: "Title" },
      { key: "firstName", label: "First Names" },
      { key: "lastName", label: "Surname" },
      { key: "idNumber", label: "ID Number Or Passport" },
      { key: "phone", label: "Contact Number" },
      { key: "email", label: "Email Address" },
      { key: "companyName", label: "Company Working For" },
      { key: "companyAddress", label: "Company Address" },
      { key: "companyPhone", label: "Company Contact No" },
      { key: "grossIncome", label: "Gross Income" },
      { key: "netIncome", label: "Net Income" },
      { key: "totalExpenses", label: "Total Monthly Expenses" },
      { key: "bankName", label: "Bank Name" },
      { key: "accountNumber", label: "Account Number" },
      { key: "debitOrderDate", label: "Debit Order Date" },
      { key: "address", label: "Street Address" },

      { key: "packageName", label: "Package Option Selection" },
      { key: "technicianOrAgent", label: "Technician or Sales Agent" },
      { key: "notes", label: "Additional Comments" }
    ];

    for (const field of requiredTextFields) {
      if (!form[field.key as keyof typeof form]?.trim()) {
        setErrorMsg(`Please fill out the compulsory field: ${field.label}`);
        return;
      }
    }

    // Document validation (ID and Bank Statement are strictly mandatory. Proof of address is optional)
    if (!idBase64) {
      setErrorMsg("Please upload your ID or Passport Copy (Compulsory).");
      return;
    }


    if (!bankBase64) {
      setErrorMsg("Please upload your 3 Months Bank Statement Copy (Compulsory).");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        documents: {
          idPassportCopy: idBase64,
          idPassportName: idFile?.name || "",
          bankStatement: bankBase64,
          bankStatementName: bankFile?.name || "",
          proofOfAddress: addressBase64 || null,
          proofOfAddressName: addressFile?.name || "Not Provided"
        }
      };

      await push(ref(db, "contractFibreLeads"), payload);

      playCelebrationSound();
      setSuccess(true);
      setShowCelebration(true);
      setshowInsights(true);
      
      // Reset text fields
      setForm({
        title: "",
        firstName: "",
        lastName: "",
        idNumber: "",
        phone: "",
        email: "",
        address: "",
        suburb: "",
        city: "",
        province: "",
        postalCode: "",
        companyName: "",
        companyAddress: "",
        companyPhone: "",
        grossIncome: "",
        netIncome: "",
        totalExpenses: "",

        paymentMethod: "Debit Order",
        bankName: "",
        accountNumber: "",
        debitOrderDate: "",
        packageName: "",
        monthlyPrice: "",
        technicianOrAgent: "",
        notes: "",
        createdAt: new Date().toISOString(),
        status: "Pending"
      });

      // Clear File states
      setIdFile(null);
      setIdBase64("");
      setBankFile(null);
      setBankBase64("");
      setAddressFile(null);
      setAddressBase64("");

      if (idRef.current) idRef.current.value = "";
      if (bankRef.current) bankRef.current.value = "";
      if (addressRef.current) addressRef.current.value = "";


    } catch (err) {
      console.log(err);
      setErrorMsg("An unexpected system transmission error occurred. Please try again.");
    }
    setLoading(false);
  };

  const styles = {
    page: {
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
      padding: "50px 20px",
      background: "linear-gradient(145deg,#00143C 0%,#003D99 22%,#006BFF 45%,#008CFF 70%,#39C8FF 100%)"
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
      background: "rgba(255,255,255,.08)",
      backdropFilter: "blur(30px)",
      border: "1px solid rgba(255,255,255,.18)",
      boxShadow: "0 35px 90px rgba(0,0,0,.35)"
    },
    input: {
      "& .MuiOutlinedInput-root": {
        background: "#ffffff",
        borderRadius: "18px",
        transition: ".4s",
        "& fieldset": { borderColor: "#d6e4ff" },
        "&:hover fieldset": { borderColor: "#2196f3" },
        "&.Mui-focused fieldset": { borderWidth: 2, borderColor: "#005CFF" }
      }
    },
    uploadCard: {
      p: 3,

      borderRadius: "18px",
      background: "rgba(255, 255, 255, 0.05)",
      border: "2px dashed rgba(255, 255, 255, 0.2)",
      textAlign: "center",
      cursor: "pointer",
      transition: "0.3s",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      "&:hover": {
        borderColor: "#39C8FF",
        background: "rgba(255, 255, 255, 0.1)"
      }
    }
  };

  return (
    <Box sx={styles.page}>
      {/* BACKGROUND ELEMENTS */}
      <Box sx={styles.background}>
        <motion.div animate={{ x: [0, 180, 0], y: [0, -120, 0], scale: [1, 1.25, 1] }} transition={{ duration: 20, repeat: Infinity }} style={{ position: "absolute", width: 520, height: 520, borderRadius: "50%", background: "rgba(0,102,255,.20)", filter: "blur(140px)", top: -180, left: -150 }} />
        <motion.div animate={{ x: [0, -150, 0], y: [0, 150, 0], scale: [1, 1.2, 1] }} transition={{ duration: 24, repeat: Infinity }} style={{ position: "absolute", width: 460, height: 460, borderRadius: "50%", background: "rgba(0,217,255,.18)", filter: "blur(140px)", top: 80, right: -150 }} />
      </Box>
      <MotionPaper sx={styles.glass} initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
        
        {/* HERO SECTION */}
        <Grid container spacing={5} alignItems="center" sx={{ p: 5 }}>
          <Grid item xs={12} md={8}>
            <MotionTypography variant="h2" fontWeight={900}>
              <span style={{ color: "#6EC6FF" }}>Open</span>
              <span style={{ color: "#B9E6FF" }}>Serve </span>
              <span style={{ color: "#FFFFFF" }}>Contract </span>
              <span style={{ color: "#67D8FF" }}>Fibre</span>
            </MotionTypography>
            <Typography variant="body1" sx={{ color: "#fff", mt: 1, opacity: 0.85 }}>
              Complete the form for pre-vetting | Office: 051 401 6514/6816 | Whatsapp: 068 593 2102 / 073 895 4522 | pitsok@telkom.co.za
            </Typography>
            <MotionTypography mt={3} fontSize={22} color="rgba(255,255,255,.95)" lineHeight={1.8}>
              Please Complete The Following Form!
            </MotionTypography>
          </Grid>
          <Grid item xs={12} md={4}>
            <MotionBox display="flex" justifyContent="center" animate={{ y: [0, -25, 0] }} transition={{ duration: 8, repeat: Infinity }}>
              <Avatar sx={{ width: 200, height: 200, background: "linear-gradient(135deg,#006BFF,#00B8FF)", boxShadow: "0 35px 80px rgba(0,107,255,.45)" }}>
                <Wifi sx={{ fontSize: 100, color: "#fff" }} />
              </Avatar>
            </MotionBox>
          </Grid>
        </Grid>
        
        <Divider sx={{ borderColor: "rgba(255,255,255,.18)" }} />
        {/* FORM FIELD MODULE */}
        <Box sx={{ p: { xs: 2, md: 5 } }}>
          
          {/* PERSONAL INFORMATION */}
          <Paper sx={{ p: 4, borderRadius: "30px", background: "#ffffff", mb: 4 }}>
            <Typography variant="h5" fontWeight={900} color="#0f172a" mb={3}>Personal Information</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={2}>
                <TextField select fullWidth label="Title *" name="title" value={form.title} onChange={handleChange} sx={styles.input} required>
                  {["Mr", "Mrs", "Miss", "MS", "Dr", "PS", "Prof"].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField fullWidth label="First Names (as on ID) *" name="firstName" value={form.firstName} onChange={handleChange} sx={styles.input} required />
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField fullWidth label="Surname *" name="lastName" value={form.lastName} onChange={handleChange} sx={styles.input} required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="ID Number Or Passport *" name="idNumber" value={form.idNumber} onChange={handleChange} sx={styles.input} required InputProps={{ startAdornment: <InputAdornment position="start"><Badge color="primary" /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Contact Number *" name="phone" value={form.phone} onChange={handleChange} sx={styles.input} required InputProps={{ startAdornment: <InputAdornment position="start"><Phone color="primary" /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Email Address *" name="email" value={form.email} onChange={handleChange} sx={styles.input} required InputProps={{ startAdornment: <InputAdornment position="start"><Email color="primary" /></InputAdornment> }} />
              </Grid>
            </Grid>
          </Paper>

          {/* EMPLOYMENT AND FINANCIAL DETAILS */}
          <Paper sx={{ p: 4, borderRadius: "30px", background: "#ffffff", mb: 4 }}>
            <Typography variant="h5" fontWeight={900} color="#0f172a" mb={3}>Employment & Financial Details</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Company Working For *" name="companyName" value={form.companyName} onChange={handleChange} sx={styles.input} required />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Company Address *" name="companyAddress" value={form.companyAddress} onChange={handleChange} sx={styles.input} required />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Company Contact No *" name="companyPhone" value={form.companyPhone} onChange={handleChange} sx={styles.input} required />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Gross Income *" name="grossIncome" value={form.grossIncome} onChange={handleChange} sx={styles.input} required InputProps={{ startAdornment: <InputAdornment position="start"><Payments color="primary" /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Net Income *" name="netIncome" value={form.netIncome} onChange={handleChange} sx={styles.input} required InputProps={{ startAdornment: <InputAdornment position="start"><Payments color="primary" /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Total Monthly Expenses *" name="totalExpenses" value={form.totalExpenses} onChange={handleChange} sx={styles.input} required InputProps={{ startAdornment: <InputAdornment position="start"><Payments color="secondary" /></InputAdornment> }} />
              </Grid>
            </Grid>
          </Paper>

          {/* BANKING DETAILS */}
          <Paper sx={{ p: 4, borderRadius: "30px", background: "#ffffff", mb: 4 }}>
            <Typography variant="h5" fontWeight={900} color="#0f172a" mb={1}>Banking & Payment Details</Typography>
            <Typography variant="caption" color="error" sx={{ display: 'block', mb: 3, fontWeight: 'bold' }}>* Debit Order is Compulsory</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField fullWidth disabled label="Payment Method" name="paymentMethod" value={form.paymentMethod} sx={styles.input} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Bank Name *" name="bankName" value={form.bankName} onChange={handleChange} sx={styles.input} required InputProps={{ startAdornment: <InputAdornment position="start"><AccountBalance color="primary" /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Account Number *" name="accountNumber" value={form.accountNumber} onChange={handleChange} sx={styles.input} required />
              </Grid>
              <Grid item xs={12}>
                <TextField select fullWidth label="Debit Order Date *" name="debitOrderDate" value={form.debitOrderDate} onChange={handleChange} sx={styles.input} required InputProps={{ startAdornment: <InputAdornment position="start"><CalendarMonth color="primary" /></InputAdornment> }} >
                  {["5th", "15th", "20th", "25th", "Last day"].map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          {/* DOCUMENT FILE UPLOADS */}
          <Paper sx={{ p: 4, borderRadius: "30px", background: "linear-gradient(135deg, #0f172a, #1e293b)", color: "#fff", mb: 4 }}>
            <Typography variant="h5" fontWeight={900} mb={1}>Document Uploads</Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.7)" mb={4}>
              Upload your verification documentation. Ensure scanned files are clearly legible.

            </Typography>
            <Grid container spacing={3}>
              {/* ID / PASSPORT (COMPULSORY) */}
              <Grid item xs={12} md={4}>
                <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} ref={idRef} onChange={(e) => handleFileUpload(e, setIdFile, setIdBase64)} />
                <Box sx={styles.uploadCard} onClick={() => idRef.current?.click()}>
                  <CloudUpload sx={{ fontSize: 40, color: "#6EC6FF", mb: 1 }} />
                  <Typography variant="subtitle1" fontWeight={700}>ID or Passport Copy *</Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.5)">Compulsory Upload</Typography>
                  {idFile && (
                    <Typography variant="body2" sx={{ color: "#34d399", mt: 1, fontWeight: "bold" }}>
                      <AttachFile sx={{ fontSize: 16, verticalAlign: "middle" }} /> {idFile.name}
                    </Typography>

                  )}
                </Box>
              </Grid>

              {/* BANK STATEMENT (COMPULSORY) */}
              <Grid item xs={12} md={4}>
                <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} ref={bankRef} onChange={(e) => handleFileUpload(e, setBankFile, setBankBase64)} />
                <Box sx={styles.uploadCard} onClick={() => bankRef.current?.click()}>
                  <CloudUpload sx={{ fontSize: 40, color: "#6EC6FF", mb: 1 }} />
                  <Typography variant="subtitle1" fontWeight={700}>3-Month Bank Statement *</Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.5)">Compulsory Upload</Typography>
                  {bankFile && (
                    <Typography variant="body2" sx={{ color: "#34d399", mt: 1, fontWeight: "bold" }}>

                      <AttachFile sx={{ fontSize: 16, verticalAlign: "middle" }} /> {bankFile.name}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* PROOF OF ADDRESS (OPTIONAL) */}
              <Grid item xs={12} md={4}>
                <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} ref={addressRef} onChange={(e) => handleFileUpload(e, setAddressFile, setAddressBase64)} />
                <Box sx={styles.uploadCard} onClick={() => addressRef.current?.click()}>
                  <CloudUpload sx={{ fontSize: 40, color: "#6EC6FF", mb: 1 }} />
                  <Typography variant="subtitle1" fontWeight={700}>Proof of Address</Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.5)">Optional Upload</Typography>

                  {addressFile && (
                    <Typography variant="body2" sx={{ color: "#34d399", mt: 1, fontWeight: "bold" }}>
                      <AttachFile sx={{ fontSize: 16, verticalAlign: "middle" }} /> {addressFile.name}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* LOCATION ADDRESS */}
          <Paper sx={{ p: 4, borderRadius: "30px", background: "linear-gradient(135deg,#003B99,#005CFF,#009DFF)", color: "#fff", mb: 4 }}>
            <Typography variant="h5" fontWeight={900} mb={3}>Installation / Delivery Address</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField fullWidth label="Street Address *" name="address" value={form.address} onChange={handleChange} sx={styles.input} required InputProps={{ startAdornment: <InputAdornment position="start"><Home sx={{ color: "#2196f3" }} /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Suburb" name="suburb" value={form.suburb} onChange={handleChange} sx={styles.input} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="City / Town" name="city" value={form.city} onChange={handleChange} sx={styles.input} InputProps={{ startAdornment: <InputAdornment position="start"><Apartment sx={{ color: "#2196f3" }} /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Postal Code" name="postalCode" value={form.postalCode} onChange={handleChange} sx={styles.input} />

              </Grid>
              <Grid item xs={12}>
                <TextField select fullWidth label="Province" name="province" value={form.province} onChange={handleChange} sx={styles.input}>
                  {["Gauteng", "Limpopo", "Mpumalanga", "Free State", "KwaZulu-Natal", "North West", "Northern Cape", "Western Cape", "Eastern Cape"].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          {/* PACKAGE CHOOSE SELECTION */}
          <Paper sx={{ p: 4, borderRadius: "30px", background: "linear-gradient(135deg,#001F5C,#005BFF,#00B8FF)", color: "#fff", mb: 4 }}>
            <Typography variant="h5" fontWeight={900} mb={3}>Packages (12 Months Contract - Includes Router & Free Installation)</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <TextField select fullWidth label="Select Package Option *" name="packageName" value={form.packageName} onChange={(e) => {
                  const targetPlan = packagePlans.find(p => p.name === e.target.value);
                  setForm(prev => ({ ...prev, packageName: e.target.value, monthlyPrice: targetPlan?.price || "" }));
                }} sx={styles.input} required InputProps={{ startAdornment: <InputAdornment position="start"><Wifi sx={{ color: "#2196f3" }} /></InputAdornment> }}>
                  {packagePlans.map(item => <MenuItem key={item.name} value={item.name}>{item.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center', background: "rgba(255,255,255,0.15)", borderRadius: "18px", color: "#fff" }}>

                  <Typography variant="subtitle2">Monthly Total</Typography>
                  <Typography variant="h4" fontWeight={900}>{form.monthlyPrice || "---"}</Typography>
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


          {/* SUBMIT BUTTON & ERROR LOGIC */}
          <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
            {errorMsg && (
              <Alert severity="error" variant="filled" sx={{ borderRadius: "18px", mb: 3, maxWidth: 500, fontWeight: "bold" }}>
                {errorMsg}
              </Alert>
            )}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: .98 }}>
              <Button size="large" variant="contained" onClick={submitApplication} disabled={loading} endIcon={loading ? <CircularProgress size={24} color="inherit" /> : <Send />}
                sx={{ height: 68, minWidth: 360, fontSize: 20, fontWeight: 900, borderRadius: "50px", textTransform: "none", background: "linear-gradient(90deg,#00C6FF,#0072FF)", boxShadow: "0 20px 50px rgba(0,150,255,.45)" }}>
                {loading ? "Submitting Application..." : "Submit OpenServe Fibre Application"}

              </Button>
            </motion.div>
          </Box>
        </Box>

        {/* =========================================================
             HIDDEN SECTIONS BELOW: ONLY RENDERED AFTER SUCCESSFUL SUBMISSION
           ========================================================= */}
        <AnimatePresence>
          {showInsights && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 1 }}>
              
              {/* THE CONNECTION HUB COMPONENT */}
              <Paper sx={{ m: 5, p: 5, borderRadius: "30px", background: "linear-gradient(135deg, #1e1b4b, #311042)", color: "#fff", boxShadow: "0 30px 80px rgba(139, 92, 246, 0.25)" }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Hub sx={{ fontSize: 40, mr: 2, color: "#a78bfa" }} />
                  <Typography variant="h4" fontWeight={900}>The Connection Hub Portal</Typography>
                </Box>
                <Typography variant="body1" color="rgba(255,255,255,0.8)" mb={4}>
                  Welcome to the ultimate network administration utility context. Your setup progress has been automatically allocated to an orchestration environment layout.
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 3, background: "rgba(255,255,255,0.06)", borderRadius: "20px" }}>
                      <TrendingUp color="primary" />
                      <Typography variant="h6" fontWeight={700} mt={1}>Dynamic Route Mapping</Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.7)">Smart provisioning modules detect the optimal fiber termination endpoint nearest your coordinates.</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 3, background: "rgba(255,255,255,0.06)", borderRadius: "20px" }}>
                      <SupportAgent color="secondary" />
                      <Typography variant="h6" fontWeight={700} mt={1}>Concerted SLA Support</Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.7)">Immediate entry into direct help-desk priority queues for instantaneous fiber circuit diagnostic assessments.</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>

                    <Box sx={{ p: 3, background: "rgba(255,255,255,0.06)", borderRadius: "20px" }}>
                      <Gavel sx={{ color: "#34d399" }} />
                      <Typography variant="h6" fontWeight={700} mt={1}>Contract Management</Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.7)">Seamless digital storage for viewing contract lifecycle details, monthly invoices, and speed-tier alterations.</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* WHY CHOOSE OPENSERVE */}
              <Paper sx={{ m: 5, p: 5, borderRadius: "30px", background: "linear-gradient(135deg,#003C99,#0066FF,#00BFFF)", color: "#fff" }}>
                <Typography variant="h4" fontWeight={900} textAlign="center" mb={4}>Why Choose OpenServe Fibre?</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, height: "100%", textAlign: "center", borderRadius: "24px", background: "rgba(255,255,255,.12)", color: "#fff" }}>
                      <Avatar sx={{ mx: "auto", mb: 2, width: 75, height: 75, background: "linear-gradient(135deg,#00C6FF,#0072FF)" }}><Bolt sx={{ fontSize: 40 }} /></Avatar>
                      <Typography fontWeight={800} fontSize={22} mb={1}>Ultra Fast Speeds</Typography>
                      <Typography color="rgba(255,255,255,.85)">Experience lightning-fast fibre with stable, high-performance internet built for streaming, gaming, and remote work.</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, height: "100%", textAlign: "center", borderRadius: "24px", background: "rgba(255,255,255,.12)", color: "#fff" }}>
                      <Avatar sx={{ mx: "auto", mb: 2, width: 75, height: 75, background: "linear-gradient(135deg,#00E5FF,#0088FF)" }}><Security sx={{ fontSize: 40 }} /></Avatar>
                      <Typography fontWeight={800} fontSize={22} mb={1}>Secure Network</Typography>
                      <Typography color="rgba(255,255,255,.85)">Advanced fibre infrastructure designed for maximum reliability and uninterrupted connectivity across South Africa.</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, height: "100%", textAlign: "center", borderRadius: "24px", background: "rgba(255,255,255,.12)", color: "#fff" }}>
                      <Avatar sx={{ mx: "auto", mb: 2, width: 75, height: 75, background: "linear-gradient(135deg,#0099FF,#005CFF)" }}><RocketLaunch sx={{ fontSize: 40 }} /></Avatar>
                      <Typography fontWeight={800} fontSize={22} mb={1}>Fast Installation</Typography>
                      <Typography color="rgba(255,255,255,.85)">Professional installation by experienced technicians with quick turnaround and stellar customer care values.</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, height: "100%", textAlign: "center", borderRadius: "24px", background: "rgba(255,255,255,.12)", color: "#fff" }}>
                      <Avatar sx={{ mx: "auto", mb: 2, width: 75, height: 75, background: "linear-gradient(135deg,#38BDF8,#2563EB)" }}><Verified sx={{ fontSize: 40 }} /></Avatar>
                      <Typography fontWeight={800} fontSize={22} mb={1}>Trusted Fibre</Typography>
                      <Typography color="rgba(255,255,255,.85)">Join thousands of South Africans enjoying premium connectivity backed by trusted national telecommunications channels.</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>

              {/* BOTTOM EXPANDED CONTRACT ADVANTAGES CONTAINER */}
              <Paper sx={{ m: 5, p: 5, borderRadius: "32px", background: "linear-gradient(135deg,#012A63,#004AAD,#007BFF,#00B4FF)", color: "#fff" }}>
                <Typography variant="h4" fontWeight={900} textAlign="center" mb={2}>OpenServe Contract Fibre Details</Typography>
                <Typography textAlign="center" fontSize={18} color="rgba(255,255,255,.92)" mb={4}>
                  Experience next-generation broadband infrastructure. By opting for our premium contract paths, you establish premium service privileges.
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: "100%", textAlign: "center", borderRadius: "24px", background: "rgba(255,255,255,.12)", color: "#fff" }}>
                      <Wifi sx={{ fontSize: 55, mb: 2 }} />
                      <Typography fontWeight={800} fontSize={22}>Zero Upfront Fees</Typography>
                      <Typography mt={1}>Standard installations, drop cable connections, and high-performance Wi-Fi routers are bundled symmetrically inside the contract.</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: "100%", textAlign: "center", borderRadius: "24px", background: "rgba(255,255,255,.12)", color: "#fff" }}>
                      <RocketLaunch sx={{ fontSize: 55, mb: 2 }} />

                      <Typography fontWeight={800} fontSize={22}>Symmetric Capabilities</Typography>
                      <Typography mt={1}>Enjoy lightning-fast upload capacities parallel to download tracks on specified package parameters, optimal for cloud hosting arrays.</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: "100%", textAlign: "center", borderRadius: "24px", background: "rgba(255,255,255,.12)", color: "#fff" }}>
                      <Verified sx={{ fontSize: 55, mb: 2 }} />
                      <Typography fontWeight={800} fontSize={22}>Uncapped & Unthrottled</Typography>
                      <Typography mt={1}>No hidden data limitations or fair usage caps. Run continuous high-capacity workflows around the clock seamlessly.</Typography>
                    </Paper>
                  </Grid>

                </Grid>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </MotionPaper>

      {/* POPUP CELEBRATION MODAL */}
      <Dialog open={showCelebration} onClose={() => setShowCelebration(false)} PaperProps={{ sx: { borderRadius: "28px", p: 2, textAlign: "center" } }}>
        <DialogContent>
          <motion.div initial={{ scale: 0.3, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", bounce: 0.5 }}>
            <Typography variant="h2" sx={{ mb: 2 }}>🎉</Typography>
          </motion.div>
          <Typography variant="h4" fontWeight={900} color="primary" gutterBottom>Application Submitted!</Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>

            Your OpenServe Contract Fibre application has been processed effectively. Check below the form parameters to view newly unlocked coverage features!
          </Typography>
          <Button 
            variant="contained"
            onClick={() => {
              setShowCelebration(false);
              setTimeout(() => {
                window.scrollTo ({
                  top: document.body.scrollHeight, behavior: 'smooth'
                });
              }, 100);
            }}
            sx = {{borderRadius: "12px", px: 4, textTransform: "none", fontWeight: "bold" }}
          >
            View Network Insights
          </Button>
        </DialogContent>
      </Dialog>

      {/* FIXED TOAST BANNER */}
      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity="success" variant="filled" sx={{ borderRadius: "18px", fontSize: 16, fontWeight: 700 }}>
          🎉 Your Telkom Contract Application has been submitted successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContractFibreLeads;
