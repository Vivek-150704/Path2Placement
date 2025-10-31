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
  Divider,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import QuestionManager from './QuestionManager';
import QuizControls from './QuizControls';

// ------------------ Helper Function ------------------
const processAnalyticsData = (results) => {
  const scoreDistribution = {};
  const branchParticipation = {};
  const schoolParticipation = {};
  const yearParticipation = {};

  results.forEach((result) => {
    const score = result.score;
    scoreDistribution[score] = (scoreDistribution[score] || 0) + 1;

    const branch = result.branch || 'N/A';
    branchParticipation[branch] = (branchParticipation[branch] || 0) + 1;

    const school = result.school || 'N/A';
    schoolParticipation[school] = (schoolParticipation[school] || 0) + 1;

    const year = result.year || 'N/A';
    yearParticipation[year] = (yearParticipation[year] || 0) + 1;
  });

  const scoreData = Object.keys(scoreDistribution)
    .map((score) => ({
      score: parseInt(score),
      count: scoreDistribution[score],
    }))
    .sort((a, b) => a.score - b.score);

  const branchData = Object.keys(branchParticipation).map((branch) => ({
    name: branch,
    value: branchParticipation[branch],
  }));

  const schoolData = Object.keys(schoolParticipation).map((school) => ({
    name: school,
    value: schoolParticipation[school],
  }));

  const yearData = Object.keys(yearParticipation).map((year) => ({
    name: year,
    value: yearParticipation[year],
  }));

  return { scoreData, branchData, schoolData, yearData };
};

// ------------------ Analytics Charts ------------------
function AnalyticsCharts({ results, loading }) {
  const { scoreData, branchData, schoolData, yearData } =
    processAnalyticsData(results);
  const COLORS = [
    '#42A5F5',
    '#66BB6A',
    '#FFA726',
    '#EF5350',
    '#AB47BC',
    '#26C6DA',
    '#D4E157',
    '#8D6E63',
  ];
  const CHART_HEIGHT = 300;

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress size={50} />
      </Box>
    );

  if (results.length === 0)
    return (
      <Paper
        elevation={3}
        sx={{ p: 6, borderRadius: 4, textAlign: 'center', mt: 4 }}
      >
        <Typography variant="h6" color="text.secondary">
          No quiz results available yet to generate analytics.
        </Typography>
      </Paper>
    );

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const chartCard = (title, children) => (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 4,
        backgroundColor: '#fff',
        transition: 'all 0.3s ease',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: 6 },
      }}
    >
      <Typography
        variant="h6"
        fontWeight="bold"
        gutterBottom
        color="primary.dark"
      >
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Paper>
  );

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        {chartCard(
          'Score Distribution',
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <BarChart
              data={scoreData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="score" label={{ value: 'Score', position: 'bottom' }} />
              <YAxis
                allowDecimals={false}
                domain={[0, 'dataMax + 1']}
                label={{
                  value: 'No. of Students',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip formatter={(v) => `${v} Students`} />
              <Bar dataKey="count" fill="#42A5F5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Grid>

      <Grid item xs={12} md={6}>
        {chartCard(
          'Participation by Branch',
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <PieChart>
              <Pie
                data={branchData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={renderCustomizedLabel}
                labelLine={false}
              >
                {branchData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, _, props) => [`${v} Students`, props.payload.name]} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Grid>

      <Grid item xs={12} md={6}>
        {chartCard(
          'Participation by School',
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <PieChart>
              <Pie
                data={schoolData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={renderCustomizedLabel}
                labelLine={false}
              >
                {schoolData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, _, props) => [`${v} Students`, props.payload.name]} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Grid>

      <Grid item xs={12} md={6}>
        {chartCard(
          'Participation by Year',
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <PieChart>
              <Pie
                data={yearData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={renderCustomizedLabel}
                labelLine={false}
              >
                {yearData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, _, props) => [`${v} Students`, props.payload.name]} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Grid>
    </Grid>
  );
}

// ------------------ Results Table ------------------
function ResultsTable({ results, loading }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };
  const paginatedResults = results.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper
      elevation={3}
      sx={{ p: 3, borderRadius: 4, backgroundColor: '#fff', overflow: 'hidden' }}
    >
      <Typography variant="h6" fontWeight="bold" gutterBottom color="primary.dark">
        Student Quiz Submissions
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {['Name', 'USN', 'Branch', 'Score', 'Email', 'Submitted At'].map(
                (head) => (
                  <TableCell key={head} sx={{ fontWeight: 'bold' }}>
                    {head}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              paginatedResults.map((r) => (
                <TableRow key={r._id} hover sx={{ '&:hover': { background: '#f9f9f9' } }}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.usn}</TableCell>
                  <TableCell>{r.branch}</TableCell>
                  <TableCell>{`${r.score} / ${r.totalQuestions}`}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{new Date(r.submittedAt).toLocaleString()}</TableCell>
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

// ------------------ Main Dashboard ------------------
export default function AdminDashboard() {
  const [currentTab, setCurrentTab] = useState(0);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // --- THIS LINE IS NOW CORRECTED ---
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/results`);
        setResults(res.data);
      } catch (err) {
        console.error('Error fetching results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f3f6f9', py: 5 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" fontWeight="700" gutterBottom color="primary.main">
          Admin Dashboard
        </Typography>

        <Paper
          elevation={2}
          sx={{
            borderRadius: 4,
            mb: 4,
            bgcolor: '#fff',
            p: 1,
          }}
        >
          <Tabs
            value={currentTab}
            onChange={(_, val) => setCurrentTab(val)}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Results" />
            <Tab label="Questions" />
            <Tab label="Analytics" />
            <Tab label="Settings" />
          </Tabs>
        </Paper>

        {currentTab === 0 && <ResultsTable results={results} loading={loading} />}
        {currentTab === 1 && <QuestionManager />}
        {currentTab === 2 && <AnalyticsCharts results={results} loading={loading} />}
        {currentTab === 3 && <QuizControls />}
      </Container>
    </Box>
  );
}