import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import {
  Send,
  UploadFile,
  Edit,
  Delete,
  Visibility,
  Cancel,
  CheckCircle,
  Info,
} from "@mui/icons-material";
import { ref, push, set, update, remove, onValue } from "firebase/database";
import { db } from "../firebase";

// Prepaid Catalog with Auto-Calculated Price and Fixed R50 Commission
interface PrepaidPackageInfo {
  label: string;
  price: string;
  commission: string;
}

const PREPAID_PACKAGES: PrepaidPackageInfo[] = [
  {
    label: "Prepaid Fibre 20/10Mbps 30Days @ R349 Voucher",
    price: "R349.00",
    commission: "R50.00",
  },
  {
    label: "Prepaid Stream Connect 25/25Mbps 30days @ R499 voucher",
    price: "R499.00",
    commission: "R50.00",
  },
  {
    label: "Prepaid Stream Connect 50/25Mbps 30days @ R700 voucher",
    price: "R700.00",
    commission: "R50.00",
  },
  {
    label: "Not sure if my address is covered. Please contact me",
    price: "R0.00",
    commission: "R0.00",
  },
];

interface PrepaidLeadData {
  id?: string;
  title: string;
  surnameOrBusinessName: string;
  firstNamesOrContactName: string;
  idOrPassportOrRegNo: string;
  contactNumber: string;
  emailAddress: string;
  // Structured Address Fields
  streetAddress: string;
  suburb: string;
  townCity: string;
  province: string;
  postalCode: string;
  installationAddress?: string;
  // Package & Financials
  packageSelected: string;
  packagePrice?: string;
  commissionAmount?: string;
  additionalComments: string;
  technicianOrSalesAgent: string;
  status?: string;
  agentLogged?: string;
  submittedAt?: string;
  attachments?: {
    idOrPassportDoc?: string;
  };
}

const initialFormState: PrepaidLeadData = {
  title: "",
  surnameOrBusinessName: "",
  firstNamesOrContactName: "",
  idOrPassportOrRegNo: "",
  contactNumber: "",
  emailAddress: "",
  streetAddress: "",
  suburb: "",
  townCity: "",
  province: "",
  postalCode: "",
  packageSelected: "",
  packagePrice: "",
  commissionAmount: "",
  additionalComments: "",
  technicianOrSalesAgent: "",
};

