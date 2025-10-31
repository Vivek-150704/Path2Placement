// src/QuizControls.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Paper, Switch, FormControlLabel } from '@mui/material';

export default function QuizControls() {
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // --- FIX #1 ---
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/quiz/status`);
        setIsActive(response.data.isActive);
      } catch (error) {
        console.error("Failed to fetch quiz status:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleToggleChange = async (event) => {
    const newStatus = event.target.checked;
    setIsActive(newStatus); // Optimistically update UI
    try {
      // --- FIX #2 ---
      await axios.put(`${import.meta.env.VITE_API_URL}/api/quiz/status`, { isActive: newStatus });
    } catch (error) {
      console.error("Failed to update quiz status:", error);
      // Revert state if the API call fails
      setIsActive(!newStatus);
    }
  };

  return (
    <Paper elevation={4} sx={{ p: 3, borderRadius: '12px' }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Quiz Settings
      </Typography>
      <Box>
        <FormControlLabel
          control={
            <Switch
              checked={isActive}
              onChange={handleToggleChange}
              disabled={loading}
              color="success"
            />
          }
          label={isActive ? "Quiz is currently ACTIVE" : "Quiz is currently INACTIVE"}
        />
        <Typography variant="body2" color="text.secondary">
          When the quiz is active, students can register and take the test. When inactive, they will see a "quiz closed" message.
        </Typography>
      </Box>
    </Paper>
  );
}