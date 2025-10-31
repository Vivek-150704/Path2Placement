// src/QuestionManager.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  CircularProgress
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

export default function QuestionManager() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      // --- FIX #1 ---
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/questions`);
      setQuestions(response.data);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (question = null) => {
    setCurrentQuestion(question);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentQuestion(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        // --- FIX #2 ---
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/questions/${id}`);
        fetchQuestions();
      } catch (error) {
        console.error("Failed to delete question:", error);
      }
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      questionText: formData.get('questionText'),
      options: formData.get('options').split(',').map(opt => opt.trim()),
      correctAnswer: formData.get('correctAnswer'),
      explanation: formData.get('explanation'),
    };

    try {
      if (currentQuestion) {
        // --- FIX #3 ---
        await axios.put(`${import.meta.env.VITE_API_URL}/api/questions/${currentQuestion._id}`, data);
      } else {
        // --- FIX #4 ---
        await axios.post(`${import.meta.env.VITE_API_URL}/api/questions`, data);
      }
      fetchQuestions();
      handleClose();
    } catch (error) {
      console.error("Failed to save question:", error);
    }
  };

  return (
    <Paper elevation={4} sx={{ p: 3, borderRadius: '12px', mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">Manage Questions</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>Add New Question</Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{fontWeight: 'bold'}}>Question Text</TableCell>
              <TableCell sx={{fontWeight: 'bold'}} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} align="center"><CircularProgress /></TableCell>
              </TableRow>
            ) : (
              questions.map((q) => (
                <TableRow key={q._id} hover>
                  <TableCell>{q.questionText}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(q)}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(q._id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{currentQuestion ? 'Edit Question' : 'Add New Question'}</DialogTitle>
        <DialogContent>
          <Box component="form" id="question-form" onSubmit={handleSave} sx={{ pt: 1 }}>
            <TextField name="questionText" label="Question Text" defaultValue={currentQuestion?.questionText} fullWidth margin="normal" required />
            <TextField name="options" label="Options (comma-separated)" defaultValue={currentQuestion ? currentQuestion.options.join(', ') : ''} fullWidth margin="normal" required />
            <TextField name="correctAnswer" label="Correct Answer" defaultValue={currentQuestion?.correctAnswer} fullWidth margin="normal" required />
            <TextField name="explanation" label="Explanation" defaultValue={currentQuestion?.explanation} fullWidth margin="normal" required multiline rows={3} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="question-form" variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}