const FieldUpdatesPrepaid = () => {
  const [activeAgentName, setActiveAgentName] = useState("");
  const [formData, setFormData] = useState<PrepaidLeadData>(initialFormState);

  // Realtime leads list & UI states
  const [leadsList, setLeadsList] = useState<PrepaidLeadData[]>([]);
  const [showApplications, setShowApplications] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // View Details Modal State
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedLeadDetails, setSelectedLeadDetails] = useState<PrepaidLeadData | null>(null);

  // Delete modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<PrepaidLeadData | null>(null);
  const [confirmNameInput, setConfirmNameInput] = useState("");

  // Attachments State
  const [idOrPassportDoc, setIdOrPassportDoc] = useState<File | null>(null);

  useEffect(() => {
    const savedAgent = sessionStorage.getItem("activeAgentName");
    if (savedAgent) {
      setActiveAgentName(savedAgent);
    }

    // Subscribe to Realtime Database node for Prepaid
    const leadsRef = ref(db, "fibreLeads");
    const unsubscribe = onValue(leadsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedLeads: PrepaidLeadData[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setLeadsList(formattedLeads.reverse());
      } else {
        setLeadsList([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Filter leads so agents ONLY see their own applications
  const userLeads = leadsList.filter((lead) => {
    if (!activeAgentName) return true; // Show all if logged in as admin / fallback
    const agent = (lead.agentLogged || lead.technicianOrSalesAgent || "").toLowerCase();
    return agent === activeAgentName.toLowerCase();
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Dynamic Package Selection with Auto Price & R50 Commission calculation
  const handlePackageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedPkgName = e.target.value;
    const matchedPkg = PREPAID_PACKAGES.find((p) => p.label === selectedPkgName);

    setFormData({
      ...formData,
      packageSelected: selectedPkgName,
      packagePrice: matchedPkg ? matchedPkg.price : "R0.00",
      commissionAmount: matchedPkg ? matchedPkg.commission : "R0.00",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdOrPassportDoc(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ID / Passport Upload Validation for new submissions
    if (!editingId && !idOrPassportDoc) {
      alert("Please upload an ID Copy or Passport (Compulsory).");
      return;
    }

    try {
      if (editingId) {
        // UPDATE Existing Application
        const leadRef = ref(db, `fibreLeads/${editingId}`);
        await update(leadRef, {
          ...formData,
          updatedAt: new Date().toISOString(),
        });
        alert("Prepaid application updated successfully!");
        setEditingId(null);
      } else {
        // CREATE New Application
        const leadsRef = ref(db, "fibreLeads");
        const newLeadRef = push(leadsRef);

        const payload = {
          ...formData,
          status: "Pending",
          agentLogged: activeAgentName || formData.technicianOrSalesAgent || "System Agent",
          submittedAt: new Date().toISOString(),
          attachments: {
            idOrPassportDoc: idOrPassportDoc ? idOrPassportDoc.name : null,
          },
        };

        await set(newLeadRef, payload);
        alert("Prepaid Fibre Lead successfully submitted!");
      }

      // Reset form
      setFormData(initialFormState);
      setIdOrPassportDoc(null);
    } catch (err: any) {
      alert("Error saving record: " + err.message);
    }
  };

  // Edit Mode Handler
  const handleEdit = (lead: PrepaidLeadData) => {
    setEditingId(lead.id || null);
    setFormData(lead);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cancel Edit Mode
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormState);
  };

  // View Details Modal Handler
  const handleViewDetails = (lead: PrepaidLeadData) => {
    setSelectedLeadDetails(lead);
    setViewDetailsOpen(true);
  };

  // Delete Confirmation Handlers
  const handleDeleteClick = (lead: PrepaidLeadData) => {
    setLeadToDelete(lead);
    setConfirmNameInput("");
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!leadToDelete || !leadToDelete.id) return;
    try {
      const targetRef = ref(db, `fibreLeads/${leadToDelete.id}`);
      await remove(targetRef);
      alert("Application deleted successfully.");
      setDeleteDialogOpen(false);
      setLeadToDelete(null);
      setConfirmNameInput("");
    } catch (err: any) {
      alert("Failed to delete application: " + err.message);
    }
  };

  const getStatusChipColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "success";
      case "in progress":
        return "info";
      case "rejected":
        return "error";
      default:
        return "warning";
    }
  };

  const expectedCustomerName = leadToDelete
    ? `${leadToDelete.firstNamesOrContactName} ${leadToDelete.surnameOrBusinessName}`.trim()
    : "";

  return (
    <Box sx={styles.container}>
      <Paper sx={styles.card}>
        {/* FORM HEADER */}
        <Typography variant="h4" fontWeight="900" textAlign="center" sx={{ color: "#fff", mb: 1 }}>
          {editingId ? "Edit Prepaid Application" : "Prepaid Openserve Fibre | Telkom ISP 14 days Free"}
        </Typography>

        <Typography textAlign="center" sx={{ color: "#94a3b8", mb: 1, fontSize: 14 }}>
          Control your Fibre Internet Spend with Prepaid Fibre. No contracts, No credit Vetting. Complete the form and get connected.
        </Typography>

        <Typography textAlign="center" sx={{ color: "#cbd5e1", mb: 3, fontSize: 13, fontWeight: "bold" }}>
          Free installation till end of September 2026. WhatsApp: <span style={{ color: "#3b82f6" }}>0836078922</span>
        </Typography>

        {activeAgentName && (
          <Alert severity="info" sx={{ mb: 3, backgroundColor: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
            Active Logged Agent: <b>{activeAgentName}</b>
          </Alert>
        )}

        {editingId && (
          <Alert
            severity="warning"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={handleCancelEdit}>
                Cancel Edit
              </Button>
            }
          >
            Editing Prepaid Lead ID: <b>{editingId}</b>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* TITLE */}
            <Grid item xs={12} sm={3}>
              <TextField
                select
                required
                fullWidth
                label="Title *"
                name="title"
                value={formData.title}
                onChange={handleChange}
                sx={styles.input}
              >
                {["Mr", "Mrs", "Miss", "MS", "Dr", "PS", "Prof", "Business"].map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* SURNAME OR BUSINESS NAME */}
            <Grid item xs={12} sm={4.5}>
              <TextField
                required
                fullWidth
                label="Surname or Business Name *"
                name="surnameOrBusinessName"
                value={formData.surnameOrBusinessName}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            {/* FIRST NAMES OR BUSINESS CONTACT NAME */}
            <Grid item xs={12} sm={4.5}>
              <TextField
                required
                fullWidth
                label="First Names as on ID or Business contact name *"
                name="firstNamesOrContactName"
                value={formData.firstNamesOrContactName}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            {/* ID NUMBER / PASSPORT OR BUSINESS REG */}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="ID Number/ Passport or business registration *"
                name="idOrPassportOrRegNo"
                value={formData.idOrPassportOrRegNo}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            {/* CONTACT NUMBER */}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Contact number *"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            {/* EMAIL ADDRESS */}
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address *"
                type="email"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            {/* DETAILED INSTALLATION / DELIVERY ADDRESS */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ color: "#3b82f6", mt: 1, fontWeight: "bold" }}>
                Installation / Delivery Address Details
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Street Address (House/Complex No & Street) *"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Suburb *"
                name="suburb"
                value={formData.suburb}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Town / City *"
                name="townCity"
                value={formData.townCity}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                required
                fullWidth
                label="Province *"
                name="province"
                value={formData.province}
                onChange={handleChange}
                sx={styles.input}
              >
                {[
                  "Eastern Cape",
                  "Free State",
                  "Gauteng",
                  "KwaZulu-Natal",
                  "Limpopo",
                  "Mpumalanga",
                  "Northern Cape",
                  "North West",
                  "Western Cape",
                ].map((p) => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Postal Code *"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            {/* CHOOSE PREPAID PACKAGE */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ color: "#3b82f6", mt: 1, fontWeight: "bold" }}>
                Prepaid Package Selection
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                required
                fullWidth
                label="Choose the Right Prepaid Fibre Package *"
                name="packageSelected"
                value={formData.packageSelected}
                onChange={handlePackageChange}
                sx={styles.input}
              >
                {PREPAID_PACKAGES.map((pkg) => (
                  <MenuItem key={pkg.label} value={pkg.label}>
                    {pkg.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* DYNAMIC POPUP CARD FOR PACKAGE AMOUNT & COMMISSION */}
            {formData.packageSelected && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "10px",
                    background: "rgba(59, 130, 246, 0.1)",
                    border: "1px solid #3b82f6",
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box textAlign="center">
                    <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                      Voucher Price
                    </Typography>
                    <Typography variant="h6" sx={{ color: "#60a5fa", fontWeight: "bold" }}>
                      {formData.packagePrice}
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
                  <Box textAlign="center">
                    <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                      Agent Commission Earned
                    </Typography>
                    <Typography variant="h6" sx={{ color: "#10b981", fontWeight: "bold" }}>
                      {formData.commissionAmount}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}

            {/* ADDITIONAL COMMENTS */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Additional Comments"
                name="additionalComments"
                value={formData.additionalComments}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            {/* AGENT / TECHNICIAN NAME */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Technician Name or Sales agent"
                name="technicianOrSalesAgent"
                value={activeAgentName || formData.technicianOrSalesAgent}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            {/* ATTACHMENT SECTION - ID COPY / PASSPORT */}
            {!editingId && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.1)" }} />
                  <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold", mb: 1 }}>
                    Required Attachments
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<UploadFile />}
                    sx={styles.uploadBtn}
                  >
                    Upload ID Copy or Passport * (Compulsory)
                    <input type="file" hidden onChange={handleFileChange} />
                  </Button>
                  {idOrPassportDoc && (
                    <Typography variant="caption" sx={{ color: "#10b981", mt: 0.5, display: "block" }}>
                      Selected: {idOrPassportDoc.name}
                    </Typography>
                  )}
                </Grid>
              </>
            )}

            {/* SUBMIT BUTTON */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                startIcon={<Send />}
                sx={styles.submitButton}
              >
                {editingId ? "Update Prepaid Application" : "Submit Prepaid Application"}
              </Button>
            </Grid>
          </Grid>
        </form>

        {/* BOTTOM ACTION BAR - VIEW MY APPLICATIONS */}
        <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.1)" }} />

        <Box sx={{ textAlign: "center" }}>
          <Button
            variant="outlined"
            size="large"
            startIcon={<Visibility />}
            onClick={() => setShowApplications(!showApplications)}
            sx={{
              borderColor: "#3b82f6",
              color: "#60a5fa",
              px: 4,
              py: 1.2,
              borderRadius: "10px",
              "&:hover": { borderColor: "#60a5fa", backgroundColor: "rgba(59, 130, 246, 0.1)" },
            }}
          >
            {showApplications ? "Hide Applications" : `View My Prepaid Applications (${userLeads.length})`}
          </Button>
        </Box>

        {/* TABLE SECTION - ISOLATED TO LOGGED AGENT ONLY */}
        {showApplications && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ color: "#fff", mb: 2, fontWeight: "bold" }}>
              My Submitted Prepaid Applications
            </Typography>

            <TableContainer component={Paper} sx={styles.tableContainer}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  <TableRow>
                    <TableCell sx={styles.th}>Applicant / Business</TableCell>
                    <TableCell sx={styles.th}>Contact / ID</TableCell>
                    <TableCell sx={styles.th}>Prepaid Deal</TableCell>
                    <TableCell sx={styles.th}>Commission</TableCell>
                    <TableCell sx={styles.th}>Status</TableCell>
                    <TableCell sx={styles.th} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ color: "#94a3b8", py: 3 }}>
                        No Prepaid Fibre records found for your account.
                      </TableCell>
                    </TableRow>
                  ) : (
                    userLeads.map((lead) => (
                      <TableRow key={lead.id} sx={{ "&:hover": { backgroundColor: "rgba(255,255,255,0.02)" } }}>
                        <TableCell sx={styles.td}>
                          {lead.title} {lead.firstNamesOrContactName} {lead.surnameOrBusinessName}
                        </TableCell>
                        <TableCell sx={styles.td}>
                          {lead.contactNumber}<br />
                          <small style={{ color: "#94a3b8" }}>{lead.idOrPassportOrRegNo}</small>
                        </TableCell>
                        <TableCell sx={styles.td}>{lead.packageSelected}</TableCell>
                        <TableCell sx={{ ...styles.td, color: "#10b981", fontWeight: "bold" }}>
                          {lead.commissionAmount || "R50.00"}
                        </TableCell>
                        <TableCell sx={styles.td}>
                          <Chip
                            label={lead.status || "Pending"}
                            color={getStatusChipColor(lead.status) as any}
                            size="small"
                            sx={{ fontWeight: "bold" }}
                          />
                        </TableCell>
                        <TableCell sx={styles.td} align="center">
                          <Tooltip title="View All Details">
                            <IconButton color="info" onClick={() => handleViewDetails(lead)} size="small">
                              <Info fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Record">
                            <IconButton color="primary" onClick={() => handleEdit(lead)} size="small">
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Record">
                            <IconButton color="error" onClick={() => handleDeleteClick(lead)} size="small">
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      {/* VIEW ALL DETAILS DIALOG */}
      <Dialog
        open={viewDetailsOpen}
        onClose={() => setViewDetailsOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: "#0f172a",
            color: "#fff",
            borderRadius: "16px",
            minWidth: { xs: "90%", sm: "500px" },
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#3b82f6", fontWeight: "bold" }}>
          Prepaid Application Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedLeadDetails && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography variant="subtitle2" sx={{ color: "#60a5fa" }}>Applicant / Business Info</Typography>
              <Typography variant="body2">
                <b>Name:</b> {selectedLeadDetails.title} {selectedLeadDetails.firstNamesOrContactName} {selectedLeadDetails.surnameOrBusinessName}
              </Typography>
              <Typography variant="body2"><b>ID / Passport / Reg No:</b> {selectedLeadDetails.idOrPassportOrRegNo}</Typography>
              <Typography variant="body2"><b>Contact:</b> {selectedLeadDetails.contactNumber} | {selectedLeadDetails.emailAddress}</Typography>

              <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.08)" }} />

              <Typography variant="subtitle2" sx={{ color: "#60a5fa" }}>Installation Address</Typography>
              <Typography variant="body2"><b>Street Address:</b> {selectedLeadDetails.streetAddress || selectedLeadDetails.installationAddress}</Typography>
              <Typography variant="body2"><b>Suburb:</b> {selectedLeadDetails.suburb || "N/A"}</Typography>
              <Typography variant="body2"><b>Town / City:</b> {selectedLeadDetails.townCity || "N/A"}</Typography>
              <Typography variant="body2"><b>Province:</b> {selectedLeadDetails.province || "N/A"}</Typography>
              <Typography variant="body2"><b>Postal Code:</b> {selectedLeadDetails.postalCode || "N/A"}</Typography>

              <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.08)" }} />

              <Typography variant="subtitle2" sx={{ color: "#60a5fa" }}>Package & Commission Details</Typography>
              <Typography variant="body2"><b>Selected Package:</b> {selectedLeadDetails.packageSelected}</Typography>
              <Typography variant="body2"><b>Package Price:</b> {selectedLeadDetails.packagePrice || "N/A"}</Typography>
              <Typography variant="body2" sx={{ color: "#10b981" }}><b>Commission Earned:</b> {selectedLeadDetails.commissionAmount || "R50.00"}</Typography>
              <Typography variant="body2"><b>Additional Comments:</b> {selectedLeadDetails.additionalComments || "None"}</Typography>

              <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.08)" }} />

              <Typography variant="subtitle2" sx={{ color: "#60a5fa" }}>Submission Details</Typography>
              <Typography variant="body2"><b>Agent Logged:</b> {selectedLeadDetails.agentLogged || selectedLeadDetails.technicianOrSalesAgent}</Typography>
              <Typography variant="body2"><b>ID Document:</b> {selectedLeadDetails.attachments?.idOrPassportDoc || "Uploaded"}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <Button onClick={() => setViewDetailsOpen(false)} variant="contained" sx={{ background: "#3b82f6" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: "#1e293b",
            color: "#fff",
            borderRadius: "12px",
            minWidth: { xs: "90%", sm: "400px" },
          },
        }}
      >
        <DialogTitle sx={{ color: "#ef4444", fontWeight: "bold" }}>
          Confirm Application Deletion
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2, color: "#cbd5e1", fontSize: 14 }}>
            To confirm deletion, please type the exact full applicant/business name below:
            <br />
            <b style={{ color: "#f59e0b" }}>{expectedCustomerName}</b>
          </Typography>
          <TextField
            fullWidth
            placeholder="Type name here"
            value={confirmNameInput}
            onChange={(e) => setConfirmNameInput(e.target.value)}
            sx={styles.input}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            startIcon={<Cancel />}
            sx={{ color: "#94a3b8" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={confirmNameInput.trim().toLowerCase() !== expectedCustomerName.toLowerCase()}
            startIcon={<CheckCircle />}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 16px",
    background: "linear-gradient(135deg, #030712 0%, #0f172a 50%, #1e3a8a 100%)",
  },
  card: {
    maxWidth: 950,
    width: "100%",
    p: 4,
    borderRadius: "16px",
    background: "rgba(17, 24, 39, 0.85)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
  input: {
    "& .MuiOutlinedInput-root": {
      color: "#fff",
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      borderRadius: "10px",
      "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
      "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
    },
    "& .MuiInputLabel-root": { color: "#94a3b8" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" },
    "& .MuiSvgIcon-root": { color: "#94a3b8" },
  },
  uploadBtn: {
    borderColor: "rgba(255, 255, 255, 0.2)",
    color: "#cbd5e1",
    padding: "12px",
    borderRadius: "10px",
    textTransform: "none",
    "&:hover": {
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.05)",
    },
  },
  submitButton: {
    py: 1.5,
    fontWeight: "bold",
    borderRadius: "10px",
    textTransform: "none",
    fontSize: "1.05rem",
    background: "linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)",
    boxShadow: "0 4px 20px rgba(37, 99, 235, 0.3)",
    "&:hover": {
      background: "linear-gradient(90deg, #1d4ed8 0%, #6d28d9 100%)",
    },
  },
  tableContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "10px",
  },
  th: {
    color: "#94a3b8",
    fontWeight: "bold",
    borderColor: "rgba(255,255,255,0.08)",
  },
  td: {
    color: "#e2e8f0",
    borderColor: "rgba(255,255,255,0.08)",
  },
};

export default FieldUpdatesPrepaid;