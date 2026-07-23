import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
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

interface AttachmentLeadData {
  id?: string;
  technicianOrSalesAgent: string;
  contractDocName?: string | null;
  idCopyDocName?: string | null;
  bankStatementDocName?: string | null;
  proofOfAddressDocName?: string | null;
  status?: string;
  agentLogged?: string;
  submittedAt?: string;
}

const FieldUpdatesAttachments = () => {
  const [activeAgentName, setActiveAgentName] = useState("");
  const [agentNameInput, setAgentNameInput] = useState("");

  // Realtime leads list & UI states
  const [leadsList, setLeadsList] = useState<AttachmentLeadData[]>([]);
  const [showApplications, setShowApplications] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // View Details Modal State
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedLeadDetails, setSelectedLeadDetails] = useState<AttachmentLeadData | null>(null);

  // Delete modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<AttachmentLeadData | null>(null);
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
      setAgentNameInput(savedAgent);
    }

    // Subscribe to Realtime Database node for attachmentFibreLeads
    const leadsRef = ref(db, "attachmentFibreLeads");
    const unsubscribe = onValue(leadsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedLeads: AttachmentLeadData[] = Object.keys(data).map((key) => ({
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

    const currentAgent = activeAgentName || agentNameInput;

    if (!currentAgent) {
      alert("Please provide the Sales Agent / Technician Name.");
      return;
    }

    // Compulsory Attachments Check for new submissions
    if (!editingId) {
      if (!files.contractDoc) {
        alert("Please upload the Contract Document (Compulsory).");
        return;
      }
      if (!files.idCopyDoc) {
        alert("Please upload the ID Copy (Compulsory).");
        return;
      }
    }

    try {
      if (editingId) {
        // UPDATE Existing Application
        const leadRef = ref(db, `attachmentFibreLeads/${editingId}`);
        await update(leadRef, {
          technicianOrSalesAgent: currentAgent,
          agentLogged: currentAgent,
          updatedAt: new Date().toISOString(),
          ...(files.contractDoc && { contractDocName: files.contractDoc.name }),
          ...(files.idCopyDoc && { idCopyDocName: files.idCopyDoc.name }),
          ...(files.bankStatementDoc && { bankStatementDocName: files.bankStatementDoc.name }),
          ...(files.proofOfAddressDoc && { proofOfAddressDocName: files.proofOfAddressDoc.name }),
        });
        alert("Attachment record updated successfully!");
        setEditingId(null);
      } else {
        // CREATE New Application Record
        const leadsRef = ref(db, "attachmentFibreLeads");
        const newLeadRef = push(leadsRef);

        const payload = {
          technicianOrSalesAgent: currentAgent,
          agentLogged: currentAgent,
          status: "Pending Vetting",
          submittedAt: new Date().toISOString(),
          contractDocName: files.contractDoc ? files.contractDoc.name : null,
          idCopyDocName: files.idCopyDoc ? files.idCopyDoc.name : null,
          bankStatementDocName: files.bankStatementDoc ? files.bankStatementDoc.name : null,
          proofOfAddressDocName: files.proofOfAddressDoc ? files.proofOfAddressDoc.name : null,
        };

        await set(newLeadRef, payload);
        alert("Documents uploaded successfully!");
      }

      // Reset form
      setFiles({
        contractDoc: null,
        idCopyDoc: null,
        bankStatementDoc: null,
        proofOfAddressDoc: null,
      });
    } catch (err: any) {
      alert("Error saving attachment record: " + err.message);
    }
  };

  // Edit Handler
  const handleEdit = (lead: AttachmentLeadData) => {
    setEditingId(lead.id || null);
    setAgentNameInput(lead.technicianOrSalesAgent || lead.agentLogged || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // View Details Modal Handler
  const handleViewDetails = (lead: AttachmentLeadData) => {
    setSelectedLeadDetails(lead);
    setViewDetailsOpen(true);
  };

  // Cancel Edit Mode
  const handleCancelEdit = () => {
    setEditingId(null);
    setFiles({
      contractDoc: null,
      idCopyDoc: null,
      bankStatementDoc: null,
      proofOfAddressDoc: null,
    });
  };

  // Delete Confirmation Handlers
  const handleDeleteClick = (lead: AttachmentLeadData) => {
    setLeadToDelete(lead);
    setConfirmNameInput("");
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!leadToDelete || !leadToDelete.id) return;
    try {
      const targetRef = ref(db, `attachmentFibreLeads/${leadToDelete.id}`);
      await remove(targetRef);
      alert("Record deleted successfully.");
      setDeleteDialogOpen(false);
      setLeadToDelete(null);
      setConfirmNameInput("");
    } catch (err: any) {
      alert("Failed to delete record: " + err.message);
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

  const expectedAgentToDelete = leadToDelete
    ? (leadToDelete.technicianOrSalesAgent || leadToDelete.agentLogged || "System Agent")
    : "";

  return (
    <Box sx={styles.container}>
      <Paper sx={styles.card}>
        {/* FORM HEADER */}
        <Typography variant="h4" fontWeight="900" textAlign="center" sx={{ color: "#fff", mb: 1 }}>
          {editingId ? "Edit Lead Attachments" : "Upload Contract Lead Attachments"}
        </Typography>

        <Typography textAlign="center" sx={{ color: "#94a3b8", mb: 1, fontSize: 14 }}>
          Complete the form for pre-vetting | You may also request manual application form by emailing us on{" "}
          <span style={{ color: "#3b82f6" }}>pitsok@telkom.co.za</span>
        </Typography>

        <Typography textAlign="center" sx={{ color: "#cbd5e1", mb: 3, fontSize: 13, fontWeight: "bold" }}>
          Office: 051 401 6514 / 6816 | WhatsApp: 068 593 2102 / 073 895 4522 | Openserve Fibre Team
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
            Editing Attachment Lead Record ID: <b>{editingId}</b>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* AGENT NAME FIELD */}
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Sales Agent / Technician Name *"
                name="agentNameInput"
                value={activeAgentName || agentNameInput}
                onChange={(e) => setAgentNameInput(e.target.value)}
                sx={styles.input}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.1)" }} />
              <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold", mb: 1 }}>
                Document Uploads
              </Typography>
            </Grid>

            {/* CONTRACT DOCUMENT (COMPULSORY) */}
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<UploadFile />}
                sx={styles.uploadBtn}
              >
                Upload Contract Document * (Compulsory)
                <input type="file" hidden name="contractDoc" onChange={handleFileChange} />
              </Button>
              {files.contractDoc && (
                <Typography variant="caption" sx={{ color: "#10b981", mt: 0.5, display: "block" }}>
                  Selected: {files.contractDoc.name}
                </Typography>
              )}
            </Grid>

            {/* ID COPY (COMPULSORY) */}
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<UploadFile />}
                sx={styles.uploadBtn}
              >
                Upload ID Copy * (Compulsory)
                <input type="file" hidden name="idCopyDoc" onChange={handleFileChange} />
              </Button>
              {files.idCopyDoc && (
                <Typography variant="caption" sx={{ color: "#10b981", mt: 0.5, display: "block" }}>
                  Selected: {files.idCopyDoc.name}
                </Typography>
              )}
            </Grid>

            {/* BANK STATEMENT (OPTIONAL) */}
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

            {/* PROOF OF ADDRESS (OPTIONAL) */}
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

            {/* SUBMIT BUTTON */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                startIcon={<Send />}
                sx={styles.submitButton}
              >
                {editingId ? "Update Attachment Details" : "Submit Attached Documents"}
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
            {showApplications ? "Hide My Attachment Records" : `View My Attachment Records (${userLeads.length})`}
          </Button>
        </Box>

        {/* TABLE SECTION - FILTERED TO LOGGED IN AGENT ONLY */}
        {showApplications && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ color: "#fff", mb: 2, fontWeight: "bold" }}>
              My Attachment Submissions
            </Typography>

            <TableContainer component={Paper} sx={styles.tableContainer}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  <TableRow>
                    <TableCell sx={styles.th}>Agent Name</TableCell>
                    <TableCell sx={styles.th}>Contract Attached</TableCell>
                    <TableCell sx={styles.th}>ID Copy Attached</TableCell>
                    <TableCell sx={styles.th}>Other Attachments</TableCell>
                    <TableCell sx={styles.th}>Status</TableCell>
                    <TableCell sx={styles.th} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ color: "#94a3b8", py: 3 }}>
                        No attachment records found for your account.
                      </TableCell>
                    </TableRow>
                  ) : (
                    userLeads.map((lead) => (
                      <TableRow key={lead.id} sx={{ "&:hover": { backgroundColor: "rgba(255,255,255,0.02)" } }}>
                        <TableCell sx={styles.td}>
                          {lead.technicianOrSalesAgent || lead.agentLogged || "N/A"}
                        </TableCell>
                        <TableCell sx={styles.td}>
                          {lead.contractDocName ? (
                            <span style={{ color: "#10b981" }}>✓ {lead.contractDocName}</span>
                          ) : (
                            <span style={{ color: "#ef4444" }}>Missing</span>
                          )}
                        </TableCell>
                        <TableCell sx={styles.td}>
                          {lead.idCopyDocName ? (
                            <span style={{ color: "#10b981" }}>✓ {lead.idCopyDocName}</span>
                          ) : (
                            <span style={{ color: "#ef4444" }}>Missing</span>
                          )}
                        </TableCell>
                        <TableCell sx={styles.td}>
                          <small style={{ color: "#94a3b8" }}>
                            Bank: {lead.bankStatementDocName ? "Yes" : "No"}<br />
                            Proof of Addr: {lead.proofOfAddressDocName ? "Yes" : "No"}
                          </small>
                        </TableCell>
                        <TableCell sx={styles.td}>
                          <Chip
                            label={lead.status || "Pending Vetting"}
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
          Attachment Lead Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedLeadDetails && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography variant="subtitle2" sx={{ color: "#60a5fa" }}>Submission Information</Typography>
              <Typography variant="body2">
                <b>Sales Agent / Technician:</b> {selectedLeadDetails.technicianOrSalesAgent || selectedLeadDetails.agentLogged || "N/A"}
              </Typography>
              <Typography variant="body2">
                <b>Status:</b> {selectedLeadDetails.status || "Pending Vetting"}
              </Typography>
              <Typography variant="body2">
                <b>Submitted At:</b> {selectedLeadDetails.submittedAt ? new Date(selectedLeadDetails.submittedAt).toLocaleString() : "N/A"}
              </Typography>

              <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.08)" }} />

              <Typography variant="subtitle2" sx={{ color: "#60a5fa" }}>Uploaded Documents</Typography>
              <Typography variant="body2">
                <b>Contract Document:</b> {selectedLeadDetails.contractDocName || "Not Uploaded"}
              </Typography>
              <Typography variant="body2">
                <b>ID Copy:</b> {selectedLeadDetails.idCopyDocName || "Not Uploaded"}
              </Typography>
              <Typography variant="body2">
                <b>Bank Statement:</b> {selectedLeadDetails.bankStatementDocName || "Not Uploaded"}
              </Typography>
              <Typography variant="body2">
                <b>Proof of Address:</b> {selectedLeadDetails.proofOfAddressDocName || "Not Uploaded"}
              </Typography>
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
            To confirm deletion, please type the exact Agent name below:
            <br />
            <b style={{ color: "#f59e0b" }}>{expectedAgentToDelete}</b>
          </Typography>
          <TextField
            fullWidth
            placeholder="Type agent name to confirm"
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
            disabled={confirmNameInput.trim().toLowerCase() !== expectedAgentToDelete.toLowerCase()}
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

export default FieldUpdatesAttachments;