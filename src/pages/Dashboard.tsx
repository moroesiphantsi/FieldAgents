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
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
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
  Speed,
  FilterList,
  PhoneIphone,
  Edit,
  Send,
} from "@mui/icons-material";

import { ref, onValue, update } from "firebase/database";
import { db } from "../firebase";

import Sidebar from "../components/Sidebar";
import TopBar from "../components/Topbar";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Supported Status Categories
const ALL_STATUSES = [
  "All Completed",
  "Applications Received",
  "In Process",
  "Declined",
  "Approved",
  "Cancelled",
  "Ready for Installation",
  "Signed Up",
  "Contacted",
] as const;

// Interface for real-time dashboard notifications
interface LiveNotification {
  id: string;
  message: string;
  category: "Prepaid" | "Contract" | "Telkom" | "Free Trial" | "Agent Update";
  timestamp: Date;
}

const Dashboard = () => {
  // Database States
  const [prepaidLeads, setPrepaidLeads] = useState<any[]>([]);
  const [contractLeads, setContractLeads] = useState<any[]>([]);
  const [telkomLeads, setTelkomLeads] = useState<any[]>([]);
  const [freeTrials, setFreeTrials] = useState<any[]>([]);
  const [fieldAgents, setFieldAgents] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All Statuses");

  // Date Filtering States (Day, Month, Year)
  const [selectedDay, setSelectedDay] = useState<string>(""); // YYYY-MM-DD
  const [selectedMonth, setSelectedMonth] = useState<number | "All">("All");
  const [selectedYear, setSelectedYear] = useState<number | "All">("All");

  // Status Change Dialog State
  const [statusDialog, setStatusDialog] = useState<{ open: boolean; lead: any | null }>({
    open: false,
    lead: null,
  });
  const [newStatusValue, setNewStatusValue] = useState("");

  // Premium Notification States
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [toasts, setToasts] = useState<LiveNotification[]>([]);
  const [notificationLog, setNotificationLog] = useState<LiveNotification[]>([]);

  // Refs to prevent playing sound for historical database items on initial render
  const isPrepaidInitialized = useRef(false);
  const isContractInitialized = useRef(false);
  const isTelkomInitialized = useRef(false);
  const isTrialsInitialized = useRef(false);
  const isAgentsInitialized = useRef(false);

  const prepaidKeysRef = useRef<Set<string>>(new Set());
  const contractKeysRef = useRef<Set<string>>(new Set());
  const telkomKeysRef = useRef<Set<string>>(new Set());
  const trialKeysRef = useRef<Set<string>>(new Set());
  const agentKeysRef = useRef<Set<string>>(new Set());

  // Synthesizer Chime Alert Engine
  const triggerAudioChime = useCallback(
    (customVolume?: number) => {
      if (isMuted) return;
      try {
        const activeVolume = customVolume !== undefined ? customVolume : volume;
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.12); // G5

        gainNode.gain.setValueAtTime(activeVolume, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.35);
      } catch (error) {
        console.warn("Audio Context blocked or unsupported:", error);
      }
    },
    [isMuted, volume]
  );

  const pushNotification = useCallback(
    (message: string, category: "Prepaid" | "Contract" | "Telkom" | "Free Trial" | "Agent Update") => {
      const newAlert: LiveNotification = {
        id: Math.random().toString(36).substr(2, 9),
        message,
        category,
        timestamp: new Date(),
      };
      setToasts((prev) => [newAlert, ...prev].slice(0, 3));
      setNotificationLog((prev) => [newAlert, ...prev].slice(0, 50));
      triggerAudioChime();
    },
    [triggerAudioChime]
  );

  useEffect(() => {
    const prepaidRef = ref(db, "prepaidFibreLeads");
    const contractRef = ref(db, "contractFibreLeads");
    const telkomRef = ref(db, "telkomFibreLeads");
    const trialRef = ref(db, "freeTrialApplications");
    const agentsRef = ref(db, "fieldUpdates");

    let loadedCount = 0;
    const checkLoading = () => {
      loadedCount++;
      if (loadedCount >= 5) {
        setLoading(false);
      }
    };

    // 1. Prepaid Fibre
    const unsubPrepaid = onValue(prepaidRef, (snap) => {
      const data = snap.val() || {};
      const currentKeys = Object.keys(data);
      const list = currentKeys.map((k) => ({ id: k, type: "Prepaid", dbPath: "prepaidFibreLeads", ...data[k] }));

      if (isPrepaidInitialized.current) {
        currentKeys.forEach((key) => {
          if (!prepaidKeysRef.current.has(key)) {
            const clientName = data[key]?.firstNamesOrContactName || data[key]?.name || "Fibre Client";
            pushNotification(`New Prepaid Fibre Lead: ${clientName}`, "Prepaid");
          }
        });
      } else {
        isPrepaidInitialized.current = true;
      }
      prepaidKeysRef.current = new Set(currentKeys);
      setPrepaidLeads(list);
      checkLoading();
    });

    // 2. Contract Fibre
    const unsubContract = onValue(contractRef, (snap) => {
      const data = snap.val() || {};
      const currentKeys = Object.keys(data);
      const list = currentKeys.map((k) => ({ id: k, type: "Contract", dbPath: "contractFibreLeads", ...data[k] }));

      if (isContractInitialized.current) {
        currentKeys.forEach((key) => {
          if (!contractKeysRef.current.has(key)) {
            const clientName = data[key]?.firstNamesOrContactName || data[key]?.name || "Fibre Client";
            pushNotification(`New Contract Fibre Lead: ${clientName}`, "Contract");
          }
        });
      } else {
        isContractInitialized.current = true;
      }
      contractKeysRef.current = new Set(currentKeys);
      setContractLeads(list);
      checkLoading();
    });

    // 3. Telkom Fibre
    const unsubTelkom = onValue(telkomRef, (snap) => {
      const data = snap.val() || {};
      const currentKeys = Object.keys(data);
      const list = currentKeys.map((k) => ({ id: k, type: "Telkom", dbPath: "telkomFibreLeads", ...data[k] }));

      if (isTelkomInitialized.current) {
        currentKeys.forEach((key) => {
          if (!telkomKeysRef.current.has(key)) {
            const clientName = data[key]?.firstNamesOrContactName || data[key]?.name || "Telkom Client";
            pushNotification(`New Telkom Fibre Lead: ${clientName}`, "Telkom");
          }
        });
      } else {
        isTelkomInitialized.current = true;
      }
      telkomKeysRef.current = new Set(currentKeys);
      setTelkomLeads(list);
      checkLoading();
    });

    // 4. Free Trials
    const unsubTrial = onValue(trialRef, (snap) => {
      const data = snap.val() || {};
      const currentKeys = Object.keys(data);
      const list = currentKeys.map((k) => ({ id: k, type: "Free Trial", dbPath: "freeTrialApplications", ...data[k] }));

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

    // 5. Field Agents
    const unsubAgents = onValue(agentsRef, (snap) => {
      const data = snap.val() || {};
      const currentKeys = Object.keys(data);
      const list = currentKeys.map((k) => ({ id: k, ...data[k] }));

      if (isAgentsInitialized.current) {
        currentKeys.forEach((key) => {
          if (!agentKeysRef.current.has(key)) {
            const agentName = data[key]?.name || "Field Agent";
            pushNotification(`New Agent Registered: ${agentName}`, "Agent Update");
          }
        });
      } else {
        isAgentsInitialized.current = true;
      }
      agentKeysRef.current = new Set(currentKeys);
      setFieldAgents(list);
      checkLoading();
    });

    return () => {
      unsubPrepaid();
      unsubContract();
      unsubTelkom();
      unsubTrial();
      unsubAgents();
    };
  }, [pushNotification]);

  // Aggregations
  const totalSubmissions = prepaidLeads.length + contractLeads.length + telkomLeads.length + freeTrials.length;

  // Unified dynamic feed
  const unifiedActivity = [
    ...prepaidLeads.map((l) => ({
      id: l.id,
      name: `${l.firstNamesOrContactName || l.name || "Client"} ${l.surnameOrBusinessName || l.surname || ""}`.trim(),
      details: `${l.packageName || "Prepaid Package"} Application`,
      createdAt: l.createdAt || l.submittedAt || Date.now(),
      category: "Prepaid",
      status: l.status || "Applications Received",
      rawLead: l,
    })),
    ...contractLeads.map((l) => ({
      id: l.id,
      name: `${l.firstNamesOrContactName || l.name || "Client"} ${l.surnameOrBusinessName || l.surname || ""}`.trim(),
      details: `${l.packageName || "Contract Package"} Application`,
      createdAt: l.createdAt || l.submittedAt || Date.now(),
      category: "Contract",
      status: l.status || "Applications Received",
      rawLead: l,
    })),
    ...telkomLeads.map((l) => ({
      id: l.id,
      name: `${l.firstNamesOrContactName || l.name || "Client"} ${l.surnameOrBusinessName || l.surname || ""}`.trim(),
      details: `${l.packageName || "Telkom Fibre"} Application`,
      createdAt: l.createdAt || l.submittedAt || Date.now(),
      category: "Telkom",
      status: l.status || "Applications Received",
      rawLead: l,
    })),
    ...freeTrials.map((l) => ({
      id: l.id,
      name: `${l.firstNamesOrContactName || l.name || "Client"} ${l.surnameOrBusinessName || l.surname || ""}`.trim(),
      details: "14 Days Free Trial Signup",
      createdAt: l.createdAt || l.submittedAt || Date.now(),
      category: "Free Trial",
      status: l.status || "Applications Received",
      rawLead: l,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Search & Filters Controller
  const filteredActivity = unifiedActivity.filter((activity) => {
    const matchesSearch =
      activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === "All" || activity.category === filterCategory;

    // Status Filter Matching
    let matchesStatus = true;
    if (filterStatus !== "All Statuses") {
      if (filterStatus === "All Completed") {
        matchesStatus = activity.status === "Completed and contacted" || activity.status === "Approved";
      } else {
        matchesStatus = activity.status?.toLowerCase() === filterStatus.toLowerCase();
      }
    }

    // Date Filters (Day, Month, Year)
    const dateObj = new Date(activity.createdAt);
    let matchesDay = true;
    if (selectedDay) {
      const yearStr = dateObj.getFullYear();
      const monthStr = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dayStr = String(dateObj.getDate()).padStart(2, "0");
      const formattedItemDay = `${yearStr}-${monthStr}-${dayStr}`;
      matchesDay = formattedItemDay === selectedDay;
    }

    let matchesMonth = true;
    if (selectedMonth !== "All") {
      matchesMonth = dateObj.getMonth() === selectedMonth;
    }

    let matchesYear = true;
    if (selectedYear !== "All") {
      matchesYear = dateObj.getFullYear() === selectedYear;
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesDay && matchesMonth && matchesYear;
  });

  // Export Master Workbook containing Prepaid, Contract, Telkom & 14-Days Free Trial
  const handleExportAll = () => {
    const workbook = XLSX.utils.book_new();

    const formatLeads = (list: any[]) =>
      list.map((l) => ({
        ID: l.id,
        "Client Name": `${l.firstNamesOrContactName || l.name || ""} ${l.surnameOrBusinessName || l.surname || ""}`.trim(),
        Contact: l.phone || l.cellphone || l.contactNumber || "",
        Email: l.email || l.emailAddress || "",
        Package: l.packageName || l.packageSelected || "Fibre Bundle",
        Status: l.status || "Applications Received",
        "Created Date": l.createdAt || l.submittedAt ? new Date(l.createdAt || l.submittedAt).toLocaleString() : "Recent",
      }));

    if (prepaidLeads.length > 0) {
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formatLeads(prepaidLeads)), "Prepaid Fibre Leads");
    }
    if (contractLeads.length > 0) {
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formatLeads(contractLeads)), "Contract Fibre Leads");
    }
    if (telkomLeads.length > 0) {
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formatLeads(telkomLeads)), "Telkom Fibre Leads");
    }
    if (freeTrials.length > 0) {
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formatLeads(freeTrials)), "14 Days Free Trial");
    }
    if (fieldAgents.length > 0) {
      const formattedAgents = fieldAgents.map((a) => ({
        "Agent ID": a.id,
        "Agent Name": a.name || a.agentName || "Unknown Agent",
        Status: a.status || "Active",
      }));
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formattedAgents), "Field Agents");
    }

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(fileBlob, `Fibre_Master_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Status Change Execution
  const executeStatusUpdate = () => {
    if (!statusDialog.lead || !newStatusValue) return;

    const lead = statusDialog.lead.rawLead;
    const path = lead.dbPath || "prepaidFibreLeads";

    update(ref(db, `${path}/${lead.id}`), {
      status: newStatusValue,
      updatedAt: new Date().toISOString(),
    });

    setStatusDialog({ open: false, lead: null });
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const yearsList = [2024, 2025, 2026, 2027];

  const styles = {
    mainWrapper: {
      ml: "280px",
      width: "calc(100% - 280px)",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 50%, #ffffff 100%)",
      py: 4,
      px: 4,
      boxSizing: "border-box" as const,
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
      "&:hover": { transform: "translateY(-3px)", borderColor: "#38bdf8" },
    },
    contentPaper: {
      p: 3,
      borderRadius: "24px",
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
    },
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
                Consolidated operational tracking for Prepaid, Contract, Telkom & 14-Days Free Trials.
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
                  "&:hover": { bgcolor: "#0369a1" },
                }}
              >
                Export Master Excel (All Streams)
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
              {/* KPI METRICS BAR */}
              <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Box sx={styles.metricCard}>
                    <Box>
                      <Typography variant="body2" color="#64748b" fontWeight="bold">
                        Prepaid Leads
                      </Typography>
                      <Typography variant="h4" fontWeight={900} mt={0.5} color="#0f172a">
                        {prepaidLeads.length}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: "#e0f2fe", color: "#0284c7", width: 48, height: 48 }}>
                      <SimCard />
                    </Avatar>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                  <Box sx={styles.metricCard}>
                    <Box>
                      <Typography variant="body2" color="#64748b" fontWeight="bold">
                        Contract Leads
                      </Typography>
                      <Typography variant="h4" fontWeight={900} mt={0.5} color="#0f172a">
                        {contractLeads.length}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: "#ecfdf5", color: "#10b981", width: 48, height: 48 }}>
                      <Business />
                    </Avatar>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                  <Box sx={styles.metricCard}>
                    <Box>
                      <Typography variant="body2" color="#64748b" fontWeight="bold">
                        Telkom Leads
                      </Typography>
                      <Typography variant="h4" fontWeight={900} mt={0.5} color="#0f172a">
                        {telkomLeads.length}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: "#f0f9ff", color: "#0284c7", width: 48, height: 48 }}>
                      <PhoneIphone />
                    </Avatar>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                  <Box sx={styles.metricCard}>
                    <Box>
                      <Typography variant="body2" color="#64748b" fontWeight="bold">
                        14-Days Free Trial
                      </Typography>
                      <Typography variant="h4" fontWeight={900} mt={0.5} color="#0f172a">
                        {freeTrials.length}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: "#fff7ed", color: "#f59e0b", width: 48, height: 48 }}>
                      <HourglassEmpty />
                    </Avatar>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                  <Box sx={styles.metricCard}>
                    <Box>
                      <Typography variant="body2" color="#64748b" fontWeight="bold">
                        Field Agents
                      </Typography>
                      <Typography variant="h4" fontWeight={900} mt={0.5} color="#0f172a">
                        {fieldAgents.length}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: "#f3e8ff", color: "#a855f7", width: 48, height: 48 }}>
                      <SupportAgent />
                    </Avatar>
                  </Box>
                </Grid>
              </Grid>

              {/* DATE, CATEGORY & STATUS FILTER BAR */}
              <Paper sx={{ ...styles.contentPaper, mb: 4, p: 2.5 }}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <FilterList sx={{ color: "#0284c7" }} />
                  <Typography variant="h6" fontWeight={800} color="#0f172a">
                    Advanced Search & Filters
                  </Typography>
                </Box>

                <Grid container spacing={2} alignItems="center">
                  {/* Category Filter */}
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Product Stream"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <MenuItem value="All">All Streams</MenuItem>
                      <MenuItem value="Prepaid">Prepaid</MenuItem>
                      <MenuItem value="Contract">Contract</MenuItem>
                      <MenuItem value="Telkom">Telkom</MenuItem>
                      <MenuItem value="Free Trial">14 Days Free Trial</MenuItem>
                    </TextField>
                  </Grid>

                  {/* Status Filter */}
                  <Grid item xs={12} sm={6} md={2.5}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Application Status"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <MenuItem value="All Statuses">All Statuses</MenuItem>
                      {ALL_STATUSES.map((st) => (
                        <MenuItem key={st} value={st}>
                          {st}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* Day Date Selector */}
                  <Grid item xs={12} sm={4} md={2.5}>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      label="Filter Specific Day"
                      InputLabelProps={{ shrink: true }}
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                    />
                  </Grid>

                  {/* Month Selector */}
                  <Grid item xs={12} sm={4} md={2.5}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Filter Month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value === "All" ? "All" : Number(e.target.value))}
                    >
                      <MenuItem value="All">All Months</MenuItem>
                      {monthsList.map((m, idx) => (
                        <MenuItem key={m} value={idx}>
                          {m}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* Year Selector */}
                  <Grid item xs={12} sm={4} md={2.5}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Filter Year"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value === "All" ? "All" : Number(e.target.value))}
                    >
                      <MenuItem value="All">All Years</MenuItem>
                      {yearsList.map((yr) => (
                        <MenuItem key={yr} value={yr}>
                          {yr}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* Clear Filters Button */}
                  <Grid item xs={12} display="flex" justifyContent="flex-end" gap={1}>
                    <Button
                      size="small"
                      onClick={() => {
                        setFilterCategory("All");
                        setFilterStatus("All Statuses");
                        setSelectedDay("");
                        setSelectedMonth("All");
                        setSelectedYear("All");
                        setSearchQuery("");
                      }}
                      sx={{ textTransform: "none", color: "#64748b" }}
                    >
                      Reset Filters
                    </Button>
                  </Grid>
                </Grid>
              </Paper>

              {/* CHIME ENGINE CONTROLLER & SYSTEM MONITOR */}
              <Grid container spacing={4} mb={4}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ ...styles.contentPaper, borderLeft: "6px solid #0284c7" }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                      <NotificationsActive sx={{ color: "#0284c7" }} />
                      <Typography variant="h6" fontWeight={800} color="#0f172a">
                        Live Chime Engine & Audio Deck
                      </Typography>
                    </Box>

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
                          <Typography variant="caption" color="text.secondary">
                            0%
                          </Typography>
                          <Slider
                            value={isMuted ? 0 : volume * 100}
                            onChange={(_, value) => {
                              setIsMuted(false);
                              setVolume((value as number) / 100);
                            }}
                            valueLabelDisplay="auto"
                            sx={{ color: "#0284c7" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            100%
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => triggerAudioChime()}
                          sx={{ textTransform: "none", fontWeight: "bold" }}
                        >
                          Test Audio Chime
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ ...styles.contentPaper, borderLeft: "6px solid #10b981" }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                      <Speed sx={{ color: "#10b981" }} />
                      <Typography variant="h6" fontWeight={800} color="#0f172a">
                        System Sync Monitor
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2} mt={1}>
                      <Chip label="Latency: < 100ms" size="small" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: "bold" }} />
                      <Chip label="SSL Encrypted" size="small" sx={{ bgcolor: "#e3f2fd", color: "#1565c0", fontWeight: "bold" }} />
                      <Chip label="Database Realtime 2026" size="small" />
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
                        Recent Feed & Applications ({filteredActivity.length})
                      </Typography>
                      <TextField
                        placeholder="Search applications..."
                        size="small"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                          startAdornment: <Search style={{ color: "#94a3b8", marginRight: 6, fontSize: 18 }} />,
                        }}
                        sx={{ bgcolor: "#f8fafc", width: 260 }}
                      />
                    </Box>

                    {filteredActivity.length === 0 ? (
                      <Box textAlign="center" py={6}>
                        <Typography color="text.secondary">No records found matching search or date filters.</Typography>
                      </Box>
                    ) : (
                      filteredActivity.slice(0, 10).map((activity) => (
                        <Box
                          key={activity.id}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            py: 2,
                            borderBottom: "1px solid #f1f5f9",
                            "&:last-child": { borderBottom: "none" },
                          }}
                        >
                          <Box display="flex" gap={2} alignItems="center">
                            <Avatar sx={{ bgcolor: "#e0f2fe", color: "#0284c7" }}>
                              {activity.name?.charAt(0) || "U"}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={700} color="#0f172a">
                                {activity.name}
                              </Typography>
                              <Typography variant="body2" color="#64748b">
                                {activity.details}
                              </Typography>
                              <Typography variant="caption" color="#94a3b8">
                                {new Date(activity.createdAt).toLocaleString()}
                              </Typography>
                            </Box>
                          </Box>

                          <Box display="flex" gap={1} alignItems="center">
                            <Chip
                              size="small"
                              label={activity.category}
                              sx={{
                                fontWeight: "bold",
                                bgcolor:
                                  activity.category === "Prepaid"
                                    ? "#e0f2fe"
                                    : activity.category === "Contract"
                                    ? "#ecfdf5"
                                    : activity.category === "Telkom"
                                    ? "#e0f2fe"
                                    : "#fff7ed",
                                color:
                                  activity.category === "Prepaid"
                                    ? "#0369a1"
                                    : activity.category === "Contract"
                                    ? "#047857"
                                    : activity.category === "Telkom"
                                    ? "#0284c7"
                                    : "#c2410c",
                              }}
                            />
                            <Chip size="small" label={activity.status} variant="outlined" />
                            <IconButton
                              size="small"
                              title="Update Status"
                              onClick={() => {
                                setStatusDialog({ open: true, lead: activity });
                                setNewStatusValue(activity.status);
                              }}
                            >
                              <Edit fontSize="small" sx={{ color: "#0284c7" }} />
                            </IconButton>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Paper>
                </Grid>

                {/* DISTRIBUTION PERFORMANCE & AUDIT LOGGING */}
                <Grid item xs={12} md={4}>
                  <Grid container spacing={4}>
                    <Grid item xs={12}>
                      <Paper sx={styles.contentPaper}>
                        <Typography variant="h6" fontWeight={800} color="#0f172a" mb={3}>
                          Pipeline Balance
                        </Typography>

                        <Box display="flex" flexDirection="column" gap={2}>
                          <Box>
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                              <Typography variant="body2" fontWeight="bold" color="#475569">
                                Prepaid
                              </Typography>
                              <Typography variant="body2" fontWeight="bold" color="#0f172a">
                                {totalSubmissions > 0 ? Math.round((prepaidLeads.length / totalSubmissions) * 100) : 0}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={totalSubmissions > 0 ? (prepaidLeads.length / totalSubmissions) * 100 : 0}
                              sx={{ height: 8, borderRadius: 4, bgcolor: "#f1f5f9", "& .MuiLinearProgress-bar": { bgcolor: "#0284c7" } }}
                            />
                          </Box>

                          <Box>
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                              <Typography variant="body2" fontWeight="bold" color="#475569">
                                Contract
                              </Typography>
                              <Typography variant="body2" fontWeight="bold" color="#0f172a">
                                {totalSubmissions > 0 ? Math.round((contractLeads.length / totalSubmissions) * 100) : 0}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={totalSubmissions > 0 ? (contractLeads.length / totalSubmissions) * 100 : 0}
                              sx={{ height: 8, borderRadius: 4, bgcolor: "#f1f5f9", "& .MuiLinearProgress-bar": { bgcolor: "#10b981" } }}
                            />
                          </Box>

                          <Box>
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                              <Typography variant="body2" fontWeight="bold" color="#475569">
                                Telkom
                              </Typography>
                              <Typography variant="body2" fontWeight="bold" color="#0f172a">
                                {totalSubmissions > 0 ? Math.round((telkomLeads.length / totalSubmissions) * 100) : 0}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={totalSubmissions > 0 ? (telkomLeads.length / totalSubmissions) * 100 : 0}
                              sx={{ height: 8, borderRadius: 4, bgcolor: "#f1f5f9", "& .MuiLinearProgress-bar": { bgcolor: "#3b82f6" } }}
                            />
                          </Box>

                          <Box>
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                              <Typography variant="body2" fontWeight="bold" color="#475569">
                                Free Trial
                              </Typography>
                              <Typography variant="body2" fontWeight="bold" color="#0f172a">
                                {totalSubmissions > 0 ? Math.round((freeTrials.length / totalSubmissions) * 100) : 0}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={totalSubmissions > 0 ? (freeTrials.length / totalSubmissions) * 100 : 0}
                              sx={{ height: 8, borderRadius: 4, bgcolor: "#f1f5f9", "& .MuiLinearProgress-bar": { bgcolor: "#f59e0b" } }}
                            />
                          </Box>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="caption" color="#64748b" display="block">
                              Total Dynamic Submissions
                            </Typography>
                            <Typography variant="h5" fontWeight={900} color="#0f172a">
                              {totalSubmissions}
                            </Typography>
                          </Box>
                          <Tooltip title="Growth metric across operational pipelines">
                            <Chip icon={<TrendingUp />} label="+34% YoY" color="success" size="small" sx={{ fontWeight: "bold" }} />
                          </Tooltip>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* EVENT AUDIT LOG */}
                    <Grid item xs={12}>
                      <Paper sx={{ ...styles.contentPaper, maxHeight: 260, overflowY: "auto" }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                            Session Event Log
                          </Typography>
                          <Button size="small" onClick={() => setNotificationLog([])} sx={{ textTransform: "none", fontSize: 11 }}>
                            Clear
                          </Button>
                        </Box>

                        {notificationLog.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                            No events logged.
                          </Typography>
                        ) : (
                          <List dense disablePadding>
                            {notificationLog.map((log) => (
                              <ListItem key={log.id} disableGutters sx={{ py: 0.5, borderBottom: "1px dashed #f1f5f9" }}>
                                <ListItemIcon sx={{ minWidth: 24 }}>
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: "50%",
                                      bgcolor:
                                        log.category === "Prepaid"
                                          ? "#0284c7"
                                          : log.category === "Contract"
                                          ? "#10b981"
                                          : log.category === "Telkom"
                                          ? "#3b82f6"
                                          : log.category === "Free Trial"
                                          ? "#f59e0b"
                                          : "#a855f7",
                                    }}
                                  />
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

      {/* QUICK STATUS UPDATE DIALOG */}
      <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false, lead: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>Update Lead Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Select the new status for <b>{statusDialog.lead?.name}</b>:
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={newStatusValue}
            onChange={(e) => setNewStatusValue(e.target.value)}
          >
            {ALL_STATUSES.map((st) => (
              <MenuItem key={st} value={st}>
                {st}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStatusDialog({ open: false, lead: null })} sx={{ color: "#64748b" }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={executeStatusUpdate} startIcon={<Send />}>
            Save Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* ON-SCREEN TOAST NOTIFICATIONS */}
      <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {toasts.map((toast) => (
          <Snackbar key={toast.id} open={true} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} sx={{ position: "static" }}>
            <Alert
              severity={
                toast.category === "Prepaid" || toast.category === "Telkom"
                  ? "info"
                  : toast.category === "Contract"
                  ? "success"
                  : toast.category === "Free Trial"
                  ? "warning"
                  : "error"
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