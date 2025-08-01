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

interface Question {
  id: string;
  question: string;
  canAnswer: 'yes' | 'no' | 'partially' | '';
  answer: string;
  isAnalyzed: boolean;
  analysis: string;
  correctAnswer: string;
}

interface InterviewPracticeForm {
  companyName: string;
  yearsOfExperience: string;
  role: string;
  jobDescription: string;
  questions: Question[];
}

interface FormErrors {
  companyName?: string;
  yearsOfExperience?: string;
  role?: string;
  questions?: { [key: string]: { question?: string; canAnswer?: string } };
}

const AddInterview: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  
  // Auto-save keys for localStorage
  const FORM_STORAGE_KEY = 'asknalyze_interview_form';
  const COLLAPSED_STORAGE_KEY = 'asknalyze_collapsed_questions';

  // Load saved form data or use defaults
  const loadSavedForm = (): InterviewPracticeForm => {
    try {
      const savedForm = localStorage.getItem(FORM_STORAGE_KEY);
      if (savedForm) {
        const parsedForm = JSON.parse(savedForm);
        // Merge with user data and ensure structure integrity
        return {
          companyName: parsedForm.companyName || '',
          yearsOfExperience: parsedForm.yearsOfExperience || user?.experience || '',
          role: parsedForm.role || user?.role || '',
          jobDescription: parsedForm.jobDescription || '',
          questions: parsedForm.questions && parsedForm.questions.length > 0 
            ? parsedForm.questions 
            : [{
                id: '1',
                question: '',
                canAnswer: '',
                answer: '',
                isAnalyzed: false,
                analysis: '',
                correctAnswer: ''
              }]
        };
      }
    } catch (error) {
      console.error('Error loading saved form data:', error);
    }
    
    // Return default form if no saved data or error
    return {
      companyName: '',
      yearsOfExperience: user?.experience || '',
      role: user?.role || '',
      jobDescription: '',
      questions: [{
        id: '1',
        question: '',
        canAnswer: '',
        answer: '',
        isAnalyzed: false,
        analysis: '',
        correctAnswer: ''
      }]
    };
  };

  // Load saved collapsed questions
  const loadSavedCollapsedQuestions = (): Set<string> => {
    try {
      const savedCollapsed = localStorage.getItem(COLLAPSED_STORAGE_KEY);
      if (savedCollapsed) {
        const parsedCollapsed = JSON.parse(savedCollapsed);
        return new Set(parsedCollapsed);
      }
    } catch (error) {
      console.error('Error loading saved collapsed questions:', error);
    }
    return new Set();
  };

  const [form, setForm] = useState<InterviewPracticeForm>(loadSavedForm());
  const [isLoadingJD, setIsLoadingJD] = useState(false);
  const [isAnalyzingAnswer, setIsAnalyzingAnswer] = useState<string | null>(null);
  const [isGeneratingCorrectAnswer, setIsGeneratingCorrectAnswer] = useState<string | null>(null);
  const [isAnalyzingInterview, setIsAnalyzingInterview] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [collapsedQuestions, setCollapsedQuestions] = useState<Set<string>>(loadSavedCollapsedQuestions());

  // Auto-save effect for form data
  useEffect(() => {
    try {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(form));
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  }, [form, FORM_STORAGE_KEY]);

  // Auto-save effect for collapsed questions
  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_STORAGE_KEY, JSON.stringify(Array.from(collapsedQuestions)));
    } catch (error) {
      console.error('Error saving collapsed questions:', error);
    }
  }, [collapsedQuestions, COLLAPSED_STORAGE_KEY]);

  // Show notification when saved data is loaded
  useEffect(() => {
    const savedForm = localStorage.getItem(FORM_STORAGE_KEY);
    if (savedForm) {
      try {
        const parsedForm = JSON.parse(savedForm);
        // Check if there's meaningful saved data
        if (parsedForm.jobDescription || 
            parsedForm.questions?.some((q: Question) => q.question || q.answer)) {
          toast.info('Previous session data restored successfully', {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } catch (error) {
        console.error('Error checking saved data:', error);
      }
    }
  }, []); // Only run on mount

  // Clear saved data function
  const clearSavedData = () => {
    try {
      localStorage.removeItem(FORM_STORAGE_KEY);
      localStorage.removeItem(COLLAPSED_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing saved data:', error);
    }
  };

  const handleInputChange = (field: keyof InterviewPracticeForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleQuestionChange = (questionId: string, field: keyof Question, value: string) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
    
    // Clear question errors when user starts typing
    if (errors.questions?.[questionId]?.[field as 'question' | 'canAnswer']) {
      setErrors(prev => ({
        ...prev,
        questions: {
          ...prev.questions,
          [questionId]: {
            ...prev.questions?.[questionId],
            [field]: undefined
          }
        }
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate basic info
    if (!form.companyName.trim()) {
      newErrors.companyName = 'Company interviewed for is required';
    }
    if (!form.yearsOfExperience.trim()) {
      newErrors.yearsOfExperience = 'Years of experience is required';
    }
    if (!form.role.trim()) {
      newErrors.role = 'Role is required';
    }

    // Validate questions
    const questionErrors: { [key: string]: { question?: string; canAnswer?: string } } = {};
    form.questions.forEach(question => {
      const qErrors: { question?: string; canAnswer?: string } = {};
      
      if (!question.question.trim()) {
        qErrors.question = 'Question is required';
      }
      if (!question.canAnswer) {
        qErrors.canAnswer = 'Please select if you can answer this question';
      }
      
      if (qErrors.question || qErrors.canAnswer) {
        questionErrors[question.id] = qErrors;
      }
    });

    if (Object.keys(questionErrors).length > 0) {
      newErrors.questions = questionErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateJobDescription = async () => {
    if (form.jobDescription.trim()) return;
    
    setIsLoadingJD(true);
    try {
      // TODO: Implement API call to generate JD
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedJD = `We are looking for a skilled ${form.role} with ${form.yearsOfExperience} years of experience to join our team at ${form.companyName}. 

Key Responsibilities:
- Develop and maintain high-quality software solutions
- Collaborate with cross-functional teams
- Participate in code reviews and technical discussions
- Contribute to system architecture and design decisions

Requirements:
- ${form.yearsOfExperience}+ years of experience in ${form.role}
- Strong problem-solving skills
- Experience with modern development practices
- Excellent communication skills`;

      setForm(prev => ({ ...prev, jobDescription: generatedJD }));
      toast.success('Job description generated successfully!');
    } catch (error) {
      console.error('Error generating JD:', error);
      toast.error('Failed to generate job description');
    } finally {
      setIsLoadingJD(false);
    }
  };

  const generateCorrectAnswer = async (questionId: string) => {
    const question = form.questions.find(q => q.id === questionId);
    if (!question || !question.question.trim()) return;

    setIsGeneratingCorrectAnswer(questionId);
    try {
      // TODO: Implement API call to generate correct answer
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const correctAnswer = `A comprehensive answer should include: specific examples from your experience, technical implementation details, best practices you follow, challenges you've faced and how you overcame them, and lessons learned that demonstrate growth and expertise in this area.`;

      handleQuestionChange(questionId, 'correctAnswer', correctAnswer);
      
      toast.success('Correct answer generated successfully!');
    } catch (error) {
      console.error('Error generating correct answer:', error);
      toast.error('Failed to generate correct answer');
    } finally {
      setIsGeneratingCorrectAnswer(null);
    }
  };

  const analyzeAnswer = async (questionId: string) => {
    const question = form.questions.find(q => q.id === questionId);
    if (!question || !question.answer.trim()) return;

    setIsAnalyzingAnswer(questionId);
    try {
      // TODO: Implement API call to analyze answer
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const analysis = `Your answer demonstrates good understanding of the topic. Consider elaborating on specific examples and technical details to strengthen your response.`;
      const correctAnswer = `A comprehensive answer should include: specific examples, technical implementation details, best practices, and lessons learned from experience.`;

      handleQuestionChange(questionId, 'isAnalyzed', 'true');
      handleQuestionChange(questionId, 'analysis', analysis);
      handleQuestionChange(questionId, 'correctAnswer', correctAnswer);
      
      toast.success('Answer analyzed successfully!');
    } catch (error) {
      console.error('Error analyzing answer:', error);
      toast.error('Failed to analyze answer');
    } finally {
      setIsAnalyzingAnswer(null);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: '',
      canAnswer: '',
      answer: '',
      isAnalyzed: false,
      analysis: '',
      correctAnswer: ''
    };
    
    // Collapse all existing questions when adding a new one
    setCollapsedQuestions(prev => {
      const newSet = new Set(prev);
      form.questions.forEach(question => {
        newSet.add(question.id);
      });
      return newSet;
    });
    
    setForm(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const canAddNewQuestion = (): boolean => {
    // Check if all existing questions have mandatory fields filled
    return form.questions.every(question => 
      question.question.trim() !== '' && question.canAnswer !== ''
    );
  };

  const toggleQuestionCollapse = (questionId: string) => {
    setCollapsedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const removeQuestion = (questionId: string) => {
    if (form.questions.length === 1) return;
    
    setForm(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const analyzeInterview = async () => {
    // Validate form before analyzing
    if (!validateForm()) {
      toast.error('Please fill in all required fields before analyzing');
      return;
    }

    setIsAnalyzingInterview(true);
    try {
      // TODO: Implement API call to save and analyze entire interview
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear saved data on successful analysis
      clearSavedData();
      
      toast.success('Interview analysis completed! Check your reports.');
      // Navigate to interview reports or show results
      navigate('/interview-reports');
    } catch (error) {
      console.error('Error analyzing interview:', error);
      toast.error('Failed to analyze interview');
    } finally {
      setIsAnalyzingInterview(false);
    }
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
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 2000px;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 1;
            max-height: 2000px;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
        }
      `}</style>
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
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-white/20 rounded-lg p-3 mr-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">Interview Practice</h2>
                  <p className="text-blue-100">Practice and analyze your interview performance with AI-powered insights.</p>
                </div>
              </div>
              
              {/* Auto-save indicator and controls */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-white/10 rounded-lg px-3 py-2">
                  <svg className="w-4 h-4 text-green-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-white">Auto-saving</span>
                </div>
                {localStorage.getItem(FORM_STORAGE_KEY) && (
                  <button
                    onClick={() => {
                      clearSavedData();
                      setForm({
                        companyName: '',
                        yearsOfExperience: user?.experience || '',
                        role: user?.role || '',
                        jobDescription: '',
                        questions: [{
                          id: '1',
                          question: '',
                          canAnswer: '',
                          answer: '',
                          isAnalyzed: false,
                          analysis: '',
                          correctAnswer: ''
                        }]
                      });
                      setCollapsedQuestions(new Set());
                      toast.success('Form data cleared successfully');
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
                    title="Clear all saved data and start fresh"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Clear Data</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="bg-white/10 rounded-lg p-4 mt-6">
              <div className="flex items-center justify-between text-sm">
                <span>Complete your profile and start practicing • Data is automatically saved</span>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                  <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* User Information Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-lg p-2 mr-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Your Information</h3>
                  <p className="text-sm text-gray-600">Tell us about your professional background</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label htmlFor="companyName" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Company Interviewed For *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    value={form.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className={`w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-2 ${
                      errors.companyName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                    } rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 hover:border-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-blue-100 text-gray-900 placeholder-gray-500`}
                    placeholder="Enter the company you're interviewing for"
                    required
                  />
                  {errors.companyName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.companyName}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="yearsOfExperience" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Years of Experience *
                  </label>
                  <input
                    type="text"
                    id="yearsOfExperience"
                    value={form.yearsOfExperience}
                    onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                    className={`w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-green-50 border-2 ${
                      errors.yearsOfExperience ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                    } rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 hover:border-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-green-100 text-gray-900 placeholder-gray-500`}
                    placeholder="e.g., 3"
                    required
                  />
                  {errors.yearsOfExperience && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.yearsOfExperience}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="role" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                    Role *
                  </label>
                  <input
                    type="text"
                    id="role"
                    value={form.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className={`w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-purple-50 border-2 ${
                      errors.role ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                    } rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 hover:border-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-purple-100 text-gray-900 placeholder-gray-500`}
                    placeholder="e.g., Senior Frontend Developer"
                    required
                  />
                  {errors.role && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.role}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Job Description Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-lg p-2 mr-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Job Description</h3>
                    <p className="text-sm text-gray-600">Define the role you're preparing for</p>
                  </div>
                </div>
                
                {!form.jobDescription.trim() && (
                  <button
                    type="button"
                    onClick={generateJobDescription}
                    disabled={isLoadingJD || !form.role || !form.companyName}
                    className="whitespace-nowrap bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-purple-400 disabled:to-indigo-400 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                  >
                    {isLoadingJD ? (
                      <>
                        <svg className="animate-spin h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="whitespace-nowrap">Generating...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="whitespace-nowrap">Generate JD using AI</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-8">
              <textarea
                value={form.jobDescription}
                onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                rows={8}
                className="w-full px-4 py-3 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200 hover:border-gray-300 hover:bg-gradient-to-br hover:from-purple-100 hover:via-indigo-100 hover:to-blue-100 resize-none text-gray-900 placeholder-gray-500"
                placeholder="Enter job description or generate one using AI..."
              />
            </div>
          </div>

          {/* Questions Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-lg p-2 mr-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Interview Questions</h3>
                  <p className="text-sm text-gray-600">Practice with realistic interview questions</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {form.questions.map((question, index) => {
                const isCollapsed = collapsedQuestions.has(question.id);
                return (
                <div key={question.id} className="border-2 border-gray-100 rounded-xl hover:border-gray-200 transition-all duration-200 bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex justify-between items-start p-6 pb-4">
                    <div className="flex items-center flex-1">
                      <div className="bg-blue-100 rounded-lg p-2 mr-3">
                        <span className="text-blue-600 font-bold">Q{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-800">Question {index + 1}</h4>
                        {isCollapsed && question.question && (
                          <p className="text-sm text-gray-600 mt-1 truncate">{question.question}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => toggleQuestionCollapse(question.id)}
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
                        title={isCollapsed ? 'Expand question' : 'Collapse question'}
                      >
                        <svg 
                          className={`w-5 h-5 transform transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {form.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(question.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                          title="Delete question"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {!isCollapsed && (
                    <div className="px-6 pb-6 space-y-6"
                         style={{
                           animation: isCollapsed ? 'slideUp 0.3s ease-out' : 'slideDown 0.3s ease-out'
                         }}>
                      {/* Question Input */}
                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                          <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                          </svg>
                          Question *
                        </label>
                        <textarea
                          value={question.question}
                          onChange={(e) => handleQuestionChange(question.id, 'question', e.target.value)}
                          rows={3}
                          className={`w-full px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 ${
                            errors.questions?.[question.id]?.question ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                          } rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 hover:border-gray-300 hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 resize-none text-gray-900 placeholder-gray-500`}
                          placeholder="Enter interview question..."
                          required
                        />
                        {errors.questions?.[question.id]?.question && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.questions[question.id].question}
                          </p>
                        )}
                      </div>

                      {/* Can Answer Radio Buttons */}
                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-4">
                          <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Able to answer? *
                        </label>
                        <div className="flex space-x-6">
                          <label className="flex items-center cursor-pointer group">
                            <input
                              type="radio"
                              value="yes"
                              checked={question.canAnswer === 'yes'}
                              onChange={(e) => handleQuestionChange(question.id, 'canAnswer', e.target.value)}
                              className="sr-only"
                              required
                            />
                            <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                              question.canAnswer === 'yes' ? 'border-green-500 bg-green-500' : 'border-gray-300 group-hover:border-green-400'
                            }`}>
                              {question.canAnswer === 'yes' && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className="text-green-700 font-semibold">Yes</span>
                          </label>
                          
                          <label className="flex items-center cursor-pointer group">
                            <input
                              type="radio"
                              value="partially"
                              checked={question.canAnswer === 'partially'}
                              onChange={(e) => handleQuestionChange(question.id, 'canAnswer', e.target.value)}
                              className="sr-only"
                              required
                            />
                            <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                              question.canAnswer === 'partially' ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300 group-hover:border-yellow-400'
                            }`}>
                              {question.canAnswer === 'partially' && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className="text-yellow-700 font-semibold">Partially</span>
                          </label>
                          
                          <label className="flex items-center cursor-pointer group">
                            <input
                              type="radio"
                              value="no"
                              checked={question.canAnswer === 'no'}
                              onChange={(e) => handleQuestionChange(question.id, 'canAnswer', e.target.value)}
                              className="sr-only"
                              required
                            />
                            <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                              question.canAnswer === 'no' ? 'border-red-500 bg-red-500' : 'border-gray-300 group-hover:border-red-400'
                            }`}>
                              {question.canAnswer === 'no' && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className="text-red-700 font-semibold">No</span>
                          </label>
                        </div>
                        {errors.questions?.[question.id]?.canAnswer && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.questions[question.id].canAnswer}
                          </p>
                        )}
                      </div>

                      {/* Answer Section */}
                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                          <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Your Answer
                        </label>
                        <textarea
                          value={question.answer}
                          onChange={(e) => handleQuestionChange(question.id, 'answer', e.target.value)}
                          rows={5}
                          className="w-full px-4 py-3 bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 hover:border-gray-300 hover:bg-gradient-to-br hover:from-blue-100 hover:via-cyan-100 hover:to-indigo-100 resize-none text-gray-900 placeholder-gray-500"
                          placeholder="Write your answer here..."
                        />
                        
                        {/* Conditional Button Logic */}
                        {question.question.trim() && !question.isAnalyzed && (
                          <div className="mt-4">
                            {!question.answer.trim() ? (
                              // Show "Generate Correct Answer" when only question exists
                              <button
                                type="button"
                                onClick={() => generateCorrectAnswer(question.id)}
                                disabled={isGeneratingCorrectAnswer === question.id}
                                className="w-64 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-green-400 disabled:to-emerald-400 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                              >
                                {isGeneratingCorrectAnswer === question.id ? (
                                  <>
                                    <svg className="animate-spin h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Generating...</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span>Generate Correct Answer</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              // Show "Analyze My Answer" when both question and answer exist
                              <button
                                type="button"
                                onClick={() => analyzeAnswer(question.id)}
                                disabled={isAnalyzingAnswer === question.id}
                                className="w-64 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-blue-400 disabled:to-cyan-400 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                              >
                                {isAnalyzingAnswer === question.id ? (
                                  <>
                                    <svg className="animate-spin h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Analyzing...</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Analyze My Answer</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Analysis Results */}
                      {(question.isAnalyzed || question.correctAnswer) && (
                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300 w-full max-w-full overflow-hidden">
                          {question.isAnalyzed && (
                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 transform transition-all duration-300 ease-in-out w-full">
                              <div className="flex items-start w-full">
                                <div className="bg-blue-100 rounded-lg p-2 mr-3 flex-shrink-0">
                                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0 overflow-hidden">
                                  <h5 className="font-bold text-blue-900 mb-2">AI Analysis</h5>
                                  <p className="text-blue-800 leading-relaxed break-words overflow-wrap-anywhere">{question.analysis}</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {question.correctAnswer && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 transform transition-all duration-300 ease-in-out w-full">
                              <div className="flex items-start w-full">
                                <div className="bg-green-100 rounded-lg p-2 mr-3 flex-shrink-0">
                                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0 overflow-hidden">
                                  <h5 className="font-bold text-green-900 mb-2">Ideal Answer</h5>
                                  <p className="text-green-800 leading-relaxed break-words overflow-wrap-anywhere">{question.correctAnswer}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
              })}
            </div>
            
            {/* Add Question Button */}
            <div className="px-8 pb-8">
              <button
                type="button"
                onClick={addQuestion}
                disabled={!canAddNewQuestion()}
                className={`w-full ${
                  canAddNewQuestion() 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:-translate-y-0.5' 
                    : 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                } text-white px-6 py-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg`}
                title={!canAddNewQuestion() ? 'Please complete all mandatory fields in existing questions before adding a new one' : ''}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Another Question</span>
              </button>
              {!canAddNewQuestion() && (
                <p className="mt-2 text-sm text-amber-600 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Complete all mandatory fields in existing questions to add a new one
                </p>
              )}
            </div>
          </div>

          {/* Final Action */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-indigo-100 rounded-lg p-2 mr-3">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Ready to Analyze?</h3>
                  <p className="text-sm text-gray-600">Complete your interview practice session</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="flex gap-6">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 border-2 border-gray-200 hover:border-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={analyzeInterview}
                  disabled={isAnalyzingInterview}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:from-indigo-400 disabled:to-blue-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 transform hover:-translate-y-0.5"
                >
                  {isAnalyzingInterview ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Analyzing Interview...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Analyze My Interview</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddInterview;
