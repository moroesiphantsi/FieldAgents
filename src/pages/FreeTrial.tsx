import React, { useState, CSSProperties } from "react";

import {
Box,
Paper,
Typography,
Grid,
TextField,
Button,
MenuItem,
Checkbox,
FormControlLabel,
Stack,
Chip,

Card,
CardContent 
} from "@mui/material";

import {
Wifi,
RocketLaunch,
Verified,
Speed,
Security,
SupportAgent,
ArrowForward,
CheckCircle,
Star,
Home,
LocationOn,
Phone,
Email,
Person
} from "@mui/icons-material";

import { motion } from "framer-motion";

import { Avatar, } from "@mui/material";

import { ref, push, set } from "firebase/database";

import { db } from "../firebase";


const provinces = [
"Gauteng",
"Limpopo",
"Mpumalanga",
"North West",
"Free State",
"Eastern Cape",
"Western Cape",
"KwaZulu-Natal",
"Northern Cape"
];


const FreeTrial = () => {

const [loading,setLoading]=useState(false);

const [form,setForm]=useState({

fullName:"",
phone:"",
email:"",
idNumber:"",
address:"",
suburb:"",
city:"",
province:"",
notes:"",
agree:false

});

const handleChange=(field:string,value:any)=>{

setForm({


...form,

[field]:value

});

};

const submitTrial=async()=>{

if(
!form.fullName ||
!form.phone ||
!form.address ||
!form.idNumber
){

alert("Please complete all required fields.");

return;

}

setLoading(true);

const trialRef=push(ref(db,"freeTrialApplications"));

await set(trialRef,{

...form,

status:"Pending",

createdAt:new Date().toISOString(),

trialEnds:new Date(

Date.now()+14*24*60*60*1000

).toISOString()

});

setLoading(false);

alert("Congratulations! Your FREE 14-Day Trial request has been submitted.");


setForm({

fullName:"",
phone:"",
email:"",
idNumber:"",
address:"",
suburb:"",
city:"",
province:"",
notes:"",
agree:false

});

};

return(

<Box sx={styles.page}>

{/* Animated Background */}


<Box sx={styles.background}>

<motion.div

animate={{
y:[0,-25,0],
x:[0,15,0]
}}

transition={{
duration:7,
repeat:Infinity
}}

style={styles.circle1}
/>

<motion.div

animate={{
y:[0,40,0],
x:[0,-20,0]
}}


transition={{
duration:9,
repeat:Infinity
}}

style={styles.circle2}
/>

<motion.div

animate={{
scale:[1,1.2,1]
}}

transition={{
duration:8,
repeat:Infinity
}}

style={styles.circle3}
/>

</Box>


{/* HERO */}

<Box
sx={{
position:"relative",
zIndex:2,
textAlign:"center",
mb:6
}}
>

<motion.div

initial={{opacity:0,y:-60}}

animate={{opacity:1,y:0}}

transition={{duration:1}}

>

<Chip

icon={<Verified/>}

label="2026 OPENSERVE FIBRE FREE TRIAL"

sx={{

mb:3,

fontWeight:"bold",

fontSize:16,

background:"#22c55e",

color:"white",

px:2,

py:3

}}

/>

</motion.div>

<motion.div

animate={{
y:[0,-10,0]
}}

transition={{
repeat:Infinity,
duration:4
}}

>

<Typography

variant="h2"

fontWeight="900"

color="white"

>


Experience FREE 14-Days Trial

</Typography>

<Typography

variant="h2"

fontWeight="900"

sx={{

background:

"linear-gradient(90deg,#38bdf8,#60a5fa,#818cf8)",

WebkitBackgroundClip:"text",

WebkitTextFillColor:"transparent"

}}

>

OpenServe Fibre Internet

</Typography>

</motion.div>

<motion.div

animate={{
x:[0,10,0,-10,0]
}}

transition={{
repeat:Infinity,
duration:8
}}

>

<Typography

sx={{


mt:3,

fontSize:22,

color:"#dbeafe",

maxWidth:850,

mx:"auto",

lineHeight:1.8

}}

>

Enjoy blazing-fast fibre internet with our
exclusive <b>FREE 14-Day Trial.</b>

No hidden costs.

No commitments.

Experience streaming, gaming,
video calls and business connectivity
before making your decision.

</Typography>

</motion.div>

<Stack

direction="row"

spacing={2}

justifyContent="center"

flexWrap="wrap"

mt={5}

>

<Chip icon={<Speed/>} label="Ultra Fast Fibre"/>

<Chip icon={<Security/>} label="Secure Connection"/>

<Chip icon={<SupportAgent/>} label="24/7 Support"/>

<Chip icon={<RocketLaunch/>} label="Free Installation Assessment"/>

</Stack>

</Box>

{/* ==========================================
            FREE TRIAL FORM
=======================================

=== */}

<motion.div

initial={{opacity:0,y:80}}

whileInView={{opacity:1,y:0}}

transition={{duration:1}}

>

<Paper

sx={{

p:5,

borderRadius:6,

background:"rgba(255,255,255,.96)",

boxShadow:"0 25px 60px rgba(0,0,0,.25)"

}}

>

<Typography

variant="h4"

fontWeight="bold"

textAlign="center"

mb={1}

>

🚀 Start Your FREE 14-Day Fibre Trial

</Typography>

<Typography

textAlign="center"

color="text.secondary"

mb={5}

>

Complete the application below and our Fibre Consultants
will contact you to verify OpenServe coverage and activate
your FREE Trial.

</Typography>

<Grid container spacing={3}>

<Grid item xs={12} md={6}>

<TextField
fullWidth
label="Full Name *"
value={form.fullName}
onChange={(e)=>handleChange("fullName",e.target.value)}

InputProps={{
startAdornment:<Person sx={{mr:1}}/>
}}
/>

</Grid>

<Grid item xs={12} md={6}>

<TextField
fullWidth
label="Phone Number *"
value={form.phone}
onChange={(e)=>handleChange("phone",e.target.value)}
InputProps={{
startAdornment:<Phone sx={{mr:1}}/>
}}
/>

</Grid>

<Grid item xs={12} md={6}>

<TextField
fullWidth
label="Email Address"
value={form.email}
onChange={(e)=>handleChange("email",e.target.value)}
InputProps={{
startAdornment:<Email sx={{mr:1}}/>
}}
/>

</Grid>

<Grid item xs={12} md={6}>

<TextField
fullWidth
label="South African ID Number/ Passport Number"
value={form.idNumber}
onChange={(e)=>handleChange("idNumber",e.target.value)}
/>

</Grid>


<Grid item xs={12}>

<TextField
fullWidth
label="Installation Address *"
value={form.address}
onChange={(e)=>handleChange("address",e.target.value)}
InputProps={{
startAdornment:<Home sx={{mr:1}}/>
}}
/>

</Grid>

<Grid item xs={12} md={4}>

<TextField
fullWidth
label="Suburb"
value={form.suburb}
onChange={(e)=>handleChange("suburb",e.target.value)}

/>

</Grid>

<Grid item xs={12} md={4}>

<TextField
fullWidth
label="City"
value={form.city}
onChange={(e)=>handleChange("city",e.target.value)}
InputProps={{
startAdornment:<LocationOn sx={{mr:1}}/>
}}
/>

</Grid>

<Grid item xs={12} md={4}>

<TextField
select
fullWidth

label="Province"
value={form.province}
onChange={(e)=>handleChange("province",e.target.value)}
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
rows={4}
multiline
label="Additional Notes"
value={form.notes}
onChange={(e)=>handleChange("notes",e.target.value)}
/>

</Grid>


<Grid item xs={12}>

<FormControlLabel
control={
<Checkbox
checked={form.agree}

onChange={(e)=>handleChange("agree",e.target.checked)}
color="primary"
/>
}
label="I confirm that the information provided is correct and I agree to be contacted regarding my FREE 14-Day Fibre Trial."
/>

</Grid>

<Grid item xs={12}>

<Paper
sx={{
p:3,
borderRadius:4,
background:"#eff6ff",
border:"1px solid #bfdbfe"
}}
>

<Typography

fontWeight="bold"
fontSize={20}
mb={2}
>

🎁 Your FREE Trial Includes

</Typography>

<Stack spacing={2}>

<Box display="flex" alignItems="center" gap={2}>
<CheckCircle color="success"/>
<Typography>
FREE 14 Days of High-Speed Fibre Internet
</Typography>
</Box>

<Box display="flex" alignItems="center" gap={2}>
<CheckCircle color="success"/>
<Typography>
FREE Fibre Coverage Verification
</Typography>
</Box>


<Box display="flex" alignItems="center" gap={2}>
<CheckCircle color="success"/>
<Typography>
Professional Installation Assessment
</Typography>
</Box>

<Box display="flex" alignItems="center" gap={2}>
<CheckCircle color="success"/>
<Typography>
Unlimited Streaming & Gaming Experience
</Typography>
</Box>

<Box display="flex" alignItems="center" gap={2}>
<CheckCircle color="success"/>
<Typography>
Dedicated Technical Support
</Typography>
</Box>

<Box display="flex" alignItems="center" gap={2}>
<CheckCircle color="success"/>

<Typography>
No Hidden Costs During Trial Period
</Typography>
</Box>

</Stack>

</Paper>

</Grid>

<Grid item xs={12}>

<motion.div
whileHover={{scale:1.03}}
whileTap={{scale:.97}}
>

<Button

fullWidth

size="large"

variant="contained"

disabled={!form.agree || loading}

onClick={submitTrial}

endIcon={<ArrowForward/>}

sx={{

height:65,

fontSize:22,

fontWeight:"bold",

borderRadius:5,

background:
"linear-gradient(90deg,#0284c7,#2563eb,#4f46e5)",

boxShadow:"0 15px 40px rgba(37,99,235,.45)",

textTransform:"none",

transition:".4s",

"&:hover":{

background:
"linear-gradient(90deg,#0369a1,#1d4ed8,#4338ca)"

}

}}

>

{

loading

?

"Submitting Your Application..."

:

"Start My FREE 14-Day Trial"

}

</Button>

</motion.div>

</Grid>

</Grid>

</Paper>

</motion.div>

{/* ==========================================
        WHY CHOOSE US
========================================== */}


<Box sx={{mt:8}}>

<Typography

variant="h3"

fontWeight="bold"

textAlign="center"

color="white"

mb={5}

>

Why Thousands Choose Our Fibre

</Typography>

<Grid container spacing={4}>

{[

{
title:"Ultra Fast Speeds",
desc:"Download movies, stream 4K content and game online without buffering.",
icon:<Speed sx={{fontSize:50}}/>
},
{
title:"Reliable Connectivity",
desc:"Stay connected with industry-leading uptime and fibre reliability.",
icon:<Wifi sx={{fontSize:50}}/>
},
{
title:"Professional Support",
desc:"Friendly consultants ready to assist before and after installation.",
icon:<SupportAgent sx={{fontSize:50}}/>
}
].map((item,index)=>(

<Grid item xs={12} md={4} key={index}>

<motion.div

initial={{opacity:0,y:60}}

whileInView={{opacity:1,y:0}}

transition={{
duration:.8,
delay:index*.2
}}

whileHover={{
y:-10
}}

>

<Card

sx={{

height:"100%",

borderRadius:5,

background:"rgba(255,255,255,.08)",


backdropFilter:"blur(18px)",

color:"white",

textAlign:"center",

p:3

}}

>

<Box
color="#38bdf8"
mb={2}
>

{item.icon}

</Box>

<Typography
fontWeight="bold"

fontSize={24}
mb={2}
>

{item.title}

</Typography>

<Typography
color="#dbeafe"
lineHeight={1.8}
>

{item.desc}

</Typography>

</Card>

</motion.div>

</Grid>

))}


</Grid>

</Box>


{/* ==========================================
            CUSTOMER TESTIMONIALS
========================================== */}

<Box sx={{ mt: 8 }}>

<Typography
variant="h3"
fontWeight="bold"
color="white"
textAlign="center"
mb={5}
>
What Our Customers Say
</Typography>


<Grid container spacing={4}>

{[
{
name:"Sarah M.",
city:"Johannesburg",
comment:"Installation was quick and the fibre speed is incredible. Streaming has never been this smooth."
},
{
name:"David K.",
city:"Pretoria",
comment:"Excellent customer service and professional technicians. Highly recommended."
},
{
name:"Lerato P.",
city:"Polokwane",
comment:"The FREE Trial convinced me immediately. Reliable internet with zero buffering."
}

].map((item,index)=>(

<Grid item xs={12} md={4} key={index}>

<motion.div
initial={{opacity:0,y:60}}
whileInView={{opacity:1,y:0}}
transition={{duration:.8,delay:index*.2}}
whileHover={{scale:1.04}}
>

<Card
sx={{
borderRadius:5,
height:"100%",
background:"rgba(255,255,255,.08)",
backdropFilter:"blur(18px)",
color:"white"
}}
>

<CardContent>

<Avatar

sx={{
width:70,
height:70,
mx:"auto",
mb:2,
bgcolor:"#2563eb"
}}
>
<Person/>
</Avatar>

<Box
display="flex"
justifyContent="center"
mb={2}
>
<Star color="warning"/>
<Star color="warning"/>
<Star color="warning"/>
<Star color="warning"/>
<Star color="warning"/>
</Box>

<Typography

textAlign="center"
sx={{
lineHeight:1.8,
color:"#dbeafe"
}}
>
"{item.comment}"
</Typography>

<Typography
mt={3}
fontWeight="bold"
textAlign="center"
>
{item.name}
</Typography>

<Typography
textAlign="center"
color="#93c5fd"
>
{item.city}
</Typography>

</CardContent>

</Card>

</motion.div>

</Grid>

))}

</Grid>

</Box>

{/* ==========================================
                FAQ
========================================== */}

<Box sx={{ mt:10 }}>

<Typography

variant="h3"
fontWeight="bold"
color="white"
textAlign="center"
mb={5}
>
Frequently Asked Questions
</Typography>

<Grid container spacing={3}>

{[
{
q:"How long is the FREE Trial?",
a:"Your FREE Trial runs for 14 consecutive days after activation."
},
{
q:"Will I pay anything during the trial?",
a:"No. There are no hidden charges during the approved trial period."
},
{
q:"Do I need fibre coverage?",

a:"Yes. Our team will first verify OpenServe fibre availability at your address."
},
{
q:"Can I continue after the trial?",
a:"Absolutely. You can choose your preferred fibre package after experiencing the service."
}
].map((faq,index)=>(

<Grid item xs={12} md={6} key={index}>

<motion.div
initial={{opacity:0,x:index%2===0?-80:80}}
whileInView={{opacity:1,x:0}}
transition={{duration:.8}}
>

<Paper
sx={{
p:3,
borderRadius:5,
background:"rgba(255,255,255,.08)",
backdropFilter:"blur(18px)",

color:"white"
}}
>

<Typography
fontWeight="bold"
fontSize={20}
mb={2}
>
{faq.q}
</Typography>

<Typography
color="#dbeafe"
lineHeight={1.8}
>
{faq.a}
</Typography>

</Paper>

</motion.div>

</Grid>


))}

</Grid>

</Box>

{/* ==========================================
            FINAL CALL TO ACTION
========================================== */}

<motion.div

animate={{
y:[0,-12,0]
}}

transition={{
repeat:Infinity,
duration:3
}}


>

<Box
sx={{
mt:10,
textAlign:"center"
}}
>

<Typography
variant="h2"
fontWeight="900"
color="white"
mb={2}
>
Ready To Experience Fibre?
</Typography>

<Typography
fontSize={22}
color="#dbeafe"
mb={5}
>

Join thousands of South Africans already enjoying
fast, reliable OpenServe Fibre Internet.

Start your FREE 14-Day Trial today.

</Typography>

<Button

size="large"

variant="contained"

onClick={()=>
window.scrollTo({
top:0,
behavior:"smooth"
})
}

sx={{
height:70,
px:7,

fontSize:22,
fontWeight:"bold",
borderRadius:5,
textTransform:"none",
background:"linear-gradient(90deg,#0284c7,#2563eb,#4f46e5)"
}}

>

Apply Now

</Button>

</Box>

</motion.div>

{/* ==========================================
                FOOTER
========================================== */}


<Box
sx={{
mt:12,
py:5,
borderTop:"1px solid rgba(255,255,255,.15)",
textAlign:"center"
}}
>

<Typography
color="#dbeafe"
>

© 2026 Fibre Solutions South Africa

</Typography>

<Typography
color="#93c5fd"
mt={1}
>

Powered by OpenServe Fibre Infrastructure


</Typography>

</Box>

</Box>

);

};


