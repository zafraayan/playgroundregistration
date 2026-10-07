import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Monitor } from "@mui/icons-material";
import Registration from "./Registration";
import Monitoring from "./Monitoring";

import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

function App() {
  return (
    <Box>
      <BrowserRouter>
        <Box
          component="nav"
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            p: 2,
          }}
        >
          <Link to="/">Registration</Link>
          <Link to="/monitoring">Monitoring</Link>
        </Box>

        <Routes>
          <Route path="/" element={<Registration />} />

          <Route path="/monitoring" element={<Monitoring />} />
        </Routes>
      </BrowserRouter>
    </Box>
  );
}

export default App;
