import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";


const COLORS = [
  "#4DA3FF",
  "#facc15",
  "#22c55e",
  "#ef4444",
];


const AnalyticsChart = ({ leads }: any) => {


  // CURRENT MONTH FILTER
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();


  const monthlyLeads = leads.filter((lead:any)=>{

    const date = new Date(
      lead.createdAt
    );


    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );

  });



  const inProcess = monthlyLeads.filter(
    (l:any)=>l.status === "In Process"
  ).length;



  const pending = monthlyLeads.filter(
    (l:any)=>l.status === "Pending"
  ).length;



  const approved = monthlyLeads.filter(
    (l:any)=>l.status === "Approved"
  ).length;



  const declined = monthlyLeads.filter(
    (l:any)=>l.status === "Declined"
  ).length;



  const data = [

    {
      name:"In Process",
      value:inProcess
    },

    {
      name:"Pending",
      value:pending
    },

    {
      name:"Approved",
      value:approved
    },

    {
      name:"Declined",
      value:declined
    }

  ];




  return (

    <div
    style={{
      width:"100%",
      height:550,
      marginTop:20
    }}
    >


      <h3>
        Monthly Fibre Applications Analytics
      </h3>



      <ResponsiveContainer width="100%" height={300}>

        <BarChart data={data}>


          <XAxis dataKey="name"/>

          <YAxis/>

          <Tooltip/>


          <Bar
          dataKey="value"
          fill="#4DA3FF"
          />


        </BarChart>


      </ResponsiveContainer>





      <ResponsiveContainer
      width="100%"
      height={250}
      >

        <PieChart>


          <Pie
          data={data}
          dataKey="value"
          outerRadius={80}
          label
          >


          {
            data.map((_,index)=>(

              <Cell
              key={index}
              fill={
                COLORS[index % COLORS.length]
              }
              />

            ))
          }


          </Pie>


        </PieChart>


      </ResponsiveContainer>


    </div>


  );


};


export default AnalyticsChart;