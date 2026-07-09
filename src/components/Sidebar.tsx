import React from "react";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Divider,
} from "@mui/material";

import {
  Dashboard,
  Groups,
  People,
  Home,
  Wifi,
  TrendingUp,
  NotificationsActive,
} from "@mui/icons-material";

import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      icon: <Dashboard />,
      path: "/admin/dashboard",
    },
    {
      title: "Prepaid Fibre Leads",
      icon: <Groups />,
      path: "/admin/leads",
    },
    {
      title: "Contract Fibre Leads",
      icon: <Groups />,
      path: "/user/contractfibreleads",
    },
    {
      title: "Fields Agents",
      icon: <People />,
      path: "/user/field-updates",
    },
    {
      title: "14 Days Free Trial",
      icon: <People />,
      path: "/user/free-trial",
    },
  ];

  return (
    <Box
      sx={{
        width: 280,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        background:
          "linear-gradient(180deg,#0F172A 0%,#1E293B 40%,#2563EB 100%)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
      }}
    >
      {/* TOP */}
      <Box>
        {/* LOGO */}
        <Box
          sx={{
            p: 3,
            textAlign: "center",
          }}
        >
          <Avatar
            sx={{
              width: 70,
              height: 70,
              margin: "auto",
              mb: 2,
              bgcolor: "#4DA3FF",
              fontSize: 28,
              fontWeight: "bold",
            }}
          >
            F
          </Avatar>

          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              background:
                "linear-gradient(90deg,#4DA3FF,#7DD3FC)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Fibre CMS
          </Typography>

          <Chip
            icon={<Wifi />}
            label="System Online"
            color="success"
            size="small"
            sx={{ mt: 1 }}
          />
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

        {/* QUICK STATS */}
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 3,
              p: 2,
            }}
          >
            <Typography variant="body2" color="#CBD5E1">
              Monthly Growth
            </Typography>

            <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
              +24%
            </Typography>

            <TrendingUp sx={{ mt: 1, color: "#4ADE80" }} />
          </Box>
        </Box>

        {/* MENU */}
        <List sx={{ px: 2 }}>
          {/* 🏠 HOME BUTTON ADDED */}
          <ListItemButton
            onClick={() => navigate("/")}
            sx={{
              borderRadius: 3,
              mb: 1,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.08)",
                transform: "translateX(6px)",
              },
              transition: "0.3s",
            }}
          >
            <ListItemIcon sx={{ color: "white" }}>
              <Home />
            </ListItemIcon>

            <ListItemText primary="Home" />
          </ListItemButton>

          {/* EXISTING MENU */}
          {menuItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <ListItemButton
                key={item.title}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 3,
                  mb: 1,
                  bgcolor: active
                    ? "rgba(77,163,255,0.18)"
                    : "transparent",

                  border: active
                    ? "1px solid rgba(77,163,255,0.3)"
                    : "1px solid transparent",

                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.08)",
                    transform: "translateX(6px)",
                  },

                  transition: "0.3s",
                }}
              >
                <ListItemIcon
                  sx={{
                    color: active ? "#4DA3FF" : "white",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontWeight: active ? "bold" : "normal",
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* BOTTOM */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            bgcolor: "rgba(255,255,255,0.08)",
            borderRadius: 3,
            p: 2,
            mb: 2,
          }}
        >
          <Typography fontWeight="bold">
            Admin Panel
          </Typography>

          <Typography variant="body2" color="#CBD5E1">
            Fibre Network Management
          </Typography>

          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            <NotificationsActive />
            <Typography variant="body2">
              Notifications Active
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;