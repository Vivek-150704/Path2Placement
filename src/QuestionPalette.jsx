// quiz-app-ui/src/QuestionPalette.jsx
import React from 'react';
import { Box, Typography, Paper, Grid, Chip } from '@mui/material';

export default function QuestionPalette({ questions, answers, onQuestionSelect }) {
  const getStatus = (questionId) => {
    return answers[questionId] ? 'attended' : 'not-attended';
  };

  return (
    <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'grey.300' }}>
      <Typography variant="h6" fontWeight="700" align="center" gutterBottom>
        Question Navigation
      </Typography>
      <Paper elevation={0} sx={{ p: 2, backgroundColor: 'grey.100', borderRadius: '8px' }}>
        <Grid container spacing={1} justifyContent="center">
          {questions.map((q, index) => {
            const status = getStatus(q._id);
            return (
              <Grid item key={q._id}>
                <Chip
                  label={index + 1}
                  clickable
                  onClick={() => onQuestionSelect(q._id)}
                  color={status === 'attended' ? 'success' : 'default'}
                  variant={status === 'attended' ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 'bold' }}
                />
              </Grid>
            );
          })}
        </Grid>
      </Paper>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 3 }}>
        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip label=" " color="success" size="small" sx={{ mr: 1 }} /> Attended
        </Typography>
        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip label=" " color="default" variant="outlined" size="small" sx={{ mr: 1 }} /> Not Attended
        </Typography>
      </Box>
    </Box>
  );
}