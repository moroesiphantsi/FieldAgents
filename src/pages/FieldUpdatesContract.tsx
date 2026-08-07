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
  Checkbox,
} from "@mui/material";
import {
  Send,
  UploadFile,
  Business,
  ContactPhone,
  Edit,
  Delete,
  Visibility,
  Assignment,
  FlashOn,
  BusinessCenter,
  Add,
  Download,
} from "@mui/icons-material";
import { ref, push, set, update, remove, onValue } from "firebase/database";
import { db } from "../firebase";


// ==========================================
// 2. CONTRACT DATA & INTERFACES
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
    { label: "Other / Enter New Package", price: "", commission: "" },
  ],
  "Telkom LTE": [
    { label: "10 Mbps Unlimited", price: "R299 pm", commission: "R300" },
    { label: "20 Mbps Unlimited", price: "R449 pm", commission: "R400" },
    { label: "30 Mbps Unlimited", price: "R599 pm", commission: "R500" },
    { label: "2TB", price: "R699 pm", commission: "R600" },
    { label: "Other / Enter New Package", price: "", commission: "" },
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
  technology: string;
  productCategory: string;
  packageSelected: string;
  customPackageName?: string;
  packagePrice: string;
  commissionAmount: string;
  additionalComments: string;
  technicianOrSalesAgent: string;
  contractDocName?: string | null;
  idCopyDocName?: string | null;
  bankStatementDocName?: string | null;
  proofOfAddressDocName?: string | null;
  docs?: Record<string, string | null>;
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
  technology: "",
  productCategory: "",
  packageSelected: "",
  customPackageName: "",
  packagePrice: "",
  commissionAmount: "",
  additionalComments: "",
  technicianOrSalesAgent: "",
};

// ==========================================
// 3. PREPAID DATA & INTERFACES
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
  { label: "Other / Enter New Package", price: "", commission: "" },
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
  technology: string;
  packageSelected: string;
  customPackageName?: string;
  packagePrice?: string;
  commissionAmount?: string;
  additionalComments: string;
  technicianOrSalesAgent: string;
  status?: string;
  agentLogged?: string;
  submittedAt?: string;
  docs?: Record<string, string | null>;
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
  technology: "",
  packageSelected: "",
  customPackageName: "",
  packagePrice: "",
  commissionAmount: "",
  additionalComments: "",
  technicianOrSalesAgent: "",
};

// ==========================================
// 4. TELKOM BUSINESS DATA & INTERFACES
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
  { name: "Other / Enter New Package", price: 0, commission: 0 },
];

const TB_VOICE_PACKAGES = [
  { name: "Smart Voice Basic", price: 239, commission: 120 },
  { name: "Smart Voice 100", price: 345, commission: 170 },
  { name: "Smart Voice 300", price: 469, commission: 200 },
  { name: "Smart Voice 500", price: 549, commission: 250 },
  { name: "Smart Voice Unlimited", price: 705, commission: 350 },
  { name: "Other / Enter New Package", price: 0, commission: 0 },
];

const TB_PABX_OPTIONS = [
  { name: "Outright @ R", rate: 0.05, label: "5%" },
  { name: "Rental @ TVC", rate: 0.05, label: "5%" },
];

interface DirectorInfo {
  nameAndSurname: string;
  idNo: string;
  passportNo: string;
  passportExpiryDate: string;
  saCitizen: "Y" | "N";
  permitType: string;
}

interface PortingInfo {
  accountClassification: string;
  accountType: string;
  dsp: string;
  accountNo: string;
  accountName: string;
  mobileNumber: string;
  ricaPersonName: string;
  ricaPersonIdOrReg: string;
  requestedPortDate: string;
}

interface BusinessLeadData {
  id?: string;
  orderNo: string;
  accountNoAdmin: string;
  dealerName: string;
  dealerCode: string;
  agentName: string;
  agentIdSalaryNo: string;
  ricaInfo: string;
  isExistingCustomer: "Y" | "N";
  existingAccountNumber: string;
  businessType: string;
  businessTypeOther: string;
  businessName: string;
  tradeName: string;
  companyRegOrIdNo: string;
  vatNo: string;
  industry: string;
  noOfEmployees: string;
  noOfBranches: string;
  directors: DirectorInfo[];
  title: string;
  surname: string;
  firstNames: string;
  initials: string;
  gender: string;
  dateOfBirth: string;
  idOrPassport: string;
  passportExpiryDate: string;
  saCitizen: "Y" | "N";
  permitType: string;
  grossIncome: string;
  netIncome: string;
  totalMonthlyExpenses: string;
  householdIncome: string;
  altContactName: string;
  altContactNo: string;
  contactNumber: string;
  emailAddress: string;
  bankName: string;
  branchName: string;
  branchCode: string;
  accountHolderName: string;
  accountNumber: string;
  accountType: string;
  debitOrderMaxAmount: string;
  debitOrderDate: string;
  hasChangeOfOwnership: boolean;
  cooNumbers: string;
  cooDate: string;
  cooInitialsSurname: string;
  cooIdNo: string;
  cooHomeNo: string;
  cooOfficeNo: string;
  cooMobileNo: string;
  cooAltMobileNo: string;
  cooEmail: string;
  cooPostalAddress: string;
  nameOnInvoice: string;
  invoiceCareOf: string;
  billingContactPerson: string;
  billingHomeNo: string;
  billingMobileNo: string;
  billingOfficeNo: string;
  billingAltMobileNo: string;
  billingEmail: string;
  billingFaxNo: string;
  invoiceDeliveryMethod: "Email" | "Post";
  streetAddress: string;
  suburb: string;
  townCity: string;
  province: string;
  postalCode: string;
  sameAsPhysicalPostal: boolean;
  poBoxBag: string;
  deliveryAddressSame: boolean;
  deliveryAddress: string;
  installationAddressSame: boolean;
  installationAddress: string;
  billingAddressSame: boolean;
  billingAddress: string;
  technology: string;
  productType: string;
  packageSelected: string;
  customPackageName?: string;
  customPackagePrice?: string;
  pabxOption?: string;
  pabxAmount?: string;
  broadbandTech: string;
  lineQuantity: string;
  requiredServiceDate: string;
  useExistingLine: "Y" | "N";
  existingServiceNumber: string;
  existingServiceProvider: string;
  preferredServiceProvider: string;
  dealId: string;
  dealDescription: string;
  vasRequired: string;
  contractPeriod: string;
  internetPlanRequired: string;
  selfInstall: "Y" | "N";
  deviceInsurance: "Y" | "N";
  insuranceBand: string;
  insuranceMonthlyPremium: string;
  voiceTech: string;
  voiceLineQuantity: string;
  voiceRequiredServiceDate: string;
  voiceUseExistingLine: "Y" | "N";
  voiceExistingServiceNumber: string;
  voiceExistingServiceProvider: string;
  voiceDealId: string;
  voiceDealDescription: string;
  voiceVasRequired: string;
  voiceContractPeriod: string;
  voiceDeviceAddon: string;
  mobileSpendLimit: string;
  voiceDeviceInsurance: "Y" | "N";
  itemisedBilling: "Y" | "N";
  corporateSelfPay: "Y" | "N";
  screenInsurance: "Y" | "N";
  portingList: PortingInfo[];
  requiresTermsCopy: "Y" | "N";
  termsDeliveryMode: "Printed" | "Emailed";
  ricaPersonName: string;
  ricaPersonId: string;
  ricaPersonPassportExpiry: string;
  ricaPersonAddress: string;
  additionalComments: string;
  technicianOrSalesAgent: string;
  isDirector: string;
  status?: string;
  agentLogged?: string;
  submittedAt?: string;
  calculatedPrice?: number;
  calculatedCommission?: number;
  docs?: Record<string, string | null>;
  attachments?: {
    idOrPassportDoc?: string;
    proofOfAddressDoc?: string;
    ckDoc?: string;
    bankStatementDoc?: string;
    directorProxyDoc?: string;
  };
}

