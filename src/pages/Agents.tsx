import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Chip,
  Avatar,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  Stack,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  InputAdornment,
  Tooltip
} from "@mui/material";

import {
  Person,
  Search,
  Assignment,
  Paid,
  CheckCircle,
  Pending,
  Delete,
  Edit,
  Download,
  VolumeUp,
  NotificationsActive,
  FilterList,
  EmojiEvents,
  TrendingUp,
  AttachFile,
  ExpandMore,
  InsertDriveFile,
  TaskAlt,
  Inventory2,
  Engineering,
  Wifi,
  Leaderboard
} from "@mui/icons-material";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from "recharts";

import {
  ref,
  onValue,
  remove,
  update,
  push,
  set
} from "firebase/database";

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
const resolvePackageCommission = (packageName: string, saleType: string): number => {
  if (!packageName) {
    if (saleType === "Prepaid") return 50;
    if (saleType === "Contract") return 200;
    return 0;
  }
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
    return typeof match.commission === "number" ? match.commission : parseFloat(match.commission as string) || 0;
  }
  return saleType === "Contract" ? 200 : saleType === "Prepaid" ? 50 : 0;
};

const emptyAgent = {
  firstName: "",
  lastName: "",
  employeeNo: "",
  idNumber: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  province: "",
  position: "Sales Agent",
  department: "Field Sales",
  status: "Active",
  gender: "Male",
  monthlyTarget: 40,
  dateJoined: new Date().toISOString().split("T")[0],
  profileImage: "",
  notes: "",
  createdAt: new Date().toISOString()
};

