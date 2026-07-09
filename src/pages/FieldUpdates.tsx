
// ==========================================
// 2026 NEXT-GEN FIELD AGENTS INTELLIGENT DASHBOARD
// ==========================================
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Chip,
  Divider,
  Avatar,
  Stack,
  LinearProgress
} from "@mui/material";

import {
  Save,
  Payments,
  WorkspacePremium,
  Wifi,
  Engineering,
  AutoAwesome,

  Insights,
  Description,
  CheckCircle,
  Leaderboard,
  WarningAmber
} from "@mui/icons-material";
import { ref, push, set, update, onValue } from "firebase/database";
import { db } from "../firebase";

const FieldUpdates = () => {
  const [updates, setUpdates] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [agents, setAgents] = useState<any[]>([]);

  // Get current active Month and Year
  const currentMonthIdx = new Date().getMonth(); // 0-11

  const currentYearNum = new Date().getFullYear();
  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  const currentMonthName = monthNames[currentMonthIdx];

  const emptyForm = {
    agentName: "",
    date: new Date().toISOString().split("T")[0],
    visitType: "Attended House",
    customerName: "",
    surname: "",
    idNumber: "",
    phone: "",
    address: "",
    houseNumber: "",
    saleType: "Prepaid",
    packagePlan: "",
    price: "",

    commission: 0,
    adminConfirmation: "Pending",
    status: "Pending",
    comments: ""
  };
  
  const [form, setForm] = useState(emptyForm);

  /* ==========================================
     LOAD AGENTS FROM FIREBASE
  ========================================== */
  useEffect(() => {
    const agentsRef = ref(db, "agents");
    const unsubscribe = onValue(agentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map((key) => ({
          id: key,
          ...data[key]

        }));
        setAgents(list);
      } else {
        setAgents([]);
      }
    });
    return () => unsubscribe();
  }, []);

  /* ==========================================
     LOAD FIELD REPORTS
  ========================================== */
  useEffect(() => {
    const reportsRef = ref(db, "fieldUpdates");
    onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUpdates(
          Object.keys(data)
            .map((key) => ({

              id: key,
              ...data[key]
            }))
            .reverse()
        );
      } else {
        setUpdates([]);
      }
    });
  }, []);

  /* ==========================================
     STRICT FILTERING: CURRENT MONTH & YEAR ONLY
  ========================================== */
  const currentMonthUpdates = useMemo(() => {
    return updates.filter((item: any) => {
      if (!item.date) return false;
      const reportDate = new Date(item.date);
      return (

        reportDate.getMonth() === currentMonthIdx &&
        reportDate.getFullYear() === currentYearNum
      );
    });
  }, [updates, currentMonthIdx, currentYearNum]);

  /* ==========================================
     BEAUTIFUL LIVE STATISTICS (CURRENT MONTH ONLY)
  ========================================== */
  const totalReports = currentMonthUpdates.length;
  const confirmedReports = currentMonthUpdates.filter((x) => x.adminConfirmation === "Confirmed").length;
  const prepaidReports = currentMonthUpdates.filter((x) => x.saleType === "Prepaid").length;

  const contractReports = currentMonthUpdates.filter((x) => x.saleType === "Contract").length;
  const totalCommission = currentMonthUpdates.reduce((t, x) => {
    if (x.adminConfirmation !== "Confirmed") return t;
    return t + Number(x.commission || 0);
  }, 0);

  /* ==========================================
     HANDLE FIELD CHANGES
  ========================================== */
  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  /* ==========================================
     FIXED: OPENSERVE PACKAGE SELECT LOGIC
  ========================================== */
  const handlePackageSelection = (packageName: string) => {
    let estimatedPrice = "";
    let calculatedCommission = 0;

    if (form.saleType === "Prepaid") {
      switch (packageName) {
        case "20/10":
          estimatedPrice = "R349.00 p/m";
          calculatedCommission = 50;
          break;
        case "25/25":
          estimatedPrice = "R499.00 p/m";
          calculatedCommission = 50;
          break;
        case "50/25":
          estimatedPrice = "R700.00 p/m";

          calculatedCommission = 50;
          break;
        default:
          estimatedPrice = "R0.00";
          calculatedCommission = 0;
      }
    } else {
      switch (packageName) {
        case "20/10 Contract":
          estimatedPrice = "R345 x 12";
          calculatedCommission = 200;
          break;
        case "25/25 Contract":
          estimatedPrice = "R499 x 12";
          calculatedCommission = 200;
          break;
        case "40/20 Contract":
          estimatedPrice = "R425 x 12";
          calculatedCommission = 200;
          break;
        case "50/25 Contract":
          estimatedPrice = "R695 x 12";
          calculatedCommission = 200;
          break;

        case "50/50 Contract":
          estimatedPrice = "R805 x 12";
          calculatedCommission = 200;
          break;
        case "100/50 Contract":
          estimatedPrice = "R895 x 12";
          calculatedCommission = 200;
          break;
        case "100/100 Contract":
          estimatedPrice = "R1025 x 12";
          calculatedCommission = 200;
          break;
        case "200/100 Contract":
          estimatedPrice = "R1299 x 12";
          calculatedCommission = 200;
          break;
        case "200/200 Contract":
          estimatedPrice = "R1365 x 12";
          calculatedCommission = 200;
          break;
        case "300/150 Contract":
          estimatedPrice = "R1529 x 12";
          calculatedCommission = 200;
          break;

        case "500/250 Contract":
          estimatedPrice = "R1699 x 12";
          calculatedCommission = 200;
          break;
        default:
          estimatedPrice = "R0.00";
          calculatedCommission = 0;
      }
    }

    setForm((prev) => ({
      ...prev,
      packagePlan: packageName,
      price: estimatedPrice,
      commission: calculatedCommission
    }));
  };

  /* ==========================================
     SAVE / UPDATE REPORT
  =======================================

=== */
  const saveUpdate = async () => {
    if (!form.agentName) {
      alert("Please select an Agent before saving the record.");
      return;
    }
    if (!form.packagePlan) {
      alert("Please choose a valid OpenServe Package Plan.");
      return;
    }

    if (editing) {
      await update(ref(db, `fieldUpdates/${editing}`), form);
      setEditing(null);
    } else {
      const newRef = push(ref(db, "fieldUpdates"));
      await set(newRef, {
        ...form,
        createdAt: new Date().toISOString()
      });
    }

    setForm(emptyForm);
  };

  /* ==========================================
     UI CLIENT FILTER FOR GENERAL LIST VIEW
  ========================================== 
  const searchAndFilteredUpdates = useMemo(() => {
    return currentMonthUpdates.filter((item: any) => {
      const text = `${item.agentName} ${item.customerName} ${item.surname} ${item.phone} ${item.address} ${item.packagePlan}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesAgent = agentFilter === "" || item.agentName === agentFilter;
      return matchesSearch && matchesAgent;
    });

  }, [currentMonthUpdates, search, agentFilter]);*/

  return (
    <Box sx={styles.page}>
      {/* 2026 Immersive Ambient Background */}
      <Box sx={styles.backgroundContainer}>
        <motion.div style={styles.blurOrb1 as any} animate={{ x: [0, 90, 0], y: [0, -60, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div style={styles.blurOrb2 as any} animate={{ x: [0, -80, 0], y: [0, 80, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div style={styles.blurOrb3 as any} animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
      </Box>

      {/* HEADER SECTION */}
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>

        <Paper sx={styles.heroCard}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={3}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Chip label="The Connection Hub" color="secondary" size="small" sx={{ fontWeight: 700, borderRadius: "6px" }} />
                <Typography sx={styles.livePulse}>●OpenServe </Typography>
              </Stack>
              <Typography sx={styles.title}>
                Field <span style={{ color: "#2563eb", textShadow: "0 0 20px rgba(37,99,235,0.4)" }}>Agents</span> 
              </Typography>
              <Typography sx={styles.subtitle}>
                System Overview for <b style={{ color: "#fff" }}>{currentMonthName} {currentYearNum}</b>
              </Typography>
            </Box>

            <Avatar sx={styles.heroAvatar}>
              <Engineering sx={{ fontSize: 38, color: "#fff" }} />
            </Avatar>
          </Stack>
        </Paper>
      </motion.div>

      {/* LIVE MONTHLY STATS GRID */}
      <Grid container spacing={3} mt={1}>
        {[
          { title: "Monthly Reports", value: totalReports, icon: <Description />, color: "#3b82f6" },
          { title: "Confirmed Sales", value: confirmedReports, icon: <CheckCircle />, color: "#10b981" },
          { title: "Prepaid Registrations", value: prepaidReports, icon: <Wifi />, color: "#8b5cf6" },
          { title: "Contract Accounts", value: contractReports, icon: <WorkspacePremium />, color: "#f59e0b" },
          { title: "Earned Commission", value: `R ${totalCommission}`, icon: <Payments />, color: 

"#ec4899" }
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <motion.div whileHover={{ scale: 1.04, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
              <Paper sx={{ ...styles.statCard, borderLeft: `4px solid ${item.color}` }}>
                <Box sx={{ ...styles.statIcon, backgroundColor: `${item.color}15`, color: item.color }}>{item.icon}</Box>
                <Typography sx={styles.statValue}>{item.value}</Typography>
                <Typography sx={styles.statTitle}>{item.title}</Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* PERFORMANCE MAP & AGENT INSIGHTS */}
      <Typography sx={styles.sectionTitle}>

        <Leaderboard sx={{ verticalAlign: "middle", mr: 1, color: "#3b82f6" }} /> Agent Performance Matrix — {currentMonthName}
      </Typography>

      <Grid container spacing={3} mt={0.5}>
        {agents.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={styles.noDataCard}>
              <WarningAmber sx={{ fontSize: 40, color: "#f59e0b", mb: 1 }} />
              <Typography variant="h6">No Registered Core Agents Found</Typography>
              <Typography variant="body2" color="textSecondary">Please add agent records to the main database pool.</Typography>
            </Paper>
          </Grid>
        ) : (
          agents.map((agentObj) => {
            const nameKey = agentObj.fullName || agentObj.id;
            // Filter records specifically belonging to this agent for current month only

            const agentMonthlyReports = currentMonthUpdates.filter((x) => x.agentName === nameKey);
            const confirmed = agentMonthlyReports.filter((x) => x.adminConfirmation === "Confirmed");
            const prepaid = confirmed.filter((x) => x.saleType === "Prepaid").length;
            const contract = confirmed.filter((x) => x.saleType === "Contract").length;
            const commission = confirmed.reduce((t, x) => t + Number(x.commission || 0), 0);

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={agentObj.id}>
                <AnimatePresence mode="wait">
                  <motion.div whileHover={{ scale: 1.03, y: -6 }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                    <Paper sx={styles.agentCard}>
                      <Stack direction="row" spacing={2} alignItems="center">

                        <Avatar sx={styles.agentAvatar}>{nameKey.charAt(0).toUpperCase()}</Avatar>
                        <Box sx={{ width: "calc(100% - 60px)" }}>
                          <Typography sx={styles.agentName} noWrap>{nameKey}</Typography>
                          <Typography variant="caption" sx={{ color: "#94a3b8" }}>Field Operative</Typography>
                        </Box>
                      </Stack>
                      
                      <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.06)" }} />

                      {agentMonthlyReports.length === 0 ? (
                        <Box sx={styles.emptyLeadsWrapper}>
                          <WarningAmber sx={{ color: "#ef4444", fontSize: 20 }} />
                          <Typography sx={styles.emptyLeadsText}>

                            No active leads recorded for this agent in {currentMonthName}.
                          </Typography>
                        </Box>
                      ) : (
                        <>
                          <Stack spacing={1.5}>
                            <Box sx={styles.dataRow}>
                              <Typography className="label">📋 Monthly Reports</Typography>
                              <Typography className="val">{agentMonthlyReports.length}</Typography>
                            </Box>
                            <Box sx={styles.dataRow}>
                              <Typography className="label">👥 Confirmed Sales</Typography>
                              <Typography className="val" style={{ color: "#10b981" }}>{confirmed.length}</Typography>
                            </Box>
                            <Box sx={styles.dataRow}>
                              <Typography className="label">📦 Prepaid Active</Typography>

                              <Typography className="val">{prepaid}</Typography>
                            </Box>
                            <Box sx={styles.dataRow}>
                              <Typography className="label">📑 Contracts Active</Typography>
                              <Typography className="val">{contract}</Typography>
                            </Box>
                            <Box sx={styles.dataRow}>
                              <Typography className="label" style={{ color: "#3b82f6", fontWeight: 700 }}>💰 Est. Commission</Typography>
                              <Typography className="val" style={{ color: "#3b82f6", fontWeight: 700 }}>R {commission}</Typography>
                            </Box>
                          </Stack>

                          <LinearProgress
                            variant="determinate"
                            value={Math.min(agentMonthlyReports.length * 10, 100)}

                            sx={styles.agentProgress}
                          />
                          
                          <Chip
                            sx={styles.agentBadge}
                            color={commission >= 400 ? "success" : "default"}
                            label={commission >= 400 ? "⭐ Top Performer" : "Active Deployment"}
                          />
                        </>
                      )}
                    </Paper>
                  </motion.div>
                </AnimatePresence>
              </Grid>
            );
          })
        )}
      </Grid>

      {/* INTEGRATED CONFIGURATOR & SUBMISSION PANEL */}
      <Grid container spacing={4} mt={2}>

        {/* FORM LEFT */}
        <Grid item xs={12} lg={8}>
          <Typography sx={styles.sectionTitle}>
            <AutoAwesome sx={{ verticalAlign: "middle", mr: 1, color: "#8b5cf6" }} /> Fields Agents Form
          </Typography>
          <Paper sx={styles.formCard}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Field Agent Name"
                  name="agentName"
                  value={form.agentName}
                  onChange={handleChange}
                  sx={styles.input}
                >
                  {agents.map((a) => {
                    const label = a.fullName || a.id;
                    return <MenuItem key={a.id} value={label}>{label}</MenuItem>;
                  })}

                </TextField>
              </Grid>

              <Grid item xs={12} md={6} >
                <TextField
                  fullWidth
                  type="date"
                  label="Visit Date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  sx={styles.input}
                >
                  </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Visit Status"
                  name="visitType"
                  value={form.visitType}
                  onChange={handleChange}

                  sx={styles.input}
                >
                  <MenuItem value="Attended House">🏠 Attended Addresses</MenuItem>
                  <MenuItem value="Unattended House">🚪 Unattended Addresses</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Fibre Deals"
                  name="saleType"
                  value={form.saleType}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      saleType: e.target.value,
                      packagePlan: "",
                      price: "",
                      commission: 0
                    });

                  }}
                  sx={styles.input}
                >
                  <MenuItem value="Prepaid">Prepaid</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                </TextField>
              </Grid>

              {/* DYNAMIC FIXED OPENSERVE DROPDOWN */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="OpenServe Package"
                  name="packagePlan"
                  value={form.packagePlan}
                  onChange={(e) => handlePackageSelection(e.target.value)}
                  sx={styles.input}
                  disabled={!form.saleType}

                >
                  {form.saleType === "Prepaid" ? [
                    <MenuItem key="p1" value="20/10">OpenServe Prepaid 20 / 10 Mbps</MenuItem>,
                    <MenuItem key="p2" value="25/25">OpenServe Prepaid 25 / 25 Mbps</MenuItem>,
                    <MenuItem key="p3" value="50/25">OpenServe Prepaid 50 / 25 Mbps</MenuItem>
                  ] : [
                    <MenuItem key="c1" value="20/10 Contract">OpenServe Home 20/10 Mbps (Contract)</MenuItem>,
                    <MenuItem key="c2" value="25/25 Contract">OpenServe Home 25/25 Mbps (Contract)</MenuItem>,
                    <MenuItem key="c3" value="40/20 Contract">OpenServe Home 40/20 Mbps (Contract)</MenuItem>,
                    <MenuItem key="c4" value="50/25 Contract">OpenServe Home 50/25 Mbps (Contract)</MenuItem>,

                    <MenuItem key="c5" value="50/50 Contract">OpenServe Home 50/50 Mbps (Contract)</MenuItem>,
                    <MenuItem key="c6" value="100/50 Contract">OpenServe Ultra 100/50 Mbps (Contract)</MenuItem>,
                    <MenuItem key="c7" value="100/100 Contract">OpenServe Ultra 100/100 Mbps (Contract)</MenuItem>,
                    <MenuItem key="c8" value="200/100 Contract">OpenServe Hyper 200/100 Mbps (Contract)</MenuItem>,
                    <MenuItem key="c9" value="200/200 Contract">OpenServe Hyper 200/200 Mbps (Contract)</MenuItem>,
                    <MenuItem key="c10" value="300/150 Contract">OpenServe Giga 300/150 Mbps (Contract)</MenuItem>,
                    <MenuItem key="c11" value="500/250 Contract">OpenServe Titan 500/250 Mbps (Contract)</MenuItem>
                  ]}
                </TextField>
              </Grid>


              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  value={form.price || "Total Amount..."}
                  InputProps={{ readOnly: true }}
                  sx={styles.input}
                />
              </Grid>

              {form.visitType === "Attended House" && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Client Name" name="customerName" value={form.customerName} onChange={handleChange} sx={styles.input} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Client Surname" name="surname" value={form.surname} 

onChange={handleChange} sx={styles.input} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="National ID / Passport Number" name="idNumber" value={form.idNumber} onChange={handleChange} sx={styles.input} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Phone Number" name="phone" value={form.phone} onChange={handleChange} sx={styles.input} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Installation Address" name="address" value={form.address} onChange={handleChange} sx={styles.input} />
                  </Grid>
                </>
              )}

              <Grid item xs={12} md={6}>

                <TextField
                  select
                  fullWidth
                  label="Feedback"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  sx={styles.input}
                >
                  <MenuItem value="No Elderly People">No Elderly People</MenuItem>
                  <MenuItem value="Already Connected">Already Connected</MenuItem>
                  <MenuItem value="Follow Up">Follow-Up</MenuItem>
                  <MenuItem value="Not Interested">Not Interested</MenuItem>
                  <MenuItem value="Interested">Interested</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth multiline rows={3} label="Field Feedback Log" name="comments" value={form.comments} onChange={handleChange} sx={styles.input} />
              </Grid>

              <Grid item xs={12}>
                <Button variant="contained" fullWidth onClick={saveUpdate} sx={styles.submitBtn}>
                  <Save sx={{ mr: 1 }} /> {editing ? "Update System" : "Commit New Field Record"}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* FINANCIAL REAL-TIME PREVIEW RIGHT */}
        <Grid item xs={12} lg={4}>
          <Typography sx={styles.sectionTitle}>
            <Insights sx={{ verticalAlign: "middle", mr: 1, color: "#ec4899" }} /> Live Payout Ledger Preview
          </Typography>
          <Paper sx={styles.commissionCard}>
            <Typography variant="overline" display="block" sx={{ color: "#94a3b8", fontWeight: 700 }}>

              Calculated Payout Unit
            </Typography>
            <Typography sx={styles.commissionValue}>
              R {form.commission || 0}
            </Typography>
            <Typography variant="body2" sx={{ color: "#3b82f6", mt: 1, fontWeight: 500 }}>
              Target Rate Selected: {form.price || "None"}
            </Typography>
            <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.08)" }} />
            <Typography variant="caption" color="textSecondary" sx={{ lineHeight: 1.4, display: "block" }}>
              💡 Commissions instantly update based on audited administrative approvals. Prepaid cycles yield a foundational R50, while Contract conversions calculate at R200.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>

  );
};

