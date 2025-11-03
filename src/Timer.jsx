// Round-1/src/Timer.jsx
import React, { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';

export default function Timer({ duration, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }
    const intervalId = setInterval(() => { setTimeLeft(prevTime => prevTime - 1); }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Box>
      <Typography variant="h5" fontWeight="700" sx={{ color: 'error.main' }}>
        Time: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Typography>
    </Box>
  );
}