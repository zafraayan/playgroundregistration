import React, { useContext, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
  Divider,
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
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      kids: [
        {
          number: "",
          kidsName: "",
        },
      ],
      duration: "1 Hour",
      contactNumber: "",
      remarks: "",
    },
  });

  // ========================================
  // KIDS ARRAY
  // ========================================

  const { fields, append, remove } = useFieldArray({
    control,
    name: "kids",
  });

  const selectedDuration = watch("duration");

  // ========================================
  // CALCULATE TIME OUT
  // ========================================

  const calculateTimeOut = (timeIn, duration) => {
    const timeOut = new Date(timeIn);

    if (duration === "30 Minutes") {
      timeOut.setMinutes(timeOut.getMinutes() + 30);
    } else if (duration === "1 Hour") {
      timeOut.setHours(timeOut.getHours() + 1);
    } else if (duration === "Unlimited") {
      return null;
    }

    return timeOut;
  };

  // ========================================
  // SUBMIT BATCH REGISTRATION
  // ========================================

  const onSubmit = async (data) => {
    setLoading(true);
    setSuccess("");
    setApiError("");

    try {
      // ====================================
      // CREATE ONE RECORD FOR EACH KID
      // ====================================

      const registrations = data.kids.map((kid) => {
        const timeIn = new Date();

        const timeOut = calculateTimeOut(timeIn, data.duration);

        return {
          timestamp: new Date().toISOString(),

          // Each kid has their own number
          number: kid.number,

          // Each kid has their own name
          kidsName: kid.kidsName,

          // Shared information
          duration: data.duration,

          contactNumber: data.contactNumber,

          remarks: data.remarks,

          timeIn: timeIn.toISOString(),

          timeOut: timeOut ? timeOut.toISOString() : null,

          status: "ACTIVE",
        };
      });

      // ====================================
      // SAVE ALL KIDS
      // ====================================

      await Promise.all(
        registrations.map((registration) => axios.post(API_URL, registration)),
      );

      console.log("Batch registration saved:", registrations);

      // ====================================
      // REFRESH REGISTRATION LIST
      // ====================================

      refreshRegistrations();

      // ====================================
      // SUCCESS MESSAGE
      // ====================================

      setSuccess(
        `${registrations.length} kid${
          registrations.length > 1 ? "s" : ""
        } successfully registered!`,
      );

      // ====================================
      // RESET FORM
      // ====================================

      reset({
        kids: [
          {
            number: "",
            kidsName: "",
          },
        ],
        duration: "1 Hour",
        contactNumber: "",
        remarks: "",
      });
    } catch (error) {
      console.error("Error saving registrations:", error);

      if (error.response) {
        console.error("Server response:", error.response.data);

        setApiError(`Server error: ${error.response.status}`);
      } else if (error.request) {
        setApiError(
          "Cannot connect to the API server. Make sure localhost:3001 is running.",
        );
      } else {
        setApiError("Failed to save registrations.");
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
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 600,
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
            SUCCESS MESSAGE
        ================================== */}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* ==================================
            ERROR MESSAGE
        ================================== */}

        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        {/* ==================================
            FORM
        ================================== */}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {/* ==================================
              KIDS
          ================================== */}

          {fields.map((field, index) => (
            <Box
              key={field.id}
              sx={{
                mb: 2,
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                Kid {index + 1}
              </Typography>

              {/* NUMBER + NAME */}

              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "flex-start",
                }}
              >
                {/* NUMBER */}

                <TextField
                  label="Number"
                  sx={{ width: "35%" }}
                  size="small"
                  slotProps={{
                    htmlInput: {
                      inputMode: "numeric",
                    },
                  }}
                  {...register(`kids.${index}.number`, {
                    required: "Number is required",

                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Enter numbers only",
                    },
                  })}
                  error={!!errors.kids?.[index]?.number}
                  helperText={errors.kids?.[index]?.number?.message}
                />

                {/* KID NAME */}

                <TextField
                  fullWidth
                  label="Kids Name"
                  size="small"
                  {...register(`kids.${index}.kidsName`, {
                    required: "Kids name is required",
                  })}
                  error={!!errors.kids?.[index]?.kidsName}
                  helperText={errors.kids?.[index]?.kidsName?.message}
                />
              </Box>

              {/* REMOVE BUTTON */}

              {fields.length > 1 && (
                <Button
                  type="button"
                  color="error"
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={() => remove(index)}
                >
                  Remove Kid
                </Button>
              )}
            </Box>
          ))}

          {/* ==================================
              ADD ANOTHER KID
          ================================== */}

          <Button
            type="button"
            variant="outlined"
            fullWidth
            size="small"
            onClick={() =>
              append({
                number: "",
                kidsName: "",
              })
            }
            sx={{ mb: 2 }}
          >
            + Add Another Kid
          </Button>

          <Divider sx={{ mb: 2 }} />

          {/* ==================================
              DURATION
          ================================== */}

          <TextField
            select
            fullWidth
            label="Duration"
            margin="normal"
            size="small"
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
            size="small"
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
            size="small"
            multiline
            rows={3}
            {...register("remarks")}
          />

          {/* ==================================
              SUMMARY
          ================================== */}

          <Typography
            variant="body2"
            sx={{
              mt: 2,
              color: "text.secondary",
            }}
          >
            Total kids: <strong>{fields.length}</strong>
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            Duration: <strong>{selectedDuration}</strong>
          </Typography>

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
              "Register All Kids"
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Registration;
