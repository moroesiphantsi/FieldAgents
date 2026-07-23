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
  Business,
  ContactPhone,
  Edit,
  Delete,
  Visibility,
  Cancel,
  CheckCircle,
  Info,
} from "@mui/icons-material";
import { ref, push, set, update, remove, onValue } from "firebase/database";
import { db } from "../firebase";

// Package definition with auto-popup Price and Commission values
interface PackageInfo {
  label: string;
  price: string;
  commission: string;
}

const PACKAGE_CATALOG: Record<string, PackageInfo[]> = {
  "Consumer Fibre": [
    { label: "Consumer Fibre 25/25Mbps", price: "R449 pm x 12 months", commission: "R200" },
    { label: "Consumer Fibre 50/50Mbps", price: "R699 pm x 12 months", commission: "R200" },
    { label: "Consumer Fibre 100/100Mbps", price: "R899 pm x 12 months", commission: "R200" },
    { label: "Consumer Fibre 200/200Mbps", price: "R1199 pm x 12 months", commission: "R200" },
    { label: "Consumer LTE Uncapped", price: "R499 pm x 12 months", commission: "R200" },
  ],
  "Telkom FTTH Postpaid": [
    { label: "Easy 20/10 Mbps", price: "R345 pm", commission: "R200" },
    { label: "Easy 40/20 Mbps", price: "R425 pm", commission: "R200" },
    { label: "Core/Stream 25/25 Mbps", price: "R499 pm", commission: "R200" },
    { label: "Core/Stream 30/30 Mbps", price: "R519 pm", commission: "R350" },
    { label: "Core/Stream 50/25 Mbps", price: "R695 pm", commission: "R350" },
    { label: "Core/Stream 50/50 Mbps", price: "R805 pm", commission: "R350" },
    { label: "Core/Stream 100/50 Mbps", price: "R895 pm", commission: "R400" },
    { label: "Core/Stream 100/100 Mbps", price: "R1,025 pm", commission: "R400" },
    { label: "Core/Stream 200/100 Mbps", price: "R1,299 pm", commission: "R500" },
    { label: "Core/Stream 200/200 Mbps", price: "R1,365 pm", commission: "R500" },
    { label: "Core/Stream 300/150 Mbps", price: "R1,529 pm", commission: "R500" },
    { label: "Core/Stream 500/250 Mbps", price: "R1,699 pm", commission: "R500" },
  ],
  "Telkom LTE": [
    { label: "10 Mbps Unlimited", price: "R299 pm", commission: "R300" },
    { label: "20 Mbps Unlimited", price: "R449 pm", commission: "R400" },
    { label: "30 Mbps Unlimited", price: "R599 pm", commission: "R500" },
    { label: "2TB", price: "R699 pm", commission: "R600" },
  ],
};

interface ConsumerLeadData {
  id?: string;
  title: string;
  surname: string;
  firstNames: string;
  idOrPassport: string;
  contactNumber: string;
  emailAddress: string;
  // Structured Address Fields
  streetAddress: string;
  suburb: string;
  townCity: string;
  province: string;
  postalCode: string;
  installationAddress?: string; // Optional for backward compatibility with legacy DB records
  employerName: string;
  employerContactNo: string;
  grossIncome: string;
  netIncome: string;
  totalMonthlyExpenses: string;
  paymentMethod: string;
  bankName: string;
  accountNumber: string;
  debitOrderDate: string;
  productCategory: string;
  packageSelected: string;
  packagePrice: string;
  commissionAmount: string;
  additionalComments: string;
  technicianOrSalesAgent: string;
  status?: string;
  agentLogged?: string;
  submittedAt?: string;
}

const initialFormState: ConsumerLeadData = {
  title: "",
  surname: "",
  firstNames: "",
  idOrPassport: "",
  contactNumber: "",
  emailAddress: "",
  streetAddress: "",
  suburb: "",
  townCity: "",
  province: "",
  postalCode: "",
  employerName: "",
  employerContactNo: "",
  grossIncome: "",
  netIncome: "",
  totalMonthlyExpenses: "",
  paymentMethod: "Debit Order",
  bankName: "",
  accountNumber: "",
  debitOrderDate: "5th",
  productCategory: "",
  packageSelected: "",
  packagePrice: "",
  commissionAmount: "",
  additionalComments: "",
  technicianOrSalesAgent: "",
};

