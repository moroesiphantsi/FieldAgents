import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

import Sidebar from "../components/Sidebar";
import TopBar from "../components/Topbar";
import StatsCards from "../components/StatsCards";
import {
  Grid,
  Paper,
  Chip,
  Avatar,
} from "@mui/material";

import {
  TrendingUp,
  People,
  Wifi,
  NotificationsActive,
  CheckCircle,
} from "@mui/icons-material";

const Dashboard = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const leadRef = ref(db, "fibreLeads");

    const unsubscribe = onValue(leadRef, (snap) => {
      const data = snap.val();

      if (data) {
        const list = Object.keys(data).map((k) => ({
          id: k,
          ...data[k],
        }));
        setLeads(list);
      } else {
        setLeads([]);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <Box
  sx={{
    ml: "280px",
    width: "100%",
    minHeight: "100vh",
    background:
      "linear-gradient(135deg,#F8FAFC,#EFF6FF,#F1F5F9)",
  }}
>
  <TopBar />

  <Box sx={{ mt: 10, p: 4 }}>

    {/* HEADER */}
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 4,
      }}
    >
      <Box>
        <Typography
          variant="h4"
          fontWeight="bold"
        >
          Dashboard Overview
        </Typography>

        <Typography color="text.secondary">
          Welcome back. Monitor your fibre business in real-time.
        </Typography>
      </Box>

      <Chip
        icon={<Wifi />}
        label="System Online"
        color="success"
      />
    </Box>

    {/* KPI CARDS */}
    <StatsCards leads={leads} />

    {/* LOADING */}
    {loading ? (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 8,
        }}
      >
        <CircularProgress />
      </Box>
    ) : (
      <>
        {/* SECOND ROW */}
        <Grid container spacing={3} sx={{ mt: 1 }}>

          {/* RECENT ACTIVITY */}
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                height: "100%",
                boxShadow:
                  "0 10px 30px rgba(0,0,0,0.05)",
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
              >
                Recent Activity
              </Typography>

              {leads.slice(0, 5).map((lead: any) => (
                <Box
                  key={lead.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1.5,
                    borderBottom:
                      "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                    }}
                  >
                    <Avatar>
                      {lead.name?.charAt(0)}
                    </Avatar>

                    <Box>
                      <Typography fontWeight="bold">
                        {lead.name} {lead.surname}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        New Fibre Application
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    size="small"
                    label={lead.status || "New Lead"}
                    color="primary"
                  />
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* QUICK STATS */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                height: "100%",
                boxShadow:
                  "0 10px 30px rgba(0,0,0,0.05)",
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
              >
                Performance
              </Typography>

              <Box sx={{ mt: 3 }}>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Typography>Total Leads</Typography>
                  <Typography fontWeight="bold">
                    {leads.length}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Typography>Growth</Typography>
                  <Typography
                    sx={{
                      color: "#22c55e",
                      fontWeight: "bold",
                    }}
                  >
                    +24%
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Typography>Installations</Typography>
                  <Typography fontWeight="bold">
                    18
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography>Active Agents</Typography>
                  <Typography fontWeight="bold">
                    4
                  </Typography>
                </Box>

              </Box>
            </Paper>
          </Grid>

        </Grid>

        {/* THIRD ROW */}
        <Grid container spacing={3} sx={{ mt: 1 }}>

          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                textAlign: "center",
              }}
            >
              <TrendingUp
                sx={{
                  fontSize: 45,
                  color: "#22c55e",
                }}
              />

              <Typography
                variant="h5"
                fontWeight="bold"
              >
                +24%
              </Typography>

              <Typography>
                Monthly Growth
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                textAlign: "center",
              }}
            >
              <People
                sx={{
                  fontSize: 45,
                  color: "#2563EB",
                }}
              />

              <Typography
                variant="h5"
                fontWeight="bold"
              >
                {leads.length}
              </Typography>

              <Typography>
                Customers Reached
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                textAlign: "center",
              }}
            >
              <NotificationsActive
                sx={{
                  fontSize: 45,
                  color: "#F59E0B",
                }}
              />

              <Typography
                variant="h5"
                fontWeight="bold"
              >
                12
              </Typography>

              <Typography>
                Pending Follow-Ups
              </Typography>
            </Paper>
          </Grid>

        </Grid>

        {/* EMPTY STATE */}
        {leads.length === 0 && (
          <Paper
            sx={{
              mt: 4,
              p: 4,
              borderRadius: 4,
              textAlign: "center",
            }}
          >
            <CheckCircle
              sx={{
                fontSize: 60,
                color: "#94A3B8",
              }}
            />

            <Typography
              variant="h6"
              sx={{ mt: 2 }}
            >
              No leads yet
            </Typography>

            <Typography color="text.secondary">
              Waiting for customers to submit fibre applications.
            </Typography>
          </Paper>
        )}

      </>
    )}
  </Box>
</Box>
    </Box>
  );
};

export default Dashboard;