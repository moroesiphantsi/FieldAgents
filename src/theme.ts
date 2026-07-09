// src/theme.ts
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#e53935" }, // traffic red
    secondary: { main: "#fdd835" }, // caution yellow
  },
  shape: { borderRadius: 12 },
});
