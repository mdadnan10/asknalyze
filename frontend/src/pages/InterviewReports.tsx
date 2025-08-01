import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../utils/auth.js';
import { toast } from 'react-toastify';

interface User {
  id?: string;
  email?: string;
  fullName?: string;
  name?: string;
  role?: string;
  organization?: string;
  experience?: string;
}

interface Interview {
  id: string;
  title: string;
  candidateName: string;
  candidateEmail: string;
  position: string;
  interviewDate: string;
  interviewTime: string;
  duration: string;
  interviewType: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  score?: number;
  feedback?: string;
}

const InterviewReports: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockInterviews: Interview[] = [
      {
        id: '1',
        title: 'Frontend Developer Interview - John Doe',
        candidateName: 'John Doe',
        candidateEmail: 'john.doe@email.com',
        position: 'Senior Frontend Developer',
        interviewDate: '2025-08-05',
        interviewTime: '10:00',
        duration: '60',
        interviewType: 'Technical',
        status: 'Completed',
        score: 85,
        feedback: 'Strong technical skills, good problem-solving approach.'
      },
      {
        id: '2',
        title: 'Backend Developer Interview - Jane Smith',
        candidateName: 'Jane Smith',
        candidateEmail: 'jane.smith@email.com',
        position: 'Backend Developer',
        interviewDate: '2025-08-06',
        interviewTime: '14:00',
        duration: '45',
        interviewType: 'System Design',
        status: 'Scheduled'
      },
      {
        id: '3',
        title: 'Full Stack Developer Interview - Mike Johnson',
        candidateName: 'Mike Johnson',
        candidateEmail: 'mike.johnson@email.com',
        position: 'Full Stack Developer',
        interviewDate: '2025-08-04',
        interviewTime: '11:30',
        duration: '90',
        interviewType: 'Technical',
        status: 'In Progress',
        score: 75
      }
    ];

    // Simulate API loading
    setTimeout(() => {
      setInterviews(mockInterviews);
      setLoading(false);
    }, 1000);
  }, []);

  const handleLogout = () => {
    try {
      logout();
      toast.success('Logged out successfully');
      navigate('/signin');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Error during logout');
      navigate('/signin');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredInterviews = interviews.filter(interview => {
    const matchesStatus = filterStatus === 'All' || interview.status === filterStatus;
    const matchesSearch = interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interview reports...</p>
        </div>
      </div>
    );
  }

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
                {user?.fullName || user?.name || user?.email || 'User'}
              </span>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Dashboard
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
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Interview Reports</h2>
                <p className="text-gray-600">Manage and view all interview sessions.</p>
              </div>
              <button
                onClick={() => navigate('/add-interview')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Schedule New Interview
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by candidate name, position, or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All Status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Interview Cards */}
            <div className="space-y-4">
              {filteredInterviews.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">No interviews found matching your criteria.</p>
                </div>
              ) : (
                filteredInterviews.map((interview) => (
                  <div key={interview.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{interview.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(interview.status)}`}>
                            {interview.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <p><strong>Candidate:</strong> {interview.candidateName}</p>
                            <p><strong>Email:</strong> {interview.candidateEmail}</p>
                          </div>
                          <div>
                            <p><strong>Position:</strong> {interview.position}</p>
                            <p><strong>Type:</strong> {interview.interviewType}</p>
                          </div>
                          <div>
                            <p><strong>Date:</strong> {new Date(interview.interviewDate).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> {interview.interviewTime}</p>
                          </div>
                          <div>
                            <p><strong>Duration:</strong> {interview.duration} minutes</p>
                            {interview.score && (
                              <p>
                                <strong>Score:</strong> 
                                <span className={`ml-1 font-semibold ${getScoreColor(interview.score)}`}>
                                  {interview.score}/100
                                </span>
                              </p>
                            )}
                          </div>
                        </div>

                        {interview.feedback && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Feedback:</strong> {interview.feedback}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View Details
                        </button>
                        {interview.status === 'Scheduled' && (
                          <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                            Start Interview
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Summary Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {interviews.filter(i => i.status === 'Scheduled').length}
                </div>
                <div className="text-sm text-blue-700">Scheduled</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">
                  {interviews.filter(i => i.status === 'In Progress').length}
                </div>
                <div className="text-sm text-yellow-700">In Progress</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {interviews.filter(i => i.status === 'Completed').length}
                </div>
                <div className="text-sm text-green-700">Completed</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">
                  {interviews.length}
                </div>
                <div className="text-sm text-purple-700">Total Interviews</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewReports;
