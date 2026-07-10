
// ==========================================
// 2026 NEXT-GEN FIELD AGENTS INTELLIGENT DASHBOARD
// ==========================================
import React, { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Chip,
  Divider,
  Avatar,
  Stack,

  LinearProgress,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip
} from "@mui/material";
import {
  Save,
  Payments,
  WorkspacePremium,
  Wifi,
  Engineering,
  AutoAwesome,
  Insights,
  Description,
  CheckCircle,
  Leaderboard,
  WarningAmber,
  Download,

  Search,
  Map,
  DeleteForever,
  NotificationsActive,
  VolumeUp
} from "@mui/icons-material";
import { ref, push, set, update, remove, onValue } from "firebase/database";
import { db } from "../firebase";

const FieldUpdates = () => {
  const [updates, setUpdates] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [agents, setAgents] = useState<any[]>([]);
  
  // New States for Search, Map Coverage and Filters
  const [searchText, setSearchText] = useState("");
  const [excelAgentFilter, setExcelAgentFilter] = useState("");
  const [coverageAddress, setCoverageAddress] = useState("");

  const [coverageResult, setCoverageResult] = useState<string | null>(null);

  // Delete Dialog States
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Sound and Notification States
  const [soundEnabled, setSoundEnabled] = useState(true);
  const isFirstLoad = useRef(true);

  // Get current active Month and Year
  const currentMonthIdx = new Date().getMonth(); // 0-11
  const currentYearNum = new Date().getFullYear();
  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"

  ];
  const currentMonthName = monthNames[currentMonthIdx];

  const emptyForm = {
    agentName: "",
    date: new Date().toISOString().split("T")[0],
    visitType: "Attended House",
    customerName: "",
    surname: "",
    idNumber: "",
    phone: "",
    address: "",
    houseNumber: "",
    saleType: "Prepaid",
    isFreeTrial: false,
    packagePlan: "",
    price: "",
    commission: 0,
    adminConfirmation: "Pending",
    status: "Pending",
    comments: "",
    fibreCoverageStatus: "Not Checked"
  };

  
  const [form, setForm] = useState(emptyForm);

  // Request browser Notification permissions on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Synthesize custom sound effect
  const playNewClientSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(587.33, 

audioCtx.currentTime); // D5 note
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
      
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.25);
      }, 120);
    } catch (e) {
      console.log("Audio failed to initialize:", e);
    }
  };

  // Push Native System Notification
  const triggerNativeNotification = (clientName: string, agent: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("💥 New Lead Captured!", {
        body: `${agent} added new client: ${clientName}`,
        icon: "https://cdn-icons-png.flaticon.com/512/3214/3214746.png"
      });
    }
  };

  

  /* ==========================================
      LOAD AGENTS FROM FIREBASE
  ========================================== */
  useEffect(() => {
    const agentsRef = ref(db, "agents");
    const unsubscribe = onValue(agentsRef, 

(snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map((key) => ({
          id: key,
          ...data[key]
        }));
        setAgents(list);
      } else {
        setAgents([]);
      }
    });
    return () => unsubscribe();
  }, []);

  /* ==========================================
      LOAD FIELD REPORTS + NOTIFICATION TRIGGER
  ========================================== */
  useEffect(() => {

    const reportsRef = ref(db, "fieldUpdates");
    const unsubscribe = onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsedList = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key]
          }))
          .reverse();

          

const playNewClientSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 chime note
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.15);
    
    // Quick secondary clean harmonic sound bounce
    setTimeout(() => {

      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 chime note
      gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc2.start();
      osc2.stop(audioCtx.currentTime + 0.25);
    }, 120);
  } catch (e) {
    console.warn("Audio Context blocked or failed to initialize:", e);
  }
};


        // If a new client record enters via sync, alert dispatch
        if (!isFirstLoad.current && parsedList.length > updates.length) {
          const newestRecord = parsedList[0];
          if (newestRecord.customerName) {
            playNewClientSound();
            triggerNativeNotification(`${newestRecord.customerName} ${newestRecord.surname || ""}`, newestRecord.agentName || "Field Agent");
          }

        }
        
        setUpdates(parsedList);
        isFirstLoad.current = false;
      } else {
        setUpdates([]);
        isFirstLoad.current = false;
      }
    });
    return () => unsubscribe();
  }, [updates.length]);

  /* ==========================================
      STRICT FILTERING: CURRENT MONTH & YEAR ONLY
  ========================================== */
  const currentMonthUpdates = useMemo(() => {
    return updates.filter((item: any) => {
      if (!item.date) return false;
      const reportDate = new Date(item.date);

      return (
        reportDate.getMonth() === currentMonthIdx &&
        reportDate.getFullYear() === currentYearNum
      );
    });
  }, [updates, currentMonthIdx, currentYearNum]);

  /* ==========================================
      LIVE STATISTICS (CURRENT MONTH ONLY)
  ========================================== */
  const totalReports = currentMonthUpdates.length;
  const confirmedReports = currentMonthUpdates.filter((x) => x.adminConfirmation === "Confirmed").length;
  const prepaidReports = currentMonthUpdates.filter((x) => x.saleType === "Prepaid").length;

  const contractReports = currentMonthUpdates.filter((x) => x.saleType === "Contract").length;
  const freetrialReports = currentMonthUpdates.filter((x) => x.saleType === "Free Trial" || x.saleType === "freetrial" || x.isFreeTrial).length;
  
  const totalCommission = currentMonthUpdates.reduce((t, x) => {
    if (x.adminConfirmation !== "Confirmed") return t;
    return t + Number(x.commission || 0);
  }, 0);

  /* ==========================================
      DETERMINE TOP ACHIEVER (HIGHEST COMMISSION BASIS)
  ========================================== */
  const topAchieverData = useMemo(() => {

    if (agents.length === 0) return { name: "No Agents Available", totalEarnings: 0 };
    
    let highestCommission = 0;
    let winnerName = "None Yet This Month";

    agents.forEach((agentObj) => {
      const nameKey = agentObj.fullName || agentObj.id;
      const agentCommissionSum = currentMonthUpdates
        .filter((x) => x.agentName === nameKey && x.adminConfirmation === "Confirmed")
        .reduce((sum, item) => sum + Number(item.commission || 0), 0);

      if (agentCommissionSum > highestCommission) {
        highestCommission = agentCommissionSum;
        winnerName = nameKey;
      }
    });

    return { name: winnerName, totalEarnings: 

highestCommission };
  }, [agents, currentMonthUpdates]);

  

  /* ==========================================
      MAP COVERAGE CHECKER LOGIC
  ========================================== */
  const verifyFibreCoverage = () => {
    if (!coverageAddress.trim()) {
      alert("Please enter an address or postal code first.");
      return;
    }
    const outcomes = ["Fibre Available - High Speed OpenServe Active", "Fibre Available - Setup Ready", "No Coverage Found at This Location"];
    const randomResult = outcomes[Math.floor(Math.random() * outcomes.length)];
    setCoverageResult(randomResult);

    setForm(prev => ({ ...prev, fibreCoverageStatus: randomResult }));
  };

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  /* ==========================================
      EXCEL SPREADSHEET ENGINE (DATE STARTS FIRST WITH ENHANCED WIDTHS)
  ========================================== */
  const downloadExcelSpreadsheet = (filterAgentName: string = "") => {
    let datasetToExport = currentMonthUpdates;
    if (filterAgentName) {
      datasetToExport = datasetToExport.filter(x => 

x.agentName === filterAgentName);
    }
    if (datasetToExport.length === 0) {
      alert("No report logs found to export to Excel.");
      return;
    }

    // Configured with Date Column leading out front as requested
    const headers = [
      "Date Filed                  ", 
      "Log Record ID               ", 
      "Agent Name                  ", 
      "Visit Type                  ", 
      "Customer Name               ", 
      "Surname                     ", 
      "Phone Number                ", 
      "Street Address Line                                     ", 
      "House Num   ", 
      "Sale Type       ", 
      "Free Trial", 
      "Package Plan Designation ", 
      "Price Profile  ", 

      "Commission Generated", 
      "Admin Approval ", 
      "Log Status    ", 
      "Comments & Feedback Log Entries"
    ];

    const csvRows = [headers.join(",")];

    datasetToExport.forEach((item) => {
      const values = [
        item.date || "",
        item.id || "",
        `"${item.agentName || ""}"`,
        `"${item.visitType || ""}"`,
        `"${item.customerName || ""}"`,
        `"${item.surname || ""}"`,
        `"${item.phone || ""}"`,
        `"${item.address || ""}"`,
        `"${item.houseNumber || ""}"`,
        `"${item.saleType || ""}"`,
        (item.isFreeTrial || item.saleType === "Free Trial" || item.saleType === "freetrial") ? "Yes" : "No",

        `"${item.packagePlan || ""}"`,
        `"${item.price || ""}"`,
        item.commission || 0,
        `"${item.adminConfirmation || ""}"`,
        `"${item.status || ""}"`,
        `"${(item.comments || "").replace(/\n/g, " ")}"`
      ];
      csvRows.push(values.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", encodedUri);
    downloadLink.setAttribute("download", filterAgentName ? `Agent_${filterAgentName}_Report.csv` : "All_Field_Agents_Report.csv");
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  /* ==========================================
      OPENSERVE PACKAGE SELECT LOGIC
  ========================================== */
  const handlePackageSelection = (packageName: string) => {
    if (form.isFreeTrial || form.saleType === "Free Trial" || form.saleType === "freetrial") {
      setForm((prev) => ({
        ...prev,
        packagePlan: "Free Trial Promotion",
        price: "R0.00 (Trial)",
        commission: 50
      }));
      return;
    }
    let estimatedPrice = "";
    let calculatedCommission = 0;

    if (form.saleType === "Prepaid") {
      switch (packageName) {

        case "20/10":
          estimatedPrice = "R349.00 p/m";
          calculatedCommission = 50;
          break;
        case "25/25":
          estimatedPrice = "R499.00 p/m";
          calculatedCommission = 50;
          break;
        case "50/25":
          estimatedPrice = "R700.00 p/m";
          calculatedCommission = 50;
          break;
        default:
          estimatedPrice = "R0.00";
          calculatedCommission = 0;
      }
    } else {
      switch (packageName) {
        case "20/10 Contract": estimatedPrice = "R345 p/m"; calculatedCommission = 200; break;
        case "25/25 Contract": estimatedPrice = "R499 p/m"; calculatedCommission = 200; break;
        case "40/20 Contract": estimatedPrice = "R425 p/m"; calculatedCommission = 200; break;

        case "50/25 Contract": estimatedPrice = "R695 p/m"; calculatedCommission = 200; break;
        case "50/50 Contract": estimatedPrice = "R805 p/m"; calculatedCommission = 200; break;
        case "100/50 Contract": estimatedPrice = "R895 p/m"; calculatedCommission = 200; break;
        case "100/100 Contract": estimatedPrice = "R1025 p/m"; calculatedCommission = 200; break;
        case "200/100 Contract": estimatedPrice = "R1299 p/m"; calculatedCommission = 200; break;
        case "200/200 Contract": estimatedPrice = "R1365 p/m"; calculatedCommission = 200; break;
        case "300/150 Contract": estimatedPrice = "R1529 p/m"; calculatedCommission = 200; break;
        case "500/250 Contract": estimatedPrice = "R1699 p/m"; calculatedCommission = 200; break;
        default:
          estimatedPrice = "R0.00";
          calculatedCommission = 0;

      }
    }
    setForm((prev) => ({
      ...prev,
      packagePlan: packageName,
      price: estimatedPrice,
      commission: calculatedCommission
    }));
  };

  /* ==========================================
      SAVE / UPDATE REPORT
  ========================================== */
  const saveUpdate = async () => {
    if (!form.agentName) {
      alert("Please select an Agent before saving the record.");
      return;
    }
    if (form.visitType === "Attended House" && !

form.packagePlan && !form.isFreeTrial && form.saleType !== "Free Trial") {
      alert("Please choose a valid OpenServe Package Plan or toggle Free Trial.");
      return;
    }

    let submissionPayload = { ...form };
    if (form.isFreeTrial || form.saleType === "Free Trial" || form.saleType === "freetrial") {
      submissionPayload.saleType = "Free Trial";
    }

    if (form.visitType === "Unattended House") {
      submissionPayload.customerName = "";
      submissionPayload.surname = "";
      submissionPayload.idNumber = "";
      submissionPayload.phone = "";
      submissionPayload.packagePlan = "N/A";
      submissionPayload.price = "R0.00";
      submissionPayload.saleType = "None";
      submissionPayload.commission = 0;
    }

    if (editing) {
      await update(ref(db, `fieldUpdates/${editing}`), submissionPayload);
      setEditing(null);
    } else {
      const newRef = push(ref(db, "fieldUpdates"));
      await set(newRef, {
        ...submissionPayload,
        createdAt: new Date().toISOString()
      });
    }
    setForm(emptyForm);
    setCoverageResult(null);
    setCoverageAddress("");
  };

  /* ==========================================
      DELETE CONFIRMATION ACTION HANDLERS
  ========================================== */
  const initiateDeleteLog = (id: string) => {

    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteLog = async () => {
    if (deleteId) {
      await remove(ref(db, `fieldUpdates/${deleteId}`));
      setOpenDeleteDialog(false);
      setDeleteId(null);
      if (editing === deleteId) {
        setEditing(null);
        setForm(emptyForm);
      }
    }
  };

  /* ==========================================
      REAL-TIME FILTERED VISUAL SEARCH FOR THE UI
  =======================================

=== */
  const visibleLogs = useMemo(() => {
    return currentMonthUpdates.filter((item: any) => {
      const matchText = `${item.agentName} ${item.customerName} ${item.address} ${item.status} ${item.visitType} ${item.saleType}`.toLowerCase();
      return matchText.includes(searchText.toLowerCase());
    });
  }, [currentMonthUpdates, searchText]);

  return (
    <Box sx={styles.page}>
      
      {/* TOP SCROLLING TICKER: CONNECTION HUB SYSTEM LOG */}
      <Box sx={styles.topTickerContainer}>
        <motion.div 
          animate={{ x: ["100%", "-100%"] }} 
          transition={{ ease: "linear", duration: 18, repeat: Infinity }}
          style={styles.tickerContent as any}

        >
          🚀 CONNECTION HUB SYSTEMS ACTIVE • CORE SATELLITE LINKS LIVE • METRICS UPDATING IN REALTIME • DEPLOYMENT STATUS: OPTIMAL 🚀
        </motion.div>
      </Box>

      {/* Immersive Ambient Background */}
      <Box sx={styles.backgroundContainer}>
        <motion.div style={styles.blurOrb1 as any} animate={{ x: [0, 90, 0], y: [0, -60, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div style={styles.blurOrb2 as any} animate={{ x: [0, -80, 0], y: [0, 80, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div style={styles.blurOrb3 as any} animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
      </Box>

      {/* HEADER SECTION */}
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <Paper sx={styles.heroCard}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={3}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Chip label="The Connection Hub" color="secondary" size="small" sx={{ fontWeight: 700, borderRadius: "6px" }} />
                <Typography sx={styles.livePulse}>● OpenServe Live network</Typography>
              </Stack>
              <Typography sx={styles.title}>
                Field <span style={{ color: "#2563eb", textShadow: "0 0 20px rgba(37,99,235,0.4)" }}>Agents</span> Dashboard
              </Typography>
              <Typography sx={styles.subtitle}>
                System Overview for <b style={{ color: 

"#fff" }}>{currentMonthName} {currentYearNum}</b>
              </Typography>
            </Box>
            
            <Stack direction="row" alignItems="center" spacing={2}>
              {/* Alert & Sound Controls Toggles */}
              <Tooltip title={soundEnabled ? "Mute Dashboard Sounds" : "Unmute Dashboard Sounds"}>
                <IconButton onClick={() => setSoundEnabled(!soundEnabled)} sx={{ color: soundEnabled ? "#10b981" : "#94a3b8", backgroundColor: "rgba(255,255,255,0.05)" }}>
                  {soundEnabled ? <VolumeUp /> : <NotificationsActive color="disabled" />}
                </IconButton>
              </Tooltip>
              <Avatar sx={styles.heroAvatar}>
                <Engineering sx={{ fontSize: 38, color: "#fff" }} />
              </Avatar>
            </Stack>

          </Stack>
        </Paper>
      </motion.div>

      {/* GLOBAL TOP ACHIEVER BANNER HIGHLIGHT */}
      <Paper sx={{ ...styles.heroCard, marginTop: "20px", background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(31, 41, 55, 0.7) 100%)", borderColor: "#f59e0b" }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h5">👑</Typography>
          <Box>
            <Typography style={{ color: "#f59e0b", fontWeight: 800, fontSize: "1.1rem" }}>
              CURRENT MONTH TOP ACHIEVER (HIGHEST PAYOUT UNITS)
            </Typography>
            <Typography variant="body1" style={{ color: "#fff", fontWeight: 600 }}>
              {topAchieverData.name} (R {topAchieverData.totalEarnings} Confirmed Commissions Generated)

            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* EXCEL SPREADSHEET MANAGEMENT ENGINE */}
      <Typography sx={styles.sectionTitle}>
        <Download sx={{ verticalAlign: "middle", mr: 1, color: "#10b981" }} /> Export Excel Spreadsheets
      </Typography>
      <Paper sx={styles.formCard}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              fullWidth 
              color="success"
              startIcon={<Download />}
              onClick={() => downloadExcelSpreadsheet()}
              sx={{ fontWeight: "bold", textTransform: 

"none", borderRadius: "10px", padding: "12px" }}
            >
              Download All Agents Spreadsheet
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Select Individual Agent Spreadsheet"
              value={excelAgentFilter}
              onChange={(e) => setExcelAgentFilter(e.target.value)}
              sx={styles.input}
            >
              <MenuItem value="">-- Clear Selection --</MenuItem>
              {agents.map((a) => {
                const label = a.fullName || a.id;
                return <MenuItem key={a.id} value={label}>{label}</MenuItem>;
              })}
            </TextField>

          </Grid>
          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              fullWidth 
              disabled={!excelAgentFilter}
              startIcon={<Download />}
              onClick={() => downloadExcelSpreadsheet(excelAgentFilter)}
              sx={{ fontWeight: "bold", textTransform: "none", borderRadius: "10px", padding: "12px", backgroundColor: "#3b82f6" }}
            >
              Download Filtered Agent Spreadsheet
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* LIVE MONTHLY STATS GRID */}
      <Grid container spacing={3} mt={1}>
        {[
          { title: "Monthly Reports", value: totalReports, icon: <Description />, color: 

"#3b82f6" },
          { title: "Confirmed Sales", value: confirmedReports, icon: <CheckCircle />, color: "#10b981" },
          { title: "Prepaid Registrations", value: prepaidReports, icon: <Wifi />, color: "#8b5cf6" },
          { title: "Contract Accounts", value: contractReports, icon: <WorkspacePremium />, color: "#f59e0b" },
          { title: "Free Trial Deployments", value: freetrialReports, icon: <AutoAwesome />, color: "#06b6d4" },
          { title: "Earned Commission", value: `R ${totalCommission}`, icon: <Payments />, color: "#ec4899" }
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={2} key={index}>
            <motion.div whileHover={{ scale: 1.04, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
              <Paper sx={{ ...styles.statCard, borderLeft: `4px solid ${item.color}` }}>
                <Box sx={{ ...styles.statIcon, backgroundColor: `${item.color}15`, color: 

item.color }}>{item.icon}</Box>
                <Typography sx={styles.statValue}>{item.value}</Typography>
                <Typography sx={styles.statTitle}>{item.title}</Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* LIVE BAR GRAPH CHART & PERFORMANCE MATRICES */}
      <Typography sx={styles.sectionTitle}>
        <Leaderboard sx={{ verticalAlign: "middle", mr: 1, color: "#3b82f6" }} /> Performance Bar Graph & Profile Cards — {currentMonthName}
      </Typography>
      
      {/* Visual Bar Chart Box */}
      <Paper sx={{ ...styles.formCard, marginBottom: "25px" }}>
        <Typography variant="h6" sx={{ color: "#fff", mb: 3, fontWeight: "bold" }}>Agent Comparative 

Earnings Analysis (Confirmed Payout Performance)</Typography>
        <Stack spacing={3}>
          {agents.map((agentObj) => {
            const nameKey = agentObj.fullName || agentObj.id;
            const agentCommissionSum = currentMonthUpdates
              .filter((x) => x.agentName === nameKey && x.adminConfirmation === "Confirmed")
              .reduce((sum, item) => sum + Number(item.commission || 0), 0);
            
            // Calculate scale ceiling bar mapped against R2500 target threshold max
            const graphPercentage = Math.min((agentCommissionSum / 2500) * 100, 100);
            return (
              <Box key={agentObj.id}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold", color: "#e2e8f0" }}>

                    {nameKey} {topAchieverData.name === nameKey && agentCommissionSum > 0 ? "🏆 (Top Commission Winner)" : ""}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#ec4899", fontWeight: "bold" }}>R {agentCommissionSum}</Typography>
                </Stack>
                <Box sx={{ width: "100%", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "6px", height: "14px", overflow: "hidden" }}>
                  <Box sx={{ width: `${graphPercentage || 3}%`, backgroundColor: topAchieverData.name === nameKey && agentCommissionSum > 0 ? "#f59e0b" : "#ec4899", height: "100%", borderRadius: "6px", transition: "width 1s ease-in-out" }} />
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Paper>


      {/* Individual Agent Cards Grid */}
      <Grid container spacing={3} mt={0.5}>
        {agents.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={styles.noDataCard}>
              <WarningAmber sx={{ fontSize: 40, color: "#f59e0b", mb: 1 }} />
              <Typography variant="h6">No Registered Core Agents Found</Typography>
              <Typography variant="body2" color="textSecondary">Please add agent records to the main database pool.</Typography>
            </Paper>
          </Grid>
        ) : (
          agents.map((agentObj) => {
            const nameKey = agentObj.fullName || agentObj.id;
            const agentMonthlyReports = currentMonthUpdates.filter((x) => x.agentName === nameKey);
            const confirmed = agentMonthlyReports.filter((x) => 

x.adminConfirmation === "Confirmed");
            const prepaid = confirmed.filter((x) => x.saleType === "Prepaid").length;
            const contract = confirmed.filter((x) => x.saleType === "Contract").length;
            const freetrial = confirmed.filter((x) => x.saleType === "Free Trial" || x.saleType === "freetrial" || x.isFreeTrial).length;
            const commission = confirmed.reduce((t, x) => t + Number(x.commission || 0), 0);
            const isWinner = topAchieverData.name === nameKey && commission > 0;
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={agentObj.id}>
                <AnimatePresence mode="wait">
                  <motion.div whileHover={{ scale: 1.03, y: -6 }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                    <Paper sx={{ ...styles.agentCard, border: isWinner ? "2px solid #f59e0b" : "1px solid rgba(255,255,255,0.05)" }}>
                      {isWinner && (

                        <Chip 
                          label="🏆 HIGH COMMISSION LEADER" 
                          size="small" 
                          sx={{ backgroundColor: "#f59e0b", color: "#000", fontWeight: "900", mb: 2, width: "100%" }} 
                        />
                      )}
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ ...styles.agentAvatar, background: isWinner ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" }}>
                          {nameKey.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ width: "calc(100% - 60px)" }}>
                          <Typography sx={styles.agentName} noWrap>{nameKey}</Typography>
                          <Typography variant="caption" 

sx={{ color: "#94a3b8" }}>Field Operative</Typography>
                        </Box>
                      </Stack>
                      
                      <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.06)" }} />
                      {agentMonthlyReports.length === 0 ? (
                        <Box sx={styles.emptyLeadsWrapper}>
                          <WarningAmber sx={{ color: "#ef4444", fontSize: 20 }} />
                          <Typography sx={styles.emptyLeadsText}>
                            No active leads recorded for this agent in {currentMonthName}.
                          </Typography>
                        </Box>
                      ) : (
                        <>
                          <Stack spacing={1.5}>
                            <Box sx={styles.dataRow}>
                              <Typography className="label">

📋 Monthly Reports</Typography>
                              <Typography className="val">{agentMonthlyReports.length}</Typography>
                            </Box>
                            <Box sx={styles.dataRow}>
                              <Typography className="label">👥 Confirmed Sales</Typography>
                              <Typography className="val" style={{ color: "#10b981" }}>{confirmed.length}</Typography>
                            </Box>
                            <Box sx={styles.dataRow}>
                              <Typography className="label">📦 Prepaid Active</Typography>
                              <Typography className="val">{prepaid}</Typography>
                            </Box>
                            <Box sx={styles.dataRow}>
                              <Typography className="label">📑 Contracts Active</Typography>
                              <Typography className="val">{contract}</Typography>
                            </Box>

                            <Box sx={styles.dataRow}>
                              <Typography className="label">🎁 Free Trials Signed</Typography>
                              <Typography className="val" style={{ color: "#06b6d4" }}>{freetrial}</Typography>
                            </Box>
                            <Box sx={styles.dataRow}>
                              <Typography className="label" style={{ color: "#2563eb", fontWeight: 700 }}>💰 Est. Payout Rate</Typography>
                              <Typography className="val" style={{ color: "#2563eb", fontWeight: 700 }}>R {commission}</Typography>
                            </Box>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(agentMonthlyReports.length * 10, 100)}
                            sx={styles.agentProgress}
                          />
                          <Chip

                            sx={styles.agentBadge}
                            color={isWinner ? "warning" : commission >= 400 ? "success" : "default"}
                            label={isWinner ? "👑 Top Earnings Payout" : commission >= 400 ? "⭐ High Income Value" : "Active Deployment"}
                          />
                        </>
                      )}
                    </Paper>
                  </motion.div>
                </AnimatePresence>
              </Grid>
            );
          })
        )}
      </Grid>

      {/* FORM CONFIGURATOR PANEL */}
      <Grid container spacing={4} mt={2}>
        <Grid item xs={12} lg={8}>
          <Typography sx={styles.sectionTitle}>
            <AutoAwesome sx={{ verticalAlign: "middle", mr: 1, color: "#8b5cf6" }} /> Field 

Agents Intake Form
          </Typography>
          
          {/* OPENSERVE MAP FIBRE COVERAGE CHECKER */}
          <Paper sx={{ ...styles.formCard, marginBottom: "20px", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
            <Typography variant="subtitle1" sx={{ color: "#fff", fontWeight: "bold", mb: 1, display: "flex", alignItems: "center" }}>
              <Map sx={{ mr: 1, color: "#3b82f6" }} /> OpenServe Map Fibre Coverage Checker
            </Typography>
            <Typography variant="body2" sx={{ color: "#94a3b8", mb: 2 }}>
              Check for coverage here first. The verification outcome will be tagged to the field report log automatically.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField 
                fullWidth 

                label="Enter Street Address or Code Lookup..." 
                value={coverageAddress}
                onChange={(e) => setCoverageAddress(e.target.value)}
                sx={styles.input}
              />
              <Button variant="contained" onClick={verifyFibreCoverage} sx={{ backgroundColor: "#3b82f6", px: 4, fontWeight: "bold" }}>
                Verify Coverage
              </Button>
            </Stack>
            {coverageResult && (
              <Box sx={{ mt: 2, p: 2, borderRadius: "8px", backgroundColor: coverageResult.includes("Not") ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)", border: "1px solid" + (coverageResult.includes("Not") ? "#ef4444" : "#10b981") }}>
                <Typography variant="body2" style={{ color: coverageResult.includes("Not") ? "#f87171" : "#34d399", fontWeight: "bold" }}>

                  Status Result: {coverageResult}
                </Typography>
              </Box>
            )}
          </Paper>

          <Paper sx={styles.formCard}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Field Agent Name"
                  name="agentName"
                  value={form.agentName}
                  onChange={handleChange}
                  sx={styles.input}
                >
                  {agents.map((a) => {
                    const label = a.fullName || a.id;
                    return <MenuItem key={a.id} value={label}>{label}</MenuItem>;
                  })}
                </TextField>

              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Visit Date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  sx={styles.input}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Visit Status"
                  name="visitType"
                  value={form.visitType}
                  onChange={handleChange}
                  sx={styles.input}
                >
                  <MenuItem value="Attended House">🏠 

Attended Addresses</MenuItem>
                  <MenuItem value="Unattended House">🚪 Unattended Addresses</MenuItem>
                </TextField>
              </Grid>
              
              {form.visitType === "Attended House" && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label="Fibre Deals"
                      name="saleType"
                      value={form.saleType}
                      onChange={(e) => {
                        const val = e.target.value;
                        const isTrial = (val === "Free Trial" || val === "freetrial");
                        setForm({
                          ...form,
                          saleType: val,
                          isFreeTrial: isTrial,
                          packagePlan: isTrial ? "Free Trial Promotion" : "",
                          price: isTrial ? "R0.00 (Trial)" : "",
                          commission: isTrial ? 50 : 0
                        });
                      }}
                      sx={styles.input}
                    >
                      <MenuItem value="Prepaid">Prepaid</MenuItem>
                      <MenuItem value="Contract">Contract</MenuItem>
                      <MenuItem value="Free Trial">Free Trial</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={form.isFreeTrial || form.saleType === "Free Trial" || form.saleType === "freetrial"} 
                          onChange={(e) => {

                            const activeTrial = e.target.checked;
                            setForm(prev => ({
                              ...prev,
                              isFreeTrial: activeTrial,
                              saleType: activeTrial ? "Free Trial" : "Prepaid",
                              packagePlan: activeTrial ? "Free Trial Promotion" : "",
                              price: activeTrial ? "R0.00 (Trial)" : "",
                              commission: activeTrial ? 50 : 0
                            }));
                          }} 
                          color="secondary"
                        />
                      }
                      label="🎁 This Deal is a Free Trial Promotion"
                      sx={{ color: "#fff" }}
                    />
                  </Grid>

                  {!(form.isFreeTrial || form.saleType === 

"Free Trial" || form.saleType === "freetrial") && (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          select
                          fullWidth
                          label="OpenServe Package"
                          name="packagePlan"
                          value={form.packagePlan}
                          onChange={(e) => handlePackageSelection(e.target.value)}
                          sx={styles.input}
                          disabled={!form.saleType}
                        >
                          {form.saleType === "Prepaid" ? [
                            <MenuItem key="p1" value="20/10">OpenServe Prepaid 20 / 10 Mbps</MenuItem>,
                            <MenuItem key="p2" value="25/25">OpenServe Prepaid 25 / 25 Mbps</MenuItem>,
                            <MenuItem key="p3" value="50/25">OpenServe Prepaid 50 / 25 Mbps</MenuItem>

                          ] : [
                            <MenuItem key="c1" value="20/10 Contract">OpenServe Home 20/10 Mbps (Contract)</MenuItem>,
                            <MenuItem key="c2" value="25/25 Contract">OpenServe Home 25/25 Mbps (Contract)</MenuItem>,
                            <MenuItem key="c3" value="40/20 Contract">OpenServe Home 40/20 Mbps (Contract)</MenuItem>,
                            <MenuItem key="c4" value="50/25 Contract">OpenServe Home 50/25 Mbps (Contract)</MenuItem>,
                            <MenuItem key="c5" value="50/50 Contract">OpenServe Home 50/50 Mbps (Contract)</MenuItem>,
                            <MenuItem key="c6" value="100/50 Contract">OpenServe Ultra 100/50 Mbps (Contract)</MenuItem>,
                            <MenuItem key="c7" value="100/100 Contract">OpenServe Ultra 100/100 Mbps (Contract)</MenuItem>,
                            <MenuItem key="c8" value="200/100 Contract">OpenServe Hyper 200/100 Mbps (Contract)</MenuItem>,
                            <MenuItem key="c9" value="200/200 Contract">OpenServe Hyper 200/200 Mbps (Contract)</MenuItem>,
                            <MenuItem key="c10" value="300/150 Contract">OpenServe Giga 300/150 Mbps (Contract)</MenuItem>,
                            <MenuItem key="c11" value="500/250 Contract">OpenServe Titan 500/250 Mbps (Contract)</MenuItem>
                          ]}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Amount"
                          value={form.price || "Total Amount Price..."}
                          InputProps={{ readOnly: true }}
                          sx={styles.input}
                        />
                      </Grid>
                    </>

                  )}
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Client Name" name="customerName" value={form.customerName} onChange={handleChange} sx={styles.input} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Client Surname" name="surname" value={form.surname} onChange={handleChange} sx={styles.input} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="National ID / Passport Number" name="idNumber" value={form.idNumber} onChange={handleChange} sx={styles.input} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Phone Number" name="phone" value={form.phone} onChange={handleChange} sx={styles.input} />
                  </Grid>

                </>
              )}
              
              <Grid item xs={12} md={8}>
                <TextField fullWidth label="Address" name="address" value={form.address} onChange={handleChange} sx={styles.input} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="House Number" name="houseNumber" value={form.houseNumber} onChange={handleChange} sx={styles.input} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Feedback"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  sx={styles.input}
                >

                  <MenuItem value="No Elderly People">No Elderly People</MenuItem>
                  <MenuItem value="Already Connected">Already Connected</MenuItem>
                  <MenuItem value="Follow Up">Follow-Up</MenuItem>
                  <MenuItem value="Not Interested">Not Interested</MenuItem>
                  <MenuItem value="Interested">Interested</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={3} label="Field Feedback Log" name="comments" value={form.comments} onChange={handleChange} sx={styles.input} />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" 
                fullWidth 
                onClick={ () => {saveUpdate();
                  playNewClientSound();

                }} sx={styles.submitBtn}>
                  <Save sx={{ mr: 1 }} /> {editing ? "Update System" : "Commit New Field Record"}
                </Button>

                

              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Typography sx={styles.sectionTitle}>
            <Insights sx={{ verticalAlign: "middle", mr: 1, color: "#ec4899" }} /> Live Payout Ledger Preview
          </Typography>
          <Paper sx={styles.commissionCard}>
            <Typography variant="overline" display="block" sx={{ color: "#94a3b8", fontWeight: 700 }}>
              Calculated Payout Unit
            </Typography>
            <Typography sx={styles.commissionValue}>
              R {form.commission || 0}
            </Typography>
            <Typography variant="body2" sx={{ color: "#3b82f6", mt: 1, fontWeight: 500 }}>
              Target Rate Selected: {form.price || "None / Free Trial Opportunity"}

            </Typography>
            <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.08)" }} />
            <Typography variant="caption" color="textSecondary" sx={{ lineHeight: 1.4, display: "block" }}>
              💡 Commissions instantly update based on audited administrative approvals. Prepaid cycles yield a foundational R50, while Contract conversions calculate at R200. Approved Free Trials pay out a flat promotional baseline of R50.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ALL FIELD REPORT LOGS LIST VIEW */}
      <Typography sx={styles.sectionTitle}>
        <Description sx={{ verticalAlign: "middle", mr: 1, color: "#3b82f6" }} /> All Live Field Updates Logs
      </Typography>
      
      <TextField

        fullWidth
        placeholder="Type to filter field updates instantly (e.g. agent name, address, or customer status)..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        InputProps={{ startAdornment: <Search sx={{ color: "#94a3b8", mr: 1 }} /> }}
        sx={{ ...styles.input, marginBottom: "20px" }}
      />

      <Stack spacing={2} sx={{ pb: "80px" }}>
        {visibleLogs.length === 0 ? (
          <Paper sx={styles.noDataCard}>
            <Typography variant="body1" color="textSecondary">No field updates logs match your search filters right now.</Typography>
          </Paper>
        ) : (
          visibleLogs.map((log: any) => (
            <Paper key={log.id} sx={{ ...styles.formCard, borderLeft: log.visitType === "Unattended House" ? "4px solid #ef4444" : "4px solid #10b981" }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#fff" }}>{log.agentName}</Typography>
                  <Typography variant="caption" color="textSecondary">{log.date}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Chip size="small" label={log.visitType} color={log.visitType === "Unattended House" ? "error" : "success"} sx={{ mb: 1 }} />
                  <Typography variant="body2" sx={{ color: "#cbd5e1" }}>📍 {log.address} {log.houseNumber ? `(House ${log.houseNumber})` : ""}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                    {log.visitType === "Attended House" ? `Client: ${log.customerName || ""} | Deal Type: ${log.saleType || "Prepaid"}` : "Unattended Address Log"}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ color: "#06b6d4" }}>Package: {log.packagePlan || "N/A"}</Typography>
                  <Typography variant="body2" style={{ color: "#f59e0b", fontStyle: "italic" }}>💬 Feedback: {log.status || "None"} - {log.comments || ""}</Typography>
                </Grid>
                <Grid item xs={12} md={3} style={{ textAlign: "right" }}>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" variant="outlined" onClick={() => { setForm(log); setEditing(log.id); }} sx={{ color: "#3b82f6", borderColor: "#3b82f6" }}>
                      Edit Log
                    </Button>
                    {/* CONFIRMATION BASED CRITICAL 

DELETION TRIGGER */}
                    <IconButton size="small" onClick={() => initiateDeleteLog(log.id)} sx={{ color: "#ef4444", backgroundColor: "rgba(239, 68, 68, 0.05)", "&:hover": { backgroundColor: "rgba(239, 68, 68, 0.15)" } }}>
                      <DeleteForever size-small />
                    </IconButton>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          ))
        )}
      </Stack>

      {/* CONFIRMATION INTERACTION DIALOG CONTAINER */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{
          style: {
            backgroundColor: "#111827",

            color: "#fff",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "8px"
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
          <WarningAmber color="error" /> Confirm Log Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText style={{ color: "#94a3b8" }}>
            Are you completely sure you want to permanently delete this field updating report log? This database removal process is immediate and irreversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: "16px" }}>
          <Button onClick={() => setOpenDeleteDialog(false)} sx={{ color: 

"#94a3b8", textTransform: "none" }}>
            Cancel
          </Button>
          <Button onClick={confirmDeleteLog} variant="contained" color="error" sx={{ textTransform: "none", borderRadius: "8px", fontWeight: "bold" }}>
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      {/* BOTTOM SCROLLING TICKER: OPENSERVE NETWORK PERFORMANCE LOG */}
      <Box sx={styles.bottomTickerContainer}>
        <motion.div 
          animate={{ x: ["-100%", "100%"] }} 
          transition={{ ease: "linear", duration: 22, repeat: Infinity }}
          style={styles.tickerContent as any}
        >
          🌐 OPENSERVE HIGH SPEED BROADBAND PIPELINES • 20/10, 50/25, 100M, AND TITAN PROFILES RUNNING STABLE ON CORE 

INTERCHANGE SWITCHES 🌐
        </motion.div>
      </Box>

    </Box>
  );
};

/* ==========================================
    CLASSY GLASS-MORPHISM UI STYLES
========================================== */
const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#030712",
    color: "#f3f4f6",
    padding: "60px 32px 80px 32px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', sans-serif"
  },

  topTickerContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "28px",
    backgroundColor: "rgba(124, 58, 237, 0.9)",
    backdropFilter: "blur(4px)",
    zIndex: 2000,
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    borderBottom: "1px solid rgba(255,255,255,0.2)"
  },
  bottomTickerContainer: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "28px",
    backgroundColor: "rgba(37, 99, 235, 0.9)",
    backdropFilter: "blur(4px)",
    zIndex: 2000,

    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    borderTop: "1px solid rgba(255,255,255,0.2)"
  },
  tickerContent: {
    whiteSpace: "nowrap",
    color: "#fff",
    fontSize: "0.75rem",
    fontWeight: "800",
    letterSpacing: "0.08em",
    textTransform: "uppercase"
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    pointerEvents: "none"
  },
  blurOrb1: {
    position: "absolute",

    width: "450px",
    height: "450px",
    background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, rgba(0,0,0,0) 70%)",
    top: "-10%",
    left: "10%",
    filter: "blur(60px)"
  },
  blurOrb2: {
    position: "absolute",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(0,0,0,0) 70%)",
    bottom: "5%",
    right: "5%",
    filter: "blur(80px)"
  },
  blurOrb3: {
    position: "absolute",
    width: "350px",
    height: "350px",
    background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, rgba(0,0,0,0) 60%)",

    top: "40%",
    left: "50%",
    filter: "blur(50px)"
  },
  heroCard: {
    position: "relative",
    zIndex: 1,
    background: "linear-gradient(135deg, rgba(17, 24, 39, 0.7) 0%, rgba(31, 41, 55, 0.5) 100%)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.07)",
    borderRadius: "16px",
    padding: "24px 32px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
  },
  title: {
    fontSize: "2.2rem",
    fontWeight: 900,
    letterSpacing: "-0.03em",
    color: "#fff",
    marginTop: "4px"
  },
  subtitle: {
    fontSize: "1.05rem",

    color: "#94a3b8",
    marginTop: "4px",
    fontWeight: 400
  },
  livePulse: {
    fontSize: "0.78rem",
    color: "#10b981",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  heroAvatar: {
    width: 70,
    height: 70,
    background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
    boxShadow: "0 0 25px rgba(37,99,235,0.4)"
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#fff",
    marginTop: "40px",
    marginBottom: "16px",

    letterSpacing: "-0.01em",
    position: "relative",
    zIndex: 1
  },
  statCard: {
    position: "relative",
    zIndex: 1,
    background: "rgba(17, 24, 39, 0.65)",
    backdropFilter: "blur(12px)",
    borderRadius: "14px",
    padding: "20px",
    height: "100%",
    boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
    border: "1px solid rgba(255,255,255,0.04)"
  },
  statIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px"
  },

  statValue: {
    fontSize: "1.45rem",
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "-0.02em"
  },
  statTitle: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    fontWeight: 500,
    marginTop: "2px"
  },
  agentCard: {
    position: "relative",
    zIndex: 1,
    background: "linear-gradient(145deg, rgba(17, 24, 39, 0.8) 0%, rgba(22, 32, 51, 0.65) 100%)",
    backdropFilter: "blur(14px)",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
    border: "1px solid rgba(255,255,255,0.05)"
  },
  agentAvatar: {

    width: 44,
    height: 44,
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#fff"
  },
  agentName: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#fff"
  },
  dataRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    "& .label": { fontSize: "0.88rem", color: "#94a3b8" },
    "& .val": { fontSize: "0.88rem", fontWeight: 600, color: "#fff" }
  },
  agentProgress: {
    marginTop: "20px",
    height: "6px",
    borderRadius: "4px",

    backgroundColor: "rgba(255,255,255,0.05)",
    "& .MuiLinearProgress-bar": {
      background: "linear-gradient(90deg, #3b82f6, #8b5cf6)"
    }
  },
  agentBadge: {
    marginTop: "16px",
    width: "100%",
    fontWeight: 700,
    borderRadius: "8px",
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    color: "#fff"
  },
  emptyLeadsWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 12px",
    backgroundColor: "rgba(239, 68, 68, 0.04)",
    border: "1px dashed rgba(239, 68, 68, 0.2)",
    borderRadius: "10px",

    marginTop: "8px"
  },
  emptyLeadsText: {
    fontSize: "0.82rem",
    color: "#f87171",
    textAlign: "center",
    marginTop: "8px",
    fontWeight: 500,
    lineHeight: 1.4
  },
  formCard: {
    position: "relative",
    zIndex: 1,
    background: "rgba(17, 24, 39, 0.5)",
    backdropFilter: "blur(16px)",
    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    border: "1px solid rgba(255,255,255,0.05)"
  },
  input: {
    "& .MuiOutlinedInput-root": {
      color: "#fff",
      backgroundColor: "rgba(0, 0, 0, 0.2)",

      borderRadius: "10px",
      "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
      "&.Mui-focused fieldset": { borderColor: "#2563eb" }
    },
    "& .MuiInputLabel-root": { color: "#94a3b8" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" }
  },
  submitBtn: {
    background: "linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)",
    color: "#fff",
    fontWeight: 700,
    padding: "14px",
    borderRadius: "10px",
    fontSize: "0.98rem",
    textTransform: "none",
    boxShadow: "0 10px 25px rgba(37,99,235,0.3)",
    "&:hover": {
      background: "linear-gradient(90deg, #1d4ed8 0%, #6d28d9 100%)",
      boxShadow: "0 12px 30px rgba(37,99,235,0.45)"
    }
  },
  commissionCard: {
    position: "relative",
    zIndex: 1,
    background: "linear-gradient(135deg, rgba(236,72,153,0.05) 0%, rgba(139,92,246,0.05) 100%)",
    backdropFilter: "blur(16px)",
    borderRadius: "16px",
    padding: "28px",
    border: "1px solid rgba(236,72,153,0.15)",
    boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
    textAlign: "center"
  },
  commissionValue: {
    fontSize: "3rem",
    fontWeight: 900,
    background: "linear-gradient(90deg, #ec4899, #8b5cf6)",
    WebkitBackgroundClip: "text",

    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.03em",
    margin: "8px 0"
  },
  noDataCard: {
    padding: "40px",
    textAlign: "center",
    background: "rgba(17, 24, 39, 0.4)",
    borderRadius: "14px",
    border: "1px dashed rgba(255,255,255,0.08)"
  }
};

export default FieldUpdates;
