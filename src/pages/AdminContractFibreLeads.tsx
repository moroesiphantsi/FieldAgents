import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Tooltip,
  Stack,
  Divider,
  Link,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";

import {
  Search,
  Phone,
  Email,
  WhatsApp,
  CheckCircle,
  Pending,
  Delete,
  Visibility,
  Paid,
  Assignment,
  Refresh,
  Notifications,
  InsertDriveFile,
  Business,
  AccountBalance,
  Home,
  Person,
  Download,
  Send,
  Warning
} from "@mui/icons-material";

import { motion } from "framer-motion";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ChartTooltip,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis
} from "recharts";

import {
  ref,
  onValue,
  update,
  remove
} from "firebase/database";

import { db } from "../firebase";

// Status configuration map
const STATUS_CONFIG: Record<
  string,
  { label: string; color: "info" | "warning" | "error" | "success" | "secondary" | "default" | "primary"; requiresReason?: boolean; notifyCustomer: boolean }
> = {
  "Application received": { label: "Application Received", color: "info", notifyCustomer: true },
  "in process": { label: "In Process", color: "warning", notifyCustomer: true },
  "Declined": { label: "Declined", color: "error", requiresReason: true, notifyCustomer: true },
  "Approved": { label: "Approved", color: "success", notifyCustomer: true },
  "Cancelled": { label: "Cancelled", color: "error", requiresReason: true, notifyCustomer: true },
  "Ready for installation": { label: "Ready for Installation", color: "secondary", notifyCustomer: true },
  "Completed": { label: "Completed", color: "success", notifyCustomer: true },
  // Silent Statuses (No notification sent)
  "Signed up": { label: "Signed Up", color: "primary", notifyCustomer: false },
  "Contacted": { label: "Contacted", color: "default", notifyCustomer: false }
};

// Generate professional status notification text
const getProfessionalMessage = (
  status: string,
  name: string,
  reason: string = "",
  extraComment: string = ""
) => {
  const cleanName = name || "Valued Customer";

  switch (status) {
    case "Application received":
      return `Dear ${cleanName},\n\nThank you for submitting your contract fibre application with us. We have successfully received your details and queued your application for initial processing.\n\nKind regards,\nFibre Administration Team`;

    case "in process":
      return `Dear ${cleanName},\n\nYour fibre application is currently IN PROCESS. Our technical team is actively verifying coverage and processing documentation.\n\nBest regards,\nFibre Processing Team`;

    case "Declined":
      return `Dear ${cleanName},\n\nThank you for your interest in our Fibre services. Regrettably, your application could not be approved at this time.\n\nReason: ${reason || "Does not meet standard verification criteria"}.\n\nPlease contact support if you have any questions.\n\nKind regards,\nFibre Admin Team`;

    case "Approved":
      return `Dear ${cleanName},\n\nGreat news! Your fibre application has been APPROVED 🎉. Our team is finalizing the dispatch order to get your installation scheduled.\n\nBest regards,\nFibre Admin Team`;

    case "Cancelled":
      return `Dear ${cleanName},\n\nThis message confirms that your contract fibre application has been CANCELLED.\n\nReason: ${reason || "Cancelled per client request or site constraints"}.\n\nKind regards,\nFibre Admin Team`;

    case "Ready for installation":
      return `Dear ${cleanName},\n\nYour fibre line order is now READY FOR INSTALLATION! Our field engineering team will contact you shortly to schedule an installation date.\n\nBest regards,\nFibre Deployment Team`;

    case "Completed":
      return `Dear ${cleanName},\n\nYour fibre installation is officially COMPLETED and active! ${extraComment ? `\n\nNotes: ${extraComment}` : ""}\n\nThank you for choosing our service.\n\nWarm regards,\nFibre Operations Team`;

    default:
      return `Dear ${cleanName},\n\nYour Fibre Application status has been updated to: ${status}.${extraComment ? `\n\nComment: ${extraComment}` : ""}\n\nKind regards,\nFibre Admin Team`;
  }
};

