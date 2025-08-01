import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../utils/auth.js';
import { toast } from 'react-toastify';

// Define user type
interface User {
  id?: string;
  email?: string;
  fullName?: string;
  name?: string;
  role?: string;
  organization?: string;
  experience?: string;
  exp?: number;
  iat?: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Safely get user data with error handling
  let user: User | null = null;
  try {
    user = getCurrentUser(); // This will extract user info from JWT token
  } catch (error) {
    console.error('Error getting user data in Dashboard:', error);
    // Optionally redirect to signin if user data is corrupted
    // navigate('/signin');
  }

  const handleLogout = () => {
    try {
      logout();
      toast.success('Logged out successfully');
      navigate('/signin');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Error during logout');
      navigate('/signin'); // Navigate anyway
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <svg className="w-8 h-8 text-blue-600 mr-3" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z" fill="currentColor"/>
                <path d="M20 32C26.6274 32 32 26.6274 32 20C32 13.3726 26.6274 8 20 8C13.3726 8 8 13.3726 8 20C8 26.6274 13.3726 32 20 32Z" fill="white"/>
              </svg>
              <h1 className="text-xl font-bold text-gray-900">Asknalyze</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.fullName || user?.name || user?.email || 'User'}!
              </span>
              <button
                onClick={() => navigate('/update-profile')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Update Profile
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
            <p className="text-gray-600 mb-6">
              Welcome to your Asknalyze dashboard! You have successfully signed in.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div 
                className="bg-blue-50 p-6 rounded-lg border border-blue-200 cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-blue-100"
                onClick={() => navigate('/add-interview')}
              >
                <div className="flex items-center">
                  <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Add Interview</h3>
                    <p className="text-blue-700 text-sm">Schedule new interview sessions</p>
                  </div>
                </div>
              </div>

              <div 
                className="bg-green-50 p-6 rounded-lg border border-green-200 cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-green-100"
                onClick={() => navigate('/interview-reports')}
              >
                <div className="flex items-center">
                  <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">Interview Reports</h3>
                    <p className="text-green-700 text-sm">View and manage interviews</p>
                  </div>
                </div>
              </div>

              <div 
                className="bg-purple-50 p-6 rounded-lg border border-purple-200 cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-purple-100"
                onClick={() => navigate('/resume-analysis')}
              >
                <div className="flex items-center">
                  <svg className="w-8 h-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900">Resume Analysis</h3>
                    <p className="text-purple-700 text-sm">AI-powered resume insights</p>
                  </div>
                </div>
              </div>
            </div>

            {user && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">User Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <p><strong>Full Name:</strong> {user.fullName || 'Not provided'}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {user.role || 'Not specified'}</p>
                  </div>
                  <div>
                    <p><strong>Organization:</strong> {user.organization || 'Not provided'}</p>
                    <p><strong>Experience:</strong> {user.experience || 'Not specified'}</p>
                    {user.id && <p><strong>User ID:</strong> {user.id}</p>}
                  </div>
                </div>
                
                {/* Token Information */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-md font-semibold text-gray-800 mb-2">Session Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                    {user.iat && (
                      <p><strong>Issued At:</strong> {new Date(user.iat * 1000).toLocaleString()}</p>
                    )}
                    {user.exp && (
                      <p><strong>Expires At:</strong> {new Date(user.exp * 1000).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
