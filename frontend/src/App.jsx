import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import pages
import SignIn from './pages/signin.tsx';
import Register from './pages/Register.tsx';
import ForgotPassword from './pages/forgot-password.tsx';
import Dashboard from './pages/Dashboard.tsx';
import UpdateProfile from './pages/UpdateProfile.tsx';
import AddInterview from './pages/AddInterview.tsx';
import InterviewReports from './pages/InterviewReports.tsx';
import ResumeAnalysis from './pages/ResumeAnalysis.tsx';

// Import components
import ProtectedRoute from './components/ProtectedRoute.tsx';

// Import utilities
import { setupAxiosInterceptors } from './utils/auth.js';

import './App.css'

function App() {
  useEffect(() => {
    // Setup axios interceptors for automatic token handling
    setupAxiosInterceptors();
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/update-profile" element={
            <ProtectedRoute>
              <UpdateProfile />
            </ProtectedRoute>
          } />
          
          <Route path="/add-interview" element={
            <ProtectedRoute>
              <AddInterview />
            </ProtectedRoute>
          } />
          
          <Route path="/interview-reports" element={
            <ProtectedRoute>
              <InterviewReports />
            </ProtectedRoute>
          } />
          
          <Route path="/resume-analysis" element={
            <ProtectedRoute>
              <ResumeAnalysis />
            </ProtectedRoute>
          } />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
        
        {/* Toast notifications */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;
