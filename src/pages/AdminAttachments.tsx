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
  Divider,
  InputAdornment
} from "@mui/material";
import {
  Search,
  Person,
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
  PendingActions
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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  ref,
  onValue,
  update,
  remove
} from "firebase/database";
import { db } from "../firebase";

const COLORS = [
  "#2563eb", // Primary
  "#22c55e", // Success
  "#f59e0b", // Warning
  "#ef4444", // Danger
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4"  // Cyan
];

const AdminAttachments = () => {
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

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attachment_Leads");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    saveAs(data, "OpenServe_AttachmentLeads.xlsx");
  };

  useEffect(() => {
    const leadsRef = ref(db, "attachmentFibreLeads");
    onValue(leadsRef, (snapshot) => {
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
        ${item.technicianOrSalesAgent}
        ${item.agentLogged}
        ${item.contractDocName}
        ${item.idCopyDocName}
      `.toLowerCase().includes(search.toLowerCase()));
    }
    if (statusFilter !== "") {
      data = data.filter(x => x.status === statusFilter);
    }
    if (agentFilter !== "") {
      data = data.filter(x => (x.technicianOrSalesAgent === agentFilter || x.agentLogged === agentFilter));
    }
    if (monthFilter !== "") {
      data = data.filter(item => item.submittedAt && new Date(item.submittedAt).getMonth() === Number(monthFilter));
    }
    if (yearFilter !== "") {
      data = data.filter(item => item.submittedAt && new Date(item.submittedAt).getFullYear() === Number(yearFilter));
    }
    setFiltered(data);
  }, [applications, search, statusFilter, agentFilter, monthFilter, yearFilter]);

  // Status Metrics Breakdown
  const totalApplications = filtered.length;
  const approved = filtered.filter(x => x.status === "Approved").length;
  const pending = filtered.filter(x => x.status === "Pending Vetting" || x.status === "Pending").length;
  const inProgress = filtered.filter(x => x.status === "In Progress").length;
  const rejected = filtered.filter(x => x.status === "Rejected").length;

  const chartData = [
    { name: "Approved", value: approved },
    { name: "Pending", value: pending },
    { name: "In Progress", value: inProgress },
    { name: "Rejected", value: rejected }
  ].filter(item => item.value > 0);

  const monthlyData = months.map((m, index) => ({
    month: m.substring(0, 3),
    Applications: filtered.filter(item => item.submittedAt && new Date(item.submittedAt).getMonth() === index).length
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

  const handleStatusChange = (customer: any, newStatus: string) => {
    update(ref(db, `attachmentFibreLeads/${customer.id}`), {
      status: newStatus
    });
  };

  /*const handleAgentAssign = (customerId: string, agentName: string) => {
    update(ref(db, `attachmentFibreLeads/${customerId}`), {
      technicianOrSalesAgent: agentName,
      agentLogged: agentName
    });
  };*/

  const openDeleteConfirmation = (customer: any) => {
    setCustomerToDelete(customer);
    setConfirmNameInput("");
    setDeleteDialogOpen(true);
  };

  const processDelete = () => {
    const expected = customerToDelete?.technicianOrSalesAgent || customerToDelete?.agentLogged || "";
    if (customerToDelete && confirmNameInput.trim().toLowerCase() === expected.trim().toLowerCase()) {
      remove(ref(db, "attachmentFibreLeads/" + customerToDelete.id)).then(() => {
        setDeleteDialogOpen(false);
        setCustomerToDelete(null);
      });
    }
  };

  const handleOpenDetails = (customer: any) => {
    setSelected(customer);
    setAdminComment(customer.adminComment || "");
    setReminderDateTime(customer.reminderDateTime || "");
    setDetailsOpen(true);
  };

  const handleSaveCustomerNotes = () => {
    if (!selected) return;
    update(ref(db, `attachmentFibreLeads/${selected.id}`), {
      adminComment: adminComment,
      reminderDateTime: reminderDateTime
    }).then(() => {
      setDetailsOpen(false);
    });
  };

  const getStatusChipColor = (status: string): ChipProps["color"] => {
    switch (status) {
      case "Approved": return "success";
      case "In Progress": return "info";
      case "Pending Vetting":
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
        📁 OpenServe Attachment Leads Admin Portal
      </Typography>
      <Typography sx={subTitle}>
        Manage submitted contract attachments, verify uploaded documents, assign technicians, and monitor status updates.
      </Typography>

      {/* FILTER CONTROLS */}
      <Paper sx={filterCard}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search agent, contract, ID doc..."
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
              <MenuItem value="Pending Vetting">Pending Vetting</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
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
        <Grid item xs={6} sm={3} md={3}>
          <Paper sx={statCard}>
            <Assignment color="primary" />
            <Typography variant="body2">Total Leads</Typography>
            <Typography fontSize={24} fontWeight="bold">{totalApplications}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3} md={3}>
          <Paper sx={statCard}>
            <PendingActions color="warning" />
            <Typography variant="body2">Pending Vetting</Typography>
            <Typography fontSize={24} fontWeight="bold">{pending}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3} md={3}>
          <Paper sx={statCard}>
            <CheckCircle color="success" />
            <Typography variant="body2">Approved</Typography>
            <Typography fontSize={24} fontWeight="bold">{approved}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3} md={3}>
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
            <Typography fontWeight="bold" mb={2}>📈 Monthly Submissions</Typography>
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
            <Typography fontWeight="bold" mb={2}>📊 Status Breakdown</Typography>
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
          <Typography variant="h5" fontWeight="bold">📋 Attachment Leads Registry</Typography>
          <Chip label={`${filtered.length} Submissions`} color="primary" />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Agent / Tech</b></TableCell>
                <TableCell><b>Contract Doc</b></TableCell>
                <TableCell><b>ID Copy Doc</b></TableCell>
                <TableCell><b>Other Docs</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell><b>Reminder</b></TableCell>
                <TableCell align="center"><b>Manage</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((item: any) => (
                <TableRow hover key={item.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: "#2563eb" }}><Person /></Avatar>
                      <Box>
                        <Typography fontWeight={700}>
                          {item.technicianOrSalesAgent || item.agentLogged || "Unassigned"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : "—"}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color={item.contractDocName ? "success.main" : "error.main"}>
                      {item.contractDocName ? `✓ ${item.contractDocName}` : "Missing"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color={item.idCopyDocName ? "success.main" : "error.main"}>
                      {item.idCopyDocName ? `✓ ${item.idCopyDocName}` : "Missing"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      Bank: {item.bankStatementDocName ? "Yes" : "No"}<br />
                      Proof Addr: {item.proofOfAddressDocName ? "Yes" : "No"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      value={item.status || "Pending Vetting"}
                      onChange={(e) => handleStatusChange(item, e.target.value)}
                      sx={{ minWidth: 140 }}
                    >
                      <MenuItem value="Pending Vetting">Pending Vetting</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Approved">Approved</MenuItem>
                      <MenuItem value="Rejected">Rejected</MenuItem>
                    </TextField>
                  </TableCell>
                  <TableCell>
                    {item.reminderDateTime ? (
                      <Chip
                        icon={<Alarm fontSize="small" />}
                        label={new Date(item.reminderDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        color="secondary"
                        size="small"
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary">No reminder</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Visibility />}
                      onClick={() => handleOpenDetails(item)}
                    >
                      View
                    </Button>
                    <IconButton color="error" onClick={() => openDeleteConfirmation(item)} sx={{ ml: 1 }}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* DETAILS & ACTIONS DIALOG */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>📁 Attachment Lead Verification & Document Details</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Sales Agent / Technician Name</Typography>
                <Typography fontWeight="bold">{selected.technicianOrSalesAgent || selected.agentLogged || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Submission Timestamp</Typography>
                <Typography fontWeight="bold">{selected.submittedAt ? new Date(selected.submittedAt).toLocaleString() : "N/A"}</Typography>
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              {/* ATTACHMENTS LIST */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" mb={1}>📄 Attached Documents Checklist</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary">Contract Document</Typography>
                  <Typography fontWeight="bold" color={selected.contractDocName ? "primary.main" : "error.main"}>
                    {selected.contractDocName || "Not Provided"}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary">ID Copy Document</Typography>
                  <Typography fontWeight="bold" color={selected.idCopyDocName ? "primary.main" : "error.main"}>
                    {selected.idCopyDocName || "Not Provided"}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary">Bank Statement Document</Typography>
                  <Typography fontWeight="bold" color={selected.bankStatementDocName ? "primary.main" : "text.secondary"}>
                    {selected.bankStatementDocName || "Not Provided"}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary">Proof of Address Document</Typography>
                  <Typography fontWeight="bold" color={selected.proofOfAddressDocName ? "primary.main" : "text.secondary"}>
                    {selected.proofOfAddressDocName || "Not Provided"}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              {/* STATUS & REMINDERS */}
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Current Application Status</Typography>
                <Box mt={0.5}>
                  <Chip
                    label={selected.status || "Pending Vetting"}
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
                  label="Additional Admin Comments / Vetting Notes"
                  placeholder="Enter notes, verification feedback, missing files comments..."
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                />
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

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle style={{ color: '#ef4444' }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography mb={2}>
            Are you sure you want to delete this attachment lead? To confirm, please type out the Agent Name exactly below:
            <br /><strong>{customerToDelete?.technicianOrSalesAgent || customerToDelete?.agentLogged}</strong>
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Agent Full Name"
            value={confirmNameInput}
            onChange={(e) => setConfirmNameInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={
              customerToDelete
                ? confirmNameInput.trim().toLowerCase() !== (customerToDelete.technicianOrSalesAgent || customerToDelete.agentLogged || "").trim().toLowerCase()
                : true
            }
            onClick={processDelete}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      {/* ANALYTICS & EXPORT SECTION */}
      <Paper sx={{ mt: 4, p: 4, borderRadius: 5, background: "rgba(255,255,255,.96)", backdropFilter: "blur(16px)" }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          📊 Attachment Vetting Analytics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper sx={statCard}>
              <Groups sx={{ fontSize: 40, color: "#2563eb" }} />
              <Typography>Total Submissions</Typography>
              <Typography fontSize={30} fontWeight="bold">{filtered.length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={statCard}>
              <Verified sx={{ fontSize: 40, color: "#22c55e" }} />
              <Typography>Approved Applications</Typography>
              <Typography fontSize={30} fontWeight="bold">{approved}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={statCard}>
              <SupportAgent sx={{ fontSize: 40, color: "#7c3aed" }} />
              <Typography>Active Agents</Typography>
              <Typography fontSize={30} fontWeight="bold">
                {new Set(filtered.map(x => x.technicianOrSalesAgent || x.agentLogged).filter(Boolean)).size}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={statCard}>
              <TrendingUp sx={{ fontSize: 40, color: "#f59e0b" }} />
              <Typography>Approval Rate</Typography>
              <Typography fontSize={30} fontWeight="bold">
                {filtered.length === 0 ? 0 : Math.round((approved / filtered.length) * 100)}%
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
        <Typography fontWeight="bold">© 2026 OpenServe Attachment Vetting Portal</Typography>
        <Typography variant="body2">Built for document pre-vetting • Real-time Firebase • Secure Admin Dashboard</Typography>
      </Box>
    </Box>
  );
};

export default AdminAttachments;

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