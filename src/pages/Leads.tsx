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
  Tooltip,
} from "@mui/material";

import {
  WhatsApp,
  Email,
  Delete,
  Search,
  Visibility,
  Download,
  FilterList,
} from "@mui/icons-material";

import { ref, onValue, remove, update } from "firebase/database";
import { db } from "../firebase";

import StatsCards from "../components/StatsCards";
import ExportExcel from "../components/ExportExcel";
import AgentAssign from "../components/AgentAssign";
import LeadDetails from "./LeadDetails";

const Leads = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedLeadForModal, setSelectedLeadForModal] = useState<any | null>(null);

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

  const deleteLead = (id: string) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      remove(ref(db, `fibreLeads/${id}`));
    }
  };

  const updateStatus = (id: string, status: string) => {
    update(ref(db, `fibreLeads/${id}`), { status, updatedAt: new Date().toISOString() });
  };

  // Filter leads by month
  const monthlyLeads = leads.filter((lead) => {
    const dateStr = lead.submittedAt || lead.createdAt;
    if (!dateStr) return true; // Include fallback if date missing
    const date = new Date(dateStr);
    return date.getMonth() === selectedMonth;
  });

  // Filter search across multiple fields
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
        <Typography variant="h4" fontWeight="900" sx={{ mt: 3, background: "linear-gradient(90deg, #38bdf8, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
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
                "& .MuiSvgIcon-root": { color: "#fff" }
              }}
            >
              {months.map((month, index) => (
                <MenuItem key={index} value={index}>
                  {month}
                </MenuItem>
              ))}
            </TextField>
            <Chip
              label={`${filteredMonthlyLeads.length} Leads`}
              color="primary"
              sx={{ fontWeight: "bold" }}
            />
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

                    <Box sx={{ mt: 1.5, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      <Chip label={`📦 ${pkg}`} size="small" sx={{ bgcolor: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)" }} />
                      <Chip label={`💰 ${price}`} size="small" sx={{ bgcolor: "rgba(74, 222, 128, 0.15)", color: "#4ade80", border: "1px solid rgba(74, 222, 128, 0.3)" }} />
                      <Chip label={lead.status || "Pending"} size="small" color={lead.status === "Approved" ? "success" : lead.status === "Declined" ? "error" : "warning"} />
                    </Box>

                    {/* AGENT ASSIGNMENT COMPONENT */}
                    <Box sx={{ mt: 2 }}>
                      <AgentAssign leadId={lead.id} current={lead.assignedAgent || lead.agentLogged} />
                    </Box>

                    {/* QUICK STATUS UPDATES */}
                    <Box sx={{ mt: 2, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {["Received", "In Process", "Pending", "Approved", "Declined"].map((st) => (
                        <Button
                          key={st}
                          size="small"
                          variant={lead.status === st ? "contained" : "outlined"}
                          color={st === "Approved" ? "success" : st === "Declined" ? "error" : "primary"}
                          onClick={() => updateStatus(lead.id, st)}
                          sx={{ fontSize: "10px", py: 0.2, px: 1 }}
                        >
                          {st}
                        </Button>
                      ))}
                    </Box>

                    {/* ACTION FOOTER */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, pt: 1, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            const phone = contact.replace(/\D/g, "");
                            const cleanPhone = phone.startsWith("0") ? `27${phone.substring(1)}` : phone;
                            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${name}, your Fibre Application status is: ${lead.status || "Received"}`)}`, "_blank");
                          }}
                          sx={{ color: "#22c55e" }}
                        >
                          <WhatsApp fontSize="small" />
                        </IconButton>

                        <IconButton size="small" onClick={() => window.open(`mailto:${email}`)} sx={{ color: "#38bdf8" }}>
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

      {/* LEAD DETAILS & DOCUMENT DOWNLOAD MODAL */}
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