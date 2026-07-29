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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  Select,
  Menu,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import {
  Payments,
  Wifi,
  Engineering,
  Description,
  Leaderboard,
  Download,
  Search,
  NotificationsActive,
  VolumeUp,
  FilterList,
  AccountCircle,
  TrendingUp,
  EmojiEvents,
  TaskAlt,
  BarChart as BarChartIcon,
  CalendarMonth,
  Inventory2,
  Home,
  Assignment,
  Send,
  LocationOff,
  PhoneCallback,
  ZoomIn,
  ZoomOut,
  RestartAlt,
  Close,
  HowToReg,
  ThumbUpAlt,
  Verified,
  Sync,
  ErrorOutline,
  Cancel,
  PauseCircle,
  LocalShipping,
  Handshake,
  PriceCheck,
  RemoveCircleOutline,
  ViewColumn,
  Clear
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
import { ref, onValue, push, set, update } from "firebase/database";
import { db } from "../firebase";
import FieldUpdatesContract from "./FieldUpdatesContract";

const DAILY_TARGET = 2; // Required target of at least 2 leads per day

// ALL PRODUCTS & COMMISSIONS TABLE REFERENCE DATA
const PRODUCT_COMMISSIONS = {
  prepaid: [
    { package: "Telkom Prepaid Fibre 20/10 Mbps", speed: "20/10 Mbps", price: 349, commission: 50 },
    { package: "Telkom Prepaid Fibre 25/25 Mbps", speed: "25/25 Mbps", price: 499, commission: 50 },
    { package: "Telkom Prepaid Fibre 50/25 Mbps", speed: "700/25 Mbps", price: 700, commission: 50 }
  ],
  postpaid: [
    { package: "Easy 20/10 Mbps", price: 345, commission: 200 },
    { package: "Easy 40/20 Mbps", price: 425, commission: 200 },
    { package: "Core/Stream 25/25 Mbps", price: 499, commission: 200 },
    { package: "Core/Stream 30/30 Mbps", price: 350, commission: 350 },
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

const ALL_STATUS_OPTIONS = [
  "Activated/Completed",
  "Alternative offer",
  "Approved",
  "Cancelled",
  "Declined",
  "Deposit",
  "Dropped",
  "error",
  "Pending",
  "Pre-order",
  "Referred",
  "Submitted for processing",
  "Attended",
  "Contacted",
  "Signed Up"
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

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
    return typeof match.commission === "number" ? match.commission : parseFloat(match.commission as string) || 0;
  }
  return 0;
};

const FieldUpdates = () => {
  const [updates, setUpdates] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);

  // ISP Table Collections
  const [prepaidLeads, setPrepaidLeads] = useState<any[]>([]);
  const [contractLeads, setContractLeads] = useState<any[]>([]);
  const [tbLeads, setTbLeads] = useState<any[]>([]);
  const [freetrialLeads, setfreetrialLeads] = useState<any[]>([]);

  // Session Agent
  const activeAgentName = sessionStorage.getItem("activeAgentName") || "";

  // Filter States
  const [ispFilter, setIspFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [unattendedSearchText, setUnattendedSearchText] = useState("");
  const [excelAgentFilter, setExcelAgentFilter] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | "ALL">(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | "ALL">("ALL");
  const [selectedSpecificDate, setSelectedSpecificDate] = useState<string>("");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Status Columns Custom Menu Selector
  const [columnMenuAnchorEl, setColumnMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [visibleStatusCols, setVisibleStatusCols] = useState<Record<string, boolean>>({
    "Activated/Completed": true,
    "Approved": true,
    "Pending": true,
    "Cancelled": true,
    "Contacted": false,
    "Signed Up": false,
    "Alternative offer": false,
    "Declined": false,
    "Deposit": false,
    "Dropped": false,
    "error": false,
    "Pre-order": false,
    "Referred": false,
    "Submitted for processing": false
  });

  // Modal & Dialog States
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState(0);
  const [applyView, setApplyView] = useState<"attended" | "unattended" | null>(null);
  const [formZoomLevel, setFormZoomLevel] = useState<number>(100);

  // Unattended Form State
  const [unattendedForm, setUnattendedForm] = useState({
    name: "",
    surname: "",
    contactNumber: "",
    email: "",
    address: "",
    status: "Attended",
    comments: "",
    needsCallback: false,
    callbackDate: ""
  });

  const isFirstLoad = useRef(true);
  const todayStr = new Date().toISOString().split("T")[0];

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

  const toggleStatusCol = (statusKey: string) => {
    setVisibleStatusCols((prev) => ({
      ...prev,
      [statusKey]: !prev[statusKey]
    }));
  };

  const handleUpdateStatus = async (item: any, newStatus: string) => {
    try {
      const itemRef = ref(db, `${item.sourceTable}/${item.id}`);
      await update(itemRef, {
        status: newStatus,
        adminConfirmation: newStatus
      });
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleUnattendedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unattendedForm.address) {
      alert("Please fill in the Address.");
      return;
    }

    try {
      const fullCustomerName = [unattendedForm.name, unattendedForm.surname].filter(Boolean).join(" ") || "Unattended Resident";

      const payload = {
        agentName: activeAgentName || "System Agent",
        visitType: "Unattended House",
        name: unattendedForm.name,
        surname: unattendedForm.surname,
        customerName: fullCustomerName,
        phone: unattendedForm.contactNumber,
        email: unattendedForm.email,
        address: unattendedForm.address,
        comments: unattendedForm.comments,
        status: unattendedForm.status || "Attended",
        adminConfirmation: unattendedForm.status || "Attended",
        needsCallback: unattendedForm.needsCallback,
        callbackDate: unattendedForm.callbackDate,
        submittedAt: new Date().toISOString(),
        date: todayStr
      };

      await set(push(ref(db, "fieldUpdates")), payload);
      alert("Unattended Lead captured successfully!");
      setUnattendedForm({
        name: "",
        surname: "",
        contactNumber: "",
        email: "",
        address: "",
        status: "Attended",
        comments: "",
        needsCallback: false,
        callbackDate: ""
      });
      setApplyView(null);
    } catch (err: any) {
      alert("Error logging unattended lead: " + err.message);
    }
  };

  const normalizeLeadRecord = useCallback(
    (key: string, raw: any, defaultIsp: string, sourceTable: string) => {
      const rawDate = raw.date || raw.submittedAt || raw.createdAt || todayStr;
      const dateFormatted = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;
      const customerName =
        raw.customerName || [raw.name || raw.firstNamesOrContactName, raw.surname || raw.surnameOrBusinessName].filter(Boolean).join(" ") || "Unnamed Customer";
      const agentName = raw.agentName || raw.agentLogged || raw.agent || "System Agent";

      let adminConfirmation = raw.adminConfirmation || raw.status || "Attended";
      if (raw.status === "Confirmed" || raw.status === "Approved") adminConfirmation = "Approved";
      if (raw.status === "Completed") adminConfirmation = "Activated/Completed";
      if (raw.status === "Rejected" || raw.status === "Declined") adminConfirmation = "Declined";

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
        name: raw.name || "",
        surname: raw.surname || "",
        idNumber: raw.idNumber || "",
        phone: raw.phone || raw.contactNumber || raw.contactNo || "-",
        email: raw.email || "-",
        address: raw.address || raw.installationAddress || "-",
        saleType: raw.saleType || defaultIsp,
        packagePlan: packageName,
        price: raw.price || "-",
        commission: calculatedCommission,
        baseCommission: baseCommFromRateCard,
        adminConfirmation,
        status: adminConfirmation,
        comments: raw.comments || raw.additionalComments || raw.notes || "",
        needsCallback: raw.needsCallback || false,
        callbackDate: raw.callbackDate || "",
        isp: raw.isp || raw.assignedFibreISP || defaultIsp
      };
    },
    [todayStr]
  );

  useEffect(() => {
    const agentsRef = ref(db, "agents");
    const unsubAgents = onValue(agentsRef, (snapshot) => {
      const data = snapshot.val();
      setAgents(data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) : []);
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
      unsubPrepaid();
      unsubContract();
      unsubTb();
      unsubReports();
      unsubFreetrial();
    };
  }, [normalizeLeadRecord, playNewClientSound, updates.length]);

  const allMergedReports = useMemo(() => {
    const combined = [...updates, ...contractLeads, ...prepaidLeads, ...tbLeads, ...freetrialLeads];
    const uniqueMap = new Map();
    combined.forEach((item) => {
      const uniqueKey = `${item.sourceTable}_${item.id}`;
      if (!uniqueMap.has(uniqueKey)) {
        uniqueMap.set(uniqueKey, item);
      }
    });
    return Array.from(uniqueMap.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [updates, contractLeads, prepaidLeads, tbLeads, freetrialLeads]);

  const dateFilteredReports = useMemo(() => {
    return allMergedReports.filter((item: any) => {
      if (!item.date) return false;
      const recordDate = new Date(item.date);

      if (selectedSpecificDate) {
        return item.date === selectedSpecificDate;
      }
      if (selectedYear !== "ALL") {
        if (recordDate.getFullYear() !== selectedYear) return false;
      }
      if (selectedMonth !== "ALL") {
        if (recordDate.getMonth() !== selectedMonth) return false;
      }
      return true;
    });
  }, [allMergedReports, selectedYear, selectedMonth, selectedSpecificDate]);

  const unattendedLogs = useMemo(() => {
    return dateFilteredReports.filter((item: any) => item.visitType === "Unattended House");
  }, [dateFilteredReports]);

  const filteredUnattendedLogs = useMemo(() => {
    return unattendedLogs.filter((item: any) => {
      const matchText = `${item.agentName} ${item.customerName} ${item.phone} ${item.email} ${item.address} ${item.comments} ${item.status}`.toLowerCase();
      return matchText.includes(unattendedSearchText.toLowerCase());
    });
  }, [unattendedLogs, unattendedSearchText]);

  const visibleLogs = useMemo(() => {
    return dateFilteredReports.filter((item: any) => {
      if (ispFilter && item.isp !== ispFilter) return false;
      const matchText = `${item.agentName} ${item.customerName} ${item.phone} ${item.email} ${item.address} ${item.status} ${item.visitType} ${item.saleType} ${item.packagePlan} ${item.comments || ""} ${item.isp || ""}`.toLowerCase();
      return matchText.includes(searchText.toLowerCase());
    });
  }, [dateFilteredReports, searchText, ispFilter]);

  const totalReports = visibleLogs.length;

  const getStatusCount = useCallback((statusName: string) => {
    return visibleLogs.filter((x) => x.adminConfirmation === statusName || x.status === statusName).length;
  }, [visibleLogs]);

  const activatedCompletedCount = useMemo(() => {
    return visibleLogs.filter((x) => ["Activated/Completed", "Completed"].includes(x.adminConfirmation) || ["Activated/Completed", "Completed"].includes(x.status)).length;
  }, [visibleLogs]);

  const approvedCount = useMemo(() => {
    return visibleLogs.filter((x) => ["Approved", "Confirmed"].includes(x.adminConfirmation) || ["Approved", "Confirmed"].includes(x.status)).length;
  }, [visibleLogs]);

  const totalCommissionVal = useMemo(() => {
    return visibleLogs
      .filter((x) => ["Confirmed", "Completed", "Approved", "Activated/Completed"].includes(x.adminConfirmation))
      .reduce((acc, current) => acc + Number(current.commission || 0), 0);
  }, [visibleLogs]);

  const agentPerformanceList = useMemo(() => {
    const allAgentNames = new Set([
      ...agents.map((a) => a.fullName || a.id),
      ...allMergedReports.map((u) => u.agentName).filter(Boolean)
    ]);
    return Array.from(allAgentNames).map((agentName) => {
      const agentLogs = visibleLogs.filter((x) => x.agentName === agentName);
      const agentAllYearLogs = dateFilteredReports.filter((x) => x.agentName === agentName);
      const todayLeadsCount = agentAllYearLogs.filter((x) => x.date === todayStr).length;
      const reachedDailyTarget = todayLeadsCount >= DAILY_TARGET;
      const confirmed = agentLogs.filter((x) => ["Confirmed", "Completed", "Approved", "Activated/Completed"].includes(x.adminConfirmation)).length;
      const pending = agentLogs.filter((x) => ["Pending", "Attended", "Contacted", "Signed Up", "Follow Up", "Submitted for processing", "Pre-order"].includes(x.adminConfirmation)).length;
      const rejected = agentLogs.filter((x) => ["Rejected", "Declined", "Cancelled", "Dropped", "error", "Not Interested"].includes(x.adminConfirmation)).length;

      const statusCounts: Record<string, number> = {};
      ALL_STATUS_OPTIONS.forEach((st) => {
        statusCounts[st] = agentLogs.filter((x) => x.adminConfirmation === st || x.status === st).length;
      });

      const earnedCommission = agentLogs
        .filter((x) => ["Confirmed", "Completed", "Approved", "Activated/Completed"].includes(x.adminConfirmation))
        .reduce((sum, item) => sum + Number(item.commission || 0), 0);

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
        monthlyTarget,
        statusCounts
      };
    });
  }, [agents, allMergedReports, dateFilteredReports, visibleLogs, todayStr]);

  const agentBarChartData = useMemo(() => {
    return agentPerformanceList.map((agent) => ({
      agentName: agent.agentName,
      TotalTarget: agent.totalReports,
      CommissionEarned: agent.earnedCommission
    }));
  }, [agentPerformanceList]);

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

  const ispDataBreakdown = useMemo(() => {
    const isps = [
      { name: "Contract", leads: contractLeads },
      { name: "Prepaid", leads: prepaidLeads },
      { name: "Telkom Business", leads: tbLeads },
      { name: "Free Trial", leads: freetrialLeads }
    ];
    const activeIsps = ispFilter ? isps.filter((i) => i.name === ispFilter) : isps;
    return activeIsps.map((isp) => {
      const ispName = isp.name;
      const realTimeList = isp.leads;
      const ispLogs = allMergedReports.filter((x) => x.isp === ispName);
      const ispMonthLogs = dateFilteredReports.filter((x) => x.isp === ispName);
      const earnedComm = ispMonthLogs
        .filter((x) => ["Confirmed", "Completed", "Approved", "Activated/Completed"].includes(x.adminConfirmation))
        .reduce((s, i) => s + Number(i.commission || 0), 0);
      return {
        ispName,
        totalRealtimeCount: realTimeList.length,
        totalLogs: ispLogs.length,
        currentMonthLogs: ispMonthLogs.length,
        earnedComm
      };
    });
  }, [allMergedReports, dateFilteredReports, contractLeads, prepaidLeads, tbLeads, freetrialLeads, ispFilter]);

  const getStatusChipColor = (statusText: string) => {
    switch (statusText) {
      case "Confirmed":
      case "Approved":
      case "Activated/Completed":
      case "Completed":
        return "success";
      case "Signed Up":
      case "Attended":
      case "Deposit":
        return "info";
      case "Contacted":
      case "Follow Up":
      case "Alternative offer":
      case "Pre-order":
      case "Referred":
      case "Submitted for processing":
      case "Pending":
        return "warning";
      case "Rejected":
      case "Declined":
      case "Cancelled":
      case "Dropped":
      case "error":
      case "Not Interested":
      case "No Elderly People":
      case "Already Signed Up":
        return "error";
      default:
        return "default";
    }
  };

  const statusCardsConfig = useMemo(() => [
    { title: "Total Applications", value: totalReports, icon: <Description />, color: "#2563eb" },
    { title: "Contacted", value: getStatusCount("Contacted"), icon: <PhoneCallback />, color: "#d97706" },
    { title: "Signed Up", value: getStatusCount("Signed Up"), icon: <HowToReg />, color: "#0284c7" },
    { title: "Approved", value: approvedCount, icon: <ThumbUpAlt />, color: "#059669" },
    { title: "Activated/Completed", value: activatedCompletedCount, icon: <Verified />, color: "#10b981" },
    { title: "Alternative offer", value: getStatusCount("Alternative offer"), icon: <Handshake />, color: "#8b5cf6" },
    { title: "Cancelled", value: getStatusCount("Cancelled"), icon: <Cancel />, color: "#ef4444" },
    { title: "Declined", value: getStatusCount("Declined"), icon: <RemoveCircleOutline />, color: "#dc2626" },
    { title: "Deposit", value: getStatusCount("Deposit"), icon: <PriceCheck />, color: "#06b6d4" },
    { title: "Dropped", value: getStatusCount("Dropped"), icon: <PauseCircle />, color: "#64748b" },
    { title: "error", value: getStatusCount("error"), icon: <ErrorOutline />, color: "#b91c1c" },
    { title: "Pending", value: getStatusCount("Pending"), icon: <Sync />, color: "#f59e0b" },
    { title: "Pre-order", value: getStatusCount("Pre-order"), icon: <LocalShipping />, color: "#3b82f6" },
    { title: "Referred", value: getStatusCount("Referred"), icon: <AccountCircle />, color: "#6366f1" },
    { title: "Submitted for processing", value: getStatusCount("Submitted for processing"), icon: <Assignment />, color: "#0284c7" },
    { title: "Total Commission", value: `R ${totalCommissionVal.toFixed(2)}`, icon: <Payments />, color: "#8b5cf6" }
  ], [totalReports, getStatusCount, approvedCount, activatedCompletedCount, totalCommissionVal]);

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
      "Customer Name", "Phone Number", "Email", "Address", "Selected Package", "Price",
      "Commission (R)", "Status", "Needs Follow-up Date", "Additional Comments"
    ];
    const csvRows = [headers.join(",")];
    datasetToExport.forEach((item) => {
      const values = [
        item.date || "", item.id || "", `"${item.agentName || ""}"`, `"${item.visitType || ""}"`,
        `"${item.isp || "None"}"`, `"${item.customerName || ""}"`, `"${item.phone || ""}"`,
        `"${item.email || ""}"`, `"${item.address || ""}"`, `"${item.packagePlan || ""}"`,
        `"${item.price || ""}"`, `R ${item.commission || 0}`, `"${item.adminConfirmation || ""}"`,
        `"${item.needsCallback ? item.callbackDate || "Yes" : "No"}"`,
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
                <Chip label={`The Connection Hub`} color="secondary" size="small" sx={{ fontWeight: 700, borderRadius: "6px" }} />
                <Typography sx={styles.livePulse}>● Live Network Active</Typography>
              </Stack>
              <Typography sx={styles.title}>
                Field <span style={{ color: "#2563eb" }}>Agents</span> Dashboard
              </Typography>
              <Typography sx={styles.subtitle}>
                Overview for <b>{selectedSpecificDate ? `Date: ${selectedSpecificDate}` : `${selectedMonth === "ALL" ? "All Months" : MONTH_NAMES[selectedMonth]} ${selectedYear === "ALL" ? "(All Years)" : selectedYear}`}</b> | Daily Target: <b>{DAILY_TARGET}+ Approvals per Agent/day</b>
              </Typography>
              {activeAgentName && (
                <Chip
                  icon={<AccountCircle sx={{ color: "#0284c7 !important" }} />}
                  label={`Active Agent: ${activeAgentName}`}
                  sx={{ mt: 1.5, backgroundColor: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd", fontWeight: "bold" }}
                />
              )}
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" spacing={2} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<Assignment />}
                onClick={() => setApplyView("attended")}
                sx={{ backgroundColor: "#2563eb", "&:hover": { backgroundColor: "#1d4ed8" }, fontWeight: "bold", textTransform: "none", borderRadius: "10px", py: 1 }}
              >
                Sales Submissions
              </Button>

              <Button
                variant="contained"
                startIcon={<Home />}
                onClick={() => setApplyView("unattended")}
                sx={{ backgroundColor: "#dc2626", "&:hover": { backgroundColor: "#b91c1c" }, fontWeight: "bold", textTransform: "none", borderRadius: "10px", py: 1 }}
              >
                Capture Lead
              </Button>

              <Button
                variant="contained"
                startIcon={<Inventory2 />}
                onClick={() => setPackageModalOpen(true)}
                sx={{ backgroundColor: "#8b5cf6", "&:hover": { backgroundColor: "#7c3aed" }, fontWeight: "bold", textTransform: "none", borderRadius: "10px", py: 1 }}
              >
                View Packages & Commissions
              </Button>

              <Tooltip title={soundEnabled ? "Mute Sounds" : "Unmute Sounds"}>
                <IconButton onClick={() => setSoundEnabled(!soundEnabled)} sx={{ color: soundEnabled ? "#059669" : "#64748b", backgroundColor: "#f1f5f9" }}>
                  {soundEnabled ? <VolumeUp /> : <NotificationsActive color="disabled" />}
                </IconButton>
              </Tooltip>
              <Avatar sx={styles.heroAvatar}>
                <Engineering sx={{ fontSize: 38, color: "#fff" }} />
              </Avatar>
            </Stack>
          </Stack>

          {/* DATE & FILTER CONTROL BAR */}
          <Paper variant="outlined" sx={{ mt: 3, p: 2, borderRadius: "12px", backgroundColor: "#f8fafc" }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={2.5}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Filter by Year"
                  value={selectedYear}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedYear(val === "ALL" ? "ALL" : Number(val));
                  }}
                  sx={styles.input}
                  InputProps={{ startAdornment: <CalendarMonth sx={{ color: "#64748b", mr: 0.5, fontSize: 18 }} /> }}
                >
                  <MenuItem value="ALL">All Years</MenuItem>
                  <MenuItem value={2023}>2023</MenuItem>
                  <MenuItem value={2024}>2024</MenuItem>
                  <MenuItem value={2025}>2025</MenuItem>
                  <MenuItem value={2026}>2026</MenuItem>
                  <MenuItem value={2027}>2027</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={2.5}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Filter by Month"
                  value={selectedMonth}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedMonth(val === "ALL" ? "ALL" : Number(val));
                  }}
                  sx={styles.input}
                >
                  <MenuItem value="ALL">All Months</MenuItem>
                  {MONTH_NAMES.map((name, idx) => (
                    <MenuItem key={idx} value={idx}>{name}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={3.5}>
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  label="Specific Date Filter"
                  InputLabelProps={{ shrink: true }}
                  value={selectedSpecificDate}
                  onChange={(e) => setSelectedSpecificDate(e.target.value)}
                  sx={styles.input}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3.5}>
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
                  <MenuItem value="Free Trial">Free Trial</MenuItem>
                </TextField>
              </Grid>
              {selectedSpecificDate && (
                <Grid item xs={12} alignSelf="flex-end">
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Clear />}
                    onClick={() => setSelectedSpecificDate("")}
                    sx={{ textTransform: "none", fontWeight: "bold" }}
                  >
                    Clear Specific Date Filter
                  </Button>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Paper>
      </motion.div>

      {/* HIGHLIGHT WINNERS BANNERS */}
      <Box sx={{ mt: 2 }}>
        {!highCommissionWinner && !highTargetAchiever ? (
          <Alert severity="info" sx={{ backgroundColor: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd", borderRadius: "14px" }}>
            There is no agent with approved commission or target metrics for this filter period.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ ...styles.heroCard, background: "#fffbebf5", borderColor: "#f59e0b" }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <EmojiEvents sx={{ fontSize: 40, color: "#d97706" }} />
                  <Box>
                    <Typography style={{ color: "#d97706", fontWeight: 800, fontSize: "0.95rem" }}>
                      👑 TOP COMMISSION WINNER ({selectedYear})
                    </Typography>
                    <Typography variant="h6" style={{ color: "#0f172a", fontWeight: 700 }}>
                      {highCommissionWinner ? `${highCommissionWinner.agentName} — R ${highCommissionWinner.earnedCommission.toFixed(2)}` : "No high commission winner"}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ ...styles.heroCard, background: "#ecfdf5f5", borderColor: "#10b981" }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <TrendingUp sx={{ fontSize: 40, color: "#059669" }} />
                  <Box>
                    <Typography style={{ color: "#059669", fontWeight: 800, fontSize: "0.95rem" }}>
                      🎯 TOP TARGET ACHIEVER
                    </Typography>
                    <Typography variant="h6" style={{ color: "#0f172a", fontWeight: 700 }}>
                      {highTargetAchiever ? `${highTargetAchiever.agentName} — ${highTargetAchiever.todayLeadsCount} Leads Today` : "No target achiever yet"}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* GLOBAL STATUS TILES */}
      <Grid container spacing={2} mt={1}>
        {statusCardsConfig.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} lg={2} key={index}>
            <Paper sx={{ ...styles.statCard, borderLeft: `4px solid ${item.color}` }}>
              <Box sx={{ ...styles.statIcon, backgroundColor: `${item.color}15`, color: item.color }}>{item.icon}</Box>
              <Typography sx={styles.statValue}>{item.value}</Typography>
              <Typography sx={styles.statTitle}>{item.title}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* BAR CHART */}
      <Paper sx={{ ...styles.heroCard, mt: 4, p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <BarChartIcon sx={{ color: "#2563eb" }} />
            <Typography variant="h6" fontWeight="bold" color="#0f172a">
              Agent Performance Chart: Targets vs Approved Commissions ({selectedYear})
            </Typography>
          </Box>
          <Chip label={`Filter Year: ${selectedYear}`} color="primary" variant="outlined" />
        </Box>
        <Box height={340} width="100%">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agentBarChartData} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="agentName" stroke="#64748b" angle={-15} textAnchor="end" />
              <YAxis stroke="#64748b" />
              <RechartsTooltip
                formatter={(val: any, name: any) => [name.includes("Commission") ? `R ${Number(val).toFixed(2)}` : val, name]}
                contentStyle={{ backgroundColor: "#ffffff", borderRadius: 8, color: "#0f172a", borderColor: "#cbd5e1" }}
              />
              <Legend />
              <Bar dataKey="TotalTarget" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Total Target (Leads)" />
              <Bar dataKey="CommissionEarned" fill="#10b981" radius={[4, 4, 0, 0]} name="Total Commission (R)" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* AGENTS BREAKDOWN TABLE */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" sx={{ mt: 4, mb: 1 }}>
        <Typography sx={styles.sectionTitle}>
          <Leaderboard sx={{ verticalAlign: "middle", mr: 1, color: "#2563eb" }} /> All Agents Target & Approved Commission Breakdown
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ViewColumn />}
          onClick={(e) => setColumnMenuAnchorEl(e.currentTarget)}
          sx={{ fontWeight: "bold", textTransform: "none", borderRadius: "8px" }}
        >
          Select Custom Status Columns
        </Button>
      </Stack>

      <Menu
        anchorEl={columnMenuAnchorEl}
        open={Boolean(columnMenuAnchorEl)}
        onClose={() => setColumnMenuAnchorEl(null)}
      >
        <MenuItem disabled sx={{ fontWeight: "bold", opacity: 1 }}>
          Toggle Status Columns to View:
        </MenuItem>
        {ALL_STATUS_OPTIONS.map((st) => (
          <MenuItem key={st} onClick={() => toggleStatusCol(st)}>
            <ListItemIcon>
              <Checkbox checked={!!visibleStatusCols[st]} size="small" />
            </ListItemIcon>
            <ListItemText primary={st} />
          </MenuItem>
        ))}
      </Menu>

      <TableContainer component={Paper} sx={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px" }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ color: "#475569", fontWeight: "bold" }}>Agent Name</TableCell>
              <TableCell sx={{ color: "#475569", fontWeight: "bold" }}>Today's Target ({DAILY_TARGET}+)</TableCell>
              <TableCell sx={{ color: "#475569", fontWeight: "bold" }}>Total Reports</TableCell>
              <TableCell sx={{ color: "#475569", fontWeight: "bold" }}>Activated / Approved</TableCell>
              <TableCell sx={{ color: "#475569", fontWeight: "bold" }}>Pending / In Progress</TableCell>
              <TableCell sx={{ color: "#475569", fontWeight: "bold" }}>Rejected / Cancelled</TableCell>

              {ALL_STATUS_OPTIONS.filter((st) => visibleStatusCols[st]).map((st) => (
                <TableCell key={st} sx={{ color: "#475569", fontWeight: "bold" }}>{st}</TableCell>
              ))}

              <TableCell sx={{ color: "#475569", fontWeight: "bold" }}>Approved Commission (R)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agentPerformanceList.map((agent) => (
              <TableRow key={agent.agentName} sx={{ "&:hover": { backgroundColor: "#f1f5f9" } }}>
                <TableCell sx={{ color: "#0f172a", fontWeight: "bold" }}>{agent.agentName}</TableCell>
                <TableCell>
                  {agent.reachedDailyTarget ? (
                    <Chip icon={<TaskAlt />} label={`${agent.todayLeadsCount}/${DAILY_TARGET} - Target Met ✅`} color="success" size="small" />
                  ) : (
                    <Chip label={`${agent.todayLeadsCount}/${DAILY_TARGET} - Pending ❌`} color="error" variant="outlined" size="small" />
                  )}
                </TableCell>
                <TableCell sx={{ color: "#334155" }}>{agent.totalReports}</TableCell>
                <TableCell sx={{ color: "#059669", fontWeight: "bold" }}>{agent.confirmed}</TableCell>
                <TableCell sx={{ color: "#d97706" }}>{agent.pending}</TableCell>
                <TableCell sx={{ color: "#dc2626" }}>{agent.rejected}</TableCell>

                {ALL_STATUS_OPTIONS.filter((st) => visibleStatusCols[st]).map((st) => (
                  <TableCell key={st} sx={{ color: "#334155", fontWeight: "500" }}>
                    {agent.statusCounts[st] || 0}
                  </TableCell>
                ))}

                <TableCell sx={{ color: "#0284c7", fontWeight: "bold" }}>R {agent.earnedCommission.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* UNATTENDED ADDRESSES SECTION */}
      <Typography sx={styles.sectionTitle}>
        <LocationOff sx={{ verticalAlign: "middle", mr: 1, color: "#dc2626" }} /> Logged Unattended Premises & Leads
      </Typography>
      <Paper sx={{ ...styles.formCard, mb: 4, borderTop: "4px solid #dc2626" }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2} mb={2}>
          <Box>
            <Typography variant="h6" fontWeight="bold" color="#0f172a">
              Logged Unattended Premises & Leads ({unattendedLogs.length})
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Locations visited or captured leads awaiting follow-ups. You can edit the status directly.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Home />}
            onClick={() => setApplyView("unattended")}
            sx={{ fontWeight: "bold", textTransform: "none", borderRadius: "8px" }}
          >
            + Capture Lead (Unattended)
          </Button>
        </Stack>

        <TextField
          fullWidth
          size="small"
          placeholder="Filter unattended leads by agent, customer name, phone, email, address, status or additional comments..."
          value={unattendedSearchText}
          onChange={(e) => setUnattendedSearchText(e.target.value)}
          InputProps={{ startAdornment: <Search sx={{ color: "#64748b", mr: 1 }} /> }}
          sx={{ ...styles.input, mb: 2 }}
        />

        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: "10px" }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "#fef2f2" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", color: "#991b1b" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#991b1b" }}>Agent</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#991b1b" }}>Contact Info</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#991b1b" }}>Address</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#991b1b" }}>Additional Comments</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#991b1b" }}>Follow-up Reminder</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#991b1b" }}>Edit Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUnattendedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3, color: "#64748b" }}>
                    No unattended address leads match your current search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUnattendedLogs.map((item) => (
                  <TableRow key={`${item.sourceTable}_${item.id}`} hover>
                    <TableCell sx={{ fontSize: "0.85rem", color: "#334155" }}>{item.date}</TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "0.85rem", color: "#0f172a" }}>{item.agentName}</TableCell>
                    <TableCell sx={{ fontSize: "0.85rem", color: "#334155" }}>
                      <div><b>{item.customerName}</b></div>
                      <div style={{ color: "#64748b", fontSize: "0.75rem" }}>📞 {item.phone || "-"}</div>
                      <div style={{ color: "#64748b", fontSize: "0.75rem" }}>✉️ {item.email || "-"}</div>
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.85rem", color: "#334155" }}>{item.address}</TableCell>
                    <TableCell sx={{ fontSize: "0.85rem", color: "#475569" }}>{item.comments || "No additional comments"}</TableCell>
                    <TableCell sx={{ fontSize: "0.85rem" }}>
                      {item.needsCallback ? (
                        <Chip
                          icon={<PhoneCallback sx={{ fontSize: "14px !important" }} />}
                          size="small"
                          color="warning"
                          label={item.callbackDate ? `Call on ${item.callbackDate}` : "Callback Required"}
                        />
                      ) : (
                        <span style={{ color: "#94a3b8" }}>No reminder set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={item.adminConfirmation || "Attended"}
                        onChange={(e) => handleUpdateStatus(item, e.target.value)}
                        sx={{
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          height: "32px",
                          borderRadius: "6px"
                        }}
                      >
                        {ALL_STATUS_OPTIONS.map((st) => (
                          <MenuItem key={st} value={st}>{st}</MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* EXCEL EXPORT SECTION */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" sx={{ mt: 5, mb: 2 }} spacing={2}>
        <Typography sx={{ ...styles.sectionTitle, mt: 0, mb: 0 }}>
          <FilterList sx={{ verticalAlign: "middle", mr: 1, color: "#2563eb" }} /> Excel Reports Export
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
              sx={{ fontWeight: "bold", textTransform: "none", borderRadius: "10px", padding: "12px", backgroundColor: "#2563eb" }}
            >
              Export Filtered Agent Spreadsheet
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* ISP REALTIME COUNTERS */}
      <Typography sx={styles.sectionTitle}>
        <Wifi sx={{ verticalAlign: "middle", mr: 1, color: "#2563eb" }} /> ISP Real-time Database Leads Counters
      </Typography>
      <Grid container spacing={3}>
        {ispDataBreakdown.map((isp) => (
          <Grid item xs={12} md={6} key={isp.ispName}>
            <Card sx={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" sx={{ color: "#0f172a", fontWeight: "bold" }}>
                    {isp.ispName}
                  </Typography>
                  <Chip label={`Realtime Leads: ${isp.totalRealtimeCount}`} color="primary" size="small" />
                </Stack>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>Monthly Field Reports</Typography>
                    <Typography variant="body1" sx={{ color: "#0f172a", fontWeight: "bold" }}>{isp.currentMonthLogs}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>Approved Comm.</Typography>
                    <Typography variant="body1" sx={{ color: "#0284c7", fontWeight: "bold" }}>R {isp.earnedComm.toFixed(2)}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* LIVE REPORT LOGS LIST */}
      <Typography sx={styles.sectionTitle}>
        <Description sx={{ verticalAlign: "middle", mr: 1, color: "#2563eb" }} /> Live Field Report Logs & Details
      </Typography>
      <TextField
        fullWidth
        placeholder="Type to filter field updates instantly (agent name, customer, package, address, status)..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        InputProps={{ startAdornment: <Search sx={{ color: "#64748b", mr: 1 }} /> }}
        sx={{ ...styles.input, marginBottom: "20px" }}
      />
      <Stack spacing={2} sx={{ pb: "80px" }}>
        {visibleLogs.length === 0 ? (
          <Paper sx={styles.noDataCard}>
            <Typography variant="body1" color="textSecondary">No field update logs match your search parameters.</Typography>
          </Paper>
        ) : (
          visibleLogs.map((log: any) => (
            <Paper key={`${log.sourceTable}_${log.id}`} sx={{ ...styles.formCard, borderLeft: log.visitType === "Unattended House" ? "4px solid #dc2626" : "4px solid #10b981" }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#0f172a" }}>{log.agentName}</Typography>
                  <Typography variant="caption" color="textSecondary">{log.date}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Chip size="small" label={log.visitType} color={log.visitType === "Unattended House" ? "error" : "success"} />
                    {log.isp && log.isp !== "None" && <Chip size="small" label={log.isp} color="secondary" variant="outlined" />}
                  </Stack>
                  <Typography variant="body2" sx={{ color: "#334155" }}><b>{log.customerName}</b></Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>📍 {log.address}</Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>📞 {log.phone} | ✉️ {log.email}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" sx={{ color: "#0284c7" }}>Selected Package: <b>{log.packagePlan}</b></Typography>
                  <Typography variant="caption" sx={{ color: "#334155", display: "block" }}>
                    Price: <b>{typeof log.price === "number" ? `R${log.price}` : log.price}</b>
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#059669", display: "block", fontWeight: "bold", mt: 0.5 }}>
                    Commission Rate: R {Number(log.commission || 0).toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3} alignSelf="center">
                  <Stack direction="column" alignItems={{ xs: "flex-start", md: "flex-end" }} spacing={1}>
                    <Chip
                      size="small"
                      label={log.adminConfirmation || "Attended"}
                      color={getStatusChipColor(log.adminConfirmation)}
                    />

                    {log.comments && (
                      <Typography variant="caption" sx={{ color: "#475569", fontStyle: "italic", textAlign: { md: "right" } }}>
                        💬 "{log.comments}"
                      </Typography>
                    )}

                    {log.needsCallback && (
                      <Chip
                        icon={<PhoneCallback sx={{ fontSize: "14px !important" }} />}
                        size="small"
                        color="warning"
                        variant="outlined"
                        label={log.callbackDate ? `Contact back: ${log.callbackDate}` : "Needs Callback"}
                      />
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          ))
        )}
      </Stack>

      {/* APPLY HERE / CAPTURE LEAD DIALOG */}
      <Dialog open={Boolean(applyView)} onClose={() => setApplyView(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: "#ffffff", color: "#0f172a", fontWeight: "bold", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight="bold">
              {applyView === "unattended" ? "🏠 Log / Capture Unattended Address Lead" : "📋 Application Forms & Submissions"}
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            {applyView === "attended" && (
              <>
                <Tooltip title="Zoom Out">
                  <IconButton size="small" onClick={() => setFormZoomLevel((prev) => Math.max(prev - 10, 50))}>
                    <ZoomOut fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Typography variant="caption" sx={{ fontWeight: "bold", color: "#64748b", minWidth: 40, textAlign: "center" }}>
                  {formZoomLevel}%
                </Typography>
                <Tooltip title="Zoom In">
                  <IconButton size="small" onClick={() => setFormZoomLevel((prev) => Math.min(prev + 10, 150))}>
                    <ZoomIn fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reset Zoom">
                  <IconButton size="small" onClick={() => setFormZoomLevel(100)}>
                    <RestartAlt fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <IconButton onClick={() => setApplyView(null)} size="small" sx={{ color: "#64748b" }}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: "#ffffff", color: "#0f172a", overflowX: "auto" }}>
          {applyView === "unattended" && (
            <form onSubmit={handleUnattendedSubmit}>
              <Alert severity="info" sx={{ mb: 2, borderRadius: "10px" }}>
                Optionally fill in personal details. <b>Address</b> is the only mandatory requirement.
              </Alert>

              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name (Optional)"
                    value={unattendedForm.name}
                    onChange={(e) => setUnattendedForm({ ...unattendedForm, name: e.target.value })}
                    sx={styles.input}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Surname (Optional)"
                    value={unattendedForm.surname}
                    onChange={(e) => setUnattendedForm({ ...unattendedForm, surname: e.target.value })}
                    sx={styles.input}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Number (Optional)"
                    value={unattendedForm.contactNumber}
                    onChange={(e) => setUnattendedForm({ ...unattendedForm, contactNumber: e.target.value })}
                    sx={styles.input}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email Address (Optional)"
                    value={unattendedForm.email}
                    onChange={(e) => setUnattendedForm({ ...unattendedForm, email: e.target.value })}
                    sx={styles.input}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Address / Street Name"
                    value={unattendedForm.address}
                    onChange={(e) => setUnattendedForm({ ...unattendedForm, address: e.target.value })}
                    sx={styles.input}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Lead Status"
                    value={unattendedForm.status}
                    onChange={(e) => setUnattendedForm({ ...unattendedForm, status: e.target.value })}
                    sx={styles.input}
                  >
                    {ALL_STATUS_OPTIONS.map((st) => (
                      <MenuItem key={st} value={st}>{st}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Additional Comments / Info"
                    value={unattendedForm.comments}
                    onChange={(e) => setUnattendedForm({ ...unattendedForm, comments: e.target.value })}
                    sx={styles.input}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={unattendedForm.needsCallback}
                        onChange={(e) => setUnattendedForm({ ...unattendedForm, needsCallback: e.target.checked })}
                        color="primary"
                      />
                    }
                    label="Set Reminder to Contact Back"
                  />
                </Grid>
                {unattendedForm.needsCallback && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Contact Back Date"
                      InputLabelProps={{ shrink: true }}
                      value={unattendedForm.callbackDate}
                      onChange={(e) => setUnattendedForm({ ...unattendedForm, callbackDate: e.target.value })}
                      sx={styles.input}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    startIcon={<Send />}
                    sx={{ backgroundColor: "#dc2626", "&:hover": { backgroundColor: "#b91c1c" }, fontWeight: "bold", textTransform: "none", py: 1.5, borderRadius: "10px" }}
                  >
                    Submit Captured Lead
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}

          {applyView === "attended" && (
            <Box style={{ zoom: `${formZoomLevel}%`, transformOrigin: "top left" }}>
              <Stack spacing={3}>
                <FieldUpdatesContract />
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#ffffff", p: 2 }}>
          <Button variant="contained" color="secondary" onClick={() => setApplyView(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* PACKAGE CATALOG DIALOG */}
      <Dialog open={packageModalOpen} onClose={() => setPackageModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: "#ffffff", color: "#0f172a", fontWeight: "bold" }}>
          📦 Products, Packages & Commission Rate Card
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: "#ffffff", color: "#0f172a" }}>
          <Tabs
            value={modalTab}
            onChange={(_, val) => setModalTab(val)}
            textColor="primary"
            indicatorColor="primary"
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
            <TableContainer component={Paper} sx={{ backgroundColor: "#f8fafc" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#0284c7" }}>Package Plan</TableCell>
                    <TableCell sx={{ color: "#0284c7" }}>Speed</TableCell>
                    <TableCell sx={{ color: "#0284c7" }}>Price</TableCell>
                    <TableCell sx={{ color: "#0284c7" }}>Commission (ZAR)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {PRODUCT_COMMISSIONS.prepaid.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ color: "#0f172a" }}>{item.package}</TableCell>
                      <TableCell sx={{ color: "#334155" }}>{item.speed}</TableCell>
                      <TableCell sx={{ color: "#334155" }}>R{item.price}</TableCell>
                      <TableCell sx={{ color: "#059669", fontWeight: "bold" }}>R{item.commission}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {modalTab === 1 && (
            <TableContainer component={Paper} sx={{ backgroundColor: "#f8fafc" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#0284c7" }}>Package Plan</TableCell>
                    <TableCell sx={{ color: "#0284c7" }}>Monthly Price</TableCell>
                    <TableCell sx={{ color: "#0284c7" }}>Commission (ZAR)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {PRODUCT_COMMISSIONS.postpaid.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ color: "#0f172a" }}>{item.package}</TableCell>
                      <TableCell sx={{ color: "#334155" }}>R{item.price}</TableCell>
                      <TableCell sx={{ color: "#059669", fontWeight: "bold" }}>R{item.commission}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {modalTab === 2 && (
            <TableContainer component={Paper} sx={{ backgroundColor: "#f8fafc" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#0284c7" }}>Package Plan</TableCell>
                    <TableCell sx={{ color: "#0284c7" }}>Price</TableCell>
                    <TableCell sx={{ color: "#0284c7" }}>Commission (ZAR)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {PRODUCT_COMMISSIONS.lte.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ color: "#0f172a" }}>{item.package}</TableCell>
                      <TableCell sx={{ color: "#334155" }}>R{item.price}</TableCell>
                      <TableCell sx={{ color: "#059669", fontWeight: "bold" }}>R{item.commission}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {modalTab === 3 && (
            <TableContainer component={Paper} sx={{ backgroundColor: "#f8fafc" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#0284c7" }}>Package Plan</TableCell>
                    <TableCell sx={{ color: "#0284c7" }}>Price</TableCell>
                    <TableCell sx={{ color: "#0284c7" }}>Commission (ZAR)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {PRODUCT_COMMISSIONS.tbFibre.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ color: "#0f172a" }}>{item.package}</TableCell>
                      <TableCell sx={{ color: "#334155" }}>R{item.price}</TableCell>
                      <TableCell sx={{ color: "#059669", fontWeight: "bold" }}>R{item.commission}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {modalTab === 4 && (
            <Stack spacing={2}>
              <Typography fontWeight="bold" color="#0284c7">Telkom Business Voice</Typography>
              <TableContainer component={Paper} sx={{ backgroundColor: "#f8fafc" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: "#0284c7" }}>Package Plan</TableCell>
                      <TableCell sx={{ color: "#0284c7" }}>Price</TableCell>
                      <TableCell sx={{ color: "#0284c7" }}>Commission (ZAR)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {PRODUCT_COMMISSIONS.tbVoice.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ color: "#0f172a" }}>{item.package}</TableCell>
                        <TableCell sx={{ color: "#334155" }}>R{item.price}</TableCell>
                        <TableCell sx={{ color: "#059669", fontWeight: "bold" }}>R{item.commission}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography fontWeight="bold" color="#0284c7" sx={{ mt: 2 }}>TB PABX Options</Typography>
              <TableContainer component={Paper} sx={{ backgroundColor: "#f8fafc" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: "#0284c7" }}>Option</TableCell>
                      <TableCell sx={{ color: "#0284c7" }}>Commission Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {PRODUCT_COMMISSIONS.tbPabx.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ color: "#0f172a" }}>{item.package}</TableCell>
                        <TableCell sx={{ color: "#059669", fontWeight: "bold" }}>{item.commission}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#ffffff", p: 2 }}>
          <Button variant="contained" onClick={() => setPackageModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    padding: "24px",
    fontFamily: "'Inter', sans-serif"
  },
  topTickerContainer: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    padding: "8px 16px",
    marginBottom: "20px"
  },
  tickerContent: {
    display: "inline-block",
    color: "#1d4ed8",
    fontWeight: "bold",
    fontSize: "0.85rem"
  },
  heroCard: {
    padding: "28px",
    borderRadius: "18px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
  },
  livePulse: {
    color: "#059669",
    fontSize: "0.8rem",
    fontWeight: "bold"
  },
  title: {
    fontSize: "2.2rem",
    fontWeight: 900,
    color: "#0f172a",
    letterSpacing: "-0.5px"
  },
  subtitle: {
    color: "#64748b",
    fontSize: "0.95rem",
    mt: 0.5
  },
  heroAvatar: {
    width: 64,
    height: 64,
    backgroundColor: "#2563eb",
    boxShadow: "0 0 20px rgba(37,99,235,0.2)"
  },
  statCard: {
    padding: "16px",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
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
    color: "#0f172a"
  },
  statTitle: {
    fontSize: "0.8rem",
    color: "#64748b"
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: 800,
    color: "#0f172a",
    marginTop: "32px",
    marginBottom: "16px"
  },
  formCard: {
    padding: "20px",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
  },
  input: {
    "& .MuiOutlinedInput-root": {
      color: "#0f172a",
      backgroundColor: "#f8fafc",
      borderRadius: "10px",
      "& fieldset": { borderColor: "#cbd5e1" },
      "&.Mui-focused fieldset": { borderColor: "#2563eb" }
    },
    "& .MuiInputLabel-root": { color: "#64748b" },
    "& .MuiSvgIcon-root": { color: "#64748b" }
  },
  noDataCard: {
    padding: "32px",
    textAlign: "center" as const,
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    border: "1px dashed #cbd5e1"
  }
};

export default FieldUpdates;