const AdminContractFibreLeads = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [openDetails, setOpenDetails] = useState(false);

  // Status Change Dialog State
  const [statusDialog, setStatusDialog] = useState<{ open: boolean; lead: any; newStatus: string }>({
    open: false,
    lead: null,
    newStatus: ""
  });
  const [statusReason, setStatusReason] = useState("");
  const [additionalComment, setAdditionalComment] = useState("");

  // Delete Confirmation Dialog State
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; lead: any }>({
    open: false,
    lead: null
  });
  const [confirmSurnameInput, setConfirmSurnameInput] = useState("");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    const unsub = onValue(ref(db, "contractFibreLeads"), snap => {
      const data = snap.val();
      if (data) {
        setLeads(
          Object.keys(data)
            .map(key => ({
              id: key,
              ...data[key]
            }))
            .reverse()
        );
      } else {
        setLeads([]);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onValue(ref(db, "agents"), snap => {
      const data = snap.val();
      if (data) {
        setAgents(
          Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }))
        );
      } else {
        setAgents([]);
      }
    });

    return () => unsub();
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead: any) => {
      const firstName = lead.firstName || lead.firstNames || "";
      const lastName = lead.lastName || lead.surname || "";
      const phone = lead.phone || lead.contactNumber || "";
      const email = lead.email || lead.emailAddress || "";
      const address = lead.address || lead.streetAddress || lead.installationAddress || "";
      const idNum = lead.idNumber || lead.idOrPassport || "";
      const agent = lead.agentName || lead.agentLogged || lead.technicianOrSalesAgent || "";
      const pkg = lead.packagePlan || lead.packageName || lead.packageSelected || "";
      const company = lead.companyName || lead.employerName || "";

      const text = `
      ${lead.title || ""}
      ${firstName}
      ${lastName}
      ${phone}
      ${email}
      ${address}
      ${idNum}
      ${agent}
      ${pkg}
      ${company}
      `.toLowerCase();

      const createdDate = lead.createdAt || lead.submittedAt;
      const leadDate = createdDate ? new Date(createdDate) : null;

      return (
        text.includes(search.toLowerCase()) &&
        (agentFilter === "" || agent === agentFilter) &&
        (statusFilter === "" || (lead.adminStatus || lead.status || "Application received") === statusFilter) &&
        (monthFilter === "" || (leadDate && leadDate.getMonth() === Number(monthFilter))) &&
        (yearFilter === "" || (leadDate && leadDate.getFullYear() === Number(yearFilter)))
      );
    });
  }, [leads, search, agentFilter, statusFilter, monthFilter, yearFilter]);

  // Helper to extract numeric commission from lead object or fallback to default R200
  const getLeadCommission = (lead: any) => {
    const rawComm = lead.commissionAmount || lead.commission || lead.agentCommission;
    if (rawComm) {
      const num = parseFloat(String(rawComm).replace(/[^0-9.]/g, ""));
      if (!isNaN(num)) return num;
    }
    return 200; // Default commission per completed application
  };

  const totalApplications = filteredLeads.length;

  const completedLeads = filteredLeads.filter(
    x => (x.adminStatus || x.status) === "Completed"
  );

  const approved = filteredLeads.filter(
    x => (x.adminStatus || x.status) === "Approved"
  ).length;

  const pending = filteredLeads.filter(
    x =>
      (!x.adminStatus && !x.status) ||
      (x.adminStatus || x.status) === "Application received" ||
      (x.adminStatus || x.status) === "in process"
  ).length;

  // Calculate Total Commission for Completed applications
  const totalCommission = completedLeads.reduce(
    (sum, lead) => sum + getLeadCommission(lead),
    0
  );

  // Agent Performance Breakdown based on Completed Applications & Commission
  const performanceData = agents.map((agent: any) => {
    const list = filteredLeads.filter(
      x => (x.agentName || x.agentLogged || x.technicianOrSalesAgent) === agent.name
    );
    const completedList = list.filter(
      x => (x.adminStatus || x.status) === "Completed"
    );
    const agentComm = completedList.reduce(
      (sum, l) => sum + getLeadCommission(l),
      0
    );

    return {
      agent: agent.name,
      Applications: list.length,
      Completed: completedList.length,
      "Total Commission": agentComm
    };
  });

  const pieData = [
    { name: "Completed", value: completedLeads.length },
    { name: "Pending", value: pending },
    { name: "Approved", value: approved },
    {
      name: "Declined/Cancelled",
      value: filteredLeads.filter(
        x => (x.adminStatus || x.status) === "Declined" || (x.adminStatus || x.status) === "Cancelled"
      ).length
    }
  ];

  // Initiate status change click
  const handleStatusClick = (lead: any, newStatus: string) => {
    const config = STATUS_CONFIG[newStatus];

    if (config?.requiresReason || newStatus === "Completed" || newStatus === "Contacted") {
      setStatusDialog({ open: true, lead, newStatus });
      setStatusReason("");
      setAdditionalComment("");
    } else {
      executeStatusUpdate(lead, newStatus, "", "");
    }
  };

  // Perform Firebase database update
  const executeStatusUpdate = (lead: any, newStatus: string, reason: string, comment: string) => {
    const config = STATUS_CONFIG[newStatus];
    const firstName = lead.firstName || lead.firstNames || "";
    const lastName = lead.lastName || lead.surname || "";
    const fullName = `${lead.title ? lead.title + " " : ""}${firstName} ${lastName}`.trim();
    const phone = lead.phone || lead.contactNumber || "";
    const email = lead.email || lead.emailAddress || "";

    const updatePayload: any = {
      adminStatus: newStatus,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };

    if (reason) updatePayload.declineOrCancelReason = reason;
    if (comment) updatePayload.additionalComments = comment;

    // Direct update to Firebase database
    update(ref(db, `contractFibreLeads/${lead.id}`), updatePayload);

    // SILENT UPDATES: Signed up & Contacted MUST NOT trigger customer notification
    if (config && !config.notifyCustomer) {
      return;
    }

    // Trigger WhatsApp / Email draft for non-silent status updates
    const msg = getProfessionalMessage(newStatus, fullName, reason, comment);

    if (phone) {
      const cleanPhone = phone.replace(/\D/g, "");
      const formattedPhone = cleanPhone.startsWith("0") ? `27${cleanPhone.substring(1)}` : cleanPhone;
      window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, "_blank");
    } else if (email) {
      window.open(
        `mailto:${email}?subject=${encodeURIComponent(`Contract Fibre Application Status: ${newStatus}`)}&body=${encodeURIComponent(msg)}`,
        "_blank"
      );
    }
  };

  const confirmDialogStatusChange = () => {
    if (statusDialog.lead && statusDialog.newStatus) {
      executeStatusUpdate(statusDialog.lead, statusDialog.newStatus, statusReason, additionalComment);
    }
    setStatusDialog({ open: false, lead: null, newStatus: "" });
  };

  // Delete execution with Admin Surname verification
  const openDeleteConfirmation = (lead: any) => {
    setDeleteDialog({ open: true, lead });
    setConfirmSurnameInput("");
  };

  const handleConfirmDelete = () => {
    const lead = deleteDialog.lead;
    if (!lead) return;

    const actualSurname = (lead.lastName || lead.surname || "").trim().toLowerCase();
    const typedSurname = confirmSurnameInput.trim().toLowerCase();

    if (actualSurname && typedSurname !== actualSurname) {
      alert(`Surname does not match! Expected "${lead.lastName || lead.surname}". Delete cancelled.`);
      return;
    }

    remove(ref(db, `contractFibreLeads/${lead.id}`));
    setDeleteDialog({ open: false, lead: null });
    setConfirmSurnameInput("");
  };

  // Download filtered application data as CSV
  const downloadApplicationsCSV = () => {
    if (filteredLeads.length === 0) {
      alert("No applications available to download.");
      return;
    }

    const headers = [
      "ID",
      "Full Name",
      "ID Number",
      "Phone",
      "Email",
      "Address",
      "Package",
      "Agent",
      "Status",
      "Commission",
      "Submitted Date"
    ];

    const rows = filteredLeads.map(lead => [
      `"${lead.id || ""}"`,
      `"${lead.title || ""} ${lead.firstName || lead.firstNames || ""} ${lead.lastName || lead.surname || ""}"`,
      `"${lead.idNumber || lead.idOrPassport || ""}"`,
      `"${lead.phone || lead.contactNumber || ""}"`,
      `"${lead.email || lead.emailAddress || ""}"`,
      `"${lead.address || lead.streetAddress || lead.installationAddress || ""}"`,
      `"${lead.packagePlan || lead.packageName || lead.packageSelected || ""}"`,
      `"${lead.agentName || lead.agentLogged || lead.technicianOrSalesAgent || "Unassigned"}"`,
      `"${lead.adminStatus || lead.status || "Application received"}"`,
      `"R ${getLeadCommission(lead)}"`,
      `"${lead.createdAt || lead.submittedAt || ""}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Contract_Fibre_Applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openLead = (lead: any) => {
    setSelectedLead(lead);
    setOpenDetails(true);
  };

  return (
    <Box sx={styles.page}>
      {/* BACKGROUND */}
      <Box sx={styles.background}>
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, -60, 0] }}
          transition={{ duration: 14, repeat: Infinity }}
          style={styles.circle1}
        />
        <motion.div
          animate={{ x: [0, -120, 0], y: [0, 80, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
          style={styles.circle2}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity }}
          style={styles.circle3}
        />
      </Box>

      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
        <Paper sx={styles.headerCard}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography sx={styles.title}>OpenServe Contract Fibre Leads</Typography>
              <motion.div animate={{ x: [0, 25, 0] }} transition={{ duration: 6, repeat: Infinity }}>
                <Typography sx={styles.subtitle}>
                  2026 Contract Fibre Administration Dashboard. Manage applications, review uploaded documents, update customer statuses, track agent commissions, and monitor performance.
                </Typography>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={styles.headerRight}>
                <Badge badgeContent={pending} color="warning">
                  <Notifications sx={{ fontSize: 45, color: "#fff" }} />
                </Badge>
                <Typography fontWeight={700} color="white">
                  {pending} Pending Applications
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<Download />}
                  onClick={downloadApplicationsCSV}
                  sx={{ mt: 1, fontWeight: "bold" }}
                >
                  Download CSV
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* SUMMARY CARDS */}
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={3}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Paper sx={styles.summaryCard}>
              <Assignment sx={styles.summaryIcon} />
              <Typography>Applications</Typography>
              <Typography sx={styles.summaryValue}>{totalApplications}</Typography>
            </Paper>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={3}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Paper sx={styles.summaryCard}>
              <CheckCircle sx={{ ...styles.summaryIcon, color: "#22c55e" }} />
              <Typography>Completed</Typography>
              <Typography sx={styles.summaryValue}>{completedLeads.length}</Typography>
            </Paper>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={3}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Paper sx={styles.summaryCard}>
              <Pending sx={{ ...styles.summaryIcon, color: "#f59e0b" }} />
              <Typography>Pending / Processing</Typography>
              <Typography sx={styles.summaryValue}>{pending}</Typography>
            </Paper>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={3}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Paper sx={styles.summaryCard}>
              <Paid sx={{ ...styles.summaryIcon, color: "#00bcd4" }} />
              <Typography>Total Commission</Typography>
              <Typography sx={styles.summaryValue}>R {totalCommission.toLocaleString()}</Typography>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      {/* CHARTS */}
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={styles.glassCard}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Applications Status Overview
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={110} label>
                  <Cell fill="#22c55e" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#3b82f6" />
                  <Cell fill="#ef4444" />
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={styles.glassCard}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Agent Performance & Total Commission (Completed)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="agent" />
                <YAxis />
                <ChartTooltip />
                <Bar dataKey="Total Commission" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* FILTERS */}
      <Paper sx={styles.filterCard}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search customer, ID, phone, email, agent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
              sx={styles.input}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Agent"
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              sx={styles.input}
            >
              <MenuItem value="">All Agents</MenuItem>
              {agents.map((agent: any) => (
                <MenuItem key={agent.id} value={agent.name}>
                  {agent.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={styles.input}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {Object.keys(STATUS_CONFIG).map((st) => (
                <MenuItem key={st} value={st}>
                  {st}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              sx={styles.input}
            >
              <MenuItem value="">All Months</MenuItem>
              {months.map((m, index) => (
                <MenuItem key={m} value={index}>
                  {m}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Year"
              placeholder="2026"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              sx={styles.input}
            />
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Refresh />}
              sx={styles.refreshBtn}
              onClick={() => {
                setSearch("");
                setAgentFilter("");
                setStatusFilter("");
                setMonthFilter("");
                setYearFilter("");
              }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* CONTRACT APPLICATIONS TABLE */}
      <Paper sx={styles.glassCard}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={700}>
            📋 Contract Fibre Applications
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip color="primary" label={`${filteredLeads.length} Applications`} />
            <Button size="small" variant="outlined" startIcon={<Download />} onClick={downloadApplicationsCSV}>
              Export
            </Button>
          </Stack>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer Name</TableCell>
                <TableCell>Contact & ID</TableCell>
                <TableCell>Package & Commission</TableCell>
                <TableCell>Agent / Tech</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Contact</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLeads.map((lead: any) => {
                const firstName = lead.firstName || lead.firstNames || "";
                const lastName = lead.lastName || lead.surname || "";
                const phone = lead.phone || lead.contactNumber || "";
                const email = lead.email || lead.emailAddress || "";
                const idNum = lead.idNumber || lead.idOrPassport || "N/A";
                const pkg = lead.packagePlan || lead.packageName || lead.packageSelected || "-";
                const agent = lead.agentName || lead.agentLogged || lead.technicianOrSalesAgent || "Unassigned";
                const currentStatus = lead.adminStatus || lead.status || "Application received";
                const leadDate = lead.createdAt || lead.submittedAt;
                const isCompleted = currentStatus === "Completed";
                const leadComm = getLeadCommission(lead);

                return (
                  <TableRow hover key={lead.id}>
                    <TableCell>
                      <Typography fontWeight={700}>
                        {lead.title ? `${lead.title} ` : ""}{firstName} {lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {email}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{phone}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {idNum}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{pkg}</Typography>
                      {/* DISPLAY AGENT COMMISSION */}
                      <Chip
                        icon={<Paid sx={{ fontSize: "14px !important" }} />}
                        label={`Comm: R ${leadComm}`}
                        size="small"
                        color={isCompleted ? "success" : "default"}
                        variant={isCompleted ? "filled" : "outlined"}
                        sx={{ mt: 0.5, fontWeight: "bold" }}
                      />
                    </TableCell>

                    <TableCell>{agent}</TableCell>

                    <TableCell>
                      <Chip
                        label={STATUS_CONFIG[currentStatus]?.label || currentStatus}
                        color={STATUS_CONFIG[currentStatus]?.color || "default"}
                      />
                      {(lead.declineOrCancelReason || lead.additionalComments) && (
                        <Typography variant="caption" display="block" color="error.main" sx={{ mt: 0.5 }}>
                          {lead.declineOrCancelReason || lead.additionalComments}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      {leadDate ? new Date(leadDate).toLocaleDateString() : "-"}
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title="WhatsApp Direct Message">
                        <IconButton
                          color="success"
                          onClick={() => {
                            const cleanPhone = phone.replace(/\D/g, "");
                            const formattedPhone = cleanPhone.startsWith("0") ? `27${cleanPhone.substring(1)}` : cleanPhone;
                            const msg = getProfessionalMessage(currentStatus, `${firstName} ${lastName}`, lead.declineOrCancelReason, lead.additionalComments);
                            window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, "_blank");
                          }}
                        >
                          <WhatsApp />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Call">
                        <IconButton color="primary" onClick={() => window.open(`tel:${phone}`)}>
                          <Phone />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Send Email">
                        <IconButton
                          color="secondary"
                          onClick={() => {
                            const msg = getProfessionalMessage(currentStatus, `${firstName} ${lastName}`, lead.declineOrCancelReason, lead.additionalComments);
                            window.open(`mailto:${email}?subject=${encodeURIComponent(`Contract Fibre Application: ${currentStatus}`)}&body=${encodeURIComponent(msg)}`, "_blank");
                          }}
                        >
                          <Email />
                        </IconButton>
                      </Tooltip>
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="column" spacing={1} alignItems="center">
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="View Full Details & Attachments">
                            <Button size="small" variant="contained" color="info" onClick={() => openLead(lead)}>
                              <Visibility fontSize="small" />
                            </Button>
                          </Tooltip>
                          <Tooltip title="Delete Application">
                            <IconButton color="error" onClick={() => openDeleteConfirmation(lead)}>
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Stack>

                        {/* STATUS SELECTION DROPDOWN */}
                        <FormControl size="small" sx={{ minWidth: 150, mt: 1 }}>
                          <InputLabel sx={{ fontSize: "12px" }}>Update Status</InputLabel>
                          <Select
                            value={currentStatus}
                            label="Update Status"
                            onChange={(e) => handleStatusClick(lead, e.target.value)}
                            sx={{ fontSize: "12px" }}
                          >
                            {Object.keys(STATUS_CONFIG).map((st) => (
                              <MenuItem key={st} value={st} sx={{ fontSize: "12px" }}>
                                {st} {STATUS_CONFIG[st]?.notifyCustomer ? "" : "(Silent)"}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* CUSTOMER FULL DETAILS DIALOG */}
      <Dialog
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 5,
            background: "linear-gradient(135deg,#ffffff,#f8fbff)"
          }
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(90deg,#0057ff,#00b4ff)",
            color: "#fff",
            fontWeight: 700
          }}
        >
          📄 Contract Fibre Full Application Details
        </DialogTitle>

        <DialogContent sx={{ mt: 3 }}>
          {selectedLead && (
            <Grid container spacing={3}>
              {/* PERSONAL INFO */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" fontWeight={700} display="flex" alignItems="center" gap={1}>
                  <Person /> Personal Information
                </Typography>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography fontWeight={700}>Full Name</Typography>
                <Typography>
                  {selectedLead.title ? `${selectedLead.title} ` : ""}
                  {selectedLead.firstName || selectedLead.firstNames}{" "}
                  {selectedLead.lastName || selectedLead.surname}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography fontWeight={700}>ID / Passport</Typography>
                <Typography>{selectedLead.idNumber || selectedLead.idOrPassport || "-"}</Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography fontWeight={700}>Phone Contact</Typography>
                <Typography>{selectedLead.phone || selectedLead.contactNumber || "-"}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography fontWeight={700}>Email Address</Typography>
                <Typography>{selectedLead.email || selectedLead.emailAddress || "-"}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography fontWeight={700}>Status</Typography>
                <Chip
                  label={selectedLead.adminStatus || selectedLead.status || "Application received"}
                  color={STATUS_CONFIG[selectedLead.adminStatus || selectedLead.status]?.color || "default"}
                />
              </Grid>

              {/* INSTALLATION ADDRESS */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" fontWeight={700} display="flex" alignItems="center" gap={1} mt={2}>
                  <Home /> Installation Address
                </Typography>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography fontWeight={700}>Street Address</Typography>
                <Typography>{selectedLead.address || selectedLead.streetAddress || selectedLead.installationAddress || "-"}</Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography fontWeight={700}>Suburb</Typography>
                <Typography>{selectedLead.suburb || "-"}</Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography fontWeight={700}>City / Town</Typography>
                <Typography>{selectedLead.city || selectedLead.townCity || "-"}</Typography>
              </Grid>

              {/* EMPLOYMENT & FINANCIAL DETAILS */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" fontWeight={700} display="flex" alignItems="center" gap={1} mt={2}>
                  <Business /> Employment & Financial Details
                </Typography>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography fontWeight={700}>Employer / Company</Typography>
                <Typography>{selectedLead.companyName || selectedLead.employerName || "-"}</Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography fontWeight={700}>Gross Income</Typography>
                <Typography>{selectedLead.grossIncome || "-"}</Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography fontWeight={700}>Net Income</Typography>
                <Typography>{selectedLead.netIncome || "-"}</Typography>
              </Grid>

              {/* BANKING DETAILS */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" fontWeight={700} display="flex" alignItems="center" gap={1} mt={2}>
                  <AccountBalance /> Banking & Payment
                </Typography>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography fontWeight={700}>Bank Name</Typography>
                <Typography>{selectedLead.bankName || "-"}</Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography fontWeight={700}>Account Number</Typography>
                <Typography>{selectedLead.accountNumber || "-"}</Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography fontWeight={700}>Debit Order Date</Typography>
                <Typography>{selectedLead.debitOrderDate || "-"}</Typography>
              </Grid>

              {/* PACKAGE & COMMISSION INFO */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" fontWeight={700} display="flex" alignItems="center" gap={1} mt={2}>
                  <Assignment /> Package & Commission Information
                </Typography>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography fontWeight={700}>Package Selected</Typography>
                <Typography>{selectedLead.packagePlan || selectedLead.packageName || selectedLead.packageSelected || "-"}</Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography fontWeight={700}>Agent Commission Earned</Typography>
                <Typography variant="h6" color="success.main" fontWeight={800}>
                  R {getLeadCommission(selectedLead)}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography fontWeight={700}>Agent Assigned</Typography>
                <Typography>{selectedLead.agentName || selectedLead.agentLogged || selectedLead.technicianOrSalesAgent || "Unassigned"}</Typography>
              </Grid>

              {/* ATTACHMENTS & DOCUMENTATION */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" fontWeight={700} display="flex" alignItems="center" gap={1} mt={2}>
                  <InsertDriveFile /> Documents & Attachments
                </Typography>
                <Divider sx={{ my: 1 }} />
              </Grid>

              {selectedLead.documents ? (
                <>
                  <Grid item xs={12} md={4}>
                    <Typography fontWeight={700}>ID / Passport Copy</Typography>
                    {selectedLead.documents.idPassportCopy ? (
                      <Link href={selectedLead.documents.idPassportCopy} target="_blank" download="ID_Passport_Copy">
                        View / Download ID Copy
                      </Link>
                    ) : (
                      <Typography variant="body2" color="text.secondary">Not provided</Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography fontWeight={700}>Bank Statement</Typography>
                    {selectedLead.documents.bankStatement ? (
                      <Link href={selectedLead.documents.bankStatement} target="_blank" download="Bank_Statement">
                        View / Download Bank Statement
                      </Link>
                    ) : (
                      <Typography variant="body2" color="text.secondary">Not provided</Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography fontWeight={700}>Proof of Address</Typography>
                    {selectedLead.documents.proofOfAddress ? (
                      <Link href={selectedLead.documents.proofOfAddress} target="_blank" download="Proof_Of_Address">
                        View / Download Proof of Address
                      </Link>
                    ) : (
                      <Typography variant="body2" color="text.secondary">Not provided</Typography>
                    )}
                  </Grid>
                </>
              ) : (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">No attachments recorded for this lead.</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDetails(false)}>Close</Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              handleStatusClick(selectedLead, "Completed");
              setOpenDetails(false);
            }}
          >
            Mark Completed
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG FOR STATUS REASONS & ADDITIONAL COMMENTS */}
      <Dialog
        open={statusDialog.open}
        onClose={() => setStatusDialog({ open: false, lead: null, newStatus: "" })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Update Status: {statusDialog.newStatus}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {STATUS_CONFIG[statusDialog.newStatus]?.notifyCustomer
              ? "Specify status details before sending the update message to the customer."
              : "This status update is silent and will NOT trigger a message to the customer."}
          </Typography>

          {STATUS_CONFIG[statusDialog.newStatus]?.requiresReason && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason for Declining / Cancelling"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              margin="normal"
            />
          )}

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Additional Comments / Notes"
            value={additionalComment}
            onChange={(e) => setAdditionalComment(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStatusDialog({ open: false, lead: null, newStatus: "" })}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={confirmDialogStatusChange} startIcon={<Send />}>
            Save Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* ADMIN DELETE CONFIRMATION DIALOG (SURNAME REQUIRED) */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, lead: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ color: "error.main", fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
          <Warning color="error" /> Delete Application Confirmation
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Are you sure you want to delete the lead for{" "}
            <b>
              {deleteDialog.lead?.firstName || deleteDialog.lead?.firstNames}{" "}
              {deleteDialog.lead?.lastName || deleteDialog.lead?.surname}
            </b>
            ?
          </Typography>
          <Typography variant="caption" color="error" display="block" mb={1}>
            To confirm deletion, please type the customer's surname:{" "}
            <b>"{deleteDialog.lead?.lastName || deleteDialog.lead?.surname}"</b>
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Type surname here"
            value={confirmSurnameInput}
            onChange={(e) => setConfirmSurnameInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialog({ open: false, lead: null })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete} startIcon={<Delete />}>
            Confirm & Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* FOOTER */}
      <Box sx={{ mt: 6, py: 5, textAlign: "center", color: "rgba(255,255,255,.8)" }}>
        <Typography fontWeight={700}>
          © 2026 OpenServe Contract Fibre Applications. All rights reserved.
        </Typography>
        <Typography>Professional Contract Fibre Administration Dashboard</Typography>
      </Box>
    </Box>
  );
};

export default AdminContractFibreLeads;

/* ======================================================
                        STYLES
====================================================== */

const styles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    p: 4,
    background: "linear-gradient(135deg,#03142f,#083b87,#00b8ff)"
  },
  background: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    zIndex: 0
  },
  circle1: {
    position: "absolute" as const,
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "rgba(59,130,246,0.18)",
    top: -80,
    left: -80,
    filter: "blur(50px)"
  },
  circle2: {
    position: "absolute" as const,
    width: 260,
    height: 260,
    borderRadius: "50%",
    background: "rgba(6,182,212,0.18)",
    right: -60,
    top: 150,
    filter: "blur(60px)"
  },
  circle3: {
    position: "absolute" as const,
    width: 220,
    height: 220,
    borderRadius: "50%",
    background: "rgba(99,102,241,0.18)",
    bottom: -50,
    left: "40%",
    filter: "blur(60px)"
  },
  headerCard: {
    position: "relative",
    zIndex: 1,
    p: 4,
    mb: 4,
    borderRadius: 6,
    background: "linear-gradient(135deg,rgba(0,94,255,.55),rgba(0,188,255,.45))",
    backdropFilter: "blur(20px)",
    boxShadow: "0 25px 50px rgba(0,0,0,.25)"
  },
  title: {
    color: "#fff",
    fontSize: 38,
    fontWeight: 800,
    letterSpacing: 1
  },
  subtitle: {
    color: "rgba(255,255,255,.9)",
    mt: 2,
    fontSize: 17,
    lineHeight: 1.8
  },
  headerRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 1
  },
  summaryCard: {
    p: 3,
    borderRadius: 5,
    textAlign: "center",
    background: "rgba(255,255,255,.94)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 15px 35px rgba(0,0,0,.15)"
  },
  summaryIcon: {
    fontSize: 48,
    color: "#2563eb",
    mb: 1
  },
  summaryValue: {
    fontSize: 34,
    fontWeight: 800,
    mt: 1
  },
  glassCard: {
    mt: 4,
    p: 3,
    borderRadius: 5,
    background: "rgba(255,255,255,.95)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 20px 40px rgba(0,0,0,.18)"
  },
  filterCard: {
    mt: 4,
    mb: 4,
    p: 3,
    borderRadius: 5,
    background: "rgba(255,255,255,.95)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 15px 35px rgba(0,0,0,.15)"
  },
  input: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 3,
      background: "#fff"
    }
  },
  refreshBtn: {
    height: 56,
    borderRadius: 3,
    textTransform: "none",
    fontWeight: 700,
    background: "linear-gradient(90deg,#2563eb,#06b6d4)"
  }
};