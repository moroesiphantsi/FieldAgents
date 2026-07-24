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
  Select,
  FormControl,
  InputLabel,
  ButtonProps,
  ChipProps,
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
  Person,
  Send
} from "@mui/icons-material";

import { ref, onValue, remove, update } from "firebase/database";
import { db } from "../firebase";

import StatsCards from "../components/StatsCards";
import ExportExcel from "../components/ExportExcel";
import LeadDetails from "./LeadDetails";

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
  "Completed and contacted": { label: "Completed & Contacted", color: "success", notifyCustomer: true },
  // Silent Status Updates (Do not notify user)
  "Signed up": { label: "Signed Up", color: "primary", notifyCustomer: false },
  "Contacted": { label: "Contacted", color: "default", notifyCustomer: false },
};

const getProfessionalMessage = (status: string, name: string, reason: string = "", extraComment: string = "") => {
  const cleanName = name || "Valued Customer";

  switch (status) {
    case "Application received":
      return `Dear ${cleanName},\n\nThank you for submitting your fibre application with us. We have successfully received your details and queued your application for initial processing. We will update you shortly on the progress.\n\nKind regards,\nFibre Admin Team`;

    case "in process":
      return `Dear ${cleanName},\n\nYour fibre application is currently IN PROCESS. Our technical team is actively verifying coverage and processing documentation. No further action is required from you at this time.\n\nBest regards,\nFibre Processing Team`;

    case "Declined":
      return `Dear ${cleanName},\n\nThank you for your interest in our Fibre services. Regrettably, your fibre application could not be approved at this time.\n\nReason: ${reason || "Does not meet standard verification criteria"}.\n\nIf you have any queries, please feel free to reach out to our support line.\n\nKind regards,\nFibre Admin Team`;

    case "Approved":
      return `Dear ${cleanName},\n\nGreat news! Your fibre application has been APPROVED 🎉. Our team is finalizing the dispatch order to get your installation scheduled.\n\nBest regards,\nFibre Admin Team`;

    case "Cancelled":
      return `Dear ${cleanName},\n\nThis message confirms that your fibre application has been CANCELLED.\n\nReason: ${reason || "Cancelled as per client request or site constraints"}.\n\nPlease contact us if you believe this was done in error or if you wish to re-apply.\n\nKind regards,\nFibre Admin Team`;

    case "Ready for installation":
      return `Dear ${cleanName},\n\nYour fibre line order is now READY FOR INSTALLATION! Our field engineering team will contact you shortly to schedule an installation date and time.\n\nBest regards,\nFibre Deployment Team`;

    case "Completed and contacted":
      return `Dear ${cleanName},\n\nYour fibre installation is officially COMPLETED and active! ${extraComment ? `\n\nNotes: ${extraComment}` : ""}\n\nThank you for choosing our service. If you experience any connectivity queries, our support desk is ready to assist.\n\nWarm regards,\nFibre Operations Team`;

    default:
      return `Dear ${cleanName},\n\nYour Fibre Application status has been updated to: ${status}.\n\nKind regards,\nFibre Admin Team`;
  }
};

