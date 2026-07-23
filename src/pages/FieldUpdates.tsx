import React, { useEffect, useMemo, useCallback, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Chip,
  Avatar,
  Stack,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab
} from "@mui/material";
import {
  Payments,
  Wifi,
  Engineering,
  Description,
  CheckCircle,
  Leaderboard,
  Download,
  Search,
  NotificationsActive,
  VolumeUp,
  FilterList,
  AccountCircle,
  TrendingUp,
  Cancel,
  HourglassEmpty,
  EmojiEvents,
  AttachFile,
  ExpandMore,
  InsertDriveFile,
  TaskAlt,
  BarChart as BarChartIcon,
  CalendarMonth,
  Inventory2
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

const DAILY_TARGET = 2; // Required target of at least 2 leads per day

// ALL PRODUCTS & COMMISSIONS TABLE REFERENCE DATA
const PRODUCT_COMMISSIONS = {
  prepaid: [
    { package: "Telkom Prepaid Fibre 20/10 Mbps", speed: "20/10 Mbps", price: 349, commission: 50 },
    { package: "Telkom Prepaid Fibre 25/25 Mbps", speed: "25/25 Mbps", price: 499, commission: 50 },
    { package: "Telkom Prepaid Fibre 50/25 Mbps", speed: "50/25 Mbps", price: 700, commission: 50 }
  ],
  postpaid: [
    { package: "Easy 20/10 Mbps", price: 345, commission: 200 },
    { package: "Easy 40/20 Mbps", price: 425, commission: 200 },
    { package: "Core/Stream 25/25 Mbps", price: 499, commission: 200 },
    { package: "Core/Stream 30/30 Mbps", price: 519, commission: 350 },
    { package: "Core/Stream 50/25 Mbps", price: 695, commission: 350 },
    { package: "Core/Stream 50/50 Mbps", price: 805, commission: 350 },
    { package: "Core/Stream 100/50 Mbps", price: 895, commission: 400 },
    { package: "Core/Stream 100/100 Mbps", price: 1025, commission: 400 },
    { package: "Core/Stream 200/100 Mbps", price: 1299, commission: 500 },
    { package: "Core/Stream 200/200 Mbps", price: 1365, commission: 500 },
    { package: "Core/Stream 300/150 Mbps", price: 1529, commission: 500 },
    { package: "Core/Stream 500/250 Mbps", price: 1699, commission: 500 }
  ],
  lte: [
    { package: "10 Mbps Unlimited LTE", price: 299, commission: 300 },
    { package: "20 Mbps Unlimited LTE", price: 449, commission: 400 },
    { package: "30 Mbps Unlimited LTE", price: 599, commission: 500 },
    { package: "2TB LTE", price: 699, commission: 600 }
  ],
  tbFibre: [
    { package: "TB Easy 20/10 Mbps", price: 345, commission: 200 },
    { package: "TB Easy 40/20 Mbps", price: 425, commission: 200 },
    { package: "TB Core/Stream 25/25 Mbps", price: 499, commission: 200 },
    { package: "TB Core/Stream 30/30 Mbps", price: 579, commission: 250 },
    { package: "TB Core/Stream 50/25 Mbps", price: 675, commission: 350 },
    { package: "TB Core/Stream 50/50 Mbps", price: 805, commission: 400 },
    { package: "TB Core/Stream 100/50 Mbps", price: 895, commission: 400 },
    { package: "TB Core/Stream 100/100 Mbps", price: 1025, commission: 500 },
    { package: "TB Core/Stream 200/100 Mbps", price: 1299, commission: 600 },
    { package: "TB Core/Stream 200/200 Mbps", price: 1365, commission: 600 },
    { package: "TB Core/Stream 300/150 Mbps", price: 1529, commission: 700 },
    { package: "TB Core/Stream 500/250 Mbps", price: 1699, commission: 700 }
  ],
  tbVoice: [
    { package: "Smart Voice Basic", price: 239, commission: 120 },
    { package: "Smart Voice 100", price: 345, commission: 170 },
    { package: "Smart Voice 300", price: 469, commission: 200 },
    { package: "Smart Voice 500", price: 549, commission: 250 },
    { package: "Smart Voice Unlimited", price: 705, commission: 350 }
  ],
  tbPabx: [
    { package: "Outright PABX", price: "Custom", commission: "5%" },
    { package: "Rental @ TVC PABX - Tier 1", price: "Custom", commission: "5%" }
  ]
};

// Helper function to resolve rate card commission from all reference tables
const resolvePackageCommission = (packageName: string): number => {
  if (!packageName) return 0;
  const normalized = packageName.toLowerCase();
  const allFlatPackages = [
    ...PRODUCT_COMMISSIONS.prepaid,
    ...PRODUCT_COMMISSIONS.postpaid,
    ...PRODUCT_COMMISSIONS.lte,
    ...PRODUCT_COMMISSIONS.tbFibre,
    ...PRODUCT_COMMISSIONS.tbVoice
  ];
  const match = allFlatPackages.find(
    (p) => normalized.includes(p.package.toLowerCase()) || p.package.toLowerCase().includes(normalized)
  );
  if (match) {
    return typeof match.commission === "number" ? match.commission : parseFloat(match.commission) || 0;
  }
  return 0;
};

const FieldUpdates = () => {
  const [updates, setUpdates] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);

  // ISP Table Collections
  const [attachmentLeads, setAttachmentLeads] = useState<any[]>([]);
  const [prepaidLeads, setPrepaidLeads] = useState<any[]>([]);
  const [contractLeads, setContractLeads] = useState<any[]>([]);
  const [tbLeads, setTbLeads] = useState<any[]>([]);
  const [freetrialLeads, setfreetrialLeads] = useState<any[]>([]);

  // Session Agent
  const activeAgentName = sessionStorage.getItem("activeAgentName") || "";

  // Filter States
  const [ispFilter, setIspFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [excelAgentFilter, setExcelAgentFilter] = useState("");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Package Catalog Modal State
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState(0);

  const isFirstLoad = useRef(true);
  const todayStr = new Date().toISOString().split("T")[0];
  const currentMonthIdx = new Date().getMonth();
  const fullMonthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentMonthName = fullMonthNames[currentMonthIdx];

  const playNewClientSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.log("Audio failed to initialize:", e);
    }
  }, [soundEnabled]);

  // Normalize lead records across disparate tables
  const normalizeLeadRecord = useCallback(
  (key: string, raw: any, defaultIsp: string, sourceTable: string) => {
    const rawDate = raw.date || raw.submittedAt || raw.createdAt || todayStr;
    const dateFormatted = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;
    const customerName =
      raw.customerName || [raw.firstNamesOrContactName, raw.surnameOrBusinessName].filter(Boolean).join(" ") ||"Unnamed Customer";
    const agentName = raw.agentName || raw.agentLogged || raw.agent || "System Agent";
    let adminConfirmation = raw.adminConfirmation || raw.status || "Pending";
    if (raw.status === "Confirmed" || raw.status === "Approved") adminConfirmation = "Confirmed";
    if (raw.status === "Rejected" || raw.status === "Declined") adminConfirmation = "Rejected";

    const packageName = raw.packagePlan || raw.packageSelected || raw.fibreDeal || raw.packageName || "Standard Package";
    const baseCommFromRateCard = resolvePackageCommission(packageName);
    const calculatedCommission = Number(raw.commission || baseCommFromRateCard || 0);

    return {
      id: key,
      sourceTable,
      date: dateFormatted,
      agentName,
      visitType: raw.visitType || "Attended House",
      customerName,
      surname: raw.surname || "",
      idNumber: raw.idNumber || "",
      phone: raw.phone || raw.contactNumber || raw.contactNo || "-",
      address: raw.address || raw.installationAddress || "-",
      houseNumber: raw.houseNumber || "",
      saleType: raw.saleType || defaultIsp,
      packagePlan: packageName,
      price: raw.price || "-",
      commission: calculatedCommission,
      baseCommission: baseCommFromRateCard,
      adminConfirmation,
      status: adminConfirmation,
      comments: raw.comments || raw.notes || "",
      isp: raw.isp || raw.assignedFibreISP || defaultIsp,
      fileName: raw.fileName || raw.attachmentName || null
    };
  }, [todayStr]
);

  // Real-time Listeners
  useEffect(() => {
    const agentsRef = ref(db, "agents");
    const unsubAgents = onValue(agentsRef, (snapshot) => {
      const data = snapshot.val();
      setAgents(data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) : []);
    });

    const attachmentRef = ref(db, "attachmentFibreLeads");
    const unsubAttachments = onValue(attachmentRef, (snapshot) => {
      const data = snapshot.val();
      setAttachmentLeads(data ? Object.keys(data).map((key) => normalizeLeadRecord(key, data[key], "Attachments", "attachmentFibreLeads")) : []);
    });

    const prepaidRef = ref(db, "fibreLeads");
    const unsubPrepaid = onValue(prepaidRef, (snapshot) => {
      const data = snapshot.val();
      setPrepaidLeads(data ? Object.keys(data).map((key) => normalizeLeadRecord(key, data[key], "Prepaid", "prepaidFibreLeads")) : []);
    });

    const contractRef = ref(db, "contractFibreLeads");
    const unsubContract = onValue(contractRef, (snapshot) => {
      const data = snapshot.val();
      setContractLeads(data ? Object.keys(data).map((key) => normalizeLeadRecord(key, data[key], "Contract", "contractFibreLeads")) : []);
    });

    const tbRef = ref(db, "tbFibreLeads");
    const unsubTb = onValue(tbRef, (snapshot) => {
      const data = snapshot.val();
      setTbLeads(data ? Object.keys(data).map((key) => normalizeLeadRecord(key, data[key], "Telkom Business", "tbFibreLeads")) : []);
    });

    const freetrialRef = ref(db, "freeTrialApplications");
    const unsubFreetrial = onValue(freetrialRef, (snapshot) => {
      const data = snapshot.val();
      setfreetrialLeads(data ? Object.keys(data).map((key) => normalizeLeadRecord(key, data[key], "Free Trial", "freetrial")) : []);
    });

    const reportsRef = ref(db, "fieldUpdates");
    const unsubReports = onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsedList = Object.keys(data)
          .map((key) => normalizeLeadRecord(key, data[key], data[key].isp || "General", "fieldUpdates"))
          .reverse();
        if (!isFirstLoad.current && parsedList.length > updates.length) {
          playNewClientSound();
        }
        setUpdates(parsedList);
        isFirstLoad.current = false;
      } else {
        setUpdates([]);
        isFirstLoad.current = false;
      }
    });

    return () => {
      unsubAgents();
      unsubAttachments();
      unsubPrepaid();
      unsubContract();
      unsubTb();
      unsubReports();
      unsubFreetrial();
      unsubFreetrial();
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [normalizeLeadRecord, playNewClientSound, updates.length]);

  // Merge datasets
  const allMergedReports = useMemo(() => {
    const combined = [...updates, ...contractLeads, ...prepaidLeads, ...tbLeads, ...attachmentLeads, ...freetrialLeads];
    const uniqueMap = new Map();
    combined.forEach((item) => {
      const uniqueKey = `${item.sourceTable}_${item.id}`;
      if (!uniqueMap.has(uniqueKey)) {
        uniqueMap.set(uniqueKey, item);
      }
    });
    return Array.from(uniqueMap.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [updates, contractLeads, prepaidLeads, tbLeads, attachmentLeads, freetrialLeads]);

  // Current Year & Month Filtered Records
  const yearFilteredReports = useMemo(() => {
    return allMergedReports.filter((item: any) => {
      if (!item.date) return false;
      const reportYear = new Date(item.date).getFullYear();
      return reportYear === selectedYear;
    });
  }, [allMergedReports, selectedYear]);

  const currentMonthUpdates = useMemo(() => {
    return yearFilteredReports.filter((item: any) => {
      if (!item.date) return false;
      const reportDate = new Date(item.date);
      return reportDate.getMonth() === currentMonthIdx;
    });
  }, [yearFilteredReports, currentMonthIdx]);

  // Filtered Logs for View Table
  const visibleLogs = useMemo(() => {
    return currentMonthUpdates.filter((item: any) => {
      if (ispFilter && item.isp !== ispFilter) return false;
      const matchText = `${item.agentName} ${item.customerName} ${item.address} ${item.status} ${item.visitType} ${item.saleType} ${item.packagePlan} ${item.isp || ""}`.toLowerCase();
      return matchText.includes(searchText.toLowerCase());
    });
  }, [currentMonthUpdates, searchText, ispFilter]);

  // Key Global Metrics
  const totalReports = visibleLogs.length;
  const confirmedReports = visibleLogs.filter((x) => x.adminConfirmation === "Confirmed").length;
  const pendingReports = visibleLogs.filter((x) => x.adminConfirmation === "Pending").length;
  const rejectedReports = visibleLogs.filter((x) => x.adminConfirmation === "Rejected").length;
  const totalApprovedCommission = visibleLogs
    .filter((x) => x.adminConfirmation === "Confirmed")
    .reduce((t, x) => t + Number(x.commission || 0), 0);

  // Agent Performance Breakdown Matrix
  const agentPerformanceList = useMemo(() => {
    const allAgentNames = new Set([
      ...agents.map((a) => a.fullName || a.id),
      ...allMergedReports.map((u) => u.agentName).filter(Boolean)
    ]);
    return Array.from(allAgentNames).map((agentName) => {
      const agentLogs = visibleLogs.filter((x) => x.agentName === agentName);
      const agentAllYearLogs = yearFilteredReports.filter((x) => x.agentName === agentName);
      const todayLeadsCount = agentAllYearLogs.filter((x) => x.date === todayStr).length;
      const reachedDailyTarget = todayLeadsCount >= DAILY_TARGET;
      const confirmed = agentLogs.filter((x) => x.adminConfirmation === "Confirmed").length;
      const pending = agentLogs.filter((x) => x.adminConfirmation === "Pending").length;
      const rejected = agentLogs.filter((x) => x.adminConfirmation === "Rejected").length;
      
      // Earned commission from confirmed applications
      const earnedCommission = agentLogs
        .filter((x) => x.adminConfirmation === "Confirmed")
        .reduce((sum, item) => sum + Number(item.commission || 0), 0);
      
      // Target fetched/computed per agent based on database records
      const agentDbRecord = agents.find((a) => (a.fullName || a.id) === agentName);
      const monthlyTarget = agentDbRecord?.monthlyTarget || agentDbRecord?.target || DAILY_TARGET * 20;

      return {
        agentName,
        totalReports: agentLogs.length,
        todayLeadsCount,
        reachedDailyTarget,
        confirmed,
        pending,
        rejected,
        earnedCommission,
        monthlyTarget
      };
    });
  }, [agents, allMergedReports, yearFilteredReports, visibleLogs, todayStr]);

  // Agent Bar Chart Data (Displays Dynamic Total Target & Commission Earned from DB)
  const agentBarChartData = useMemo(() => {
    return agentPerformanceList.map((agent) => ({
      agentName: agent.agentName,
      TotalTarget: agent.monthlyTarget,
      CommissionEarned: agent.earnedCommission
    }));
  }, [agentPerformanceList]);

  // Top Performers
  const highCommissionWinner = useMemo(() => {
    if (agentPerformanceList.length === 0) return null;
    const sorted = [...agentPerformanceList].sort((a, b) => b.earnedCommission - a.earnedCommission);
    return sorted[0]?.earnedCommission > 0 ? sorted[0] : null;
  }, [agentPerformanceList]);

  const highTargetAchiever = useMemo(() => {
    if (agentPerformanceList.length === 0) return null;
    const sorted = [...agentPerformanceList].sort((a, b) => b.todayLeadsCount - a.todayLeadsCount);
    return sorted[0]?.todayLeadsCount > 0 ? sorted[0] : null;
  }, [agentPerformanceList]);

  // ISP Breakdown
  const ispDataBreakdown = useMemo(() => {
    const isps = [
      { name: "Contract", leads: contractLeads },
      { name: "Prepaid", leads: prepaidLeads },
      { name: "Telkom Business", leads: tbLeads },
      { name: "Attachments", leads: attachmentLeads },
      { name: "Free Trial", leads: freetrialLeads }
    ];
    const activeIsps = ispFilter ? isps.filter((i) => i.name === ispFilter) : isps;
    return activeIsps.map((isp) => {
      const ispName = isp.name;
      const realTimeList = isp.leads;
      const ispLogs = allMergedReports.filter((x) => x.isp === ispName);
      const ispMonthLogs = currentMonthUpdates.filter((x) => x.isp === ispName);
      const earnedComm = ispMonthLogs
        .filter((x) => x.adminConfirmation === "Confirmed")
        .reduce((s, i) => s + Number(i.commission || 0), 0);
      return {
        ispName,
        totalRealtimeCount: realTimeList.length,
        totalLogs: ispLogs.length,
        currentMonthLogs: ispMonthLogs.length,
        earnedComm,
        attachmentsList: realTimeList
      };
    });
  }, [allMergedReports, currentMonthUpdates, contractLeads, prepaidLeads, tbLeads, attachmentLeads, freetrialLeads, ispFilter]);

  // Export Spreadsheet
  const downloadExcelSpreadsheet = (filterAgentName: string = "") => {
    let datasetToExport = visibleLogs;
    if (filterAgentName) {
      datasetToExport = datasetToExport.filter((x) => x.agentName === filterAgentName);
    }
    if (datasetToExport.length === 0) {
      alert("No report logs found to export based on chosen parameters.");
      return;
    }
    const headers = [
      "Date Filed", "Log Record ID", "Agent Name", "Visit Type", "ISP Assigned",
      "Customer Name", "Phone Number", "Address", "Selected Package", "Price",
      "Commission (R)", "Admin Confirmation Status", "Comments"
    ];
    const csvRows = [headers.join(",")];
    datasetToExport.forEach((item) => {
      const values = [
        item.date || "", item.id || "", `"${item.agentName || ""}"`, `"${item.visitType || ""}"`,
        `"${item.isp || "None"}"`, `"${item.customerName || ""}"`, `"${item.phone || ""}"`,
        `"${item.address || ""}"`, `"${item.packagePlan || ""}"`, `"${item.price || ""}"`,
        `R ${item.commission || 0}`, `"${item.adminConfirmation || ""}"`,
        `"${(item.comments || "").replace(/\n/g, " ")}"`
      ];
      csvRows.push(values.join(","));
    });
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", encodedUri);
    downloadLink.setAttribute("download", `Field_Agents_Report_${selectedYear}_${ispFilter || "All_ISPs"}.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <Box sx={styles.page}>
      {/* TOP TICKER */}
      <Box sx={styles.topTickerContainer}>
        <motion.div
          animate={{ x: ["100%", "-100%"] }}
          transition={{ ease: "linear", duration: 20, repeat: Infinity }}
          style={styles.tickerContent as any}
        >
          🚀 FIELD AGENTS DASHBOARD • THE CONNECTION HUB • SOUTH AFRICA FIBRE DEPLOYMENT • DAILY TARGET: MINIMUM 2 LEADS PER AGENT 🚀
        </motion.div>
      </Box>

      {/* HEADER & TOP CONTROL SECTION */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Paper sx={styles.heroCard}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={3}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Chip label={`${selectedYear} The Connection Hub`} color="secondary" size="small" sx={{ fontWeight: 700, borderRadius: "6px" }} />
                <Typography sx={styles.livePulse}>● Live Network Active</Typography>
              </Stack>
              <Typography sx={styles.title}>
                Field <span style={{ color: "#2563eb", textShadow: "0 0 20px rgba(37,99,235,0.4)" }}>Agents</span> Dashboard
              </Typography>
              <Typography sx={styles.subtitle}>
                Overview for <b style={{ color: "#fff" }}>{currentMonthName} {selectedYear}</b> | Daily Target: <b>{DAILY_TARGET}+ Leads</b>
              </Typography>
              {activeAgentName && (
                <Chip
                  icon={<AccountCircle sx={{ color: "#38bdf8 !important" }} />}
                  label={`Active Agent: ${activeAgentName}`}
                  sx={{ mt: 1.5, backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)", fontWeight: "bold" }}
                />
              )}
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" spacing={2}>
              <Button
                variant="contained"
                startIcon={<Inventory2 />}
                onClick={() => setPackageModalOpen(true)}
                sx={{ backgroundColor: "#8b5cf6", "&:hover": { backgroundColor: "#7c3aed" }, fontWeight: "bold", textTransform: "none", borderRadius: "10px", py: 1 }}
              >
                View Packages & Commissions
              </Button>
              <Box sx={{ width: 130 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  sx={styles.input}
                  InputProps={{ startAdornment: <CalendarMonth sx={{ color: "#94a3b8", mr: 0.5, fontSize: 18 }} /> }}
                >
                  <MenuItem value={2024}>2024</MenuItem>
                  <MenuItem value={2025}>2025</MenuItem>
                  <MenuItem value={2026}>2026</MenuItem>
                  <MenuItem value={2027}>2027</MenuItem>
                </TextField>
              </Box>
              <Box sx={{ width: 220 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Filter by ISP"
                  value={ispFilter}
                  onChange={(e) => setIspFilter(e.target.value)}
                  sx={styles.input}
                >
                  <MenuItem value="">-- All Allowed ISPs --</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                  <MenuItem value="Prepaid">Prepaid</MenuItem>
                  <MenuItem value="Telkom Business">Telkom Business</MenuItem>
                  <MenuItem value="Attachments">Attachments</MenuItem>
                  <MenuItem value="Free Trial">Free Trial</MenuItem>
                </TextField>
              </Box>
              <Tooltip title={soundEnabled ? "Mute Sounds" : "Unmute Sounds"}>
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

      {/* HIGHLIGHT WINNERS BANNERS */}
      <Box sx={{ mt: 2 }}>
        {!highCommissionWinner && !highTargetAchiever ? (
          <Alert severity="info" sx={{ backgroundColor: "rgba(17, 24, 39, 0.7)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "14px" }}>
            There is no agent with approved commission or target metrics for this filter period.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ ...styles.heroCard, background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(31, 41, 55, 0.8) 100%)", borderColor: "#f59e0b" }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <EmojiEvents sx={{ fontSize: 40, color: "#f59e0b" }} />
                  <Box>
                    <Typography style={{ color: "#f59e0b", fontWeight: 800, fontSize: "0.95rem" }}>
                      👑 TOP COMMISSION WINNER ({selectedYear})
                    </Typography>
                    <Typography variant="h6" style={{ color: "#fff", fontWeight: 700 }}>
                      {highCommissionWinner ? `${highCommissionWinner.agentName} — R ${highCommissionWinner.earnedCommission.toFixed(2)}` : "No high commission winner"}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ ...styles.heroCard, background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(31, 41, 55, 0.8) 100%)", borderColor: "#10b981" }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <TrendingUp sx={{ fontSize: 40, color: "#10b981" }} />
                  <Box>
                    <Typography style={{ color: "#10b981", fontWeight: 800, fontSize: "0.95rem" }}>
                      🎯 TOP TARGET ACHIEVER
                    </Typography>
                    <Typography variant="h6" style={{ color: "#fff", fontWeight: 700 }}>
                      {highTargetAchiever ? `${highTargetAchiever.agentName} — ${highTargetAchiever.todayLeadsCount} Leads Today` : "No target achiever yet"}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* GLOBAL STATS TILES */}
      <Grid container spacing={2} mt={1}>
        {[
          { title: "Total Reports", value: totalReports, icon: <Description />, color: "#3b82f6" },
          { title: "Confirmed Sales", value: confirmedReports, icon: <CheckCircle />, color: "#10b981" },
          { title: "Pending Reports", value: pendingReports, icon: <HourglassEmpty />, color: "#f59e0b" },
          { title: "Rejected Logs", value: rejectedReports, icon: <Cancel />, color: "#ef4444" },
          { title: "Approved Commission", value: `R ${totalApprovedCommission.toFixed(2)}`, icon: <Payments />, color: "#06b6d4" }
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Paper sx={{ ...styles.statCard, borderLeft: `4px solid ${item.color}` }}>
              <Box sx={{ ...styles.statIcon, backgroundColor: `${item.color}15`, color: item.color }}>{item.icon}</Box>
              <Typography sx={styles.statValue}>{item.value}</Typography>
              <Typography sx={styles.statTitle}>{item.title}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* AGENT PERFORMANCE BAR CHART */}
      <Paper sx={{ ...styles.heroCard, mt: 4, p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <BarChartIcon sx={{ color: "#3b82f6" }} />
            <Typography variant="h6" fontWeight="bold" color="#fff">
              Agent Performance Chart: Targets vs Approved Commissions ({selectedYear})
            </Typography>
          </Box>
          <Chip label={`Filter Year: ${selectedYear}`} color="primary" variant="outlined" />
        </Box>
        <Box height={340} width="100%">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agentBarChartData} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="agentName" stroke="#94a3b8" angle={-15} textAnchor="end" />
              <YAxis stroke="#94a3b8" />
              <RechartsTooltip
                formatter={(val: any, name: any) => [name.includes("Commission") ? `R ${Number(val).toFixed(2)}` : val, name]}
                contentStyle={{ backgroundColor: "#0f172a", borderRadius: 8, color: "#fff", borderColor: "rgba(255,255,255,0.1)" }}
              />
              <Legend />
              <Bar dataKey="TotalTarget" fill="#64748b" radius={[4, 4, 0, 0]} name="Total Target (Leads)" />
              <Bar dataKey="CommissionEarned" fill="#10b981" radius={[4, 4, 0, 0]} name="Total Commission (R)" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* ALL AGENTS METRICS & TARGET BREAKDOWN TABLE */}
      <Typography sx={styles.sectionTitle}>
        <Leaderboard sx={{ verticalAlign: "middle", mr: 1, color: "#3b82f6" }} /> All Agents Target & Approved Commission Breakdown
      </Typography>
      <TableContainer component={Paper} sx={{ backgroundColor: "rgba(17, 24, 39, 0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px" }}>
        <Table>
          <TableHead sx={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
            <TableRow>
              <TableCell sx={{ color: "#94a3b8", fontWeight: "bold" }}>Agent Name</TableCell>
              <TableCell sx={{ color: "#94a3b8", fontWeight: "bold" }}>Today's Target ({DAILY_TARGET}+)</TableCell>
              <TableCell sx={{ color: "#94a3b8", fontWeight: "bold" }}>Total Reports</TableCell>
              <TableCell sx={{ color: "#94a3b8", fontWeight: "bold" }}>Approved</TableCell>
              <TableCell sx={{ color: "#94a3b8", fontWeight: "bold" }}>Pending</TableCell>
              <TableCell sx={{ color: "#94a3b8", fontWeight: "bold" }}>Rejected</TableCell>
              <TableCell sx={{ color: "#94a3b8", fontWeight: "bold" }}>Approved Commission (R)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agentPerformanceList.map((agent) => (
              <TableRow key={agent.agentName} sx={{ "&:hover": { backgroundColor: "rgba(255,255,255,0.03)" } }}>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>{agent.agentName}</TableCell>
                <TableCell>
                  {agent.reachedDailyTarget ? (
                    <Chip icon={<TaskAlt />} label={`${agent.todayLeadsCount}/${DAILY_TARGET} - Target Met ✅`} color="success" size="small" />
                  ) : (
                    <Chip label={`${agent.todayLeadsCount}/${DAILY_TARGET} - Pending ❌`} color="error" variant="outlined" size="small" />
                  )}
                </TableCell>
                <TableCell sx={{ color: "#cbd5e1" }}>{agent.totalReports}</TableCell>
                <TableCell sx={{ color: "#10b981", fontWeight: "bold" }}>{agent.confirmed}</TableCell>
                <TableCell sx={{ color: "#f59e0b" }}>{agent.pending}</TableCell>
                <TableCell sx={{ color: "#ef4444" }}>{agent.rejected}</TableCell>
                <TableCell sx={{ color: "#38bdf8", fontWeight: "bold" }}>R {agent.earnedCommission.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* EXCEL EXPORT SECTION */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" sx={{ mt: 5, mb: 2 }} spacing={2}>
        <Typography sx={{ ...styles.sectionTitle, mt: 0, mb: 0 }}>
          <FilterList sx={{ verticalAlign: "middle", mr: 1, color: "#3b82f6" }} /> Excel Reports Export
        </Typography>
      </Stack>
      <Paper sx={styles.formCard}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              fullWidth
              color="success"
              startIcon={<Download />}
              onClick={() => downloadExcelSpreadsheet()}
              sx={{ fontWeight: "bold", textTransform: "none", borderRadius: "10px", padding: "12px" }}
            >
              Export Spreadsheet ({selectedYear} - {ispFilter || "All Allowed ISPs"})
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Filter Export by Single Agent"
              value={excelAgentFilter}
              onChange={(e) => setExcelAgentFilter(e.target.value)}
              sx={styles.input}
            >
              <MenuItem value="">-- Clear Single Agent Filter --</MenuItem>
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
              Export Filtered Agent Spreadsheet
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* ISP REALTIME COUNTERS */}
      <Typography sx={styles.sectionTitle}>
        <Wifi sx={{ verticalAlign: "middle", mr: 1, color: "#3b82f6" }} /> ISP Real-time Database Leads Counters
      </Typography>
      <Grid container spacing={3}>
        {ispDataBreakdown.map((isp) => (
          <Grid item xs={12} md={6} key={isp.ispName}>
            <Card sx={{ backgroundColor: "rgba(17, 24, 39, 0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px" }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold" }}>
                    {isp.ispName}
                  </Typography>
                  <Chip label={`Realtime Leads: ${isp.totalRealtimeCount}`} color="primary" size="small" />
                </Stack>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>Monthly Field Reports</Typography>
                    <Typography variant="body1" sx={{ color: "#fff", fontWeight: "bold" }}>{isp.currentMonthLogs}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>Approved Comm.</Typography>
                    <Typography variant="body1" sx={{ color: "#38bdf8", fontWeight: "bold" }}>R {isp.earnedComm.toFixed(2)}</Typography>
                  </Grid>
                </Grid>
                <Accordion sx={{ backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", mt: 2, borderRadius: "8px !important" }}>
                  <AccordionSummary expandIcon={<ExpandMore sx={{ color: "#94a3b8" }} />}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AttachFile sx={{ fontSize: 18, color: "#38bdf8" }} />
                      <Typography variant="body2" sx={{ color: "#38bdf8", fontWeight: "bold" }}>
                        View {isp.ispName} Database Entries ({isp.attachmentsList.length})
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={1}>
                      {isp.attachmentsList.length === 0 ? (
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                          No realtime leads recorded under this table.
                        </Typography>
                      ) : (
                        isp.attachmentsList.map((item: any, idx: number) => (
                          <Stack key={item.id || idx} direction="row" justifyContent="space-between" alignItems="center" sx={{ backgroundColor: "rgba(255,255,255,0.05)", p: 1, borderRadius: "6px" }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <InsertDriveFile sx={{ color: "#94a3b8", fontSize: 18 }} />
                              <Typography variant="caption" sx={{ color: "#e2e8f0" }}>
                                {item.fileName || item.customerName || `Record #${item.id}`}
                              </Typography>
                            </Stack>
                            <Typography variant="caption" sx={{ color: "#64748b" }}>
                              {item.date || item.status || "Active"}
                            </Typography>
                          </Stack>
                        ))
                      )}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* LIVE REPORT LOGS LIST */}
      <Typography sx={styles.sectionTitle}>
        <Description sx={{ verticalAlign: "middle", mr: 1, color: "#3b82f6" }} /> Live Field Report Logs
      </Typography>
      <TextField
        fullWidth
        placeholder="Type to filter field updates instantly (agent name, customer, package, address, ISP network or status)..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        InputProps={{ startAdornment: <Search sx={{ color: "#94a3b8", mr: 1 }} /> }}
        sx={{ ...styles.input, marginBottom: "20px" }}
      />
      <Stack spacing={2} sx={{ pb: "80px" }}>
        {visibleLogs.length === 0 ? (
          <Paper sx={styles.noDataCard}>
            <Typography variant="body1" color="textSecondary">No field update logs match your search parameters.</Typography>
          </Paper>
        ) : (
          visibleLogs.map((log: any) => (
            <Paper key={`${log.sourceTable}_${log.id}`} sx={{ ...styles.formCard, borderLeft: log.visitType === "Unattended House" ? "4px solid #ef4444" : "4px solid #10b981" }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#fff" }}>{log.agentName}</Typography>
                  <Typography variant="caption" color="textSecondary">{log.date}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Chip size="small" label={log.visitType} color={log.visitType === "Unattended House" ? "error" : "success"} />
                    {log.isp && log.isp !== "None" && <Chip size="small" label={log.isp} color="secondary" variant="outlined" />}
                  </Stack>
                  <Typography variant="body2" sx={{ color: "#cbd5e1" }}><b>{log.customerName}</b> {log.surname}</Typography>
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>{log.address} ({log.phone})</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" sx={{ color: "#38bdf8" }}>Selected Package: <b>{log.packagePlan}</b></Typography>
                  <Typography variant="caption" sx={{ color: "#cbd5e1", display: "block" }}>
                    Price: <b>{typeof log.price === "number" ? `R${log.price}` : log.price}</b>
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#10b981", display: "block", fontWeight: "bold", mt: 0.5 }}>
                    Commission Rate: R {Number(log.commission || 0).toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3} alignSelf="center">
                  <Stack direction="column" alignItems={{ xs: "flex-start", md: "flex-end" }} spacing={1}>
                    <Chip
                      size="small"
                      label={log.adminConfirmation || "Pending"}
                      color={log.adminConfirmation === "Confirmed" ? "success" : log.adminConfirmation === "Rejected" ? "error" : "warning"}
                    />
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                      {log.adminConfirmation === "Confirmed" ? "Commission Unlocked" : "Awaiting Admin Action"}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          ))
        )}
      </Stack>

      {/* VIEW PACKAGE & COMMISSION STRUCTURE DIALOG */}
      <Dialog open={packageModalOpen} onClose={() => setPackageModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: "#0f172a", color: "#fff", fontWeight: "bold" }}>
          📦 Products, Packages & Commission Rate Card
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: "#0f172a", color: "#e2e8f0" }}>
          <Tabs
            value={modalTab}
            onChange={(_, val) => setModalTab(val)}
            textColor="secondary"
            indicatorColor="secondary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2 }}
          >
            <Tab label="A. Prepaid Fibre" />
            <Tab label="B. Postpaid FTTH" />
            <Tab label="C. Telkom LTE" />
            <Tab label="D. TB Fibre" />
            <Tab label="E. TB Voice & PABX" />
          </Tabs>
          {modalTab === 0 && (
            <TableContainer component={Paper} sx={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#38bdf8" }}>Package Plan</TableCell>
                    <TableCell sx={{ color: "#38bdf8" }}>Speed</TableCell>
                    <TableCell sx={{ color: "#38bdf8" }}>Price</TableCell>
                    <TableCell sx={{ color: "#38bdf8" }}>Commission (ZAR)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {PRODUCT_COMMISSIONS.prepaid.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ color: "#fff" }}>{item.package}</TableCell>
                      <TableCell sx={{ color: "#cbd5e1" }}>{item.speed}</TableCell>
                      <TableCell sx={{ color: "#cbd5e1" }}>R{item.price}</TableCell>
                      <TableCell sx={{ color: "#10b981", fontWeight: "bold" }}>R{item.commission}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {modalTab === 1 && (
            <TableContainer component={Paper} sx={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#38bdf8" }}>Package Plan</TableCell>
                    <TableCell sx={{ color: "#38bdf8" }}>Monthly Price</TableCell>
                    <TableCell sx={{ color: "#38bdf8" }}>Commission (ZAR)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {PRODUCT_COMMISSIONS.postpaid.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ color: "#fff" }}>{item.package}</TableCell>
                      <TableCell sx={{ color: "#cbd5e1" }}>R{item.price}</TableCell>
                      <TableCell sx={{ color: "#10b981", fontWeight: "bold" }}>R{item.commission}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {modalTab === 2 && (
            <TableContainer component={Paper} sx={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#38bdf8" }}>Package Plan</TableCell>
                    <TableCell sx={{ color: "#38bdf8" }}>Price</TableCell>
                    <TableCell sx={{ color: "#38bdf8" }}>Commission (ZAR)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {PRODUCT_COMMISSIONS.lte.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ color: "#fff" }}>{item.package}</TableCell>
                      <TableCell sx={{ color: "#cbd5e1" }}>R{item.price}</TableCell>
                      <TableCell sx={{ color: "#10b981", fontWeight: "bold" }}>R{item.commission}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {modalTab === 3 && (
            <TableContainer component={Paper} sx={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#38bdf8" }}>Package Plan</TableCell>
                    <TableCell sx={{ color: "#38bdf8" }}>Price</TableCell>
                    <TableCell sx={{ color: "#38bdf8" }}>Commission (ZAR)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {PRODUCT_COMMISSIONS.tbFibre.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ color: "#fff" }}>{item.package}</TableCell>
                      <TableCell sx={{ color: "#cbd5e1" }}>R{item.price}</TableCell>
                      <TableCell sx={{ color: "#10b981", fontWeight: "bold" }}>R{item.commission}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {modalTab === 4 && (
            <Stack spacing={2}>
              <Typography fontWeight="bold" color="#38bdf8">Telkom Business Voice</Typography>
              <TableContainer component={Paper} sx={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: "#38bdf8" }}>Package Plan</TableCell>
                      <TableCell sx={{ color: "#38bdf8" }}>Price</TableCell>
                      <TableCell sx={{ color: "#38bdf8" }}>Commission (ZAR)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {PRODUCT_COMMISSIONS.tbVoice.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ color: "#fff" }}>{item.package}</TableCell>
                        <TableCell sx={{ color: "#cbd5e1" }}>R{item.price}</TableCell>
                        <TableCell sx={{ color: "#10b981", fontWeight: "bold" }}>R{item.commission}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography fontWeight="bold" color="#38bdf8" sx={{ mt: 2 }}>TB PABX Options</Typography>
              <TableContainer component={Paper} sx={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: "#38bdf8" }}>Option</TableCell>
                      <TableCell sx={{ color: "#38bdf8" }}>Commission Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {PRODUCT_COMMISSIONS.tbPabx.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ color: "#fff" }}>{item.package}</TableCell>
                        <TableCell sx={{ color: "#10b981", fontWeight: "bold" }}>{item.commission}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#0f172a", p: 2 }}>
          <Button variant="contained" onClick={() => setPackageModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0b0f19",
    color: "#e2e8f0",
    padding: "24px",
    fontFamily: "'Inter', sans-serif"
  },
  topTickerContainer: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    backgroundColor: "rgba(37, 99, 235, 0.15)",
    border: "1px solid rgba(37, 99, 235, 0.3)",
    borderRadius: "8px",
    padding: "8px 16px",
    marginBottom: "20px"
  },
  tickerContent: {
    display: "inline-block",
    color: "#60a5fa",
    fontWeight: "bold",
    fontSize: "0.85rem"
  },
  heroCard: {
    padding: "28px",
    borderRadius: "18px",
    backgroundColor: "rgba(17, 24, 39, 0.75)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.08)"
  },
  livePulse: {
    color: "#10b981",
    fontSize: "0.8rem",
    fontWeight: "bold"
  },
  title: {
    fontSize: "2.2rem",
    fontWeight: 900,
    color: "#fff",
    letterSpacing: "-0.5px"
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "0.95rem",
    mt: 0.5
  },
  heroAvatar: {
    width: 64,
    height: 64,
    backgroundColor: "#2563eb",
    boxShadow: "0 0 20px rgba(37,99,235,0.5)"
  },
  statCard: {
    padding: "16px",
    borderRadius: "14px",
    backgroundColor: "rgba(17, 24, 39, 0.7)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.08)"
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px"
  },
  statValue: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#fff"
  },
  statTitle: {
    fontSize: "0.8rem",
    color: "#94a3b8"
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: 800,
    color: "#fff",
    marginTop: "32px",
    marginBottom: "16px"
  },
  formCard: {
    padding: "20px",
    borderRadius: "14px",
    backgroundColor: "rgba(17, 24, 39, 0.7)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.08)"
  },
  input: {
    "& .MuiOutlinedInput-root": {
      color: "#fff",
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      borderRadius: "10px",
      "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
      "&.Mui-focused fieldset": { borderColor: "#3b82f6" }
    },
    "& .MuiInputLabel-root": { color: "#94a3b8" },
    "& .MuiSvgIcon-root": { color: "#94a3b8" }
  },
  noDataCard: {
    padding: "32px",
    textAlign: "center" as const,
    backgroundColor: "rgba(17, 24, 39, 0.4)",
    borderRadius: "14px",
    border: "1px dashed rgba(255,255,255,0.1)"
  }
};

export default FieldUpdates;