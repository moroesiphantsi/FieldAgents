import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Chip,
  Avatar,
  Divider,
  Stack,
  Card,
  CardContent,
  InputAdornment
} from "@mui/material";

import {
  BusinessCenter,
  Wifi,
  Person,
  Phone,
  Email,
  Home,
  LocationOn,
  CheckCircle,
  Bolt,
  Public,
  Router,
  RocketLaunch,
  Verified,
  WorkspacePremium,
  ArrowForward,
  Star,
  TrendingUp,
  SupportAgent,
  Engineering,
  Speed
} from "@mui/icons-material";

import { motion } from "framer-motion";

import {
  ref,
  push,
  onValue,
  set,
  serverTimestamp
} from "firebase/database";

import { db } from "../firebase";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionTypography = motion(Typography);



const floating = {
  animate: {
    y: [0, -18, 0],
    transition: {
      duration: 6,
      repeat: Infinity
    }
  }
};

const slideLeft = {
  hidden: { opacity: 0, x: -120 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 1
    }
  }
};

const slideRight = {
  hidden: { opacity: 0, x: 120 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 1
    }
  }
};

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 60
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: .8
    }
  }
};

const ContractFibreLeads = () => {

const [agents, setAgents] = useState<any[]>([]); 
useEffect(() => {
  const agentsRef = ref(db, "agents");

  onValue(agentsRef, (snapshot) => {
    const data = snapshot.val();

    if (data) {
      setAgents(
        Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }))
      );
    } else {
      setAgents([]);
    }
  });
}, []);

const emptyLead = {

customerName: "",
surname: "",
idNumber: "",
phone: "",
alternativePhone: "",
email: "",

address: "",
suburb: "",
city: "",
province: "",

gpsLocation: "",

packagePlan: "",
saleType: "Contract",

provider: "Openserve",

lineSpeed: "",

existingISP: "",

preferredInstallationDate: "",

preferredTime: "",

agentName: "",

notes: "",

status: "Pending",

adminConfirmation: "Pending",

commission: 200,

createdAt: ""
};

const [lead, setLead] = useState(emptyLead);

const [loading, setLoading] = useState(false);

const providers = [
"Openserve",
"MetroFibre",
"Vumatel",
"Frogfoot",
"Link Africa"
];

const packages = [
"20/10 Mbps",
"40/20 Mbps",
"50/25 Mbps",
"100/50 Mbps",
"200/100 Mbps",
"500/250 Mbps",
"1000/500 Mbps"
];

const provinces = [
"Gauteng",
"Limpopo",
"Mpumalanga",
"North West",
"Free State",
"KwaZulu-Natal",
"Eastern Cape",
"Western Cape",
"Northern Cape"
];

