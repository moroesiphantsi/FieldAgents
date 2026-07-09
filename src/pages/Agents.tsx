import React, { useEffect, useState } from "react";

import {
Box,
Paper,
Typography,
Grid,
TextField,
MenuItem,
Chip,
Avatar,
Button,
Table,
TableHead,
TableBody,
TableRow,
TableCell,
TableContainer,
IconButton
} from "@mui/material";

import {
Person,
Search,
Assignment,
Paid,
CheckCircle,
Pending,
Delete,
Edit
} from "@mui/icons-material";

import {
ResponsiveContainer,
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
PieChart,
Pie,
Cell
} from "recharts";

import {
ref,
onValue,
remove,
update,
push,
set
} from "firebase/database";

import { db } from "../firebase";
import InputAdornment from "@mui/material/InputAdornment";



const Agents = () => {

const [agents,setAgents]=useState<any[]>([]);
const [updates,setUpdates]=useState<any[]>([]);
const [statusFilter,setStatusFilter]=useState("");

const [search,setSearch]=useState("");

const [agentFilter,setAgentFilter]=useState("");

const [month,setMonth]=useState("");

const [year,setYear]=useState("");



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


const emptyAgent = {
    firstName: "",
    lastName: "",
    employeeNo: "",
    idNumber: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    province: "",
    position: "Sales Agent",
    department: "Field Sales",
    status: "Active",
    gender: "",
    dateJoined: new Date().toISOString().split("T")[0],
    profileImage: "",
    notes: "",
    createdAt: new Date().toISOString()
};

const [agent,setAgent] = useState(emptyAgent);
const [editingAgent,setEditingAgent] = useState<any>(null);

useEffect(() => {

    const reportsRef = ref(db, "fieldUpdates");

    onValue(reportsRef, snap => {

        const data = snap.val();

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




const filteredReports=updates.filter(item=>{

const text=`

${item.agentName}

${item.customerName}

${item.phone}

${item.address}

${item.packagePlan}

`;

return(

text
.toLowerCase()
.includes(search.toLowerCase())

&&

(agentFilter===""
||
item.agentName===agentFilter)

&&

(month===""

||

new Date(item.date)
.getMonth()

===Number(month))

&&

(year===""

||

new Date(item.date)
.getFullYear()

===Number(year))

);

});

const totalReports=filteredReports.length;

const confirmedCustomers=

filteredReports.filter(

x=>x.adminConfirmation==="Confirmed"

).length;

const pendingCustomers=

filteredReports.filter(

x=>x.adminConfirmation==="Pending"

).length;

const prepaidSales=

filteredReports.filter(

x=>

x.saleType==="Prepaid"

&&

x.adminConfirmation==="Confirmed"

).length;

const contractSales=

filteredReports.filter(

x=>

x.saleType==="Contract"

&&

x.adminConfirmation==="Confirmed"

).length;

const prepaidCommission=

prepaidSales*50;

const contractCommission=

contractSales*200;

const totalCommission=

prepaidCommission+contractCommission;

const agentPerformance=

agents.map(agent=>{

const reports=

filteredReports.filter(

x=>x.agentName===agent.name

);

const confirmed=

reports.filter(

x=>x.adminConfirmation==="Confirmed"

);

const prepaid=

confirmed.filter(

x=>x.saleType==="Prepaid"

).length;

const contract=

confirmed.filter(

x=>x.saleType==="Contract"

).length;

return{

agent:agent.name,

reports:reports.length,

customers:confirmed.length,

prepaid,

contract,

commission:

(prepaid*50)

+

(contract*200)

};

});

const chartData=

agentPerformance.map(a=>({

agent:a.agent,

Reports:a.reports,

Commission:a.commission

}));





useEffect(()=>{

onValue(ref(db,"agents"),snap=>{

const data=snap.val();

if(data){

setAgents(
Object.keys(data).map(key=>({
id:key,
...data[key]
}))
);

}else{

setAgents([]);

}

});

},[]);


const saveAgent = async () => {

    if (!agent.firstName || !agent.lastName) {
        alert("Please enter the agent's name.");
        return;
    }

    const data = {
        ...agent,
        name: `${agent.firstName} ${agent.lastName}`,
        fullName: `${agent.firstName} ${agent.lastName}`
    };

    if (editingAgent) {

        await update(
            ref(db, `agents/${editingAgent}`),
            data
        );

        setEditingAgent(null);

    } else {

        const newRef = push(ref(db, "agents"));

        await set(newRef, data);

    }

    setAgent(emptyAgent);

};

const editAgent = (item:any) => {

    setEditingAgent(item.id);

    setAgent({
        ...item,
        firstName: item.firstName || "",
        lastName: item.lastName || ""
    });

};





return (

<Box sx={container}>

<Typography
variant="h4"
fontWeight="bold"
color="white"
>
👨‍💼 Fibre Sales Manager Dashboard
</Typography>

<Typography
sx={{
color:"#cbd5e1",
mb:4
}}
>
Monitor agent performance, confirmed sales, commissions and customer activity.
</Typography>

{/* =======================
FILTERS
======================= */}

<Paper
sx={{
p:3,
mb:3,
borderRadius:4
}}
>

<Grid container spacing={2}>

<Grid item xs={12} md={3}>

<TextField
fullWidth
placeholder="Search customer..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
InputProps={{
startAdornment: (
        <InputAdornment position="start">
            <Search />
        </InputAdornment>
    )
}}
/>

</Grid>

<Grid item xs={12} md={3}>

<TextField
select
fullWidth
label="Agent"
value={agentFilter}
onChange={(e)=>setAgentFilter(e.target.value)}
>

<MenuItem value="">
All Agents
</MenuItem>

{
agents.map(agent=>(

<MenuItem
key={agent.id}
value={agent.fullName}
>
{agent.fullName}
</MenuItem>

))
}

</TextField>

</Grid>

<Grid item xs={12} md={3}>

<TextField
select
fullWidth
label="Month"
value={month}
onChange={(e)=>setMonth(e.target.value)}
>

<MenuItem value="">
All Months
</MenuItem>

{
months.map((m,index)=>(

<MenuItem
key={index}
value={index}
>
{m}
</MenuItem>

))
}

</TextField>

</Grid>

<Grid item xs={12} md={3}>

<TextField
fullWidth
label="Year"
value={year}
onChange={(e)=>setYear(e.target.value)}
placeholder="2026"
/>

</Grid>

</Grid>

</Paper>

{/* =======================
SUMMARY
======================= */}

<Grid container spacing={3}>

<Grid item xs={12} md={3}>

<Paper sx={statCard}>

<Assignment color="primary"/>

<Typography>
Total Reports
</Typography>

<Typography
fontSize={28}
fontWeight="bold"
>

{totalReports}

</Typography>

</Paper>

</Grid>

<Grid item xs={12} md={3}>

<Paper sx={statCard}>

<CheckCircle color="success"/>

<Typography>

Confirmed Customers

</Typography>

<Typography
fontSize={28}
fontWeight="bold"
>

{confirmedCustomers}

</Typography>

</Paper>

</Grid>

<Grid item xs={12} md={3}>

<Paper sx={statCard}>

<Pending color="warning"/>

<Typography>

Pending

</Typography>

<Typography
fontSize={28}
fontWeight="bold"
>

{pendingCustomers}

</Typography>

</Paper>

</Grid>

<Grid item xs={12} md={3}>

<Paper sx={statCard}>

<Paid color="success"/>

<Typography>

Total Commission

</Typography>

<Typography
fontSize={28}
fontWeight="bold"
>

R{totalCommission.toFixed(2)}

</Typography>

</Paper>

</Grid>

</Grid>

{/* =======================
SALES
======================= */}

<Grid
container
spacing={3}
sx={{mt:1}}
>

<Grid item xs={12} md={3}>

<Paper sx={statCard}>

<Typography>

📦 Prepaid Sales

</Typography>

<Typography
fontSize={28}
fontWeight="bold"
>

{prepaidSales}

</Typography>

<Chip
color="success"
label={`Commission R${prepaidCommission}`}
/>

</Paper>

</Grid>

<Grid item xs={12} md={3}>

<Paper sx={statCard}>

<Typography>

📑 Contract Sales

</Typography>

<Typography
fontSize={28}
fontWeight="bold"
>

{contractSales}

</Typography>

<Chip
color="primary"
label={`Commission R${contractCommission}`}
/>

</Paper>

</Grid>

<Grid item xs={12} md={3}>

<Paper sx={statCard}>

<Typography>

👥 Total Customers

</Typography>

<Typography
fontSize={28}
fontWeight="bold"
>

{confirmedCustomers}

</Typography>

</Paper>

</Grid>

<Grid item xs={12} md={3}>

<Paper sx={statCard}>

<Typography>

💰 Revenue Commission

</Typography>

<Typography
fontSize={28}
fontWeight="bold"
>

R{totalCommission}

</Typography>

</Paper>

</Grid>

</Grid>

{/* =======================
BAR CHART
======================= */}

<Paper
sx={{
p:3,
mt:4,
borderRadius:4
}}
>

<Typography
fontWeight="bold"
mb={2}
>

📊 Agent Performance

</Typography>

<ResponsiveContainer
width="100%"
height={350}
>

<BarChart
data={chartData}
>

<XAxis dataKey="agent"/>

<YAxis/>

<Tooltip/>

<Bar
dataKey="Reports"
/>

<Bar
dataKey="Commission"
/>

</BarChart>

</ResponsiveContainer>

</Paper>

{/* =======================
PIE CHART
======================= */}

<Paper
sx={{
p:3,
mt:4,
borderRadius:4
}}
>

<Typography
fontWeight="bold"
mb={2}
>

📈 Sales Distribution

</Typography>

<ResponsiveContainer
width="100%"
height={320}
>

<PieChart>

<Pie

data={[

{
name:"Prepaid",
value:prepaidSales
},

{
name:"Contract",
value:contractSales
}

]}

dataKey="value"

outerRadius={120}

label

>

<Cell fill="#22c55e"/>

<Cell fill="#2563eb"/>

</Pie>

<Tooltip/>

</PieChart>

</ResponsiveContainer>

</Paper>

{/* ===============================
AGENT PERFORMANCE TABLE
================================ */}

<Paper
sx={{
mt:4,
p:3,
borderRadius:4
}}
>

<Typography
variant="h6"
fontWeight="bold"
mb={2}
>

👨‍💼 Agent Performance

</Typography>

<TableContainer>

<Table>

<TableHead>

<TableRow>

<TableCell><b>Agent</b></TableCell>

<TableCell align="center"><b>Reports</b></TableCell>

<TableCell align="center"><b>Confirmed</b></TableCell>

<TableCell align="center"><b>Prepaid</b></TableCell>

<TableCell align="center"><b>Contract</b></TableCell>

<TableCell align="center"><b>Prepaid Comm.</b></TableCell>

<TableCell align="center"><b>Contract Comm.</b></TableCell>

<TableCell align="center"><b>Total Comm.</b></TableCell>

<TableCell align="center"><b>Last Sale</b></TableCell>

<TableCell align="center"><b>Status</b></TableCell>

<TableCell align="center"><b>Actions</b></TableCell>

</TableRow>

</TableHead>

<TableBody>

{

agentPerformance.map((agent)=>{

const reports=

filteredReports.filter(

x=>x.agentName===agent.agent

);

const prepaid=

reports.filter(

x=>

x.saleType==="Prepaid"

&&

x.adminConfirmation==="Confirmed"

).length;

const contract=

reports.filter(

x=>

x.saleType==="Contract"

&&

x.adminConfirmation==="Confirmed"

).length;

const prepaidCommission=

prepaid*50;

const contractCommission=

contract*200;

const totalCommission=

prepaidCommission+

contractCommission;

const lastSale=

reports.length

?

reports[0].date

:

"-";

const agentInfo=

agents.find(

a=>a.name===agent.agent

);

return(

<TableRow key={agent.agent} hover>

<TableCell>

<Box
display="flex"
alignItems="center"
gap={2}
>

<Avatar>

<Person/>

</Avatar>

{agent.agent}

</Box>

</TableCell>

<TableCell align="center">

{reports.length}

</TableCell>

<TableCell align="center">

{

reports.filter(

x=>x.adminConfirmation==="Confirmed"

).length

}

</TableCell>

<TableCell align="center">

{prepaid}

</TableCell>

<TableCell align="center">

{contract}

</TableCell>

<TableCell align="center">

R{prepaidCommission}

</TableCell>

<TableCell align="center">

R{contractCommission}

</TableCell>

<TableCell align="center">

<b>

R{totalCommission}

</b>

</TableCell>

<TableCell align="center">

{lastSale}

</TableCell>

<TableCell align="center">

<Chip

label={

agentInfo?.status ||

"Offline"

}

color={

agentInfo?.status==="Online"

?

"success"

:

"default"

}

/>

</TableCell>

<TableCell align="center">

<IconButton
color="primary"
>

<Edit/>

</IconButton>

<IconButton
color="error"
onClick={()=>{

if(agentInfo){

remove(

ref(

db,

`agents/${agentInfo.id}`

)

);

}

}}

>

<Delete/>

</IconButton>

</TableCell>

</TableRow>

);

})

}

</TableBody>

</Table>

</TableContainer>

</Paper>


<Paper sx={formCard}>

<Typography variant="h6" fontWeight="bold">
👤 Add New Agent
</Typography>

<Grid container spacing={2} sx={{mt:2}}>

<Grid item xs={12} md={6}>
<TextField
fullWidth
label="First Name"
value={agent.firstName}
onChange={(e)=>setAgent({...agent,firstName:e.target.value})}
/>
</Grid>

<Grid item xs={12} md={6}>
<TextField
fullWidth
label="Last Name"
value={agent.lastName}
onChange={(e)=>setAgent({...agent,lastName:e.target.value})}
/>
</Grid>

<Grid item xs={12} md={6}>
<TextField
fullWidth
label="Employee Number"
value={agent.employeeNo}
onChange={(e)=>setAgent({...agent,employeeNo:e.target.value})}
/>
</Grid>

<Grid item xs={12} md={6}>
<TextField
fullWidth
label="ID Number"
value={agent.idNumber}
onChange={(e)=>setAgent({...agent,idNumber:e.target.value})}
/>
</Grid>

<Grid item xs={12} md={6}>
<TextField
fullWidth
label="Phone Number"
value={agent.phone}
onChange={(e)=>setAgent({...agent,phone:e.target.value})}
/>
</Grid>

<Grid item xs={12} md={6}>
<TextField
fullWidth
label="Email"
value={agent.email}
onChange={(e)=>setAgent({...agent,email:e.target.value})}
/>
</Grid>

<Grid item xs={12} md={6}>
<TextField
fullWidth
label="Address"
value={agent.address}
onChange={(e)=>setAgent({...agent,address:e.target.value})}
/>
</Grid>

<Grid item xs={12} md={6}>
<TextField
fullWidth
label="City"
value={agent.city}
onChange={(e)=>setAgent({...agent,city:e.target.value})}
/>
</Grid>

<Grid item xs={12} md={6}>
<TextField
fullWidth
label="Province"
value={agent.province}
onChange={(e)=>setAgent({...agent,province:e.target.value})}
/>
</Grid>

<Grid item xs={12} md={6}>
<TextField
select
fullWidth
label="Gender"
value={agent.gender}
onChange={(e)=>setAgent({...agent,gender:e.target.value})}
>
<MenuItem value="Male">Male</MenuItem>
<MenuItem value="Female">Female</MenuItem>
</TextField>
</Grid>

<Grid item xs={12} md={6}>
<TextField
select
fullWidth
label="Position"
value={agent.position}
onChange={(e)=>setAgent({...agent,position:e.target.value})}
>
<MenuItem value="Sales Agent">Sales Agent</MenuItem>
<MenuItem value="Team Leader">Team Leader</MenuItem>
<MenuItem value="Supervisor">Supervisor</MenuItem>
</TextField>
</Grid>

<Grid item xs={12} md={6}>
<TextField
type="date"
fullWidth
InputLabelProps={{shrink:true}}
label="Date Joined"
value={agent.dateJoined}
onChange={(e)=>setAgent({...agent,dateJoined:e.target.value})}
/>
</Grid>

<Grid item xs={12} md={6}>
<TextField
select
fullWidth
label="Status"
value={agent.status}
onChange={(e)=>setAgent({...agent,status:e.target.value})}
>
<MenuItem value="Active">Active</MenuItem>
<MenuItem value="Inactive">Inactive</MenuItem>
<MenuItem value="Suspended">Suspended</MenuItem>
</TextField>
</Grid>

<Grid item xs={12}>
<TextField
fullWidth
multiline
rows={3}
label="Notes"
value={agent.notes}
onChange={(e)=>setAgent({...agent,notes:e.target.value})}
/>
</Grid>

<Grid item xs={12}>
<Button
variant="contained"
size="large"
onClick={saveAgent}
>
{editingAgent ? "Update Agent": "Save Agent"}
</Button>
</Grid>

</Grid>

</Paper>

<Table>
<TableHead>
<TableRow>
<TableCell>Name</TableCell>
<TableCell>Phone</TableCell>
<TableCell>Position</TableCell>
<TableCell>Status</TableCell>
<TableCell>Actions</TableCell>
</TableRow>
</TableHead>

<TableBody>

{agents.map((agent)=>(

<TableRow key={agent.id}>

<TableCell>{agent.fullName}</TableCell>

<TableCell>{agent.phone}</TableCell>

<TableCell>{agent.position}</TableCell>

<TableCell>{agent.status}</TableCell>

<TableCell>

<Button
size="small"
variant="contained"
onClick={()=>editAgent(agent)}
>
Edit
</Button>

<Button
size="small"
color="error"
onClick={()=>remove(ref(db,`agents/${agent.id}`))}
>
Delete
</Button>

</TableCell>

</TableRow>

))}

</TableBody>

</Table>

{/* ==========================================
        CUSTOMER MANAGEMENT (MANAGER)
========================================== */}

<Paper
sx={{
mt:4,
p:3,
borderRadius:4
}}
>

<Typography
variant="h6"
fontWeight="bold"
mb={3}
>

👥 Customer Management

</Typography>

<Grid container spacing={2} mb={3}>

<Grid item xs={12} md={3}>

<TextField
fullWidth
label="Search Customer"
value={search}
onChange={(e)=>setSearch(e.target.value)}
InputProps={{
    startAdornment: (
        <InputAdornment position="start">
            <Search />
        </InputAdornment>
    )
}}
/>

</Grid>

<Grid item xs={12} md={2}>

<TextField
select
fullWidth
label="Agent"
value={agentFilter}
onChange={(e)=>setAgentFilter(e.target.value)}
>

<MenuItem value="">All Agents</MenuItem>

{
agents.map((a:any)=>(
<MenuItem
key={a.name}
value={a.name}
>
{a.name}
</MenuItem>
))
}

</TextField>

</Grid>

<Grid item xs={12} md={2}>

<TextField
select
fullWidth
label="Month"
value={month}
onChange={(e)=>setMonth(e.target.value)}
>

<MenuItem value="">All Months</MenuItem>

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
select
fullWidth
label="Year"
value={year}
onChange={(e)=>setYear(e.target.value)}
>

<MenuItem value="">All Years</MenuItem>

{
[2024,2025,2026,2027,2028].map(y=>(

<MenuItem
key={y}
value={y}
>
{y}
</MenuItem>

))
}

</TextField>

</Grid>

<Grid item xs={12} md={3}>

<TextField
select
fullWidth
label="Confirmation"
value={statusFilter}
onChange={(e)=>setStatusFilter(e.target.value)}
>

<MenuItem value="">
All
</MenuItem>

<MenuItem value="Pending">
Pending
</MenuItem>

<MenuItem value="Confirmed">
Confirmed
</MenuItem>

<MenuItem value="Rejected">
Rejected
</MenuItem>

</TextField>

</Grid>

</Grid>

<TableContainer>

<Table>

<TableHead>

<TableRow>

<TableCell>Customer</TableCell>

<TableCell>Agent</TableCell>

<TableCell>Sale</TableCell>

<TableCell>Package</TableCell>

<TableCell>Date</TableCell>

<TableCell>Commission</TableCell>

<TableCell>Status</TableCell>

<TableCell align="center">

Actions

</TableCell>

</TableRow>

</TableHead>

<TableBody>

{

filteredReports

.filter((x:any)=>

statusFilter===""

?

true

:

x.adminConfirmation===statusFilter

)

.map((customer:any)=>(

<TableRow key={customer.id} hover>

<TableCell>

<b>

{customer.customerName}

{" "}

{customer.surname}

</b>

<br/>

{customer.phone}

</TableCell>

<TableCell>

{customer.agentName}

</TableCell>

<TableCell>

<Chip

label={customer.saleType}

color={
customer.saleType==="Contract"
?
"primary"
:
"success"
}

/>

</TableCell>

<TableCell>

{customer.packagePlan}

</TableCell>

<TableCell>

{customer.date}

</TableCell>

<TableCell>

<b>

R{customer.commission}

</b>

</TableCell>

<TableCell>

<Chip

label={customer.adminConfirmation}

color={

customer.adminConfirmation==="Confirmed"

?

"success"

:

customer.adminConfirmation==="Rejected"

?

"error"

:

"warning"

}

/>

</TableCell>

<TableCell>

<Box
display="flex"
gap={1}
>

<Button

size="small"

variant="contained"

color="success"

onClick={()=>{

update(

ref(db,`fieldUpdates/${customer.id}`),

{

adminConfirmation:"Confirmed"

}

);

}}

>

Confirm

</Button>

<Button

size="small"

variant="contained"

color="error"

onClick={()=>{

update(

ref(db,`fieldUpdates/${customer.id}`),

{

adminConfirmation:"Rejected"

}

);

}}

>

Reject

</Button>

<Button

size="small"

variant="outlined"

onClick={()=>{

remove(

ref(db,`fieldUpdates/${customer.id}`)

);

}}

>

Delete

</Button>

</Box>

</TableCell>

</TableRow>

))

}

</TableBody>

</Table>

</TableContainer>

</Paper>

</Box>

);

};

export default Agents;

/* =========================
          STYLES
========================= */

const container = {
  minHeight: "100vh",
  p: 4,
  background: "linear-gradient(135deg,#0f172a,#1e3a8a,#0ea5e9)"
};

const statCard = {
  p: 3,
  borderRadius: 3,
  background: "rgba(255,255,255,0.95)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 1,
  boxShadow: "0 10px 25px rgba(0,0,0,.15)"
};

const formCard = {
  p: 4,
  mb: 4,
  borderRadius: 4,
  background: "rgba(255,255,255,.97)",
  boxShadow: "0 10px 25px rgba(0,0,0,.15)"
};