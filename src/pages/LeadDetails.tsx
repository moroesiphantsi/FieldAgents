import React from "react";
import {
  Typography,
  Paper,
  Button,
  Divider,
  Chip,
  Box,
  Grid,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  WhatsApp,
  Email,
  Download,
  Visibility,
  Home,
  ReceiptLong,
  Badge,
} from "@mui/icons-material";

interface LeadDetailsProps {
  lead: any;
  onClose?: () => void;
}

const LeadDetails: React.FC<LeadDetailsProps> = ({ lead }) => {
  if (!lead) return <Typography color="text.secondary">Select a lead to view details.</Typography>;

  // Resolve display fields safely across both field-agent schema and admin schema
  const fullName = lead.title 
    ? `${lead.title} ${lead.firstNamesOrContactName || ""} ${lead.surnameOrBusinessName || ""}`.trim()
    : `${lead.name || ""} ${lead.surname || ""}`.trim() || "N/A";

  const email = lead.emailAddress || lead.email || "N/A";
  const contact = lead.contactNumber || lead.contact || "N/A";
  const idNumber = lead.idOrPassportOrRegNo || lead.idNumber || "N/A";

  const fullAddress = lead.streetAddress 
    ? `${lead.streetAddress}, ${lead.suburb || ""}, ${lead.townCity || ""}, ${lead.province || ""} ${lead.postalCode || ""}`.trim()
    : lead.installationAddress || lead.address || "N/A";

  const selectedPackage = lead.packageSelected || lead.packagePlan || "No Package Selected";
  const price = lead.packagePrice || lead.price || "N/A";
  const commission = lead.commissionAmount || "R50.00";
  const agent = lead.agentLogged || lead.technicianOrSalesAgent || lead.assignedAgent || "Unassigned";

  // Document Handler
  const documentUrl = lead.attachments?.idOrPassportDocUrl || lead.attachments?.idOrPassportDoc || lead.idDocumentUrl;

  const handleDownload = (url: string, filename: string) => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "Document";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        color: "#fff",
      }}
    >
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="800" sx={{ color: "#38bdf8" }}>
            {fullName}
          </Typography>
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            Submitted: {lead.submittedAt || lead.createdAt ? new Date(lead.submittedAt || lead.createdAt).toLocaleString() : "N/A"}
          </Typography>
        </Box>
        <Chip
          label={lead.status || "Pending"}
          color={
            lead.status === "Approved" ? "success" : lead.status === "Declined" ? "error" : "warning"
          }
          sx={{ fontWeight: "bold" }}
        />
      </Box>

      <Divider sx={{ my: 2, borderColor: "rgba(255, 255, 255, 0.1)" }} />

      <Grid container spacing={2}>
        {/* APPLICANT INFO */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" sx={{ color: "#818cf8", display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Badge fontSize="small" /> Applicant Information
          </Typography>
          <Typography variant="body2"><b>ID / Passport / Reg:</b> {idNumber}</Typography>
          <Typography variant="body2"><b>Email:</b> {email}</Typography>
          <Typography variant="body2"><b>Contact:</b> {contact}</Typography>
          <Typography variant="body2"><b>Agent Logged:</b> {agent}</Typography>
        </Grid>

        {/* INSTALLATION ADDRESS */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" sx={{ color: "#818cf8", display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Home fontSize="small" /> Installation Address
          </Typography>
          <Typography variant="body2">{fullAddress}</Typography>
          {lead.suburb && <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>Suburb: {lead.suburb} | City: {lead.townCity}</Typography>}
        </Grid>

        {/* PACKAGE & FINANCIALS */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ color: "#818cf8", display: "flex", alignItems: "center", gap: 1, mb: 1, mt: 1 }}>
            <ReceiptLong fontSize="small" /> Package & Financial Details
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
            <Chip label={`Package: ${selectedPackage}`} color="primary" variant="outlined" />
            <Chip label={`Price: ${price}`} color="info" />
            <Chip label={`Commission: ${commission}`} color="success" />
          </Stack>
          {lead.additionalComments && (
            <Typography variant="body2" sx={{ mt: 1, color: "#cbd5e1", fontStyle: "italic" }}>
              <b>Notes:</b> "{lead.additionalComments}"
            </Typography>
          )}
        </Grid>

        {/* ATTACHMENTS & DOWNLOADS */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1.5, borderColor: "rgba(255, 255, 255, 0.1)" }} />
          <Typography variant="subtitle2" sx={{ color: "#38bdf8", mb: 1 }}>
            Document Attachments
          </Typography>

          {documentUrl ? (
            <Paper
              sx={{
                p: 1.5,
                bgcolor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="body2" sx={{ color: "#e2e8f0" }}>
                {typeof documentUrl === "string" ? documentUrl.split("/").pop() || "ID_Passport_Copy.pdf" : "ID_Passport_Copy.pdf"}
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                {typeof documentUrl === "string" && documentUrl.startsWith("http") && (
                  <Tooltip title="View Document">
                    <IconButton size="small" onClick={() => window.open(documentUrl, "_blank")} sx={{ color: "#38bdf8" }}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Download Document">
                  <IconButton
                    size="small"
                    onClick={() => handleDownload(documentUrl, `Lead_${idNumber}_ID.pdf`)}
                    sx={{ color: "#4ade80" }}
                  >
                    <Download fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          ) : (
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              No downloadable documents attached to this lead.
            </Typography>
          )}
        </Grid>
      </Grid>

      {/* ACTION FOOTER */}
      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<WhatsApp />}
          sx={{ bgcolor: "#22c55e", "&:hover": { bgcolor: "#16a34a" } }}
          onClick={() => {
            const phone = contact.replace(/\D/g, "");
            const cleanPhone = phone.startsWith("0") ? `27${phone.substring(1)}` : phone;
            const message = `Hello ${fullName},\n\nYour Fibre Application (${selectedPackage}) Status: ${lead.status || "Pending"}.`;
            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
          }}
        >
          WhatsApp
        </Button>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<Email />}
          sx={{ borderColor: "#38bdf8", color: "#38bdf8" }}
          onClick={() => window.open(`mailto:${email}`)}
        >
          Email Customer
        </Button>
      </Box>
    </Paper>
  );
};

export default LeadDetails;