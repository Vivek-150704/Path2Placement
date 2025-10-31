// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import QuizPage from './QuizPage';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard'; // Import the new component

function App() {
  return (
    <Routes>
      <Route path="/" element={<QuizPage />} />
      <Route path="/admin" element={<AdminLogin />} />
      {/* Update this route to show the actual dashboard */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;