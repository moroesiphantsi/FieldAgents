import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Chip,
  ChipProps,
  Avatar,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  InputAdornment,
  Stack,
  Tooltip
} from "@mui/material";
import {
  Search,
  Person,
  Call,
  Email,
  WhatsApp,
  Delete,
  CheckCircle,
  Visibility,
  Assignment,
  Groups,
  TrendingUp,
  Download,
  Refresh,
  Verified,
  SupportAgent,
  EmojiEvents,
  HowToReg,
  PhoneInTalk,
  Paid,
  Send,
  Warning,
  NotificationsActive
} from "@mui/icons-material";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  LineChart,
  Line,
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from "react-leaflet";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  ref,
  onValue,
  update,
  remove
} from "firebase/database";
import { db } from "../firebase";

/*const COLORS = [
  "#2563eb", // Primary
  "#22c55e", // Success
  "#f59e0b", // Warning
  "#ef4444", // Danger
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4"  // Cyan
];*/

// Config for statuses and silent update flags
const STATUS_CONFIG: Record<
  string,
  { label: string; color: ChipProps["color"]; notifyCustomer: boolean; requiresReason?: boolean }
> = {
  "Application received": { label: "Application Received", color: "info", notifyCustomer: true },
  "in process": { label: "In Process", color: "warning", notifyCustomer: true },
  "Declined": { label: "Declined", color: "error", notifyCustomer: true, requiresReason: true },
  "Approved": { label: "Approved", color: "success", notifyCustomer: true },
  "Cancelled": { label: "Cancelled", color: "error", notifyCustomer: true, requiresReason: true },
  "Ready for installation": { label: "Ready for Installation", color: "secondary", notifyCustomer: true },
  "Completed": { label: "Completed", color: "success", notifyCustomer: true },
  // Silent statuses (do not notify the customer)
  "Signed up": { label: "Signed Up", color: "primary", notifyCustomer: false },
  "Contacted": { label: "Contacted", color: "default", notifyCustomer: false }
};

// Professional message generator
const getProfessionalMessage = (
  status: string,
  fullName: string,
  reason: string = "",
  comment: string = ""
) => {
  const name = fullName || "Valued Customer";
  switch (status) {
    case "Application received":
      return `Dear ${name},\n\nThank you for submitting your OpenServe Fibre Application. We have successfully received your details and queued your request for review.\n\nBest regards,\nOpenServe Support Team`;
    case "in process":
      return `Dear ${name},\n\nYour OpenServe Fibre Application is currently IN PROCESS. Our technical team is evaluating network coverage and processing your details.\n\nBest regards,\nOpenServe Processing Team`;
    case "Declined":
      return `Dear ${name},\n\nThank you for your interest in OpenServe Fibre. Regrettably, your application could not be approved at this time.\n\nReason: ${reason || "Does not meet eligibility criteria"}.\n\nKind regards,\nOpenServe Admin Team`;
    case "Approved":
      return `Dear ${name},\n\nGreat news! Your OpenServe Fibre Application has been APPROVED. Our team will contact you shortly to confirm setup options.\n\nWarm regards,\nOpenServe Admin Team`;
    case "Cancelled":
      return `Dear ${name},\n\nThis message confirms that your OpenServe Fibre Application has been CANCELLED.\n\nReason: ${reason || "Cancelled per applicant request or site constraints"}.\n\nKind regards,\nOpenServe Admin Team`;
    case "Ready for installation":
      return `Dear ${name},\n\nYour line order is now READY FOR INSTALLATION! Our deployment team will reach out to schedule an installation date.\n\nBest regards,\nOpenServe Deployment Team`;
    case "Completed":
      return `Dear ${name},\n\nYour OpenServe Fibre installation is officially COMPLETED and active! ${comment ? `\n\nNotes: ${comment}` : ""}\n\nThank you for choosing OpenServe.\n\nBest regards,\nOpenServe Operations Team`;
    default:
      return `Dear ${name},\n\nYour application status has been updated to: ${status}.${comment ? `\n\nNotes: ${comment}` : ""}\n\nKind regards,\nOpenServe Team`;
  }
};

