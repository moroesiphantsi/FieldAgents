import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Tooltip,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Divider,
  ChipProps,
  ButtonProps,
} from "@mui/material";

import {
  WhatsApp,
  Email,
  Delete,
  Search,
  Visibility,
  Download,
  FilterList,
  Paid,
  Send,
  Sms,
  History,
  ExpandMore,
  ExpandLess,
  Description
} from "@mui/icons-material";

import { ref, onValue, remove, update } from "firebase/database";
import { db } from "../firebase";

import StatsCards from "../components/StatsCards";
import ExportExcel from "../components/ExportExcel";
import LeadDetails from "./LeadDetails";

// Notification Target Type
type NotifyTarget = "both" | "client" | "agent";

// Custom Status Definitions & Professional Message Generator
const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color: ChipProps["color"];
    requiresReason?: boolean;
    notifyCustomer: boolean;
  }
> = {
  "Application received": { label: "Application received", color: "info", notifyCustomer: true },
  "in process": { label: "In Process", color: "warning", notifyCustomer: true },
  "Declined": { label: "Declined", color: "error", requiresReason: true, notifyCustomer: true },
  "Approved": { label: "Approved", color: "success", notifyCustomer: true },
  "Cancelled": { label: "Cancelled", color: "error", requiresReason: true, notifyCustomer: true },
  "Ready for installation": { label: "Ready for Installation", color: "secondary", notifyCustomer: true },
  "Completed": { label: "Completed", color: "success", notifyCustomer: true },
  "Signed up": { label: "Signed Up", color: "primary", notifyCustomer: false },
  "Contacted": { label: "Contacted", color: "default", notifyCustomer: false },
};

// Robust Helper to Resolve Document Download URLs
const resolveDocumentUrl = (lead: any): string | null => {
  if (!lead) return null;

  // Direct String URLs or Base64 String Fields
  if (typeof lead.idDocumentUrl === "string" && lead.idDocumentUrl.trim().length > 5) return lead.idDocumentUrl;
  if (typeof lead.idOrPassportDocUrl === "string" && lead.idOrPassportDocUrl.trim().length > 5) return lead.idOrPassportDocUrl;
  if (typeof lead.documentUrl === "string" && lead.documentUrl.trim().length > 5) return lead.documentUrl;
  if (typeof lead.proofOfAddressUrl === "string" && lead.proofOfAddressUrl.trim().length > 5) return lead.proofOfAddressUrl;

  // Nested Attachment Objects
  if (lead.attachments) {
    if (typeof lead.attachments === "string" && lead.attachments.trim().length > 5) return lead.attachments;
    if (lead.attachments.idOrPassportDocUrl) return lead.attachments.idOrPassportDocUrl;
    if (lead.attachments.idOrPassportDoc) return lead.attachments.idOrPassportDoc;
    if (lead.attachments.fileUrl) return lead.attachments.fileUrl;
    if (lead.attachments.url) return lead.attachments.url;
  }

  return null;
};

const getProfessionalMessage = (
  status: string,
  recipientName: string,
  isAgent: boolean = false,
  reason: string = "",
  extraComment: string = ""
) => {
  const cleanName = recipientName || (isAgent ? "Agent" : "Valued Customer");

  if (isAgent) {
    return `Hello ${cleanName},\n\nAn application assigned to you has been updated to status: ${status.toUpperCase()}.\n${reason ? `Reason: ${reason}\n` : ""}${extraComment ? `Comment: ${extraComment}\n` : ""}\nPlease review your portal.\n\nRegards,\nOperations Team`;
  }

  switch (status) {
    case "Application received":
      return `Dear ${cleanName},\n\nThank you for submitting your fibre application with us. We have successfully received your details and queued your application for initial processing.\n\nKind regards,\nFibre Admin Team`;

    case "in process":
      return `Dear ${cleanName},\n\nYour fibre application is currently IN PROCESS. Our technical team is actively verifying coverage and processing documentation.\n\nBest regards,\nFibre Processing Team`;

    case "Declined":
      return `Dear ${cleanName},\n\nThank you for your interest in our Fibre services. Regrettably, your fibre application could not be approved at this time.\n\nReason: ${reason || "Does not meet standard verification criteria"}.\n\nKind regards,\nFibre Admin Team`;

    case "Approved":
      return `Dear ${cleanName},\n\nGreat news! Your fibre application has been APPROVED 🎉. Our team is finalizing the dispatch order to get your installation scheduled.\n\nBest regards,\nFibre Admin Team`;

    case "Cancelled":
      return `Dear ${cleanName},\n\nThis message confirms that your fibre application has been CANCELLED.\n\nReason: ${reason || "Cancelled as per client request or site constraints"}.\n\nKind regards,\nFibre Admin Team`;

    case "Ready for installation":
      return `Dear ${cleanName},\n\nYour fibre line order is now READY FOR INSTALLATION! Our field engineering team will contact you shortly to schedule an installation date.\n\nBest regards,\nFibre Deployment Team`;

    case "Completed":
      return `Dear ${cleanName},\n\nYour fibre installation is officially COMPLETED and active! ${extraComment ? `\n\nNotes: ${extraComment}` : ""}\n\nThank you for choosing our service.\n\nWarm regards,\nFibre Operations Team`;

    default:
      return `Dear ${cleanName},\n\nYour Fibre Application status has been updated to: ${status}.\n\nKind regards,\nFibre Admin Team`;
  }
};

