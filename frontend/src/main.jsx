import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App';
import Register from './pages/Register.tsx';
import SignIn from './pages/signin.tsx';
import ForgotPassword from './pages/forgot-password.tsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/app" element={<App />} />
        {/* Add more routes as needed */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
