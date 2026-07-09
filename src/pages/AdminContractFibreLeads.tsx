import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Tooltip,
  Stack
} from "@mui/material";

import {
  Search,
  Phone,
  Email,
  WhatsApp,
  CheckCircle,
  Pending,
  Delete,
  Visibility,
  Paid,
  Assignment,
  Refresh,
  Notifications
} from "@mui/icons-material";

import { motion } from "framer-motion";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ChartTooltip,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis
} from "recharts";

import {
  ref,
  onValue,
  update,
  remove
} from "firebase/database";

import { db } from "../firebase";

const AdminContractFibreLeads = () => {

  const [leads, setLeads] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [openDetails, setOpenDetails] = useState(false);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  useEffect(() => {

    const unsub = onValue(ref(db, "contractFibreLeads"), snap => {

      const data = snap.val();

      if (data) {

        setLeads(
          Object.keys(data)
            .map(key => ({
              id: key,
              ...data[key]
            }))
            .reverse()
        );

      } else {

        setLeads([]);

      }

    });

    return () => unsub();

  }, []);

  useEffect(() => {

    const unsub = onValue(ref(db, "agents"), snap => {

      const data = snap.val();

      if (data) {

        setAgents(
          Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }))
        );

      } else {

        setAgents([]);

      }

    });

    return () => unsub();

  }, []);

  const filteredLeads = useMemo(() => {

    return leads.filter((lead: any) => {

      const text = `
      ${lead.firstName}
      ${lead.lastName}
      ${lead.phone}
      ${lead.email}
      ${lead.address}
      ${lead.idNumber}
      ${lead.agentName}
      ${lead.packagePlan}
      `.toLowerCase();

      return (

        text.includes(search.toLowerCase())

        &&

        (
          agentFilter === "" ||
          lead.agentName === agentFilter
        )

        &&

        (
          statusFilter === "" ||
          (lead.adminStatus || "Pending") === statusFilter
        )

        &&

        (
          monthFilter === "" ||
          new Date(lead.createdAt).getMonth() === Number(monthFilter)
        )

        &&

        (
          yearFilter === "" ||
          new Date(lead.createdAt).getFullYear() === Number(yearFilter)
        )
      )

    });

  }, [
    leads,
    search,
    agentFilter,
    statusFilter,
    monthFilter,
    yearFilter
  ]);

  const totalApplications = filteredLeads.length;

  const approved = filteredLeads.filter(
    x => x.adminStatus === "Approved"
  ).length;

  const pending = filteredLeads.filter(
    x =>
      !x.adminStatus ||
      x.adminStatus === "Pending"
  ).length;

  const rejected = filteredLeads.filter(
    x => x.adminStatus === "Rejected"
  ).length;

  const revenue = approved * 200;

  const performanceData = agents.map((agent: any) => {

    const list = filteredLeads.filter(
      x => x.agentName === agent.name
    );

    return {

      agent: agent.name,

      Applications: list.length,

      Approved: list.filter(
        x => x.adminStatus === "Approved"
      ).length,

      Revenue:
        list.filter(
          x => x.adminStatus === "Approved"
        ).length * 200

    };

  });

  const pieData = [

    {
      name: "Approved",
      value: approved
    },

    {
      name: "Pending",
      value: pending
    },

    {
      name: "Rejected",
      value: rejected
    }

  ];

  const approveLead = (id: string) => {

    update(
      ref(db, `contractFibreLeads/${id}`),
      {
        adminStatus: "Approved",
        approvedDate: new Date().toISOString()
      }
    );

  };

  const rejectLead = (id: string) => {

    update(
      ref(db, `contractFibreLeads/${id}`),
      {
        adminStatus: "Rejected"
      }
    );

  };

  const deleteLead = (id: string) => {

    remove(
      ref(db, `contractFibreLeads/${id}`)
    );

  };

  const openLead = (lead: any) => {

    setSelectedLead(lead);
    setOpenDetails(true);

  };

  return (

<Box sx={styles.page}>

{/* ===============================
        Animated Background
================================ */}

<Box sx={styles.background}>

  <motion.div
    animate={{ x:[0,80,0], y:[0,-60,0] }}
    transition={{ duration:14, repeat:Infinity }}
    style={styles.circle1}
  />

  <motion.div
    animate={{ x:[0,-120,0], y:[0,80,0] }}
    transition={{ duration:18, repeat:Infinity }}
    style={styles.circle2}
  />

  <motion.div
    animate={{ scale:[1,1.2,1] }}
    transition={{ duration:12, repeat:Infinity }}
    style={styles.circle3}
  />

</Box>

{/* ======================================
                HEADER
====================================== */}

<motion.div

initial={{opacity:0,y:-60}}

animate={{opacity:1,y:0}}

transition={{duration:1}}

>

<Paper sx={styles.headerCard}>

<Grid container spacing={3} alignItems="center">

<Grid item xs={12} md={8}>

<Typography sx={styles.title}>

OpenServe Contract Fibre Leads

</Typography>

<motion.div

animate={{x:[0,25,0]}}

transition={{
duration:6,
repeat:Infinity
}}

>

<Typography sx={styles.subtitle}>

2026 Contract Fibre Administration Dashboard

Manage applications, approve customers,
assign agents and monitor performance
in real time.

</Typography>

</motion.div>

</Grid>

<Grid item xs={12} md={4}>

<Box sx={styles.headerRight}>

<Badge
badgeContent={pending}
color="warning"
>

<Notifications
sx={{
fontSize:45,
color:"#fff"
}}
/>

</Badge>

<Typography
fontWeight={700}
color="white"
>

{pending} Pending Reviews

</Typography>

</Box>

</Grid>

</Grid>

</Paper>

</motion.div>

{/* ======================================
            SUMMARY CARDS
====================================== */}

<Grid container spacing={3} mt={2}>

<Grid item xs={12} md={3}>

<motion.div whileHover={{scale:1.05}}>

<Paper sx={styles.summaryCard}>

<Assignment sx={styles.summaryIcon}/>

<Typography>

Applications

</Typography>

<Typography sx={styles.summaryValue}>

{totalApplications}

</Typography>

</Paper>

</motion.div>

</Grid>

<Grid item xs={12} md={3}>

<motion.div whileHover={{scale:1.05}}>

<Paper sx={styles.summaryCard}>

<CheckCircle
sx={{
...styles.summaryIcon,
color:"#22c55e"
}}
/>

<Typography>

Approved

</Typography>

<Typography sx={styles.summaryValue}>

{approved}

</Typography>

</Paper>

</motion.div>

</Grid>

<Grid item xs={12} md={3}>

<motion.div whileHover={{scale:1.05}}>

<Paper sx={styles.summaryCard}>

<Pending
sx={{
...styles.summaryIcon,
color:"#f59e0b"
}}
/>

<Typography>

Pending

</Typography>

<Typography sx={styles.summaryValue}>

{pending}

</Typography>

</Paper>

</motion.div>

</Grid>

<Grid item xs={12} md={3}>

<motion.div whileHover={{scale:1.05}}>

<Paper sx={styles.summaryCard}>

<Paid
sx={{
...styles.summaryIcon,
color:"#00bcd4"
}}
/>

<Typography>

Revenue

</Typography>

<Typography sx={styles.summaryValue}>

R {revenue.toLocaleString()}

</Typography>

</Paper>

</motion.div>

</Grid>

</Grid>

{/* ======================================
                CHARTS
====================================== */}

<Grid container spacing={3} mt={2}>

<Grid item xs={12} md={6}>

<Paper sx={styles.glassCard}>

<Typography
variant="h6"
fontWeight={700}
mb={2}
>

Applications Status

</Typography>

<ResponsiveContainer
width="100%"
height={300}
>

<PieChart>

<Pie

data={pieData}

dataKey="value"

outerRadius={110}

label

>

<Cell fill="#22c55e"/>

<Cell fill="#f59e0b"/>

<Cell fill="#ef4444"/>

</Pie>

<ChartTooltip/>

</PieChart>

</ResponsiveContainer>

</Paper>

</Grid>

<Grid item xs={12} md={6}>

<Paper sx={styles.glassCard}>

<Typography
variant="h6"
fontWeight={700}
mb={2}
>

Agent Performance

</Typography>

<ResponsiveContainer
width="100%"
height={300}
>

<BarChart
data={performanceData}
>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="agent"/>

<YAxis/>

<ChartTooltip/>

<Bar
dataKey="Approved"
fill="#2563eb"
/>

</BarChart>

</ResponsiveContainer>

</Paper>

</Grid>

</Grid>

{/* ======================================
               FILTERS
====================================== */}

<Paper sx={styles.filterCard}>

<Grid container spacing={2}>

<Grid item xs={12} md={3}>

<TextField

fullWidth

placeholder="Search customer..."

value={search}

onChange={(e)=>setSearch(e.target.value)}

InputProps={{

startAdornment:(

<InputAdornment position="start">

<Search/>

</InputAdornment>

)

}}

sx={styles.input}

/>

</Grid>

<Grid item xs={12} md={2}>

<TextField

select

fullWidth

label="Agent"

value={agentFilter}

onChange={(e)=>setAgentFilter(e.target.value)}

sx={styles.input}

>

<MenuItem value="">

All Agents

</MenuItem>

{

agents.map((agent:any)=>(

<MenuItem
key={agent.id}
value={agent.name}
>

{agent.name}

</MenuItem>

))

}

</TextField>

</Grid>

<Grid item xs={12} md={2}>

<TextField

select

fullWidth

label="Status"

value={statusFilter}

onChange={(e)=>setStatusFilter(e.target.value)}

sx={styles.input}

>

<MenuItem value="">All</MenuItem>

<MenuItem value="Pending">Pending</MenuItem>

<MenuItem value="Approved">Approved</MenuItem>

<MenuItem value="Rejected">Rejected</MenuItem>

</TextField>

</Grid>


<Grid item xs={12} md={2}>

<TextField
    select
    fullWidth
    label="Month"
    value={monthFilter}
    onChange={(e)=>setMonthFilter(e.target.value)}
    sx={styles.input}
>

<MenuItem value="">
All Months
</MenuItem>

{
months.map((m,index)=>(
<MenuItem
key={m}
value={index}
>
{m}
</MenuItem>
))
}

</TextField>

</Grid>

<Grid item xs={12} md={2}>

<TextField
fullWidth
label="Year"
placeholder="2026"
value={yearFilter}
onChange={(e)=>setYearFilter(e.target.value)}
sx={styles.input}
/>

</Grid>

<Grid item xs={12} md={1}>

<Button
fullWidth
variant="contained"
startIcon={<Refresh/>}
sx={styles.refreshBtn}
onClick={()=>{
setSearch("");
setAgentFilter("");
setStatusFilter("");
setMonthFilter("");
setYearFilter("");
}}
>

Reset

</Button>

</Grid>

</Grid>

</Paper>

{/* ======================================
        CONTRACT APPLICATIONS
====================================== */}

<Paper sx={styles.glassCard}>

<Box
display="flex"
justifyContent="space-between"
alignItems="center"
mb={3}
>

<Typography
variant="h5"
fontWeight={700}
>

📋 Contract Fibre Applications

</Typography>

<Chip
color="primary"
label={`${filteredLeads.length} Applications`}
/>

</Box>

<TableContainer>

<Table>

<TableHead>

<TableRow>

<TableCell>Customer</TableCell>

<TableCell>Package</TableCell>

<TableCell>Agent</TableCell>

<TableCell>Status</TableCell>

<TableCell>Date</TableCell>

<TableCell align="center">
Contact
</TableCell>

<TableCell align="center">
Actions
</TableCell>

</TableRow>

</TableHead>

<TableBody>

{

filteredLeads.map((lead:any)=>(

<TableRow
hover
key={lead.id}
>

<TableCell>

<Typography fontWeight={700}>

{lead.firstName} {lead.lastName}

</Typography>

<Typography
variant="body2"
color="text.secondary"
>

{lead.email}

</Typography>

</TableCell>

<TableCell>

{lead.packagePlan}

</TableCell>

<TableCell>

{lead.agentName || "Unassigned"}

</TableCell>

<TableCell>

<Chip

label={lead.adminStatus || "Pending"}

color={

lead.adminStatus==="Approved"

?

"success"

:

lead.adminStatus==="Rejected"

?

"error"

:

"warning"

}

/>

</TableCell>

<TableCell>

{

lead.createdAt

?

new Date(lead.createdAt).toLocaleDateString()

:

"-"

}

</TableCell>

<TableCell align="center">

<Tooltip title="WhatsApp">

<IconButton

color="success"

onClick={()=>

window.open(

`https://wa.me/27${lead.phone?.replace(/^0/,"")}`,

"_blank"

)

}

>

<WhatsApp/>

</IconButton>

</Tooltip>

<Tooltip title="Call">

<IconButton

color="primary"

onClick={()=>

window.open(`tel:${lead.phone}`)

}

>

<Phone/>

</IconButton>

</Tooltip>

<Tooltip title="Email">

<IconButton

color="secondary"

onClick={()=>

window.open(`mailto:${lead.email}`)

}

>

<Email/>

</IconButton>

</Tooltip>

</TableCell>

<TableCell align="center">

<Stack
direction="row"
spacing={1}
justifyContent="center"
>

<Button
size="small"
variant="contained"
color="info"
onClick={()=>openLead(lead)}
>

<Visibility/>

</Button>

<Button
size="small"
variant="contained"
color="success"
onClick={()=>approveLead(lead.id)}
>

Approve

</Button>

<Button
size="small"
variant="contained"
color="error"
onClick={()=>rejectLead(lead.id)}
>

Reject

</Button>

<IconButton
color="error"
onClick={()=>deleteLead(lead.id)}
>

<Delete/>

</IconButton>

</Stack>

</TableCell>

</TableRow>

))

}

</TableBody>

</Table>

</TableContainer>

</Paper>

{/* ======================================
        CUSTOMER DETAILS DIALOG
====================================== */}

<Dialog
open={openDetails}
onClose={()=>setOpenDetails(false)}
maxWidth="md"
fullWidth
PaperProps={{
sx:{
borderRadius:5,
background:"linear-gradient(135deg,#ffffff,#f8fbff)"
}
}}
>

<DialogTitle
sx={{
background:"linear-gradient(90deg,#0057ff,#00b4ff)",
color:"#fff",
fontWeight:700
}}
>

📄 Contract Fibre Application Details

</DialogTitle>

<DialogContent sx={{mt:3}}>

{

selectedLead && (

<Grid container spacing={3}>

<Grid item xs={12} md={6}>

<Typography fontWeight={700}>
Customer
</Typography>

<Typography>

{selectedLead.firstName} {selectedLead.lastName}

</Typography>

</Grid>

<Grid item xs={12} md={6}>

<Typography fontWeight={700}>
ID Number
</Typography>

<Typography>

{selectedLead.idNumber}

</Typography>

</Grid>

<Grid item xs={12} md={6}>

<Typography fontWeight={700}>
Phone
</Typography>

<Typography>

{selectedLead.phone}

</Typography>

</Grid>

<Grid item xs={12} md={6}>

<Typography fontWeight={700}>
Email
</Typography>

<Typography>

{selectedLead.email}

</Typography>

</Grid>

<Grid item xs={12} md={6}>

<Typography fontWeight={700}>
Address
</Typography>

<Typography>

{selectedLead.address}

</Typography>

</Grid>

<Grid item xs={12} md={6}>

<Typography fontWeight={700}>
Suburb
</Typography>

<Typography>

{selectedLead.suburb}

</Typography>

</Grid>

<Grid item xs={12} md={6}>

<Typography fontWeight={700}>
City
</Typography>

<Typography>

{selectedLead.city}

</Typography>

</Grid>

<Grid item xs={12} md={6}>

<Typography fontWeight={700}>
Province
</Typography>

<Typography>

{selectedLead.province}

</Typography>

</Grid>

<Grid item xs={12} md={6}>

<Typography fontWeight={700}>
Package
</Typography>

<Typography>

{selectedLead.packagePlan}

</Typography>

</Grid>

<Grid item xs={12} md={6}>

<Typography fontWeight={700}>
Agent
</Typography>

<Typography>

{selectedLead.agentName || "Not Assigned"}

</Typography>

</Grid>

<Grid item xs={12} md={6}>

<Typography fontWeight={700}>
Application Date
</Typography>

<Typography>

{
selectedLead.createdAt
?
new Date(selectedLead.createdAt).toLocaleString()
:
"-"
}

</Typography>

</Grid>

<Grid item xs={12} md={6}>

<Typography fontWeight={700}>
Status
</Typography>

<Chip

label={selectedLead.adminStatus || "Pending"}

color={
selectedLead.adminStatus==="Approved"
?
"success"
:
selectedLead.adminStatus==="Rejected"
?
"error"
:
"warning"
}

/>

</Grid>

<Grid item xs={12}>

<Typography fontWeight={700}>
Additional Notes
</Typography>

<Typography>

{selectedLead.notes || "No notes available."}

</Typography>

</Grid>

</Grid>

)

}

</DialogContent>

<DialogActions>

<Button
onClick={()=>setOpenDetails(false)}
>

Close

</Button>

<Button
variant="contained"
color="success"
onClick={()=>{
approveLead(selectedLead.id);
setOpenDetails(false);
}}
>

Approve

</Button>

<Button
variant="contained"
color="error"
onClick={()=>{
rejectLead(selectedLead.id);
setOpenDetails(false);
}}
>

Reject

</Button>

</DialogActions>

</Dialog>

{/* ======================================
               FOOTER
====================================== */}

<Box
sx={{
mt:6,
py:5,
textAlign:"center",
color:"rgba(255,255,255,.8)"
}}
>

<Typography
fontWeight={700}
>

© 2026 OpenServe Contract Fibre Applications. All rights reserved.

</Typography>

<Typography>

Professional Contract Fibre Administration Dashboard

</Typography>

</Box>
</Box>
);

};

