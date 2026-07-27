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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
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
  Info
} from "@mui/icons-material";
import { ref, push, set, update, remove, onValue } from "firebase/database";
import { db } from "../firebase";

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
  submissionMode?: "manual" | "upload";
  title: string;
  surname: string;
  firstNames: string;
  idOrPassport: string;
  contactNumber: string;
  emailAddress: string;
  streetAddress: string;
  suburb: string;
  townCity: string;
  province: string;
  postalCode: string;
  installationAddress?: string;
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
  contractDocName?: string | null;
  idCopyDocName?: string | null;
  bankStatementDocName?: string | null;
  proofOfAddressDocName?: string | null;
  status?: string;
  agentLogged?: string;
  submittedAt?: string;
}

const initialFormState: ConsumerLeadData = {
  submissionMode: "manual",
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
  const [submissionMode, setSubmissionMode] = useState<"manual" | "upload">("manual");

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
    contractDoc: File | null;
    idCopyDoc: File | null;
    bankStatementDoc: File | null;
    proofOfAddressDoc: File | null;
  }>({
    contractDoc: null,
    idCopyDoc: null,
    bankStatementDoc: null,
    proofOfAddressDoc: null,
  });

  useEffect(() => {
    const savedAgent = sessionStorage.getItem("activeAgentName");
    if (savedAgent) {
      setActiveAgentName(savedAgent);
    }

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

  const userLeads = leadsList.filter((lead) => {
    if (!activeAgentName) return true;
    const agent = (lead.agentLogged || lead.technicianOrSalesAgent || "").toLowerCase();
    return agent === activeAgentName.toLowerCase();
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

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

    const currentAgent = activeAgentName || formData.technicianOrSalesAgent;
    if (!currentAgent) {
      alert("Please enter the Sales Agent / Field Representative name.");
      return;
    }

    // Validation for upload mode
    if (submissionMode === "upload" && !editingId) {
      if (!files.contractDoc) {
        alert("Please upload the Contract Document (Compulsory).");
        return;
      }
      if (!files.idCopyDoc) {
        alert("Please upload an ID Copy (Compulsory).");
        return;
      }
    }

    try {
      if (editingId) {
        const leadRef = ref(db, `contractFibreLeads/${editingId}`);
        await update(leadRef, {
          ...formData,
          technicianOrSalesAgent: currentAgent,
          agentLogged: currentAgent,
          submissionMode,
          updatedAt: new Date().toISOString(),
          ...(files.contractDoc && { contractDocName: files.contractDoc.name }),
          ...(files.idCopyDoc && { idCopyDocName: files.idCopyDoc.name }),
          ...(files.bankStatementDoc && { bankStatementDocName: files.bankStatementDoc.name }),
          ...(files.proofOfAddressDoc && { proofOfAddressDocName: files.proofOfAddressDoc.name }),
        });
        alert("Application updated successfully!");
        setEditingId(null);
      } else {
        const leadsRef = ref(db, "contractFibreLeads");
        const newLeadRef = push(leadsRef);

        const payload = {
          ...formData,
          submissionMode,
          status: submissionMode === "upload" ? "Pending Vetting" : "Pending",
          technicianOrSalesAgent: currentAgent,
          agentLogged: currentAgent,
          submittedAt: new Date().toISOString(),
          contractDocName: files.contractDoc ? files.contractDoc.name : null,
          idCopyDocName: files.idCopyDoc ? files.idCopyDoc.name : null,
          bankStatementDocName: files.bankStatementDoc ? files.bankStatementDoc.name : null,
          proofOfAddressDocName: files.proofOfAddressDoc ? files.proofOfAddressDoc.name : null,
        };

        await set(newLeadRef, payload);
        alert("Application successfully submitted!");
      }

      setFormData(initialFormState);
      setFiles({
        contractDoc: null,
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
    setSubmissionMode(lead.submissionMode || "manual");
    setFormData({
      ...initialFormState,
      ...lead,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setFiles({
      contractDoc: null,
      idCopyDoc: null,
      bankStatementDoc: null,
      proofOfAddressDoc: null,
    });
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
    ? (leadToDelete.firstNames ? `${leadToDelete.firstNames} ${leadToDelete.surname}` : (leadToDelete.technicianOrSalesAgent || "Agent Record")).trim()
    : "";

  return (
    <Box sx={styles.container}>
      <Paper sx={styles.card}>
        {/* HEADER */}
        <Typography variant="h4" fontWeight="900" textAlign="center" sx={{ color: "#1e293b", mb: 1 }}>
          {editingId ? "Edit Contract Application" : "Contract Application Form"}
        </Typography>

        <Typography textAlign="center" sx={{ color: "#64748b", mb: 1, fontSize: 14 }}>
          Complete the form for pre-vetting | Request manual application via{" "}
          <span style={{ color: "#2563eb", fontWeight: "bold" }}>pitsok@telkom.co.za</span>
        </Typography>

        <Typography textAlign="center" sx={{ color: "#475569", mb: 3, fontSize: 13, fontWeight: "bold" }}>
          Office: 051 401 6514 / 6816 | WhatsApp: 068 593 2102 / 073 895 4522 | Openserve Fibre Team
        </Typography>

        {activeAgentName && (
          <Alert severity="info" sx={{ mb: 3, backgroundColor: "#eff6ff", color: "#1e40af", borderColor: "#bfdbfe" }}>
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

        {/* SUBMISSION MODE TOGGLE */}
        <Box sx={styles.toggleBox}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: "bold", color: "#1e293b", mb: 1 }}>
              Choose Method:
            </FormLabel>
            <RadioGroup
              row
              value={submissionMode}
              onChange={(e) => setSubmissionMode(e.target.value as "manual" | "upload")}
            >
              <FormControlLabel
                value="manual"
                control={<Radio color="primary" />}
                label={<Typography fontWeight="600" color="#1e293b">Type Details Manually</Typography>}
              />
              <FormControlLabel
                value="upload"
                control={<Radio color="primary" />}
                label={<Typography fontWeight="600" color="#1e293b">Upload Documents Direct</Typography>}
              />
            </RadioGroup>
          </FormControl>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* AGENT NAME */}
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Sales Agent / Field Representative *"
                name="technicianOrSalesAgent"
                value={activeAgentName || formData.technicianOrSalesAgent}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            {/* MANUAL CAPTURE FORM FIELDS */}
            {submissionMode === "manual" && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="h6" sx={{ color: "#2563eb", fontWeight: "bold", mb: 1 }}>
                    Customer Personal Details
                  </Typography>
                </Grid>

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

                {/* INSTALLATION ADDRESS */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: "#2563eb", mt: 1, fontWeight: "bold" }}>
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

                {/* EMPLOYMENT */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: "#2563eb", mt: 1, fontWeight: "bold" }}>
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
                      startAdornment: <Business sx={{ color: "#64748b", mr: 1 }} />,
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
                      startAdornment: <ContactPhone sx={{ color: "#64748b", mr: 1 }} />,
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

                {/* BANKING */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: "#2563eb", mt: 1, fontWeight: "bold" }}>
                    Payment Method & Banking Details
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

                {/* PACKAGES SELECTION */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: "#2563eb", mt: 1, fontWeight: "bold" }}>
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
                    {["Consumer Fibre", "Telhom FTTH Postpaid", "Telkom LTE"].map((cat) => (
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

                {/* PRICE & COMMISSION DISPLAY */}
                {formData.packageSelected && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: "10px",
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        display: "flex",
                        justifyContent: "space-around",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="caption" sx={{ color: "#475569", display: "block" }}>
                          Selected Package Pricing
                        </Typography>
                        <Typography variant="h6" sx={{ color: "#2563eb", fontWeight: "bold" }}>
                          {formData.packagePrice}
                        </Typography>
                      </Box>
                      <Divider orientation="vertical" flexItem />
                      <Box>
                        <Typography variant="caption" sx={{ color: "#475569", display: "block" }}>
                          Sales Commission Earned
                        </Typography>
                        <Typography variant="h6" sx={{ color: "#16a34a", fontWeight: "bold" }}>
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
              </>
            )}

            {/* DOCUMENT UPLOADS SECTION (ALWAYS VISIBLE OR MODE BASED) */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ color: "#2563eb", fontWeight: "bold", mb: 1 }}>
                {submissionMode === "upload" ? "Document Uploads (Compulsory)" : "Optional Attachments"}
              </Typography>
            </Grid>

            {/* CONTRACT DOCUMENT */}
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<UploadFile />}
                sx={styles.uploadBtn}
              >
                Upload Contract Document {submissionMode === "upload" ? "* (Compulsory)" : "(Optional)"}
                <input type="file" hidden name="contractDoc" onChange={handleFileChange} />
              </Button>
              {files.contractDoc && (
                <Typography variant="caption" sx={{ color: "#16a34a", mt: 0.5, display: "block", fontWeight: "bold" }}>
                  Selected: {files.contractDoc.name}
                </Typography>
              )}
            </Grid>

            {/* ID COPY */}
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<UploadFile />}
                sx={styles.uploadBtn}
              >
                Upload ID Copy {submissionMode === "upload" ? "* (Compulsory)" : "(Optional)"}
                <input type="file" hidden name="idCopyDoc" onChange={handleFileChange} />
              </Button>
              {files.idCopyDoc && (
                <Typography variant="caption" sx={{ color: "#16a34a", mt: 0.5, display: "block", fontWeight: "bold" }}>
                  Selected: {files.idCopyDoc.name}
                </Typography>
              )}
            </Grid>

            {/* BANK STATEMENT */}
            <Grid item xs={12} sm={6}>
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
                <Typography variant="caption" sx={{ color: "#16a34a", mt: 0.5, display: "block", fontWeight: "bold" }}>
                  Selected: {files.bankStatementDoc.name}
                </Typography>
              )}
            </Grid>

            {/* PROOF OF ADDRESS */}
            <Grid item xs={12} sm={6}>
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
                <Typography variant="caption" sx={{ color: "#16a34a", mt: 0.5, display: "block", fontWeight: "bold" }}>
                  Selected: {files.proofOfAddressDoc.name}
                </Typography>
              )}
            </Grid>

            {/* SUBMIT BUTTON */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                startIcon={<Send />}
                sx={styles.submitButton}
              >
                {editingId
                  ? "Update Contract Application"
                  : submissionMode === "upload"
                  ? "Submit Uploaded Documents"
                  : "Submit Application Form"}
              </Button>
            </Grid>
          </Grid>
        </form>

        {/* BOTTOM ACTION BAR */}
        <Divider sx={{ my: 4 }} />

        <Box sx={{ textAlign: "center" }}>
          <Button
            variant="outlined"
            size="large"
            startIcon={<Visibility />}
            onClick={() => setShowApplications(!showApplications)}
            sx={{
              borderColor: "#2563eb",
              color: "#2563eb",
              px: 4,
              py: 1.2,
              borderRadius: "10px",
              fontWeight: "bold",
              "&:hover": { borderColor: "#1d4ed8", backgroundColor: "#eff6ff" },
            }}
          >
            {showApplications ? "Hide Submissions" : `View My Submissions (${userLeads.length})`}
          </Button>
        </Box>

        {/* TABLE SECTION */}
        {showApplications && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ color: "#1e293b", mb: 2, fontWeight: "bold" }}>
              My Contract Submissions
            </Typography>

            <TableContainer component={Paper} sx={styles.tableContainer}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                  <TableRow>
                    <TableCell sx={styles.th}>Applicant / Agent</TableCell>
                    <TableCell sx={styles.th}>Mode / Contact</TableCell>
                    <TableCell sx={styles.th}>Package / Files</TableCell>
                    <TableCell sx={styles.th}>Commission</TableCell>
                    <TableCell sx={styles.th}>Status</TableCell>
                    <TableCell sx={styles.th} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ color: "#64748b", py: 3 }}>
                        No records found for your agent account.
                      </TableCell>
                    </TableRow>
                  ) : (
                    userLeads.map((lead) => (
                      <TableRow key={lead.id} sx={{ "&:hover": { backgroundColor: "#f8fafc" } }}>
                        <TableCell sx={styles.td}>
                          {lead.firstNames ? `${lead.title || ""} ${lead.firstNames} ${lead.surname}` : (lead.technicianOrSalesAgent || "N/A")}
                        </TableCell>
                        <TableCell sx={styles.td}>
                          <Chip
                            label={lead.submissionMode === "upload" ? "Upload" : "Manual"}
                            size="small"
                            variant="outlined"
                            color={lead.submissionMode === "upload" ? "secondary" : "primary"}
                            sx={{ mb: 0.5, height: 20, fontSize: 10 }}
                          />
                          <br />
                          <small style={{ color: "#64748b" }}>{lead.contactNumber || lead.idOrPassport || "-"}</small>
                        </TableCell>
                        <TableCell sx={styles.td}>
                          {lead.submissionMode === "upload" ? (
                            <small style={{ color: "#475569" }}>
                              Contract: {lead.contractDocName ? "✓" : "✗"}<br />
                              ID Copy: {lead.idCopyDocName ? "✓" : "✗"}
                            </small>
                          ) : (
                            <>
                              {lead.packageSelected || "-"}
                              <br />
                              <small style={{ color: "#2563eb" }}>{lead.productCategory}</small>
                            </>
                          )}
                        </TableCell>
                        <TableCell sx={{ ...styles.td, color: "#16a34a", fontWeight: "bold" }}>
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
            backgroundColor: "#ffffff",
            color: "#1e293b",
            borderRadius: "16px",
            minWidth: { xs: "90%", sm: "500px" },
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid #e2e8f0", color: "#2563eb", fontWeight: "bold" }}>
          Full Contract Record Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedLeadDetails && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography variant="subtitle2" sx={{ color: "#2563eb", fontWeight: "bold" }}>Agent & Method</Typography>
              <Typography variant="body2"><b>Sales Agent:</b> {selectedLeadDetails.technicianOrSalesAgent || selectedLeadDetails.agentLogged || "N/A"}</Typography>
              <Typography variant="body2"><b>Submission Method:</b> {selectedLeadDetails.submissionMode || "manual"}</Typography>
              <Typography variant="body2"><b>Status:</b> {selectedLeadDetails.status || "Pending"}</Typography>

              {selectedLeadDetails.submissionMode === "manual" && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ color: "#2563eb", fontWeight: "bold" }}>Customer Details</Typography>
                  <Typography variant="body2"><b>Name:</b> {selectedLeadDetails.title} {selectedLeadDetails.firstNames} {selectedLeadDetails.surname}</Typography>
                  <Typography variant="body2"><b>ID / Passport:</b> {selectedLeadDetails.idOrPassport}</Typography>
                  <Typography variant="body2"><b>Contact:</b> {selectedLeadDetails.contactNumber} | {selectedLeadDetails.emailAddress}</Typography>
                  <Typography variant="body2"><b>Package:</b> {selectedLeadDetails.packageSelected} ({selectedLeadDetails.productCategory})</Typography>
                  <Typography variant="body2"><b>Commission:</b> {selectedLeadDetails.commissionAmount}</Typography>
                </>
              )}

              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" sx={{ color: "#2563eb", fontWeight: "bold" }}>Uploaded Documents</Typography>
              <Typography variant="body2"><b>Contract Doc:</b> {selectedLeadDetails.contractDocName || "Not Uploaded"}</Typography>
              <Typography variant="body2"><b>ID Copy:</b> {selectedLeadDetails.idCopyDocName || "Not Uploaded"}</Typography>
              <Typography variant="body2"><b>Bank Statement:</b> {selectedLeadDetails.bankStatementDocName || "Not Uploaded"}</Typography>
              <Typography variant="body2"><b>Proof of Address:</b> {selectedLeadDetails.proofOfAddressDocName || "Not Uploaded"}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button onClick={() => setViewDetailsOpen(false)} variant="contained" sx={{ background: "#2563eb" }}>
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
            backgroundColor: "#ffffff",
            color: "#1e293b",
            borderRadius: "12px",
            minWidth: { xs: "90%", sm: "400px" },
          },
        }}
      >
        <DialogTitle sx={{ color: "#dc2626", fontWeight: "bold" }}>
          Confirm Record Deletion
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2, color: "#475569", fontSize: 14 }}>
            To confirm deletion, please type name below:
            <br />
            <b style={{ color: "#d97706" }}>{expectedCustomerName}</b>
          </Typography>
          <TextField
            fullWidth
            placeholder="Type name to confirm"
            value={confirmNameInput}
            onChange={(e) => setConfirmNameInput(e.target.value)}
            sx={styles.input}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} startIcon={<Cancel />} sx={{ color: "#64748b" }}>
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
    background: "#f8fafc",
  },
  card: {
    maxWidth: 950,
    width: "100%",
    p: 4,
    borderRadius: "16px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
  },
  toggleBox: {
    p: 2,
    mb: 3,
    borderRadius: "10px",
    backgroundColor: "#f1f5f9",
    border: "1px solid #cbd5e1",
  },
  input: {
    "& .MuiOutlinedInput-root": {
      color: "#0f172a",
      backgroundColor: "#ffffff",
      borderRadius: "10px",
      "& fieldset": { borderColor: "#cbd5e1" },
      "&:hover fieldset": { borderColor: "#94a3b8" },
      "&.Mui-focused fieldset": { borderColor: "#2563eb" },
    },
    "& .MuiInputLabel-root": { color: "#64748b" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#2563eb" },
    "& .MuiSvgIcon-root": { color: "#64748b" },
  },
  uploadBtn: {
    borderColor: "#cbd5e1",
    color: "#334155",
    padding: "12px",
    borderRadius: "10px",
    textTransform: "none",
    fontWeight: "bold",
    "&:hover": {
      borderColor: "#2563eb",
      backgroundColor: "#eff6ff",
    },
  },
  submitButton: {
    py: 1.5,
    fontWeight: "bold",
    borderRadius: "10px",
    textTransform: "none",
    fontSize: "1.05rem",
    background: "linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)",
    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
    "&:hover": {
      background: "linear-gradient(90deg, #1d4ed8 0%, #1e40af 100%)",
    },
  },
  tableContainer: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
  },
  th: {
    color: "#475569",
    fontWeight: "bold",
    borderColor: "#e2e8f0",
  },
  td: {
    color: "#1e293b",
    borderColor: "#e2e8f0",
  },
};

export default FieldUpdatesContract;