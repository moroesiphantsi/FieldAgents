import React, { useEffect, useState } from "react";
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
  Divider
} from "@mui/material";
import {
  Search,
  Person,
  Call,
  Email,
  WhatsApp,
  Delete,
  CheckCircle,
  Cancel,
  Visibility,
  Assignment,
  Groups,
  TrendingUp,
  Download,
  Refresh,
  Verified,
  SupportAgent,
  Alarm,
  EmojiEvents,
  HowToReg,
  PhoneInTalk
} from "@mui/icons-material";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
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
import InputAdornment from "@mui/material/InputAdornment";

const COLORS = [
  "#2563eb", // Primary
  "#22c55e", // Success
  "#f59e0b", // Warning
  "#ef4444", // Danger
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4"  // Cyan
];

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

  // Editable Modal Fields (Comments & Reminder)
  const [adminComment, setAdminComment] = useState("");
  const [reminderDateTime, setReminderDateTime] = useState("");

  // Custom Feature States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<any>(null);
  const [confirmNameInput, setConfirmNameInput] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [customerToReject, setCustomerToReject] = useState<any>(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    saveAs(data, "OpenServe_FreeTrial.xlsx");
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
    let data = [...applications];
    if (search !== "") {
      data = data.filter(item => `
        ${item.fullName}
        ${item.phone}
        ${item.email}
        ${item.address}
        ${item.suburb}
        ${item.city}
        ${item.province}
        ${item.agentName}
      `.toLowerCase().includes(search.toLowerCase()));
    }
    if (statusFilter !== "") {
      data = data.filter(x => x.status === statusFilter);
    }
    if (agentFilter !== "") {
      data = data.filter(x => x.agentName === agentFilter);
    }
    if (monthFilter !== "") {
      data = data.filter(item => new Date(item.createdAt).getMonth() === Number(monthFilter));
    }
    if (yearFilter !== "") {
      data = data.filter(item => new Date(item.createdAt).getFullYear() === Number(yearFilter));
    }
    setFiltered(data);
  }, [applications, search, statusFilter, agentFilter, monthFilter, yearFilter]);

  // Status Metrics Breakdown
  const totalApplications = filtered.length;
  const approved = filtered.filter(x => x.status === "Approved").length;
  const pending = filtered.filter(x => x.status === "Pending").length;
  const rejected = filtered.filter(x => x.status === "Rejected").length;
  const won = filtered.filter(x => x.status === "Won").length;
  const signedUp = filtered.filter(x => x.status === "Signed Up").length;
  const contacted = filtered.filter(x => x.status === "Contacted").length;

  const chartData = [
    { name: "Approved", value: approved },
    { name: "Pending", value: pending },
    { name: "Rejected", value: rejected },
    { name: "Won", value: won },
    { name: "Signed Up", value: signedUp },
    { name: "Contacted", value: contacted }
  ].filter(item => item.value > 0);

  const monthlyData = months.map((m, index) => ({
    month: m.substring(0, 3),
    Applications: filtered.filter(item => new Date(item.createdAt).getMonth() === index).length
  }));

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

  const triggerNotifications = (customer: any, newStatus: string, reason?: string) => {
    const cleanPhone = customer.phone.replace(/^0/, "27");
    let message = `Hello ${customer.fullName}, your OpenServe Free Trial application status is: ${newStatus}.`;
    if (newStatus === "Rejected" && reason) {
      message += ` Reason: ${reason}`;
    } else if (newStatus === "Approved" || newStatus === "Signed Up" || newStatus === "Won") {
      message += ` An agent will contact you shortly to complete setup.`;
    }

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    const emailSubject = encodeURIComponent("OpenServe Free Trial Application Status Update");
    const emailBody = encodeURIComponent(message);
    window.location.href = `mailto:${customer.email}?subject=${emailSubject}&body=${emailBody}`;
  };

  const handleStatusChange = (customer: any, newStatus: string) => {
    if (newStatus === "Rejected") {
      setCustomerToReject(customer);
      setRejectDialogOpen(true);
    } else {
      update(ref(db, `freeTrialApplications/${customer.id}`), {
        status: newStatus
      }).then(() => {
        triggerNotifications(customer, newStatus);
      });
    }
  };

  const submitRejection = (reason: string) => {
    if (!customerToReject) return;
    update(ref(db, `freeTrialApplications/${customerToReject.id}`), {
      status: "Rejected",
      rejectionReason: reason
    }).then(() => {
      triggerNotifications(customerToReject, "Rejected", reason);
      setRejectDialogOpen(false);
      setCustomerToReject(null);
    });
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
    if (customerToDelete && confirmNameInput === customerToDelete.fullName) {
      remove(ref(db, "freeTrialApplications/" + customerToDelete.id)).then(() => {
        setDeleteDialogOpen(false);
        setCustomerToDelete(null);
      });
    }
  };

  // Open Detailed Customer View Modal & Initialize editable details
  const handleOpenDetails = (customer: any) => {
    setSelected(customer);
    setAdminComment(customer.adminComment || "");
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

  // Explicit return type ChipProps["color"] resolves the TypeScript union color error
  const getStatusChipColor = (status: string): ChipProps["color"] => {
    switch (status) {
      case "Approved": return "success";
      case "Won": return "success";
      case "Signed Up": return "info";
      case "Contacted": return "secondary";
      case "Pending": return "warning";
      case "Rejected": return "error";
      default: return "default";
    }
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
        Manage every free trial request, approve customers, contact applicants, track performance and monitor schedules.
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
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Contacted">Contacted</MenuItem>
              <MenuItem value="Signed Up">Signed Up</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Won">Won</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
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
              <MenuItem value="">All</MenuItem>
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
            <Typography variant="body2">Total</Typography>
            <Typography fontSize={24} fontWeight="bold">{totalApplications}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={statCard}>
            <PhoneInTalk color="secondary" />
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
            <EmojiEvents sx={{ color: "#f59e0b" }} />
            <Typography variant="body2">Won</Typography>
            <Typography fontSize={24} fontWeight="bold">{won}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={statCard}>
            <Cancel color="error" />
            <Typography variant="body2">Rejected</Typography>
            <Typography fontSize={24} fontWeight="bold">{rejected}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* CHARTS */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} lg={7}>
          <Paper sx={chartCard}>
            <Typography fontWeight="bold" mb={2}>📈 Monthly Applications</Typography>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="Applications" stroke="#2563eb" strokeWidth={4} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Paper sx={chartCard}>
            <Typography fontWeight="bold" mb={2}>📊 Status Distribution</Typography>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={chartData} outerRadius={110} label dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* APPLICATIONS TABLE */}
      <Paper sx={tableCard}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">📋 Free Trial Applications</Typography>
          <Chip label={`${filtered.length} Applications`} color="primary" />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Customer</b></TableCell>
                <TableCell><b>Contact</b></TableCell>
                <TableCell><b>Agent</b></TableCell>
                <TableCell><b>Address / Suburb</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell><b>Reminder</b></TableCell>
                <TableCell align="center"><b>Contact</b></TableCell>
                <TableCell align="center"><b>Manage</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((customer: any) => (
                <TableRow hover key={customer.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: "#2563eb" }}><Person /></Avatar>
                      <Box>
                        <Typography fontWeight={700}>{customer.fullName}</Typography>
                        <Typography variant="body2" color="text.secondary">ID: {customer.idNumber}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography>{customer.phone}</Typography>
                    <Typography variant="body2">{customer.email}</Typography>
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
                      <MenuItem value=""><em>None</em></MenuItem>
                      {agents.map((agent) => (
                        <MenuItem key={agent.id} value={agent.name}>{agent.name}</MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">{customer.suburb || "—"}</Typography>
                    <Typography variant="caption" color="text.secondary">{customer.address}</Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      value={customer.status || "Pending"}
                      onChange={(e) => handleStatusChange(customer, e.target.value)}
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Contacted">Contacted</MenuItem>
                      <MenuItem value="Signed Up">Signed Up</MenuItem>
                      <MenuItem value="Approved">Approved</MenuItem>
                      <MenuItem value="Won">Won</MenuItem>
                      <MenuItem value="Rejected">Rejected</MenuItem>
                    </TextField>
                  </TableCell>
                  <TableCell>
                    {customer.reminderDateTime ? (
                      <Chip
                        icon={<Alarm fontSize="small" />}
                        label={new Date(customer.reminderDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        color="secondary"
                        size="small"
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary">No reminder</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="success" onClick={() => window.open(`https://wa.me/27${customer.phone.replace(/^0/, "")}`, "_blank")}>
                      <WhatsApp />
                    </IconButton>
                    <IconButton color="primary" onClick={() => window.open(`tel:${customer.phone}`)}>
                      <Call />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => window.open(`mailto:${customer.email}`)}>
                      <Email />
                    </IconButton>
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
                    <IconButton color="error" onClick={() => openDeleteConfirmation(customer)} sx={{ ml: 1 }}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* CUSTOMER DETAILS & ACTIONS DIALOG */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>👤 Customer Details & OpenServe Coverage Map</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Full Name</Typography>
                <Typography fontWeight="bold">{selected.fullName}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">ID / Passport Number</Typography>
                <Typography fontWeight="bold">{selected.idNumber}</Typography>
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

              {/* STATUS & REMINDERS SECTION */}
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Current Application Status</Typography>
                <Box mt={0.5}>
                  {/* FIX: Moved fontWeight="bold" into sx prop and typed color function */}
                  <Chip 
                    label={selected.status || "Pending"} 
                    color={getStatusChipColor(selected.status)} 
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
                {(selected.latitude === undefined || selected.longitude === undefined || selected.hasNoCoverage === true || selected.status === "Rejected") ? (
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
                  style={{ height: 300, borderRadius: 12 }}
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
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* REJECTION REASON DIALOG */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Select Rejection Reason</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => submitRejection("We regret to tell you that there is no coverage at your place.")}
            >
              Reason 1: No Coverage at Place
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => submitRejection("We regret to inform you that your credit assessment did not meet the requirements for the free trial application profile.")}
            >
              Reason 2: Credit Check Failure
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => submitRejection("We regret to inform you that there is a pending order.")}
            >
              Reason 3: Existing Active Line Setup
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle style={{ color: '#ef4444' }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography mb={2}>
            Are you sure you want to delete this applicant? To confirm, please type out the customer's full name exactly below:
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
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={customerToDelete ? confirmNameInput !== customerToDelete.fullName : true}
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
              <Typography>Total Customers</Typography>
              <Typography fontSize={30} fontWeight="bold">{filtered.length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={statCard}>
              <Verified sx={{ fontSize: 40, color: "#22c55e" }} />
              <Typography>Successful Trials</Typography>
              <Typography fontSize={30} fontWeight="bold">{approved}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={statCard}>
              <SupportAgent sx={{ fontSize: 40, color: "#7c3aed" }} />
              <Typography>Assigned Agents</Typography>
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
                {filtered.length === 0 ? 0 : Math.round(((approved + won) / filtered.length) * 100)}%
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
  backgroundSize: "400% 400%",
  animation: "gradientMove 15s ease infinite"
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