export default AdminContractFibreLeads;

/* ======================================================
                        STYLES
====================================================== */

const styles = {

  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    p: 4,
    background:
      "linear-gradient(135deg,#03142f,#083b87,#00b8ff)"
  },

  background: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    zIndex: 0
  },

  circle1: {
    position: "absolute" as const,
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "rgba(59,130,246,0.18)",
    top: -80,
    left: -80,
    filter: "blur(50px)"
  },

  circle2: {
    position: "absolute" as const,
    width: 260,
    height: 260,
    borderRadius: "50%",
    background: "rgba(6,182,212,0.18)",
    right: -60,
    top: 150,
    filter: "blur(60px)"
  },

  circle3: {
    position: "absolute" as const,
    width: 220,
    height: 220,
    borderRadius: "50%",
    background: "rgba(99,102,241,0.18)",
    bottom: -50,
    left: "40%",
    filter: "blur(60px)"
  },

  headerCard: {
    position: "relative",
    zIndex: 1,
    p: 4,
    mb: 4,
    borderRadius: 6,
    background:
      "linear-gradient(135deg,rgba(0,94,255,.55),rgba(0,188,255,.45))",
    backdropFilter: "blur(20px)",
    boxShadow: "0 25px 50px rgba(0,0,0,.25)"
  },

  title: {
    color: "#fff",
    fontSize: 38,
    fontWeight: 800,
    letterSpacing: 1
  },

  subtitle: {
    color: "rgba(255,255,255,.9)",
    mt: 2,
    fontSize: 17,
    lineHeight: 1.8
  },

  headerRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2
  },

  summaryCard: {
    p: 3,
    borderRadius: 5,
    textAlign: "center",
    background: "rgba(255,255,255,.94)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 15px 35px rgba(0,0,0,.15)"
  },

  summaryIcon: {
    fontSize: 48,
    color: "#2563eb",
    mb: 1
  },

  summaryValue: {
    fontSize: 34,
    fontWeight: 800,
    mt: 1
  },

  glassCard: {
    mt: 4,
    p: 3,
    borderRadius: 5,
    background: "rgba(255,255,255,.95)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 20px 40px rgba(0,0,0,.18)"
  },

  filterCard: {
    mt: 4,
    mb: 4,
    p: 3,
    borderRadius: 5,
    background: "rgba(255,255,255,.95)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 15px 35px rgba(0,0,0,.15)"
  },

  input: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 3,
      background: "#fff"
    }
  },

  refreshBtn: {
    height: 56,
    borderRadius: 3,
    textTransform: "none",
    fontWeight: 700,
    background:
      "linear-gradient(90deg,#2563eb,#06b6d4)"
  }

};