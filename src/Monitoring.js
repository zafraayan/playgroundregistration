import React, { useContext, useEffect, useState } from "react";
import { RegistrationContext } from "./context/RegistrationContext";

import {
  Box,
  IconButton,
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
  MenuItem,
  Tooltip,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

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
  // CURRENT TIME
  // ========================================

  const [currentTime, setCurrentTime] = useState(Date.now());

  // ========================================
  // EDITING
  // ========================================

  const [editingId, setEditingId] = useState(null);

  const [editData, setEditData] = useState({
    kidsName: "",
    contactNumber: "",
    duration: "",
    remarks: "",
  });

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
  // EDIT
  // ========================================

  const handleEdit = (item) => {
    setEditingId(item.id);

    setEditData({
      kidsName: item.kidsName || "",
      contactNumber: item.contactNumber || "",
      duration: item.duration || "1 Hour",
      remarks: item.remarks || "",
    });
  };

  // ========================================
  // CANCEL EDIT
  // ========================================

  const handleCancel = () => {
    setEditingId(null);

    setEditData({
      kidsName: "",
      contactNumber: "",
      duration: "",
      remarks: "",
    });
  };

  // ========================================
  // UPDATE
  // ========================================

  const handleUpdate = async (id) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}`, editData);

      setRegArray((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                ...response.data,
              }
            : item,
        ),
      );

      handleCancel();

      console.log("Registration updated successfully.");
    } catch (error) {
      console.error("Error updating registration:", error);
    }
  };

  // ========================================
  // DELETE
  // ========================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this registration?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/${id}`);

      setRegArray((prev) => prev.filter((item) => item.id !== id));

      console.log("Registration deleted successfully.");
    } catch (error) {
      console.error("Error deleting registration:", error);
    }
  };

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
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "end",
            width: "95%",
            height: "100vh",
            margin: "auto",
            p: 2,
          }}
        >
          {/* SEARCH */}

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
              TABLE
          ================================= */}

          <TableContainer component={Paper}>
            <Table
              sx={{
                margin: "auto",
                minWidth: 1000,
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

                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              {/* ============================
                  BODY
              ============================= */}

              <TableBody>
                {filteredArray.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
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
                      (!item.timestamp ||
                        isNaN(timeIn) ||
                        Date.now() >= timeOut);

                    const isEditing = editingId === item.id;

                    return (
                      <TableRow
                        key={item.id || index}
                        hover
                        sx={{
                          backgroundColor: expired ? "#ffcccc" : "inherit",
                        }}
                      >
                        {/* ==========================
                            REGISTRATION NUMBER
                        =========================== */}

                        <TableCell>{item.number}</TableCell>

                        {/* ==========================
                            KIDS NAME
                        =========================== */}

                        <TableCell>
                          {isEditing ? (
                            <TextField
                              size="small"
                              fullWidth
                              value={editData.kidsName}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  kidsName: e.target.value,
                                })
                              }
                            />
                          ) : (
                            item.kidsName
                          )}
                        </TableCell>

                        {/* ==========================
                            DURATION
                        =========================== */}

                        <TableCell>
                          {isEditing ? (
                            <TextField
                              select
                              size="small"
                              value={editData.duration}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  duration: e.target.value,
                                })
                              }
                            >
                              <MenuItem value="30 Minutes">30 Minutes</MenuItem>

                              <MenuItem value="1 Hour">1 Hour</MenuItem>

                              <MenuItem value="Unlimited">Unlimited</MenuItem>
                            </TextField>
                          ) : (
                            item.duration
                          )}
                        </TableCell>

                        {/* ==========================
                            CONTACT
                        =========================== */}

                        <TableCell>
                          {isEditing ? (
                            <TextField
                              size="small"
                              value={editData.contactNumber}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  contactNumber: e.target.value,
                                })
                              }
                            />
                          ) : (
                            item.contactNumber
                          )}
                        </TableCell>

                        {/* ==========================
                            TIME IN
                        =========================== */}

                        <TableCell>{formatTime(item.timestamp)}</TableCell>

                        {/* ==========================
                            TIME OUT
                        =========================== */}

                        <TableCell>
                          {formatTimeOut(
                            item.timestamp,
                            isEditing ? editData.duration : item.duration,
                          )}
                        </TableCell>

                        {/* ==========================
                            COUNTDOWN
                        =========================== */}

                        <TableCell>
                          <Countdown
                            timestamp={item.timestamp}
                            duration={
                              isEditing ? editData.duration : item.duration
                            }
                          />
                        </TableCell>

                        {/* ==========================
                            STATUS
                        =========================== */}

                        <TableCell>
                          <strong
                            style={{
                              color: expired ? "red" : "green",
                            }}
                          >
                            {expired ? "EXPIRED" : "ACTIVE"}
                          </strong>
                        </TableCell>

                        {/* ==========================
                            REMARKS
                        =========================== */}

                        <TableCell>
                          {isEditing ? (
                            <TextField
                              size="small"
                              value={editData.remarks}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  remarks: e.target.value,
                                })
                              }
                            />
                          ) : (
                            item.remarks
                          )}
                        </TableCell>

                        {/* ==========================
                            ACTIONS
                        =========================== */}

                        <TableCell
                          sx={{
                            whiteSpace: "nowrap",
                            textAlign: "center",
                          }}
                        >
                          {isEditing ? (
                            <>
                              {/* UPDATE */}

                              <Tooltip title="Update">
                                <IconButton
                                  color="success"
                                  onClick={() => handleUpdate(item.id)}
                                >
                                  <SaveIcon />
                                </IconButton>
                              </Tooltip>

                              {/* CANCEL */}

                              <Tooltip title="Cancel">
                                <IconButton
                                  color="inherit"
                                  onClick={handleCancel}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <>
                              {/* EDIT */}

                              <Tooltip title="Edit">
                                <IconButton
                                  color="primary"
                                  onClick={() => handleEdit(item)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>

                              {/* DELETE */}

                              <Tooltip title="Delete">
                                <IconButton
                                  color="error"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}

export default Monitoring;
