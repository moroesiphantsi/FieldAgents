import * as XLSX from "xlsx";
import {
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";
import { useState } from "react";

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

const ExportExcel = ({ leads }: any) => {

  const [month, setMonth] = useState(new Date().getMonth());

  const exportData = () => {

    const year = new Date().getFullYear();


    // ONLY SELECTED MONTH
    const monthlyLeads = leads.filter((lead:any)=>{

      const leadDate = new Date(lead.createdAt);

      return (
        leadDate.getMonth() === month &&
        leadDate.getFullYear() === year
      );

    });



    let worksheet;


    // IF NO LEADS FOR THAT MONTH
    if(monthlyLeads.length === 0){

      worksheet = XLSX.utils.json_to_sheet([
        {
          "Date & Time":"",
          Message:
          `No fibre applications were received for ${months[month]} ${year}`
        }
      ]);


    }else{


      const formatted = monthlyLeads.map((lead:any)=>({

        "Date & Time":
        new Date(lead.createdAt)
        .toLocaleString(),


        Name:
        lead.name,


        Surname:
        lead.surname,


        Contact:
        lead.contact,


        Email:
        lead.email,


        Address:
        lead.address,


        "Package Plan":
        lead.packagePlan,


        Price:
        lead.price,


        Status:
        lead.status,


        Agent:
        lead.assignedAgent || "Not Assigned"

      }));



      worksheet = XLSX.utils.json_to_sheet(formatted);

    }



    // COLUMN WIDTHS
    worksheet["!cols"] = [

      {wch:30}, // date time

      {wch:20}, // name

      {wch:20}, // surname

      {wch:18}, // contact

      {wch:35}, // email

      {wch:40}, // address

      {wch:20}, // package

      {wch:15}, // price

      {wch:20}, // status

      {wch:20}, // agent

    ];



    const workbook = XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      months[month]
    );


    XLSX.writeFile(
      workbook,
      `${months[month]}-${year}-Fibre-Applications.xlsx`
    );


  };



return (

<Box
sx={{
display:"flex",
gap:2,
alignItems:"center",
flexWrap:"wrap"
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



<Button

variant="contained"

onClick={exportData}

sx={{
background:
"linear-gradient(90deg,#4DA3FF,#0066FF)",
fontWeight:"bold"
}}

>

📤 Export Selected Month

</Button>



</Box>

);


};


export default ExportExcel;