import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../utils/auth.js';
import { toast } from 'react-toastify';
import Header from '../components/Header';

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
  score: number;
  strengths: string[];
  improvements: string[];
  keywords: string[];
  experience: string;
  education: string;
  skills: string[];
  recommendations: string[];
}

const ResumeAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/pdf' || file.type.includes('word') || file.type === 'text/plain') {
      setSelectedFile(file);
      setAnalysisResult(null);
    } else {
      toast.error('Please select a PDF, Word document, or text file');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Please select a resume file');
      return;
    }

    setIsAnalyzing(true);

    try {
      // TODO: Implement actual resume analysis API call
      console.log('Analyzing resume:', selectedFile.name);
      console.log('Job description:', jobDescription);

      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockResult: AnalysisResult = {
        score: 82,
        strengths: [
          'Strong technical skills in modern frameworks',
          'Relevant experience in similar roles',
          'Good educational background',
          'Active GitHub contributions',
          'Leadership experience mentioned'
        ],
        improvements: [
          'Add more quantifiable achievements',
          'Include specific metrics and results',
          'Highlight problem-solving abilities',
          'Add relevant certifications',
          'Improve keyword optimization'
        ],
        keywords: [
          'React', 'JavaScript', 'Node.js', 'Python', 'AWS', 'Docker', 
          'Git', 'Agile', 'REST API', 'MongoDB'
        ],
        experience: '5+ years in software development',
        education: 'Bachelor\'s in Computer Science',
        skills: [
          'Frontend Development', 'Backend Development', 'Cloud Computing',
          'Database Management', 'Version Control', 'Testing'
        ],
        recommendations: [
          'Add more specific examples of project impacts',
          'Include relevant certifications (AWS, React, etc.)',
          'Quantify achievements with numbers and percentages',
          'Tailor keywords to match job requirements better',
          'Add links to portfolio and GitHub projects'
        ]
      };

      setAnalysisResult(mockResult);
      toast.success('Resume analysis completed!');
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast.error('Failed to analyze resume');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        showWelcome={false}
        additionalButtons={
          <>
            <span className="text-sm text-gray-700">
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Resume Analysis</h2>
              <p className="text-gray-600">Upload a resume and get AI-powered insights and recommendations.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Upload Resume *
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : selectedFile
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  {selectedFile ? (
                    <div className="text-green-600">
                      <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="font-medium">Drop your resume here or click to browse</p>
                      <p className="text-sm mt-1">Supports PDF, Word, and text files</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Job Description Section */}
              <div>
                <label htmlFor="jobDescription" className="block text-sm font-semibold text-gray-700 mb-3">
                  Job Description (Optional)
                </label>
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Paste the job description here to get more targeted analysis and recommendations..."
                />
              </div>
            </div>

            {/* Analyze Button */}
            <div className="mt-6">
              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || isAnalyzing}
                className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isAnalyzing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Analysis Results</h3>

              {/* Overall Score */}
              <div className={`${getScoreBackground(analysisResult.score)} rounded-lg p-6 mb-6`}>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(analysisResult.score)} mb-2`}>
                    {analysisResult.score}/100
                  </div>
                  <p className="text-gray-700 font-medium">Overall Resume Score</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strengths */}
                <div>
                  <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {analysisResult.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div>
                  <h4 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-2">
                    {analysisResult.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-gray-700">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Key Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Experience:</strong> {analysisResult.experience}</p>
                    <p><strong>Education:</strong> {analysisResult.education}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Detected Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.keywords.map((keyword, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Skills Identified</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {analysisResult.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ResumeAnalysis;
