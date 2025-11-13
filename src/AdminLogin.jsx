// src/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Button, TextField, Typography, Paper, Container } from '@mui/material';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // --- THIS IS THE CORRECTED LINE ---
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/login`, {
        username,
        password,
      });

      if (response.status === 200) {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError('Invalid username or password.');
      console.error('Admin login failed:', err);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="xs">
        <Paper elevation={6} sx={{ p: 4, borderRadius: '12px' }}>
          <Typography variant="h4" component="h1" align="center" fontWeight="700" gutterBottom>
            Admin Login
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              required
              margin="normal"
              variant="outlined"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              fullWidth
              required
              margin="normal"
              variant="outlined"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <Typography color="error" align="center" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}
            >
              Login
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}