const initialBusinessFormState: BusinessLeadData = {
  orderNo: "",
  accountNoAdmin: "",
  dealerName: "",
  dealerCode: "",
  agentName: "",
  agentIdSalaryNo: "",
  ricaInfo: "Customer representative as RICA agent",
  isExistingCustomer: "N",
  existingAccountNumber: "",
  businessType: "Pty (Ltd)",
  businessTypeOther: "",
  businessName: "",
  tradeName: "",
  companyRegOrIdNo: "",
  vatNo: "",
  industry: "",
  noOfEmployees: "",
  noOfBranches: "",
  directors: [
    { nameAndSurname: "", idNo: "", passportNo: "", passportExpiryDate: "", saCitizen: "Y", permitType: "" }
  ],
  title: "Mr",
  surname: "",
  firstNames: "",
  initials: "",
  gender: "",
  dateOfBirth: "",
  idOrPassport: "",
  passportExpiryDate: "",
  saCitizen: "Y",
  permitType: "",
  grossIncome: "",
  netIncome: "",
  totalMonthlyExpenses: "",
  householdIncome: "",
  altContactName: "",
  altContactNo: "",
  contactNumber: "",
  emailAddress: "",
  bankName: "",
  branchName: "",
  branchCode: "",
  accountHolderName: "",
  accountNumber: "",
  accountType: "Cheque",
  debitOrderMaxAmount: "",
  debitOrderDate: "5th",
  hasChangeOfOwnership: false,
  cooNumbers: "",
  cooDate: "",
  cooInitialsSurname: "",
  cooIdNo: "",
  cooHomeNo: "",
  cooOfficeNo: "",
  cooMobileNo: "",
  cooAltMobileNo: "",
  cooEmail: "",
  cooPostalAddress: "",
  nameOnInvoice: "",
  invoiceCareOf: "",
  billingContactPerson: "",
  billingHomeNo: "",
  billingMobileNo: "",
  billingOfficeNo: "",
  billingAltMobileNo: "",
  billingEmail: "",
  billingFaxNo: "",
  invoiceDeliveryMethod: "Email",
  streetAddress: "",
  suburb: "",
  townCity: "",
  province: "Free State",
  postalCode: "",
  sameAsPhysicalPostal: true,
  poBoxBag: "",
  deliveryAddressSame: true,
  deliveryAddress: "",
  installationAddressSame: true,
  installationAddress: "",
  billingAddressSame: true,
  billingAddress: "",
  technology: "",
  productType: TB_PRODUCT_TYPES.TB_FIBRE,
  packageSelected: "",
  customPackageName: "",
  customPackagePrice: "",
  pabxOption: "Outright Sale",
  pabxAmount: "",
  broadbandTech: "Fibre",
  lineQuantity: "1",
  requiredServiceDate: "",
  useExistingLine: "N",
  existingServiceNumber: "",
  existingServiceProvider: "",
  preferredServiceProvider: "Openserve",
  dealId: "",
  dealDescription: "",
  vasRequired: "",
  contractPeriod: "24",
  internetPlanRequired: "",
  selfInstall: "N",
  deviceInsurance: "N",
  insuranceBand: "",
  insuranceMonthlyPremium: "",
  voiceTech: "Fixed",
  voiceLineQuantity: "1",
  voiceRequiredServiceDate: "",
  voiceUseExistingLine: "N",
  voiceExistingServiceNumber: "",
  voiceExistingServiceProvider: "",
  voiceDealId: "",
  voiceDealDescription: "",
  voiceVasRequired: "",
  voiceContractPeriod: "24",
  voiceDeviceAddon: "",
  mobileSpendLimit: "500",
  voiceDeviceInsurance: "N",
  itemisedBilling: "N",
  corporateSelfPay: "N",
  screenInsurance: "N",
  portingList: [],
  requiresTermsCopy: "N",
  termsDeliveryMode: "Emailed",
  ricaPersonName: "",
  ricaPersonId: "",
  ricaPersonPassportExpiry: "",
  ricaPersonAddress: "",
  additionalComments: "",
  technicianOrSalesAgent: "",
  isDirector: "yes",
};

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    padding: "32px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
  },
  input: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
    },
  },
  sectionHeader: {
    color: "#1e293b",
    fontWeight: "bold",
    fontSize: "1.1rem",
    borderBottom: "2px solid #e2e8f0",
    paddingBottom: "8px",
    marginBottom: "16px",
    marginTop: "16px",
  },
  toggleBox: {
    backgroundColor: "#f8fafc",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "16px",
  },
  uploadBtn: {
    borderRadius: "10px",
    textTransform: "none",
    padding: "10px 16px",
    borderColor: "#cbd5e1",
    color: "#334155",
    "&:hover": {
      borderColor: "#94a3b8",
      backgroundColor: "#f8fafc",
    },
  },
  submitButton: {
    borderRadius: "12px",
    padding: "14px",
    fontWeight: "bold",
    fontSize: "1rem",
    textTransform: "none",
    backgroundColor: "#2563eb",
    "&:hover": {
      backgroundColor: "#1d4ed8",
    },
  },
  tableContainer: {
    borderRadius: "12px",
    boxShadow: "none",
    border: "1px solid #e2e8f0",
  },
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
    ckDoc: File | null;
    bankStatementDoc: File | null;
    directorProxyDoc: File | null;
  }>({ idOrPassportDoc: null, proofOfAddressDoc: null, ckDoc: null, bankStatementDoc: null, directorProxyDoc: null });

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

    const contractRef = ref(db, "contractFibreLeads");
    const unsubContract = onValue(contractRef, (snapshot) => {
      const data = snapshot.val();
      setContractLeads(data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })).reverse() : []);
    });

    const prepaidRef = ref(db, "fibreLeads");
    const unsubPrepaid = onValue(prepaidRef, (snapshot) => {
      const data = snapshot.val();
      setPrepaidLeads(data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })).reverse() : []);
    });

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
    if (businessFormData.packageSelected === "Other / Enter New Package") {
      price = parseFloat(businessFormData.customPackagePrice || "0") || 0;
      commission = 0;
    } else if (businessFormData.productType === TB_PRODUCT_TYPES.TB_FIBRE) {
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

  // Dynamic Handlers for Business Form Arrays
  const handleAddDirector = () => {
    setBusinessFormData({
      ...businessFormData,
      directors: [
        ...businessFormData.directors,
        { nameAndSurname: "", idNo: "", passportNo: "", passportExpiryDate: "", saCitizen: "Y", permitType: "" },
      ],
    });
  };

  const handleRemoveDirector = (index: number) => {
    const updated = [...businessFormData.directors];
    updated.splice(index, 1);
    setBusinessFormData({ ...businessFormData, directors: updated });
  };

  const handleDirectorChange = (index: number, field: keyof DirectorInfo, value: string) => {
    const updated = [...businessFormData.directors];
    updated[index] = { ...updated[index], [field]: value };
    setBusinessFormData({ ...businessFormData, directors: updated });
  };

  const handleAddPortingItem = () => {
    setBusinessFormData({
      ...businessFormData,
      portingList: [
        ...businessFormData.portingList,
        {
          accountClassification: "Postpaid",
          accountType: "Business",
          dsp: "",
          accountNo: "",
          accountName: "",
          mobileNumber: "",
          ricaPersonName: "",
          ricaPersonIdOrReg: "",
          requestedPortDate: "",
        },
      ],
    });
  };

  const handleRemovePortingItem = (index: number) => {
    const updated = [...businessFormData.portingList];
    updated.splice(index, 1);
    setBusinessFormData({ ...businessFormData, portingList: updated });
  };

  const handlePortingChange = (index: number, field: keyof PortingInfo, value: string) => {
    const updated = [...businessFormData.portingList];
    updated[index] = { ...updated[index], [field]: value };
    setBusinessFormData({ ...businessFormData, portingList: updated });
  };

  // Helper to convert File to Base64 data string
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Helper to trigger direct download from Base64
  const downloadBase64File = (base64Data?: string | null, fileName?: string | null) => {
    if (!base64Data) {
      alert("Couldn't download - No file found or uploaded for this document.");
      return;
    }
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = fileName || "downloaded_document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Form Submissions
  const handleContractSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentAgent = activeAgentName || contractFormData.technicianOrSalesAgent;
    if (!currentAgent) return alert("Please enter the Sales Agent name.");

    if (submissionMode === "upload" && !editingId) {
      if (!contractFiles.contractDoc) return alert("Please upload the Contract Doc.");
      if (!contractFiles.idCopyDoc) return alert("Please upload an ID Copy.");
    }

    const finalPackageName = contractFormData.packageSelected === "Other / Enter New Package"
      ? contractFormData.customPackageName
      : contractFormData.packageSelected;

    try {
      // Base64 document mapping
      const docs: Record<string, string | null> = {};
      if (contractFiles.contractDoc) docs.contractDoc = await convertFileToBase64(contractFiles.contractDoc);
      if (contractFiles.idCopyDoc) docs.idCopyDoc = await convertFileToBase64(contractFiles.idCopyDoc);
      if (contractFiles.bankStatementDoc) docs.bankStatementDoc = await convertFileToBase64(contractFiles.bankStatementDoc);
      if (contractFiles.proofOfAddressDoc) docs.proofOfAddressDoc = await convertFileToBase64(contractFiles.proofOfAddressDoc);

      if (editingId) {
        await update(ref(db, `contractFibreLeads/${editingId}`), {
          ...contractFormData,
          packageSelected: finalPackageName,
          technicianOrSalesAgent: currentAgent,
          agentLogged: currentAgent,
          submissionMode,
          updatedAt: new Date().toISOString(),
          ...(Object.keys(docs).length > 0 && { docs }),
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
          packageSelected: finalPackageName,
          submissionMode,
          status: submissionMode === "upload" ? "Pending Vetting" : "Pending",
          technicianOrSalesAgent: currentAgent,
          agentLogged: currentAgent,
          submittedAt: new Date().toISOString(),
          docs,
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

    const finalPackageName = prepaidFormData.packageSelected === "Other / Enter New Package"
      ? prepaidFormData.customPackageName
      : prepaidFormData.packageSelected;

    try {
      const docs: Record<string, string | null> = {};
      if (prepaidIdDoc) docs.idOrPassportDoc = await convertFileToBase64(prepaidIdDoc);

      if (editingId) {
        await update(ref(db, `fibreLeads/${editingId}`), {
          ...prepaidFormData,
          packageSelected: finalPackageName,
          updatedAt: new Date().toISOString(),
          ...(prepaidIdDoc && { docs }),
        });
        alert("Prepaid Application updated successfully!");
        setEditingId(null);
      } else {
        const payload = {
          ...prepaidFormData,
          packageSelected: finalPackageName,
          status: "Pending",
          agentLogged: activeAgentName || prepaidFormData.technicianOrSalesAgent || "System Agent",
          submittedAt: new Date().toISOString(),
          docs,
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
      return alert("Proxy doc from directors is required since applicant is not a director.");
    }

    const finalPackageName = businessFormData.packageSelected === "Other / Enter New Package"
      ? businessFormData.customPackageName
      : businessFormData.packageSelected;

    try {
      const payloadData = {
        ...businessFormData,
        packageSelected: finalPackageName,
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
        const docs: Record<string, string | null> = {};
        if (businessFiles.idOrPassportDoc) docs.idOrPassportDoc = await convertFileToBase64(businessFiles.idOrPassportDoc);
        if (businessFiles.proofOfAddressDoc) docs.proofOfAddressDoc = await convertFileToBase64(businessFiles.proofOfAddressDoc);
        if (businessFiles.ckDoc) docs.ckDoc = await convertFileToBase64(businessFiles.ckDoc);
        if (businessFiles.bankStatementDoc) docs.bankStatementDoc = await convertFileToBase64(businessFiles.bankStatementDoc);
        if (businessFiles.directorProxyDoc) docs.directorProxyDoc = await convertFileToBase64(businessFiles.directorProxyDoc);

        const payload = {
          ...payloadData,
          status: "Pending",
          agentLogged: activeAgentName || businessFormData.technicianOrSalesAgent || "System Agent",
          submittedAt: new Date().toISOString(),
          docs,
          attachments: {
            idOrPassportDoc: businessFiles.idOrPassportDoc ? businessFiles.idOrPassportDoc.name : null,
            proofOfAddressDoc: businessFiles.proofOfAddressDoc ? businessFiles.proofOfAddressDoc.name : null,
            ckDoc: businessFiles.ckDoc ? businessFiles.ckDoc.name : null,
            bankStatementDoc: businessFiles.bankStatementDoc ? businessFiles.bankStatementDoc.name : null,
            directorProxyDoc: businessFiles.directorProxyDoc ? businessFiles.directorProxyDoc.name : null,
          },
        };

        await set(push(ref(db, "tbFibreLeads")), payload);
        alert("Telkom Business Application successfully submitted!");
      }
      setBusinessFormData(initialBusinessFormState);
      setBusinessFiles({ idOrPassportDoc: null, proofOfAddressDoc: null, ckDoc: null, bankStatementDoc: null, directorProxyDoc: null });
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
    return `${leadToDelete.firstNames || leadToDelete.businessName || ""} ${leadToDelete.surname || ""}`.trim();
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
                  <FormControlLabel value="upload" control={<Radio color="primary" />} label="Upload Docs Direct" />
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
                        setContractFormData({
                          ...contractFormData,
                          packageSelected: pkgName,
                          packagePrice: matched ? matched.price : "",
                          commissionAmount: matched ? matched.commission : "",
                        });
                      }} sx={styles.input}>
                        {(CONTRACT_PACKAGE_CATALOG[contractFormData.productCategory] || []).map((pkg) => (
                          <MenuItem key={pkg.label} value={pkg.label}>{pkg.label}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {/* CUSTOM PACKAGE & PRICE INPUTS */}
                    {contractFormData.packageSelected === "Other / Enter New Package" && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <TextField required fullWidth label="Enter Custom Package Name" value={contractFormData.customPackageName} onChange={(e) => setContractFormData({ ...contractFormData, customPackageName: e.target.value })} sx={styles.input} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField required fullWidth label="Enter Package Price (e.g. R450 pm)" value={contractFormData.packagePrice} onChange={(e) => setContractFormData({ ...contractFormData, packagePrice: e.target.value })} sx={styles.input} />
                        </Grid>
                      </>
                    )}

                    {contractFormData.packageSelected && contractFormData.packageSelected !== "Other / Enter New Package" && (
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
                        Required Doc Uploads
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button variant="outlined" component="label" fullWidth startIcon={<UploadFile />} sx={styles.uploadBtn}>
                        Upload Contract Doc {submissionMode === "upload" && "*"}
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
                {/* TECHNOLOGY SECTION */}
                <Grid item xs={12}>
                  
                </Grid>

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

                {/* CUSTOM PACKAGE & PRICE INPUTS */}
                {prepaidFormData.packageSelected === "Other / Enter New Package" && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField required fullWidth label="Enter Custom Package Name" value={prepaidFormData.customPackageName} onChange={(e) => setPrepaidFormData({ ...prepaidFormData, customPackageName: e.target.value })} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField required fullWidth label="Enter Package Price (e.g. R399.00)" value={prepaidFormData.packagePrice} onChange={(e) => setPrepaidFormData({ ...prepaidFormData, packagePrice: e.target.value })} sx={styles.input} />
                    </Grid>
                  </>
                )}

                {prepaidFormData.packageSelected && prepaidFormData.packageSelected !== "Other / Enter New Package" && (
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
  <Button
    variant="outlined"
    component="label"
    fullWidth
    startIcon={<UploadFile />}
    sx={styles.uploadBtn}
  >
    Upload ID Copy or Passport * (Compulsory)
    <input
      type="file"
      hidden
      onChange={(e) => e.target.files?.[0] && setPrepaidIdDoc(e.target.files[0])}
    />
  </Button>

  {prepaidIdDoc && (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
      <Typography variant="caption" sx={{ color: "#059669" }}>
        Selected: {typeof prepaidIdDoc === "string" ? "Uploaded Document" : prepaidIdDoc.name}
      </Typography>

      <Button
        size="small"
        startIcon={<Download />}
        onClick={() => {
          // Check if prepaidIdDoc is a File object or a Base64/URL string
          const url = typeof prepaidIdDoc === "string" 
            ? prepaidIdDoc 
            : URL.createObjectURL(prepaidIdDoc);

          const link = document.createElement("a");
          link.href = url;
          link.download = typeof prepaidIdDoc === "string" ? "ID_Copy" : prepaidIdDoc.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Clean up ObjectURL memory allocation if it's a File
          if (typeof prepaidIdDoc !== "string") {
            URL.revokeObjectURL(url);
          }
        }}
      >
        Download
      </Button>
    </Box>
  )}
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
              {editingId ? "Edit Telkom Business Application" : "Telkom Business Application Form"}
            </Typography>

            <Typography textAlign="center" sx={{ color: "#475569", mb: 1, fontSize: 14 }}>
              Complete the business pre-vetting form | Official Telkom Business Application
            </Typography>

            <Typography textAlign="center" sx={{ color: "#334155", mb: 3, fontSize: 13, fontWeight: "bold" }}>
              Office: 051 401 6514 / 6816 | Email: <span style={{ color: "#2563eb" }}>pitsok@telkom.co.za</span>
            </Typography>

            <form onSubmit={handleBusinessSubmit}>
              <Grid container spacing={2}>
                {/* TECHNOLOGY SECTION */}
                <Grid item xs={12}>
                  
                </Grid>

                {/* --- SALES CONSULTANT TO COMPLETE --- */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={styles.sectionHeader}>
                    Sales Consultant / Admin Details
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Order No." value={businessFormData.orderNo} onChange={(e) => setBusinessFormData({ ...businessFormData, orderNo: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Account No." value={businessFormData.accountNoAdmin} onChange={(e) => setBusinessFormData({ ...businessFormData, accountNoAdmin: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Dealer Name" value={businessFormData.dealerName} onChange={(e) => setBusinessFormData({ ...businessFormData, dealerName: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Dealer Code" value={businessFormData.dealerCode} onChange={(e) => setBusinessFormData({ ...businessFormData, dealerCode: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Agent Name" value={activeAgentName || businessFormData.agentName} onChange={(e) => setBusinessFormData({ ...businessFormData, agentName: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Agent ID / Salary No." value={businessFormData.agentIdSalaryNo} onChange={(e) => setBusinessFormData({ ...businessFormData, agentIdSalaryNo: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12}>
                  <TextField select fullWidth label="RICA Information Method" value={businessFormData.ricaInfo} onChange={(e) => setBusinessFormData({ ...businessFormData, ricaInfo: e.target.value })} sx={styles.input}>
                    {["Customer representative as RICA agent", "RICA by sales agent", "RICA on delivery"].map((r) => (
                      <MenuItem key={r} value={r}>{r}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* --- SECTION 1: BUSINESS DETAILS --- */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={styles.sectionHeader}>
                    1. Business Details
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl component="fieldset">
                    <FormLabel sx={{ color: "#475569" }}>Are you an existing customer?</FormLabel>
                    <RadioGroup row value={businessFormData.isExistingCustomer} onChange={(e) => setBusinessFormData({ ...businessFormData, isExistingCustomer: e.target.value as "Y" | "N" })}>
                      <FormControlLabel value="Y" control={<Radio color="primary" />} label="Yes" />
                      <FormControlLabel value="N" control={<Radio color="primary" />} label="No" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                {businessFormData.isExistingCustomer === "Y" && (
                  <Grid item xs={12} sm={6}>
                    <TextField required fullWidth label="Existing Account / Number" value={businessFormData.existingAccountNumber} onChange={(e) => setBusinessFormData({ ...businessFormData, existingAccountNumber: e.target.value })} sx={styles.input} />
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <TextField select required fullWidth label="Business Type" value={businessFormData.businessType} onChange={(e) => setBusinessFormData({ ...businessFormData, businessType: e.target.value })} sx={styles.input}>
                    {["Pty (Ltd)", "CC", "Partnership", "Ltd Public co.", "Sole proprietor", "Government", "Other"].map((bt) => (
                      <MenuItem key={bt} value={bt}>{bt}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                {businessFormData.businessType === "Other" && (
                  <Grid item xs={12} sm={6}>
                    <TextField required fullWidth label="Please specify Business Type" value={businessFormData.businessTypeOther} onChange={(e) => setBusinessFormData({ ...businessFormData, businessTypeOther: e.target.value })} sx={styles.input} />
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <TextField required fullWidth label="Business Name" value={businessFormData.businessName} onChange={(e) => setBusinessFormData({ ...businessFormData, businessName: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Trade Name" value={businessFormData.tradeName} onChange={(e) => setBusinessFormData({ ...businessFormData, tradeName: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField required fullWidth label="Company Registration / ID / Passport No." value={businessFormData.companyRegOrIdNo} onChange={(e) => setBusinessFormData({ ...businessFormData, companyRegOrIdNo: e.target.value })} sx={styles.input} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="VAT No." value={businessFormData.vatNo} onChange={(e) => setBusinessFormData({ ...businessFormData, vatNo: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Industry *" value={businessFormData.industry} onChange={(e) => setBusinessFormData({ ...businessFormData, industry: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="No. of Employees *" value={businessFormData.noOfEmployees} onChange={(e) => setBusinessFormData({ ...businessFormData, noOfEmployees: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="No. of Branches *" value={businessFormData.noOfBranches} onChange={(e) => setBusinessFormData({ ...businessFormData, noOfBranches: e.target.value })} sx={styles.input} />
                </Grid>

                {/* --- SECTION 2: DIRECTORS / MEMBERS --- */}
                <Grid item xs={12} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="subtitle1" sx={styles.sectionHeader}>
                    2. Directors / Members Details
                  </Typography>
                  <Button size="small" startIcon={<Add />} onClick={handleAddDirector} sx={{ color: "#2563eb", textTransform: "none" }}>Add Director</Button>
                </Grid>
                {businessFormData.directors.map((dir, idx) => (
                  <Grid container item spacing={2} key={idx} sx={{ background: "#f8fafc", p: 2, borderRadius: "10px", mb: 1, ml: 0 }}>
                    <Grid item xs={12} sm={4}>
                      <TextField fullWidth label={`Director ${idx + 1} Name & Surname`} value={dir.nameAndSurname} onChange={(e) => handleDirectorChange(idx, "nameAndSurname", e.target.value)} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField fullWidth label="ID No." value={dir.idNo} onChange={(e) => handleDirectorChange(idx, "idNo", e.target.value)} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField fullWidth label="Passport No." value={dir.passportNo} onChange={(e) => handleDirectorChange(idx, "passportNo", e.target.value)} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField fullWidth type="date" InputLabelProps={{ shrink: true }} label="Passport Expiry Date" value={dir.passportExpiryDate} onChange={(e) => handleDirectorChange(idx, "passportExpiryDate", e.target.value)} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField select fullWidth label="SA Citizen?" value={dir.saCitizen} onChange={(e) => handleDirectorChange(idx, "saCitizen", e.target.value as "Y" | "N")} sx={styles.input}>
                        <MenuItem value="Y">Yes</MenuItem>
                        <MenuItem value="N">No</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField fullWidth label="Permit/Visa Type" value={dir.permitType} onChange={(e) => handleDirectorChange(idx, "permitType", e.target.value)} sx={styles.input} />
                    </Grid>
                    {businessFormData.directors.length > 1 && (
                      <Grid item xs={12} sm={1} display="flex" alignItems="center">
                        <IconButton color="error" onClick={() => handleRemoveDirector(idx)}><Delete /></IconButton>
                      </Grid>
                    )}
                  </Grid>
                ))}

                {/* --- SECTION 3: APPLICANT'S DETAILS --- */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={styles.sectionHeader}>
                    3. Applicant's Details
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField select required fullWidth label="Title" value={businessFormData.title} onChange={(e) => setBusinessFormData({ ...businessFormData, title: e.target.value })} sx={styles.input}>
                    {["Mr", "Mrs", "Miss", "MS", "Dr", "PS", "Prof"].map((t) => (
                      <MenuItem key={t} value={t}>{t}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField required fullWidth label="Name" value={businessFormData.firstNames} onChange={(e) => setBusinessFormData({ ...businessFormData, firstNames: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField required fullWidth label="Surname" value={businessFormData.surname} onChange={(e) => setBusinessFormData({ ...businessFormData, surname: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField fullWidth label="Initials" value={businessFormData.initials} onChange={(e) => setBusinessFormData({ ...businessFormData, initials: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField select fullWidth label="Gender" value={businessFormData.gender} onChange={(e) => setBusinessFormData({ ...businessFormData, gender: e.target.value })} sx={styles.input}>
                    {["Male", "Female", "Other"].map((g) => (
                      <MenuItem key={g} value={g}>{g}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField type="date" InputLabelProps={{ shrink: true }} fullWidth label="Date of Birth" value={businessFormData.dateOfBirth} onChange={(e) => setBusinessFormData({ ...businessFormData, dateOfBirth: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField required fullWidth label="ID Number / Passport" value={businessFormData.idOrPassport} onChange={(e) => setBusinessFormData({ ...businessFormData, idOrPassport: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField type="date" InputLabelProps={{ shrink: true }} fullWidth label="Passport Expiry Date" value={businessFormData.passportExpiryDate} onChange={(e) => setBusinessFormData({ ...businessFormData, passportExpiryDate: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField select fullWidth label="SA Citizen?" value={businessFormData.saCitizen} onChange={(e) => setBusinessFormData({ ...businessFormData, saCitizen: e.target.value as "Y" | "N" })} sx={styles.input}>
                    <MenuItem value="Y">Yes</MenuItem>
                    <MenuItem value="N">No</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label="Type of Permit / Visa" value={businessFormData.permitType} onChange={(e) => setBusinessFormData({ ...businessFormData, permitType: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField required fullWidth label="Contact Number" value={businessFormData.contactNumber} onChange={(e) => setBusinessFormData({ ...businessFormData, contactNumber: e.target.value })} sx={styles.input} />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField required fullWidth label="Email Address" type="email" value={businessFormData.emailAddress} onChange={(e) => setBusinessFormData({ ...businessFormData, emailAddress: e.target.value })} sx={styles.input} />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label="Gross Income p/m *" value={businessFormData.grossIncome} onChange={(e) => setBusinessFormData({ ...businessFormData, grossIncome: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label="Net Income p/m *" value={businessFormData.netIncome} onChange={(e) => setBusinessFormData({ ...businessFormData, netIncome: e.target.value })} sx={styles.input} />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label="Total Expenses p/m *" value={businessFormData.totalMonthlyExpenses} onChange={(e) => setBusinessFormData({ ...businessFormData, totalMonthlyExpenses: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label="Household Income p/m *" value={businessFormData.householdIncome} onChange={(e) => setBusinessFormData({ ...businessFormData, householdIncome: e.target.value })} sx={styles.input} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Alt Contact Person: Name & Surname" value={businessFormData.altContactName} onChange={(e) => setBusinessFormData({ ...businessFormData, altContactName: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Alt Contact Person: Contact No." value={businessFormData.altContactNo} onChange={(e) => setBusinessFormData({ ...businessFormData, altContactNo: e.target.value })} sx={styles.input} />
                </Grid>

                {/* --- SECTION 4: PAYMENT DETAILS --- */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={styles.sectionHeader}>
                    4. Payment Details (Debit Order Compulsory)
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField required fullWidth label="Bank Name" value={businessFormData.bankName} onChange={(e) => setBusinessFormData({ ...businessFormData, bankName: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Branch Name" value={businessFormData.branchName} onChange={(e) => setBusinessFormData({ ...businessFormData, branchName: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Branch Code" value={businessFormData.branchCode} onChange={(e) => setBusinessFormData({ ...businessFormData, branchCode: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField required fullWidth label="Account Holder Name" value={businessFormData.accountHolderName} onChange={(e) => setBusinessFormData({ ...businessFormData, accountHolderName: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField required fullWidth label="Account Number" value={businessFormData.accountNumber} onChange={(e) => setBusinessFormData({ ...businessFormData, accountNumber: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField select required fullWidth label="Type of Account" value={businessFormData.accountType} onChange={(e) => setBusinessFormData({ ...businessFormData, accountType: e.target.value })} sx={styles.input}>
                    {["Cheque", "Transmission", "Savings"].map((t) => (
                      <MenuItem key={t} value={t}>{t}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Debit Order Maximum Amount * (2.5x monthly fee)" value={businessFormData.debitOrderMaxAmount} onChange={(e) => setBusinessFormData({ ...businessFormData, debitOrderMaxAmount: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField select required fullWidth label="Debit Dates" value={businessFormData.debitOrderDate} onChange={(e) => setBusinessFormData({ ...businessFormData, debitOrderDate: e.target.value })} sx={styles.input}>
                    {["5th", "15th", "20th", "25th", "Last day of the month"].map((d) => (
                      <MenuItem key={d} value={d}>{d}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* --- SECTION 5: CHANGE OF OWNERSHIP --- */}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Checkbox checked={businessFormData.hasChangeOfOwnership} onChange={(e) => setBusinessFormData({ ...businessFormData, hasChangeOfOwnership: e.target.checked })} />}
                    label={<Typography variant="subtitle1" sx={styles.sectionHeader}>5. Change of Ownership (Existing Owner's Details)</Typography>}
                  />
                </Grid>
                {businessFormData.hasChangeOfOwnership && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Number(s) to be changed" value={businessFormData.cooNumbers} onChange={(e) => setBusinessFormData({ ...businessFormData, cooNumbers: e.target.value })} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField type="date" InputLabelProps={{ shrink: true }} fullWidth label="Change of Ownership Date" value={businessFormData.cooDate} onChange={(e) => setBusinessFormData({ ...businessFormData, cooDate: e.target.value })} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Initials and Surname" value={businessFormData.cooInitialsSurname} onChange={(e) => setBusinessFormData({ ...businessFormData, cooInitialsSurname: e.target.value })} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="ID No." value={businessFormData.cooIdNo} onChange={(e) => setBusinessFormData({ ...businessFormData, cooIdNo: e.target.value })} sx={styles.input} />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <TextField fullWidth label="Home No." value={businessFormData.cooHomeNo} onChange={(e) => setBusinessFormData({ ...businessFormData, cooHomeNo: e.target.value })} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField fullWidth label="Office No." value={businessFormData.cooOfficeNo} onChange={(e) => setBusinessFormData({ ...businessFormData, cooOfficeNo: e.target.value })} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField fullWidth label="Mobile No." value={businessFormData.cooMobileNo} onChange={(e) => setBusinessFormData({ ...businessFormData, cooMobileNo: e.target.value })} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField fullWidth label="Alternate Mobile No." value={businessFormData.cooAltMobileNo} onChange={(e) => setBusinessFormData({ ...businessFormData, cooAltMobileNo: e.target.value })} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Email Address" value={businessFormData.cooEmail} onChange={(e) => setBusinessFormData({ ...businessFormData, cooEmail: e.target.value })} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Postal Address" value={businessFormData.cooPostalAddress} onChange={(e) => setBusinessFormData({ ...businessFormData, cooPostalAddress: e.target.value })} sx={styles.input} />
                    </Grid>
                  </>
                )}

                {/* --- SECTION 6: BILLING AND CONTACT INFORMATION --- */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={styles.sectionHeader}>
                    6. Billing and Contact Information
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Name on Invoice" value={businessFormData.nameOnInvoice} onChange={(e) => setBusinessFormData({ ...businessFormData, nameOnInvoice: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Invoice Care of" value={businessFormData.invoiceCareOf} onChange={(e) => setBusinessFormData({ ...businessFormData, invoiceCareOf: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Contact Person's Name & Surname" value={businessFormData.billingContactPerson} onChange={(e) => setBusinessFormData({ ...businessFormData, billingContactPerson: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label="Mobile No." value={businessFormData.billingMobileNo} onChange={(e) => setBusinessFormData({ ...businessFormData, billingMobileNo: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label="Office No." value={businessFormData.billingOfficeNo} onChange={(e) => setBusinessFormData({ ...businessFormData, billingOfficeNo: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email Address *" type="email" value={businessFormData.billingEmail} onChange={(e) => setBusinessFormData({ ...businessFormData, billingEmail: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth label="How do you want to receive your invoice?" value={businessFormData.invoiceDeliveryMethod} onChange={(e) => setBusinessFormData({ ...businessFormData, invoiceDeliveryMethod: e.target.value as "Email" | "Post" })} sx={styles.input}>
                    <MenuItem value="Email">Email (Compulsory for broadband)</MenuItem>
                    <MenuItem value="Post">Post (Additional charges apply)</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" fontWeight="bold" sx={{ color: "#334155" }}>Physical Address</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField required fullWidth label="Unit/Stand/Street Name & No." value={businessFormData.streetAddress} onChange={(e) => setBusinessFormData({ ...businessFormData, streetAddress: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField required fullWidth label="Suburb" value={businessFormData.suburb} onChange={(e) => setBusinessFormData({ ...businessFormData, suburb: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField required fullWidth label="City / Town" value={businessFormData.townCity} onChange={(e) => setBusinessFormData({ ...businessFormData, townCity: e.target.value })} sx={styles.input} />
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
                  <FormControlLabel
                    control={<Checkbox checked={businessFormData.installationAddressSame} onChange={(e) => setBusinessFormData({ ...businessFormData, installationAddressSame: e.target.checked })} />}
                    label="Installation Address same as physical address"
                  />
                </Grid>
                {!businessFormData.installationAddressSame && (
                  <Grid item xs={12}>
                    <TextField fullWidth label="Installation Address Details" value={businessFormData.installationAddress} onChange={(e) => setBusinessFormData({ ...businessFormData, installationAddress: e.target.value })} sx={styles.input} />
                  </Grid>
                )}

                {/* --- SECTION 7: SERVICES REQUIRED --- */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={styles.sectionHeader}>
                    7. Your Order / Services Required
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
                        <MenuItem key={pkg.name} value={pkg.name}>
                          {pkg.name === "Other / Enter New Package" ? pkg.name : `${pkg.name} — R${pkg.price}/pm`}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                )}

                {/* CUSTOM PACKAGE & PRICE INPUTS */}
                {businessFormData.packageSelected === "Other / Enter New Package" && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField required fullWidth label="Enter Custom Package Name" value={businessFormData.customPackageName} onChange={(e) => setBusinessFormData({ ...businessFormData, customPackageName: e.target.value })} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField required fullWidth type="number" label="Enter Custom Price (R)" value={businessFormData.customPackagePrice} onChange={(e) => setBusinessFormData({ ...businessFormData, customPackagePrice: e.target.value })} sx={styles.input} />
                    </Grid>
                  </>
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

                {/* 7A Broadband Details */}
                {businessFormData.productType === TB_PRODUCT_TYPES.TB_FIBRE && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: "#2563eb", mt: 1 }}>7A. Broadband Specifications</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField select fullWidth label="Technology Type" value={businessFormData.broadbandTech} onChange={(e) => setBusinessFormData({ ...businessFormData, broadbandTech: e.target.value })} sx={styles.input}>
                        {["DSL", "Fibre", "LTE"].map((t) => (
                          <MenuItem key={t} value={t}>{t}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField fullWidth label="Lines Required" value={businessFormData.lineQuantity} onChange={(e) => setBusinessFormData({ ...businessFormData, lineQuantity: e.target.value })} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField type="date" InputLabelProps={{ shrink: true }} fullWidth label="Required Service Date" value={businessFormData.requiredServiceDate} onChange={(e) => setBusinessFormData({ ...businessFormData, requiredServiceDate: e.target.value })} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField select fullWidth label="Preferred Provider" value={businessFormData.preferredServiceProvider} onChange={(e) => setBusinessFormData({ ...businessFormData, preferredServiceProvider: e.target.value })} sx={styles.input}>
                        {["Openserve", "3rd party"].map((p) => (
                          <MenuItem key={p} value={p}>{p}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField select fullWidth label="Contract Period" value={businessFormData.contractPeriod} onChange={(e) => setBusinessFormData({ ...businessFormData, contractPeriod: e.target.value })} sx={styles.input}>
                        {["MtM", "12", "24"].map((cp) => (
                          <MenuItem key={cp} value={cp}>{cp} Months</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField select fullWidth label="Self Install?" value={businessFormData.selfInstall} onChange={(e) => setBusinessFormData({ ...businessFormData, selfInstall: e.target.value as "Y" | "N" })} sx={styles.input}>
                        <MenuItem value="Y">Yes</MenuItem>
                        <MenuItem value="N">No</MenuItem>
                      </TextField>
                    </Grid>
                  </>
                )}

                {/* 7C Porting Numbers */}
                <Grid item xs={12} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                  <Typography variant="body2" fontWeight="bold" sx={{ color: "#2563eb" }}>7C. Mobile Numbers to be Ported to Telkom</Typography>
                  <Button size="small" startIcon={<Add />} onClick={handleAddPortingItem} sx={{ color: "#2563eb", textTransform: "none" }}>Add Port Number</Button>
                </Grid>
                {businessFormData.portingList.map((port, pIdx) => (
                  <Grid container item spacing={2} key={pIdx} sx={{ background: "#f8fafc", p: 2, borderRadius: "10px", mb: 1, ml: 0 }}>
                    <Grid item xs={12} sm={3}>
                      <TextField fullWidth label="Mobile Number" value={port.mobileNumber} onChange={(e) => handlePortingChange(pIdx, "mobileNumber", e.target.value)} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField fullWidth label="DSP (Donor Provider)" value={port.dsp} onChange={(e) => handlePortingChange(pIdx, "dsp", e.target.value)} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField fullWidth label="DSP Account No." value={port.accountNo} onChange={(e) => handlePortingChange(pIdx, "accountNo", e.target.value)} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField fullWidth label="RICA Person Name" value={port.ricaPersonName} onChange={(e) => handlePortingChange(pIdx, "ricaPersonName", e.target.value)} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={11}>
                      <TextField type="date" InputLabelProps={{ shrink: true }} fullWidth label="Requested Port Date" value={port.requestedPortDate} onChange={(e) => handlePortingChange(pIdx, "requestedPortDate", e.target.value)} sx={styles.input} />
                    </Grid>
                    <Grid item xs={12} sm={1} display="flex" alignItems="center">
                      <IconButton color="error" onClick={() => handleRemovePortingItem(pIdx)}><Delete /></IconButton>
                    </Grid>
                  </Grid>
                ))}

                {/* Financial Summary Box */}
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

                {/* --- SECTION 8 & 9: RICA & AGREEMENT --- */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={styles.sectionHeader}>
                    8 & 9. Terms, Agreement & RICA Info
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="RICA Person Name & Surname" value={businessFormData.ricaPersonName} onChange={(e) => setBusinessFormData({ ...businessFormData, ricaPersonName: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="RICA Person ID / Passport No." value={businessFormData.ricaPersonId} onChange={(e) => setBusinessFormData({ ...businessFormData, ricaPersonId: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="RICA Physical Address" value={businessFormData.ricaPersonAddress} onChange={(e) => setBusinessFormData({ ...businessFormData, ricaPersonAddress: e.target.value })} sx={styles.input} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth label="Require copy of Terms & Conditions?" value={businessFormData.requiresTermsCopy} onChange={(e) => setBusinessFormData({ ...businessFormData, requiresTermsCopy: e.target.value as "Y" | "N" })} sx={styles.input}>
                    <MenuItem value="Y">Yes</MenuItem>
                    <MenuItem value="N">No</MenuItem>
                  </TextField>
                </Grid>
                {businessFormData.requiresTermsCopy === "Y" && (
                  <Grid item xs={12} sm={6}>
                    <TextField select fullWidth label="Delivery Mode" value={businessFormData.termsDeliveryMode} onChange={(e) => setBusinessFormData({ ...businessFormData, termsDeliveryMode: e.target.value as "Printed" | "Emailed" })} sx={styles.input}>
                      <MenuItem value="Emailed">Emailed</MenuItem>
                      <MenuItem value="Printed">Printed</MenuItem>
                    </TextField>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={2} label="Additional Comments" value={businessFormData.additionalComments} onChange={(e) => setBusinessFormData({ ...businessFormData, additionalComments: e.target.value })} sx={styles.input} />
                </Grid>

                {!editingId && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2, borderColor: "rgba(0,0,0,0.12)" }} />
                      <Typography variant="h6" sx={{ color: "#000000", fontWeight: "bold", mb: 1 }}>
                        Required Attachments & Docs
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

                    <Grid item xs={12} sm={6}>
                      <Button variant="outlined" component="label" fullWidth startIcon={<UploadFile />} sx={styles.uploadBtn}>
                        Upload ID Copy or Passport *
                        <input type="file" hidden onChange={(e) => e.target.files?.[0] && setBusinessFiles({ ...businessFiles, idOrPassportDoc: e.target.files[0] })} />
                      </Button>
                      {businessFiles.idOrPassportDoc && <Typography variant="caption" sx={{ color: "#059669", display: "block", mt: 0.5 }}>Selected: {businessFiles.idOrPassportDoc.name}</Typography>}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Button variant="outlined" component="label" fullWidth startIcon={<UploadFile />} sx={styles.uploadBtn}>
                        Upload Proof of Address
                        <input type="file" hidden onChange={(e) => e.target.files?.[0] && setBusinessFiles({ ...businessFiles, proofOfAddressDoc: e.target.files[0] })} />
                      </Button>
                      {businessFiles.proofOfAddressDoc && <Typography variant="caption" sx={{ color: "#059669", display: "block", mt: 0.5 }}>Selected: {businessFiles.proofOfAddressDoc.name}</Typography>}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Button variant="outlined" component="label" fullWidth startIcon={<UploadFile />} sx={styles.uploadBtn}>
                        Upload CK Doc
                        <input type="file" hidden onChange={(e) => e.target.files?.[0] && setBusinessFiles({ ...businessFiles, ckDoc: e.target.files[0] })} />
                      </Button>
                      {businessFiles.ckDoc && <Typography variant="caption" sx={{ color: "#059669", display: "block", mt: 0.5 }}>Selected: {businessFiles.ckDoc.name}</Typography>}
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
                          Upload Directors Proxy *
                          <input type="file" hidden onChange={(e) => e.target.files?.[0] && setBusinessFiles({ ...businessFiles, directorProxyDoc: e.target.files[0] })} />
                        </Button>
                        {businessFiles.directorProxyDoc && <Typography variant="caption" sx={{ color: "#059669", display: "block", mt: 0.5 }}>Selected: {businessFiles.directorProxyDoc.name}</Typography>}
                      </Grid>
                    )}
                  </>
                )}

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button type="submit" fullWidth variant="contained" startIcon={<Send />} sx={styles.submitButton}>
                    {editingId ? "Update Application Details" : "Submit Business Application"}
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
            }}
          >
            {showApplications ? "Hide Records List" : `View Submitted Records (${currentLeadsList.length})`}
          </Button>
        </Box>

        {showApplications && (
          <Box sx={{ mt: 4 }}>
            <TableContainer component={Paper} sx={styles.tableContainer}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Customer / Entity</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Technology / Package</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Agent</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Documents</TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentLeadsList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">No submissions found.</TableCell>
                    </TableRow>
                  ) : (
                    currentLeadsList.map((row: any) => {
                      const clientName = activeTab === "contract"
                        ? `${row.firstNames || ""} ${row.surname || ""}`
                        : activeTab === "prepaid"
                        ? `${row.firstNamesOrContactName || ""} ${row.surnameOrBusinessName || ""}`
                        : `${row.businessName || row.firstNames || ""} ${row.surname || ""}`;

                      const primaryDocName = row.contractDocName || row.idCopyDocName || row.attachments?.idOrPassportDoc || row.attachments?.ckDoc || "Document";
                      const base64Doc = row.docs?.contractDoc || row.docs?.idCopyDoc || row.docs?.idOrPassportDoc || row.docs?.ckDoc;

                      return (
                        <TableRow key={row.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">{clientName}</Typography>
                            <Typography variant="caption" color="textSecondary">{row.contactNumber || row.emailAddress}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.technology}</Typography>
                            <Typography variant="caption" color="textSecondary">{row.packageSelected}</Typography>
                          </TableCell>
                          <TableCell>{row.agentLogged || row.technicianOrSalesAgent || "-"}</TableCell>
                          <TableCell>
                            <Chip label={row.status || "Pending"} color={getStatusChipColor(row.status)} size="small" />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              startIcon={<Download />}
                              onClick={() => downloadBase64File(base64Doc, primaryDocName)}
                              sx={{ textTransform: "none" }}
                            >
                              {primaryDocName}
                            </Button>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton color="info" onClick={() => { setSelectedLeadDetails(row); setViewDetailsOpen(true); }}><Visibility /></IconButton>
                            <IconButton color="primary" onClick={() => handleEdit(row)}><Edit /></IconButton>
                            <IconButton color="error" onClick={() => handleDeleteClick(row)}><Delete /></IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* VIEW DETAILS DIALOG */}
        <Dialog open={viewDetailsOpen} onClose={() => setViewDetailsOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: "bold" }}>Lead Application Details</DialogTitle>
          <DialogContent dividers>
            {selectedLeadDetails && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="subtitle2" color="primary">Submission ID: {selectedLeadDetails.id}</Typography>
                <Typography><b>Status:</b> {selectedLeadDetails.status || "Pending"}</Typography>
                <Typography><b>Technology:</b> {selectedLeadDetails.technology}</Typography>
                <Typography><b>Package:</b> {selectedLeadDetails.packageSelected}</Typography>
                <Typography><b>Agent:</b> {selectedLeadDetails.agentLogged || selectedLeadDetails.technicianOrSalesAgent}</Typography>
                <Typography><b>Comments:</b> {selectedLeadDetails.additionalComments || "None"}</Typography>
                
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2">Stored Documents</Typography>
                {selectedLeadDetails.docs ? (
                  Object.keys(selectedLeadDetails.docs).map((docKey) => (
                    <Button
                      key={docKey}
                      variant="outlined"
                      size="small"
                      startIcon={<Download />}
                      onClick={() => downloadBase64File(selectedLeadDetails.docs[docKey], `${docKey}.pdf`)}
                      sx={{ textTransform: "none", alignSelf: "flex-start", my: 0.5 }}
                    >
                      Download {docKey}
                    </Button>
                  ))
                ) : (
                  <Typography variant="caption" color="textSecondary">No base64 file payloads attached.</Typography>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDetailsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* DELETE CONFIRMATION DIALOG */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Are you sure you want to delete this record? Please type <b>{getExpectedCustomerName()}</b> below to confirm.
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={confirmNameInput}
              onChange={(e) => setConfirmNameInput(e.target.value)}
              placeholder="Type customer name to confirm"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              color="error"
              variant="contained"
              disabled={confirmNameInput.trim().toLowerCase() !== getExpectedCustomerName().toLowerCase()}
              onClick={handleConfirmDelete}
            >
              Delete Record
            </Button>
          </DialogActions>
        </Dialog>

      </Paper>
    </Box>
  );
};

export default FieldUpdatesContract;