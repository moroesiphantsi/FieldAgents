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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  ToggleButton,
  ToggleButtonGroup,
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
  Info,
  Assignment,
  FlashOn,
  BusinessCenter,
  Cancel,
  CheckCircle,
} from "@mui/icons-material";
import { ref, push, set, update, remove, onValue } from "firebase/database";
import { db } from "../firebase";

// ==========================================
// 1. CONTRACT DATA & INTERFACES
// ==========================================
interface PackageInfo {
  label: string;
  price: string;
  commission: string;
}

const CONTRACT_PACKAGE_CATALOG: Record<string, PackageInfo[]> = {
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

const initialContractFormState: ConsumerLeadData = {
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

// ==========================================
// 2. PREPAID DATA & INTERFACES
// ==========================================
interface PrepaidPackageInfo {
  label: string;
  price: string;
  commission: string;
}

const PREPAID_PACKAGES: PrepaidPackageInfo[] = [
  { label: "Prepaid Fibre 20/10Mbps 30Days @ R349 Voucher", price: "R349.00", commission: "R50.00" },
  { label: "Prepaid Stream Connect 25/25Mbps 30days @ R499 voucher", price: "R499.00", commission: "R50.00" },
  { label: "Prepaid Stream Connect 50/25Mbps 30days @ R700 voucher", price: "R700.00", commission: "R50.00" },
  { label: "Not sure if my address is covered. Please contact me", price: "R0.00", commission: "R0.00" },
];

interface PrepaidLeadData {
  id?: string;
  title: string;
  surnameOrBusinessName: string;
  firstNamesOrContactName: string;
  idOrPassportOrRegNo: string;
  contactNumber: string;
  emailAddress: string;
  streetAddress: string;
  suburb: string;
  townCity: string;
  province: string;
  postalCode: string;
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

const initialPrepaidFormState: PrepaidLeadData = {
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

// ==========================================
// 3. TELKOM BUSINESS DATA & INTERFACES
// ==========================================
const TB_PRODUCT_TYPES = {
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

const TB_PABX_OPTIONS = [
  { name: "Outright @ R", rate: 0.05, label: "5%" },
  { name: "Rental @ TVC", rate: 0.05, label: "5%" },
];

interface BusinessLeadData {
  id?: string;
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

const initialBusinessFormState: BusinessLeadData = {
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
  productType: TB_PRODUCT_TYPES.TB_FIBRE,
  packageSelected: "",
  pabxOption: "Outright Sale",
  pabxAmount: "",
  additionalComments: "",
  technicianOrSalesAgent: "",
  isDirector: "yes",
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const FieldUpdatesContract = () => {
  const [activeTab, setActiveTab] = useState<"contract" | "prepaid" | "business">("contract");
  const [activeAgentName, setActiveAgentName] = useState("");

  // Contract Form States
  const [contractFormData, setContractFormData] = useState<ConsumerLeadData>(initialContractFormState);
  const [submissionMode, setSubmissionMode] = useState<"manual" | "upload">("manual");
  const [contractFiles, setContractFiles] = useState<{
    contractDoc: File | null;
    idCopyDoc: File | null;
    bankStatementDoc: File | null;
    proofOfAddressDoc: File | null;
  }>({ contractDoc: null, idCopyDoc: null, bankStatementDoc: null, proofOfAddressDoc: null });

  // Prepaid Form States
  const [prepaidFormData, setPrepaidFormData] = useState<PrepaidLeadData>(initialPrepaidFormState);
  const [prepaidIdDoc, setPrepaidIdDoc] = useState<File | null>(null);

  // Telkom Business Form States
  const [businessFormData, setBusinessFormData] = useState<BusinessLeadData>(initialBusinessFormState);
  const [businessFiles, setBusinessFiles] = useState<{
    idOrPassportDoc: File | null;
    proofOfAddressDoc: File | null;
    ckDocument: File | null;
    bankStatementDoc: File | null;
    directorProxyDoc: File | null;
  }>({ idOrPassportDoc: null, proofOfAddressDoc: null, ckDocument: null, bankStatementDoc: null, directorProxyDoc: null });

  // Realtime Database Record Lists
  const [contractLeads, setContractLeads] = useState<ConsumerLeadData[]>([]);
  const [prepaidLeads, setPrepaidLeads] = useState<PrepaidLeadData[]>([]);
  const [businessLeads, setBusinessLeads] = useState<BusinessLeadData[]>([]);

  // UI Dialog/Table Control States
  const [showApplications, setShowApplications] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedLeadDetails, setSelectedLeadDetails] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<any>(null);
  const [confirmNameInput, setConfirmNameInput] = useState("");

  useEffect(() => {
    const savedAgent = sessionStorage.getItem("activeAgentName");
    if (savedAgent) setActiveAgentName(savedAgent);

    // Contract Listener
    const contractRef = ref(db, "contractFibreLeads");
    const unsubContract = onValue(contractRef, (snapshot) => {
      const data = snapshot.val();
      setContractLeads(data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })).reverse() : []);
    });

    // Prepaid Listener
    const prepaidRef = ref(db, "fibreLeads");
    const unsubPrepaid = onValue(prepaidRef, (snapshot) => {
      const data = snapshot.val();
      setPrepaidLeads(data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })).reverse() : []);
    });

    // Business Listener
    const businessRef = ref(db, "tbFibreLeads");
    const unsubBusiness = onValue(businessRef, (snapshot) => {
      const data = snapshot.val();
      setBusinessLeads(data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })).reverse() : []);
    });

    return () => {
      unsubContract();
      unsubPrepaid();
      unsubBusiness();
    };
  }, []);

  const filterByAgent = (list: any[]) => {
    return list.filter((item) => {
      if (!activeAgentName) return true;
      const agent = (item.agentLogged || item.technicianOrSalesAgent || "").toLowerCase();
      return agent === activeAgentName.toLowerCase();
    });
  };

  const userContractLeads = filterByAgent(contractLeads);
  const userPrepaidLeads = filterByAgent(prepaidLeads);
  const userBusinessLeads = filterByAgent(businessLeads);

  const handleTabChange = (_: any, newTab: "contract" | "prepaid" | "business" | null) => {
    if (newTab) {
      setActiveTab(newTab);
      setEditingId(null);
    }
  };

  const getBusinessFinancials = () => {
    let price = 0;
    let commission = 0;
    if (businessFormData.productType === TB_PRODUCT_TYPES.TB_FIBRE) {
      const selected = TB_FIBRE_PACKAGES.find((pkg) => pkg.name === businessFormData.packageSelected);
      if (selected) {
        price = selected.price;
        commission = selected.commission;
      }
    } else if (businessFormData.productType === TB_PRODUCT_TYPES.TB_VOICE) {
      const selected = TB_VOICE_PACKAGES.find((pkg) => pkg.name === businessFormData.packageSelected);
      if (selected) {
        price = selected.price;
        commission = selected.commission;
      }
    } else if (businessFormData.productType === TB_PRODUCT_TYPES.TB_PABX) {
      const amount = parseFloat(businessFormData.pabxAmount || "0");
      const selectedOption = TB_PABX_OPTIONS.find((opt) => opt.name === businessFormData.pabxOption);
      price = isNaN(amount) ? 0 : amount;
      if (selectedOption && !isNaN(amount)) {
        commission = amount * selectedOption.rate;
      }
    }

    return { price, commission };
  };

  const businessFinancials = getBusinessFinancials();

  // Form Submissions
  const handleContractSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentAgent = activeAgentName || contractFormData.technicianOrSalesAgent;
    if (!currentAgent) return alert("Please enter the Sales Agent name.");

    if (submissionMode === "upload" && !editingId) {
      if (!contractFiles.contractDoc) return alert("Please upload the Contract Document.");
      if (!contractFiles.idCopyDoc) return alert("Please upload an ID Copy.");
    }

    try {
      if (editingId) {
        await update(ref(db, `contractFibreLeads/${editingId}`), {
          ...contractFormData,
          technicianOrSalesAgent: currentAgent,
          agentLogged: currentAgent,
          submissionMode,
          updatedAt: new Date().toISOString(),
          ...(contractFiles.contractDoc && { contractDocName: contractFiles.contractDoc.name }),
          ...(contractFiles.idCopyDoc && { idCopyDocName: contractFiles.idCopyDoc.name }),
          ...(contractFiles.bankStatementDoc && { bankStatementDocName: contractFiles.bankStatementDoc.name }),
          ...(contractFiles.proofOfAddressDoc && { proofOfAddressDocName: contractFiles.proofOfAddressDoc.name }),
        });
        alert("Contract Application updated successfully!");
        setEditingId(null);
      } else {
        const payload = {
          ...contractFormData,
          submissionMode,
          status: submissionMode === "upload" ? "Pending Vetting" : "Pending",
          technicianOrSalesAgent: currentAgent,
          agentLogged: currentAgent,
          submittedAt: new Date().toISOString(),
          contractDocName: contractFiles.contractDoc ? contractFiles.contractDoc.name : null,
          idCopyDocName: contractFiles.idCopyDoc ? contractFiles.idCopyDoc.name : null,
          bankStatementDocName: contractFiles.bankStatementDoc ? contractFiles.bankStatementDoc.name : null,
          proofOfAddressDocName: contractFiles.proofOfAddressDoc ? contractFiles.proofOfAddressDoc.name : null,
        };
        await set(push(ref(db, "contractFibreLeads")), payload);
        alert("Contract Application submitted successfully!");
      }
      setContractFormData(initialContractFormState);
      setContractFiles({ contractDoc: null, idCopyDoc: null, bankStatementDoc: null, proofOfAddressDoc: null });
    } catch (err: any) {
      alert("Error saving record: " + err.message);
    }
  };

  const handlePrepaidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId && !prepaidIdDoc) return alert("Please upload an ID Copy or Passport (Compulsory).");

    try {
      if (editingId) {
        await update(ref(db, `fibreLeads/${editingId}`), {
          ...prepaidFormData,
          updatedAt: new Date().toISOString(),
        });
        alert("Prepaid Application updated successfully!");
        setEditingId(null);
      } else {
        const payload = {
          ...prepaidFormData,
          status: "Pending",
          agentLogged: activeAgentName || prepaidFormData.technicianOrSalesAgent || "System Agent",
          submittedAt: new Date().toISOString(),
          attachments: { idOrPassportDoc: prepaidIdDoc ? prepaidIdDoc.name : null },
        };
        await set(push(ref(db, "fibreLeads")), payload);
        alert("Prepaid Fibre Lead submitted successfully!");
      }
      setPrepaidFormData(initialPrepaidFormState);
      setPrepaidIdDoc(null);
    } catch (err: any) {
      alert("Error saving record: " + err.message);
    }
  };

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId && !businessFiles.idOrPassportDoc) return alert("Please upload an ID Copy or Passport.");
    if (!editingId && businessFormData.isDirector === "no" && !businessFiles.directorProxyDoc) {
      return alert("Proxy document from directors is required since applicant is not a director.");
    }

    try {
      const payloadData = {
        ...businessFormData,
        calculatedPrice: businessFinancials.price,
        calculatedCommission: businessFinancials.commission,
      };

      if (editingId) {
        await update(ref(db, `tbFibreLeads/${editingId}`), {
          ...payloadData,
          updatedAt: new Date().toISOString(),
        });
        alert("Application updated successfully!");
        setEditingId(null);
      } else {
        const payload = {
          ...payloadData,
          status: "Pending",
          agentLogged: activeAgentName || businessFormData.technicianOrSalesAgent || "System Agent",
          submittedAt: new Date().toISOString(),
          attachments: {
            idOrPassportDoc: businessFiles.idOrPassportDoc ? businessFiles.idOrPassportDoc.name : null,
            proofOfAddressDoc: businessFiles.proofOfAddressDoc ? businessFiles.proofOfAddressDoc.name : null,
            ckDocument: businessFiles.ckDocument ? businessFiles.ckDocument.name : null,
            bankStatementDoc: businessFiles.bankStatementDoc ? businessFiles.bankStatementDoc.name : null,
            directorProxyDoc: businessFiles.directorProxyDoc ? businessFiles.directorProxyDoc.name : null,
          },
        };
        await set(push(ref(db, "tbFibreLeads")), payload);
        alert("Telkom Business Application successfully submitted!");
      }
      setBusinessFormData(initialBusinessFormState);
      setBusinessFiles({ idOrPassportDoc: null, proofOfAddressDoc: null, ckDocument: null, bankStatementDoc: null, directorProxyDoc: null });
    } catch (err: any) {
      alert("Error saving record: " + err.message);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    if (activeTab === "contract") {
      setSubmissionMode(item.submissionMode || "manual");
      setContractFormData({ ...initialContractFormState, ...item });
    } else if (activeTab === "prepaid") {
      setPrepaidFormData({ ...initialPrepaidFormState, ...item });
    } else {
      setBusinessFormData({ ...initialBusinessFormState, ...item });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = (item: any) => {
    setLeadToDelete(item);
    setConfirmNameInput("");
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!leadToDelete?.id) return;
    const path = activeTab === "contract" ? "contractFibreLeads" : activeTab === "prepaid" ? "fibreLeads" : "tbFibreLeads";
    try {
      await remove(ref(db, `${path}/${leadToDelete.id}`));
      alert("Record deleted successfully.");
      setDeleteDialogOpen(false);
      setLeadToDelete(null);
      setConfirmNameInput("");
    } catch (err: any) {
      alert("Failed to delete record: " + err.message);
    }
  };

  const getExpectedCustomerName = () => {
    if (!leadToDelete) return "";
    if (activeTab === "contract") {
      return (leadToDelete.firstNames ? `${leadToDelete.firstNames} ${leadToDelete.surname}` : leadToDelete.technicianOrSalesAgent || "").trim();
    }
    if (activeTab === "prepaid") {
      return `${leadToDelete.firstNamesOrContactName || ""} ${leadToDelete.surnameOrBusinessName || ""}`.trim();
    }
    return `${leadToDelete.firstNames || ""} ${leadToDelete.surname || ""}`.trim();
  };

  const getStatusChipColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "success";
      case "in progress":
      case "pending vetting":
        return "info";
      case "rejected":
        return "error";
      default:
        return "warning";
    }
  };

  const currentLeadsList = activeTab === "contract" ? userContractLeads : activeTab === "prepaid" ? userPrepaidLeads : userBusinessLeads;

  return (
    <Box sx={styles.container}>
      <Paper sx={styles.card}>
        {/* SELECTOR FOR THREE FORMS */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <ToggleButtonGroup
            value={activeTab}
            exclusive
            onChange={handleTabChange}
            color="primary"
            sx={{
              backgroundColor: "#f1f5f9",
              borderRadius: "12px",
              p: 0.5,
              "& .MuiToggleButton-root": {
                border: "none",
                borderRadius: "10px",
                px: 3,
                py: 1,
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "1rem",
              },
            }}
          >
            <ToggleButton value="contract">
              <Assignment sx={{ mr: 1 }} /> Contract Form
            </ToggleButton>
            <ToggleButton value="prepaid">
              <FlashOn sx={{ mr: 1 }} /> Prepaid Fibre
            </ToggleButton>
            <ToggleButton value="business">
              <BusinessCenter sx={{ mr: 1 }} /> Telkom Business
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {activeAgentName && (
          <Alert severity="info" sx={{ mb: 3, backgroundColor: "#eff6ff", color: "#1d4ed8" }}>
            Active Logged Agent: <b>{activeAgentName}</b>
          </Alert>
        )}

        {editingId && (
          <Alert
            severity="warning"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={() => { setEditingId(null); setContractFormData(initialContractFormState); setPrepaidFormData(initialPrepaidFormState); setBusinessFormData(initialBusinessFormState); }}>
                Cancel Edit
              </Button>
            }
          >
            Editing Application ID: <b>{editingId}</b>
          </Alert>
        )}

        {/* ==================== FORM 1: CONTRACT ==================== */}
        {activeTab === "contract" && (
          <>
            <Typography variant="h4" fontWeight="900" textAlign="center" sx={{ color: "#000000", mb: 1 }}>
              {editingId ? "Edit Contract Application" : "Contract Application"}
            </Typography>

            <Typography textAlign="center" sx={{ color: "#475569", mb: 1, fontSize: 14 }}>
              Complete the form for pre-vetting | You may also request manual application form by emailing us on{" "}
              <span style={{ color: "#2563eb" }}>pitsok@telkom.co.za</span>
            </Typography>

            <Typography textAlign="center" sx={{ color: "#334155", mb: 3, fontSize: 13, fontWeight: "bold" }}>
              Office: 051 401 6514 / 6816 | WhatsApp: 068 593 2102 / 073 895 4522
            </Typography>

            <Box sx={styles.toggleBox}>
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ fontWeight: "bold", color: "#1e293b", mb: 1 }}>
                  Choose Submission Method:
                </FormLabel>
                <RadioGroup row value={submissionMode} onChange={(e) => setSubmissionMode(e.target.value as "manual" | "upload")}>
                  <FormControlLabel value="manual" control={<Radio color="primary" />} label="Type Details Manually" />
                  <FormControlLabel value="upload" control={<Radio color="primary" />} label="Upload Documents Direct" />
                </RadioGroup>
              </FormControl>
            </Box>

            <form onSubmit={handleContractSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Sales Agent / Field Representative *"
                    value={activeAgentName || contractFormData.technicianOrSalesAgent}
                    onChange={(e) => setContractFormData({ ...contractFormData, technicianOrSalesAgent: e.target.value })}
                    sx={styles.input}
                  />
                </Grid>

                {submissionMode === "manual" && (
                  <>
                    <Grid item xs={12} sm={3}>
                      <TextField select required fullWidth label="Title" value={contractFormData.title} onChange={(e) => setContractFormData({ ...contractFormData, title: e.target.value })} sx={styles.input}>
                        {["Mr", "Mrs", "Miss", "MS", "Dr", "PS", "Prof"].map((t) => (
                          <MenuItem key={t} value={t}>{t}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4.5}>
                      <TextField required fullWidth label="Surname" value={contractFormData.surname} onChange={(e) => setContractFormData({ ...contractFormData, surname: e.target.value })} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={4.5}>
                      <TextField required fullWidth label="First Names as on ID" value={contractFormData.firstNames} onChange={(e) => setContractFormData({ ...contractFormData, firstNames: e.target.value })} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField required fullWidth label="ID Number Or Passport" value={contractFormData.idOrPassport} onChange={(e) => setContractFormData({ ...contractFormData, idOrPassport: e.target.value })} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField required fullWidth label="Contact Number" value={contractFormData.contactNumber} onChange={(e) => setContractFormData({ ...contractFormData, contactNumber: e.target.value })} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField required fullWidth label="Email Address" type="email" value={contractFormData.emailAddress} onChange={(e) => setContractFormData({ ...contractFormData, emailAddress: e.target.value })} sx={styles.input} />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ color: "#2563eb", mt: 1, fontWeight: "bold" }}>
                        Installation Address Details
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField required fullWidth label="Street Address" value={contractFormData.streetAddress} onChange={(e) => setContractFormData({ ...contractFormData, streetAddress: e.target.value })} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField required fullWidth label="Suburb" value={contractFormData.suburb} onChange={(e) => setContractFormData({ ...contractFormData, suburb: e.target.value })} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField required fullWidth label="Town / City" value={contractFormData.townCity} onChange={(e) => setContractFormData({ ...contractFormData, townCity: e.target.value })} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField select required fullWidth label="Province" value={contractFormData.province} onChange={(e) => setContractFormData({ ...contractFormData, province: e.target.value })} sx={styles.input}>
                        {["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"].map((p) => (
                          <MenuItem key={p} value={p}>{p}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField required fullWidth label="Postal Code" value={contractFormData.postalCode} onChange={(e) => setContractFormData({ ...contractFormData, postalCode: e.target.value })} sx={styles.input} />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ color: "#2563eb", mt: 1, fontWeight: "bold" }}>
                        Employment & Financial Information
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField required fullWidth label="Employer / Company Name" value={contractFormData.employerName} onChange={(e) => setContractFormData({ ...contractFormData, employerName: e.target.value })} sx={styles.input} InputProps={{ startAdornment: <Business sx={{ color: "#475569", mr: 1 }} /> }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Employer Contact No" value={contractFormData.employerContactNo} onChange={(e) => setContractFormData({ ...contractFormData, employerContactNo: e.target.value })} sx={styles.input} InputProps={{ startAdornment: <ContactPhone sx={{ color: "#475569", mr: 1 }} /> }} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField required fullWidth label="Gross Income" value={contractFormData.grossIncome} onChange={(e) => setContractFormData({ ...contractFormData, grossIncome: e.target.value })} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField required fullWidth label="Net Income" value={contractFormData.netIncome} onChange={(e) => setContractFormData({ ...contractFormData, netIncome: e.target.value })} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField required fullWidth label="Total Monthly Expenses" value={contractFormData.totalMonthlyExpenses} onChange={(e) => setContractFormData({ ...contractFormData, totalMonthlyExpenses: e.target.value })} sx={styles.input} />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ color: "#2563eb", mt: 1, fontWeight: "bold" }}>
                        Payment Method & Banking Details
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField required fullWidth label="Bank Name" value={contractFormData.bankName} onChange={(e) => setContractFormData({ ...contractFormData, bankName: e.target.value })} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField required fullWidth label="Account Number" value={contractFormData.accountNumber} onChange={(e) => setContractFormData({ ...contractFormData, accountNumber: e.target.value })} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField select required fullWidth label="Debit Order Date" value={contractFormData.debitOrderDate} onChange={(e) => setContractFormData({ ...contractFormData, debitOrderDate: e.target.value })} sx={styles.input}>
                        {["5th", "15th", "20th", "25th", "Last day"].map((d) => (
                          <MenuItem key={d} value={d}>{d}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ color: "#2563eb", mt: 1, fontWeight: "bold" }}>
                        Product Selection & Pricing
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField select required fullWidth label="Product Category" value={contractFormData.productCategory} onChange={(e) => setContractFormData({ ...contractFormData, productCategory: e.target.value, packageSelected: "", packagePrice: "", commissionAmount: "" })} sx={styles.input}>
                        {["Telkom FTTH Postpaid", "Telkom LTE"].map((cat) => (
                          <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField select required fullWidth disabled={!contractFormData.productCategory} label="Select Package" value={contractFormData.packageSelected} onChange={(e) => {
                        const pkgName = e.target.value;
                        const matched = (CONTRACT_PACKAGE_CATALOG[contractFormData.productCategory] || []).find((p) => p.label === pkgName);
                        setContractFormData({ ...contractFormData, packageSelected: pkgName, packagePrice: matched ? matched.price : "", commissionAmount: matched ? matched.commission : "" });
                      }} sx={styles.input}>
                        {(CONTRACT_PACKAGE_CATALOG[contractFormData.productCategory] || []).map((pkg) => (
                          <MenuItem key={pkg.label} value={pkg.label}>{pkg.label}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {contractFormData.packageSelected && (
                      <Grid item xs={12}>
                        <Box sx={{ p: 2, borderRadius: "10px", background: "#f0fdf4", border: "1px solid #2563eb", display: "flex", justifyContent: "space-around" }}>
                          <Box textAlign="center">
                            <Typography variant="caption" sx={{ color: "#475569" }}>Monthly Pricing</Typography>
                            <Typography variant="h6" sx={{ color: "#1d4ed8", fontWeight: "bold" }}>{contractFormData.packagePrice}</Typography>
                          </Box>
                          <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(0, 0, 0, 0.12)" }} />
                          <Box textAlign="center">
                            <Typography variant="caption" sx={{ color: "#475569" }}>Agent Commission</Typography>
                            <Typography variant="h6" sx={{ color: "#059669", fontWeight: "bold" }}>{contractFormData.commissionAmount}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <TextField fullWidth multiline rows={2} label="Additional Comments" value={contractFormData.additionalComments} onChange={(e) => setContractFormData({ ...contractFormData, additionalComments: e.target.value })} sx={styles.input} />
                    </Grid>
                  </>
                )}

                {!editingId && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2, borderColor: "rgba(0,0,0,0.12)" }} />
                      <Typography variant="h6" sx={{ color: "#000000", fontWeight: "bold", mb: 1 }}>
                        Required Document Uploads
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button variant="outlined" component="label" fullWidth startIcon={<UploadFile />} sx={styles.uploadBtn}>
                        Upload Contract Document {submissionMode === "upload" && "*"}
                        <input type="file" hidden onChange={(e) => e.target.files?.[0] && setContractFiles({ ...contractFiles, contractDoc: e.target.files[0] })} />
                      </Button>
                      {contractFiles.contractDoc && <Typography variant="caption" sx={{ color: "#059669", display: "block", mt: 0.5 }}>Selected: {contractFiles.contractDoc.name}</Typography>}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button variant="outlined" component="label" fullWidth startIcon={<UploadFile />} sx={styles.uploadBtn}>
                        Upload ID Copy or Passport *
                        <input type="file" hidden onChange={(e) => e.target.files?.[0] && setContractFiles({ ...contractFiles, idCopyDoc: e.target.files[0] })} />
                      </Button>
                      {contractFiles.idCopyDoc && <Typography variant="caption" sx={{ color: "#059669", display: "block", mt: 0.5 }}>Selected: {contractFiles.idCopyDoc.name}</Typography>}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button variant="outlined" component="label" fullWidth startIcon={<UploadFile />} sx={styles.uploadBtn}>
                        Upload Bank Statement (Optional)
                        <input type="file" hidden onChange={(e) => e.target.files?.[0] && setContractFiles({ ...contractFiles, bankStatementDoc: e.target.files[0] })} />
                      </Button>
                      {contractFiles.bankStatementDoc && <Typography variant="caption" sx={{ color: "#059669", display: "block", mt: 0.5 }}>Selected: {contractFiles.bankStatementDoc.name}</Typography>}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button variant="outlined" component="label" fullWidth startIcon={<UploadFile />} sx={styles.uploadBtn}>
                        Upload Proof of Address (Optional)
                        <input type="file" hidden onChange={(e) => e.target.files?.[0] && setContractFiles({ ...contractFiles, proofOfAddressDoc: e.target.files[0] })} />
                      </Button>
                      {contractFiles.proofOfAddressDoc && <Typography variant="caption" sx={{ color: "#059669", display: "block", mt: 0.5 }}>Selected: {contractFiles.proofOfAddressDoc.name}</Typography>}
                    </Grid>
                  </>
                )}

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button type="submit" fullWidth variant="contained" startIcon={<Send />} sx={styles.submitButton}>
                    {editingId ? "Update Contract Application" : "Submit Contract Application"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </>
        )}

        {/* ==================== FORM 2: PREPAID ==================== */}
        {activeTab === "prepaid" && (
          <>
            <Typography variant="h4" fontWeight="900" textAlign="center" sx={{ color: "#000000", mb: 1 }}>
              {editingId ? "Edit Prepaid Application" : "Prepaid Openserve Fibre"}
            </Typography>

            <Typography textAlign="center" sx={{ color: "#475569", mb: 1, fontSize: 14 }}>
              Control your Fibre Internet Spend with Prepaid Fibre. No contracts, No credit Vetting. Complete the form and get connected.
            </Typography>

            <Typography textAlign="center" sx={{ color: "#334155", mb: 3, fontSize: 13, fontWeight: "bold" }}>
              Free installation till end of September 2026. WhatsApp: <span style={{ color: "#2563eb" }}>0836078922</span>
            </Typography>

            <form onSubmit={handlePrepaidSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <TextField select required fullWidth label="Title *" name="title" value={prepaidFormData.title} onChange={(e) => setPrepaidFormData({ ...prepaidFormData, title: e.target.value })} sx={styles.input}>
                    {["Mr", "Mrs", "Miss", "MS", "Dr", "PS", "Prof", "Business"].map((t) => (
                      <MenuItem key={t} value={t}>{t}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4.5}>
                  <TextField required fullWidth label="Surname or Business Name *" value={prepaidFormData.surnameOrBusinessName} onChange={(e) => setPrepaidFormData({ ...prepaidFormData, surnameOrBusinessName: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4.5}>
                  <TextField required fullWidth label="First Names as on ID or Business contact name *" value={prepaidFormData.firstNamesOrContactName} onChange={(e) => setPrepaidFormData({ ...prepaidFormData, firstNamesOrContactName: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField required fullWidth label="ID Number/ Passport or business registration *" value={prepaidFormData.idOrPassportOrRegNo} onChange={(e) => setPrepaidFormData({ ...prepaidFormData, idOrPassportOrRegNo: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField required fullWidth label="Contact number *" value={prepaidFormData.contactNumber} onChange={(e) => setPrepaidFormData({ ...prepaidFormData, contactNumber: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12}>
                  <TextField required fullWidth label="Email Address *" type="email" value={prepaidFormData.emailAddress} onChange={(e) => setPrepaidFormData({ ...prepaidFormData, emailAddress: e.target.value })} sx={styles.input} />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ color: "#2563eb", mt: 1, fontWeight: "bold" }}>
                    Installation / Delivery Address Details
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField required fullWidth label="Street Address *" value={prepaidFormData.streetAddress} onChange={(e) => setPrepaidFormData({ ...prepaidFormData, streetAddress: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField required fullWidth label="Suburb *" value={prepaidFormData.suburb} onChange={(e) => setPrepaidFormData({ ...prepaidFormData, suburb: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField required fullWidth label="Town / City *" value={prepaidFormData.townCity} onChange={(e) => setPrepaidFormData({ ...prepaidFormData, townCity: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField select required fullWidth label="Province *" value={prepaidFormData.province} onChange={(e) => setPrepaidFormData({ ...prepaidFormData, province: e.target.value })} sx={styles.input}>
                    {["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"].map((p) => (
                      <MenuItem key={p} value={p}>{p}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField required fullWidth label="Postal Code *" value={prepaidFormData.postalCode} onChange={(e) => setPrepaidFormData({ ...prepaidFormData, postalCode: e.target.value })} sx={styles.input} />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ color: "#2563eb", mt: 1, fontWeight: "bold" }}>
                    Prepaid Package Selection
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField select required fullWidth label="Choose Prepaid Package *" value={prepaidFormData.packageSelected} onChange={(e) => {
                    const sel = e.target.value;
                    const matched = PREPAID_PACKAGES.find((p) => p.label === sel);
                    setPrepaidFormData({
                      ...prepaidFormData,
                      packageSelected: sel,
                      packagePrice: matched ? matched.price : "R0.00",
                      commissionAmount: matched ? matched.commission : "R0.00",
                    });
                  }} sx={styles.input}>
                    {PREPAID_PACKAGES.map((pkg) => (
                      <MenuItem key={pkg.label} value={pkg.label}>{pkg.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {prepaidFormData.packageSelected && (
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, borderRadius: "10px", background: "#f0fdf4", border: "1px solid #2563eb", display: "flex", justifyContent: "space-around" }}>
                      <Box textAlign="center">
                        <Typography variant="caption" sx={{ color: "#475569" }}>Voucher Price</Typography>
                        <Typography variant="h6" sx={{ color: "#1d4ed8", fontWeight: "bold" }}>{prepaidFormData.packagePrice}</Typography>
                      </Box>
                      <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(0, 0, 0, 0.12)" }} />
                      <Box textAlign="center">
                        <Typography variant="caption" sx={{ color: "#475569" }}>Agent Commission</Typography>
                        <Typography variant="h6" sx={{ color: "#059669", fontWeight: "bold" }}>{prepaidFormData.commissionAmount}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={2} label="Additional Comments" value={prepaidFormData.additionalComments} onChange={(e) => setPrepaidFormData({ ...prepaidFormData, additionalComments: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Technician Name or Sales agent" value={activeAgentName || prepaidFormData.technicianOrSalesAgent} onChange={(e) => setPrepaidFormData({ ...prepaidFormData, technicianOrSalesAgent: e.target.value })} sx={styles.input} />
                </Grid>

                {!editingId && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2, borderColor: "rgba(0,0,0,0.12)" }} />
                      <Typography variant="h6" sx={{ color: "#000000", fontWeight: "bold", mb: 1 }}>
                        Required Attachments
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Button variant="outlined" component="label" fullWidth startIcon={<UploadFile />} sx={styles.uploadBtn}>
                        Upload ID Copy or Passport * (Compulsory)
                        <input type="file" hidden onChange={(e) => e.target.files?.[0] && setPrepaidIdDoc(e.target.files[0])} />
                      </Button>
                      {prepaidIdDoc && <Typography variant="caption" sx={{ color: "#059669", display: "block", mt: 0.5 }}>Selected: {prepaidIdDoc.name}</Typography>}
                    </Grid>
                  </>
                )}

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button type="submit" fullWidth variant="contained" startIcon={<Send />} sx={styles.submitButton}>
                    {editingId ? "Update Prepaid Application" : "Submit Prepaid Application"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </>
        )}

        {/* ==================== FORM 3: TELKOM BUSINESS ==================== */}
        {activeTab === "business" && (
          <>
            <Typography variant="h4" fontWeight="900" textAlign="center" sx={{ color: "#000000", mb: 1 }}>
              {editingId ? "Edit Telkom Business Application" : "Telkom Business Application"}
            </Typography>

            <Typography textAlign="center" sx={{ color: "#475569", mb: 1, fontSize: 14 }}>
              Complete the form for pre-vetting | You may also request manual application form by emailing us on{" "}
              <span style={{ color: "#2563eb" }}>pitsok@telkom.co.za</span>
            </Typography>

            <Typography textAlign="center" sx={{ color: "#334155", mb: 3, fontSize: 13, fontWeight: "bold" }}>
              Office: 051 401 6514 / 6816 | WhatsApp: 068 593 2102 / 073 895 4522
            </Typography>

            <form onSubmit={handleBusinessSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <TextField select required fullWidth label="Title" value={businessFormData.title} onChange={(e) => setBusinessFormData({ ...businessFormData, title: e.target.value })} sx={styles.input}>
                    {["Mr", "Mrs", "Miss", "MS", "Dr", "PS", "Prof"].map((t) => (
                      <MenuItem key={t} value={t}>{t}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4.5}>
                  <TextField required fullWidth label="Surname" value={businessFormData.surname} onChange={(e) => setBusinessFormData({ ...businessFormData, surname: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4.5}>
                  <TextField required fullWidth label="First Names as on ID" value={businessFormData.firstNames} onChange={(e) => setBusinessFormData({ ...businessFormData, firstNames: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField required fullWidth label="ID Number Or Passport" value={businessFormData.idOrPassport} onChange={(e) => setBusinessFormData({ ...businessFormData, idOrPassport: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField required fullWidth label="Contact Number" value={businessFormData.contactNumber} onChange={(e) => setBusinessFormData({ ...businessFormData, contactNumber: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12}>
                  <TextField required fullWidth label="Email Address" type="email" value={businessFormData.emailAddress} onChange={(e) => setBusinessFormData({ ...businessFormData, emailAddress: e.target.value })} sx={styles.input} />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ color: "#2563eb", mt: 1, fontWeight: "bold" }}>
                    Installation / Delivery Address Details
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField required fullWidth label="Street Address" value={businessFormData.streetAddress} onChange={(e) => setBusinessFormData({ ...businessFormData, streetAddress: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField required fullWidth label="Suburb" value={businessFormData.suburb} onChange={(e) => setBusinessFormData({ ...businessFormData, suburb: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField required fullWidth label="Town / City" value={businessFormData.townCity} onChange={(e) => setBusinessFormData({ ...businessFormData, townCity: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField select required fullWidth label="Province" value={businessFormData.province} onChange={(e) => setBusinessFormData({ ...businessFormData, province: e.target.value })} sx={styles.input}>
                    {["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"].map((p) => (
                      <MenuItem key={p} value={p}>{p}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField required fullWidth label="Postal Code" value={businessFormData.postalCode} onChange={(e) => setBusinessFormData({ ...businessFormData, postalCode: e.target.value })} sx={styles.input} />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ color: "#2563eb", mt: 1, fontWeight: "bold" }}>
                    Company Details
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField required fullWidth label="Company Working For" value={businessFormData.companyWorkingFor} onChange={(e) => setBusinessFormData({ ...businessFormData, companyWorkingFor: e.target.value })} sx={styles.input} InputProps={{ startAdornment: <Business sx={{ color: "#475569", mr: 1 }} /> }} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Company Address" value={businessFormData.companyAddress} onChange={(e) => setBusinessFormData({ ...businessFormData, companyAddress: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Company Contact No" value={businessFormData.companyContactNo} onChange={(e) => setBusinessFormData({ ...businessFormData, companyContactNo: e.target.value })} sx={styles.input} InputProps={{ startAdornment: <ContactPhone sx={{ color: "#475569", mr: 1 }} /> }} />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField required fullWidth label="Gross Income" value={businessFormData.grossIncome} onChange={(e) => setBusinessFormData({ ...businessFormData, grossIncome: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField required fullWidth label="Net Income" value={businessFormData.netIncome} onChange={(e) => setBusinessFormData({ ...businessFormData, netIncome: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField required fullWidth label="Total Monthly Expenses" value={businessFormData.totalMonthlyExpenses} onChange={(e) => setBusinessFormData({ ...businessFormData, totalMonthlyExpenses: e.target.value })} sx={styles.input} />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ color: "#2563eb", mt: 1, fontWeight: "bold" }}>
                    Payment Method & Debit Order Details
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField required fullWidth label="Bank Name" value={businessFormData.bankName} onChange={(e) => setBusinessFormData({ ...businessFormData, bankName: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField required fullWidth label="Account Number" value={businessFormData.accountNumber} onChange={(e) => setBusinessFormData({ ...businessFormData, accountNumber: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField select required fullWidth label="Debit Order Date" value={businessFormData.debitOrderDate} onChange={(e) => setBusinessFormData({ ...businessFormData, debitOrderDate: e.target.value })} sx={styles.input}>
                    {["5th", "15th", "20th", "25th", "Last day"].map((d) => (
                      <MenuItem key={d} value={d}>{d}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ color: "#2563eb", mt: 1, fontWeight: "bold" }}>
                    Product Selection & Pricing
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField select required fullWidth label="Product Category" value={businessFormData.productType} onChange={(e) => setBusinessFormData({ ...businessFormData, productType: e.target.value, packageSelected: "" })} sx={styles.input}>
                    <MenuItem value={TB_PRODUCT_TYPES.TB_FIBRE}>TB Fibre</MenuItem>
                    <MenuItem value={TB_PRODUCT_TYPES.TB_VOICE}>TB Voice</MenuItem>
                    <MenuItem value={TB_PRODUCT_TYPES.TB_PABX}>TB PABX</MenuItem>
                  </TextField>
                </Grid>

                {(businessFormData.productType === TB_PRODUCT_TYPES.TB_FIBRE || businessFormData.productType === TB_PRODUCT_TYPES.TB_VOICE) && (
                  <Grid item xs={12} sm={8}>
                    <TextField select required fullWidth label={`Select ${businessFormData.productType} Package`} value={businessFormData.packageSelected} onChange={(e) => setBusinessFormData({ ...businessFormData, packageSelected: e.target.value })} sx={styles.input}>
                      {(businessFormData.productType === TB_PRODUCT_TYPES.TB_FIBRE ? TB_FIBRE_PACKAGES : TB_VOICE_PACKAGES).map((pkg) => (
                        <MenuItem key={pkg.name} value={pkg.name}>{pkg.name} — R{pkg.price}/pm</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                )}

                {businessFormData.productType === TB_PRODUCT_TYPES.TB_PABX && (
                  <>
                    <Grid item xs={12} sm={4}>
                      <TextField select required fullWidth label="PABX Option" value={businessFormData.pabxOption} onChange={(e) => setBusinessFormData({ ...businessFormData, pabxOption: e.target.value })} sx={styles.input}>
                        {TB_PABX_OPTIONS.map((opt) => (
                          <MenuItem key={opt.name} value={opt.name}>{opt.name} ({opt.label} Commission)</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField required fullWidth type="number" label="PABX Deal Amount (R)" value={businessFormData.pabxAmount} onChange={(e) => setBusinessFormData({ ...businessFormData, pabxAmount: e.target.value })} sx={styles.input} />
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <Box sx={{ p: 2, borderRadius: "10px", background: "#f0fdf4", border: "1px solid #2563eb", display: "flex", justifyContent: "space-around" }}>
                    <Box textAlign="center">
                      <Typography variant="caption" sx={{ color: "#475569" }}>Selected Price</Typography>
                      <Typography variant="h6" sx={{ color: "#1d4ed8", fontWeight: "bold" }}>R {businessFinancials.price.toLocaleString("en-ZA")}</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(0, 0, 0, 0.12)" }} />
                    <Box textAlign="center">
                      <Typography variant="caption" sx={{ color: "#475569" }}>Expected Commission</Typography>
                      <Typography variant="h6" sx={{ color: "#059669", fontWeight: "bold" }}>R {businessFinancials.commission.toLocaleString("en-ZA")}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={2} label="Additional Comments" value={businessFormData.additionalComments} onChange={(e) => setBusinessFormData({ ...businessFormData, additionalComments: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Technician Name or Sales Agent" value={activeAgentName || businessFormData.technicianOrSalesAgent} onChange={(e) => setBusinessFormData({ ...businessFormData, technicianOrSalesAgent: e.target.value })} sx={styles.input} />
                </Grid>

                {!editingId && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2, borderColor: "rgba(0,0,0,0.12)" }} />
                      <Typography variant="h6" sx={{ color: "#000000", fontWeight: "bold", mb: 1 }}>
                        Required Attachments & Documents
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl component="fieldset">
                        <FormLabel sx={{ color: "#475569" }}>Is the applicant a company director?</FormLabel>
                        <RadioGroup row value={businessFormData.isDirector} onChange={(e) => setBusinessFormData({ ...businessFormData, isDirector: e.target.value })}>
                          <FormControlLabel value="yes" control={<Radio sx={{ color: "#2563eb" }} />} label="Yes" />
                          <FormControlLabel value="no" control={<Radio sx={{ color: "#2563eb" }} />} label="No (Proxy Required)" />
                        </RadioGroup>
                      </FormControl>
                    </Grid>

                    {/* Updated 4 Required Document Fields */}
                    <Grid item xs={12} sm={6}>
                      <Button variant="outlined" component="label" fullWidth startIcon={<UploadFile />} sx={styles.uploadBtn}>
                        Upload ID Copy or Passport (Copy of SA ID or passport including work permit) *
                        <input type="file" hidden onChange={(e) => e.target.files?.[0] && setBusinessFiles({ ...businessFiles, idOrPassportDoc: e.target.files[0] })} />
                      </Button>
                      {businessFiles.idOrPassportDoc && <Typography variant="caption" sx={{ color: "#059669", display: "block", mt: 0.5 }}>Selected: {businessFiles.idOrPassportDoc.name}</Typography>}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Button variant="outlined" component="label" fullWidth startIcon={<UploadFile />} sx={styles.uploadBtn}>
                        Upload Proof of Address (Utility bill no older than three months)
                        <input type="file" hidden onChange={(e) => e.target.files?.[0] && setBusinessFiles({ ...businessFiles, proofOfAddressDoc: e.target.files[0] })} />
                      </Button>
                      {businessFiles.proofOfAddressDoc && <Typography variant="caption" sx={{ color: "#059669", display: "block", mt: 0.5 }}>Selected: {businessFiles.proofOfAddressDoc.name}</Typography>}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Button variant="outlined" component="label" fullWidth startIcon={<UploadFile />} sx={styles.uploadBtn}>
                        Upload CK Document (Business registration documentation)
                        <input type="file" hidden onChange={(e) => e.target.files?.[0] && setBusinessFiles({ ...businessFiles, ckDocument: e.target.files[0] })} />
                      </Button>
                      {businessFiles.ckDocument && <Typography variant="caption" sx={{ color: "#059669", display: "block", mt: 0.5 }}>Selected: {businessFiles.ckDocument.name}</Typography>}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Button variant="outlined" component="label" fullWidth startIcon={<UploadFile />} sx={styles.uploadBtn}>
                        Upload Bank Statement
                        <input type="file" hidden onChange={(e) => e.target.files?.[0] && setBusinessFiles({ ...businessFiles, bankStatementDoc: e.target.files[0] })} />
                      </Button>
                      {businessFiles.bankStatementDoc && <Typography variant="caption" sx={{ color: "#059669", display: "block", mt: 0.5 }}>Selected: {businessFiles.bankStatementDoc.name}</Typography>}
                    </Grid>

                    {businessFormData.isDirector === "no" && (
                      <Grid item xs={12}>
                        <Button variant="outlined" component="label" fullWidth color="warning" startIcon={<UploadFile />} sx={styles.uploadBtn}>
                          Upload Directors Proxy * (Required for non-directors)
                          <input type="file" hidden onChange={(e) => e.target.files?.[0] && setBusinessFiles({ ...businessFiles, directorProxyDoc: e.target.files[0] })} />
                        </Button>
                        {businessFiles.directorProxyDoc && <Typography variant="caption" sx={{ color: "#059669", display: "block", mt: 0.5 }}>Selected: {businessFiles.directorProxyDoc.name}</Typography>}
                      </Grid>
                    )}
                  </>
                )}

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button type="submit" fullWidth variant="contained" startIcon={<Send />} sx={styles.submitButton}>
                    {editingId ? "Update Application Details" : "Submit Pre-Vetting Application"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </>
        )}

        {/* BOTTOM ACTION BAR - VIEW APPLICATIONS TABLE */}
        <Divider sx={{ my: 4, borderColor: "rgba(0,0,0,0.12)" }} />

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
              "&:hover": { borderColor: "#1d4ed8", backgroundColor: "rgba(37, 99, 235, 0.05)" },
            }}
          >
            {showApplications ? "Hide Applications" : `View My ${activeTab.toUpperCase()} Applications (${currentLeadsList.length})`}
          </Button>
        </Box>

        {showApplications && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ color: "#000000", mb: 2, fontWeight: "bold" }}>
              My Submitted Applications
            </Typography>

            <TableContainer component={Paper} sx={styles.tableContainer}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: "rgba(0, 0, 0, 0.04)" }}>
                  <TableRow>
                    <TableCell sx={styles.th}>Applicant / Customer</TableCell>
                    <TableCell sx={styles.th}>Contact / ID</TableCell>
                    <TableCell sx={styles.th}>Product / Package</TableCell>
                    <TableCell sx={styles.th}>Commission</TableCell>
                    <TableCell sx={styles.th}>Status</TableCell>
                    <TableCell sx={styles.th} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentLeadsList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ color: "#64748b", py: 3 }}>
                        No records found for your agent account.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentLeadsList.map((lead: any) => (
                      <TableRow key={lead.id} sx={{ "&:hover": { backgroundColor: "rgba(0,0,0,0.02)" } }}>
                        <TableCell sx={styles.td}>
                          {lead.title} {lead.firstNames || lead.firstNamesOrContactName} {lead.surname || lead.surnameOrBusinessName}
                        </TableCell>
                        <TableCell sx={styles.td}>
                          {lead.contactNumber}<br />
                          <small style={{ color: "#64748b" }}>{lead.idOrPassport || lead.idOrPassportOrRegNo}</small>
                        </TableCell>
                        <TableCell sx={styles.td}>
                          {lead.packageSelected || lead.pabxOption || "-"}
                          {lead.productType && <><br /><small style={{ color: "#2563eb" }}>{lead.productType}</small></>}
                        </TableCell>
                        <TableCell sx={{ ...styles.td, color: "#059669", fontWeight: "bold" }}>
                          {lead.commissionAmount || (lead.calculatedCommission ? `R ${lead.calculatedCommission}` : "R0")}
                        </TableCell>
                        <TableCell sx={styles.td}>
                          <Chip label={lead.status || "Pending"} color={getStatusChipColor(lead.status) as any} size="small" sx={{ fontWeight: "bold" }} />
                        </TableCell>
                        <TableCell sx={styles.td} align="center">
                          <Tooltip title="View All Details">
                            <IconButton color="info" onClick={() => { setSelectedLeadDetails(lead); setViewDetailsOpen(true); }} size="small">
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
        PaperProps={{ sx: { backgroundColor: "#ffffff", color: "#000000", borderRadius: "16px", minWidth: { xs: "90%", sm: "500px" } } }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid #e2e8f0", color: "#2563eb", fontWeight: "bold" }}>
          Full Record Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedLeadDetails && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2"><b>Name:</b> {selectedLeadDetails.title} {selectedLeadDetails.firstNames || selectedLeadDetails.firstNamesOrContactName} {selectedLeadDetails.surname || selectedLeadDetails.surnameOrBusinessName}</Typography>
              <Typography variant="body2"><b>ID/Passport/Reg:</b> {selectedLeadDetails.idOrPassport || selectedLeadDetails.idOrPassportOrRegNo}</Typography>
              <Typography variant="body2"><b>Contact:</b> {selectedLeadDetails.contactNumber} | {selectedLeadDetails.emailAddress}</Typography>
              <Typography variant="body2"><b>Address:</b> {selectedLeadDetails.streetAddress}, {selectedLeadDetails.suburb}, {selectedLeadDetails.townCity}</Typography>
              <Typography variant="body2"><b>Package:</b> {selectedLeadDetails.packageSelected || selectedLeadDetails.productType}</Typography>
              <Typography variant="body2" sx={{ color: "#059669" }}><b>Commission:</b> {selectedLeadDetails.commissionAmount || selectedLeadDetails.calculatedCommission}</Typography>
              <Typography variant="body2"><b>Status:</b> {selectedLeadDetails.status || "Pending"}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setViewDetailsOpen(false)} variant="contained" sx={{ background: "#2563eb" }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: "12px", minWidth: { xs: "90%", sm: "400px" } } }}>
        <DialogTitle sx={{ color: "#dc2626", fontWeight: "bold" }}>Confirm Record Deletion</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2, color: "#334155", fontSize: 14 }}>
            To confirm deletion, please type the customer full name below:
            <br />
            <b style={{ color: "#d97706" }}>{getExpectedCustomerName()}</b>
          </Typography>
          <TextField fullWidth placeholder="Type name to confirm" value={confirmNameInput} onChange={(e) => setConfirmNameInput(e.target.value)} sx={styles.input} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} startIcon={<Cancel />}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={confirmNameInput.trim().toLowerCase() !== getExpectedCustomerName().toLowerCase()} startIcon={<CheckCircle />}>Delete Permanently</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const styles = {
  container: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 16px", background: "#ffffff" },
  card: { maxWidth: 950, width: "100%", p: 4, borderRadius: "16px", background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" },
  input: {
    "& .MuiOutlinedInput-root": {
      color: "#000000",
      backgroundColor: "#ffffff",
      borderRadius: "10px",
      "& fieldset": { borderColor: "rgba(0, 0, 0, 0.23)" },
      "&:hover fieldset": { borderColor: "rgba(0, 0, 0, 0.87)" },
      "&.Mui-focused fieldset": { borderColor: "#2563eb" },
    },
    "& .MuiInputLabel-root": { color: "#475569" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#2563eb" },
    "& .MuiSvgIcon-root": { color: "#475569" },
  },
  toggleBox: { border: "1px solid #cbd5e1", borderRadius: "10px", padding: "12px", mb: 3, backgroundColor: "#f8fafc" },
  uploadBtn: { borderColor: "rgba(0, 0, 0, 0.23)", color: "#1e293b", padding: "12px", borderRadius: "10px", textTransform: "none", "&:hover": { borderColor: "#2563eb", backgroundColor: "rgba(37, 99, 235, 0.05)" } },
  submitButton: { py: 1.5, fontWeight: "bold", borderRadius: "10px", textTransform: "none", fontSize: "1.05rem", background: "linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)", boxShadow: "0 4px 20px rgba(37, 99, 235, 0.2)", "&:hover": { background: "linear-gradient(90deg, #1d4ed8 0%, #6d28d9 100%)" } },
  tableContainer: { backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px" },
  th: { color: "#000000", fontWeight: "bold", borderColor: "#e2e8f0" },
  td: { color: "#000000", borderColor: "#e2e8f0" },
};

export default FieldUpdatesContract;