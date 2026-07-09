import React from "react";
import {
  Typography,
  Paper,
  Button,
  Divider,
  Chip,
  Box,
} from "@mui/material";

const LeadDetails = ({ lead }: any) => {
  if (!lead) return <Typography>Select a lead</Typography>;

  return (
    <Paper
      sx={{
        p: 3,
        mt: 2,
        borderRadius: 3,
      }}
    >
      <Typography variant="h5" fontWeight="bold">
        {lead.name} {lead.surname}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography>
 <b>Date Received:</b>{" "}
 {lead.createdAt 
 ? new Date(lead.createdAt).toLocaleString()
 : "N/A"}
</Typography>


<Typography>
 <b>Email:</b> {lead.email}
</Typography>

      <Typography>
        <b>Contact:</b> {lead.contact}
      </Typography>

      <Typography>
        <b>Installation Address:</b> {lead.address}
      </Typography>

      <Typography>
        <b>Status:</b> {lead.status}
      </Typography>

      {/* PACKAGE PLAN */}
      <Box sx={{ mt: 2 }}>
        <Typography fontWeight="bold">
          Fibre Package
        </Typography>

        <Chip
          label={lead.packagePlan || "No Package Selected"}
          color="primary"
          sx={{ mt: 1 }}
        />
      </Box>

      {/* PRICE */}
      <Box sx={{ mt: 2 }}>
        <Typography fontWeight="bold">
          Monthly Price
        </Typography>

        <Chip
          label={lead.price || "N/A"}
          color="success"
          sx={{ mt: 1 }}
        />
      </Box>

      <Button
        sx={{ mt: 3 }}
        variant="contained"
        href={`https://wa.me/${lead.contact?.replace(/\D/g, "")}`}
        target="_blank"
      >
        WhatsApp Customer
      </Button>
    </Paper>
  );
};

export default LeadDetails;