return (

<Box
sx={{
minHeight:"100vh",
overflow:"hidden",
background:`
linear-gradient(
135deg,
#020617 0%,
#071A38 20%,
#0B2E59 45%,
#004AAD 70%,
#06B6D4 100%
)`
}}
>

{/* =========================
        FLOATING BACKGROUND
========================= */}

<MotionBox
animate={{
rotate:360
}}
transition={{
repeat:Infinity,
duration:80,
ease:"linear"
}}
sx={{
position:"fixed",
top:-250,
right:-250,
width:600,
height:600,
borderRadius:"50%",
background:"rgba(0,180,255,.12)",
filter:"blur(80px)"
}}
/>

<MotionBox
animate={{
rotate:-360
}}
transition={{
repeat:Infinity,
duration:70,
ease:"linear"
}}
sx={{
position:"fixed",
bottom:-250,
left:-250,
width:650,
height:650,
borderRadius:"50%",
background:"rgba(59,130,246,.14)",
filter:"blur(90px)"
}}
/>

<MotionBox
animate={floating.animate}
sx={{
position:"fixed",
top:"18%",
left:"10%"
}}
>

<Wifi
sx={{
fontSize:120,
color:"rgba(255,255,255,.06)"
}}
/>

</MotionBox>

<MotionBox
animate={{
y:[0,-20,0],
rotate:[0,5,-5,0]
}}
transition={{
repeat:Infinity,
duration:7
}}
sx={{
position:"fixed",
right:"12%",
top:"25%"
}}
>

<Router
sx={{
fontSize:110,
color:"rgba(255,255,255,.05)"
}}
/>

</MotionBox>

<Box
sx={{
position:"relative",
zIndex:2,
px:{
xs:3,
md:8
},
py:8
}}
>

<Grid
container
spacing={6}
alignItems="center"
>

{/* LEFT */}

<Grid item xs={12} md={7}>

<MotionTypography
variants={slideLeft}
initial="hidden"
animate="visible"
variant="overline"
sx={{
color:"#38bdf8",
fontSize:18,
letterSpacing:4,
fontWeight:700
}}
>

2026 OPENSERVE BUSINESS

</MotionTypography>

<MotionTypography
variants={slideLeft}
initial="hidden"
animate="visible"
variant="h2"
fontWeight="bold"
sx={{
color:"white",
lineHeight:1.1,
mt:2
}}
>

Future Ready

<Box
component="span"
sx={{
display:"block",
background:"linear-gradient(90deg,#38bdf8,#22d3ee,#ffffff)",
WebkitBackgroundClip:"text",
WebkitTextFillColor:"transparent"
}}
>

Contract Fibre

</Box>

Solutions

</MotionTypography>

<MotionTypography
animate={{
x:[0,20,-20,0]
}}
transition={{
repeat:Infinity,
duration:12
}}
sx={{
mt:4,
fontSize:20,
color:"#cbd5e1",
maxWidth:700,
lineHeight:1.9
}}
>

Experience lightning-fast Openserve Fibre with dedicated business
and residential contract packages.

Enjoy premium connectivity, professional installations,
priority support, smart Wi-Fi solutions,
and nationwide coverage designed for 2026.

</MotionTypography>

<Stack
direction="row"
spacing={2}
flexWrap="wrap"
sx={{mt:5}}
>

<Chip
icon={<WorkspacePremium/>}
label="Premium Fibre"
/>

<Chip
icon={<RocketLaunch/>}
label="Fast Installation"
/>

<Chip
icon={<Verified/>}
label="Verified Openserve"
/>

<Chip
icon={<Bolt/>}
label="Unlimited Internet"
/>

</Stack>

<Stack
direction="row"
spacing={3}
sx={{mt:6}}
>

<Button
variant="contained"
size="large"
endIcon={<ArrowForward/>}
sx={{
px:5,
py:2,
borderRadius:100,
fontSize:17,
fontWeight:"bold",
background:
"linear-gradient(90deg,#2563eb,#06b6d4)"
}}
>

Apply Now

</Button>

<Button
variant="outlined"
size="large"
sx={{
px:5,
py:2,
borderRadius:100,
color:"white",
borderColor:"rgba(255,255,255,.3)"
}}
>

Explore Packages

</Button>

</Stack>

</Grid>

{/* RIGHT */}

<Grid item xs={12} md={5}>

<MotionPaper
variants={slideRight}
initial="hidden"
animate="visible"
whileHover={{
scale:1.02
}}
sx={{
borderRadius:8,
overflow:"hidden",
background:"rgba(255,255,255,.08)",
backdropFilter:"blur(25px)",
border:"1px solid rgba(255,255,255,.15)",
p:4
}}
>

<Avatar
sx={{
width:90,
height:90,
mx:"auto",
background:
"linear-gradient(135deg,#2563eb,#06b6d4)"
}}
>

<BusinessCenter sx={{fontSize:50}}/>

</Avatar>

<Typography
textAlign="center"
mt={3}
variant="h5"
fontWeight="bold"
color="white"
>

Openserve Contract Fibre

</Typography>

<Typography
textAlign="center"
color="#CBD5E1"
mt={2}
>

Business & Residential Fibre
Applications

</Typography>

<Divider
sx={{
my:4,
borderColor:"rgba(255,255,255,.12)"
}}
/>

<Grid container spacing={2}>

<Grid item xs={6}>

<Card sx={glassCard}>

<CardContent>

<Speed
color="primary"
sx={{fontSize:45}}
/>

<Typography fontWeight="bold">

1Gbps

</Typography>

<Typography variant="body2">

Ultra Speed

</Typography>

</CardContent>

</Card>

</Grid>

<Grid item xs={6}>

<Card sx={glassCard}>

<CardContent>

<Public
color="success"
sx={{fontSize:45}}
/>

<Typography fontWeight="bold">

National

</Typography>

<Typography variant="body2">

Coverage

</Typography>

</CardContent>

</Card>

</Grid>

<Grid item xs={6}>

<Card sx={glassCard}>

<CardContent>

<Star
sx={{
fontSize:45,
color:"#f59e0b"
}}
/>

<Typography fontWeight="bold">

Priority

</Typography>

<Typography variant="body2">

Support

</Typography>

</CardContent>

</Card>

</Grid>

<Grid item xs={6}>

<Card sx={glassCard}>

<CardContent>

<TrendingUp
color="secondary"
sx={{fontSize:45}}
/>

<Typography fontWeight="bold">

99.9%

</Typography>

<Typography variant="body2">

Uptime

</Typography>

</CardContent>

</Card>

</Grid>

</Grid>

</MotionPaper>

</Grid>

</Grid>

{/* ============================
          APPLICATION FORM
============================= */}

<MotionPaper
variants={fadeUp}
initial="hidden"
whileInView="visible"
viewport={{ once: true }}
sx={{
mt:8,
p:5,
borderRadius:8,
background:"rgba(255,255,255,.08)",
backdropFilter:"blur(25px)",
border:"1px solid rgba(255,255,255,.12)"
}}
>

<Typography
variant="h4"
fontWeight="bold"
color="white"
mb={1}
>

Apply For Openserve Contract Fibre

</Typography>

<Typography
color="#CBD5E1"
mb={5}
>

Complete the application below and our fibre consultants will contact you within 24 hours.

</Typography>

<Grid container spacing={3}>

<Grid item xs={12} md={6}>
<TextField
fullWidth
label="First Name"
value={lead.customerName}
onChange={(e)=>
setLead({
...lead,
customerName:e.target.value
})
}
InputProps={{
startAdornment:(
<InputAdornment position="start">
<Person color="primary"/>
</InputAdornment>
)
}}
/>
</Grid>

<Grid item xs={12} md={6}>
<TextField
fullWidth
label="Surname"
value={lead.surname}
onChange={(e)=>
setLead({
...lead,
surname:e.target.value
})
}
/>
</Grid>

<Grid item xs={12} md={6}>
<TextField
fullWidth
label="ID Number"
value={lead.idNumber}
onChange={(e)=>
setLead({
...lead,
idNumber:e.target.value
})
}
/>
</Grid>

<Grid item xs={12} md={6}>
<TextField
fullWidth
label="Phone Number"
value={lead.phone}
onChange={(e)=>
setLead({
...lead,
phone:e.target.value
})
}
InputProps={{
startAdornment:(
<InputAdornment position="start">
<Phone color="primary"/>
</InputAdornment>
)
}}
/>
</Grid>

<Grid item xs={12} md={6}>
<TextField
fullWidth
label="Alternative Phone"
value={lead.alternativePhone}
onChange={(e)=>
setLead({
...lead,
alternativePhone:e.target.value
})
}
/>
</Grid>

<Grid item xs={12} md={6}>
<TextField
fullWidth
label="Email Address"
value={lead.email}
onChange={(e)=>
setLead({
...lead,
email:e.target.value
})
}
InputProps={{
startAdornment:(
<InputAdornment position="start">
<Email color="primary"/>
</InputAdornment>
)
}}
/>
</Grid>

<Grid item xs={12}>
<TextField
fullWidth
label="Street Address"
value={lead.address}
onChange={(e)=>
setLead({
...lead,
address:e.target.value
})
}
InputProps={{
startAdornment:(
<InputAdornment position="start">
<Home color="primary"/>
</InputAdornment>
)
}}
/>
</Grid>

<Grid item xs={12} md={4}>
<TextField
fullWidth
label="Suburb"
value={lead.suburb}
onChange={(e)=>
setLead({
...lead,
suburb:e.target.value
})
}
/>
</Grid>

<Grid item xs={12} md={4}>
<TextField
fullWidth
label="City"
value={lead.city}
onChange={(e)=>
setLead({
...lead,
city:e.target.value
})
}
/>
</Grid>

<Grid item xs={12} md={4}>
<TextField
select
fullWidth
label="Province"
value={lead.province}
onChange={(e)=>
setLead({
...lead,
province:e.target.value
})
}
>

{provinces.map((province)=>(
<MenuItem
key={province}
value={province}
>
{province}
</MenuItem>
))}

</TextField>

</Grid>

<Grid item xs={12}>
<TextField
fullWidth
label="GPS Location (Optional)"
value={lead.gpsLocation}
onChange={(e)=>
setLead({
...lead,
gpsLocation:e.target.value
})
}
InputProps={{
startAdornment:(
<InputAdornment position="start">
<LocationOn color="primary"/>
</InputAdornment>
)
}}
/>
</Grid>

<Grid item xs={12} md={6}>
<TextField
select
fullWidth
label="Choose Fibre Package"
value={lead.packagePlan}
onChange={(e)=>
setLead({
...lead,
packagePlan:e.target.value
})
}
>

{packages.map((pkg)=>(
<MenuItem
key={pkg}
value={pkg}
>
{pkg}
</MenuItem>
))}

</TextField>

</Grid>

<Grid item xs={12} md={6}>
<TextField
select
fullWidth
label="Current ISP"
value={lead.existingISP}
onChange={(e)=>
setLead({
...lead,
existingISP:e.target.value
})
}
>

<MenuItem value="Afrihost">Afrihost</MenuItem>
<MenuItem value="Cool Ideas">Cool Ideas</MenuItem>
<MenuItem value="MWEB">MWEB</MenuItem>
<MenuItem value="Vodacom">Vodacom</MenuItem>
<MenuItem value="MTN">MTN</MenuItem>
<MenuItem value="None">No Existing ISP</MenuItem>

</TextField>

</Grid>

<Grid item xs={12} md={6}>
<TextField
type="date"
fullWidth
label="Preferred Installation Date"
InputLabelProps={{ shrink: true }}
value={lead.preferredInstallationDate}
onChange={(e)=>
setLead({
...lead,
preferredInstallationDate:e.target.value
})
}
/>
</Grid>

<Grid item xs={12} md={6}>
<TextField
select
fullWidth
label="Preferred Installation Time"
value={lead.preferredTime}
onChange={(e)=>
setLead({
...lead,
preferredTime:e.target.value
})
}
>
<MenuItem value="08:00 - 10:00">08:00 - 10:00</MenuItem>
<MenuItem value="10:00 - 12:00">10:00 - 12:00</MenuItem>
<MenuItem value="12:00 - 14:00">12:00 - 14:00</MenuItem>
<MenuItem value="14:00 - 16:00">14:00 - 16:00</MenuItem>
<MenuItem value="16:00 - 18:00">16:00 - 18:00</MenuItem>
</TextField>
</Grid>

<Grid item xs={12} md={6}>
<TextField
select
fullWidth
label="Preferred Sales Agent"
value={lead.agentName}
onChange={(e)=>
setLead({
...lead,
agentName:e.target.value
})
}
>

<MenuItem value="">Select Agent</MenuItem>

{agents.map((agent:any)=>(
<MenuItem
key={agent.id}
value={agent.fullName}
>
{agent.fullName}
</MenuItem>
))}

</TextField>
</Grid>

<Grid item xs={12} md={6}>
<TextField
select
fullWidth
label="Network Provider"
value={lead.provider}
onChange={(e)=>
setLead({
...lead,
provider:e.target.value
})
}
>

{providers.map((provider)=>(
<MenuItem
key={provider}
value={provider}
>
{provider}
</MenuItem>
))}

</TextField>
</Grid>

<Grid item xs={12}>
<TextField
fullWidth
multiline
rows={5}
label="Additional Notes"
placeholder="Access instructions, landmarks, estate name, gate code, preferred communication method..."
value={lead.notes}
onChange={(e)=>
setLead({
...lead,
notes:e.target.value
})
}
/>
</Grid>

<Grid item xs={12}>

<Paper
sx={{
p:3,
borderRadius:4,
background:"rgba(37,99,235,.08)",
border:"1px solid rgba(37,99,235,.25)"
}}
>

<Typography
fontWeight="bold"
color="primary"
mb={2}
>

Contract Fibre Benefits

</Typography>

<Grid container spacing={2}>

<Grid item xs={12} md={6}>
<Box display="flex" gap={1}>
<CheckCircle color="success"/>
<Typography>
Professional Openserve Installation
</Typography>
</Box>
</Grid>

<Grid item xs={12} md={6}>
<Box display="flex" gap={1}>
<CheckCircle color="success"/>
<Typography>
Unlimited High-Speed Internet
</Typography>
</Box>
</Grid>

<Grid item xs={12} md={6}>
<Box display="flex" gap={1}>
<CheckCircle color="success"/>
<Typography>
Priority Technical Support
</Typography>
</Box>
</Grid>

<Grid item xs={12} md={6}>
<Box display="flex" gap={1}>
<CheckCircle color="success"/>
<Typography>
Professional Wi-Fi Router Included
</Typography>
</Box>
</Grid>

<Grid item xs={12} md={6}>
<Box display="flex" gap={1}>
<CheckCircle color="success"/>
<Typography>
Nationwide Openserve Coverage
</Typography>
</Box>
</Grid>

<Grid item xs={12} md={6}>
<Box display="flex" gap={1}>
<CheckCircle color="success"/>
<Typography>
Fast Installation Scheduling
</Typography>
</Box>
</Grid>

</Grid>

</Paper>

</Grid>

<Grid item xs={12}>

<MotionBox
whileHover={{
scale:1.03
}}
whileTap={{
scale:.97
}}
>

<Button
fullWidth
size="large"
variant="contained"
disabled={loading}
onClick={async()=>{

setLoading(true);

try{

const newLead=push(ref(db,"contractFibreLeads"));

await set(newLead,{
...lead,
createdAt:serverTimestamp(),
status:"Pending",
adminConfirmation:"Pending"
});

alert("Application submitted successfully!");

setLead(emptyLead);

}catch(error){

alert("Failed to submit application.");

}

setLoading(false);

}}
sx={{
py:2,
fontSize:18,
fontWeight:"bold",
borderRadius:100,
background:"linear-gradient(90deg,#2563eb,#06b6d4,#22c55e)",
boxShadow:"0 20px 45px rgba(37,99,235,.35)"
}}
>

{loading
? "Submitting..."
: "Submit Contract Fibre Application"}

</Button>

</MotionBox>

</Grid>

</Grid>

</MotionPaper>

{/* =====================================
        PREMIUM CONTACT SECTION
===================================== */}

<MotionBox
variants={fadeUp}
initial="hidden"
whileInView="visible"
viewport={{ once: true }}
sx={{ mt: 8 }}
>

<Grid container spacing={4}>

<Grid item xs={12} md={4}>

<Paper
sx={{
p:4,
height:"100%",
borderRadius:6,
background:"rgba(255,255,255,.08)",
backdropFilter:"blur(25px)",
border:"1px solid rgba(255,255,255,.12)",
textAlign:"center"
}}
>

<Phone
sx={{
fontSize:55,
color:"#38bdf8",
mb:2
}}
/>

<Typography variant="h6" fontWeight="bold" color="white">

Call Us

</Typography>

<Typography color="#CBD5E1">

+27 685932102

</Typography>

</Paper>

</Grid>

<Grid item xs={12} md={4}>

<Paper
sx={{
p:4,
height:"100%",
borderRadius:6,
background:"rgba(255,255,255,.08)",
backdropFilter:"blur(25px)",
border:"1px solid rgba(255,255,255,.12)",
textAlign:"center"
}}
>

<Email
sx={{
fontSize:55,
color:"#22c55e",
mb:2
}}
/>

<Typography variant="h6" fontWeight="bold" color="white">

Email Support

</Typography>

<Typography color="#CBD5E1">

leo@miyfi.co.za

</Typography>

</Paper>

</Grid>

<Grid item xs={12} md={4}>

<Paper
sx={{
p:4,
height:"100%",
borderRadius:6,
background:"rgba(255,255,255,.08)",
backdropFilter:"blur(25px)",
border:"1px solid rgba(255,255,255,.12)",
textAlign:"center"
}}
>

<LocationOn
sx={{
fontSize:55,
color:"#f59e0b",
mb:2
}}
/>

<Typography variant="h6" fontWeight="bold" color="white">

Coverage

</Typography>

<Typography color="#CBD5E1">

Available Across South Africa

</Typography>

</Paper>

</Grid>

</Grid>

</MotionBox>

{/* =====================================
            TRUST SECTION
===================================== */}

<Box
sx={{
mt:8,
mb:8,
textAlign:"center"
}}
>

<Typography
variant="h3"
fontWeight="bold"
color="white"
>

Why Choose Openserve Fibre?

</Typography>

<Typography
color="#CBD5E1"
mt={2}
mb={6}
>

Trusted by thousands of South African homes and businesses.

</Typography>

<Grid container spacing={4}>

{[
{
title:"99.9% Uptime",
icon:<Verified sx={{fontSize:60,color:"#22c55e"}}/>
},
{
title:"Ultra Fast Speeds",
icon:<Speed sx={{fontSize:60,color:"#38bdf8"}}/>
},
{
title:"Professional Installation",
icon:<Engineering sx={{fontSize:60,color:"#f59e0b"}}/>
},
{
title:"24/7 Support",
icon:<SupportAgent sx={{fontSize:60,color:"#a855f7"}}/>
}
].map((item,index)=>(

<Grid item xs={12} sm={6} md={3} key={index}>

<MotionPaper

whileHover={{
scale:1.08,
y:-10
}}

transition={{
duration:.3
}}

sx={{
p:4,
height:"100%",
borderRadius:6,
background:"rgba(255,255,255,.08)",
backdropFilter:"blur(25px)",
border:"1px solid rgba(255,255,255,.12)",
textAlign:"center"
}}
>

{item.icon}

<Typography
fontWeight="bold"
color="white"
mt={2}
>

{item.title}

</Typography>

</MotionPaper>

</Grid>

))

}

</Grid>

</Box>



{/* =====================================
            FOOTER
===================================== */}

<Box
  sx={{
    py: 5,
    textAlign: "center",
    borderTop: "1px solid rgba(255,255,255,.12)"
  }}
>
  <Typography
    variant="h5"
    fontWeight="bold"
    color="white"
  >
    OpenServe Contract Fibre
  </Typography>

  <Typography
    color="#CBD5E1"
    mt={2}

  >
    Experience next-generation fibre connectivity with reliable speeds,
    professional installations and exceptional customer service.
  </Typography>

  <Typography
    color="#94A3B8"
    mt={4}
  >
    © 2026 OpenServe Fibre Applications. All Rights Reserved.
  </Typography>

</Box>

{/* Close the main content Box */}
</Box>
</Box>

);

};

export default ContractFibreLeads;


/* =====================================
                STYLES
===================================== */

const glassCard = {
background:"rgba(255,255,255,.08)",
backdropFilter:"blur(25px)",
border:"1px solid rgba(255,255,255,.12)",
borderRadius:5,
textAlign:"center",
height:"100%"
};