/* ==========================================
   ADVANCED 2026 CLASSY GLASS-MORPHISM UI STYLES
========================================== */
const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#030712",
    color: "#f3f4f6",
    padding: "32px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', sans-serif"
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,

    right: 0,
    bottom: 0,
    zIndex: 0,
    pointerEvents: "none"
  },
  blurOrb1: {
    position: "absolute",
    width: "450px",
    height: "450px",
    background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, rgba(0,0,0,0) 70%)",
    top: "-10%",
    left: "10%",
    filter: "blur(60px)"
  },
  blurOrb2: {
    position: "absolute",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(0,0,0,0) 70%)",
    bottom: "5%",
    right: "5%",
    filter: "blur(80px)"

  },
  blurOrb3: {
    position: "absolute",
    width: "350px",
    height: "350px",
    background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, rgba(0,0,0,0) 60%)",
    top: "40%",
    left: "50%",
    filter: "blur(50px)"
  },
  heroCard: {
    position: "relative",
    zIndex: 1,
    background: "linear-gradient(135deg, rgba(17, 24, 39, 0.7) 0%, rgba(31, 41, 55, 0.5) 100%)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.07)",
    borderRadius: "16px",
    padding: "24px 32px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
  },
  title: {
    fontSize: "2.2rem",

    fontWeight: 900,
    letterSpacing: "-0.03em",
    color: "#fff",
    marginTop: "4px"
  },
  subtitle: {
    fontSize: "1.05rem",
    color: "#94a3b8",
    marginTop: "4px",
    fontWeight: 400
  },
  livePulse: {
    fontSize: "0.78rem",
    color: "#10b981",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  heroAvatar: {
    width: 70,
    height: 70,
    background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
    boxShadow: "0 0 25px rgba(37,99,235,0.4)"

  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#fff",
    marginTop: "40px",
    marginBottom: "16px",
    letterSpacing: "-0.01em",
    position: "relative",
    zIndex: 1
  },
  statCard: {
    position: "relative",
    zIndex: 1,
    background: "rgba(17, 24, 39, 0.65)",
    backdropFilter: "blur(12px)",
    borderRadius: "14px",
    padding: "20px",
    height: "100%",
    boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
    border: "1px solid rgba(255,255,255,0.04)"
  },
  statIcon: {
    width: "42px",

    height: "42px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px"
  },
  statValue: {
    fontSize: "1.65rem",
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "-0.02em"
  },
  statTitle: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    fontWeight: 500,
    marginTop: "2px"
  },
  agentCard: {
    position: "relative",
    zIndex: 1,
    background: "linear-gradient(145deg, rgba(17, 24, 39, 0.8) 0%, rgba(22, 32, 51, 0.65) 100%)",

    backdropFilter: "blur(14px)",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
    border: "1px solid rgba(255,255,255,0.05)"
  },
  agentAvatar: {
    width: 44,
    height: 44,
    fontSize: "1.1rem",
    fontWeight: 700,
    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    color: "#fff"
  },
  agentName: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#fff"
  },
  dataRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    "& .label": { fontSize: "0.88rem", color: "#94a3b8" },
    "& .val": { fontSize: "0.88rem", fontWeight: 600, color: "#fff" }
  },
  agentProgress: {
    marginTop: "20px",
    height: "6px",
    borderRadius: "4px",
    backgroundColor: "rgba(255,255,255,0.05)",
    "& .MuiLinearProgress-bar": {
      background: "linear-gradient(90deg, #3b82f6, #8b5cf6)"
    }
  },
  agentBadge: {
    marginTop: "16px",
    width: "100%",
    fontWeight: 700,
    borderRadius: "8px",
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    color: "#fff"
  },

  emptyLeadsWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 12px",
    backgroundColor: "rgba(239, 68, 68, 0.04)",
    border: "1px dashed rgba(239, 68, 68, 0.2)",
    borderRadius: "10px",
    marginTop: "8px"
  },
  emptyLeadsText: {
    fontSize: "0.82rem",
    color: "#f87171",
    textAlign: "center",
    marginTop: "8px",
    fontWeight: 500,
    lineHeight: 1.4
  },
  formCard: {
    position: "relative",
    zIndex: 1,
    background: "rgba(17, 24, 39, 0.5)",
    backdropFilter: "blur(16px)",

    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    border: "1px solid rgba(255,255,255,0.05)"
  },
  input: {
    "& .MuiOutlinedInput-root": {
      color: "#fff",
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      borderRadius: "10px",
      "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
      "&.Mui-focused fieldset": { borderColor: "#2563eb" }
    },
    "& .MuiInputLabel-root": { color: "#94a3b8" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" }
  },
  submitBtn: {
    background: "linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)",

    color: "#fff",
    fontWeight: 700,
    padding: "14px",
    borderRadius: "10px",
    fontSize: "0.98rem",
    textTransform: "none",
    boxShadow: "0 10px 25px rgba(37,99,235,0.3)",
    "&:hover": {
      background: "linear-gradient(90deg, #1d4ed8 0%, #6d28d9 100%)",
      boxShadow: "0 12px 30px rgba(37,99,235,0.45)"
    }
  },
  commissionCard: {
    position: "relative",
    zIndex: 1,
    background: "linear-gradient(135deg, rgba(236,72,153,0.05) 0%, rgba(139,92,246,0.05) 100%)",
    backdropFilter: "blur(16px)",
    borderRadius: "16px",
    padding: "28px",
    border: "1px solid rgba(236,72,153,0.15)",

    boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
    textAlign: "center"
  },
  commissionValue: {
    fontSize: "3rem",
    fontWeight: 900,
    background: "linear-gradient(90deg, #ec4899, #8b5cf6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.03em",
    margin: "8px 0"
  },
  noDataCard: {
    padding: "40px",
    textAlign: "center",
    background: "rgba(17, 24, 39, 0.4)",
    borderRadius: "14px",
    border: "1px dashed rgba(255,255,255,0.08)"
  }
};

export default FieldUpdates;
