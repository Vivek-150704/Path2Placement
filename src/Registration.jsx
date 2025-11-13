// client/src/Registration.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, Paper, Grid, Container, CircularProgress, InputAdornment } from '@mui/material';

export default function Registration({ onRegister }) {
  const [formData, setFormData] = useState({
    name: '', usn: '', branch: '', school: '', year: '', email: '', phone: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [isCheckingUsn, setIsCheckingUsn] = useState(false);

  const validationRules = {
    name: /^[a-zA-Z\s]+$/,
    usn: /^[A-Z0-9]+$/,
    phone: /^\d{10}$/,
    year: /^[1-5]$/,
  };

  const validateField = (name, value) => {
    let error = '';
    if (value.trim() === '') {
      return ''; // Will be caught by the final submission check
    }

    if (validationRules[name] && !validationRules[name].test(value)) {
      switch (name) {
        case 'name':
          error = 'Name must contain only letters.';
          break;
        case 'usn':
          error = 'USN must be a mix of capital letters and numbers.';
          break;
        case 'phone':
          error = 'Phone Number must be exactly 10 digits.';
          break;
        case 'year':
          error = 'Year must be a single digit (1-5).';
          break;
        default:
          break;
      }
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Process uppercase for USN and Branch
    const processedValue = (name === 'usn' || name === 'branch') ? value.toUpperCase() : value;
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));

    const error = validateField(name, processedValue);
    setValidationErrors(prev => ({ ...prev, [name]: error }));
    setGlobalError('');

    if (name === 'usn') {
      if (validationErrors.usn === 'This USN has already been used.') {
        setValidationErrors(prev => ({ ...prev, usn: '' }));
      }
    }
  };

  const handleUsnBlur = async () => {
    if (formData.usn.trim() === '' || (validationErrors.usn && validationErrors.usn !== 'This USN has already been used.')) {
      return;
    }

    setIsCheckingUsn(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/check-usn`, { usn: formData.usn });
      if (response.data.exists) {
        setValidationErrors(prev => ({ ...prev, usn: 'This USN has already been used.' }));
      }
    } catch (error) {
      console.error('Error checking USN:', error);
      setGlobalError('Could not verify USN. Please try again.');
    } finally {
      setIsCheckingUsn(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let errors = {};
    let allFieldsValid = true;

    if (Object.values(validationErrors).some(error => error !== '')) {
      setGlobalError('Please fix the errors before submitting.');
      return;
    }

    Object.keys(formData).forEach(key => {
      const fieldError = validateField(key, formData[key]);
      if (formData[key].trim() === '') {
        allFieldsValid = false;
        errors[key] = 'This field is required.';
      } else if (fieldError) {
        allFieldsValid = false;
        errors[key] = fieldError;
      }
    });

    setValidationErrors(errors);

    if (allFieldsValid) {
      setGlobalError('');
      onRegister(formData);
    } else {
      setGlobalError('Please fill out all required fields correctly.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', p: 2, backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="md">
        <Paper elevation={4} sx={{ p: 4, borderRadius: '12px' }}>
          <Typography variant="h4" component="h1" align="center" fontWeight="700" gutterBottom>
            Round 1: The Genesis Gate Registration Form
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 5 }}>
            Please fill in your details to proceed.
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {[
                { name: 'name', label: 'Full Name' },
                { name: 'usn', label: 'USN (University Seat Number)', onBlur: handleUsnBlur },
                // "Team Name" field removed from this array
                { name: 'branch', label: 'Branch (e.g., CSE)' },
                { name: 'school', label: 'College Name' },
                { name: 'year', label: 'Year of Study' },
                { name: 'email', label: 'Email Address', type: 'email' },
                { name: 'phone', label: 'Phone Number', type: 'tel' }
              ].map((field) => {
                const isUppercase = field.name === 'usn' || field.name === 'branch';
                return (
                  <Grid item xs={12} sm={6} key={field.name}>
                    <TextField
                      fullWidth
                      required
                      variant="filled"
                      name={field.name}
                      label={field.label}
                      type={field.type || 'text'}
                      onChange={handleChange}
                      onBlur={field.onBlur}
                      value={formData[field.name]}
                      error={!!validationErrors[field.name]}
                      helperText={validationErrors[field.name]}
                      inputProps={isUppercase ? { style: { textTransform: 'uppercase' } } : {}}
                      InputProps={{
                        endAdornment: field.name === 'usn' && isCheckingUsn && (
                          <InputAdornment position="end">
                            <CircularProgress size={20} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                );
              })}
            </Grid>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              {globalError && <Typography color="error" sx={{ mb: 2, fontWeight: 'bold' }}>{globalError}</Typography>}
              <Button type="submit" variant="contained" size="large" sx={{ py: 1.5, px: 8, fontWeight: 'bold' }}>
                Proceed to Quiz
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}