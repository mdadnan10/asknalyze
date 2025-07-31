import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getToken, getCurrentUser, logout } from '../utils/auth.js';

const roles = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Engineer',
  'DevOps Engineer',
  'UI/UX Designer',
  'Product Manager',
  'QA Engineer'
];

const experiences = Array.from({ length: 11 }, (_, i) => (i === 10 ? '10+ years' : `${i} years`));

interface FormState {
  fullName: string;
  role: string;
  organization: string;
  experience: string;
}

interface FormErrors {
  fullName: string;
  role: string;
  organization: string;
  experience: string;
}

interface User {
  id?: string;
  email?: string;
  fullName?: string;
  name?: string;
  role?: string;
  organization?: string;
  experience?: string;
}

const UpdateProfile: React.FC = () => {
  const navigate = useNavigate();
  
  const [form, setForm] = useState<FormState>({
    fullName: '',
    role: '',
    organization: '',
    experience: '',
  });

  const [errors, setErrors] = useState<FormErrors>({
    fullName: '',
    role: '',
    organization: '',
    experience: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isCustomRole, setIsCustomRole] = useState(false);

  // Load current user data on component mount
  useEffect(() => {
    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const userRole = currentUser.role || '';
        const isRoleInList = roles.includes(userRole);
        
        setForm({
          fullName: currentUser.fullName || currentUser.name || '',
          role: userRole,
          organization: currentUser.organization || '',
          experience: currentUser.experience || '',
        });
        
        // Set custom role state if user's role is not in predefined list
        setIsCustomRole(!isRoleInList && userRole !== '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      fullName: '',
      role: '',
      organization: '',
      experience: '',
    };

    // Full name validation
    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (form.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters long';
    }

    // Experience validation
    if (!form.experience.trim()) {
      newErrors.experience = 'Experience level is required';
    }

    // Role and Organization validation (only required if experience > 0)
    const isZeroExperience = form.experience === '0 years';
    
    if (!isZeroExperience && !form.role.trim()) {
      newErrors.role = 'Role is required';
    }

    if (!isZeroExperience && !form.organization.trim()) {
      newErrors.organization = 'Organization is required';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const token = getToken();
      
      // Debug: Check if token exists
      if (!token) {
        toast.error('No authentication token found. Please sign in again.');
        navigate('/signin');
        return;
      }
      
      console.log('Token exists:', !!token);
      console.log('Token length:', token.length);
      console.log('Token starts with:', token.substring(0, 20) + '...');
      
      const response = await axios.patch(
        'http://localhost:9091/api/auth/update-profile',
        {
          email : user?.email,
          fullName: form.fullName.trim(),
          role: form.role,
          organization: form.organization.trim(),
          experience: form.experience,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        toast.success('Profile updated successfully!');
        // Optionally refresh user data or redirect
        navigate('/dashboard');
      } else {
        toast.error(response.data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please sign in again.');
        navigate('/signin');
      } else if (error.response?.status === 403) {
        toast.error('Access forbidden. Please check your permissions or sign in again.');
        navigate('/signin');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Invalid data provided');
      } else {
        toast.error('Failed to update profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-r from-blue-900 to-indigo-800 items-center justify-center p-6 xl:p-12">
        <div className="max-w-md text-white text-center">
          <svg className="w-16 h-16 xl:w-20 xl:h-20 mx-auto mb-6 xl:mb-8" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z" fill="white"/>
            <path d="M20 32C26.6274 32 32 26.6274 32 20C32 13.3726 26.6274 8 20 8C13.3726 8 8 13.3726 8 20C8 26.6274 13.3726 32 20 32Z" fill="#3B82F6"/>
          </svg>
          <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold mb-4 xl:mb-6">Update Your Profile!</h1>
          <p className="text-base xl:text-lg mb-6 xl:mb-8">Keep your information current and make the most of Asknalyze.</p>
          <div className="space-y-3 xl:space-y-4 text-left bg-white/10 p-4 xl:p-6 rounded-xl backdrop-blur-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 xl:w-6 xl:h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
              </svg>
              <span className="text-sm xl:text-base">Keep profile up to date</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 xl:w-6 xl:h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
              </svg>
              <span className="text-sm xl:text-base">Better networking opportunities</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 xl:w-6 xl:h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
              </svg>
              <span className="text-sm xl:text-base">Enhanced profile visibility</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Update Profile Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="w-full px-4 sm:px-6 lg:px-8">
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

        <div className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8 xl:p-12">
          <div className="w-full max-w-md space-y-6 sm:space-y-8">
            <div>
              <div className="text-center">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-blue-600" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z" fill="currentColor"/>
                  <path d="M20 32C26.6274 32 32 26.6274 32 20C32 13.3726 26.6274 8 20 8C13.3726 8 8 13.3726 8 20C8 26.6274 13.3726 32 20 32Z" fill="white"/>
                </svg>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Update Profile</h2>
                <p className="mt-2 text-xs sm:text-sm text-gray-600">Keep your information current</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 text-left">
              {/* Email Display (Read-only) */}
              <div className="space-y-1.5 sm:space-y-2 text-left">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <div className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-lg border border-gray-300 bg-gray-100 text-gray-600">
                  {user?.email || 'No email available'}
                </div>
                <p className="text-xs text-gray-500">Email address cannot be changed</p>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5 sm:space-y-2 text-left">
                <label htmlFor="fullName" className="block text-xs sm:text-sm font-semibold text-gray-700">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-all duration-200 text-gray-900"
                  placeholder="Enter your full name"
                  required
                />
                {errors.fullName && (
                  <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="role" className="block text-xs sm:text-sm font-semibold text-gray-700">
                    Role {form.experience !== '0 years' && '*'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomRole(!isCustomRole);
                      setForm(prev => ({ ...prev, role: '' }));
                    }}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
                  >
                    {isCustomRole ? 'Choose from list' : 'Add custom role'}
                  </button>
                </div>
                {!isCustomRole ? (
                  <div className="relative">
                    <select
                      id="role"
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-all duration-200 text-gray-900 appearance-none"
                      required={form.experience !== '0 years'}
                    >
                      <option value="">
                        {form.experience === '0 years' ? 'Select your role (optional)' : 'Select your role'}
                      </option>
                      {roles.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-all duration-200 text-gray-900"
                    placeholder={form.experience === '0 years' ? 'Enter your role (optional)' : 'Enter your role'}
                    required={form.experience !== '0 years'}
                  />
                )}
                {errors.role && (
                  <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.role}</p>
                )}
              </div>

              {/* Organization */}
              <div className="space-y-1.5 sm:space-y-2">
                <label htmlFor="organization" className="block text-xs sm:text-sm font-semibold text-gray-700">
                  Organization {form.experience !== '0 years' && '*'}
                </label>
                <input
                  id="organization"
                  name="organization"
                  type="text"
                  value={form.organization}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-all duration-200 text-gray-900"
                  placeholder={form.experience === '0 years' ? 'Enter your organization or company (optional)' : 'Enter your organization or company'}
                  required={form.experience !== '0 years'}
                />
                {errors.organization && (
                  <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.organization}</p>
                )}
              </div>

              {/* Experience */}
              <div className="space-y-1.5 sm:space-y-2">
                <label htmlFor="experience" className="block text-xs sm:text-sm font-semibold text-gray-700">Years of Experience *</label>
                <div className="relative">
                  <select
                    id="experience"
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-all duration-200 text-gray-900 appearance-none"
                    required
                  >
                    <option value="">Select your experience</option>
                    {experiences.map((exp, idx) => (
                      <option key={idx} value={exp}>{exp}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {errors.experience && (
                  <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.experience}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 sm:gap-4 pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-2.5 sm:py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-semibold rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 sm:py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
