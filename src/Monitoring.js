import React, { useContext, useEffect, useState } from "react";

import { RegistrationContext } from "./context/RegistrationContext";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import axios from "axios";

// ========================================
// API URL
// ========================================

const API_URL = "http://localhost:3001/registrations";

// ========================================
// GET DURATION
// ========================================

const getDurationMs = (duration) => {
  switch (duration) {
    case "30 Minutes":
      return 30 * 60 * 1000;

    case "1 Hour":
      return 60 * 60 * 1000;

    case "Unlimited":
      return null;

    default:
      return 60 * 60 * 1000;
  }
};

// ========================================
// FORMAT TIME
// ========================================

const formatTime = (timestamp) => {
  if (!timestamp) {
    return "-";
  }

  const date = new Date(timestamp);

  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  return date.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  });
};

// ========================================
// FORMAT TIME OUT
// ========================================

const formatTimeOut = (timestamp, duration) => {
  if (!timestamp) {
    return "-";
  }

  if (duration === "Unlimited") {
    return "Unlimited";
  }

  const timeIn = new Date(timestamp);

  if (isNaN(timeIn.getTime())) {
    return "Invalid Date";
  }

  const durationMs = getDurationMs(duration);

  const timeOut = new Date(timeIn.getTime() + durationMs);

  return formatTime(timeOut);
};

// ========================================
// COUNTDOWN
// ========================================

function Countdown({ timestamp, duration }) {
  const calculateRemaining = () => {
    if (!timestamp) {
      return 0;
    }

    // Unlimited
    if (duration === "Unlimited") {
      return null;
    }

    const timeIn = new Date(timestamp).getTime();

    if (isNaN(timeIn)) {
      return 0;
    }

    const durationMs = getDurationMs(duration);

    const timeOut = timeIn + durationMs;

    return Math.max(0, timeOut - Date.now());
  };

  const [remaining, setRemaining] = useState(calculateRemaining());

  useEffect(() => {
    if (duration === "Unlimited") {
      setRemaining(null);
      return;
    }

    const timer = setInterval(() => {
      setRemaining(calculateRemaining());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [timestamp, duration]);

  // ========================================
  // UNLIMITED
  // ========================================

  if (duration === "Unlimited") {
    return (
      <span
        style={{
          fontWeight: "bold",
          color: "blue",
        }}
      >
        UNLIMITED
      </span>
    );
  }

  // ========================================
  // EXPIRED
  // ========================================

  if (remaining <= 0) {
    return (
      <span
        style={{
          fontWeight: "bold",
          color: "red",
        }}
      >
        0m 0s
      </span>
    );
  }

  // ========================================
  // CALCULATE
  // ========================================

  const totalSeconds = Math.floor(remaining / 1000);

  const hours = Math.floor(totalSeconds / 3600);

  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const seconds = totalSeconds % 60;

  return (
    <span>
      {hours > 0 && `${hours}h `}
      {minutes}m {seconds}s
    </span>
  );
}

// ========================================
// MONITORING
// ========================================

function Monitoring() {
  const { refreshKey } = useContext(RegistrationContext);

  // ========================================
  // API DATA
  // ========================================

  const [regArray, setRegArray] = useState([]);

  // ========================================
  // SEARCH
  // ========================================

  const [searchName, setSearchName] = useState("");

  // ========================================
  // LOADING
  // ========================================

  const [loading, setLoading] = useState(true);

  // ========================================
  // REFRESH TABLE
  // ========================================

  const [, setCurrentTime] = useState(Date.now());

  // ========================================
  // FETCH API
  // ========================================

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);

        const response = await axios.get(API_URL);

        console.log("API Data:", response.data);

        setRegArray(response.data);
      } catch (error) {
        console.error("Error fetching registrations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [refreshKey]);

  // ========================================
  // UPDATE EVERY SECOND
  // ========================================

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // ========================================
  // SEARCH
  // ========================================

  const filteredArray = regArray.filter((item) =>
    item.kidsName?.toLowerCase().includes(searchName.toLowerCase()),
  );

  // ========================================
  // UI
  // ========================================

  return (
    <Box>
      {/* ================================
          SEARCH
      ================================= */}

      <TextField
        label="Search Kids Name"
        variant="outlined"
        size="small"
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
        sx={{
          mb: 2,
          width: 300,
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* ================================
          LOADING
      ================================= */}

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            p: 5,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table
            sx={{
              minWidth: 650,
            }}
          >
            {/* ============================
                HEADER
            ============================= */}

            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                  }}
                >
                  Timestamp
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: "bold",
                  }}
                >
                  Reg. Number
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: "bold",
                  }}
                >
                  Kids Name
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: "bold",
                  }}
                >
                  Duration
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: "bold",
                  }}
                >
                  Contact Number
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: "bold",
                  }}
                >
                  Time In
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: "bold",
                  }}
                >
                  Time Out
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: "bold",
                  }}
                >
                  Remaining Time
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: "bold",
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                  }}
                >
                  Remarks
                </TableCell>
              </TableRow>
            </TableHead>

            {/* ============================
                BODY
            ============================= */}

            <TableBody>
              {filteredArray.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography
                      sx={{
                        py: 3,
                      }}
                    >
                      No registrations found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredArray.map((item, index) => {
                  const timeIn = new Date(item.timestamp).getTime();

                  const durationMs = getDurationMs(item.duration);

                  const timeOut =
                    durationMs === null ? null : timeIn + durationMs;

                  const expired =
                    item.duration !== "Unlimited" &&
                    (!item.timestamp || isNaN(timeIn) || Date.now() >= timeOut);

                  return (
                    <TableRow
                      key={item.id || index}
                      hover
                      sx={{
                        backgroundColor: expired ? "#ffcccc" : "inherit",
                      }}
                    >
                      {/* Timestamp */}

                      <TableCell>{formatTime(item.timestamp)}</TableCell>

                      {/* Registration Number */}

                      <TableCell>{item.number}</TableCell>

                      {/* Kids Name */}

                      <TableCell>{item.kidsName}</TableCell>

                      {/* Duration */}

                      <TableCell>{item.duration}</TableCell>

                      {/* Contact */}

                      <TableCell>{item.contactNumber}</TableCell>

                      {/* Time In */}

                      <TableCell>{formatTime(item.timestamp)}</TableCell>

                      {/* Time Out */}

                      <TableCell>
                        {formatTimeOut(item.timestamp, item.duration)}
                      </TableCell>

                      {/* Countdown */}

                      <TableCell>
                        <Countdown
                          timestamp={item.timestamp}
                          duration={item.duration}
                        />
                      </TableCell>

                      {/* Status */}

                      <TableCell>
                        <strong
                          style={{
                            color: expired ? "red" : "green",
                          }}
                        >
                          {expired ? "EXPIRED" : "ACTIVE"}
                        </strong>
                      </TableCell>

                      <TableCell>{item.remarks}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default Monitoring;
