import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  FormControl,
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

// Product Data Definitions
const PRODUCT_TYPES = {
  TB_FIBRE: "TB Fibre",
  TB_VOICE: "TB Voice",
  TB_PABX: "TB PABX",
};

const TB_FIBRE_PACKAGES = [
  { name: "Easy 20/10 Mbps", price: 345, commission: 200 },
  { name: "Easy 40/20 Mbps", price: 425, commission: 200 },
  { name: "Core/Stream 25/25 Mbps", price: 499, commission: 200 },
  { name: "Core/Stream 30/30 Mbps", price: 519, commission: 350 },
  { name: "Core/Stream 50/25 Mbps", price: 695, commission: 350 },
  { name: "Core/Stream 50/50 Mbps", price: 805, commission: 350 },
  { name: "Core/Stream 100/50 Mbps", price: 895, commission: 400 },
  { name: "Core/Stream 100/100 Mbps", price: 1025, commission: 400 },
  { name: "Core/Stream 200/100 Mbps", price: 1299, commission: 500 },
  { name: "Core/Stream 200/200 Mbps", price: 1365, commission: 500 },
  { name: "Core/Stream 300/150 Mbps", price: 1529, commission: 500 },
  { name: "Core/Stream 500/250 Mbps", price: 1699, commission: 500 },
];

const TB_VOICE_PACKAGES = [
  { name: "Smart Voice Basic", price: 239, commission: 120 },
  { name: "Smart Voice 100", price: 345, commission: 170 },
  { name: "Smart Voice 300", price: 469, commission: 200 },
  { name: "Smart Voice 500", price: 549, commission: 250 },
  { name: "Smart Voice Unlimited", price: 705, commission: 350 },
];

const PABX_OPTIONS = [
  { name: "Outright @ R", rate: 0.05, label: "5%" },
  { name: "Rental @ TVC", rate: 0.05, label: "5%" },
];

interface LeadData {
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
  companyWorkingFor: string;
  companyAddress: string;
  companyContactNo: string;
  grossIncome: string;
  netIncome: string;
  totalMonthlyExpenses: string;
  paymentMethod: string;
  bankName: string;
  accountNumber: string;
  debitOrderDate: string;
  productType: string;
  packageSelected: string;
  pabxOption?: string;
  pabxAmount?: string;
  additionalComments: string;
  technicianOrSalesAgent: string;
  isDirector: string;
  status?: string;
  agentLogged?: string;
  submittedAt?: string;
  calculatedPrice?: number;
  calculatedCommission?: number;
  attachments?: {
    idOrPassportDoc?: string;
    proofOfAddressDoc?: string;
    ckDocument?: string;
    bankStatementDoc?: string;
    directorProxyDoc?: string;
  };
}

const initialFormState: LeadData = {
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
  companyWorkingFor: "",
  companyAddress: "",
  companyContactNo: "",
  grossIncome: "",
  netIncome: "",
  totalMonthlyExpenses: "",
  paymentMethod: "Debit Order",
  bankName: "",
  accountNumber: "",
  debitOrderDate: "5th",
  productType: PRODUCT_TYPES.TB_FIBRE,
  packageSelected: "",
  pabxOption: "Outright Sale",
  pabxAmount: "",
  additionalComments: "",
  technicianOrSalesAgent: "",
  isDirector: "yes",
};