const Leads = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [dbnAgents, setDbnAgents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedLeadForModal, setSelectedLeadForModal] = useState<any | null>(null);

  // Status Change Dialog State
  const [statusDialog, setStatusDialog] = useState<{ open: boolean; lead: any; newStatus: string }>({
    open: false,
    lead: null,
    newStatus: "",
  });
  const [statusReason, setStatusReason] = useState("");
  const [additionalComment, setAdditionalComment] = useState("");

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

  // 2. Fetch Agents from Database ("dbn agents" & "agents") and REMOVE Lebohang Molelekwa
  useEffect(() => {
    const fetchAgentsNode = (nodeName: string) => {
      return new Promise<any[]>((resolve) => {
        onValue(
          ref(db, nodeName),
          (snap) => {
            const data = snap.val();
            if (data) {
              const list = Object.keys(data).map((k) => ({ id: k, ...data[k] }));
              resolve(list);
            } else {
              resolve([]);
            }
          },
          { onlyOnce: true }
        );
      });
    };

    Promise.all([fetchAgentsNode("dbn agents"), fetchAgentsNode("agents")]).then(([dbnList, generalList]) => {
      const combined = [...dbnList, ...generalList];
      // Filter out duplicate IDs or entries and strictly filter out "Lebohang Molelekwa"
      const uniqueMap = new Map();
      combined.forEach((ag) => {
        const agentName = ag.name || ag.agentName || ag.fullName || "";
        const isLebohang = agentName.toLowerCase().includes("lebohang") && agentName.toLowerCase().includes("molelekwa");

        if (agentName && !isLebohang && !uniqueMap.has(agentName)) {
          uniqueMap.set(agentName, ag);
        }
      });

      setDbnAgents(Array.from(uniqueMap.values()));
    });
  }, []);

  const deleteLead = (id: string) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      remove(ref(db, `fibreLeads/${id}`));
    }
  };

  // Agent Assignment update
  const updateAssignedAgent = (leadId: string, agentName: string) => {
    update(ref(db, `fibreLeads/${leadId}`), {
      assignedAgent: agentName,
      agentLogged: agentName,
      updatedAt: new Date().toISOString(),
    });
  };

  // Status Change Trigger logic
  const handleStatusClick = (lead: any, newStatus: string) => {
    const config = STATUS_CONFIG[newStatus];

    // If requires a reason/comment or has special dialog inputs
    if (config?.requiresReason || newStatus === "Completed and contacted") {
      setStatusDialog({ open: true, lead, newStatus });
      setStatusReason("");
      setAdditionalComment("");
    } else {
      // Execute directly
      executeStatusUpdate(lead, newStatus, "", "");
    }
  };

  const executeStatusUpdate = (lead: any, newStatus: string, reason: string, comment: string) => {
    const config = STATUS_CONFIG[newStatus];
    const leadName = lead.title
      ? `${lead.title} ${lead.firstNamesOrContactName || ""} ${lead.surnameOrBusinessName || ""}`
      : `${lead.name || ""} ${lead.surname || ""}`;
    const phone = lead.contactNumber || lead.contact || "";
    const email = lead.emailAddress || lead.email || "";

    const updatePayload: any = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    if (reason) updatePayload.declineOrCancelReason = reason;
    if (comment) updatePayload.additionalComments = comment;

    // Direct Database update
    update(ref(db, `fibreLeads/${lead.id}`), updatePayload);

    // SILENT UPDATES: Signed up & Contacted MUST NOT trigger messages to the user
    if (config && !config.notifyCustomer) {
      return;
    }

    // Generate Professional Message
    const msg = getProfessionalMessage(newStatus, leadName, reason, comment);

    // Automatically trigger WhatsApp / Email draft if contact details exist
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, "");
      const formattedPhone = cleanPhone.startsWith("0") ? `27${cleanPhone.substring(1)}` : cleanPhone;
      window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, "_blank");
    } else if (email) {
      window.open(
        `mailto:${email}?subject=${encodeURIComponent(`Fibre Application Status Update: ${newStatus}`)}&body=${encodeURIComponent(msg)}`,
        "_blank"
      );
    }
  };

  const confirmDialogStatusChange = () => {
    if (statusDialog.lead && statusDialog.newStatus) {
      executeStatusUpdate(statusDialog.lead, statusDialog.newStatus, statusReason, additionalComment);
    }
    setStatusDialog({ open: false, lead: null, newStatus: "" });
  };

  // Filter leads by month
  const monthlyLeads = leads.filter((lead) => {
    const dateStr = lead.submittedAt || lead.createdAt;
    if (!dateStr) return true;
    const date = new Date(dateStr);
    return date.getMonth() === selectedMonth;
  });

  // Search filter across fields
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

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <Box sx={{ bgcolor: "#0b1329", minHeight: "100vh", py: 4, color: "#fff" }}>
      <Container maxWidth="xl">
        {/* STATS OVERVIEW */}
        <StatsCards leads={monthlyLeads} />

        {/* EXPORT BAR */}
        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <ExportExcel leads={monthlyLeads} />
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
            Total Leads Loaded: <b>{leads.length}</b>
          </Typography>
        </Box>

        {/* DASHBOARD HEADER */}
        <Typography
          variant="h4"
          fontWeight="900"
          sx={{
            mt: 3,
            background: "linear-gradient(90deg, #38bdf8, #818cf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Fibre Leads Admin Console (2026)
        </Typography>

        {/* SEARCH & FILTER CONTROLS */}
        <Paper
          sx={{
            p: 2,
            mt: 3,
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
            bgcolor: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: "280px" }}>
            <Search sx={{ color: "#38bdf8" }} />
            <TextField
              fullWidth
              placeholder="Search by name, email, contact, street, suburb, or package..."
              variant="standard"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ disableUnderline: true, style: { color: "#fff" } }}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FilterList sx={{ color: "#94a3b8" }} />
            <Typography variant="body2" sx={{ color: "#cbd5e1" }}>Month:</Typography>
            <TextField
              select
              size="small"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              sx={{
                width: 140,
                "& .MuiOutlinedInput-root": { color: "#fff", bgcolor: "rgba(255,255,255,0.05)" },
                "& .MuiSvgIcon-root": { color: "#fff" },
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
              <Typography color="#94a3b8" fontWeight="bold">
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
              const assignedAgent = lead.assignedAgent || lead.agentLogged || "Unassigned";
              const isCompleted = lead.status === "Completed and contacted";
              const docUrl = lead.attachments?.idOrPassportDocUrl || lead.attachments?.idOrPassportDoc || lead.idDocumentUrl;

              return (
                <Grid item xs={12} md={6} lg={4} key={lead.id}>
                  <Paper sx={cardStyle}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Typography fontWeight="800" fontSize="17px" sx={{ color: "#fff" }}>
                        {name}
                      </Typography>
                      <Tooltip title="View Lead Details & Documents">
                        <IconButton size="small" onClick={() => setSelectedLeadForModal(lead)} sx={{ color: "#38bdf8" }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5 }}>{email}</Typography>
                    <Typography variant="body2" sx={{ color: "#cbd5e1" }}>{contact}</Typography>
                    <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 0.5 }}>
                      ID: {lead.idOrPassportOrRegNo || lead.idNumber || "N/A"}
                    </Typography>

                    {/* PACKAGES, PRICES, & COMMISSION BADGES */}
                    <Box sx={{ mt: 1.5, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      <Chip
                        label={`📦 ${pkg}`}
                        size="small"
                        sx={{ bgcolor: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)" }}
                      />
                      <Chip
                        label={`💰 Price: ${price}`}
                        size="small"
                        sx={{ bgcolor: "rgba(74, 222, 128, 0.15)", color: "#4ade80", border: "1px solid rgba(74, 222, 128, 0.3)" }}
                      />
                      {/* POP-UP / SUBMITTED COMMISSION VIEW */}
                      <Chip
                        icon={<Paid sx={{ fontSize: "14px !important", color: "#facc15 !important" }} />}
                        label={`Comm: ${commission}`}
                        size="small"
                        sx={{ bgcolor: "rgba(250, 204, 21, 0.15)", color: "#facc15", border: "1px solid rgba(250, 204, 21, 0.3)", fontWeight: 700 }}
                      />
                      <Chip
                        label={lead.status || "Application received"}
                        size="small"
                        color={(STATUS_CONFIG[lead.status]?.color || "warning") as ChipProps["color"]}
                      />
                    </Box>

                    {/* COMPLETED APPLICATION COMMISSION EARNED HIGHLIGHT */}
                    {isCompleted && (
                      <Paper
                        sx={{
                          mt: 1.5,
                          p: 1,
                          bgcolor: "rgba(34, 197, 94, 0.15)",
                          border: "1px solid rgba(34, 197, 94, 0.4)",
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Paid sx={{ color: "#22c55e" }} />
                          <Typography variant="body2" fontWeight={800} color="#22c55e">
                            Agent Commission Earned:
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={900} color="#fff">
                          {commission}
                        </Typography>
                      </Paper>
                    )}

                    {/* DYNAMIC AGENT ASSIGNMENT FROM DATABASE */}
                    <Box sx={{ mt: 2 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel sx={{ color: "#94a3b8", fontSize: "12px" }}>Assign Agent (dbn agents)</InputLabel>
                        <Select
                          value={assignedAgent}
                          label="Assign Agent (dbn agents)"
                          onChange={(e) => updateAssignedAgent(lead.id, e.target.value)}
                          sx={{
                            color: "#fff",
                            bgcolor: "rgba(255,255,255,0.05)",
                            borderRadius: 2,
                            fontSize: "13px",
                            "& .MuiSvgIcon-root": { color: "#fff" },
                          }}
                        >
                          <MenuItem value="Unassigned">
                            <em>Unassigned</em>
                          </MenuItem>
                          {dbnAgents.map((ag) => {
                            const nameVal = ag.name || ag.agentName || ag.fullName;
                            return (
                              <MenuItem key={ag.id} value={nameVal}>
                                <Person sx={{ fontSize: 16, mr: 1, color: "#38bdf8" }} />
                                {nameVal}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Box>

                    {/* REASON / EXTRA COMMENT PREVIEW */}
                    {(lead.declineOrCancelReason || lead.additionalComments) && (
                      <Box sx={{ mt: 1.5, p: 1, bgcolor: "rgba(255,255,255,0.03)", borderRadius: 1.5, borderLeft: "3px solid #38bdf8" }}>
                        {lead.declineOrCancelReason && (
                          <Typography variant="caption" display="block" color="#f87171">
                            <b>Reason:</b> {lead.declineOrCancelReason}
                          </Typography>
                        )}
                        {lead.additionalComments && (
                          <Typography variant="caption" display="block" color="#cbd5e1">
                            <b>Comment:</b> {lead.additionalComments}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* STATUS ACTION BUTTONS */}
                    <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 2, mb: 0.5, fontWeight: "bold" }}>
                      UPDATE APPLICATION STATUS:
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {[
                        "Application received",
                        "in process",
                        "Approved",
                        "Declined",
                        "Cancelled",
                        "Ready for installation",
                        "Completed and contacted",
                      ].map((st) => (
                        <Button
                          key={st}
                          size="small"
                          variant={lead.status === st ? "contained" : "outlined"}
                          color={(STATUS_CONFIG[st]?.color || "primary") as ButtonProps["color"]}
                          onClick={() => handleStatusClick(lead, st)}
                          sx={{ fontSize: "10px", py: 0.2, px: 0.8, textTransform: "none", borderRadius: 1.5 }}
                        >
                          {st}
                        </Button>
                      ))}
                    </Box>

                    {/* SILENT STATUS UPDATE BUTTONS (No Notification) */}
                    <Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
                      {["Signed up", "Contacted"].map((st) => (
                        <Button
                          key={st}
                          size="small"
                          variant={lead.status === st ? "contained" : "outlined"}
                          sx={{
                            fontSize: "10px",
                            py: 0.2,
                            px: 1,
                            textTransform: "none",
                            borderColor: "rgba(255,255,255,0.2)",
                            color: "#cbd5e1",
                          }}
                          onClick={() => handleStatusClick(lead, st)}
                        >
                          {st} (Silent)
                        </Button>
                      ))}
                    </Box>

                    {/* ACTION FOOTER */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, pt: 1, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            const cleanPhone = contact.replace(/\D/g, "");
                            const formattedPhone = cleanPhone.startsWith("0") ? `27${cleanPhone.substring(1)}` : cleanPhone;
                            const msg = getProfessionalMessage(lead.status || "Application received", name, lead.declineOrCancelReason, lead.additionalComments);
                            window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, "_blank");
                          }}
                          sx={{ color: "#22c55e" }}
                        >
                          <WhatsApp fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={() => {
                            const msg = getProfessionalMessage(lead.status || "Application received", name, lead.declineOrCancelReason, lead.additionalComments);
                            window.open(`mailto:${email}?subject=${encodeURIComponent(`Fibre Application Status: ${lead.status || "Update"}`)}&body=${encodeURIComponent(msg)}`, "_blank");
                          }}
                          sx={{ color: "#38bdf8" }}
                        >
                          <Email fontSize="small" />
                        </IconButton>

                        {docUrl && (
                          <Tooltip title="Download Attached ID/Doc">
                            <IconButton size="small" onClick={() => window.open(docUrl, "_blank")} sx={{ color: "#818cf8" }}>
                              <Download fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>

                      <IconButton size="small" onClick={() => deleteLead(lead.id)} sx={{ color: "#f87171" }}>
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

      {/* DIALOG FOR STATUS REASONS & ADDITIONAL COMMENTS */}
      <Dialog
        open={statusDialog.open}
        onClose={() => setStatusDialog({ open: false, lead: null, newStatus: "" })}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: "#0f172a",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
          },
        }}
      >
        <DialogTitle sx={{ color: "#38bdf8", fontWeight: "bold" }}>
          Update Status: {statusDialog.newStatus}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="#94a3b8" mb={2}>
            Please specify details before notifying the customer.
          </Typography>

          {STATUS_CONFIG[statusDialog.newStatus]?.requiresReason && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason for Declining / Cancelling"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              margin="normal"
              sx={{
                "& .MuiOutlinedInput-root": { color: "#fff", bgcolor: "rgba(255,255,255,0.05)" },
                "& .MuiInputLabel-root": { color: "#94a3b8" },
              }}
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
            sx={{
              "& .MuiOutlinedInput-root": { color: "#fff", bgcolor: "rgba(255,255,255,0.05)" },
              "& .MuiInputLabel-root": { color: "#94a3b8" },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStatusDialog({ open: false, lead: null, newStatus: "" })} sx={{ color: "#94a3b8" }}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={confirmDialogStatusChange} startIcon={<Send />}>
            Save & Notify Customer
          </Button>
        </DialogActions>
      </Dialog>

      {/* LEAD DETAILS & DOCUMENT MODAL */}
      <Dialog
        open={Boolean(selectedLeadForModal)}
        onClose={() => setSelectedLeadForModal(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: { backgroundColor: "transparent", boxShadow: "none" },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <LeadDetails lead={selectedLeadForModal} onClose={() => setSelectedLeadForModal(null)} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Leads;

const cardStyle = {
  p: 2.5,
  borderRadius: 3,
  bgcolor: "rgba(15, 23, 42, 0.75)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
};