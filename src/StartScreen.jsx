// src/StartScreen.jsx
import React from 'react';
import { Box, Button, Typography, Paper, Container } from '@mui/material';

export default function StartScreen({ userName, onStartQuiz }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: 2, backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="md">
        <Paper elevation={4} sx={{ p: 6, borderRadius: '12px' }}>
          <Typography variant="h3" component="h1" fontWeight="700" gutterBottom>
            Welcome, <Box component="span" sx={{ color: 'primary.main' }}>{userName}</Box>!
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ my: 4 }}>
            {/* --- THIS TEXT IS NOW UPDATED --- */}
            You will have <Box component="span" fontWeight="bold">60 minutes</Box> to complete the aptitude test.
            <br />
            Switching tabs will result in automatic submission. Good luck!
          </Typography>
          <Button onClick={onStartQuiz} variant="contained" size="large" color="success" sx={{ py: 1.5, px: 8, fontWeight: 'bold', fontSize: '1.1rem' }}>
            Start Quiz
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}