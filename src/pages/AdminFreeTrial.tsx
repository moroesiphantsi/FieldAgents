
import React, { useEffect, useState } from "react";

import {
Box,
Paper,
Typography,
Grid,
TextField,
Button,
Chip,
Avatar,
MenuItem,
Table,
TableHead,
TableBody,
TableRow,
TableCell,
TableContainer,
IconButton,
Dialog,
DialogTitle,
DialogContent,
DialogActions
} from "@mui/material";

import {
Search,
Person,
Call,
Email,
WhatsApp,
Delete,
Edit,
CheckCircle,
Cancel,
Pending,
Visibility,
Assignment,
Groups,
TrendingUp,
Download,

Refresh,
Verified,
SupportAgent
} from "@mui/icons-material";

import {
ResponsiveContainer,
XAxis,
YAxis,
Tooltip,
PieChart,
Pie,
Cell,
LineChart,
Line,
CartesianGrid
} from "recharts";

import {
ref,
onValue,
update,
remove
} from "firebase/database";

import { db } from "../firebase";

import InputAdornment from "@mui/material/InputAdornment";

const COLORS = [
"#2563eb",
"#22c55e",
"#f59e0b",
"#ef4444",
"#8b5cf6"
];

const AdminFreeTrial = () => {

const [applications,setApplications]=useState<any[]>([]

);
const [filtered,setFiltered]=useState<any[]>([]);

const [search,setSearch]=useState("");
const [statusFilter,setStatusFilter]=useState("");
const [monthFilter,setMonthFilter]=useState("");
const [yearFilter,setYearFilter]=useState("");
const [agentFilter,setAgentFilter]=useState("");

const [detailsOpen,setDetailsOpen]=useState(false);
const [selected,setSelected]=useState<any>(null);

const months=[
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

useEffect(()=>{

const freeTrialRef=ref(db,"freeTrialApplications");

onValue(freeTrialRef,(snapshot)=>{

const data=snapshot.val();

if(data){

const result=Object.keys(data).map(key=>({

id:key,

...data[key]

})).reverse();

setApplications(result);


}else{

setApplications([]);

}

});

},[]);

useEffect(()=>{

let data=[...applications];

if(search!==""){

data=data.filter(item=>`

${item.fullName}
${item.phone}
${item.email}
${item.address}
${item.agentName}


`
.toLowerCase()
.includes(search.toLowerCase()));

}

if(statusFilter!==""){

data=data.filter(
x=>x.status===statusFilter
);

}

if(agentFilter!==""){

data=data.filter(
x=>x.agentName===agentFilter
);

}

if(monthFilter!==""){


data=data.filter(item=>

new Date(item.createdAt)
.getMonth()
===Number(monthFilter)

);

}

if(yearFilter!==""){

data=data.filter(item=>

new Date(item.createdAt)
.getFullYear()
===Number(yearFilter)

);

}

setFiltered(data);


},
[
applications,
search,
statusFilter,
agentFilter,
monthFilter,
yearFilter
]);

const totalApplications=filtered.length;

const approved=filtered.filter(
x=>x.status==="Approved"
).length;

const pending=filtered.filter(
x=>x.status==="Pending"
).length;

const rejected=filtered.filter(
x=>x.status==="Rejected"
).length;


const chartData=[
{
name:"Approved",
value:approved
},
{
name:"Pending",
value:pending
},
{
name:"Rejected",
value:rejected
}
];

const monthlyData=months.map((m,index)=>({

month:m.substring(0,3),

Applications:

filtered.filter(item=>

new Date(item.createdAt)
.getMonth()===index

).length

}));





/* ==========================================================
   DASHBOARD
========================================================== */

return (

<Box sx={container}>

<Box sx={floatingGlow1}/>
<Box sx={floatingGlow2}/>

<Box sx={floatingGlow3}/>

<Typography
variant="h3"
fontWeight="bold"
sx={title}
>

🚀 OpenServe Free Trial Admin Portal

</Typography>

<Typography sx={subTitle}>

Manage every free trial request, approve customers, contact applicants,
track performance and monitor the 14-Day Free Trial programme.

</Typography>

{/* ========================================================== */}


<Paper sx={filterCard}>

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
/>

</Grid>

<Grid item xs={12} md={2}>


<TextField
select
fullWidth
label="Status"
value={statusFilter}
onChange={(e)=>setStatusFilter(e.target.value)}
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
>

<MenuItem value="">All</MenuItem>

{months.map((m,index)=>(

<MenuItem
key={m}
value={index}
>

{m}

</MenuItem>

))}

</TextField>

</Grid>

<Grid item xs={12} md={2}>

<TextField
fullWidth
label="Year"
value={yearFilter}
onChange={(e)=>setYearFilter(e.target.value)}
placeholder="2026"
/>

</Grid>

<Grid item xs={12} md={3}>

<TextField
fullWidth
label="Assigned Agent"
value={agentFilter}
onChange={(e)=>setAgentFilter(e.target.value)}
/>

</Grid>


</Grid>

</Paper>

{/* ========================================================== */}

<Grid container spacing={3}>

<Grid item xs={12} md={3}>

<Paper sx={statCard}>

<Assignment color="primary"/>

<Typography>Total Applications</Typography>

<Typography fontSize={34} fontWeight="bold">

{totalApplications}

</Typography>


</Paper>

</Grid>

<Grid item xs={12} md={3}>

<Paper sx={statCard}>

<CheckCircle color="success"/>

<Typography>Approved</Typography>

<Typography fontSize={34} fontWeight="bold">

{approved}

</Typography>

</Paper>

</Grid>

<Grid item xs={12} md={3}>


<Paper sx={statCard}>

<Pending color="warning"/>

<Typography>Pending</Typography>

<Typography fontSize={34} fontWeight="bold">

{pending}

</Typography>

</Paper>

</Grid>

<Grid item xs={12} md={3}>

<Paper sx={statCard}>

<Cancel color="error"/>

<Typography>Rejected</Typography>


<Typography fontSize={34} fontWeight="bold">

{rejected}

</Typography>

</Paper>

</Grid>

</Grid>

{/* ========================================================== */}

<Grid
container
spacing={3}
sx={{mt:1}}
>

<Grid item xs={12} lg={7}>


<Paper sx={chartCard}>

<Typography
fontWeight="bold"
mb={2}
>

📈 Monthly Applications

</Typography>

<ResponsiveContainer
width="100%"
height={320}
>

<LineChart data={monthlyData}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="month"/>

<YAxis/>


<Tooltip/>

<Line
type="monotone"
dataKey="Applications"
stroke="#2563eb"
strokeWidth={4}
/>

</LineChart>

</ResponsiveContainer>

</Paper>

</Grid>

<Grid item xs={12} lg={5}>

<Paper sx={chartCard}>

<Typography
fontWeight="bold"

mb={2}
>

📊 Trial Status

</Typography>

<ResponsiveContainer
width="100%"
height={320}
>

<PieChart>

<Pie
data={chartData}
outerRadius={110}
label
dataKey="value"
>

{chartData.map((entry,index)=>(

<Cell

key={index}
fill={COLORS[index]}
/>

))}

</Pie>

<Tooltip/>

</PieChart>

</ResponsiveContainer>

</Paper>

</Grid>

</Grid>




{/* 

==========================================================
        FREE TRIAL APPLICATIONS MANAGEMENT
========================================================== */}

<Paper
    sx={tableCard}
>

<Box
display="flex"
justifyContent="space-between"
alignItems="center"
mb={3}
>

<Typography
variant="h5"
fontWeight="bold"
>

📋 Free Trial Applications

</Typography>

<Chip
label={`${filtered.length} Applications`}
color="primary"
/>

</Box>

<TableContainer>

<Table>

<TableHead>

<TableRow>

<TableCell><b>Customer</b></TableCell>

<TableCell><b>Contact</b></TableCell>

<TableCell><b>Agent</b></TableCell>

<TableCell><b>Area</b></TableCell>


<TableCell><b>Status</b></TableCell>

<TableCell><b>Date</b></TableCell>

<TableCell align="center"><b>Contact</b></TableCell>

<TableCell align="center"><b>Manage</b></TableCell>

</TableRow>

</TableHead>

<TableBody>

{

filtered.map((customer:any)=>(

<TableRow
hover
key={customer.id}

>

<TableCell>

<Box
display="flex"
alignItems="center"
gap={2}
>

<Avatar
sx={{
bgcolor:"#2563eb"
}}
>

<Person/>

</Avatar>

<Box>

<Typography
fontWeight={700}

>

{customer.fullName}

</Typography>

<Typography
variant="body2"
color="text.secondary"
>

ID:
{customer.idNumber}

</Typography>

</Box>

</Box>

</TableCell>

<TableCell>

<Typography>

{customer.phone}

</Typography>

<Typography
variant="body2"
>

{customer.email}

</Typography>

</TableCell>

<TableCell>

{customer.agentName || "Not Assigned"}

</TableCell>

<TableCell>

{customer.area}

</TableCell>

<TableCell>

<Chip

label={customer.status}

color={

customer.status==="Approved"

?

"success"

:

customer.status==="Rejected"

?

"error"

:

"warning"

}

/>

</TableCell>

<TableCell>

{

customer.createdAt

?

new Date(customer.createdAt)

.toLocaleDateString()

:

"-"

}

</TableCell>

<TableCell align="center">

<IconButton

color="success"

onClick={()=>window.open(

`https://wa.me/27${customer.phone.replace(/^0/,"")}`,

"_blank"

)}

>


<WhatsApp/>

</IconButton>

<IconButton

color="primary"

onClick={()=>window.open(

`tel:${customer.phone}`

)}

>

<Call/>

</IconButton>

<IconButton

color="secondary"


onClick={()=>window.open(

`mailto:${customer.email}`

)}

>

<Email/>

</IconButton>

</TableCell>

<TableCell align="center">

<Button

size="small"

variant="contained"

startIcon={<Visibility/>}


sx={{mr:1}}

onClick={()=>{

setSelected(customer);

setDetailsOpen(true);

}}

>

View

</Button>

<Button

size="small"

variant="contained"

color="success"


sx={{mr:1}}

onClick={()=>{

update(

ref(db,`freeTrialApplications/${customer.id}`),

{

status:"Approved"

}

);

}}

>

Approve

</Button>


<Button

size="small"

variant="contained"

color="warning"

sx={{mr:1}}

onClick={()=>{

update(

ref(db,`freeTrialApplications/${customer.id}`),

{

status:"Pending"

}

);


}}

>

Pending

</Button>

<Button

size="small"

variant="contained"

color="error"

sx={{mr:1}}

onClick={()=>{

update(

ref(db,`freeTrialApplications/${customer.id}`),


{

status:"Rejected"

}

);

}}

>

Reject

</Button>

<IconButton

color="error"

onClick={()=>{

remove(


ref(

db,

`freeTrialApplications/${customer.id}`

)

);

}}

>

<Delete/>

</IconButton>

</TableCell>

</TableRow>

))


}

</TableBody>

</Table>

</TableContainer>

</Paper>



{/* ==========================================================
        ADMIN MANAGEMENT PANEL (2026 OpenServe)
========================================================== */}

<Paper
    sx={{
        mt: 4,

        p: 4,
        borderRadius: 5,
        background: "rgba(255,255,255,.96)",
        backdropFilter: "blur(18px)",
        boxShadow: "0 20px 45px rgba(0,0,0,.15)"
    }}
>

<Typography
variant="h5"
fontWeight="bold"
mb={3}
>

⚙️ Free Trial Administration Centre

</Typography>

{
selected && (

<Grid container spacing={3}>

<Grid item xs={12} md={6}>


<TextField
fullWidth
label="Assign Sales Agent"
value={selected.agentName || ""}
onChange={(e)=>
setSelected({
...selected,
agentName:e.target.value
})
}
/>

</Grid>

<Grid item xs={12} md={6}>

<TextField
select
fullWidth
label="Application Status"
value={selected.status}
onChange={(e)=>
setSelected({

...selected,
status:e.target.value
})
}
>

<MenuItem value="Pending">
Pending
</MenuItem>

<MenuItem value="Approved">
Approved
</MenuItem>

<MenuItem value="Rejected">
Rejected
</MenuItem>

<MenuItem value="Installed">
Installed
</MenuItem>

</TextField>

</Grid>

<Grid item xs={12} md={6}>

<TextField
type="date"
fullWidth
InputLabelProps={{shrink:true}}
label="Installation Date"
value={selected.installationDate || ""}
onChange={(e)=>
setSelected({
...selected,
installationDate:e.target.value
})
}
/>

</Grid>

<Grid item xs={12} md={6}>

<TextField
fullWidth

label="Assigned Technician"
value={selected.technician || ""}
onChange={(e)=>
setSelected({
...selected,
technician:e.target.value
})
}
/>

</Grid>

<Grid item xs={12}>

<TextField
fullWidth
multiline
rows={4}
label="Admin Notes"
value={selected.adminNotes || ""}
onChange={(e)=>
setSelected({
...selected,
adminNotes:e.target.value

})
}
/>

</Grid>

<Grid item xs={12}>

<Box
display="flex"
gap={2}
flexWrap="wrap"
>

<Button

variant="contained"

color="primary"

startIcon={<Edit/>}

onClick={async()=>{

await update(

ref(db,`freeTrialApplications/${selected.id}`),

{

agentName:selected.agentName,

status:selected.status,

installationDate:selected.installationDate,

technician:selected.technician,

adminNotes:selected.adminNotes

}

);

alert("Application Updated Successfully");

}}

>

Save Changes

</Button>

<Button

variant="contained"

color="success"

startIcon={<WhatsApp/>}

onClick={()=>{

window.open(

`https://wa.me/27${selected.phone.replace(/^0/,"")}?text=Hello ${selected.fullName}, your OpenServe Free Trial application status is ${selected.status}. Please contact us if you require any assistance.`,

"_blank"

);

}}

>

WhatsApp Customer

</Button>

<Button

variant="contained"

color="secondary"

startIcon={<Email/>}

onClick={()=>{

window.open(

`mailto:${selected.email}?subject=OpenServe Free Trial&body=Hello ${selected.fullName}, your application status is ${selected.status}.`

);

}}

>

Email Customer

</Button>

<Button

variant="contained"

color="info"

startIcon={<Call/>}

onClick={()=>{

window.open(

`tel:${selected.phone}`

);

}}

>

Call Customer

</Button>

<Button

variant="contained"

color="error"

startIcon={<Delete/>}

onClick={async()=>{

if(window.confirm("Delete this application?")){

await remove(

ref(db,`freeTrialApplications/${selected.id}`)

);

setDetailsOpen(false);

}

}}

>

Delete Application

</Button>

</Box>

</Grid>

</Grid>

)

}

</Paper>

{/* ==========================================================
        CUSTOMER DETAILS DIALOG
========================================================== */}

<Dialog
open={detailsOpen}
onClose={()=>setDetailsOpen(false)}
maxWidth="md"
fullWidth
>

<DialogTitle>

👤 Customer Details

</DialogTitle>

<DialogContent>

{

selected && (

<Grid
container
spacing={2}
sx={{mt:1}}
>

<Grid item xs={12} md={6}>

<Typography><b>Name</b></Typography>

<Typography>

{selected.fullName}

</Typography>

</Grid>

<Grid item xs={12} md={6}>

<Typography><b>ID Number</b></Typography>

<Typography>

{selected.idNumber}

</Typography>

</Grid>

<Grid item xs={12} md={6}>

<Typography><b>Phone</b></Typography>

<Typography>

{selected.phone}

</Typography>

</Grid>

<Grid item xs={12} md={6}>

<Typography><b>Email</b></Typography>

<Typography>

{selected.email}

</Typography>

</Grid>

<Grid item xs={12}>

<Typography><b>Address</b></Typography>

<Typography>

{selected.address}

</Typography>

</Grid>

<Grid item xs={12}>

<Typography><b>Current Status</b></Typography>

<Chip
label={selected.status}
color={
selected.status==="Approved"
?
"success"
:
selected.status==="Rejected"
?
"error"
:
"warning"
}
/>

</Grid>

</Grid>

)

}

</DialogContent>

<DialogActions>

<Button
onClick={()=>setDetailsOpen(false)}
>

Close

</Button>

</DialogActions>

</Dialog>


{/* ==========================================================
        ANALYTICS & EXPORT SECTION
========================================================== */}

<Paper
    sx={{
        mt: 4,
        p: 4,
        borderRadius: 5,
        background: "rgba(255,255,255,.96)",
        backdropFilter: "blur(16px)"
    }}
>

<Typography
variant="h5"
fontWeight="bold"
mb={3}
>

📊 OpenServe Analytics Centre

</Typography>

<Grid container spacing={3}>

<Grid item xs={12} md={3}>

<Paper sx={statCard}>

<Groups
sx={{
fontSize:40,
color:"#2563eb"
}}
/>

<Typography>

Total Customers

</Typography>

<Typography

fontSize={30}
fontWeight="bold"
>

{filtered.length}

</Typography>

</Paper>

</Grid>

<Grid item xs={12} md={3}>

<Paper sx={statCard}>

<Verified
sx={{
fontSize:40,
color:"#22c55e"
}}
/>

<Typography>


Successful Trials

</Typography>

<Typography
fontSize={30}
fontWeight="bold"
>

{approved}

</Typography>

</Paper>

</Grid>

<Grid item xs={12} md={3}>

<Paper sx={statCard}>

<SupportAgent
sx={{

fontSize:40,
color:"#7c3aed"
}}
/>

<Typography>

Assigned Agents

</Typography>

<Typography
fontSize={30}
fontWeight="bold"
>

{

new Set(

filtered.map(

x=>x.agentName

)

).size

}

</Typography>

</Paper>

</Grid>

<Grid item xs={12} md={3}>

<Paper sx={statCard}>

<TrendingUp
sx={{
fontSize:40,
color:"#f59e0b"
}}
/>

<Typography>


Conversion Rate

</Typography>

<Typography
fontSize={30}
fontWeight="bold"
>

{

filtered.length===0

?

0

:

Math.round(

approved

/

filtered.length

*

100

)

}

%

</Typography>

</Paper>

</Grid>

</Grid>

<Box
display="flex"

gap={2}
flexWrap="wrap"
mt={4}
>

<Button

variant="contained"

startIcon={<Download/>}

onClick={()=>window.print()}

>

Print Report

</Button>

<Button

variant="contained"

color="success"


startIcon={<Download/>}

onClick={()=>{

const json=JSON.stringify(filtered,null,2);

const blob=new Blob([json],{

type:"application/json"

});

const url=URL.createObjectURL(blob);

const a=document.createElement("a");

a.href=url;

a.download="FreeTrialApplications.json";

a.click();

}}


>

Export JSON

</Button>

<Button

variant="contained"

color="secondary"

startIcon={<Refresh/>}

onClick={()=>window.location.reload()}

>

Refresh Dashboard

</Button>

</Box>


</Paper>

{/* ==========================================================
        FOOTER
========================================================== */}

<Box
sx={{
mt:6,
textAlign:"center",
color:"#cbd5e1",
pb:4
}}
>

<Typography
fontWeight="bold"
>

© 2026 OpenServe Free Trial Administration 

Portal

</Typography>

<Typography
variant="body2"
>

Built for modern fibre management • Real-time Firebase • Secure Admin Dashboard

</Typography>

</Box>

</Box>

);

};

export default AdminFreeTrial;

/* 

==========================================================
        STYLES
========================================================== */

const container={

minHeight:"100vh",

padding:4,

background:
"linear-gradient(135deg,#07152d,#0b4ea2,#00b4ff)",

backgroundSize:"400% 400%",

animation:"gradientMove 15s ease infinite"

};

const title={

color:"#fff",

fontWeight:900,

textAlign:"center",

mb:1,

letterSpacing:1

};

const subTitle={

color:"#dbeafe",

textAlign:"center",

mb:4,

fontSize:18

};

const filterCard={

padding:3,

borderRadius:5,

background:"rgba(255,255,255,.96)",

backdropFilter:"blur(14px)",

mb:4

};

const chartCard={

padding:3,

borderRadius:5,

background:"rgba(255,255,255,.96)",

backdropFilter:"blur(18px)"

};

const tableCard={

padding:3,

marginTop:4,

borderRadius:5,

background:"rgba(255,255,255,.96)",

backdropFilter:"blur(18px)"

};

const statCard={

padding:3,

borderRadius:5,

display:"flex",

flexDirection:"column",

alignItems:"center",

justifyContent:"center",

gap:1,

background:"rgba(255,255,255,.96)",

boxShadow:"0 15px 35px rgba(0,0,0,.12)",

transition:"0.4s",

cursor:"pointer",

"&:hover":{

transform:"translateY(-8px) scale(1.03)"

}

};

const floatingGlow1={

position:"fixed",

top:-120,

left:-120,

width:320,

height:320,

borderRadius:"50%",

background:"rgba(37,99,235,.25)",

filter:"blur(120px)",

zIndex:0

};

const floatingGlow2={

position:"fixed",

bottom:-150,

right:-100,

width:350,

height:350,

borderRadius:"50%",

background:"rgba(34,197,94,.18)",

filter:"blur(140px)",

zIndex:0

};

const floatingGlow3={

position:"fixed",

top:"40%",

left:"45%",

width:220,

height:220,

borderRadius:"50%",

background:"rgba(0,180,255,.18)",

filter:"blur(120px)",

zIndex:0

};
