import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

import { RegistrationContext } from "./context/RegistrationContext";

import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";

const API_URL = "http://localhost:3001/registrations";

const Registration = () => {
  const { refreshRegistrations } = useContext(RegistrationContext);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      number: "",
      kidsName: "",
      duration: "1 Hour",
      contactNumber: "",
      remarks: "",
    },
  });

  // ========================================
  // SUBMIT REGISTRATION
  // ========================================

  const onSubmit = async (data) => {
    setLoading(true);
    setSuccess("");
    setApiError("");

    // Create Time In
    const timeIn = new Date();

    // Add 5 minutes to Time In
    const timeOut = new Date(timeIn.getTime() + 5 * 60 * 1000);

    // Create registration object
    const registrationData = {
      timestamp: new Date().toISOString(),

      number: data.number,

      kidsName: data.kidsName,

      duration: data.duration,

      contactNumber: data.contactNumber,

      remarks: data.remarks,

      timeIn: timeIn.toISOString(),

      timeOut: timeOut.toISOString(),

      status: "ACTIVE",
    };

    try {
      // ====================================
      // SAVE TO REST API
      // ====================================

      const response = await axios.post(API_URL, registrationData);

      console.log("Registration saved:", response.data);

      // ====================================
      // REFRESH MONITORING
      // ====================================

      refreshRegistrations();

      // ====================================
      // SUCCESS MESSAGE
      // ====================================

      setSuccess("Registration successfully added!");

      // ====================================
      // RESET FORM
      // ====================================

      reset({
        number: "",
        kidsName: "",
        duration: "1 Hour",
        contactNumber: "",
        remarks: "",
      });
    } catch (error) {
      console.error("Error saving registration:", error);

      // More useful error message
      if (error.response) {
        console.error("Server response:", error.response.data);

        setApiError(`Server error: ${error.response.status}`);
      } else if (error.request) {
        setApiError(
          "Cannot connect to the API server. Make sure localhost:3001 is running.",
        );
      } else {
        setApiError("Failed to save registration.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // backgroundColor: "#f5f5f5",
        // backgroundColor: "rgba(255, 255, 255, 0.95)",
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 450,
          p: 4,
        }}
      >
        {/* ==================================
            TITLE
        ================================== */}

        <Typography variant="h5" fontWeight="bold" mb={3}>
          Kids Registration
        </Typography>

        {/* ==================================
            SUCCESS
        ================================== */}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* ==================================
            ERROR
        ================================== */}

        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        {/* ==================================
            FORM
        ================================== */}

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* ==================================
              NUMBER
          ================================== */}

          <TextField
            fullWidth
            label="Number"
            margin="normal"
            slotProps={{
              htmlInput: {
                inputMode: "numeric",
              },
            }}
            {...register("number", {
              required: "Number is required",

              pattern: {
                value: /^[0-9]+$/,
                message: "Enter numbers only",
              },
            })}
            error={!!errors.number}
            helperText={errors.number?.message}
          />

          {/* ==================================
              KIDS NAME
          ================================== */}

          <TextField
            fullWidth
            label="Kids Name"
            margin="normal"
            {...register("kidsName", {
              required: "Kids name is required",
            })}
            error={!!errors.kidsName}
            helperText={errors.kidsName?.message}
          />

          {/* ==================================
              DURATION
          ================================== */}

          <TextField
            select
            fullWidth
            label="Duration"
            margin="normal"
            defaultValue="1 Hour"
            {...register("duration", {
              required: "Please select a duration",
            })}
            error={!!errors.duration}
            helperText={errors.duration?.message}
          >
            <MenuItem value="30 Minutes">30 Minutes Extension</MenuItem>

            <MenuItem value="1 Hour">1 Hour</MenuItem>

            <MenuItem value="Unlimited">Unlimited</MenuItem>
          </TextField>

          {/* ==================================
              CONTACT NUMBER
          ================================== */}

          <TextField
            fullWidth
            label="Contact Number"
            margin="normal"
            slotProps={{
              htmlInput: {
                maxLength: 11,
                inputMode: "numeric",
              },
            }}
            {...register("contactNumber", {
              required: "Please enter a valid 11-digit number.",

              pattern: {
                value: /^[0-9]{11}$/,
                message: "Enter an 11-digit contact number",
              },
            })}
            error={!!errors.contactNumber}
            helperText={errors.contactNumber?.message}
          />

          {/* ==================================
              REMARKS
          ================================== */}

          <TextField
            fullWidth
            label="Remarks"
            margin="normal"
            multiline
            rows={3}
            {...register("remarks")}
            error={!!errors.remarks}
            helperText={errors.remarks?.message}
          />

          {/* ==================================
              REGISTER BUTTON
          ================================== */}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Saving...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Registration;