const Leads = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [agentsList, setAgentsList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedLeadForModal, setSelectedLeadForModal] = useState<any | null>(null);

  // Expanded History Toggle Per Lead
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});

  // Status Change Dialog State
  const [statusDialog, setStatusDialog] = useState<{ open: boolean; lead: any; newStatus: string }>({
    open: false,
    lead: null,
    newStatus: "",
  });
  const [statusReason, setStatusReason] = useState("");
  const [additionalComment, setAdditionalComment] = useState("");
  const [notifyTarget, setNotifyTarget] = useState<NotifyTarget>("both");

  // 1. Fetch Fibre Leads Realtime
  useEffect(() => {
    const leadRef = ref(db, "fibreLeads");
    const unsubscribe = onValue(leadRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setLeads(formatted.reverse());
      } else {
        setLeads([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch Agents solely from "agents" table
  useEffect(() => {
    const agentsRef = ref(db, "agents");
    const unsubscribe = onValue(agentsRef, (snap) => {
      const data = snap.val();
      if (data) {
        const list = Object.keys(data).map((k) => ({ id: k, ...data[k] }));
        setAgentsList(list);
      } else {
        setAgentsList([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const deleteLead = (id: string) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      remove(ref(db, `fibreLeads/${id}`));
    }
  };

  const toggleHistoryExpand = (id: string) => {
    setExpandedHistory((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Dispatch SMS, Email, and WhatsApp notifications according to choice (Client / Agent / Both)
  const sendMultiChannelNotifications = (
    lead: any,
    newStatus: string,
    reason: string,
    comment: string,
    target: NotifyTarget
  ) => {
    const clientName = lead.title
      ? `${lead.title} ${lead.firstNamesOrContactName || ""} ${lead.surnameOrBusinessName || ""}`
      : `${lead.name || ""} ${lead.surname || ""}`;
    const clientPhone = lead.contactNumber || lead.contact || "";
    const clientEmail = lead.emailAddress || lead.email || "";

    // 1. CLIENT NOTIFICATIONS
    if (target === "both" || target === "client") {
      const clientMsg = getProfessionalMessage(newStatus, clientName, false, reason, comment);

      if (clientPhone) {
        const cleanPhone = clientPhone.replace(/\D/g, "");
        const formattedPhone = cleanPhone.startsWith("0") ? `27${cleanPhone.substring(1)}` : cleanPhone;
        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(clientMsg)}`, "_blank");
        window.open(`sms:${clientPhone}?body=${encodeURIComponent(clientMsg)}`, "_self");
      }
      if (clientEmail) {
        window.open(
          `mailto:${clientEmail}?subject=${encodeURIComponent(`Fibre Application Status: ${newStatus}`)}&body=${encodeURIComponent(clientMsg)}`,
          "_blank"
        );
      }
    }

    // 2. AGENT NOTIFICATIONS
    if (target === "both" || target === "agent") {
      const assignedAgentName = lead.assignedAgent || lead.agentLogged;
      if (assignedAgentName && assignedAgentName !== "Unassigned") {
        const agentData = agentsList.find(
          (ag) => (ag.name || ag.agentName || ag.fullName) === assignedAgentName
        );

        if (agentData) {
          const agentPhone = agentData.phone || agentData.contact || agentData.mobile || "";
          const agentEmail = agentData.email || "";
          const agentMsg = getProfessionalMessage(newStatus, assignedAgentName, true, reason, comment);

          if (agentPhone) {
            const cleanAgentPhone = agentPhone.replace(/\D/g, "");
            const formattedAgentPhone = cleanAgentPhone.startsWith("0") ? `27${cleanAgentPhone.substring(1)}` : cleanAgentPhone;
            window.open(`https://wa.me/${formattedAgentPhone}?text=${encodeURIComponent(agentMsg)}`, "_blank");
            window.open(`sms:${agentPhone}?body=${encodeURIComponent(agentMsg)}`, "_self");
          }
          if (agentEmail) {
            window.open(
              `mailto:${agentEmail}?subject=${encodeURIComponent(`Agent Update - Lead Status: ${newStatus}`)}&body=${encodeURIComponent(agentMsg)}`,
              "_blank"
            );
          }
        }
      }
    }
  };

  const executeStatusUpdate = (lead: any, newStatus: string, reason: string, comment: string, target: NotifyTarget) => {
    const timestamp = new Date().toISOString();
    
    // Construct new history entry
    const newHistoryEntry = {
      previousStatus: lead.status || "Application received",
      newStatus: newStatus,
      updatedAt: timestamp,
      reason: reason || "N/A",
      comment: comment || "N/A",
      notifiedTarget: target,
    };

    const existingHistory = Array.isArray(lead.statusHistory) ? lead.statusHistory : [];
    const updatedHistory = [...existingHistory, newHistoryEntry];

    const updatePayload: any = {
      status: newStatus,
      updatedAt: timestamp,
      declineOrCancelReason: reason || lead.declineOrCancelReason || "",
      additionalComments: comment || lead.additionalComments || "",
      statusHistory: updatedHistory,
    };

    // Database update
    update(ref(db, `fibreLeads/${lead.id}`), updatePayload);

    // Send notifications based on user choice
    sendMultiChannelNotifications(lead, newStatus, reason, comment, target);
  };

  const handleStatusChangeFromModal = (lead: any, newStatus: string) => {
    setStatusDialog({ open: true, lead, newStatus });
    setStatusReason("");
    setAdditionalComment("");
    setNotifyTarget("both");
  };

  const confirmDialogStatusChange = () => {
    if (statusDialog.lead && statusDialog.newStatus) {
      executeStatusUpdate(
        statusDialog.lead,
        statusDialog.newStatus,
        statusReason,
        additionalComment,
        notifyTarget
      );
    }
    setStatusDialog({ open: false, lead: null, newStatus: "" });
  };

  // Document Download Handler
  const handleDownloadDocument = (lead: any) => {
    const docUrl = resolveDocumentUrl(lead);
    if (!docUrl) {
      alert("No document file attached to this application or document URL is missing.");
      return;
    }
    window.open(docUrl, "_blank");
  };

  // Filter leads by month
  const monthlyLeads = leads.filter((lead) => {
    const dateStr = lead.submittedAt || lead.createdAt;
    if (!dateStr) return true;
    const date = new Date(dateStr);
    return date.getMonth() === selectedMonth;
  });

  // Search filter
  const filteredMonthlyLeads = monthlyLeads.filter((lead) => {
    const fullName = `${lead.title || ""} ${lead.firstNamesOrContactName || lead.name || ""} ${lead.surnameOrBusinessName || lead.surname || ""}`;
    const email = lead.emailAddress || lead.email || "";
    const contact = lead.contactNumber || lead.contact || "";
    const address = `${lead.streetAddress || ""} ${lead.suburb || ""} ${lead.address || ""}`;
    const pkg = lead.packageSelected || lead.packagePlan || "";

    const query = search.toLowerCase();
    return (
      fullName.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      contact.toLowerCase().includes(query) ||
      address.toLowerCase().includes(query) ||
      pkg.toLowerCase().includes(query)
    );
  });

  const getStatusCount = (statusName: string) => {
    return leads.filter((l) => (l.status || "Application received") === statusName).length;
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <Box sx={{ bgcolor: "#ffffff", minHeight: "100vh", py: 4, color: "#1e293b" }}>
      <Container maxWidth="xl">
        {/* STATS OVERVIEW */}
        <StatsCards leads={monthlyLeads} />

        {/* EXPORT BAR & STATUS COUNTS */}
        <Box sx={{ mt: 3, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
          <ExportExcel leads={monthlyLeads} />

          {/* Dynamic Status Badges Display */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
            {Object.keys(STATUS_CONFIG).map((stKey) => {
              const count = getStatusCount(stKey);
              return (
                <Chip
                  key={stKey}
                  label={`${STATUS_CONFIG[stKey].label}: ${count}`}
                  color={STATUS_CONFIG[stKey].color}
                  variant={stKey === "Declined" ? "filled" : "outlined"}
                  size="small"
                  sx={{ fontWeight: "bold" }}
                />
              );
            })}
          </Box>

          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Total Leads Loaded: <b>{leads.length}</b>
          </Typography>
        </Box>

        {/* DASHBOARD HEADER */}
        <Typography
          variant="h4"
          fontWeight="900"
          sx={{
            mt: 3,
            color: "#0f172a"
          }}
        >
          Fibre Leads Admin Console (2026)
        </Typography>

        {/* SEARCH & FILTER CONTROLS */}
        <Paper
          elevation={1}
          sx={{
            p: 2,
            mt: 3,
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
            bgcolor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: "280px" }}>
            <Search sx={{ color: "#0284c7" }} />
            <TextField
              fullWidth
              placeholder="Search by name, email, contact, street, suburb, or package..."
              variant="standard"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ disableUnderline: true, style: { color: "#0f172a" } }}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FilterList sx={{ color: "#64748b" }} />
            <Typography variant="body2" sx={{ color: "#334155" }}>Month:</Typography>
            <TextField
              select
              size="small"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              sx={{
                width: 140,
                "& .MuiOutlinedInput-root": { color: "#0f172a", bgcolor: "#fff" },
              }}
            >
              {months.map((month, index) => (
                <MenuItem key={index} value={index}>
                  {month}
                </MenuItem>
              ))}
            </TextField>
            <Chip label={`${filteredMonthlyLeads.length} Leads`} color="primary" sx={{ fontWeight: "bold" }} />
          </Box>
        </Paper>

        {/* LEADS GRID */}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {filteredMonthlyLeads.length === 0 ? (
            <Box sx={{ width: "100%", textAlign: "center", py: 8 }}>
              <Typography color="#64748b" fontWeight="bold">
                No fibre applications found for {months[selectedMonth]} matching search query.
              </Typography>
            </Box>
          ) : (
            filteredMonthlyLeads.map((lead) => {
              const name = lead.title
                ? `${lead.title} ${lead.firstNamesOrContactName || ""} ${lead.surnameOrBusinessName || ""}`
                : `${lead.name || ""} ${lead.surname || ""}`;
              const email = lead.emailAddress || lead.email || "No Email";
              const contact = lead.contactNumber || lead.contact || "No Contact";
              const pkg = lead.packageSelected || lead.packagePlan || "No Package";
              const price = lead.packagePrice || lead.price || "N/A";
              const commission = lead.commissionAmount || lead.commission || lead.agentCommission || "R 200";
              const isCompleted = lead.status === "Completed";
              const docUrl = resolveDocumentUrl(lead);
              const historyList: any[] = Array.isArray(lead.statusHistory) ? lead.statusHistory : [];

              return (
                <Grid item xs={12} md={6} lg={4} key={lead.id}>
                  <Paper sx={cardStyle}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Typography fontWeight="800" fontSize="17px" sx={{ color: "#0f172a" }}>
                        {name}
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<Visibility fontSize="small" />}
                        onClick={() => setSelectedLeadForModal(lead)}
                        sx={{ textTransform: "none", color: "#0284c7", fontWeight: "bold" }}
                      >
                        View All Details
                      </Button>
                    </Box>

                    <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>{email}</Typography>
                    <Typography variant="body2" sx={{ color: "#334155" }}>{contact}</Typography>
                    <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mt: 0.5 }}>
                      ID: {lead.idOrPassportOrRegNo || lead.idNumber || "N/A"}
                    </Typography>

                    {/* PACKAGES, PRICES, & STATUS BADGES */}
                    <Box sx={{ mt: 1.5, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      <Chip
                        label={`📦 ${pkg}`}
                        size="small"
                        sx={{ bgcolor: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd" }}
                      />
                      <Chip
                        label={`💰 Price: ${price}`}
                        size="small"
                        sx={{ bgcolor: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }}
                      />
                      <Chip
                        icon={<Paid sx={{ fontSize: "14px !important", color: "#a16207 !important" }} />}
                        label={`Comm: ${commission}`}
                        size="small"
                        sx={{ bgcolor: "#fef9c3", color: "#a16207", border: "1px solid #fef08a", fontWeight: 700 }}
                      />
                      <Chip
                        label={lead.status || "Application received"}
                        size="small"
                        color={(STATUS_CONFIG[lead.status]?.color || "warning") as ChipProps["color"]}
                      />
                    </Box>

                    {/* COMPLETED COMMISSION HIGHLIGHT */}
                    {isCompleted && (
                      <Paper
                        elevation={0}
                        sx={{
                          mt: 1.5,
                          p: 1,
                          bgcolor: "#ffffff",
                          border: "1px solid #bbf7d0",
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Paid sx={{ color: "#16a34a" }} />
                          <Typography variant="body2" fontWeight={800} color="#15803d">
                            Agent Commission Earned:
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={900} color="#166534">
                          {commission}
                        </Typography>
                      </Paper>
                    )}

                    {/* PREVIOUS STATUSES AUDIT TRAIL */}
                    <Box sx={{ mt: 2 }}>
                      <Button
                        size="small"
                        fullWidth
                        onClick={() => toggleHistoryExpand(lead.id)}
                        startIcon={<History fontSize="small" />}
                        endIcon={expandedHistory[lead.id] ? <ExpandLess /> : <ExpandMore />}
                        sx={{
                          textTransform: "none",
                          color: "#475569",
                          bgcolor: "#f8fafc",
                          justifyContent: "space-between",
                          fontSize: "12px",
                          py: 0.5,
                          px: 1,
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        Previous Statuses ({historyList.length})
                      </Button>

                      {expandedHistory[lead.id] && (
                        <Box sx={{ mt: 1, p: 1.5, bgcolor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 2 }}>
                          {historyList.length === 0 ? (
                            <Typography variant="caption" color="#94a3b8">
                              No previous status changes logged yet.
                            </Typography>
                          ) : (
                            historyList.map((hist, idx) => (
                              <Box key={idx} sx={{ mb: 1, pb: 1, borderBottom: idx < historyList.length - 1 ? "1px dashed #e2e8f0" : "none" }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <Chip label={hist.newStatus} size="small" variant="outlined" sx={{ height: 20, fontSize: "10px" }} />
                                  <Typography variant="caption" color="#64748b">
                                    {new Date(hist.updatedAt).toLocaleString()}
                                  </Typography>
                                </Box>
                                <Typography variant="caption" display="block" color="#334155" sx={{ mt: 0.5 }}>
                                  <b>From:</b> {hist.previousStatus} | <b>Alerted:</b> {hist.notifiedTarget}
                                </Typography>
                                {hist.reason && hist.reason !== "N/A" && (
                                  <Typography variant="caption" display="block" color="#dc2626">
                                    <b>Reason:</b> {hist.reason}
                                  </Typography>
                                )}
                              </Box>
                            ))
                          )}
                        </Box>
                      )}
                    </Box>

                    {/* ACTION FOOTER */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, pt: 1, borderTop: "1px solid #e2e8f0" }}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          title="Send WhatsApp to Client"
                          onClick={() => {
                            const cleanPhone = contact.replace(/\D/g, "");
                            const formattedPhone = cleanPhone.startsWith("0") ? `27${cleanPhone.substring(1)}` : cleanPhone;
                            const msg = getProfessionalMessage(lead.status || "Application received", name, false, lead.declineOrCancelReason, lead.additionalComments);
                            window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, "_blank");
                          }}
                          sx={{ color: "#16a34a" }}
                        >
                          <WhatsApp fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          title="Send Email to Client"
                          onClick={() => {
                            const msg = getProfessionalMessage(lead.status || "Application received", name, false, lead.declineOrCancelReason, lead.additionalComments);
                            window.open(`mailto:${email}?subject=${encodeURIComponent(`Fibre Application Status: ${lead.status || "Update"}`)}&body=${encodeURIComponent(msg)}`, "_blank");
                          }}
                          sx={{ color: "#0284c7" }}
                        >
                          <Email fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          title="Send SMS to Client"
                          onClick={() => {
                            const msg = getProfessionalMessage(lead.status || "Application received", name, false, lead.declineOrCancelReason, lead.additionalComments);
                            window.open(`sms:${contact}?body=${encodeURIComponent(msg)}`, "_self");
                          }}
                          sx={{ color: "#d97706" }}
                        >
                          <Sms fontSize="small" />
                        </IconButton>

                        <Tooltip title={docUrl ? "Download Attached Document" : "No file attached"}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadDocument(lead)}
                              disabled={!docUrl}
                              sx={{ color: docUrl ? "#4f46e5" : "#cbd5e1" }}
                            >
                              {docUrl ? <Download fontSize="small" /> : <Description fontSize="small" />}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>

                      <IconButton size="small" onClick={() => deleteLead(lead.id)} sx={{ color: "#ef4444" }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              );
            })
          )}
        </Grid>
      </Container>

      {/* DIALOG FOR STATUS REASONS, COMMENTS, AND RECIPIENT SELECTION */}
      <Dialog
        open={statusDialog.open}
        onClose={() => setStatusDialog({ open: false, lead: null, newStatus: "" })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ style: { backgroundColor: "#ffffff" } }}
      >
        <DialogTitle sx={{ color: "#0284c7", fontWeight: "bold", bgcolor: "#ffffff" }}>
          Update Status: {statusDialog.newStatus}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: "#ffffff" }}>
          <Typography variant="body2" color="#64748b" mb={2}>
            Select who should receive notification alerts upon status change:
          </Typography>

          {/* NOTIFICATION RECIPIENT CHOICE */}
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend" sx={{ fontWeight: "bold", fontSize: "13px", color: "#0f172a" }}>
              1. Choose Notification Recipients:
            </FormLabel>
            <RadioGroup
              row
              value={notifyTarget}
              onChange={(e) => setNotifyTarget(e.target.value as NotifyTarget)}
            >
              <FormControlLabel value="both" control={<Radio size="small" />} label="Both (Agent & Client)" />
              <FormControlLabel value="client" control={<Radio size="small" />} label="Client Only" />
              <FormControlLabel value="agent" control={<Radio size="small" />} label="Agent Only" />
            </RadioGroup>
          </FormControl>

          <Divider sx={{ my: 1 }} />

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
            label="Additional Comments (Optional)"
            value={additionalComment}
            onChange={(e) => setAdditionalComment(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#ffffff" }}>
          <Button onClick={() => setStatusDialog({ open: false, lead: null, newStatus: "" })} sx={{ color: "#64748b" }}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={confirmDialogStatusChange} startIcon={<Send />}>
            Save Status & Send Alert
          </Button>
        </DialogActions>
      </Dialog>

      {/* LEAD DETAILS MODAL */}
      <Dialog
        open={Boolean(selectedLeadForModal)}
        onClose={() => setSelectedLeadForModal(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ style: { backgroundColor: "#ffffff" } }}
      >
        <DialogContent sx={{ p: 3, bgcolor: "#ffffff" }}>
          {selectedLeadForModal && (
            <Box>
              <LeadDetails lead={selectedLeadForModal} onClose={() => setSelectedLeadForModal(null)} />

              <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, fontWeight: "bold", color: "#0f172a" }}>
                CHANGE APPLICATION STATUS:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {Object.keys(STATUS_CONFIG).map((st) => (
                  <Button
                    key={st}
                    size="small"
                    variant={selectedLeadForModal.status === st ? "contained" : "outlined"}
                    color={(STATUS_CONFIG[st]?.color || "primary") as ButtonProps["color"]}
                    onClick={() => {
                      handleStatusChangeFromModal(selectedLeadForModal, st);
                      setSelectedLeadForModal(null);
                    }}
                    sx={{ textTransform: "none" }}
                  >
                    {st}
                  </Button>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Leads;

const cardStyle = {
  p: 2.5,
  borderRadius: 3,
  bgcolor: "#ffffff",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
};