const Agents = () => {
  // Database States
  const [agents, setAgents] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);

  // ISP Table Collections
  const [attachmentLeads, setAttachmentLeads] = useState<any[]>([]);
  const [prepaidLeads, setPrepaidLeads] = useState<any[]>([]);
  const [contractLeads, setContractLeads] = useState<any[]>([]);
  const [tbLeads, setTbLeads] = useState<any[]>([]);
  const [freetrialLeads, setfreetrialLeads] = useState<any[]>([]);

  // Filter States
  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [statusFilter] = useState("");
  const [ispFilter, setIspFilter] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Agent Form State
  const [agent, setAgent] = useState(emptyAgent);
  const [editingAgent, setEditingAgent] = useState<string | null>(null);

  // Modal Rate Card State
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState(0);

  // Export State
  const [excelAgentFilter, setExcelAgentFilter] = useState("");

  const isFirstLoad = useRef(true);
  const todayStr = new Date().toISOString().split("T")[0];

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const playNotificationSound = useCallback(() => {
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
      console.log("Audio play suppressed:", e);
    }
  }, [soundEnabled]);

  // Normalize disparate lead collections from Firebase
  const normalizeLeadRecord = useCallback(
    (key: string, raw: any, defaultIsp: string, sourceTable: string) => {
      const rawDate = raw.date || raw.submittedAt || raw.createdAt || todayStr;
      const dateFormatted = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;
      const customerName =
        raw.customerName ||
        [raw.firstNamesOrContactName, raw.surnameOrBusinessName].filter(Boolean).join(" ") ||
        "Unnamed Customer";
      const agentName = raw.agentName || raw.agentLogged || raw.agent || raw.fullName || "System Agent";
      
      let adminConfirmation = raw.adminConfirmation || raw.status || "Pending";
      if (raw.status === "Confirmed" || raw.status === "Approved") adminConfirmation = "Confirmed";
      if (raw.status === "Rejected" || raw.status === "Declined") adminConfirmation = "Rejected";

      const saleType = raw.saleType || defaultIsp;
      const packageName = raw.packagePlan || raw.packageSelected || raw.fibreDeal || raw.packageName || "Standard Package";
      const baseCommFromRateCard = resolvePackageCommission(packageName, saleType);
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
        saleType,
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
    },
    [todayStr]
  );

  // Real-time Database Subscriptions
  useEffect(() => {
    const unsubAgents = onValue(ref(db, "agents"), (snap) => {
      const data = snap.val();
      setAgents(data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) : []);
    });

    const unsubAttachments = onValue(ref(db, "attachmentFibreLeads"), (snap) => {
      const data = snap.val();
      setAttachmentLeads(data ? Object.keys(data).map((k) => normalizeLeadRecord(k, data[k], "Attachments", "attachmentFibreLeads")) : []);
    });

    const unsubPrepaid = onValue(ref(db, "fibreLeads"), (snap) => {
      const data = snap.val();
      setPrepaidLeads(data ? Object.keys(data).map((k) => normalizeLeadRecord(k, data[k], "Prepaid", "prepaidFibreLeads")) : []);
    });

    const unsubContract = onValue(ref(db, "contractFibreLeads"), (snap) => {
      const data = snap.val();
      setContractLeads(data ? Object.keys(data).map((k) => normalizeLeadRecord(k, data[k], "Contract", "contractFibreLeads")) : []);
    });

    const unsubTb = onValue(ref(db, "tbFibreLeads"), (snap) => {
      const data = snap.val();
      setTbLeads(data ? Object.keys(data).map((k) => normalizeLeadRecord(k, data[k], "Telkom Business", "tbFibreLeads")) : []);
    });

    const unsubFreetrial = onValue(ref(db, "freeTrialApplications"), (snap) => {
      const data = snap.val();
      setfreetrialLeads(data ? Object.keys(data).map((k) => normalizeLeadRecord(k, data[k], "Free Trial", "freetrial")) : []);
    });

    const unsubReports = onValue(ref(db, "fieldUpdates"), (snap) => {
      const data = snap.val();
      if (data) {
        const parsedList = Object.keys(data)
          .map((key) => normalizeLeadRecord(key, data[key], data[key].saleType || "General", "fieldUpdates"))
          .reverse();
        if (!isFirstLoad.current && parsedList.length > updates.length) {
          playNotificationSound();
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
      unsubFreetrial();
      unsubReports();
    };
  }, [normalizeLeadRecord, playNotificationSound, updates.length]);

  // Combine & Deduplicate all sub-collections
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

  // Apply Search and Multi-Select Filters
  const filteredReports = useMemo(() => {
    return allMergedReports.filter((item: any) => {
      const matchText = `${item.agentName} ${item.customerName} ${item.phone} ${item.address} ${item.packagePlan} ${item.saleType} ${item.adminConfirmation}`.toLowerCase();
      const matchesSearch = matchText.includes(search.toLowerCase());
      const matchesAgent = agentFilter === "" || item.agentName === agentFilter;
      const matchesStatus = statusFilter === "" || item.adminConfirmation === statusFilter;
      const matchesIsp = ispFilter === "" || item.isp === ispFilter || item.saleType === ispFilter;

      let matchesMonth = true;
      if (month !== "") {
        matchesMonth = new Date(item.date).getMonth() === Number(month);
      }

      let matchesYear = true;
      if (year !== "") {
        matchesYear = new Date(item.date).getFullYear() === Number(year);
      }

      return matchesSearch && matchesAgent && matchesStatus && matchesIsp && matchesMonth && matchesYear;
    });
  }, [allMergedReports, search, agentFilter, statusFilter, ispFilter, month, year]);

  // Summary Metrics
  const totalReports = filteredReports.length;
  const confirmedCustomers = filteredReports.filter((x) => x.adminConfirmation === "Confirmed").length;
  const pendingCustomers = filteredReports.filter((x) => x.adminConfirmation === "Pending").length;
  //const rejectedCustomers = filteredReports.filter((x) => x.adminConfirmation === "Rejected").length;

  const prepaidSales = filteredReports.filter((x) => x.saleType === "Prepaid" && x.adminConfirmation === "Confirmed").length;
  const contractSales = filteredReports.filter((x) => x.saleType === "Contract" && x.adminConfirmation === "Confirmed").length;
  const lteSales = filteredReports.filter((x) => (x.saleType === "LTE" || x.packagePlan?.includes("LTE")) && x.adminConfirmation === "Confirmed").length;

  const totalCommission = filteredReports
    .filter((x) => x.adminConfirmation === "Confirmed")
    .reduce((sum, item) => sum + Number(item.commission || 0), 0);

  const prepaidCommission = filteredReports
    .filter((x) => x.saleType === "Prepaid" && x.adminConfirmation === "Confirmed")
    .reduce((sum, item) => sum + Number(item.commission || 0), 0);

  const contractCommission = filteredReports
    .filter((x) => x.saleType === "Contract" && x.adminConfirmation === "Confirmed")
    .reduce((sum, item) => sum + Number(item.commission || 0), 0);

  // Per Agent Performance Breakdown
  const agentPerformance = useMemo(() => {
    const allAgentNames = new Set([
      ...agents.map((a) => a.fullName || a.name || `${a.firstName} ${a.lastName}`),
      ...filteredReports.map((u) => u.agentName).filter(Boolean)
    ]);

    return Array.from(allAgentNames).map((agentName) => {
      const reports = filteredReports.filter((x) => x.agentName === agentName);
      const confirmed = reports.filter((x) => x.adminConfirmation === "Confirmed");
      const pending = reports.filter((x) => x.adminConfirmation === "Pending").length;
      const rejected = reports.filter((x) => x.adminConfirmation === "Rejected").length;

      const prepaid = confirmed.filter((x) => x.saleType === "Prepaid").length;
      const contract = confirmed.filter((x) => x.saleType === "Contract").length;
      
      const prepaidComm = confirmed
        .filter((x) => x.saleType === "Prepaid")
        .reduce((sum, x) => sum + Number(x.commission || 0), 0);

      const contractComm = confirmed
        .filter((x) => x.saleType === "Contract")
        .reduce((sum, x) => sum + Number(x.commission || 0), 0);

      const comm = confirmed.reduce((sum, x) => sum + Number(x.commission || 0), 0);

      const todayLeadsCount = reports.filter((x) => x.date === todayStr).length;
      const reachedDailyTarget = todayLeadsCount >= DAILY_TARGET;

      const agentInfo = agents.find(
        (a) => (a.fullName || a.name || `${a.firstName} ${a.lastName}`) === agentName
      );

      return {
        agent: agentName,
        reports: reports.length,
        customers: confirmed.length,
        pending,
        rejected,
        prepaid,
        contract,
        prepaidCommission: prepaidComm,
        contractCommission: contractComm,
        commission: comm,
        todayLeadsCount,
        reachedDailyTarget,
        monthlyTarget: agentInfo?.monthlyTarget || 40,
        status: agentInfo?.status || "Active",
        lastSale: reports.length ? reports[0].date : "-"
      };
    });
  }, [agents, filteredReports, todayStr]);

  // Top Achiever Banners
  const highCommissionWinner = useMemo(() => {
    if (agentPerformance.length === 0) return null;
    const sorted = [...agentPerformance].sort((a, b) => b.commission - a.commission);
    return sorted[0]?.commission > 0 ? sorted[0] : null;
  }, [agentPerformance]);

  const highTargetAchiever = useMemo(() => {
    if (agentPerformance.length === 0) return null;
    const sorted = [...agentPerformance].sort((a, b) => b.todayLeadsCount - a.todayLeadsCount);
    return sorted[0]?.todayLeadsCount > 0 ? sorted[0] : null;
  }, [agentPerformance]);

  // Chart Data
  const chartData = useMemo(() => {
    return agentPerformance.map((a) => ({
      agent: a.agent,
      Reports: a.reports,
      Commission: a.commission,
      Target: a.monthlyTarget
    }));
  }, [agentPerformance]);

  // ISP Realtime Collections Breakdown
  const ispDataBreakdown = useMemo(() => {
    const isps = [
      { name: "Contract", leads: contractLeads },
      { name: "Prepaid", leads: prepaidLeads },
      { name: "Telkom Business", leads: tbLeads },
      { name: "Attachments", leads: attachmentLeads },
      { name: "Free Trial", leads: freetrialLeads }
    ];
    return isps.map((isp) => {
      const realTimeList = isp.leads;
      const ispLogs = filteredReports.filter((x) => x.isp === isp.name || x.saleType === isp.name);
      const earnedComm = ispLogs
        .filter((x) => x.adminConfirmation === "Confirmed")
        .reduce((s, i) => s + Number(i.commission || 0), 0);

      return {
        ispName: isp.name,
        totalRealtimeCount: realTimeList.length,
        totalLogs: ispLogs.length,
        earnedComm,
        attachmentsList: realTimeList
      };
    });
  }, [contractLeads, prepaidLeads, tbLeads, attachmentLeads, freetrialLeads, filteredReports]);

  // Save or Update Agent Profile
  const saveAgent = async () => {
    if (!agent.firstName || !agent.lastName) {
      alert("Please enter the agent's first and last name.");
      return;
    }

    const fullName = `${agent.firstName} ${agent.lastName}`;
    const data = {
      ...agent,
      name: fullName,
      fullName
    };

    if (editingAgent) {
      await update(ref(db, `agents/${editingAgent}`), data);
      setEditingAgent(null);
    } else {
      const newRef = push(ref(db, "agents"));
      await set(newRef, data);
    }

    setAgent(emptyAgent);
  };

  // Populate form for editing
  const editAgent = (item: any) => {
    setEditingAgent(item.id);
    setAgent({
      ...emptyAgent,
      ...item,
      firstName: item.firstName || item.name?.split(" ")[0] || "",
      lastName: item.lastName || item.name?.split(" ")[1] || ""
    });
  };

  // CSV Exporter
  const downloadExcelSpreadsheet = (filterAgentName: string = "") => {
    let datasetToExport = filteredReports;
    if (filterAgentName) {
      datasetToExport = datasetToExport.filter((x) => x.agentName === filterAgentName);
    }
    if (datasetToExport.length === 0) {
      alert("No report logs found to export based on selected filters.");
      return;
    }
    const headers = [
      "Date Filed", "Log Record ID", "Agent Name", "Visit Type", "ISP Network",
      "Customer Name", "Phone Number", "Address", "Selected Package", "Price",
      "Commission (R)", "Admin Confirmation Status", "Comments"
    ];
    const csvRows = [headers.join(",")];
    datasetToExport.forEach((item) => {
      const values = [
        item.date || "", item.id || "", `"${item.agentName || ""}"`, `"${item.visitType || ""}"`,
        `"${item.isp || item.saleType || "None"}"`, `"${item.customerName || ""}"`, `"${item.phone || ""}"`,
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
    downloadLink.setAttribute("download", `Field_Agents_Report_${year || "All"}_${month || "All"}.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Realtime Status Confirmation Update
  const handleUpdateStatus = (id: string, sourceTable: string, newStatus: string) => {
    const tablePath = sourceTable === "fieldUpdates" ? "fieldUpdates" : sourceTable;
    update(ref(db, `${tablePath}/${id}`), {
      adminConfirmation: newStatus,
      status: newStatus
    });
  };

  // Realtime Record Delete
  const handleDeleteRecord = (id: string, sourceTable: string) => {
    if (window.confirm("Are you sure you want to delete this customer record?")) {
      const tablePath = sourceTable === "fieldUpdates" ? "fieldUpdates" : sourceTable;
      remove(ref(db, `${tablePath}/${id}`));
    }
  };

  return (
    <Box sx={container}>
      {/* HEADER SECTION */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Paper sx={heroCard}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={3}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Chip label="Fibre Sales Master Admin" color="secondary" size="small" sx={{ fontWeight: 700 }} />
                <Typography sx={{ color: "#10b981", fontSize: "0.8rem", fontWeight: "bold" }}>● System Active</Typography>
              </Stack>
              <Typography variant="h3" fontWeight="900" color="white" mt={1}>
                👨‍💼 Field Agents & Commission Manager
              </Typography>
              <Typography sx={{ color: "#cbd5e1", mt: 0.5 }}>
                Monitor agent activities, sales goals, rate cards, commissions, and customer lead approvals.
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" spacing={2}>
              <Button
                variant="contained"
                startIcon={<Inventory2 />}
                onClick={() => setPackageModalOpen(true)}
                sx={{ backgroundColor: "#8b5cf6", "&:hover": { backgroundColor: "#7c3aed" }, fontWeight: "bold" }}
              >
                Package Rate Card
              </Button>
              <Tooltip title={soundEnabled ? "Mute Notifications" : "Enable Sound Notifications"}>
                <IconButton onClick={() => setSoundEnabled(!soundEnabled)} sx={{ color: soundEnabled ? "#10b981" : "#94a3b8", background: "rgba(255,255,255,0.05)" }}>
                  {soundEnabled ? <VolumeUp /> : <NotificationsActive color="disabled" />}
                </IconButton>
              </Tooltip>
              <Avatar sx={{ width: 56, height: 56, backgroundColor: "#2563eb", boxShadow: "0 0 20px rgba(37,99,235,0.5)" }}>
                <Engineering sx={{ fontSize: 32 }} />
              </Avatar>
            </Stack>
          </Stack>
        </Paper>
      </motion.div>

      {/* TOP ACHIEVERS BANNERS */}
      <Box sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ ...heroCard, background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(31, 41, 55, 0.8) 100%)", borderColor: "#f59e0b" }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <EmojiEvents sx={{ fontSize: 40, color: "#f59e0b" }} />
                <Box>
                  <Typography style={{ color: "#f59e0b", fontWeight: 800, fontSize: "0.95rem" }}>
                    👑 TOP COMMISSION WINNER
                  </Typography>
                  <Typography variant="h6" style={{ color: "#fff", fontWeight: 700 }}>
                    {highCommissionWinner ? `${highCommissionWinner.agent} — R ${highCommissionWinner.commission.toFixed(2)}` : "No winner yet"}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ ...heroCard, background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(31, 41, 55, 0.8) 100%)", borderColor: "#10b981" }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <TrendingUp sx={{ fontSize: 40, color: "#10b981" }} />
                <Box>
                  <Typography style={{ color: "#10b981", fontWeight: 800, fontSize: "0.95rem" }}>
                    🎯 TOP DAILY TARGET ACHIEVER
                  </Typography>
                  <Typography variant="h6" style={{ color: "#fff", fontWeight: 700 }}>
                    {highTargetAchiever ? `${highTargetAchiever.agent} — ${highTargetAchiever.todayLeadsCount} Leads Today` : "No target met today"}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* CONTROLS & FILTER BAR */}
      <Paper sx={{ p: 3, my: 3, borderRadius: 4, background: "rgba(255,255,255,0.95)" }}>
        <Typography variant="h6" fontWeight="bold" mb={2} color="#0f172a">
          🔍 Filter & Search Field Operations
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search customer, phone, address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Agent"
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
            >
              <MenuItem value="">All Agents</MenuItem>
              {agents.map((a) => {
                const name = a.fullName || a.name || `${a.firstName} ${a.lastName}`;
                return (
                  <MenuItem key={a.id} value={name}>
                    {name}
                  </MenuItem>
                );
              })}
            </TextField>
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="ISP / Product"
              value={ispFilter}
              onChange={(e) => setIspFilter(e.target.value)}
            >
              <MenuItem value="">All Products</MenuItem>
              <MenuItem value="Contract">Contract</MenuItem>
              <MenuItem value="Prepaid">Prepaid</MenuItem>
              <MenuItem value="Telkom Business">Telkom Business</MenuItem>
              <MenuItem value="Attachments">Attachments</MenuItem>
              <MenuItem value="Free Trial">Free Trial</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <MenuItem value="">All Months</MenuItem>
              {months.map((m, index) => (
                <MenuItem key={index} value={index}>
                  {m}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2026"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* METRIC STAT CARDS */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={statCard}>
            <Assignment color="primary" sx={{ fontSize: 32 }} />
            <Typography color="textSecondary">Total Reports</Typography>
            <Typography fontSize={28} fontWeight="bold">{totalReports}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={statCard}>
            <CheckCircle color="success" sx={{ fontSize: 32 }} />
            <Typography color="textSecondary">Confirmed Customers</Typography>
            <Typography fontSize={28} fontWeight="bold" color="#10b981">{confirmedCustomers}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={statCard}>
            <Pending color="warning" sx={{ fontSize: 32 }} />
            <Typography color="textSecondary">Pending Approvals</Typography>
            <Typography fontSize={28} fontWeight="bold" color="#f59e0b">{pendingCustomers}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={statCard}>
            <Paid color="success" sx={{ fontSize: 32 }} />
            <Typography color="textSecondary">Total Commission</Typography>
            <Typography fontSize={28} fontWeight="bold" color="#2563eb">
              R{totalCommission.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* SALES BREAKDOWN GRID */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={statCard}>
            <Typography fontWeight="bold">📦 Prepaid Sales</Typography>
            <Typography fontSize={28} fontWeight="bold">{prepaidSales}</Typography>
            <Chip color="success" label={`Commission R${prepaidCommission}`} />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={statCard}>
            <Typography fontWeight="bold">📑 Contract Sales</Typography>
            <Typography fontSize={28} fontWeight="bold">{contractSales}</Typography>
            <Chip color="primary" label={`Commission R${contractCommission}`} />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={statCard}>
            <Typography fontWeight="bold">📶 LTE / Business</Typography>
            <Typography fontSize={28} fontWeight="bold">{lteSales}</Typography>
            <Chip color="secondary" label="High Tier Commission" />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={statCard}>
            <Typography fontWeight="bold">💰 Total Payout Value</Typography>
            <Typography fontSize={28} fontWeight="bold" color="#10b981">
              R{totalCommission.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* CHARTS SECTION */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 4, height: "100%" }}>
            <Typography variant="h6" fontWeight="bold" mb={2} color="#0f172a">
              📊 Agent Target vs Earned Commission ({year || "2026"})
            </Typography>
            <Box height={320}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="agent" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="Reports" fill="#3b82f6" name="Reports Filed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Commission" fill="#10b981" name="Earned Commission (R)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 4, height: "100%" }}>
            <Typography variant="h6" fontWeight="bold" mb={2} color="#0f172a">
              📈 Sales Distribution
            </Typography>
            <Box height={280}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Prepaid", value: prepaidSales },
                      { name: "Contract", value: contractSales },
                      { name: "LTE / Other", value: lteSales }
                    ]}
                    dataKey="value"
                    outerRadius={90}
                    label
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#2563eb" />
                    <Cell fill="#a855f7" />
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* AGENT PERFORMANCE MATRIX TABLE */}
      <Paper sx={{ mt: 4, p: 3, borderRadius: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold" color="#0f172a">
            👨‍💼 Comprehensive Agent Performance Breakdown
          </Typography>
          <Chip icon={<Leaderboard />} label={`Total Managed Agents: ${agents.length}`} color="primary" />
        </Stack>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Agent Name</b></TableCell>
                <TableCell align="center"><b>Today Target ({DAILY_TARGET}+)</b></TableCell>
                <TableCell align="center"><b>Total Reports</b></TableCell>
                <TableCell align="center"><b>Confirmed</b></TableCell>
                <TableCell align="center"><b>Pending</b></TableCell>
                <TableCell align="center"><b>Prepaid Comm.</b></TableCell>
                <TableCell align="center"><b>Contract Comm.</b></TableCell>
                <TableCell align="center"><b>Total Earned</b></TableCell>
                <TableCell align="center"><b>Last Activity</b></TableCell>
                <TableCell align="center"><b>Status</b></TableCell>
                <TableCell align="center"><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agentPerformance.map((item) => {
                const dbAgent = agents.find(
                  (a) => (a.fullName || a.name || `${a.firstName} ${a.lastName}`) === item.agent
                );

                return (
                  <TableRow key={item.agent} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ bgcolor: "#2563eb" }}>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography fontWeight="bold">{item.agent}</Typography>
                          <Typography variant="caption" color="textSecondary">{dbAgent?.position || "Sales Agent"}</Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell align="center">
                      {item.reachedDailyTarget ? (
                        <Chip icon={<TaskAlt />} label={`${item.todayLeadsCount}/${DAILY_TARGET} Done`} color="success" size="small" />
                      ) : (
                        <Chip label={`${item.todayLeadsCount}/${DAILY_TARGET} Pending`} color="error" variant="outlined" size="small" />
                      )}
                    </TableCell>

                    <TableCell align="center">{item.reports}</TableCell>
                    <TableCell align="center" sx={{ color: "#10b981", fontWeight: "bold" }}>{item.customers}</TableCell>
                    <TableCell align="center" sx={{ color: "#f59e0b" }}>{item.pending}</TableCell>
                    <TableCell align="center">R{item.prepaidCommission}</TableCell>
                    <TableCell align="center">R{item.contractCommission}</TableCell>
                    <TableCell align="center">
                      <Typography fontWeight="bold" color="#2563eb">
                        R{item.commission.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{item.lastSale}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={dbAgent?.status || item.status}
                        color={dbAgent?.status === "Active" ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {dbAgent && (
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton color="primary" size="small" onClick={() => editAgent(dbAgent)}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => {
                              if (window.confirm(`Delete agent ${dbAgent.fullName}?`)) {
                                remove(ref(db, `agents/${dbAgent.id}`));
                              }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* CREATE / EDIT AGENT PROFILE FORM */}
      <Paper sx={formCard}>
        <Typography variant="h6" fontWeight="bold" color="#0f172a">
          {editingAgent ? "✏️ Edit Agent Profile" : "👤 Create & Register New Agent"}
        </Typography>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="First Name" value={agent.firstName} onChange={(e) => setAgent({ ...agent, firstName: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Last Name" value={agent.lastName} onChange={(e) => setAgent({ ...agent, lastName: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Employee Number" value={agent.employeeNo} onChange={(e) => setAgent({ ...agent, employeeNo: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="ID Number" value={agent.idNumber} onChange={(e) => setAgent({ ...agent, idNumber: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Phone Number" value={agent.phone} onChange={(e) => setAgent({ ...agent, phone: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Email" value={agent.email} onChange={(e) => setAgent({ ...agent, email: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Address" value={agent.address} onChange={(e) => setAgent({ ...agent, address: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="City" value={agent.city} onChange={(e) => setAgent({ ...agent, city: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Province" value={agent.province} onChange={(e) => setAgent({ ...agent, province: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField select fullWidth label="Gender" value={agent.gender} onChange={(e) => setAgent({ ...agent, gender: e.target.value })}>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField select fullWidth label="Position" value={agent.position} onChange={(e) => setAgent({ ...agent, position: e.target.value })}>
              <MenuItem value="Sales Agent">Sales Agent</MenuItem>
              <MenuItem value="Team Leader">Team Leader</MenuItem>
              <MenuItem value="Supervisor">Supervisor</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField type="date" fullWidth InputLabelProps={{ shrink: true }} label="Date Joined" value={agent.dateJoined} onChange={(e) => setAgent({ ...agent, dateJoined: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField select fullWidth label="Status" value={agent.status} onChange={(e) => setAgent({ ...agent, status: e.target.value })}>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
              <MenuItem value="Suspended">Suspended</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField type="number" fullWidth label="Monthly Target Goal" value={agent.monthlyTarget} onChange={(e) => setAgent({ ...agent, monthlyTarget: Number(e.target.value) })} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline rows={2} label="Notes" value={agent.notes} onChange={(e) => setAgent({ ...agent, notes: e.target.value })} />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" size="large" onClick={saveAgent} sx={{ backgroundColor: "#2563eb" }}>
                {editingAgent ? "Update Agent Profile" : "Save New Agent"}
              </Button>
              {editingAgent && (
                <Button variant="outlined" size="large" onClick={() => { setEditingAgent(null); setAgent(emptyAgent); }}>
                  Cancel
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* EXCEL REPORT EXPORT SECTION */}
      <Paper sx={{ p: 3, my: 4, borderRadius: 4, background: "rgba(255,255,255,0.95)" }}>
        <Typography variant="h6" fontWeight="bold" mb={2} color="#0f172a">
          <FilterList sx={{ verticalAlign: "middle", mr: 1, color: "#2563eb" }} /> Excel Payroll & Sales Reports Export
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              fullWidth
              color="success"
              startIcon={<Download />}
              onClick={() => downloadExcelSpreadsheet()}
              sx={{ py: 1.5, fontWeight: "bold" }}
            >
              Export Filtered Dataset CSV
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Select Agent for Individual Export"
              value={excelAgentFilter}
              onChange={(e) => setExcelAgentFilter(e.target.value)}
            >
              <MenuItem value="">-- Clear Agent Filter --</MenuItem>
              {agents.map((a) => {
                const label = a.fullName || a.name || `${a.firstName} ${a.lastName}`;
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
              sx={{ py: 1.5, fontWeight: "bold", backgroundColor: "#2563eb" }}
            >
              Export Single Agent Statement
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* ISP REALTIME LEAD DROPDOWNS */}
      <Typography variant="h6" fontWeight="bold" color="white" mt={4} mb={2}>
        <Wifi sx={{ verticalAlign: "middle", mr: 1, color: "#38bdf8" }} /> Realtime Database Lead Tables Inspection
      </Typography>
      <Grid container spacing={3}>
        {ispDataBreakdown.map((isp) => (
          <Grid item xs={12} md={6} key={isp.ispName}>
            <Card sx={{ backgroundColor: "rgba(17, 24, 39, 0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px" }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold" }}>
                    {isp.ispName}
                  </Typography>
                  <Chip label={`Live Records: ${isp.totalRealtimeCount}`} color="primary" size="small" />
                </Stack>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>Total Reports</Typography>
                    <Typography variant="body1" sx={{ color: "#fff", fontWeight: "bold" }}>{isp.totalLogs}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>Approved Comm.</Typography>
                    <Typography variant="body1" sx={{ color: "#38bdf8", fontWeight: "bold" }}>R {isp.earnedComm.toFixed(2)}</Typography>
                  </Grid>
                </Grid>
                <Accordion sx={{ backgroundColor: "rgba(0,0,0,0.3)", color: "#fff", mt: 2, borderRadius: "8px !important" }}>
                  <AccordionSummary expandIcon={<ExpandMore sx={{ color: "#94a3b8" }} />}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AttachFile sx={{ fontSize: 18, color: "#38bdf8" }} />
                      <Typography variant="body2" sx={{ color: "#38bdf8", fontWeight: "bold" }}>
                        Inspect {isp.ispName} Database Entries ({isp.attachmentsList.length})
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={1}>
                      {isp.attachmentsList.length === 0 ? (
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                          No realtime leads under this collection.
                        </Typography>
                      ) : (
                        isp.attachmentsList.map((item: any, idx: number) => (
                          <Stack key={item.id || idx} direction="row" justifyContent="space-between" alignItems="center" sx={{ backgroundColor: "rgba(255,255,255,0.05)", p: 1, borderRadius: "6px" }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <InsertDriveFile sx={{ color: "#94a3b8", fontSize: 18 }} />
                              <Typography variant="caption" sx={{ color: "#e2e8f0" }}>
                                {item.customerName} ({item.phone})
                              </Typography>
                            </Stack>
                            <Chip size="small" label={item.adminConfirmation || "Pending"} color={item.adminConfirmation === "Confirmed" ? "success" : "warning"} />
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

      {/* CUSTOMER LEAD MANAGEMENT TABLE */}
      <Paper sx={{ mt: 4, p: 3, borderRadius: 4 }}>
        <Typography variant="h6" fontWeight="bold" mb={2} color="#0f172a">
          👥 Admin Customer Approval & Lead Management
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Customer</b></TableCell>
                <TableCell><b>Agent</b></TableCell>
                <TableCell><b>Type</b></TableCell>
                <TableCell><b>Package Plan</b></TableCell>
                <TableCell><b>Date</b></TableCell>
                <TableCell><b>Commission</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell align="center"><b>Admin Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReports.map((customer: any) => (
                <TableRow key={`${customer.sourceTable}_${customer.id}`} hover>
                  <TableCell>
                    <b>{customer.customerName} {customer.surname}</b>
                    <br />
                    <Typography variant="caption" color="textSecondary">{customer.phone} | {customer.address}</Typography>
                  </TableCell>
                  <TableCell>{customer.agentName}</TableCell>
                  <TableCell>
                    <Chip
                      label={customer.saleType}
                      color={customer.saleType === "Contract" ? "primary" : "success"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{customer.packagePlan}</TableCell>
                  <TableCell>{customer.date}</TableCell>
                  <TableCell>
                    <b>R{customer.commission}</b>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={customer.adminConfirmation}
                      color={
                        customer.adminConfirmation === "Confirmed"
                          ? "success"
                          : customer.adminConfirmation === "Rejected"
                          ? "error"
                          : "warning"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleUpdateStatus(customer.id, customer.sourceTable, "Confirmed")}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => handleUpdateStatus(customer.id, customer.sourceTable, "Rejected")}
                      >
                        Reject
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleDeleteRecord(customer.id, customer.sourceTable)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* PACKAGE RATE CARD MODAL */}
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

export default Agents;

/* =========================
          STYLES
========================= */

const container = {
  minHeight: "100vh",
  p: 4,
  background: "linear-gradient(135deg,#0f172a,#1e3a8a,#0ea5e9)"
};

const heroCard = {
  padding: "28px",
  borderRadius: "18px",
  backgroundColor: "rgba(17, 24, 39, 0.75)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255, 255, 255, 0.08)"
};

const statCard = {
  p: 3,
  borderRadius: 3,
  background: "rgba(255,255,255,0.95)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 1,
  boxShadow: "0 10px 25px rgba(0,0,0,.15)"
};

const formCard = {
  p: 4,
  mt: 4,
  borderRadius: 4,
  background: "rgba(255,255,255,.97)",
  boxShadow: "0 10px 25px rgba(0,0,0,.15)"
};