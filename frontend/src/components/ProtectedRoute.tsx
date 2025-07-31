import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth.js';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  if (!isAuthenticated()) {
    // Redirect to signin page with the attempted location
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  
  return children;
};

export default ProtectedRoute;