export default FreeTrial;


/* ==========================================
                STYLES
========================================== */

const styles: {[key: string]: CSSProperties}={

  page: {
    minHeight: "100vh",

    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg,#020617 0%,#0f172a 20%,#1d4ed8 55%,#2563eb 100%)",
    padding: "60px 25px 80px"
  },

  background: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    zIndex: 0
  },

  circle1: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "rgba(59,130,246,.18)",
    top: -180,
    left: -180,
    filter: "blur(90px)"

  },

  circle2: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: "50%",
    background: "rgba(14,165,233,.16)",
    right: -140,
    top: 120,
    filter: "blur(80px)"
  },

  circle3: {
    position: "absolute",
    width: 600,
    height: 600,
    borderRadius: "50%",
    background: "rgba(99,102,241,.14)",
    bottom: -250,
    left: "35%",
    transform: "translateX(-50%)",
    filter: "blur(120px)"
  },


  glassCard: {
    position: "relative",
    zIndex: 2,
    maxWidth: 1200,
    margin: "0 auto",
    padding: "40px",
    borderRadius: "30px",
    background: "rgba(255,255,255,.10)",
    backdropFilter: "blur(25px)",
    border: "1px solid rgba(255,255,255,.18)",
    boxShadow: "0 25px 80px rgba(0,0,0,.35)"
  },

  featureCard: {
    height: "100%",
    borderRadius: "24px",
    background: "rgba(255,255,255,.08)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,.12)",
    color: "#fff",
    transition: ".35s"
  },

  statCard: {
    textAlign: "center",
    padding: "25px",
    borderRadius: "22px",
    background: "rgba(255,255,255,.08)",
    backdropFilter: "blur(15px)",
    color: "#fff"
  },


  submitButton: {
    height: 65,
    borderRadius: 16,
    fontWeight: 700,
    fontSize: 20,
    textTransform: "none",
    background: "linear-gradient(90deg,#0369a1,#1d4ed8,#4338ca)",
    boxShadow: "0 18px 40px rgba(37,99,235,.40)"
    },
  

  sectionTitle: {
    color: "#fff",
    fontWeight: 800,
    textAlign: "center",
    marginBottom: "30px"
  },

  footer: {
    marginTop: "80px",
    paddingTop: "30px",
    borderTop: "1px solid rgba(255,255,255,.15)",
    textAlign: "center",
    color: "#dbeafe"
  },

};