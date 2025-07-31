import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { toast } from 'react-toastify';

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

const organizations = [
  'Accenture',
  'Adobe',
  'Airbnb',
  'Amazon',
  'Apple',
  'Capgemini',
  'Cisco',
  'Cognizant',
  'Deloitte',
  'Dell',
  'EY',
  'Facebook (Meta)',
  'Google',
  'HCL Technologies',
  'Hewlett Packard (HP)',
  'IBM',
  'Infosys',
  'Intel',
  'KPMG',
  'LTI Mindtree',
  'Microsoft',
  'Netflix',
  'Oracle',
  'PWC',
  'Salesforce',
  'Samsung',
  'SAP',
  'Tata Consultancy Services (TCS)',
  'Twitter',
  'Uber',
  'VMware',
  'Wipro',
  'ZOHO'
].sort();

const experiences = Array.from({ length: 11 }, (_, i) => (i === 10 ? '10+ years' : `${i} years`));

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    experience: '',
    organization: '',
    role: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    experience: '',
    organization: '',
    role: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [isCustomOrg, setIsCustomOrg] = useState(false);
  const [orgSearch, setOrgSearch] = useState('');
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);

  const filteredOrganizations = organizations.filter(org =>
    org.toLowerCase().includes(orgSearch.toLowerCase())
  );

  const validateForm = () => {
    const newErrors = {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      experience: '',
      organization: '',
      role: ''
    };

    if (form.fullName.length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters long';
    }

    if (!form.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!form.experience) {
      newErrors.experience = 'Please select your years of experience';
    }

    if (form.experience !== "0 years" && !form.organization) {
      newErrors.organization = 'Please select your organization';
    }

    if (form.experience !== "0 years" && !form.role) {
      newErrors.role = 'Please select your role';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (e.target.name in errors) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const res = await axios.post("http://localhost:9091/api/auth/register", form);
        if (res.data.success) {
          toast.success(res.data.message);
          navigate('/signin'); // Redirect to sign-in page on successful registration
        } else {
          toast.error(res.data.message);
        }
        console.log('Form submitted:', form);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
        console.error('Registration failed:', error);
      }
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
          <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold mb-4 xl:mb-6">Welcome to Asknalyze</h1>
          <p className="text-base xl:text-lg mb-6 xl:mb-8">Join our community of professionals and explore endless possibilities.</p>
          <div className="space-y-3 xl:space-y-4 text-left bg-white/10 p-4 xl:p-6 rounded-xl backdrop-blur-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 xl:w-6 xl:h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
              </svg>
              <span className="text-sm xl:text-base">Connect with experts</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 xl:w-6 xl:h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
              </svg>
              <span className="text-sm xl:text-base">Share knowledge</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 xl:w-6 xl:h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
              </svg>
              <span className="text-sm xl:text-base">Grow your network</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Registration Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-3 sm:p-6 lg:p-8 xl:p-12">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div>
            <div className="text-center">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-blue-600" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z" fill="currentColor"/>
                <path d="M20 32C26.6274 32 32 26.6274 32 20C32 13.3726 26.6274 8 20 8C13.3726 8 8 13.3726 8 20C8 26.6274 13.3726 32 20 32Z" fill="white"/>
              </svg>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Account</h2>
              <p className="mt-2 text-xs sm:text-sm text-gray-600">Start your journey with us</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 text-left">
            {/* Full Name */}
            <div className="space-y-1.5 sm:space-y-2 text-left">
              <label htmlFor="fullName" className="block text-xs sm:text-sm font-semibold text-gray-700 text-left">Full Name</label>
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
              {errors.fullName && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5 sm:space-y-2 text-left">
              <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700 text-left">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-all duration-200 text-gray-900"
                placeholder="Enter your email"
                required
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>

            {/* Experience */}
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="experience" className="block text-xs sm:text-sm font-semibold text-gray-700">Years of Experience</label>
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
              {errors.experience && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.experience}</p>}
            </div>

            {/* Organization */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="organization" className="block text-xs sm:text-sm font-semibold text-gray-700">Current Organization</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomOrg(!isCustomOrg);
                    setForm(prev => ({ ...prev, organization: '' }));
                    setOrgSearch('');
                    setShowOrgDropdown(false);
                  }}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
                >
                  {isCustomOrg ? 'Choose from list' : 'Add custom organization'}
                </button>
              </div>
              {!isCustomOrg ? (
                <div className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      value={orgSearch}
                      onChange={(e) => {
                        setOrgSearch(e.target.value);
                        setShowOrgDropdown(true);
                      }}
                      onFocus={() => setShowOrgDropdown(true)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-all duration-200 text-gray-900"
                      placeholder="Search organization"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  {showOrgDropdown && (
                    <>
                      <div className="fixed inset-0" onClick={() => setShowOrgDropdown(false)} />
                      <div className="absolute z-10 w-full mt-1">
                        <div className="w-full border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                          <div className="max-h-60 overflow-y-auto bg-white">
                            {filteredOrganizations.length > 0 ? (
                              filteredOrganizations.map((org) => (
                                <div
                                  key={org}
                                  onClick={() => {
                                    setForm(prev => ({ ...prev, organization: org }));
                                    setOrgSearch(org);
                                    setShowOrgDropdown(false);
                                  }}
                                  className={
                                    `px-3 sm:px-4 py-2 sm:py-3 text-sm bg-white hover:bg-gray-50 transition-all duration-200 text-gray-900 ${
                                      form.organization === org ? 'bg-blue-50' : ''
                                    }`
                                  }
                                >
                                  {org}
                                </div>
                              ))
                            ) : (
                              <div className="px-3 sm:px-4 py-2 sm:py-3 text-sm text-gray-500">No organizations found</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={form.organization}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-all duration-200 text-gray-900"
                  placeholder="Enter your organization name"
                />
              )}
              {errors.organization && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.organization}</p>}
            </div>

            {/* Role */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="role" className="block text-xs sm:text-sm font-semibold text-gray-700">Role</label>
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
                  >
                    <option value="">Select your role</option>
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
                  placeholder="Enter your role"
                  required
                />
              )}
              {errors.role && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.role}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-700">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-all duration-200 text-gray-900"
                  placeholder="Create a strong password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-2 sm:px-3 text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-semibold text-gray-700">Confirm Password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-all duration-200 text-gray-900"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-2 sm:px-3 text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 sm:py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 mt-2 sm:mt-4"
            >
              Create Account
            </button>

            {/* Sign in Link */}
            <p className="text-center text-gray-600 text-xs sm:text-sm">
              Already have an account?{' '}
              <Link to="/signin" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