const FieldUpdatesContract = () => {
  const [activeAgentName, setActiveAgentName] = useState("");
  const [formData, setFormData] = useState<ConsumerLeadData>(initialFormState);

  // Realtime leads list & UI states
  const [leadsList, setLeadsList] = useState<ConsumerLeadData[]>([]);
  const [showApplications, setShowApplications] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // View Details Modal State
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedLeadDetails, setSelectedLeadDetails] = useState<ConsumerLeadData | null>(null);

  // Delete modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<ConsumerLeadData | null>(null);
  const [confirmNameInput, setConfirmNameInput] = useState("");

  // Attachments State
  const [files, setFiles] = useState<{
    idCopyDoc: File | null;
    bankStatementDoc: File | null;
    proofOfAddressDoc: File | null;
  }>({
    idCopyDoc: null,
    bankStatementDoc: null,
    proofOfAddressDoc: null,
  });

  useEffect(() => {
    const savedAgent = sessionStorage.getItem("activeAgentName");
    if (savedAgent) {
      setActiveAgentName(savedAgent);
    }

    // Subscribe to Realtime Database
    const leadsRef = ref(db, "contractFibreLeads");
    const unsubscribe = onValue(leadsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedLeads: ConsumerLeadData[] = Object.keys(data).map((key) => ({
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

  // Filter leads so agents ONLY see their own submissions
  const userLeads = leadsList.filter((lead) => {
    if (!activeAgentName) return true; // Show all if logged in as Admin / fallback
    const agent = (lead.agentLogged || lead.technicianOrSalesAgent || "").toLowerCase();
    return agent === activeAgentName.toLowerCase();
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Reset selected package if category changes
    if (name === "productCategory") {
      setFormData({
        ...formData,
        productCategory: value,
        packageSelected: "",
        packagePrice: "",
        commissionAmount: "",
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle Dynamic Package Selection & Auto-populating Commission/Price
  const handlePackageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedPkgName = e.target.value;
    const availablePkgs = PACKAGE_CATALOG[formData.productCategory] || [];
    const matchedPkg = availablePkgs.find((p) => p.label === selectedPkgName);

    setFormData({
      ...formData,
      packageSelected: selectedPkgName,
      packagePrice: matchedPkg ? matchedPkg.price : "",
      commissionAmount: matchedPkg ? matchedPkg.commission : "",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({
        ...files,
        [e.target.name]: e.target.files[0],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId && !files.idCopyDoc) {
      alert("Please upload an ID Copy (Compulsory).");
      return;
    }

    try {
      if (editingId) {
        const leadRef = ref(db, `contractFibreLeads/${editingId}`);
        await update(leadRef, {
          ...formData,
          updatedAt: new Date().toISOString(),
        });
        alert("Consumer application updated successfully!");
        setEditingId(null);
      } else {
        const leadsRef = ref(db, "contractFibreLeads");
        const newLeadRef = push(leadsRef);

        const payload = {
          ...formData,
          status: "Pending",
          agentLogged: activeAgentName || formData.technicianOrSalesAgent || "System Agent",
          submittedAt: new Date().toISOString(),
          attachments: {
            idCopyDoc: files.idCopyDoc ? files.idCopyDoc.name : null,
            bankStatementDoc: files.bankStatementDoc ? files.bankStatementDoc.name : null,
            proofOfAddressDoc: files.proofOfAddressDoc ? files.proofOfAddressDoc.name : null,
          },
        };

        await set(newLeadRef, payload);
        alert("Application successfully submitted!");
      }

      setFormData(initialFormState);
      setFiles({
        idCopyDoc: null,
        bankStatementDoc: null,
        proofOfAddressDoc: null,
      });
    } catch (err: any) {
      alert("Error saving record: " + err.message);
    }
  };

  const handleEdit = (lead: ConsumerLeadData) => {
    setEditingId(lead.id || null);
    setFormData({
      ...initialFormState,
      ...lead,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleViewDetails = (lead: ConsumerLeadData) => {
    setSelectedLeadDetails(lead);
    setViewDetailsOpen(true);
  };

  const handleDeleteClick = (lead: ConsumerLeadData) => {
    setLeadToDelete(lead);
    setConfirmNameInput("");
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!leadToDelete || !leadToDelete.id) return;
    try {
      const targetRef = ref(db, `contractFibreLeads/${leadToDelete.id}`);
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
    ? `${leadToDelete.firstNames} ${leadToDelete.surname}`.trim()
    : "";

  return (
    <Box sx={styles.container}>
      <Paper sx={styles.card}>
        {/* HEADER */}
        <Typography variant="h4" fontWeight="900" textAlign="center" sx={{ color: "#fff", mb: 1 }}>
          {editingId ? "Edit Consumer Application" : "Consumer Application Form"}
        </Typography>

        <Typography textAlign="center" sx={{ color: "#94a3b8", mb: 1, fontSize: 14 }}>
          Complete the form for pre-vetting | Request manual application via{" "}
          <span style={{ color: "#3b82f6" }}>pitsok@telkom.co.za</span>
        </Typography>

        <Typography textAlign="center" sx={{ color: "#cbd5e1", mb: 3, fontSize: 13, fontWeight: "bold" }}>
          Office: 051 401 6514 / 6816 | WhatsApp: 068 593 2102 / 073 895 4522 | Openserve Fibre Team
        </Typography>

        {activeAgentName && (
          <Alert severity="info" sx={{ mb: 3, backgroundColor: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
            Logged Agent: <b>{activeAgentName}</b>
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
            Editing Consumer Record ID: <b>{editingId}</b>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* PERSONAL DETAILS */}
            <Grid item xs={12} sm={3}>
              <TextField
                select
                required
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                sx={styles.input}
              >
                {["Mr", "Mrs", "Miss", "Ms", "Dr", "Prof"].map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4.5}>
              <TextField
                required
                fullWidth
                label="Surname"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            <Grid item xs={12} sm={4.5}>
              <TextField
                required
                fullWidth
                label="First Names as on ID"
                name="firstNames"
                value={formData.firstNames}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="ID Number Or Passport"
                name="idOrPassport"
                value={formData.idOrPassport}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Contact Number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                type="email"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            {/* STRUCTURED ADDRESS DETAILS */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ color: "#3b82f6", mt: 1, fontWeight: "bold" }}>
                Installation Address Details
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Street Address"
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
                label="Suburb"
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
                label="Town / City"
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
                label="Province"
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
                label="Postal Code"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            {/* EMPLOYMENT DETAILS */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ color: "#3b82f6", mt: 1, fontWeight: "bold" }}>
                Employment & Financial Details
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Employer / Company Name"
                name="employerName"
                value={formData.employerName}
                onChange={handleChange}
                sx={styles.input}
                InputProps={{
                  startAdornment: <Business sx={{ color: "#94a3b8", mr: 1 }} />,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Employer Contact No"
                name="employerContactNo"
                value={formData.employerContactNo}
                onChange={handleChange}
                sx={styles.input}
                InputProps={{
                  startAdornment: <ContactPhone sx={{ color: "#94a3b8", mr: 1 }} />,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Gross Income"
                name="grossIncome"
                value={formData.grossIncome}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Net Income"
                name="netIncome"
                value={formData.netIncome}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Total Monthly Expenses"
                name="totalMonthlyExpenses"
                value={formData.totalMonthlyExpenses}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            {/* BANKING DETAILS */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ color: "#3b82f6", mt: 1, fontWeight: "bold" }}>
                Payment Method & Debit Order Details
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Bank Name"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Account Number"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                required
                fullWidth
                label="Debit Order Date"
                name="debitOrderDate"
                value={formData.debitOrderDate}
                onChange={handleChange}
                sx={styles.input}
              >
                {["5th", "15th", "20th", "25th", "Last day"].map((d) => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* PACKAGES SELECTION & DYNAMIC COMMISSION DISPLAY */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ color: "#3b82f6", mt: 1, fontWeight: "bold" }}>
                Package Selection & Commission
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                required
                fullWidth
                label="Select Product Category"
                name="productCategory"
                value={formData.productCategory}
                onChange={handleChange}
                sx={styles.input}
              >
                {["Consumer Fibre", "Telkom FTTH Postpaid", "Telkom LTE"].map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                required
                fullWidth
                disabled={!formData.productCategory}
                label="Select Package"
                name="packageSelected"
                value={formData.packageSelected}
                onChange={handlePackageChange}
                sx={styles.input}
              >
                {(PACKAGE_CATALOG[formData.productCategory] || []).map((pkg) => (
                  <MenuItem key={pkg.label} value={pkg.label}>
                    {pkg.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* POPUP PRICE AND COMMISSION CARDS */}
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
                  <Box>
                    <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                      Selected Package Pricing
                    </Typography>
                    <Typography variant="h6" sx={{ color: "#60a5fa", fontWeight: "bold" }}>
                      {formData.packagePrice}
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                      Sales Commission Earned
                    </Typography>
                    <Typography variant="h6" sx={{ color: "#10b981", fontWeight: "bold" }}>
                      {formData.commissionAmount}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}

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

            {/* AGENT NAME */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Sales Agent / Field Representative"
                name="technicianOrSalesAgent"
                value={activeAgentName || formData.technicianOrSalesAgent}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            {/* ATTACHMENT SECTION */}
            {!editingId && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.1)" }} />
                  <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold", mb: 1 }}>
                    Required Attachments
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<UploadFile />}
                    sx={styles.uploadBtn}
                  >
                    Upload ID Copy *
                    <input type="file" hidden name="idCopyDoc" onChange={handleFileChange} />
                  </Button>
                  {files.idCopyDoc && (
                    <Typography variant="caption" sx={{ color: "#10b981", mt: 0.5, display: "block" }}>
                      Selected: {files.idCopyDoc.name}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<UploadFile />}
                    sx={styles.uploadBtn}
                  >
                    Bank Statement (Optional)
                    <input type="file" hidden name="bankStatementDoc" onChange={handleFileChange} />
                  </Button>
                  {files.bankStatementDoc && (
                    <Typography variant="caption" sx={{ color: "#10b981", mt: 0.5, display: "block" }}>
                      Selected: {files.bankStatementDoc.name}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<UploadFile />}
                    sx={styles.uploadBtn}
                  >
                    Proof of Address (Optional)
                    <input type="file" hidden name="proofOfAddressDoc" onChange={handleFileChange} />
                  </Button>
                  {files.proofOfAddressDoc && (
                    <Typography variant="caption" sx={{ color: "#10b981", mt: 0.5, display: "block" }}>
                      Selected: {files.proofOfAddressDoc.name}
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
                {editingId ? "Update Application" : "Submit Application"}
              </Button>
            </Grid>
          </Grid>
        </form>

        {/* BOTTOM ACTION BAR */}
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
            {showApplications ? "Hide Applications" : `View My Applications (${userLeads.length})`}
          </Button>
        </Box>

        {/* TABLE SECTION - Restricted to Agent's Applications Only */}
        {showApplications && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ color: "#fff", mb: 2, fontWeight: "bold" }}>
              My Submissions
            </Typography>

            <TableContainer component={Paper} sx={styles.tableContainer}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  <TableRow>
                    <TableCell sx={styles.th}>Applicant Name</TableCell>
                    <TableCell sx={styles.th}>Contact / ID</TableCell>
                    <TableCell sx={styles.th}>Package & Category</TableCell>
                    <TableCell sx={styles.th}>Commission</TableCell>
                    <TableCell sx={styles.th}>Status</TableCell>
                    <TableCell sx={styles.th} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ color: "#94a3b8", py: 3 }}>
                        No applications found for your agent account.
                      </TableCell>
                    </TableRow>
                  ) : (
                    userLeads.map((lead) => (
                      <TableRow key={lead.id} sx={{ "&:hover": { backgroundColor: "rgba(255,255,255,0.02)" } }}>
                        <TableCell sx={styles.td}>
                          {lead.title} {lead.firstNames} {lead.surname}
                        </TableCell>
                        <TableCell sx={styles.td}>
                          {lead.contactNumber}<br />
                          <small style={{ color: "#94a3b8" }}>{lead.idOrPassport}</small>
                        </TableCell>
                        <TableCell sx={styles.td}>
                          {lead.packageSelected || "-"}
                          <br />
                          <small style={{ color: "#3b82f6" }}>{lead.productCategory}</small>
                        </TableCell>
                        <TableCell sx={{ ...styles.td, color: "#10b981", fontWeight: "bold" }}>
                          {lead.commissionAmount || "-"}
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

      {/* VIEW DETAILS DIALOG */}
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
          Full Application Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedLeadDetails && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography variant="subtitle2" sx={{ color: "#60a5fa" }}>Personal Information</Typography>
              <Typography variant="body2"><b>Full Name:</b> {selectedLeadDetails.title} {selectedLeadDetails.firstNames} {selectedLeadDetails.surname}</Typography>
              <Typography variant="body2"><b>ID / Passport:</b> {selectedLeadDetails.idOrPassport}</Typography>
              <Typography variant="body2"><b>Contact:</b> {selectedLeadDetails.contactNumber} | {selectedLeadDetails.emailAddress}</Typography>

              <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.08)" }} />

              <Typography variant="subtitle2" sx={{ color: "#60a5fa" }}>Installation Address</Typography>
              {selectedLeadDetails.streetAddress ? (
                <>
                  <Typography variant="body2"><b>Street Address:</b> {selectedLeadDetails.streetAddress}</Typography>
                  <Typography variant="body2"><b>Suburb:</b> {selectedLeadDetails.suburb || "N/A"}</Typography>
                  <Typography variant="body2"><b>Town / City:</b> {selectedLeadDetails.townCity || "N/A"}</Typography>
                  <Typography variant="body2"><b>Province:</b> {selectedLeadDetails.province || "N/A"}</Typography>
                  <Typography variant="body2"><b>Postal Code:</b> {selectedLeadDetails.postalCode || "N/A"}</Typography>
                </>
              ) : (
                <Typography variant="body2"><b>Address:</b> {selectedLeadDetails.installationAddress || "N/A"}</Typography>
              )}

              <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.08)" }} />

              <Typography variant="subtitle2" sx={{ color: "#60a5fa" }}>Employment & Financials</Typography>
              <Typography variant="body2"><b>Employer:</b> {selectedLeadDetails.employerName} ({selectedLeadDetails.employerContactNo})</Typography>
              <Typography variant="body2"><b>Gross / Net Income:</b> {selectedLeadDetails.grossIncome} / {selectedLeadDetails.netIncome}</Typography>
              <Typography variant="body2"><b>Monthly Expenses:</b> {selectedLeadDetails.totalMonthlyExpenses}</Typography>

              <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.08)" }} />

              <Typography variant="subtitle2" sx={{ color: "#60a5fa" }}>Banking & Package Details</Typography>
              <Typography variant="body2"><b>Bank:</b> {selectedLeadDetails.bankName} | <b>Account:</b> {selectedLeadDetails.accountNumber}</Typography>
              <Typography variant="body2"><b>Debit Order Date:</b> {selectedLeadDetails.debitOrderDate}</Typography>
              <Typography variant="body2"><b>Product Category:</b> {selectedLeadDetails.productCategory}</Typography>
              <Typography variant="body2"><b>Package:</b> {selectedLeadDetails.packageSelected}</Typography>
              <Typography variant="body2"><b>Price:</b> {selectedLeadDetails.packagePrice}</Typography>
              <Typography variant="body2"><b>Commission:</b> {selectedLeadDetails.commissionAmount}</Typography>
              <Typography variant="body2"><b>Comments:</b> {selectedLeadDetails.additionalComments || "None"}</Typography>
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
          Confirm Record Deletion
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2, color: "#cbd5e1", fontSize: 14 }}>
            To confirm deletion, please type the customer full name below:
            <br />
            <b style={{ color: "#f59e0b" }}>{expectedCustomerName}</b>
          </Typography>
          <TextField
            fullWidth
            placeholder="Type customer name to confirm"
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

export default FieldUpdatesContract;