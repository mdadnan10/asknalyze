import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth.js';
import { toast } from 'react-toastify';
import Header from '../components/Header';

// Define types
interface User {
  id?: string;
  email?: string;
  fullName?: string;
  name?: string;
  role?: string;
  organization?: string;
  experience?: string;
}

interface AnalysisResult {
  skills: string[];
  experience: string[];
  education: string[];
  strengths: string[];
  suggestions: string[];
  jobFit: number; // 0-100 percentage
  summary: string;
}

const ResumeAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State management
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [showJdSection, setShowJdSection] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [uploadType, setUploadType] = useState<'pdf' | 'word' | 'image'>('pdf');
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    
    if (!selectedFile) {
      return;
    }
    
    // Validate file type
    const fileType = selectedFile.type;
    if (uploadType === 'pdf' && fileType !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }
    
    if (uploadType === 'word' && 
        !(fileType === 'application/msword' || 
          fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      toast.error('Please upload a Word document (.doc or .docx)');
      return;
    }
    
    if (uploadType === 'image' && !fileType.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, etc.)');
      return;
    }
    
    // Update state with selected file
    setFile(selectedFile);
    setFileName(selectedFile.name);
    
    // Create preview for images
    if (uploadType === 'image' && fileType.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
    
    // Reset analysis
    setAnalysisResult(null);
  };
  
  // Handle file upload button click
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  // Handle file removal
  const handleRemoveFile = () => {
    setFile(null);
    setFileName('');
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setAnalysisResult(null);
  };
  
  // Toggle Job Description section
  const toggleJdSection = () => {
    setShowJdSection(!showJdSection);
    if (!showJdSection) {
      // Focus on textarea when showing
      setTimeout(() => {
        const textarea = document.getElementById('jobDescription');
        textarea?.focus();
      }, 100);
    }
  };
  
  // Handle resume analysis
  const analyzeResume = async () => {
    if (!file) {
      toast.error('Please upload a resume file first');
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // This is where you would implement your API call
      // For now, we'll simulate a response after a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock analysis result
      const mockResult: AnalysisResult = {
        skills: ['JavaScript', 'React', 'TypeScript', 'Node.js', 'API Development'],
        experience: ['3 years as Frontend Developer', '2 years as Full Stack Engineer'],
        education: ['Bachelor of Science in Computer Science'],
        strengths: ['Strong frontend development skills', 'Experience with modern JavaScript frameworks'],
        suggestions: ['Add more quantifiable achievements', 'Include specific project outcomes'],
        jobFit: 85,
        summary: 'Strong candidate with relevant technical skills and experience. Resume shows good alignment with typical software development roles. Consider adding more specifics about project impacts and quantifiable achievements to strengthen the application.'
      };
      
      setAnalysisResult(mockResult);
      toast.success('Resume analyzed successfully!');
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast.error('Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        /* Consistent width styling */
        .page-container {
          width: 100%;
          max-width: 100vw;
          overflow-x: hidden;
        }
        
        .content-container {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        
        .max-w-7xl {
          width: 100%;
          max-width: 80rem;
          margin: 0 auto;
          box-sizing: border-box;
        }
        
        /* Fixed sections */
        .fixed-width-section {
          width: 100%;
          position: relative;
          box-sizing: border-box;
        }
        
        /* File upload area */
        .file-drop-area {
          border: 2px dashed #cbd5e1;
          border-radius: 0.75rem;
          transition: all 0.3s ease;
        }
        
        .file-drop-area:hover {
          border-color: #94a3b8;
          background-color: rgba(241, 245, 249, 0.5);
        }
        
        /* Analysis results */
        .analysis-section {
          border-radius: 0.75rem;
          overflow: hidden;
        }
        
        .skill-tag {
          background-color: rgba(59, 130, 246, 0.1);
          color: #1e40af;
          border-radius: 9999px;
          padding: 0.25rem 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          display: inline-block;
          margin-right: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        /* Progress bar */
        .progress-container {
          background-color: #e2e8f0;
          border-radius: 9999px;
          height: 0.75rem;
          overflow: hidden;
        }
        
        .progress-bar {
          height: 100%;
          border-radius: 9999px;
          background: linear-gradient(to right, #3b82f6, #8b5cf6);
        }
        
        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
      
      {/* Header */}
      <Header 
        showWelcome={false}
        additionalButtons={
          <>
            <span className="text-sm text-gray-700 mr-2">
              {user?.fullName || user?.name || user?.email || 'User'}
            </span>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              Dashboard
            </button>
          </>
        }
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 content-container">
        <div className="px-4 py-6 sm:px-0 fixed-width-section">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-3xl font-bold">Resume Analysis</h1>
                <p className="text-indigo-100 mt-2">Upload your resume and get AI-powered insights to improve your job applications</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-white/10 rounded-lg px-4 py-2 text-sm">
                  <span className="font-medium">Powered by AI</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 fixed-width-section">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Your Resume</h2>
            
            {/* File Type Selector */}
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  uploadType === 'pdf' 
                    ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200' 
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                }`}
                onClick={() => setUploadType('pdf')}
              >
                PDF Format
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  uploadType === 'word' 
                    ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200' 
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                }`}
                onClick={() => setUploadType('word')}
              >
                Word Document
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  uploadType === 'image' 
                    ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200' 
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                }`}
                onClick={() => setUploadType('image')}
              >
                Image Format
              </button>
            </div>
            
            {/* File Upload Area */}
            <div className="mb-6">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={
                  uploadType === 'pdf' ? '.pdf' : 
                  uploadType === 'word' ? '.doc,.docx' : 
                  'image/*'
                }
                className="hidden"
              />
              
              {!file ? (
                <div 
                  className="file-drop-area p-10 text-center cursor-pointer"
                  onClick={handleUploadClick}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      Upload your {
                        uploadType === 'pdf' ? 'PDF' : 
                        uploadType === 'word' ? 'Word document' : 
                        'image'
                      }
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      {uploadType === 'pdf' 
                        ? 'Drag and drop or click to upload your resume in PDF format' 
                        : uploadType === 'word'
                          ? 'Drag and drop or click to upload your resume as a Word document (.doc or .docx)'
                          : 'Drag and drop or click to upload your resume as an image (JPG, PNG)'
                      }
                    </p>
                    <button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      Select File
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mr-3">
                        {uploadType === 'word' ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{fileName}</h4>
                        <p className="text-sm text-gray-500">
                          {file.size < 1024 * 1024
                            ? `${(file.size / 1024).toFixed(2)} KB`
                            : `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                          }
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="text-red-600 hover:text-red-800 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  {filePreview && (
                    <div className="mt-4 border border-gray-300 rounded-lg overflow-hidden">
                      <img 
                        src={filePreview} 
                        alt="Resume preview" 
                        className="max-w-full h-auto max-h-96 mx-auto"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Optional Job Description */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Job Description</h3>
                <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">Optional</span>
                <button 
                  onClick={toggleJdSection}
                  className="ml-auto flex items-center space-x-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  {showJdSection ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                      <span>Hide description</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Add for better analysis</span>
                    </>
                  )}
                </button>
              </div>
              
              {showJdSection && (
                <div className="fade-in">
                  <div className="relative rounded-xl overflow-hidden border-2 border-indigo-100 group hover:border-indigo-200 transition-all duration-200 bg-gradient-to-br from-white to-indigo-50">
                    <div className="absolute top-0 left-0 w-full px-4 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center">
                      <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium text-indigo-700">Paste job description here</span>
                    </div>
                    <textarea
                      id="jobDescription"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Adding the job description will help us tailor the analysis to specific requirements of the position you're applying for. This improves the accuracy of our feedback and recommendations."
                      className="w-full px-4 py-3 pt-14 bg-transparent focus:outline-none focus:ring-0 focus:border-indigo-300 transition-all duration-200 h-56 resize-none text-gray-700 placeholder-gray-400"
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white/80 px-2 py-0.5 rounded-md">
                      {jobDescription.length} characters
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 flex items-center">
                    <svg className="w-4 h-4 text-indigo-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Adding job details increases analysis accuracy by up to 40%
                  </p>
                </div>
              )}
            </div>
            
            {/* Analysis Button */}
            <div className="text-center">
              <button
                onClick={analyzeResume}
                disabled={!file || isAnalyzing}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  !file || isAnalyzing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {isAnalyzing ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing Resume...
                  </div>
                ) : (
                  'Analyze Resume'
                )}
              </button>
            </div>
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 fade-in fixed-width-section">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Analysis Results</h2>
              </div>
              
              <div className="p-6">
                {/* Job Fit Meter */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-900">Job Fit Score</h3>
                    <span className="text-xl font-bold text-indigo-700">{analysisResult.jobFit}%</span>
                  </div>
                  <div className="progress-container">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${analysisResult.jobFit}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {analysisResult.jobFit >= 80 
                      ? 'Excellent match! Your resume is well-aligned with typical requirements.'
                      : analysisResult.jobFit >= 60
                        ? 'Good match. Some improvements could strengthen your application.'
                        : 'Your resume may need significant improvements to match typical requirements.'
                    }
                  </p>
                </div>
                
                {/* Summary */}
                <div className="mb-8 p-4 bg-indigo-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                  <p className="text-gray-800">{analysisResult.summary}</p>
                </div>
                
                {/* Skills */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Identified Skills</h3>
                  <div>
                    {analysisResult.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Experience and Education */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Experience</h3>
                    <ul className="list-disc pl-5 text-gray-800">
                      {analysisResult.experience.map((exp, index) => (
                        <li key={index} className="mb-1">{exp}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Education</h3>
                    <ul className="list-disc pl-5 text-gray-800">
                      {analysisResult.education.map((edu, index) => (
                        <li key={index} className="mb-1">{edu}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Strengths and Suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-3">Strengths</h3>
                    <ul className="list-disc pl-5 text-green-800">
                      {analysisResult.strengths.map((strength, index) => (
                        <li key={index} className="mb-1">{strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h3 className="font-semibold text-amber-800 mb-3">Improvement Suggestions</h3>
                    <ul className="list-disc pl-5 text-amber-800">
                      {analysisResult.suggestions.map((suggestion, index) => (
                        <li key={index} className="mb-1">{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ResumeAnalysis;
