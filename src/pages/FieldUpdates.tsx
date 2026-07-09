// ==============================
// PART 1 - IMPORTS + CONSTANTS + STATES
// ==============================

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

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
  LinearProgress,
  Fade,
  Zoom,
  Grow,
  InputAdornment
} from "@mui/material";

import {
  Add,
  Save,
  Person,
  Phone,
  Home,
  CalendarMonth,
  Sell,
  Payments,
  WorkspacePremium,
  TrendingUp,
  Wifi,
  AssignmentTurnedIn,
  Engineering,
  AutoAwesome,
  Insights,
  Description,
  CheckCircle
} from "@mui/icons-material";

import {
  ref,
  push,
  set,
  update,
  onValue
} from "firebase/database";

import { db } from "../firebase";



/* ==========================================
              COMPONENT
========================================== */

const FieldUpdates = () => {

  const [updates, setUpdates] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [agents, setAgents] = useState<any[]>([]);



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

    onValue(reportsRef, snapshot => {

      const data = snapshot.val();

      if (data) {

        setUpdates(

          Object.keys(data)
            .map(key => ({
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
            BEAUTIFUL LIVE STATISTICS
  ========================================== */

  const totalReports = updates.length;

  const confirmedReports =
    updates.filter(x => x.adminConfirmation === "Confirmed").length;

  const prepaidReports =
    updates.filter(x => x.saleType === "Prepaid").length;

  const contractReports =
    updates.filter(x => x.saleType === "Contract").length;

  const totalCommission =
    updates.reduce((t, x) => {

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
        SAVE REPORT + PACKAGE LOGIC
========================================== */

const selectPackage = (value: string) => {

  let price = "";
  let commission = 0;

  if (form.saleType === "Prepaid") {

    switch (value) {

      case "20/10":
        price = "R349.00 p/m";
        commission = 50;
        break;

      case "25/25":
        price = "R499.00 p/m";
        commission = 50;

        break;

      case "50/25":
        price = "R700.00 p/m";
        commission = 50;
        break;

    }

  } else {

    switch (value) {

      case "20/10 Contract":
        price = "R345 x 12";
        commission = 200;
        break;

      case "25/25 Contract":
        price = "R499 x 12";
        commission = 200;
        break;

      case "40/20 Contract":

        price = "R425 x 12";
        commission = 200;
        break;

      case "50/25 Contract":
        price = "R695 x 12";
        commission = 200;
        break;

      case "50/50 Contract":
        price = "R805 x 12";
        commission = 200;
        break;

      case "100/50 Contract":
        price = "R895 x 12";
        commission = 200;
        break;

      case "100/100 Contract":
        price = "R1025 x 12";
        commission = 200;
        break;

      case "200/100 Contract":
        price = "R1299 x 12";
        commission = 200;
        break;

      case "200/200 Contract":
        price = "R1365 x 12";
        commission = 200;
        break;

      case "300/150 Contract":
        price = "R1529 x 12";
        commission = 200;
        break;

      case "500/250 Contract":
        price = "R1699 x 12";
        commission = 200;
        break;

    }

  }

  setForm(prev => ({

    ...prev,

    packagePlan: value,

    price

}));

};

/* ==========================================
          SAVE / UPDATE REPORT
========================================== */

const saveUpdate = async () => {

  if (!form.agentName) {


    alert("Please select an Agent.");

    return;

  }

  if (editing) {

    await update(

      ref(db, `fieldUpdates/${editing}`),

      form

    );

    setEditing(null);

  } else {

    const newRef = push(ref(db, "fieldUpdates"));

    const commission =
    form.adminConfirmation === "Confirmed"
        ? form.saleType === "Prepaid"
            ? 50
            : 200
        : 0;

await set(newRef,{
    ...form,
    commission,
    createdAt:new Date().toISOString()
});

  }

  setForm(emptyForm);

};

/* ==========================================
          FILTER REPORTS
========================================== */

const filteredUpdates = useMemo(() => {

  return updates.filter((item: any) => {

    const text = `

      ${item.agentName}

      ${item.customerName}

      ${item.surname}

      ${item.phone}

      ${item.address}

      ${item.houseNumber}

      ${item.packagePlan}

    `;

    return (

      text.toLowerCase().includes(search.toLowerCase())

      &&

      (month === ""

        ||

        new Date(item.date).getMonth() === Number(month))

      &&

      (year === ""

        ||

        new Date(item.date).getFullYear() === Number(year))

      &&

      (agentFilter === ""

        ||

        item.agentName === agentFilter)

    );

  });

}, [

  updates,

  search,

  month,

  year,

  agentFilter

]);

/* ==========================================
          RETURN

========================================== */

return (

<Box sx={styles.page}>

{/* Floating Blue Background */}

<Box sx={styles.background}>

<motion.div
style={styles.circle1}
animate={{
x:[0,120,0],
y:[0,-80,0]
}}
transition={{
duration:16,
repeat:Infinity
}}
/>

<motion.div

style={styles.circle2}
animate={{
x:[0,-100,0],
y:[0,100,0]
}}
transition={{
duration:18,
repeat:Infinity
}}
/>

<motion.div
style={styles.circle3}
animate={{
scale:[1,1.3,1]
}}
transition={{
duration:12,
repeat:Infinity
}}
/>

</Box>

{/* 2026 HEADER */}

<motion.div

initial={{opacity:0,y:-80}}

animate={{opacity:1,y:0}}

transition={{duration:1}}

>

<Paper sx={styles.heroCard}>

<Stack
direction={{xs:"column",md:"row"}}
justifyContent="space-between"
alignItems="center"
spacing={3}
>

<Box>

<Typography sx={styles.title}>


OpenServe

<span style={{color:"#ffffff"}}>

&nbsp;Field&nbsp;

</span>

Updates

</Typography>

<Typography sx={styles.subtitle}>

2026 Intelligent Field Operations Dashboard

</Typography>

<motion.div

animate={{
x:[0,30,0]
}}


transition={{
duration:6,
repeat:Infinity
}}

>

<Typography sx={styles.liveText}>

⚡ Live Reports • Smart Tracking • AI Ready • Performance Monitoring

</Typography>

</motion.div>

</Box>

<Avatar
sx={styles.heroAvatar}
>

<Engineering sx={{fontSize:50}}/>


</Avatar>

</Stack>

</Paper>

</motion.div>

{/* BEAUTIFUL LIVE STATS */}

<Grid container spacing={3} mt={1}>

{[
{
title:"Reports",
value:totalReports,
icon:<Description/>
},
{
title:"Confirmed",
value:confirmedReports,
icon:<CheckCircle/>
},

{
title:"Prepaid",
value:prepaidReports,
icon:<Wifi/>
},
{
title:"Contract",
value:contractReports,
icon:<WorkspacePremium/>
},
{
title:"Commission",
value:`R ${totalCommission}`,
icon:<Payments/>
}
].map((item,index)=>(

<Grid item xs={12} md={2.4} key={index}>

<motion.div

whileHover={{
scale:1.05,
y:-8

}}

>

<Paper sx={styles.statCard}>

<Box sx={styles.statIcon}>

{item.icon}

</Box>

<Typography sx={styles.statValue}>

{item.value}

</Typography>

<Typography sx={styles.statTitle}>

{item.title}

</Typography>

</Paper>

</motion.div>

</Grid>

))}

</Grid>


{/* ==========================================
            AGENT PERFORMANCE
========================================== */}

<Typography sx={styles.sectionTitle}>
    🚀 Agent Performance Overview
</Typography>

<Grid container spacing={3} mt={1}>

    {agents.map((agent) => {

        const reports = filteredUpdates.filter(
            (x) => x.agentName === agent
        );

        const confirmed = reports.filter(
            (x) => x.adminConfirmation === "Confirmed"
        );

        const prepaid = confirmed.filter(
            (x) => x.saleType === "Prepaid"
        ).length;

        const contract = confirmed.filter(
            (x) => x.saleType === "Contract"
        ).length;

        const commission = confirmed.reduce(
            (t, x) => t + Number(x.commission || 0),
            0
        );

        return (

            <Grid item xs={12} md={6} lg={3} key={agent}>

                <motion.div
                    whileHover={{
                        scale: 1.04,
                        y: -10
                    }}
                >

                    <Paper sx={styles.agentCard}>

                        <Avatar sx={styles.agentAvatar}>
                            <Person />
                        </Avatar>

                        <Typography sx={styles.agentName}>
                            {agent}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Stack spacing={1.2}>

                            <Typography>
                                📋 Reports
                                <b style={{ float: "right" }}>
                                    {reports.length}
                                </b>
                            </Typography>

                            <Typography>
                                👥 Confirmed
                                <b style={{ float: "right" }}>
                                    {confirmed.length}
                                </b>
                            </Typography>

                            <Typography>
                                📦 Prepaid
                                <b style={{ float: "right" }}>
                                    {prepaid}
                                </b>
                            </Typography>

                            <Typography>

                                📑 Contract
                                <b style={{ float: "right" }}>
                                    {contract}
                                </b>
                            </Typography>

                            <Typography
                                color="#0b74ff"
                                fontWeight={700}
                            >
                                💰 Commission
                                <b style={{ float: "right" }}>
                                    R {commission}
                                </b>
                            </Typography>

                        </Stack>

                        <LinearProgress
                            variant="determinate"
                            value={Math.min(reports.length * 10, 100)}
                            sx={{
                                mt: 3,

                                height: 10,
                                borderRadius: 10,
                                background: "#dbeafe",
                                "& .MuiLinearProgress-bar": {
                                    background:
                                        "linear-gradient(90deg,#0057ff,#00d4ff)"
                                }
                            }}
                        />

                        <Chip
                            sx={{
                                mt: 3,
                                fontWeight: 700,
                                borderRadius: 10
                            }}
                            color={
                                commission > 0
                                    ? "success"
                                    : "default"
                            }
                            label={
                                commission > 0

                                    ? "⭐ Top Performer"
                                    : "No Sales Yet"
                            }
                        />

                    </Paper>

                </motion.div>

            </Grid>

        );

    })}

</Grid>

{/* ==========================================
            SALES PACKAGE CARD
========================================== */}

<Typography sx={styles.sectionTitle}>

    📦 OpenServe Fibre Sales

</Typography>

<motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
>

<Paper sx={styles.packageCard}>

<Grid container spacing={3}>

<Grid item xs={12} md={4}>

<TextField

fullWidth
select
label="Sale Type"

name="saleType"

value={form.saleType}

onChange={(e)=>{

setForm({

...form,

saleType:e.target.value,

packagePlan:"",
price:"",
commission:0

});

}}

sx={styles.input}

>

<MenuItem value="Prepaid">

Prepaid Fibre

</MenuItem>

<MenuItem value="Contract">

Contract Fibre

</MenuItem>

</TextField>

</Grid>

<Grid item xs={12} md={4}>

<TextField
    fullWidth
    select
    label="OpenServe Package"
    name="packagePlan"
    value={form.packagePlan}
    onChange={(e) => {
        selectPackage(e.target.value as string);
    }}
    sx={styles.input}
>

{form.saleType==="Prepaid" ? (

<>

<MenuItem value="20/10">

20 / 10 Mbps

</MenuItem>

<MenuItem value="25/25">

25 / 25 Mbps

</MenuItem>

<MenuItem value="50/25">

50 / 25 Mbps

</MenuItem>

</>

):(

<>

<MenuItem value="20/10 Contract">

20 / 10 Contract

</MenuItem>

<MenuItem value="25/25 Contract">

25 / 25 Contract

</MenuItem>

<MenuItem value="40/20 Contract">

40 / 20 Contract

</MenuItem>

<MenuItem value="50/25 Contract">

50 / 25 Contract

</MenuItem>

<MenuItem value="50/50 Contract">

50 / 50 Contract

</MenuItem>

<MenuItem value="100/50 Contract">

100 / 50 Contract

</MenuItem>

<MenuItem value="100/100 Contract">

100 / 100 Contract

</MenuItem>

<MenuItem value="200/100 Contract">

200 / 100 Contract

</MenuItem>

<MenuItem value="200/200 Contract">

200 / 200 Contract

</MenuItem>

<MenuItem value="300/150 Contract">

300 / 150 Contract

</MenuItem>

<MenuItem value="500/250 Contract">

500 / 250 Contract

</MenuItem>

</>

)}

</TextField>

</Grid>

<Grid item xs={12} md={4}>

<motion.div

animate={{
y:[0,-8,0]

}}

transition={{
duration:3,
repeat:Infinity
}}

>

<Paper sx={styles.commissionCard}>

<Typography>

Estimated Commission

</Typography>

<Typography sx={styles.commissionValue}>
R {
    form.adminConfirmation === "Confirmed"
        ? form.saleType === "Prepaid"
            ? 50
            : 200
        : 0
}
</Typography>

<Typography>


{form.price}

</Typography>

</Paper>

</motion.div>

</Grid>

</Grid>

</Paper>

</motion.div>

{/* ==========================================
            DAILY FIELD REPORT FORM
========================================== */}

<Typography sx={styles.sectionTitle}>
    📝 Daily Field Report
</Typography>

<motion.div
    initial={{ opacity: 0, y: 60 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
>

<Paper sx={styles.formCard}>

<Grid container spacing={3}>

{/* Agent */}

<Grid item xs={12} md={4}>

<TextField
select
fullWidth
label="Field Agent"
name="agentName"
value={form.agentName}

onChange={handleChange}
sx={styles.input}
InputProps={{
startAdornment:(
<InputAdornment position="start">
<Person color="primary"/>
</InputAdornment>
)
}}
>

{agents.map((agent) => (

<MenuItem
  key={agent.id}
  value={agent.fullName}
>

  {agent.fullName}

</MenuItem>

))}

</TextField>

</Grid>

{/* Date */}

<Grid item xs={12} md={4}>

<TextField
fullWidth
type="date"
label="Visit Date"
name="date"
value={form.date}
onChange={handleChange}
InputLabelProps={{
shrink:true
}}
sx={styles.input}
InputProps={{
startAdornment:(
<InputAdornment position="start">
<CalendarMonth color="primary"/>
</InputAdornment>
)
}}

/>

</Grid>

{/* Visit */}

<Grid item xs={12} md={4}>

<TextField
select
fullWidth
label="Visit Type"
name="visitType"
value={form.visitType}
onChange={handleChange}
sx={styles.input}
>

<MenuItem value="Attended House">

🏠 Attended House

</MenuItem>

<MenuItem value="Unattended House">

🚪 Unattended House

</MenuItem>

</TextField>

</Grid>

{/* CUSTOMER */}

{form.visitType==="Attended House" && (

<>

<Grid item xs={12} md={4}>

<TextField
fullWidth
label="Customer Name"
name="customerName"
value={form.customerName}
onChange={handleChange}

sx={styles.input}
/>

</Grid>

<Grid item xs={12} md={4}>

<TextField
fullWidth
label="Surname"
name="surname"
value={form.surname}
onChange={handleChange}
sx={styles.input}
/>

</Grid>

<Grid item xs={12} md={4}>

<TextField
fullWidth
label="ID Number"
name="idNumber"

value={form.idNumber}
onChange={handleChange}
sx={styles.input}
/>

</Grid>

<Grid item xs={12} md={4}>

<TextField
fullWidth
label="Phone Number"
name="phone"
value={form.phone}
onChange={handleChange}
sx={styles.input}
InputProps={{
startAdornment:(
<InputAdornment position="start">
<Phone color="primary"/>
</InputAdornment>
)
}}
/>


</Grid>

<Grid item xs={12} md={8}>

<TextField
fullWidth
label="Installation Address"
name="address"
value={form.address}
onChange={handleChange}
sx={styles.input}
InputProps={{
startAdornment:(
<InputAdornment position="start">
<Home color="primary"/>
</InputAdornment>
)
}}
/>

</Grid>

</>


)}

{/* Unattended */}

{form.visitType==="Unattended House" && (

<Grid item xs={12}>

<TextField
fullWidth
label="House Address"
name="address"
value={form.address}
onChange={handleChange}
sx={styles.input}
/>

</Grid>

)}

{/* Status */}

<Grid item xs={12} md={4}>

<TextField
select
fullWidth
label="Customer Status"
name="status"
value={form.status}
onChange={handleChange}
sx={styles.input}
>

<MenuItem value="Completed">

Completed

</MenuItem>

<MenuItem value="Pending">

Pending

</MenuItem>

<MenuItem value="Follow Up">

Follow Up

</MenuItem>

<MenuItem value="Not Interested">

Not Interested

</MenuItem>

</TextField>

</Grid>


{/* Price */}

<Grid item xs={12} md={4}>

<TextField
fullWidth
label="Package Price"
value={form.price}
InputProps={{
readOnly:true,
startAdornment:(
<InputAdornment position="start">
<Payments color="primary"/>
</InputAdornment>
)
}}
sx={styles.input}
/>

</Grid>


{/* COMMENTS */}

<Grid item xs={12}>

<TextField
fullWidth
multiline
rows={4}
label="Agent Notes / Customer Feedback"
name="comments"
value={form.comments}
onChange={handleChange}
sx={styles.input}
/>

</Grid>

{/* SAVE BUTTON */}

<Grid item xs={12}>

<motion.div

whileHover={{
scale:1.03
}}

whileTap={{
scale:.97
}}

animate={{
y:[0,-5,0]
}}

transition={{
duration:3,
repeat:Infinity
}}

>

<Button

fullWidth

size="large"


variant="contained"

startIcon={
editing
?
<Save/>
:
<Add/>
}

onClick={saveUpdate}

sx={styles.saveButton}

>

{editing

?

"Update Field Report"

:


"Save Daily Field Report"

}

</Button>

</motion.div>

</Grid>

</Grid>

</Paper>

</motion.div>


{/* ==========================================
            FIELD REPORT ANALYTICS
========================================== */}


<Typography sx={styles.sectionTitle}>
    📈 Live Field Analytics
</Typography>

<Grid container spacing={3} mt={1}>

    {agents.map((agent) => {

        const reports = filteredUpdates.filter(
            (x) => x.agentName === agent
        );

        const confirmed = reports.filter(
            (x) => x.adminConfirmation === "Confirmed"
        ).length;

        const progress =
            reports.length === 0
                ? 0
                : Math.round((confirmed / reports.length) * 100);

        return (

            <Grid item xs={12} md={3} key={agent}>

                <motion.div
                    whileHover={{
                        scale: 1.05
                    }}
                >

                    <Paper sx={styles.analyticsCard}>

                        <Typography
                            fontWeight={700}
                            color="#0057ff"
                        >
                            {agent}
                        </Typography>

                        <Typography mt={1}>
                            Reports : {reports.length}
                        </Typography>

                        <Typography>

                            Confirmed : {confirmed}
                        </Typography>

                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                                mt:2,
                                height:12,
                                borderRadius:10,
                                background:"#dbeafe",
                                "& .MuiLinearProgress-bar":{
                                    background:
                                    "linear-gradient(90deg,#0057ff,#00d4ff)"
                                }
                            }}
                        />

                        <Typography
                            mt={1}
                            fontWeight={700}
                            color="#0f172a"
                        >

                            {progress}% Success Rate
                        </Typography>

                    </Paper>

                </motion.div>

            </Grid>

        );

    })}

</Grid>

{/* ==========================================
                FOOTER
========================================== */}

<motion.div

initial={{ opacity:0 }}

animate={{ opacity:1 }}

transition={{ duration:2 }}

>

<Box
sx={{
mt:8,
textAlign:"center",
py:5
}}
>

<Divider sx={{mb:3}}/>

<motion.div

animate={{
x:[0,20,0]
}}

transition={{
duration:6,
repeat:Infinity
}}

>

<Typography
sx={{
fontSize:30,
fontWeight:800,
color:"#0057ff"
}}
>

OpenServe

<span style={{color:"#111827"}}>

&nbsp;Field&nbsp;

</span>

Updates


</Typography>

</motion.div>

<Typography
sx={{
mt:2,
color:"#64748b",
fontSize:16
}}
>

2026 Intelligent Field Operations Management Platform

</Typography>

<Typography
sx={{
mt:1,
color:"#94a3b8"
}}
>


Real-Time Reporting • Smart Analytics • Agent Performance • Secure Cloud Database

</Typography>

<Typography
sx={{
mt:4,
fontSize:14,
color:"#94a3b8"
}}
>

© 2026 OpenServe Field Updates. All Rights Reserved.

</Typography>

</Box>

</motion.div>

</Box>


);

};

export default FieldUpdates;

/* ==========================================
                2026 STYLES
========================================== */

const styles = {

page:{
minHeight:"100vh",
padding:4,
background:"linear-gradient(135deg,#031b4e,#0057ff,#00b7ff)",
position:"relative",
overflow:"hidden"
},


background:{
position:"fixed",
inset:0,
overflow:"hidden",
zIndex:0
},

circle1:{
position:"absolute" as const,
width:350,
height:350,
borderRadius:"50%",
background:"rgba(255,255,255,.08)",
top:-100,
left:-80,
filter:"blur(50px)"
},

circle2:{
position:"absolute" as const,
width:260,
height:260,
borderRadius:"50%",

background:"rgba(0,255,255,.12)",
right:-50,
top:120,
filter:"blur(45px)"
},

circle3:{
position:"absolute" as const,
width:320,
height:320,
borderRadius:"50%",
background:"rgba(255,255,255,.06)",
bottom:-120,
left:"40%",
filter:"blur(60px)"
},

heroCard:{
position:"relative",
zIndex:1,
p:5,
borderRadius:7,
background:"rgba(255,255,255,.12)",
backdropFilter:"blur(25px)",

border:"1px solid rgba(255,255,255,.2)"
},

title:{
fontSize:40,
fontWeight:900,
color:"#00b7ff"
},

subtitle:{
color:"#fff",
fontSize:18,
mt:1
},

liveText:{
mt:2,
color:"#dbeafe",
fontWeight:600
},

heroAvatar:{
width:95,
height:95,

background:"linear-gradient(135deg,#0057ff,#00d4ff)"
},

sectionTitle:{
mt:6,
mb:2,
fontSize:28,
fontWeight:800,
color:"#fff"
},

statCard:{
p:3,
borderRadius:5,
textAlign:"center",
background:"rgba(255,255,255,.95)"
},

statIcon:{
display:"flex",
justifyContent:"center",
mb:2,
color:"#0057ff",

fontSize:40
},

statValue:{
fontSize:28,
fontWeight:800
},

statTitle:{
color:"#64748b"
},

agentCard:{
p:3,
borderRadius:5,
background:"rgba(255,255,255,.96)"
},

agentAvatar:{
width:70,
height:70,
mx:"auto",
mb:2,
background:"135deg,#0057ff,#00d4ff"
},

agentName:{
textAlign:"center",
fontWeight:800,
fontSize:22
},

packageCard:{
mt:2,
p:4,
borderRadius:5,
background:"rgba(255,255,255,.97)"
},

commissionCard:{
p:3,
textAlign:"center",
borderRadius:4,
background:"linear-gradient(135deg,#0057ff,#00b7ff)",
color:"#fff"
},


commissionValue:{
fontSize:34,
fontWeight:900,
my:1
},

formCard:{
mt:2,
p:4,
borderRadius:5,
background:"rgba(255,255,255,.98)"
},

input:{
"& .MuiOutlinedInput-root":{
borderRadius:"18px",
background:"#f8fbff"
}
},

saveButton:{
height:60,
fontSize:18,

fontWeight:800,
borderRadius:"18px",
background:"linear-gradient(90deg,#0057ff,#00b7ff)",
textTransform:"none"
},

analyticsCard:{
p:3,
borderRadius:5,
background:"rgba(255,255,255,.96)"
}

};