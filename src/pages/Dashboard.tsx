import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Paper,
  Chip,
  Avatar,
  Divider,
  Button,
  TextField,
  MenuItem,
  LinearProgress,
  Tooltip,
  Snackbar,
  Alert,
  IconButton,
  Slider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon

} from "@mui/material";

import {
  TrendingUp,
  Wifi,
  Business,
  SupportAgent,
  HourglassEmpty,
  SimCard,
  Download,
  Search,
  VolumeUp,
  VolumeOff,
  NotificationsActive,
  Close,
  Speed
  
} from "@mui/icons-material";

import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

import Sidebar from "../components/Sidebar";
import TopBar from "../components/Topbar";


import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Interface for real-time dashboard notifications
interface LiveNotification {
  id: string;
  message: string;
  category: "Prepaid" | "Contract" | "Free Trial" | "Agent Update";
  timestamp: Date;
}

const Dashboard = () => {
  // Database States
  const [prepaidLeads, setPrepaidLeads] = useState<any[]>([]);
  const [contractLeads, setContractLeads] = useState<any[]>([]);
  const [fieldAgents, setFieldAgents] = useState<any[]>([]);
  const [freeTrials, setFreeTrials] = useState<any[]>([]);
  

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");

  // Premium Notification States
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5); // Default 50% volume
  const [toasts, setToasts] = useState<LiveNotification[]>([]);
  const [notificationLog, setNotificationLog] = useState<LiveNotification[]>([]);

  // Refs to prevent playing sound for historical database items on initial render
  const isPrepaidInitialized = useRef(false);
  const isContractInitialized = useRef(false);
  const isAgentsInitialized = useRef(false);
  const isTrialsInitialized = useRef(false);

  const prepaidKeysRef = useRef<Set<string>>(new Set());
  const contractKeysRef = useRef<Set<string>>(new Set());
  const agentKeysRef = useRef<Set<string>>(new Set());
  const trialKeysRef = useRef<Set<string>>(new Set());

  // Web Audio Synthesizer Engine (Generates a clean, pleasant UI alert chime natively)
  const triggerAudioChime = useCallback ((customVolume?: number) => {
    if (isMuted) return;
    try {
      const activeVolume = customVolume !== undefined ? customVolume : volume;
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Node initialization
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      

      // Melodic synth double-tap sound (C5 then G5 chime effect)
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.12); // G5
      
      gainNode.gain.setValueAtTime(activeVolume, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.35);
    } catch (error) {
      console.warn("Audio Context blocked or unsupported in current browser state:", error);
    }
  }, [isMuted, volume]);

  // Push new alerts to real-time Toast and logging history

  const pushNotification = useCallback (
    (message: string, category: "Prepaid" | "Contract" | "Free Trial" | "Agent Update") => {
    const newAlert: LiveNotification = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      category,
      timestamp: new Date(),
    };
    setToasts((prev) => [newAlert, ...prev].slice(0, 3)); // Keep only 3 dynamic active toasts on screen
    setNotificationLog((prev) => [newAlert, ...prev].slice(0, 50)); // Hold 50 historical events
    triggerAudioChime();
  },
  [triggerAudioChime]
);

  useEffect(() => {
    // Database Reference Points
    const prepaidRef = ref(db, "prepaidFibreLeads");
    const contractRef = ref(db, "contractFibreLeads");
    const agentsRef = ref(db, "fieldUpdates");

    const trialRef = ref(db, "freeTrialApplications");

    let loadedCount = 0;
    const checkLoading = () => {
      loadedCount++;
      if (loadedCount >= 4) {
        setLoading(false);
      }
    };

    // 1. Listen for Prepaid Fibre Leads
    const unsubPrepaid = onValue(prepaidRef, (snap) => {
      const data = snap.val() || {};
      const currentKeys = Object.keys(data);
      const list = currentKeys.map(k => ({ id: k, type: "Prepaid", ...data[k] }));

      if (isPrepaidInitialized.current) {
        // Detect additions
        currentKeys.forEach((key) => {
          if (!prepaidKeysRef.current.has(key)) {
            const clientName = data[key]?.firstNamesOrContactName || data[key]?.name || "Fibre Client";
            pushNotification(`New Prepaid Fibre Lead submitted: ${clientName}`, "Prepaid");
          }
        });
      } else {
        isPrepaidInitialized.current = true;
      }

      prepaidKeysRef.current = new Set(currentKeys);
      setPrepaidLeads(list);
      checkLoading();
    });

    // 2. Listen for Contract Fibre Leads
    const unsubContract = onValue(contractRef, (snap) => {
      const data = snap.val() || {};
      const currentKeys = Object.keys(data);
      const list = currentKeys.map(k => ({ id: k, type: "Contract", ...data[k] }));

      if (isContractInitialized.current) {

        currentKeys.forEach((key) => {
          if (!contractKeysRef.current.has(key)) {
            const clientName = data[key]?.firstNamesOrContactName || data[key]?.name || "Fibre Client";
            pushNotification(`New Contract Fibre Application: ${clientName}`, "Contract");
          }
        });
      } else {
        isContractInitialized.current = true;
      }

      contractKeysRef.current = new Set(currentKeys);
      setContractLeads(list);
      checkLoading();
    });

    // 3. Listen for Field Agent updates
    const unsubAgents = onValue(agentsRef, (snap) => {
      const data = snap.val() || {};
      const currentKeys = Object.keys(data);

      const list = currentKeys.map(k => ({ id: k, ...data[k] }));

      if (isAgentsInitialized.current) {
        currentKeys.forEach((key) => {
          if (!agentKeysRef.current.has(key)) {
            const agentName = data[key]?.name || "Field Agent";
            pushNotification(`New Agent registered: ${agentName}`, "Agent Update");
          }
        });
      } else {
        isAgentsInitialized.current = true;
      }

      agentKeysRef.current = new Set(currentKeys);
      setFieldAgents(list);
      checkLoading();
    });

    // 4. Listen for 14 Days Free Trial submissions
    const unsubTrial = onValue(trialRef, (snap) => {
      const data = snap.val() || {};

      const currentKeys = Object.keys(data);
      const list = currentKeys.map(k => ({ id: k, type: "Free Trial", ...data[k] }));

      if (isTrialsInitialized.current) {
        currentKeys.forEach((key) => {
          if (!trialKeysRef.current.has(key)) {
            const clientName = data[key]?.firstNamesOrContactName || data[key]?.name || "Trial Applicant";
            pushNotification(`New 14-Days Free Trial Signup: ${clientName}`, "Free Trial");
          }
        });
      } else {
        isTrialsInitialized.current = true;
      }

      trialKeysRef.current = new Set(currentKeys);
      setFreeTrials(list);
      checkLoading();
    });

    return () => {

      unsubPrepaid();
      unsubContract();
      unsubAgents();
      unsubTrial();
      
    }; 
  }, [pushNotification]);

  // Calculate Aggregations
  const totalSubmissions = prepaidLeads.length + contractLeads.length + freeTrials.length;
  const activeAgentsCount = fieldAgents.length;

  // Compile unified main dynamic activity list
  const unifiedActivity = [
    ...prepaidLeads.map(l => ({
      id: l.id,
      name: `${l.firstNamesOrContactName || l.name || "Client"} ${l.surnameOrBusinessName || l.surname || ""}`,
      details: `${l.packageName || "Prepaid Package"} Application`,
      createdAt: l.createdAt || Date.now(),
      category: "Prepaid",
      status: l.status || "Pending",

    })),
    ...contractLeads.map(l => ({
      id: l.id,
      name: `${l.firstNamesOrContactName || l.name || "Client"} ${l.surnameOrBusinessName || l.surname || ""}`,
      details: `${l.packageName || "Contract Package"} Application`,
      createdAt: l.createdAt || Date.now(),
      category: "Contract",
      status: l.status || "Pending",
    })),
    ...freeTrials.map(l => ({
      id: l.id,
      name: `${l.firstNamesOrContactName || l.name || "Client"} ${l.surnameOrBusinessName || l.surname || ""}`,
      details: "14 Days Free Trial Signup",
      createdAt: l.createdAt || Date.now(),
      category: "Free Trial",
      status: l.status || "Pending",
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


  // Search & Filter Action Controller
  const filteredActivity = unifiedActivity.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          activity.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "All" || activity.category === filterType;
    return matchesSearch && matchesFilter;
  });

  // Export dynamically configured workbook
  const handleExportAll = () => {
    const workbook = XLSX.utils.book_new();

    const formatLeads = (list: any[]) => list.map(l => ({
      "ID": l.id,
      "Client Name": `${l.firstNamesOrContactName || l.name || ""} ${l.surnameOrBusinessName || l.surname || ""}`,
      "Contact": l.phone || l.cellphone || "",
      "Email": l.email || "",
      "Package": l.packageName || "Fibre Bundle",
      "Status": l.status || "Pending",
      "Created Date": l.createdAt ? new Date(l.createdAt).toLocaleString() : "Recent",
    }));

    if (prepaidLeads.length > 0) {
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formatLeads(prepaidLeads)), "Prepaid Fibre Leads");
    }
    if (contractLeads.length > 0) {
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formatLeads(contractLeads)), "Contract Fibre Leads");
    }
    if (freeTrials.length > 0) {
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formatLeads(freeTrials)), "14 Days Free Trial");
    }

    if (fieldAgents.length > 0) {
      const formattedAgents = fieldAgents.map(a => ({ "Agent ID": a.id, "Agent Name": a.name || "Unknown Agent", "Status": a.status || "Active" }));
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formattedAgents), "Field Agents");
    }

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(fileBlob, "Fibre_Business_Master_Report_2026.xlsx");
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter(t => t.id !== id));
  };

  const styles = {
    mainWrapper: {
      ml: "280px",

      width: "calc(100% - 280px)",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 50%, #ffffff 100%)",
      py: 4,
      px: 4,
      boxSizing: "border-box" as const
    },
    metricCard: {
      p: 3,
      borderRadius: "20px",
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      transition: "transform 0.2s",
      "&:hover": { transform: "translateY(-3px)", borderColor: "#38bdf8" }
    },
    contentPaper: {
      p: 3,
      borderRadius: "24px",

      background: "#ffffff",
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 30px rgba(0,0,0,0.04)"
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Sidebar />

      <Box sx={styles.mainWrapper}>
        <TopBar />

        <Box sx={{ mt: 8 }}>
          
          {/* HEADER SECTION */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: "-1px", color: "#0369a1" }}>

                Admin Management System
              </Typography>
              <Typography variant="body1" sx={{ color: "#475569" }}>
                Consolidated operations tracking for contract provisionals, trials, and agent tracking.
              </Typography>
            </Box>

            <Box display="flex" gap={2} alignItems="center">
              <Button
                variant="contained"
                onClick={handleExportAll}
                startIcon={<Download />}
                sx={{
                  bgcolor: "#0284c7",
                  color: "#ffffff",
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: "bold",
                  px: 3,
                  py: 1.2,
                  "&:hover": { bgcolor: "#0369a1" }

                }}
              >
                Export Master Excel Report
              </Button>
              <Chip icon={<Wifi />} label="System Live" color="success" sx={{ fontWeight: "bold" }} />
            </Box>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" mt={12}>
              <CircularProgress size={50} sx={{ color: "#0284c7" }} />
            </Box>
          ) : (
            <>
              {/* 📊 CONSOLIDATED KPI METRICS */}
              <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={styles.metricCard}>
                    <Box>
                      <Typography variant="body2" color="#64748b" fontWeight="bold">Prepaid Fibre Leads</Typography>
                      <Typography variant="h4" fontWeight={900} mt={0.5} color="#0f172a">{prepaidLeads.length}</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: "#e0f2fe", color: "#0284c7", width: 56, height: 56 }}>
                      <SimCard />
                    </Avatar>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={styles.metricCard}>
                    <Box>
                      <Typography variant="body2" color="#64748b" fontWeight="bold">Contract Fibre Leads</Typography>
                      <Typography variant="h4" fontWeight={900} mt={0.5} color="#0f172a">{contractLeads.length}</Typography>
                    </Box>

                    <Avatar sx={{ bgcolor: "#ecfdf5", color: "#10b981", width: 56, height: 56 }}>
                      <Business />
                    </Avatar>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={styles.metricCard}>
                    <Box>
                      <Typography variant="body2" color="#64748b" fontWeight="bold">14-Days Free Trial</Typography>
                      <Typography variant="h4" fontWeight={900} mt={0.5} color="#0f172a">{freeTrials.length}</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: "#fff7ed", color: "#f59e0b", width: 56, height: 56 }}>
                      <HourglassEmpty />
                    </Avatar>
                  </Box>
                </Grid>


                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={styles.metricCard}>
                    <Box>
                      <Typography variant="body2" color="#64748b" fontWeight="bold">Field Agents Active</Typography>
                      <Typography variant="h4" fontWeight={900} mt={0.5} color="#0f172a">{activeAgentsCount}</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: "#f3e8ff", color: "#a855f7", width: 56, height: 56 }}>
                      <SupportAgent />
                    </Avatar>
                  </Box>
                </Grid>
              </Grid>

              {/* ADMINISTRATIVE EXTRA FEATURES PANEL */}
              <Grid container spacing={4} mb={4}>
                {/* 🎧 REAL-TIME CHIME ENGINE CONTROLLER */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ ...styles.contentPaper, borderLeft: "6px solid #0284c7" }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                      <NotificationsActive sx={{ color: "#0284c7" }} />
                      <Typography variant="h6" fontWeight={800} color="#0f172a">
                        Live Chime Engine & Control Deck
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="#475569" mb={3}>
                      Adjust the volume or mute notification sounds completely. Trigger a test tone using the speaker check tool to calibrate audio.
                    </Typography>

                    <Grid container spacing={2} alignItems="center">
                      <Grid item>

                        <IconButton 
                          onClick={() => setIsMuted(!isMuted)} 
                          color={isMuted ? "error" : "primary"}
                          sx={{ border: "1px solid", borderColor: isMuted ? "error.light" : "primary.light" }}
                        >
                          {isMuted ? <VolumeOff /> : <VolumeUp />}
                        </IconButton>
                      </Grid>
                      <Grid item xs>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Typography variant="caption" color="text.secondary">0%</Typography>
                          <Slider
                            value={isMuted ? 0 : volume * 100}
                            onChange={(_, value) => {
                              setIsMuted(false);
                              setVolume((value as number) / 100);
                            }}

                            valueLabelDisplay="auto"
                            sx={{ color: "#0284c7" }}
                          />
                          <Typography variant="caption" color="text.secondary">100%</Typography>
                        </Box>
                      </Grid>
                      <Grid item>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => triggerAudioChime()}
                          sx={{ textTransform: "none", fontWeight: "bold" }}
                        >
                          Test Sound Check
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* 📊 LIVE SIGNAL MONITOR & PIPELINE STABILITY */}

                <Grid item xs={12} md={6}>
                  <Paper sx={{ ...styles.contentPaper, borderLeft: "6px solid #10b981" }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                      <Speed sx={{ color: "#10b981" }} />
                      <Typography variant="h6" fontWeight={800} color="#0f172a">
                        System Sync Monitor
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="#475569" mb={2}>
                      Real-time visual reporting parameters verifying incoming stream telemetry of database pipelines.
                    </Typography>

                    <Box display="flex" gap={2} mt={1}>
                      <Chip label="Realtime Latency: < 120ms" size="small" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: "bold" }} />
                      <Chip label="SSL Secure Endpoint" size="small" sx={{ bgcolor: "#e3f2fd", color: "#1565c0", fontWeight: "bold" }} />
                      <Chip label="DB Version 4.1" size="small" sx={{ variant: "outlined" }} />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* UNIFIED FEED AND SYSTEM LOGS */}
              <Grid container spacing={4} mb={4}>
                {/* DYNAMIC PIPELINE FEED AND SEARCH CONTROLS */}
                <Grid item xs={12} md={8}>
                  <Paper sx={styles.contentPaper}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                      <Typography variant="h6" fontWeight={800} color="#0f172a">
                        Recent Activity
                      </Typography>
                      <Box display="flex" gap={2}>
                        <TextField

                          select
                          size="small"
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          sx={{
                            minWidth: 140,
                            bgcolor: "#f8fafc",
                            "& .MuiOutlinedInput-root fieldset": { borderColor: "#e2e8f0" }
                          }}
                        >
                          <MenuItem value="All">All Pipelines</MenuItem>
                          <MenuItem value="Prepaid">Prepaid Leads</MenuItem>
                          <MenuItem value="Contract">Contract Leads</MenuItem>
                          <MenuItem value="Free Trial">Free Trials</MenuItem>
                        </TextField>

                        <TextField
                          placeholder="Search feed..."

                          size="small"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          InputProps={{ startAdornment: <Search style={{ color: "#94a3b8", marginRight: 6, fontSize: 18 }} /> }}
                          sx={{
                            bgcolor: "#f8fafc",
                            "& .MuiOutlinedInput-root fieldset": { borderColor: "#e2e8f0" }
                          }}
                        />
                      </Box>
                    </Box>

                    {filteredActivity.length === 0 ? (
                      <Box textAlign="center" py={6}>
                        <Typography color="text.secondary">No records found matching search or filter criteria.</Typography>
                      </Box>
                    ) : (
                      filteredActivity.slice(0, 7).map((activity) => (
                        <Box
                          key={activity.id}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            py: 2,
                            borderBottom: "1px solid #f1f5f9",
                            "&:last-child": { borderBottom: "none" }
                          }}
                        >
                          <Box display="flex" gap={2} alignItems="center">
                            <Avatar sx={{ bgcolor: "#e0f2fe", color: "#0284c7" }}>
                              {activity.name?.charAt(0) || "U"}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={700} color="#0f172a">{activity.name}</Typography>
                              <Typography variant="body2" color="#64748b">{activity.details}</Typography>

                            </Box>
                          </Box>

                          <Box display="flex" gap={1} alignItems="center">
                            <Chip
                              size="small"
                              label={activity.category}
                              sx={{
                                fontWeight: "bold",
                                bgcolor:
                                  activity.category === "Prepaid" ? "#e0f2fe" :
                                  activity.category === "Contract" ? "#ecfdf5" : "#fff7ed",
                                color:
                                  activity.category === "Prepaid" ? "#0369a1" :
                                  activity.category === "Contract" ? "#047857" : "#c2410c",
                              }}
                            />
                            <Chip size="small" label={activity.status} variant="outlined" />

                          </Box>
                        </Box>
                      ))
                    )}
                  </Paper>
                </Grid>

                {/* DISTRIBUTION PERFORMANCE & EVENT LOGGING */}
                <Grid item xs={12} md={4}>
                  <Grid container spacing={4}>
                    {/* Pipeline distribution shares */}
                    <Grid item xs={12}>
                      <Paper sx={styles.contentPaper}>
                        <Typography variant="h6" fontWeight={800} color="#0f172a" mb={3}>
                          Pipeline Balance
                        </Typography>

                        <Box display="flex" flexDirection="column" gap={3}>
                          <Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>

                              <Typography variant="body2" fontWeight="bold" color="#475569">Prepaid Shares</Typography>
                              <Typography variant="body2" fontWeight="bold" color="#0f172a">
                                {totalSubmissions > 0 ? Math.round((prepaidLeads.length / totalSubmissions) * 100) : 0}%
                              </Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={totalSubmissions > 0 ? (prepaidLeads.length / totalSubmissions) * 100 : 0} sx={{ height: 8, borderRadius: 4, bgcolor: "#f1f5f9", "& .MuiLinearProgress-bar": { bgcolor: "#0284c7" } }} />
                          </Box>

                          <Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                              <Typography variant="body2" fontWeight="bold" color="#475569">Contract Shares</Typography>

                              <Typography variant="body2" fontWeight="bold" color="#0f172a">
                                {totalSubmissions > 0 ? Math.round((contractLeads.length / totalSubmissions) * 100) : 0}%
                              </Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={totalSubmissions > 0 ? (contractLeads.length / totalSubmissions) * 100 : 0} sx={{ height: 8, borderRadius: 4, bgcolor: "#f1f5f9", "& .MuiLinearProgress-bar": { bgcolor: "#10b981" } }} />
                          </Box>

                          <Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                              <Typography variant="body2" fontWeight="bold" color="#475569">Free Trial Shares</Typography>
                              <Typography variant="body2" fontWeight="bold" color="#0f172a">
                                {totalSubmissions > 0 ? Math.round((freeTrials.length / totalSubmissions) * 100) : 0}%
                              </Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={totalSubmissions > 0 ? (freeTrials.length / totalSubmissions) * 100 : 0} sx={{ height: 8, borderRadius: 4, bgcolor: "#f1f5f9", "& .MuiLinearProgress-bar": { bgcolor: "#f59e0b" } }} />
                          </Box>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="caption" color="#64748b" display="block">Total Dynamic Submissions</Typography>
                            <Typography variant="h5" fontWeight={900} color="#0f172a">{totalSubmissions}</Typography>
                          </Box>
                          <Tooltip title="Growth projection relative to initial installation benchmarks">
                            <Chip icon={<TrendingUp />} label="+28% YoY" color="success" size="small" sx={{ fontWeight: "bold" }} />
                          </Tooltip>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Dynamic Event Log Auditor (Live notifications audit list) */}
                    <Grid item xs={12}>
                      <Paper sx={{ ...styles.contentPaper, maxHeight: 310, overflowY: "auto" }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                            Real-time Event Audit Log

                          </Typography>
                          <Button size="small" onClick={() => setNotificationLog([])} sx={{ textTransform: "none", fontSize: 11 }}>
                            Clear Logs
                          </Button>
                        </Box>
                        
                        {notificationLog.length === 0 ? (
                          <Box textAlign="center" py={4}>
                            <Typography variant="body2" color="text.secondary">No events logged during session.</Typography>
                          </Box>
                        ) : (
                          <List dense disablePadding>
                            {notificationLog.map((log) => (
                              <ListItem key={log.id} disableGutters sx={{ py: 0.5, borderBottom: "1px dashed #f1f5f9" }}>
                                <ListItemIcon sx={{ minWidth: 28 }}>
                                  <Box sx={{
                                    width: 8,

                                    height: 8,
                                    borderRadius: "50%",
                                    bgcolor: log.category === "Prepaid" ? "#0284c7" :
                                             log.category === "Contract" ? "#10b981" :
                                             log.category === "Free Trial" ? "#f59e0b" : "#a855f7"
                                  }} />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={log.message} 
                                  secondary={log.timestamp.toLocaleTimeString()} 
                                  primaryTypographyProps={{ fontSize: 12, fontWeight: 500, color: "#1e293b" }}
                                  secondaryTypographyProps={{ fontSize: 10 }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        )}

                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </Box>

      {/* 🔔 ON-SCREEN TOAST SYSTEM */}
      <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {toasts.map((toast) => (
          <Snackbar
            key={toast.id}
            open={true}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            sx={{ position: "static" }}
          >
            <Alert
              severity={

                toast.category === "Prepaid" ? "info" :
                toast.category === "Contract" ? "success" :
                toast.category === "Free Trial" ? "warning" : "error"
              }
              variant="filled"
              action={
                <IconButton size="small" color="inherit" onClick={() => removeToast(toast.id)}>
                  <Close fontSize="small" />
                </IconButton>
              }
              sx={{
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                fontWeight: "bold",
                minWidth: 320,
              }}
            >
              {toast.message}
            </Alert>
          </Snackbar>

        ))}
      </Box>
    </Box>
  );
};

export default Dashboard;