const AdminFreeTrial = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("");

  // Dialog States
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  // Status Modal States
  const [statusDialog, setStatusDialog] = useState<{ open: boolean; customer: any; newStatus: string }>({
    open: false,
    customer: null,
    newStatus: ""
  });
  const [statusReason, setStatusReason] = useState("");
  const [additionalComment, setAdditionalComment] = useState("");

  // Delete Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<any>(null);
  const [confirmNameInput, setConfirmNameInput] = useState("");

  // Editable Modal Fields (Comments & Reminder)
  const [adminComment, setAdminComment] = useState("");
  const [reminderDateTime, setReminderDateTime] = useState("");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper function to extract or compute agent commission
  const getCommission = (app: any) => {
    const rawComm = app.commission || app.commissionAmount || app.agentCommission;
    if (rawComm) {
      const num = parseFloat(String(rawComm).replace(/[^0-9.]/g, ""));
      if (!isNaN(num)) return num;
    }
    return 200; // Default commission amount (R200) per completed application
  };

  const exportExcel = () => {
    const exportData = filtered.map(app => ({
      ID: app.id,
      FullName: app.fullName,
      Phone: app.phone,
      Email: app.email,
      Address: app.address,
      Suburb: app.suburb,
      City: app.city,
      Status: app.status || "Application received",
      Agent: app.agentName || "Unassigned",
      Commission: `R ${getCommission(app)}`,
      Reminder: app.reminderDateTime || "None"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    saveAs(data, "OpenServe_FreeTrial_Report.xlsx");
  };

  useEffect(() => {
    const freeTrialRef = ref(db, "freeTrialApplications");
    onValue(freeTrialRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const result = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).reverse();
        setApplications(result);
      } else {
        setApplications([]);
      }
    });
  }, []);

  useEffect(() => {
    const agentsRef = ref(db, "agents");
    onValue(agentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAgents(Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })));
      }
    });
  }, []);

  useEffect(() => {
    let data = [...applications];
    if (search !== "") {
      data = data.filter(item => `
        ${item.fullName || ""}
        ${item.phone || ""}
        ${item.email || ""}
        ${item.address || ""}
        ${item.suburb || ""}
        ${item.city || ""}
        ${item.province || ""}
        ${item.agentName || ""}
      `.toLowerCase().includes(search.toLowerCase()));
    }
    if (statusFilter !== "") {
      data = data.filter(x => (x.status || "Application received") === statusFilter);
    }
    if (agentFilter !== "") {
      data = data.filter(x => x.agentName === agentFilter);
    }
    if (monthFilter !== "") {
      data = data.filter(item => item.createdAt && new Date(item.createdAt).getMonth() === Number(monthFilter));
    }
    if (yearFilter !== "") {
      data = data.filter(item => item.createdAt && new Date(item.createdAt).getFullYear() === Number(yearFilter));
    }
    setFiltered(data);
  }, [applications, search, statusFilter, agentFilter, monthFilter, yearFilter]);

  // Request notification permissions for reminders
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Status Metrics Breakdown
  const totalApplications = filtered.length;
  const completedLeads = filtered.filter(x => x.status === "Completed");
  const approved = filtered.filter(x => x.status === "Approved").length;
  /*const pending = filtered.filter(
    x => !x.status || x.status === "Application received" || x.status === "in process"
  ).length;
  const declined = filtered.filter(x => x.status === "Declined" || x.status === "Cancelled").length;*/
  const signedUp = filtered.filter(x => x.status === "Signed up").length;
  const contacted = filtered.filter(x => x.status === "Contacted").length;
  
  // Calculate total agent commissions earned on completed applications
  const totalCommission = completedLeads.reduce((sum, app) => sum + getCommission(app), 0);

  // Agent Performance & Earned Commission Breakdown
  const agentPerformanceData = useMemo(() => {
    return agents.map(agent => {
      const agentApps = filtered.filter(x => x.agentName === agent.name);
      const agentCompleted = agentApps.filter(x => x.status === "Completed");
      const commissionEarned = agentCompleted.reduce((sum, app) => sum + getCommission(app), 0);

      return {
        agent: agent.name,
        Applications: agentApps.length,
        Completed: agentCompleted.length,
        Commission: commissionEarned
      };
    });
  }, [agents, filtered]);

  /*const chartData = [
    { name: "Completed", value: completedLeads.length },
    { name: "Approved", value: approved },
    { name: "Pending", value: pending },
    { name: "Signed Up", value: signedUp },
    { name: "Contacted", value: contacted },
    { name: "Declined/Cancelled", value: declined }
  ].filter(item => item.value > 0);*/

  const monthlyData = months.map((m, index) => ({
    month: m.substring(0, 3),
    Applications: filtered.filter(item => item.createdAt && new Date(item.createdAt).getMonth() === index).length
  }));

  // Handle status menu selection
  const handleStatusSelect = (customer: any, newStatus: string) => {
    const config = STATUS_CONFIG[newStatus];

    if (config?.requiresReason || newStatus === "Completed" || newStatus === "Application received" || newStatus === "Approved" || newStatus === "in process" || newStatus === "Ready for installation") {
      setStatusDialog({ open: true, customer, newStatus });
      setStatusReason("");
      setAdditionalComment("");
    } else {
      // Execute silent update without prompt
      executeUpdateStatus(customer, newStatus, "", "");
    }
  };

  // Perform Firebase update and trigger messaging
  const executeUpdateStatus = (customer: any, newStatus: string, reason: string, comment: string) => {
    const config = STATUS_CONFIG[newStatus];

    const updatePayload: any = {
      status: newStatus,
      updatedAt: new Date().toISOString()
    };

    if (reason) updatePayload.declineOrCancelReason = reason;
    if (comment) updatePayload.additionalComments = comment;

    // Direct update in Firebase Database
    update(ref(db, `freeTrialApplications/${customer.id}`), updatePayload);

    // SILENT UPDATES: Signed up & Contacted MUST NOT trigger customer notification
    if (config && !config.notifyCustomer) {
      return;
    }

    // Trigger customer messaging for non-silent statuses
    const message = getProfessionalMessage(newStatus, customer.fullName, reason, comment);

    if (customer.phone) {
      const cleanPhone = customer.phone.replace(/\D/g, "");
      const formattedPhone = cleanPhone.startsWith("0") ? `27${cleanPhone.substring(1)}` : cleanPhone;
      window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, "_blank");
    } else if (customer.email) {
      window.open(
        `mailto:${customer.email}?subject=${encodeURIComponent(`OpenServe Application Status: ${newStatus}`)}&body=${encodeURIComponent(message)}`,
        "_blank"
      );
    }
  };

  const confirmStatusDialog = () => {
    if (statusDialog.customer && statusDialog.newStatus) {
      executeUpdateStatus(statusDialog.customer, statusDialog.newStatus, statusReason, additionalComment);
    }
    setStatusDialog({ open: false, customer: null, newStatus: "" });
  };

  const handleAgentAssign = (customerId: string, agentName: string) => {
    update(ref(db, `freeTrialApplications/${customerId}`), {
      agentName: agentName
    });
  };

  const openDeleteConfirmation = (customer: any) => {
    setCustomerToDelete(customer);
    setConfirmNameInput("");
    setDeleteDialogOpen(true);
  };

  const processDelete = () => {
    if (customerToDelete && confirmNameInput.trim().toLowerCase() === (customerToDelete.fullName || "").trim().toLowerCase()) {
      remove(ref(db, "freeTrialApplications/" + customerToDelete.id)).then(() => {
        setDeleteDialogOpen(false);
        setCustomerToDelete(null);
      });
    } else {
      alert("Full name mismatch! Deletion cancelled.");
    }
  };

  // Open Customer View Modal
  const handleOpenDetails = (customer: any) => {
    setSelected(customer);
    setAdminComment(customer.adminComment || customer.additionalComments || "");
    setReminderDateTime(customer.reminderDateTime || "");
    setDetailsOpen(true);
  };

  // Save Modal Updates (Admin Comment and Reminder) to Firebase
  const handleSaveCustomerNotes = () => {
    if (!selected) return;
    update(ref(db, `freeTrialApplications/${selected.id}`), {
      adminComment: adminComment,
      reminderDateTime: reminderDateTime
    }).then(() => {
      setDetailsOpen(false);
    });
  };

  return (
    <Box sx={container}>
      <Box sx={floatingGlow1} />
      <Box sx={floatingGlow2} />
      <Box sx={floatingGlow3} />

      <Typography variant="h3" fontWeight="bold" sx={title}>
        🚀 OpenServe Free Trial Admin Portal
      </Typography>
      <Typography sx={subTitle}>
        Manage free trial requests, track agent commissions, set follow-up reminders, and monitor line deployments in real-time.
      </Typography>

      {/* FILTER CONTROLS */}
      <Paper sx={filterCard}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search customer, suburb, city..."
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
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
            >
              <MenuItem value="">All Months</MenuItem>
              {months.map((m, index) => (
                <MenuItem key={m} value={index}>{m}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Year"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              placeholder="2026"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Assigned Agent"
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
            >
              <MenuItem value="">All Agents</MenuItem>
              {agents.map(agent => (
                <MenuItem key={agent.id} value={agent.name}>{agent.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* STAT CARDS OVERVIEW */}
      <Grid container spacing={2}>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={statCard}>
            <Assignment color="primary" />
            <Typography variant="body2">Total Applications</Typography>
            <Typography fontSize={24} fontWeight="bold">{totalApplications}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={statCard}>
            <PhoneInTalk color="action" />
            <Typography variant="body2">Contacted</Typography>
            <Typography fontSize={24} fontWeight="bold">{contacted}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={statCard}>
            <HowToReg color="info" />
            <Typography variant="body2">Signed Up</Typography>
            <Typography fontSize={24} fontWeight="bold">{signedUp}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={statCard}>
            <CheckCircle color="success" />
            <Typography variant="body2">Approved</Typography>
            <Typography fontSize={24} fontWeight="bold">{approved}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={statCard}>
            <EmojiEvents sx={{ color: "#22c55e" }} />
            <Typography variant="body2">Completed</Typography>
            <Typography fontSize={24} fontWeight="bold">{completedLeads.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={statCard}>
            <Paid sx={{ color: "#00bcd4" }} />
            <Typography variant="body2">Total Commission</Typography>
            <Typography fontSize={22} fontWeight="bold">R {totalCommission.toLocaleString()}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* CHARTS */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} lg={6}>
          <Paper sx={chartCard}>
            <Typography fontWeight="bold" mb={2}>📈 Monthly Applications Trend</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip />
                <Line type="monotone" dataKey="Applications" stroke="#2563eb" strokeWidth={4} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper sx={chartCard}>
            <Typography fontWeight="bold" mb={2}>💼 Agent Commission & Completed Breakdown</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="agent" />
                <YAxis />
                <ChartTooltip />
                <Bar dataKey="Commission" fill="#22c55e" name="Commission Earned (R)" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* APPLICATIONS TABLE */}
      <Paper sx={tableCard}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">📋 Free Trial Applications</Typography>
          <Stack direction="row" spacing={1}>
            <Chip label={`${filtered.length} Applications`} color="primary" />
            <Button size="small" variant="contained" color="success" startIcon={<Download />} onClick={exportExcel}>
              Export
            </Button>
          </Stack>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Customer</b></TableCell>
                <TableCell><b>Contact & Address</b></TableCell>
                <TableCell><b>Assigned Agent</b></TableCell>
                <TableCell><b>Commission</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell><b>Follow-Up Reminder</b></TableCell>
                <TableCell align="center"><b>Contact</b></TableCell>
                <TableCell align="center"><b>Manage</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((customer: any) => {
                const currentStatus = customer.status || "Application received";
                const isCompleted = currentStatus === "Completed";
                const commAmount = getCommission(customer);

                return (
                  <TableRow hover key={customer.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: "#2563eb" }}><Person /></Avatar>
                        <Box>
                          <Typography fontWeight={700}>{customer.fullName}</Typography>
                          <Typography variant="body2" color="text.secondary">ID: {customer.idNumber || "N/A"}</Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{customer.phone}</Typography>
                      <Typography variant="body2" color="text.secondary">{customer.email}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {customer.suburb ? `${customer.suburb}, ` : ""}{customer.address}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <TextField
                        select
                        size="small"
                        value={customer.agentName || ""}
                        onChange={(e) => handleAgentAssign(customer.id, e.target.value)}
                        fullWidth
                        sx={{ minWidth: 130 }}
                      >
                        <MenuItem value=""><em>Unassigned</em></MenuItem>
                        {agents.map((agent) => (
                          <MenuItem key={agent.id} value={agent.name}>{agent.name}</MenuItem>
                        ))}
                      </TextField>
                    </TableCell>

                    {/* COMMISSION DISPLAY */}
                    <TableCell>
                      <Chip
                        icon={<Paid sx={{ fontSize: "14px !important" }} />}
                        label={`R ${commAmount}`}
                        size="small"
                        color={isCompleted ? "success" : "default"}
                        variant={isCompleted ? "filled" : "outlined"}
                        sx={{ fontWeight: "bold" }}
                      />
                      {isCompleted && (
                        <Typography variant="caption" display="block" color="success.main" fontWeight={700}>
                          Earned
                        </Typography>
                      )}
                    </TableCell>

                    {/* STATUS SELECT DROPDOWN */}
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        value={currentStatus}
                        onChange={(e) => handleStatusSelect(customer, e.target.value)}
                        sx={{ minWidth: 150 }}
                      >
                        {Object.keys(STATUS_CONFIG).map((st) => (
                          <MenuItem key={st} value={st}>
                            {st} {STATUS_CONFIG[st]?.notifyCustomer ? "" : "(Silent)"}
                          </MenuItem>
                        ))}
                      </TextField>
                      {(customer.declineOrCancelReason || customer.additionalComments) && (
                        <Typography variant="caption" color="error.main" display="block" sx={{ mt: 0.5 }}>
                          {customer.declineOrCancelReason || customer.additionalComments}
                        </Typography>
                      )}
                    </TableCell>

                    {/* REMINDER BADGE */}
                    <TableCell>
                      {customer.reminderDateTime ? (
                        <Chip
                          icon={<NotificationsActive fontSize="small" />}
                          label={new Date(customer.reminderDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          color="secondary"
                          size="small"
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">No reminder set</Typography>
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title="Send WhatsApp">
                        <IconButton
                          color="success"
                          onClick={() => {
                            const cleanPhone = (customer.phone || "").replace(/\D/g, "");
                            const formattedPhone = cleanPhone.startsWith("0") ? `27${cleanPhone.substring(1)}` : cleanPhone;
                            const msg = getProfessionalMessage(currentStatus, customer.fullName, customer.declineOrCancelReason, customer.additionalComments);
                            window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, "_blank");
                          }}
                        >
                          <WhatsApp />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Call">
                        <IconButton color="primary" onClick={() => window.open(`tel:${customer.phone}`)}>
                          <Call />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Email">
                        <IconButton
                          color="secondary"
                          onClick={() => {
                            const msg = getProfessionalMessage(currentStatus, customer.fullName, customer.declineOrCancelReason, customer.additionalComments);
                            window.open(`mailto:${customer.email}?subject=${encodeURIComponent(`OpenServe Application Status: ${currentStatus}`)}&body=${encodeURIComponent(msg)}`, "_blank");
                          }}
                        >
                          <Email />
                        </IconButton>
                      </Tooltip>
                    </TableCell>

                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Visibility />}
                        onClick={() => handleOpenDetails(customer)}
                      >
                        View
                      </Button>
                      <IconButton color="error" onClick={() => openDeleteConfirmation(customer)} sx={{ ml: 0.5 }}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* CUSTOMER DETAILS & ACTIONS DIALOG */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ background: "linear-gradient(90deg,#0057ff,#00b4ff)", color: "#fff", fontWeight: 700 }}>
          👤 Customer Details & OpenServe Coverage Map
        </DialogTitle>
        <DialogContent dividers sx={{ mt: 1 }}>
          {selected && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Full Name</Typography>
                <Typography fontWeight="bold">{selected.fullName}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">ID / Passport Number</Typography>
                <Typography fontWeight="bold">{selected.idNumber || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                <Typography fontWeight="bold">{selected.phone}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Email Address</Typography>
                <Typography fontWeight="bold">{selected.email}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* LOCATION BREAKDOWN */}
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Street Address</Typography>
                <Typography fontWeight="bold">{selected.address || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Suburb</Typography>
                <Typography fontWeight="bold">{selected.suburb || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">City</Typography>
                <Typography fontWeight="bold">{selected.city || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Province</Typography>
                <Typography fontWeight="bold">{selected.province || "N/A"}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* AGENT & COMMISSION INFORMATION */}
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Assigned Agent</Typography>
                <Typography fontWeight="bold">{selected.agentName || "Unassigned"}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Agent Earned Commission</Typography>
                <Typography variant="h6" color="success.main" fontWeight={800}>
                  R {getCommission(selected)}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* STATUS & REMINDERS SECTION */}
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Current Application Status</Typography>
                <Box mt={0.5}>
                  <Chip
                    label={STATUS_CONFIG[selected.status]?.label || selected.status || "Application received"}
                    color={STATUS_CONFIG[selected.status]?.color || "default"}
                    sx={{ fontWeight: "bold" }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Set Follow-Up Reminder Date & Time"
                  value={reminderDateTime}
                  onChange={(e) => setReminderDateTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Additional Admin Comments / Notes"
                  placeholder="Enter notes, customer context, follow-up comments..."
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                />
              </Grid>

              {/* NETWORK COVERAGE MAP */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                  OpenServe Network Status Check:
                </Typography>
                {(selected.latitude === undefined || selected.longitude === undefined || selected.hasNoCoverage === true || selected.status === "Declined") ? (
                  <Chip label="🔴 NO OPENSERVE COVERAGE AVAILABLE AT THIS ADDRESS" color="error" sx={{ fontWeight: 'bold', p: 1 }} />
                ) : (
                  <Chip label="🟢 OPENSERVE FIBRE COVERAGE DETECTED AVAILABLE" color="success" sx={{ fontWeight: 'bold', p: 1 }} />
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography fontWeight="bold" mb={1}>
                  Coverage Map Location Viewer
                </Typography>
                <MapContainer
                  center={[
                    selected.latitude !== undefined && selected.latitude !== null ? selected.latitude : -26.2041,
                    selected.longitude !== undefined && selected.longitude !== null ? selected.longitude : 28.0473
                  ]}
                  zoom={15}
                  style={{ height: 280, borderRadius: 12 }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {typeof selected.latitude === 'number' && typeof selected.longitude === 'number' && (
                    <Marker position={[selected.latitude, selected.longitude]}>
                      <Popup>
                        <strong>{selected.fullName}</strong><br />
                        {selected.address}<br />
                        Status: {selected.status}
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button variant="contained" color="primary" onClick={handleSaveCustomerNotes}>
            Save Changes & Reminder
          </Button>
        </DialogActions>
      </Dialog>

      {/* STATUS CHANGE & REASON DIALOG */}
      <Dialog
        open={statusDialog.open}
        onClose={() => setStatusDialog({ open: false, customer: null, newStatus: "" })}
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
          <Button onClick={() => setStatusDialog({ open: false, customer: null, newStatus: "" })}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={confirmStatusDialog} startIcon={<Send />}>
            Save Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle style={{ color: '#ef4444', fontWeight: 'bold' }}>
          <Warning color="error" sx={{ verticalAlign: 'middle', mr: 1 }} /> Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography mb={2}>
            Are you sure you want to delete this applicant? To confirm deletion, type out the customer's full name exactly:
            <br /><strong>{customerToDelete?.fullName}</strong>
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Customer Full Name"
            value={confirmNameInput}
            onChange={(e) => setConfirmNameInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={!customerToDelete || confirmNameInput.trim().toLowerCase() !== (customerToDelete.fullName || "").trim().toLowerCase()}
            onClick={processDelete}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      {/* ANALYTICS & EXPORT SECTION */}
      <Paper sx={{ mt: 4, p: 4, borderRadius: 5, background: "rgba(255,255,255,.96)", backdropFilter: "blur(16px)" }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          📊 OpenServe Analytics Centre
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper sx={statCard}>
              <Groups sx={{ fontSize: 40, color: "#2563eb" }} />
              <Typography>Total Applicants</Typography>
              <Typography fontSize={30} fontWeight="bold">{filtered.length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={statCard}>
              <Verified sx={{ fontSize: 40, color: "#22c55e" }} />
              <Typography>Completed Installations</Typography>
              <Typography fontSize={30} fontWeight="bold">{completedLeads.length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={statCard}>
              <SupportAgent sx={{ fontSize: 40, color: "#7c3aed" }} />
              <Typography>Active Agents</Typography>
              <Typography fontSize={30} fontWeight="bold">
                {new Set(filtered.map(x => x.agentName).filter(Boolean)).size}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={statCard}>
              <TrendingUp sx={{ fontSize: 40, color: "#f59e0b" }} />
              <Typography>Conversion Rate</Typography>
              <Typography fontSize={30} fontWeight="bold">
                {filtered.length === 0 ? 0 : Math.round(((completedLeads.length + approved) / filtered.length) * 100)}%
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        <Box display="flex" gap={2} flexWrap="wrap" mt={4}>
          <Button variant="contained" startIcon={<Download />} onClick={() => window.print()}>
            Print Report
          </Button>
          <Button variant="contained" color="success" startIcon={<Download />} onClick={exportExcel}>
            Export Excel
          </Button>
          <Button variant="contained" color="secondary" startIcon={<Refresh />} onClick={() => window.location.reload()}>
            Refresh Dashboard
          </Button>
        </Box>
      </Paper>

      {/* FOOTER */}
      <Box sx={{ mt: 6, textAlign: "center", color: "#cbd5e1", pb: 4 }}>
        <Typography fontWeight="bold">© 2026 OpenServe Free Trial Administration Portal</Typography>
        <Typography variant="body2">Built for modern fibre management • Real-time Firebase • Secure Admin Dashboard</Typography>
      </Box>
    </Box>
  );
};

export default AdminFreeTrial;

/* STYLES */
const container = {
  minHeight: "100vh",
  padding: 4,
  background: "linear-gradient(135deg,#07152d,#0b4ea2,#00b4ff)",
  backgroundSize: "400% 400%"
};
const title = {
  color: "#fff",
  fontWeight: 900,
  textAlign: "center",
  mb: 1,
  letterSpacing: 1
};
const subTitle = {
  color: "#dbeafe",
  textAlign: "center",
  mb: 4,
  fontSize: 18
};
const filterCard = {
  padding: 3,
  borderRadius: 5,
  background: "rgba(255,255,255,.96)",
  backdropFilter: "blur(14px)",
  mb: 4
};
const chartCard = {
  padding: 3,
  borderRadius: 5,
  background: "rgba(255,255,255,.96)",
  backdropFilter: "blur(18px)"
};
const tableCard = {
  padding: 3,
  marginTop: 4,
  borderRadius: 5,
  background: "rgba(255,255,255,.96)",
  backdropFilter: "blur(18px)"
};
const statCard = {
  padding: 3,
  borderRadius: 5,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 1,
  background: "rgba(255,255,255,.96)",
  boxShadow: "0 15px 35px rgba(0,0,0,.12)",
  transition: "0.4s",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-8px) scale(1.03)"
  }
};
const floatingGlow1 = {
  position: "fixed",
  top: -120,
  left: -120,
  width: 320,
  height: 320,
  borderRadius: "50%",
  background: "rgba(37,99,235,.25)",
  filter: "blur(120px)",
  zIndex: 0
};
const floatingGlow2 = {
  position: "fixed",
  bottom: -150,
  right: -100,
  width: 350,
  height: 350,
  borderRadius: "50%",
  background: "rgba(34,197,94,.18)",
  filter: "blur(140px)",
  zIndex: 0
};
const floatingGlow3 = {
  position: "fixed",
  top: "40%",
  left: "45%",
  width: 220,
  height: 220,
  borderRadius: "50%",
  background: "rgba(0,180,255,.18)",
  filter: "blur(120px)",
  zIndex: 0
};