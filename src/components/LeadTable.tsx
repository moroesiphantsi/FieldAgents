import React, { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";


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
  "December",
];


const LeadTable = ({ leads, onSelect }: any) => {


const [month,setMonth] = useState(
  new Date().getMonth()
);


const year = new Date().getFullYear();


// FILTER ONLY SELECTED MONTH
const monthlyLeads = leads.filter((lead:any)=>{

const date = new Date(lead.createdAt);


return (
date.getMonth() === month &&
date.getFullYear() === year
);

});



return (

<Paper

sx={{

mt:3,

borderRadius:3,

overflow:"hidden"

}}

>


{/* MONTH SELECT */}

<Box

sx={{

p:2,

display:"flex",

justifyContent:"flex-end"

}}

>


<FormControl sx={{minWidth:200}}>


<InputLabel>
Select Month
</InputLabel>


<Select

value={month}

label="Select Month"

onChange={(e)=>
setMonth(Number(e.target.value))
}

>


{

months.map((m,i)=>(

<MenuItem

key={i}

value={i}

>

{m}

</MenuItem>

))

}


</Select>


</FormControl>


</Box>



<Table>


<TableHead sx={{bgcolor:"#0f172a"}}>


<TableRow>


<TableCell sx={{color:"white",fontWeight:"bold"}}>
Name
</TableCell>


<TableCell sx={{color:"white",fontWeight:"bold"}}>
Contact
</TableCell>


<TableCell sx={{color:"white",fontWeight:"bold"}}>
Email
</TableCell>


<TableCell sx={{color:"white",fontWeight:"bold"}}>
Address
</TableCell>


<TableCell sx={{color:"white",fontWeight:"bold"}}>
Package
</TableCell>


<TableCell sx={{color:"white",fontWeight:"bold"}}>
Price
</TableCell>


<TableCell sx={{color:"white",fontWeight:"bold"}}>
Status
</TableCell>


</TableRow>


</TableHead>





<TableBody>


{
monthlyLeads.length === 0 ? (


<TableRow>

<TableCell colSpan={7}>


<Typography

textAlign="center"

sx={{

py:3,

fontWeight:"bold",

color:"gray"

}}

>

No fibre applications received for {months[month]} {year}


</Typography>


</TableCell>


</TableRow>



)

:

(

monthlyLeads.map((lead:any)=>(


<TableRow

key={lead.id}

onClick={()=>onSelect(lead)}

sx={{

cursor:"pointer",

"&:hover":{

background:"#f1f5f9"

}

}}

>



<TableCell>

<Typography fontWeight="bold">

{lead.name} {lead.surname}

</Typography>

</TableCell>



<TableCell>

{lead.contact}

</TableCell>



<TableCell>

{lead.email}

</TableCell>



<TableCell>

{lead.address}

</TableCell>



<TableCell>


<Chip

label={lead.packagePlan || "Not Selected"}

sx={{

bgcolor:"#4DA3FF",

color:"white"

}}

size="small"

/>


</TableCell>




<TableCell>


<Chip

label={lead.price || "N/A"}

sx={{

bgcolor:"#22c55e",

color:"white"

}}

size="small"

/>


</TableCell>





<TableCell>


<Chip

label={lead.status || "Received"}

sx={{

bgcolor:

lead.status==="Approved"

? "#22c55e"

:

lead.status==="Declined"

? "#ef4444"

:

"#f59e0b",


color:"white"

}}

size="small"

/>


</TableCell>



</TableRow>


))

)

}



</TableBody>



</Table>


</Paper>


);


};


export default LeadTable;