const FieldUpdatesTbusiness = () => {
  const [activeAgentName, setActiveAgentName] = useState("");
  const [formData, setFormData] = useState<LeadData>(initialFormState);

  const [leadsList, setLeadsList] = useState<LeadData[]>([]);
  const [showApplications, setShowApplications] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // View Details Modal State
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedLeadDetails, setSelectedLeadDetails] = useState<LeadData | null>(null);

  // Delete Confirmation Modal State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<LeadData | null>(null);
  const [confirmNameInput, setConfirmNameInput] = useState("");

  const [files, setFiles] = useState<{
    idOrPassportDoc: File | null;
    proofOfAddressDoc: File | null;
    ckDocument: File | null;
    bankStatementDoc: File | null;
    directorProxyDoc: File | null;
  }>({
    idOrPassportDoc: null,
    proofOfAddressDoc: null,
    ckDocument: null,
    bankStatementDoc: null,
    directorProxyDoc: null,
  });

  useEffect(() => {
    const savedAgent = sessionStorage.getItem("activeAgentName");
    if (savedAgent) {
      setActiveAgentName(savedAgent);
    }

    const leadsRef = ref(db, "tbFibreLeads");
    const unsubscribe = onValue(leadsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedLeads: LeadData[] = Object.keys(data).map((key) => ({
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
    if (!activeAgentName) return true; // Fallback if no specific agent detected
    const agent = (lead.agentLogged || lead.technicianOrSalesAgent || "").toLowerCase();
    return agent === activeAgentName.toLowerCase();
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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

  // Helper calculation function for Price and Commission
  const getCalculatedFinancials = () => {
    let price = 0;
    let commission = 0;

    if (formData.productType === PRODUCT_TYPES.TB_FIBRE) {
      const selected = TB_FIBRE_PACKAGES.find((pkg) => pkg.name === formData.packageSelected);
      if (selected) {
        price = selected.price;
        commission = selected.commission;
      }
    } else if (formData.productType === PRODUCT_TYPES.TB_VOICE) {
      const selected = TB_VOICE_PACKAGES.find((pkg) => pkg.name === formData.packageSelected);
      if (selected) {
        price = selected.price;
        commission = selected.commission;
      }
    } else if (formData.productType === PRODUCT_TYPES.TB_PABX) {
      const amount = parseFloat(formData.pabxAmount || "0");
      const selectedOption = PABX_OPTIONS.find((opt) => opt.name === formData.pabxOption);
      price = isNaN(amount) ? 0 : amount;
      if (selectedOption && !isNaN(amount)) {
        commission = amount * selectedOption.rate;
      }
    }

    return { price, commission };
  };

  const financials = getCalculatedFinancials();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId && !files.idOrPassportDoc) {
      alert("Please upload an ID Copy or Passport (Compulsory).");
      return;
    }

    if (!editingId && formData.isDirector === "no" && !files.directorProxyDoc) {
      alert("Proxy document from directors is required since applicant is not a director.");
      return;
    }

    try {
      const payloadData = {
        ...formData,
        calculatedPrice: financials.price,
        calculatedCommission: financials.commission,
      };

      if (editingId) {
        const leadRef = ref(db, `tbFibreLeads/${editingId}`);
        await update(leadRef, {
          ...payloadData,
          updatedAt: new Date().toISOString(),
        });
        alert("Application updated successfully!");
        setEditingId(null);
      } else {
        const leadsRef = ref(db, "tbFibreLeads");
        const newLeadRef = push(leadsRef);

        const payload = {
          ...payloadData,
          status: "Pending",
          agentLogged: activeAgentName || formData.technicianOrSalesAgent || "System Agent",
          submittedAt: new Date().toISOString(),
          attachments: {
            idOrPassportDoc: files.idOrPassportDoc ? files.idOrPassportDoc.name : null,
            proofOfAddressDoc: files.proofOfAddressDoc ? files.proofOfAddressDoc.name : null,
            ckDocument: files.ckDocument ? files.ckDocument.name : null,
            bankStatementDoc: files.bankStatementDoc ? files.bankStatementDoc.name : null,
            directorProxyDoc: files.directorProxyDoc ? files.directorProxyDoc.name : null,
          },
        };

        await set(newLeadRef, payload);
        alert("Telkom Business Application successfully submitted!");
      }

      setFormData(initialFormState);
      setFiles({
        idOrPassportDoc: null,
        proofOfAddressDoc: null,
        ckDocument: null,
        bankStatementDoc: null,
        directorProxyDoc: null,
      });
    } catch (err: any) {
      alert("Error saving record: " + err.message);
    }
  };

  const handleEdit = (lead: LeadData) => {
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

  const handleViewDetails = (lead: LeadData) => {
    setSelectedLeadDetails(lead);
    setViewDetailsOpen(true);
  };

  const handleDeleteClick = (lead: LeadData) => {
    setLeadToDelete(lead);
    setConfirmNameInput("");
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!leadToDelete || !leadToDelete.id) return;
    try {
      const targetRef = ref(db, `tbFibreLeads/${leadToDelete.id}`);
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
        <Typography variant="h4" fontWeight="900" textAlign="center" sx={{ color: "#fff", mb: 1 }}>
          {editingId ? "Edit Telkom Business Application" : "Telkom Business Application"}
        </Typography>

        <Typography textAlign="center" sx={{ color: "#94a3b8", mb: 1, fontSize: 14 }}>
          Complete the form for pre-vetting | You may also request manual application form by emailing us on{" "}
          <span style={{ color: "#3b82f6" }}>pitsok@telkom.co.za</span>
        </Typography>

        <Typography textAlign="center" sx={{ color: "#cbd5e1", mb: 3, fontSize: 13, fontWeight: "bold" }}>
          Office: 051 401 6514 / 6816 | WhatsApp: 068 593 2102 / 073 895 4522
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
            Editing Application ID: <b>{editingId}</b>
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
                {["Mr", "Mrs", "Miss", "MS", "Dr", "PS", "Prof"].map((t) => (
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
                Installation / Delivery Address Details
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

            {/* COMPANY DETAILS */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ color: "#3b82f6", mt: 1, fontWeight: "bold" }}>
                Company Details
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Company Working For"
                name="companyWorkingFor"
                value={formData.companyWorkingFor}
                onChange={handleChange}
                sx={styles.input}
                InputProps={{
                  startAdornment: <Business sx={{ color: "#94a3b8", mr: 1 }} />,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Company Address"
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleChange}
                sx={styles.input}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Company Contact No"
                name="companyContactNo"
                value={formData.companyContactNo}
                onChange={handleChange}
                sx={styles.input}
                InputProps={{
                  startAdornment: <ContactPhone sx={{ color: "#94a3b8", mr: 1 }} />,
                }}
              />
            </Grid>

            {/* FINANCIAL INFORMATION */}
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
                Payment Method & Debit Order Details (Debit Order is Compulsory)
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

            {/* PRODUCT CATEGORY & SELECTION */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.1)" }} />
              <Typography variant="subtitle1" sx={{ color: "#3b82f6", mb: 1, fontWeight: "bold" }}>
                Product Selection & Pricing
              </Typography>
            </Grid>

            {/* PRODUCT TYPE SELECTOR */}
            <Grid item xs={12} sm={4}>
              <TextField
                select
                required
                fullWidth
                label="Product Category"
                name="productType"
                value={formData.productType}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    productType: e.target.value,
                    packageSelected: "",
                  });
                }}
                sx={styles.input}
              >
                <MenuItem value={PRODUCT_TYPES.TB_FIBRE}>TB Fibre</MenuItem>
                <MenuItem value={PRODUCT_TYPES.TB_VOICE}>TB Voice</MenuItem>
                <MenuItem value={PRODUCT_TYPES.TB_PABX}>TB PABX</MenuItem>
              </TextField>
            </Grid>

            {/* TB FIBRE / TB VOICE DROPDOWNS */}
            {(formData.productType === PRODUCT_TYPES.TB_FIBRE || formData.productType === PRODUCT_TYPES.TB_VOICE) && (
              <Grid item xs={12} sm={8}>
                <TextField
                  select
                  required
                  fullWidth
                  label={`Select ${formData.productType} Package`}
                  name="packageSelected"
                  value={formData.packageSelected}
                  onChange={handleChange}
                  sx={styles.input}
                >
                  {(formData.productType === PRODUCT_TYPES.TB_FIBRE ? TB_FIBRE_PACKAGES : TB_VOICE_PACKAGES).map(
                    (pkg) => (
                      <MenuItem key={pkg.name} value={pkg.name}>
                        {pkg.name} — R{pkg.price}/pm
                      </MenuItem>
                    )
                  )}
                </TextField>
              </Grid>
            )}

            {/* TB PABX CONTROLS */}
            {formData.productType === PRODUCT_TYPES.TB_PABX && (
              <>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    required
                    fullWidth
                    label="PABX Option"
                    name="pabxOption"
                    value={formData.pabxOption}
                    onChange={handleChange}
                    sx={styles.input}
                  >
                    {PABX_OPTIONS.map((opt) => (
                      <MenuItem key={opt.name} value={opt.name}>
                        {opt.name} ({opt.label} Commission)
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="PABX Deal Amount (R)"
                    name="pabxAmount"
                    value={formData.pabxAmount}
                    onChange={handleChange}
                    sx={styles.input}
                  />
                </Grid>
              </>
            )}

            {/* DYNAMIC PRICE & EXPECTED COMMISSION DISPLAY */}
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  borderRadius: "10px",
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Box textAlign="center">
                  <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                    Selected Price
                  </Typography>
                  <Typography variant="h6" sx={{ color: "#38bdf8", fontWeight: "bold" }}>
                    R {financials.price.toLocaleString("en-ZA")}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
                <Box textAlign="center">
                  <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                    Expected Commission
                  </Typography>
                  <Typography variant="h6" sx={{ color: "#4ade80", fontWeight: "bold" }}>
                    R {financials.commission.toLocaleString("en-ZA")}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

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

            {/* AUTOMATED AGENT / TECHNICIAN NAME */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Technician Name or Sales Agent"
                name="technicianOrSalesAgent"
                value={activeAgentName || formData.technicianOrSalesAgent}
                onChange={handleChange}
                sx={styles.input}
                helperText="Automatically detected from logged active agent profile"
              />
            </Grid>

            {/* ATTACHMENT SECTION */}
            {!editingId && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.1)" }} />
                  <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold", mb: 1 }}>
                    Required Attachments & Documents
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel sx={{ color: "#94a3b8" }}>Is the applicant a company director?</FormLabel>
                    <RadioGroup
                      row
                      name="isDirector"
                      value={formData.isDirector}
                      onChange={handleChange}
                    >
                      <FormControlLabel value="yes" control={<Radio sx={{ color: "#3b82f6" }} />} label="Yes" />
                      <FormControlLabel value="no" control={<Radio sx={{ color: "#3b82f6" }} />} label="No (Proxy Required)" />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<UploadFile />}
                    sx={styles.uploadBtn}
                  >
                    Upload ID Copy or Passport * (Compulsory)
                    <input type="file" hidden name="idOrPassportDoc" onChange={handleFileChange} />
                  </Button>
                  {files.idOrPassportDoc && (
                    <Typography variant="caption" sx={{ color: "#10b981", mt: 0.5, display: "block" }}>
                      Selected: {files.idOrPassportDoc.name}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<UploadFile />}
                    sx={styles.uploadBtn}
                  >
                    Upload Proof of Address (Optional)
                    <input type="file" hidden name="proofOfAddressDoc" onChange={handleFileChange} />
                  </Button>
                  {files.proofOfAddressDoc && (
                    <Typography variant="caption" sx={{ color: "#10b981", mt: 0.5, display: "block" }}>
                      Selected: {files.proofOfAddressDoc.name}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<UploadFile />}
                    sx={styles.uploadBtn}
                  >
                    Upload CK Document (Optional)
                    <input type="file" hidden name="ckDocument" onChange={handleFileChange} />
                  </Button>
                  {files.ckDocument && (
                    <Typography variant="caption" sx={{ color: "#10b981", mt: 0.5, display: "block" }}>
                      Selected: {files.ckDocument.name}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<UploadFile />}
                    sx={styles.uploadBtn}
                  >
                    Upload Bank Statement (Optional)
                    <input type="file" hidden name="bankStatementDoc" onChange={handleFileChange} />
                  </Button>
                  {files.bankStatementDoc && (
                    <Typography variant="caption" sx={{ color: "#10b981", mt: 0.5, display: "block" }}>
                      Selected: {files.bankStatementDoc.name}
                    </Typography>
                  )}
                </Grid>

                {formData.isDirector === "no" && (
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      color="warning"
                      startIcon={<UploadFile />}
                      sx={styles.uploadBtn}
                    >
                      Upload ID Copy and Directors Proxy * (Required for non-directors)
                      <input type="file" hidden name="directorProxyDoc" onChange={handleFileChange} />
                    </Button>
                    {files.directorProxyDoc && (
                      <Typography variant="caption" sx={{ color: "#10b981", mt: 0.5, display: "block" }}>
                        Selected: {files.directorProxyDoc.name}
                      </Typography>
                    )}
                  </Grid>
                )}
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
                {editingId ? "Update Application Details" : "Submit Pre-Vetting Application"}
              </Button>
            </Grid>
          </Grid>
        </form>

        {/* BOTTOM ACTION BAR - VIEW ALL MY APPLICATIONS BUTTON */}
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

        {/* TABLE SECTION - ISOLATED TO LOGGED AGENT ONLY */}
        {showApplications && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ color: "#fff", mb: 2, fontWeight: "bold" }}>
              My Telkom Business Applications
            </Typography>

            <TableContainer component={Paper} sx={styles.tableContainer}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  <TableRow>
                    <TableCell sx={styles.th}>Applicant Name</TableCell>
                    <TableCell sx={styles.th}>Contact / ID</TableCell>
                    <TableCell sx={styles.th}>Product / Package</TableCell>
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
                          {lead.packageSelected || lead.pabxOption || "-"}
                          <br />
                          <small style={{ color: "#3b82f6" }}>{lead.productType}</small>
                        </TableCell>
                        <TableCell sx={{ ...styles.td, color: "#10b981", fontWeight: "bold" }}>
                          R {lead.calculatedCommission ? lead.calculatedCommission.toLocaleString("en-ZA") : 0}
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
              <Typography variant="subtitle2" sx={{ color: "#60a5fa" }}>Personal Details</Typography>
              <Typography variant="body2"><b>Full Name:</b> {selectedLeadDetails.title} {selectedLeadDetails.firstNames} {selectedLeadDetails.surname}</Typography>
              <Typography variant="body2"><b>ID / Passport:</b> {selectedLeadDetails.idOrPassport}</Typography>
              <Typography variant="body2"><b>Contact:</b> {selectedLeadDetails.contactNumber} | {selectedLeadDetails.emailAddress}</Typography>

              <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.08)" }} />

              <Typography variant="subtitle2" sx={{ color: "#60a5fa" }}>Installation / Delivery Address</Typography>
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

              <Typography variant="subtitle2" sx={{ color: "#60a5fa" }}>Company Details</Typography>
              <Typography variant="body2"><b>Company:</b> {selectedLeadDetails.companyWorkingFor}</Typography>
              <Typography variant="body2"><b>Company Address:</b> {selectedLeadDetails.companyAddress || "N/A"}</Typography>
              <Typography variant="body2"><b>Company Contact:</b> {selectedLeadDetails.companyContactNo || "N/A"}</Typography>
              <Typography variant="body2"><b>Is Director:</b> {selectedLeadDetails.isDirector}</Typography>

              <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.08)" }} />

              <Typography variant="subtitle2" sx={{ color: "#60a5fa" }}>Financial & Banking Details</Typography>
              <Typography variant="body2"><b>Gross / Net Income:</b> {selectedLeadDetails.grossIncome} / {selectedLeadDetails.netIncome}</Typography>
              <Typography variant="body2"><b>Expenses:</b> {selectedLeadDetails.totalMonthlyExpenses}</Typography>
              <Typography variant="body2"><b>Bank:</b> {selectedLeadDetails.bankName} | <b>Account:</b> {selectedLeadDetails.accountNumber}</Typography>
              <Typography variant="body2"><b>Debit Order Date:</b> {selectedLeadDetails.debitOrderDate}</Typography>

              <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.08)" }} />

              <Typography variant="subtitle2" sx={{ color: "#60a5fa" }}>Product & Financial Summary</Typography>
              <Typography variant="body2"><b>Product Category:</b> {selectedLeadDetails.productType}</Typography>
              <Typography variant="body2"><b>Package / Option:</b> {selectedLeadDetails.packageSelected || selectedLeadDetails.pabxOption || "N/A"}</Typography>
              <Typography variant="body2"><b>Calculated Price:</b> R {selectedLeadDetails.calculatedPrice?.toLocaleString("en-ZA") || 0}</Typography>
              <Typography variant="body2"><b>Calculated Commission:</b> R {selectedLeadDetails.calculatedCommission?.toLocaleString("en-ZA") || 0}</Typography>
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

export default FieldUpdatesTbusiness;