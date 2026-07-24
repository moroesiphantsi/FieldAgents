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
  Business,
  AttachMoney
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

const AdminTbusiness = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter] = useState("");
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "TB_Applications");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    saveAs(data, "Telkom_Business_Applications.xlsx");
  };

  useEffect(() => {
    const tbRef = ref(db, "tbFibreLeads");
    onValue(tbRef, (snapshot) => {
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
        ${item.firstNames}
        ${item.surname}
        ${item.contactNumber}
        ${item.emailAddress}
        ${item.companyWorkingFor}
        ${item.streetAddress}
        ${item.suburb}
        ${item.townCity}
        ${item.technicianOrSalesAgent}
        ${item.agentLogged}
      `.toLowerCase().includes(search.toLowerCase()));
    }
    if (statusFilter !== "") {
      data = data.filter(x => x.status === statusFilter);
    }
    if (productFilter !== "") {
      data = data.filter(x => x.productType === productFilter);
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
  }, [applications, search, statusFilter, productFilter, agentFilter, monthFilter, yearFilter]);

  // Status Metrics Breakdown
  const totalApplications = filtered.length;
  const approved = filtered.filter(x => x.status === "Approved").length;
  const pending = filtered.filter(x => x.status === "Pending").length;
  const inProgress = filtered.filter(x => x.status === "In Progress").length;
  const rejected = filtered.filter(x => x.status === "Rejected").length;

  const totalCommission = filtered.reduce((acc, curr) => acc + (Number(curr.calculatedCommission) || 0), 0);

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
    update(ref(db, `tbFibreLeads/${customer.id}`), {
      status: newStatus
    });
  };

  /*const handleAgentAssign = (customerId: string, agentName: string) => {
    update(ref(db, `tbFibreLeads/${customerId}`), {
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
    const expectedName = `${customerToDelete?.firstNames || ""} ${customerToDelete?.surname || ""}`.trim();
    if (customerToDelete && confirmNameInput.trim().toLowerCase() === expectedName.toLowerCase()) {
      remove(ref(db, "tbFibreLeads/" + customerToDelete.id)).then(() => {
        setDeleteDialogOpen(false);
        setCustomerToDelete(null);
      });
    }
  };

  const handleOpenDetails = (customer: any) => {
    setSelected(customer);
    setAdminComment(customer.adminComment || customer.additionalComments || "");
    setReminderDateTime(customer.reminderDateTime || "");
    setDetailsOpen(true);
  };

  const handleSaveCustomerNotes = () => {
    if (!selected) return;
    update(ref(db, `tbFibreLeads/${selected.id}`), {
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
        💼 Telkom Business Admin Portal
      </Typography>
      <Typography sx={subTitle}>
        Manage business applications, verify company & banking credentials, calculate commissions, and monitor deal status.
      </Typography>

      {/* FILTER CONTROLS */}
      <Paper sx={filterCard}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search company, applicant, city..."
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
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Product Category"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
            >
              <MenuItem value="">All Products</MenuItem>
              <MenuItem value="TB Fibre">TB Fibre</MenuItem>
              <MenuItem value="TB Voice">TB Voice</MenuItem>
              <MenuItem value="TB PABX">TB PABX</MenuItem>
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
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper sx={statCard}>
            <Assignment color="primary" />
            <Typography variant="body2">Total Deals</Typography>
            <Typography fontSize={24} fontWeight="bold">{totalApplications}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper sx={statCard}>
            <Business color="secondary" />
            <Typography variant="body2">Pending</Typography>
            <Typography fontSize={24} fontWeight="bold">{pending}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper sx={statCard}>
            <CheckCircle color="success" />
            <Typography variant="body2">Approved</Typography>
            <Typography fontSize={24} fontWeight="bold">{approved}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper sx={statCard}>
            <Cancel color="error" />
            <Typography variant="body2">Rejected</Typography>
            <Typography fontSize={24} fontWeight="bold">{rejected}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2.4}>
          <Paper sx={statCard}>
            <AttachMoney sx={{ color: "#22c55e" }} />
            <Typography variant="body2">Total Commission</Typography>
            <Typography fontSize={22} fontWeight="bold" color="success.main">
              R {totalCommission.toLocaleString("en-ZA")}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* CHARTS */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} lg={7}>
          <Paper sx={chartCard}>
            <Typography fontWeight="bold" mb={2}>📈 Monthly Business Deals</Typography>
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
            <Typography fontWeight="bold" mb={2}>📊 Deal Status Distribution</Typography>
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
          <Typography variant="h5" fontWeight="bold">📋 Business Applications Ledger</Typography>
          <Chip label={`${filtered.length} Applications`} color="primary" />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Applicant / Company</b></TableCell>
                <TableCell><b>Contact Info</b></TableCell>
                <TableCell><b>Product & Package</b></TableCell>
                <TableCell><b>Commission</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell><b>Reminder</b></TableCell>
                <TableCell align="center"><b>Contact</b></TableCell>
                <TableCell align="center"><b>Manage</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((item: any) => (
                <TableRow hover key={item.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: "#2563eb" }}><Business /></Avatar>
                      <Box>
                        <Typography fontWeight={700}>
                          {item.title} {item.firstNames} {item.surname}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.companyWorkingFor || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography>{item.contactNumber}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.emailAddress}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="bold" color="primary">
                      {item.packageSelected || item.pabxOption || "—"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.productType}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="bold" color="success.main">
                      R {item.calculatedCommission ? Number(item.calculatedCommission).toLocaleString("en-ZA") : 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      value={item.status || "Pending"}
                      onChange={(e) => handleStatusChange(item, e.target.value)}
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
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
                    <IconButton color="success" onClick={() => window.open(`https://wa.me/27${item.contactNumber?.replace(/^0/, "")}`, "_blank")}>
                      <WhatsApp />
                    </IconButton>
                    <IconButton color="primary" onClick={() => window.open(`tel:${item.contactNumber}`)}>
                      <Call />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => window.open(`mailto:${item.emailAddress}`)}>
                      <Email />
                    </IconButton>
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

      {/* CUSTOMER DETAILS & ACTIONS DIALOG */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>💼 Business Application Full Profile Details</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Full Applicant Name</Typography>
                <Typography fontWeight="bold">{selected.title} {selected.firstNames} {selected.surname}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">ID / Passport Number</Typography>
                <Typography fontWeight="bold">{selected.idOrPassport}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Contact Number & Email</Typography>
                <Typography fontWeight="bold">{selected.contactNumber} | {selected.emailAddress}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Company & Contact</Typography>
                <Typography fontWeight="bold">{selected.companyWorkingFor} ({selected.companyContactNo || "N/A"})</Typography>
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              {/* LOCATION DETAILS */}
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Street Address</Typography>
                <Typography fontWeight="bold">{selected.streetAddress || selected.installationAddress || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="caption" color="text.secondary">Suburb & City</Typography>
                <Typography fontWeight="bold">{selected.suburb || "N/A"}, {selected.townCity || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="caption" color="text.secondary">Province & Postal Code</Typography>
                <Typography fontWeight="bold">{selected.province || "N/A"} ({selected.postalCode || "N/A"})</Typography>
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              {/* FINANCIAL & BANKING DETAILS */}
              <Grid item xs={12} md={4}>
                <Typography variant="caption" color="text.secondary">Gross / Net Income</Typography>
                <Typography fontWeight="bold">R {selected.grossIncome} / R {selected.netIncome}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="caption" color="text.secondary">Bank & Account Number</Typography>
                <Typography fontWeight="bold">{selected.bankName} - {selected.accountNumber}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="caption" color="text.secondary">Debit Order Date</Typography>
                <Typography fontWeight="bold">{selected.debitOrderDate || "N/A"}</Typography>
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              {/* ATTACHMENT SUMMARY */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight="bold" color="primary">Uploaded Document Files</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">ID Copy Doc:</Typography>
                <Typography variant="body2" fontWeight="bold">{selected.attachments?.idOrPassportDoc || "Not Uploaded"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">CK Document:</Typography>
                <Typography variant="body2" fontWeight="bold">{selected.attachments?.ckDocument || "Not Uploaded"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Bank Statement Doc:</Typography>
                <Typography variant="body2" fontWeight="bold">{selected.attachments?.bankStatementDoc || "Not Uploaded"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Proof of Address Doc:</Typography>
                <Typography variant="body2" fontWeight="bold">{selected.attachments?.proofOfAddressDoc || "Not Uploaded"}</Typography>
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              {/* STATUS & REMINDERS SECTION */}
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Current Application Status</Typography>
                <Box mt={0.5}>
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
                  placeholder="Enter notes, credit assessment outcomes, follow-up feedback..."
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
            Are you sure you want to delete this business application? To confirm, please type out the customer's full name exactly below:
            <br /><strong>{`${customerToDelete?.firstNames || ""} ${customerToDelete?.surname || ""}`}</strong>
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
            disabled={
              customerToDelete
                ? confirmNameInput.trim().toLowerCase() !== `${customerToDelete?.firstNames || ""} ${customerToDelete?.surname || ""}`.trim().toLowerCase()
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
          📊 Telkom Business Analytics Centre
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper sx={statCard}>
              <Groups sx={{ fontSize: 40, color: "#2563eb" }} />
              <Typography>Total Deals</Typography>
              <Typography fontSize={30} fontWeight="bold">{filtered.length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={statCard}>
              <Verified sx={{ fontSize: 40, color: "#22c55e" }} />
              <Typography>Approved Deals</Typography>
              <Typography fontSize={30} fontWeight="bold">{approved}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={statCard}>
              <SupportAgent sx={{ fontSize: 40, color: "#7c3aed" }} />
              <Typography>Assigned Agents</Typography>
              <Typography fontSize={30} fontWeight="bold">
                {new Set(filtered.map(x => x.technicianOrSalesAgent || x.agentLogged).filter(Boolean)).size}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={statCard}>
              <TrendingUp sx={{ fontSize: 40, color: "#f59e0b" }} />
              <Typography>Conversion Rate</Typography>
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
        <Typography fontWeight="bold">© 2026 Telkom Business Administration Portal</Typography>
        <Typography variant="body2">Built for enterprise fibre & product management • Real-time Firebase • Secure Admin Dashboard</Typography>
      </Box>
    </Box>
  );
};

export default AdminTbusiness;

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