import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { toast } from 'react-toastify';

interface FormState {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [form, setForm] = useState<FormState>({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Timer effect for OTP resend
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendOTP = async () => {
    if (countdown === 0) {
      // Add your OTP resend API call here
      console.log('Resending OTP to:', form.email);
      setCountdown(30); // Start 30 second countdown
    }
  };

  const validateEmail = () => {
    const newErrors = { ...errors, email: '' };
    if (!form.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
      setErrors(newErrors);
      return false;
    }
    setErrors(newErrors);
    return true;
  };

  const validateOTP = () => {
    const newErrors = { ...errors, otp: '' };
    if (form.otp.length !== 6) {
      newErrors.otp = 'Please enter a valid 6-digit OTP';
      setErrors(newErrors);
      return false;
    }
    setErrors(newErrors);
    return true;
  };

  const validatePasswords = () => {
    const newErrors = { ...errors, newPassword: '', confirmPassword: '' };
    let isValid = true;

    if (form.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
      isValid = false;
    }

    if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // For OTP, only allow numbers and max 6 digits
    if (name === 'otp') {
      const otpValue = value.replace(/[^0-9]/g, '').slice(0, 6);
      setForm(prev => ({ ...prev, [name]: otpValue }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    // Clear error when user starts typing
    if (name in errors) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1 && validateEmail()) {
      console.log('Sending OTP to:', form.email);
      toast.warn("Sending OTP to your email...");

       try {
        const res = await axios.post('http://localhost:9091/api/auth/forgot-password/request', {
        email: form.email,
      });

    if (res.data.success) {
      setStep(2);
      setCountdown(30);
      toast.success(res.data.message); // Optional toast
    } else {
      toast.error(res.data.message);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Something went wrong");
  }
    } else if (step === 2 && validateOTP()) {
      
      console.log('Verifying OTP:', form.otp);

  try {
    const res = await axios.post('http://localhost:9091/api/auth/forgot-password/verify', {
      email: form.email,
      otp: form.otp,
    });

    if (res.data.success) {
      setStep(3);
      toast.success("OTP Verified");
    } else {
      toast.error("Invalid or expired OTP");
    }
  } catch (error) {
    toast.error("OTP verification failed");
  }

    } else if (step === 3 && validatePasswords()) {
      
      console.log('Resetting password:', form.newPassword);

  try {
    const res = await axios.post('http://localhost:9091/api/auth/forgot-password/reset', {
      email: form.email,
      newPassword: form.newPassword,
      confirmPassword: form.confirmPassword,
    });

    if (res.data.success) {
      toast.success("Password reset successful");
      navigate('/signin')
    } else {
      toast.error(res.data.message);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Password reset failed");
  }

    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Forgot Password</h2>
              <p className="mt-2 text-xs sm:text-sm text-gray-600">Enter your email to reset your password</p>
            </div>
            <div className="space-y-1.5 sm:space-y-2 text-left mt-6">
              <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700">Email Address</label>
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
              {errors.email && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Enter OTP</h2>
              <p className="mt-2 text-xs sm:text-sm text-gray-600">Enter the 6-digit code sent to your email</p>
            </div>
            <div className="space-y-1.5 sm:space-y-2 text-left mt-6">
              <label htmlFor="otp" className="block text-xs sm:text-sm font-semibold text-gray-700">OTP Code</label>
              <input
                id="otp"
                name="otp"
                type="text"
                value={form.otp}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-all duration-200 text-gray-900"
                placeholder="Enter 6-digit OTP"
                required
              />
              {errors.otp && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.otp}</p>}
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0}
                  className={`text-xs sm:text-sm ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'} font-semibold transition-colors duration-200`}
                >
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Reset Password</h2>
              <p className="mt-2 text-xs sm:text-sm text-gray-600">Create a new password for your account</p>
            </div>
            <div className="space-y-4 sm:space-y-6 text-left mt-6">
              <div className="space-y-1.5 sm:space-y-2">
                <label htmlFor="newPassword" className="block text-xs sm:text-sm font-semibold text-gray-700">New Password</label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={form.newPassword}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-all duration-200 text-gray-900"
                    placeholder="Create a new password"
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
                {errors.newPassword && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.newPassword}</p>}
              </div>

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
                    placeholder="Confirm your new password"
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
            </div>
          </>
        );
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
          <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold mb-4 xl:mb-6">Password Recovery</h1>
          <p className="text-base xl:text-lg mb-6 xl:mb-8">We'll help you get back into your account safely.</p>
          <div className="space-y-3 xl:space-y-4 text-left bg-white/10 p-4 xl:p-6 rounded-xl backdrop-blur-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 xl:w-6 xl:h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
              </svg>
              <span className="text-sm xl:text-base">Secure verification process</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 xl:w-6 xl:h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
              </svg>
              <span className="text-sm xl:text-base">Email verification</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 xl:w-6 xl:h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
              </svg>
              <span className="text-sm xl:text-base">Quick password reset</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-3 sm:p-6 lg:p-8 xl:p-12">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div>
            <div className="flex justify-center mb-6">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-blue-600" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z" fill="currentColor"/>
                <path d="M20 32C26.6274 32 32 26.6274 32 20C32 13.3726 26.6274 8 20 8C13.3726 8 8 13.3726 8 20C8 26.6274 13.3726 32 20 32Z" fill="white"/>
              </svg>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {renderStepContent()}

              <button
                type="submit"
                className="w-full py-2.5 sm:py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 mt-2 sm:mt-4"
              >
                {step === 1 ? "Send OTP" : step === 2 ? "Verify OTP" : "Reset Password"}
              </button>

              {/* Links */}
              <div className="text-center space-y-2">
                <p className="text-xs sm:text-sm text-gray-600">
                  Remember your password?{' '}
                  <Link to="/signin" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200">
                    Sign in
                  </Link>
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200">
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
