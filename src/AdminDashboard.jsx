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
  Grid,
  Button // Make sure Button is imported
} from '@mui/material';
// Correct import from recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CSVLink } from 'react-csv'; // Correct import from react-csv
import QuestionManager from './QuestionManager';
import QuizControls from './QuizControls';

// --- 1. Helper function for Analytics ---
const processAnalyticsData = (results) => {
  const scoreDistribution = {};
  const branchParticipation = {};
  const schoolParticipation = {};
  const yearParticipation = {};
  
  results.forEach(result => {
    const score = result.score;
    scoreDistribution[score] = (scoreDistribution[score] || 0) + 1;
    const branch = result.branch || 'N/A';
    branchParticipation[branch] = (branchParticipation[branch] || 0) + 1;
    const school = result.school || 'N/A';
    schoolParticipation[school] = (schoolParticipation[school] || 0) + 1;
    const year = result.year || 'N/A';
    yearParticipation[year] = (yearParticipation[year] || 0) + 1;
  });

  const scoreData = Object.keys(scoreDistribution).map(score => ({
    score: parseInt(score),
    count: scoreDistribution[score],
  })).sort((a, b) => a.score - b.score);

  const branchData = Object.keys(branchParticipation).map(branch => ({
    name: branch,
    value: branchParticipation[branch],
  }));

  const schoolData = Object.keys(schoolParticipation).map(school => ({
    name: school,
    value: schoolParticipation[school],
  }));

  const yearData = Object.keys(yearParticipation).map(year => ({
    name: year,
    value: yearParticipation[year],
  }));

  return { scoreData, branchData, schoolData, yearData };
};


// --- 2. Analytics Charts Component ---
function AnalyticsCharts({ results, loading }) {
  const { scoreData, branchData, schoolData, yearData } = processAnalyticsData(results);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#8A2BE2', '#DC143C', '#20B2AA'];
  const CHART_HEIGHT = 300; 

  if (loading) {
    return <CircularProgress sx={{ m: 5 }} />;
  }

  if (results.length === 0) {
    return (
      <Paper elevation={4} sx={{ p: 4, borderRadius: '12px', textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No quiz results available yet to generate analytics.
        </Typography>
      </Paper>
    );
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6} key="score-chart">
        <Paper elevation={4} sx={{ p: 3, borderRadius: '12px' }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Score Distribution</Typography>
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <BarChart data={scoreData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="score" label={{ value: 'Score', position: 'bottom', offset: 0 }} minTickGap={5} />
              <YAxis allowDecimals={false} domain={[0, 'dataMax + 1']} label={{ value: 'No. of Students', angle: -90, position: 'insideLeft', offset: 10 }} />
              <Tooltip formatter={(value) => `${value} Students`} />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} key="branch-chart">
        <Paper elevation={4} sx={{ p: 3, borderRadius: '12px' }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Participation by Branch</Typography>
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <Pie data={branchData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label={renderCustomizedLabel} labelLine={false}>
                {branchData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [`${value} Students`, props.payload.name]} />
              <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ paddingLeft: '15px' }} />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} key="school-chart">
        <Paper elevation={4} sx={{ p: 3, borderRadius: '12px' }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Participation by School</Typography>
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <Pie data={schoolData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label={renderCustomizedLabel} labelLine={false}>
                {schoolData.map((entry, index) => ( <Cell key={`cell-school-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [`${value} Students`, props.payload.name]} />
              <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ paddingLeft: '15px' }} />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} key="year-chart">
        <Paper elevation={4} sx={{ p: 3, borderRadius: '12px' }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Participation by Year</Typography>
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <Pie data={yearData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label={renderCustomizedLabel} labelLine={false}>
                {yearData.map((entry, index) => ( <Cell key={`cell-year-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [`${value} Students`, props.payload.name]} />
              <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ paddingLeft: '15px' }} />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}


// --- 3. Results Table Component ---
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
    { label: "Team Name", key: "teamName" },
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
              <TableCell sx={{fontWeight: 'bold'}}>Team Name</TableCell>
              <TableCell sx={{fontWeight: 'bold'}}>Branch</TableCell>
              <TableCell sx={{fontWeight: 'bold'}}>Score</TableCell>
              <TableCell sx={{fontWeight: 'bold'}}>Submitted At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center"><CircularProgress /></TableCell></TableRow>
            ) : ( 
              paginatedResults.map((result) => (
                <TableRow key={result._id} hover>
                  <TableCell>{result.name}</TableCell>
                  <TableCell>{result.usn}</TableCell>
                  <TableCell>{result.teamName}</TableCell>
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


// --- 4. Main Admin Dashboard Component ---
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
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="Results" />
            <Tab label="Questions" />
            <Tab label="Analytics" />
            <Tab label="Settings" />
          </Tabs>
        </Box>
        
        {currentTab === 0 && <ResultsTable results={results} loading={loading} />} 
        {currentTab === 1 && <QuestionManager />}
        {currentTab === 2 && <AnalyticsCharts results={results} loading={loading} />} 
        {currentTab === 3 && <QuizControls />}

      </Container>
    </Box>
  );
}