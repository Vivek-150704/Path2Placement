// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import QuizPage from './QuizPage';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

function App() {
  return (
    <Routes>
      {/* This is the main route for students */}
      <Route path="/" element={<QuizPage />} />

      {/* This is the route for the admin login page */}
      <Route path="/admin" element={<AdminLogin />} />

      {/* This is the route for the dashboard after a successful login */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;