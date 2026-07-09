import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Chip,
  IconButton,
  Badge,
  Button,
} from "@mui/material";

import {
  Notifications,
  Wifi,
  Logout,
  AccountCircle,
} from "@mui/icons-material";

import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const TopBar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/admin/login";
    } catch (error) {
      console.error(error);
    }
  };

  const user = auth.currentUser;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        ml: "280px",
        width: "calc(100% - 280px)",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        color: "#0f172a",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* LEFT */}
        <Box>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              background:
                "linear-gradient(90deg,#2563EB,#06B6D4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Fibre Management System
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Welcome back, Administrator
          </Typography>
        </Box>

        {/* RIGHT */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          {/* DATE */}
          <Box textAlign="right">
            <Typography
              fontWeight="bold"
              fontSize="14px"
            >
              {currentTime.toLocaleDateString("en-ZA", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              {currentTime.toLocaleTimeString()}
            </Typography>
          </Box>

          {/* STATUS */}
          <Chip
            icon={<Wifi />}
            label="Online"
            color="success"
            sx={{
              fontWeight: "bold",
            }}
          />

          {/* NOTIFICATIONS */}
          <IconButton>
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* USER INFO */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 3,
              bgcolor: "#f8fafc",
            }}
          >
            <Avatar
              sx={{
                bgcolor: "#2563EB",
              }}
            >
              <AccountCircle />
            </Avatar>

            <Box>
              <Typography
                fontWeight="bold"
                fontSize="14px"
              >
                Admin
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {user?.email || "No user"}
              </Typography>
            </Box>
          </Box>

          {/* LOGOUT */}
          <Button
            variant="contained"
            color="error"
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;