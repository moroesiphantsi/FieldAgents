import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Chip,
  IconButton,
} from "@mui/material";

import {
  WhatsApp,
  Email,
  Delete,
  Search,
} from "@mui/icons-material";

import {
  ref,
  onValue,
  remove,
  update,
} from "firebase/database";

import { MenuItem } from "@mui/material";

import { db } from "../firebase";

import StatsCards from "../components/StatsCards";
import ExportExcel from "../components/ExportExcel";
import AgentAssign from "../components/AgentAssign";

const Leads = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth()
  );

  useEffect(() => {
    const leadRef = ref(db, "fibreLeads");

    onValue(leadRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const formatted = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        setLeads(formatted.reverse());
      } else {
        setLeads([]);
      }
    });
  }, []);

  const deleteLead = (id: string) => {
    remove(ref(db, `fibreLeads/${id}`));
  };

  const updateStatus = (id: string, status: string) => {
    update(ref(db, `fibreLeads/${id}`), { status });
  };

  // ✅ FILTER BY MONTH FIRST (IMPORTANT)
  const monthlyLeads = leads.filter((lead) => {
    if (!lead.createdAt) return false;

    const date = new Date(lead.createdAt);

    return date.getMonth() === selectedMonth;
  });

  // ✅ SEARCH ONLY INSIDE SELECTED MONTH
  const filteredMonthlyLeads = monthlyLeads.filter((lead) =>
    `${lead.name} ${lead.surname} ${lead.email} ${lead.address} ${lead.contact}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  return (
    <Box sx={{ bgcolor: "#0f172a", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">

        {/* 📊 STATS */}
        <StatsCards leads={monthlyLeads} />

        {/* 📤 EXPORT */}
        <Box sx={{ mt: 2 }}>
          <ExportExcel leads={monthlyLeads} />
        </Box>

        {/* HEADER */}
        <Typography variant="h4" color="white" fontWeight="bold" sx={{ mt: 3 }}>
          Fibre Leads Dashboard
        </Typography>

        {/* SEARCH */}
        <Paper sx={{ p: 2, mt: 3, display: "flex", gap: 2 }}>
          <Search />
          <TextField
            fullWidth
            placeholder="Search leads..."
            variant="standard"
            onChange={(e) => setSearch(e.target.value)}
          />
        </Paper>

        {/* MONTH SELECTOR */}
        <Paper
          sx={{
            p: 2,
            mt: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography>Monthly Leads:</Typography>

          <TextField
            select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {months.map((month, index) => (
              <MenuItem key={index} value={index}>
                {month}
              </MenuItem>
            ))}
          </TextField>

          <Typography fontWeight="bold">
            Total: {filteredMonthlyLeads.length}
          </Typography>
        </Paper>

        {/* GRID */}
        <Grid container spacing={3} sx={{ mt: 3 }}>

          {/* ✅ NO LEADS MESSAGE */}
          {filteredMonthlyLeads.length === 0 ? (
            <Box sx={{ width: "100%", textAlign: "center", mt: 5 }}>
              <Typography color="white" fontWeight="bold">
                No fibre applications received for {months[selectedMonth]}.
              </Typography>
            </Box>
          ) : (
            filteredMonthlyLeads.map((lead) => (
              <Grid item xs={12} md={4} key={lead.id}>
                <Paper sx={cardStyle}>

                  <Typography fontWeight="bold" fontSize="18px">
                    {lead.name} {lead.surname}
                  </Typography>

                  <Typography>{lead.email}</Typography>
                  <Typography>{lead.address}</Typography>
                  <Typography>{lead.contact}</Typography>

                  <Typography sx={{ mt: 1 }}>
                    ID: {lead.idNumber || "N/A"}
                  </Typography>

                  <Chip
                    label={`📦 ${lead.packagePlan || "No Package"}`}
                    sx={{ mt: 1, mr: 1, bgcolor: "#4DA3FF", color: "white" }}
                  />

                  <Chip
                    label={`💰 ${lead.price || "N/A"}`}
                    sx={{ mt: 1, bgcolor: "#22c55e", color: "white" }}
                  />

                  <Chip
                    label={lead.status || "New"}
                    sx={{ mt: 1, bgcolor: "#4DA3FF", color: "white" }}
                  />

                  {/* AGENT */}
                  <Box sx={{ mt: 2 }}>
                    <AgentAssign
                      leadId={lead.id}
                      current={lead.assignedAgent}
                    />
                  </Box>

                  {/* STATUS BUTTONS */}
                  <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>

                    <Button size="small" variant="contained"
                      onClick={() => updateStatus(lead.id, "Received")}
                    >
                      Received
                    </Button>

                    <Button size="small" variant="contained"
                      onClick={() => updateStatus(lead.id, "In Process")}
                    >
                      In Process
                    </Button>

                    <Button size="small" variant="contained"
                      onClick={() => updateStatus(lead.id, "Pending")}
                    >
                      Pending
                    </Button>

                    <Button size="small" variant="contained" color="success"
                      onClick={() => updateStatus(lead.id, "Approved")}
                    >
                      Approved
                    </Button>

                    <Button size="small" variant="contained" color="error"
                      onClick={() => updateStatus(lead.id, "Declined")}
                    >
                      Declined
                    </Button>

                  </Box>

                  {/* ACTIONS */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>

                    <IconButton
                      onClick={() => {
                        const phone = lead.contact?.replace(/\D/g, "");
                        const message = `Hello ${lead.name},

Status: ${lead.status || "Received"}
Package: ${lead.packagePlan || "N/A"}
Price: ${lead.price || "N/A"}`;

                        window.open(
                          `https://wa.me/27${phone.startsWith("0") ? phone.substring(1) : phone}?text=${encodeURIComponent(message)}`,
                          "_blank"
                        );
                      }}
                      sx={{ color: "#25D366" }}
                    >
                      <WhatsApp />
                    </IconButton>

                    <IconButton
                      onClick={() =>
                        window.open(`mailto:${lead.email}`)
                      }
                      sx={{ color: "#3b82f6" }}
                    >
                      <Email />
                    </IconButton>

                    <IconButton
                      onClick={() => deleteLead(lead.id)}
                      sx={{ color: "#ef4444" }}
                    >
                      <Delete />
                    </IconButton>

                  </Box>

                </Paper>
              </Grid>
            ))
          )}

        </Grid>

      </Container>
    </Box>
  );
};

export default Leads;

const cardStyle = {
  p: 3,
  borderRadius: 3,
  bgcolor: "rgba(255,255,255,0.95)",
  backdropFilter: "blur(10px)",
};