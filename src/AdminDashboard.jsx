// src/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  CircularProgress, 
  TablePagination, 
  Tabs, 
  Tab,
  Button
} from '@mui/material';
// Removed 'recharts' and 'Grid' imports
import { CSVLink } from 'react-csv';
import QuestionManager from './QuestionManager';
import QuizControls from './QuizControls';

// --- Results Table Component (Unchanged) ---
function ResultsTable({ results, loading }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => { 
    setRowsPerPage(parseInt(event.target.value, 10)); 
    setPage(0); 
  };
  const paginatedResults = results.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const csvHeaders = [
    { label: "Name", key: "name" },
    { label: "USN", key: "usn" },
    // { label: "Team Name", key: "teamName" }, // This was already removed
    { label: "Branch", key: "branch" },
    { label: "School", key: "school" },
    { label: "Year", key: "year" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Score", key: "score" },
    { label: "Total Questions", key: "totalQuestions" },
    { label: "Submitted At", key: "submittedAt" }
  ];

  return (
    <Paper elevation={4} sx={{ p: 3, borderRadius: '12px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">Student Quiz Submissions</Typography>
        <Button
          variant="contained"
          color="success"
          disabled={loading}
          sx={{ textDecoration: 'none' }}
        >
          <CSVLink
            data={results}
            headers={csvHeaders}
            filename={"quiz_results.csv"}
            style={{ textDecoration: 'none', color: 'white' }}
          >
            Export to Excel
          </CSVLink>
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{fontWeight: 'bold'}}>Name</TableCell>
              <TableCell sx={{fontWeight: 'bold'}}>USN</TableCell>
              <TableCell sx={{fontWeight: 'bold'}}>Branch</TableCell>
              <TableCell sx={{fontWeight: 'bold'}}>Score</TableCell>
              <TableCell sx={{fontWeight: 'bold'}}>Submitted At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center"><CircularProgress /></TableCell></TableRow>
            ) : ( 
              paginatedResults.map((result) => (
                <TableRow key={result._id} hover>
                  <TableCell>{result.name}</TableCell>
                  <TableCell>{result.usn}</TableCell>
                  <TableCell>{result.branch}</TableCell>
                  <TableCell>{`${result.score} / ${result.totalQuestions}`}</TableCell>
                  <TableCell>{new Date(result.submittedAt).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination 
        rowsPerPageOptions={[10, 25, 50]} 
        component="div" 
        count={results.length} 
        rowsPerPage={rowsPerPage} 
        page={page} 
        onPageChange={handleChangePage} 
        onRowsPerPageChange={handleChangeRowsPerPage} 
      />
    </Paper>
  );
}


// --- Main Admin Dashboard Component (Updated) ---
export default function AdminDashboard() {
  const [currentTab, setCurrentTab] = useState(0);
  const [results, setResults] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/results`);
        setResults(response.data);
      } catch (error) { 
        console.error('Failed to fetch results for dashboard:', error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchResults();
  }, []);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" component="h1" fontWeight="700" gutterBottom sx={{ mb: 4 }}>
          Admin Dashboard
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          {/* --- "Analytics" Tab Removed --- */}
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="Results" />
            <Tab label="Questions" />
            <Tab label="Settings" />
          </Tabs>
        </Box>
        
        {/* --- Tab mapping updated --- */}
        {currentTab === 0 && <ResultsTable results={results} loading={loading} />} 
        {currentTab === 1 && <QuestionManager />}
        {currentTab === 2 && <QuizControls />} 

      </Container>
    </Box>
  );
}