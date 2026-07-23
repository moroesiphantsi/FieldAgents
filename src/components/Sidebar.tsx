import React, { useState } from "react";
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
  IconButton,
  Tooltip,
} from "@mui/material";

import {
  Dashboard,
  Groups,
  People,
  Home,
  Wifi,
  TrendingUp,
  NotificationsActive,
  ChevronLeft,
  ChevronRight,
  BusinessCenter,
  FolderCopy,
  ReceiptLong,
  Timer,
} from "@mui/icons-material";

import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Collapsed / Expanded Drawer Toggle
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Cleaned & Unique Menu Items with Relevant Icons & Fixed Routes
  const menuItems = [
    {
      title: "Dashboard",
      icon: <Dashboard />,
      path: "/admin/dashboard",
    },
    {
      title: "Telkom Consumer (Prepaid)",
      icon: <ReceiptLong />,
      path: "/admin/leads",
    },
    {
      title: "Telkom Consumer (Contract)",
      icon: <Groups />,
      path: "/admin/contractfibreleads",
    },
    {
      title: "Field Agents",
      icon: <People />,
      path: "/admin/agents",
    },
    {
      title: "14 Days Free Trial",
      icon: <Timer />,
      path: "/admin/free/trial",
    },
    {
      title: "Telkom Business",
      icon: <BusinessCenter />,
      path: "/admin/telkom-business",
    },
    {
      title: "Attachments",
      icon: <FolderCopy />,
      path: "/admin/attachments",
    },
  ];

  return (
    <Box
      sx={{
        width: isCollapsed ? 78 : 280,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1200,
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
        transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        overflowX: "hidden",
      }}
    >
      {/* TOP SECTION */}
      <Box>
        {/* BRANDING & TOGGLE HEADER */}
        <Box
          sx={{
            p: 2,
            pt: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
            position: "relative",
          }}
        >
          {!isCollapsed && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1 }}>
              <Avatar
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: "#38bdf8",
                  fontSize: 20,
                  fontWeight: 900,
                  boxShadow: "0 0 20px rgba(56, 189, 248, 0.4)",
                }}
              >
                F
              </Avatar>

              <Box>
                <Typography
                  variant="h6"
                  fontWeight="900"
                  sx={{
                    lineHeight: 1.1,
                    background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Fibre CMS
                </Typography>
                <Chip
                  icon={<Wifi sx={{ fontSize: "12px !important", color: "#4ade80 !important" }} />}
                  label="Online"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: 10,
                    fontWeight: "bold",
                    bgcolor: "rgba(74, 222, 128, 0.12)",
                    color: "#4ade80",
                    border: "1px solid rgba(74, 222, 128, 0.2)",
                    px: 0.5,
                    mt: 0.5,
                  }}
                />
              </Box>
            </Box>
          )}

          {isCollapsed && (
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: "#38bdf8",
                fontSize: 18,
                fontWeight: 900,
                cursor: "pointer",
                boxShadow: "0 0 15px rgba(56, 189, 248, 0.4)",
              }}
              onClick={() => setIsCollapsed(false)}
            >
              F
            </Avatar>
          )}

          {/* EXPAND/COLLAPSE TOGGLE */}
          {!isCollapsed && (
            <IconButton
              onClick={() => setIsCollapsed(!isCollapsed)}
              sx={{
                color: "#94a3b8",
                bgcolor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                "&:hover": {
                  color: "#fff",
                  bgcolor: "rgba(56, 189, 248, 0.2)",
                  borderColor: "rgba(56, 189, 248, 0.4)",
                },
              }}
            >
              <ChevronLeft />
            </IconButton>
          )}
        </Box>

        <Divider sx={{ my: 1.5, borderColor: "rgba(255,255,255,0.06)" }} />

        {/* BENTO STATS WIDGET (Expands/Hides) */}
        {!isCollapsed && (
          <Box sx={{ px: 2, mb: 1 }}>
            <Box
              sx={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>
                  Monthly Growth
                </Typography>
                <Typography variant="h6" fontWeight="800" sx={{ color: "#fff", lineHeight: 1.1, mt: 0.5 }}>
                  +24.8%
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "10px",
                  bgcolor: "rgba(74, 222, 128, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#4ade80",
                }}
              >
                <TrendingUp />
              </Box>
            </Box>
          </Box>
        )}

        {/* NAVIGATION MENU */}
        <List sx={{ px: 1.5, gap: 0.5, display: "flex", flexDirection: "column" }}>
          {/* HOME BUTTON */}
          <Tooltip title={isCollapsed ? "Home" : ""} placement="right">
            <ListItemButton
              onClick={() => navigate("/")}
              sx={{
                borderRadius: "12px",
                minHeight: 46,
                justifyContent: isCollapsed ? "center" : "initial",
                px: isCollapsed ? 1.5 : 2,
                transition: "all 0.25s ease",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.06)",
                  transform: isCollapsed ? "none" : "translateX(4px)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "#94a3b8", minWidth: isCollapsed ? 0 : 36, justifyContent: "center" }}>
                <Home />
              </ListItemIcon>
              {!isCollapsed && (
                <ListItemText
                  primary="Home"
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 500, color: "#cbd5e1" }}
                />
              )}
            </ListItemButton>
          </Tooltip>

          {/* DYNAMIC MENU ITEMS */}
          {menuItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Tooltip key={item.title} title={isCollapsed ? item.title : ""} placement="right">
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: "12px",
                    minHeight: 46,
                    justifyContent: isCollapsed ? "center" : "initial",
                    px: isCollapsed ? 1.5 : 2,
                    position: "relative",
                    background: active
                      ? "linear-gradient(90deg, rgba(56, 189, 248, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%)"
                      : "transparent",
                    border: active
                      ? "1px solid rgba(56, 189, 248, 0.3)"
                      : "1px solid transparent",
                    boxShadow: active ? "0 4px 20px rgba(56, 189, 248, 0.15)" : "none",
                    "&:hover": {
                      bgcolor: active ? "rgba(56, 189, 248, 0.25)" : "rgba(255,255,255,0.06)",
                      transform: isCollapsed ? "none" : "translateX(4px)",
                    },
                    transition: "all 0.25s ease",
                  }}
                >
                  {/* GLOW BAR INDICATOR */}
                  {active && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: "20%",
                        bottom: "20%",
                        width: 4,
                        borderRadius: "0 4px 4px 0",
                        bgcolor: "#38bdf8",
                        boxShadow: "0 0 10px #38bdf8",
                      }}
                    />
                  )}

                  <ListItemIcon
                    sx={{
                      color: active ? "#38bdf8" : "#94a3b8",
                      minWidth: isCollapsed ? 0 : 36,
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  {!isCollapsed && (
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{
                        fontSize: 13.5,
                        fontWeight: active ? 700 : 500,
                        color: active ? "#fff" : "#cbd5e1",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
      </Box>

      {/* BOTTOM FOOTER SECTION */}
      <Box sx={{ p: isCollapsed ? 1 : 2 }}>
        {isCollapsed ? (
          <Box sx={{ textAlign: "center" }}>
            <IconButton
              onClick={() => setIsCollapsed(false)}
              sx={{
                color: "#38bdf8",
                bgcolor: "rgba(56, 189, 248, 0.1)",
                border: "1px solid rgba(56, 189, 248, 0.2)",
              }}
            >
              <ChevronRight />
            </IconButton>
          </Box>
        ) : (
          <Box
            sx={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "16px",
              p: 2,
            }}
          >
            <Typography variant="subtitle2" fontWeight="700" sx={{ color: "#fff" }}>
              Admin Panel
            </Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
              Fibre Network Management
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5, color: "#38bdf8" }}>
              <NotificationsActive sx={{ fontSize: 16 }} />
              <Typography variant="caption" fontWeight="600" sx={{ color: "#e2e8f0" }}>
                System Status: Active
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Sidebar;