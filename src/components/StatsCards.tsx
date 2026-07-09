import React from "react";
import {
  Grid,
  Paper,
  Typography,
  Box
} from "@mui/material";

import {
  People,
  HourglassTop,
  PendingActions,
  CheckCircle,
  Cancel
} from "@mui/icons-material";


const StatsCards = ({ leads }: any) => {


  const totalApplications = leads.length;


  const inProcess = leads.filter(
    (lead:any)=> lead.status === "In Process"
  ).length;


  const pending = leads.filter(
    (lead:any)=> lead.status === "Pending"
  ).length;


  const approved = leads.filter(
    (lead:any)=> lead.status === "Approved"
  ).length;


  const declined = leads.filter(
    (lead:any)=> lead.status === "Declined"
  ).length;


const cards = [

{
title:"Total Applications This Month",
value:totalApplications,
icon:<People/>
},


{
title:"In Process",
value:inProcess,
icon:<HourglassTop/>
},


{
title:"Pending",
value:pending,
icon:<PendingActions/>
},


{
title:"Approved",
value:approved,
icon:<CheckCircle/>
},


{
title:"Declined",
value:declined,
icon:<Cancel/>
}

];



return (

<Grid container spacing={3}>


{
cards.map((card,index)=>(

<Grid item xs={12} sm={6} md={2.4} key={index}>


<Paper

sx={{

p:3,

borderRadius:4,

textAlign:"center",

background:
"linear-gradient(135deg,#ffffff,#e0f2fe)",

boxShadow:
"0 10px 30px rgba(0,0,0,0.15)"

}}

>


<Box
sx={{
fontSize:40,
color:"#2563eb"
}}
>

{card.icon}

</Box>



<Typography
fontWeight="bold"
sx={{
mt:1,
fontSize:15
}}
>

{card.title}

</Typography>



<Typography
variant="h4"
fontWeight="bold"
color="#0f172a"
>

{card.value}

</Typography>



</Paper>


</Grid>


))

}


</Grid>

);

};


export default StatsCards;