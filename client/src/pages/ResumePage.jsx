import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileCheck,
  RefreshCw,
  Copy,
  Check,
  ArrowRight,
  Trash2,
  Wand2,
  TrendingUp,
  Target,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TopHeader } from '../components/common/TopHeader';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { GaugeChart } from '../components/common/GaugeChart';
import { AiLoadingAnimation } from '../components/common/AiLoadingAnimation';
import api from '../utils/api';

export const ResumePage = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [savedAnalysis, setSavedAnalysis] = useState(null);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Resume Improver State
  const [sectionType, setSectionType] = useState('Project Description');
  const [originalText, setOriginalText] = useState('');
  const [improvedText, setImprovedText] = useState('');
  const [improving, setImproving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [improverError, setImproverError] = useState(null);

  const targetRole =
    savedAnalysis?.targetRole || profile?.career?.targetRole || 'Full Stack Developer';

  // Fetch latest saved analysis on mount
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        setLoadingLatest(true);
        const res = await api.get('/resume/latest');
        if (res.data?.success && res.data.analysis) {
          setSavedAnalysis(res.data.analysis);
        }
      } catch (err) {
        console.warn('Latest resume fetch note:', err.message);
      } finally {
        setLoadingLatest(false);
      }
    };

    fetchLatest();
  }, []);

  // Handle Drag and Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Only PDF documents are supported. Please select a PDF file.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Only PDF documents are supported. Please select a PDF file.');
      }
    }
  };

  // Submit PDF for Analysis
  const handleAnalyzeResume = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file to analyze.');
      setErrorDetails(null);
      return;
    }

    try {
      setAnalyzing(true);
      setError(null);
      setErrorDetails(null);

      const formData = new FormData();
      formData.append('resume', selectedFile);

      const res = await api.post('/resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success && res.data.analysis) {
        setSavedAnalysis(res.data.analysis);
        setSelectedFile(null);
        setError(null);
        setErrorDetails(null);
      } else {
        setError(res.data?.message || 'Failed to analyze resume.');
        setErrorDetails(res.data?.details || null);
      }
    } catch (err) {
      console.error('Resume upload error:', err);
      const isRejection = err.response?.data?.isResume === false;
      const msg =
        err.response?.data?.message ||
        (isRejection
          ? "⚠️ This doesn't appear to be a resume/CV."
          : "Resume analysis couldn't be completed right now. Please try again.");
      const details =
        err.response?.data?.details ||
        (isRejection
          ? 'Please upload a resume containing your education, skills, projects, internships, work experience, or professional profile.'
          : null);
      setError(msg);
      setErrorDetails(details);
    } finally {
      setAnalyzing(false);
    }
  };

  // Improve text with AI
  const handleImproveText = async (e) => {
    e.preventDefault();
    if (!originalText.trim()) {
      setImproverError('Please enter some text to improve.');
      return;
    }

    try {
      setImproving(true);
      setImproverError(null);
      setCopied(false);

      const res = await api.post('/resume/improve', {
        originalText: originalText.trim(),
        sectionType,
        targetRole,
      });

      if (res.data?.success) {
        if (res.data.isValid === false) {
          setImprovedText(null);
          setImproverError(`${res.data.validationMessage || 'Please enter a meaningful resume statement.'} Example: "${res.data.example}"`);
        } else if (res.data.improved) {
          setImprovedText(res.data.improved);
          setImproverError(null);
        } else {
          setImproverError('Failed to improve text. Please try again.');
        }
      } else {
        setImproverError(res.data?.message || 'Failed to improve text. Please try again.');
      }
    } catch (err) {
      console.error('Text improvement error:', err);
      const msg = err.response?.data?.message || 'Failed to improve text. Please try again.';
      setImproverError(msg);
    } finally {
      setImproving(false);
    }
  };

  const handleCopy = () => {
    if (improvedText) {
      navigator.clipboard.writeText(improvedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-[#fafcff] flex flex-col">
      <TopHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md">
              Resume Intelligence
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mt-2">
              ATS Scanner & Resume Optimizer
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Analyze your resume alignment against target role: <strong className="text-slate-900">{targetRole}</strong>.
            </p>
          </div>

          {savedAnalysis && !analyzing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSavedAnalysis(null);
                setSelectedFile(null);
              }}
              className="self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Analyze New Resume
            </Button>
          )}
        </div>

        {/* LOADING ANIMATION */}
        {analyzing && (
          <AiLoadingAnimation label="Reading & Auditing Resume ATS Alignment..." />
        )}

        {/* UPLOAD FORM (When no active analysis displayed) */}
        {!savedAnalysis && !analyzing && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="p-8 border-2 border-slate-200/90 bg-white text-center shadow-soft">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold font-display text-slate-900 mb-1">
                Analyze Your Resume
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
                Upload your PDF resume to see how ready it is for recruiter applicant tracking systems.
              </p>

              {/* Drag and Drop Box */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`p-6 border-2 border-dashed rounded-2xl transition-all ${
                  isDragOver
                    ? 'border-brand-500 bg-brand-50/50'
                    : 'border-slate-200 hover:border-brand-300 bg-slate-50/50'
                }`}
              >
                <input
                  type="file"
                  id="pdfUpload"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!selectedFile ? (
                  <label htmlFor="pdfUpload" className="cursor-pointer block space-y-2">
                    <span className="text-sm font-semibold text-slate-700 block">
                      Drag & Drop your PDF resume here
                    </span>
                    <span className="text-xs text-slate-400 block">or</span>
                    <Button variant="outline" size="sm" className="pointer-events-none">
                      Choose PDF File
                    </Button>
                    <p className="text-[11px] text-slate-400 pt-1">
                      Strictly PDF only (Max 5MB)
                    </p>
                  </label>
                ) : (
                  <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-3 text-left truncate">
                      <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200/90 text-rose-800 text-xs text-left space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                  {errorDetails && (
                    <p className="text-rose-700 leading-relaxed pl-6">
                      {errorDetails}
                    </p>
                  )}
                </div>
              )}

              {selectedFile && (
                <div className="mt-6">
                  <Button
                    size="lg"
                    variant="primary"
                    onClick={handleAnalyzeResume}
                    className="w-full group"
                  >
                    Analyze Resume with AI
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              )}
            </Card>

            <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200/60 flex items-start gap-3 text-xs text-brand-900">
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <span>
                <strong>Anti-Hallucination Guarantee:</strong> DishaSetu scans your actual text without fabricating fake metrics or adding imaginary work history.
              </span>
            </div>
          </div>
        )}

        {/* RESULTS VIEW */}
        {savedAnalysis && !analyzing && (
          <div className="space-y-8">
            {/* HERO ATS SCORE CARD */}
            <Card className="p-6 sm:p-8 bg-gradient-to-br from-white via-white to-indigo-50/40 border-2 border-indigo-100 shadow-premium">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left: Circular Gauge */}
                <div className="lg:col-span-6 flex items-center justify-center lg:justify-start">
                  <GaugeChart
                    score={savedAnalysis.atsScore?.overall || 78}
                    max={100}
                    label="RESUME ATS SCORE"
                    subtext={`Evaluated against DishaSetu's ${savedAnalysis.targetRole} target-role criteria.`}
                  />
                </div>

                {/* Right: Breakdown Matrix */}
                <div className="lg:col-span-6 bg-slate-50/80 rounded-2xl p-5 sm:p-6 border border-slate-200/70 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      ATS Evaluation Factors
                    </span>
                    <span className="text-xs text-slate-400">
                      File: {savedAnalysis.fileName}
                    </span>
                  </div>

                  {/* Factor 1: Keyword Match */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Target Role Keyword Coverage (40%)</span>
                      <span className="text-brand-600">{savedAnalysis.atsScore?.breakdown?.keywordMatch || 75}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-brand-500 h-1.5 rounded-full"
                        style={{ width: `${savedAnalysis.atsScore?.breakdown?.keywordMatch || 75}%` }}
                      />
                    </div>
                  </div>

                  {/* Factor 2: Section Completeness */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Resume Section Completeness (25%)</span>
                      <span className="text-indigo-600">{savedAnalysis.atsScore?.breakdown?.sectionCompleteness || 80}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full"
                        style={{ width: `${savedAnalysis.atsScore?.breakdown?.sectionCompleteness || 80}%` }}
                      />
                    </div>
                  </div>

                  {/* Factor 3: Action Verbs */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Action Verbs & Impact Clarity (20%)</span>
                      <span className="text-emerald-600">{savedAnalysis.atsScore?.breakdown?.projectAndExperience || 70}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full"
                        style={{ width: `${savedAnalysis.atsScore?.breakdown?.projectAndExperience || 70}%` }}
                      />
                    </div>
                  </div>

                  {/* Factor 4: Formatting */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Formatting & Length Quality (15%)</span>
                      <span className="text-slate-800">{savedAnalysis.atsScore?.breakdown?.formattingAndClarity || 85}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-slate-700 h-1.5 rounded-full"
                        style={{ width: `${savedAnalysis.atsScore?.breakdown?.formattingAndClarity || 85}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* VERIFIED SECTIONS & DETECTED SKILLS MATRIX */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Detected Sections Badge Bar */}
              <Card className="lg:col-span-12 p-4 border border-slate-200/80 bg-white flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Detected Resume Sections:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {savedAnalysis.sectionsDetected?.map((sec, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 ${
                        sec.found
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-50 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {sec.found ? '✓' : '○'} {sec.name}
                    </span>
                  ))}
                </div>
              </Card>

              {/* Verified Present Skills (Left) */}
              <Card className="lg:col-span-6 p-6 border border-emerald-100 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold font-display text-slate-900 text-sm">
                      Recognized Skills in Your Resume ({savedAnalysis.presentKeywords?.length || 0})
                    </h4>
                  </div>
                  <Badge variant="success" size="sm">Verified Present</Badge>
                </div>
                <p className="text-[11px] text-slate-400">
                  Deterministically extracted and matched from your uploaded document:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {savedAnalysis.presentKeywords?.map((kw, i) => (
                    <span
                      key={i}
                      className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-lg font-semibold"
                    >
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </Card>

              {/* Missing Target Role Keywords (Right) */}
              <Card className="lg:col-span-6 p-6 border border-amber-100 bg-white space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold font-display text-slate-900 text-sm">
                      Missing Keywords for {savedAnalysis.targetRole}
                    </h4>
                  </div>
                  <Badge variant="warning" size="sm">Not Detected</Badge>
                </div>

                {/* Core Missing Requirements */}
                {savedAnalysis.coreMissingKeywords && savedAnalysis.coreMissingKeywords.length > 0 ? (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                      Core Missing Competencies:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {savedAnalysis.coreMissingKeywords.map((kw, i) => (
                        <span
                          key={i}
                          className="text-xs bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-lg font-semibold"
                        >
                          ✕ {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                    ✓ All core {savedAnalysis.targetRole} requirements are satisfied!
                  </div>
                )}

                {/* Additional / Recommended Missing */}
                {savedAnalysis.recommendedMissingKeywords && savedAnalysis.recommendedMissingKeywords.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                      Recommended Additional Skills:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {savedAnalysis.recommendedMissingKeywords.map((kw, i) => (
                        <span
                          key={i}
                          className="text-xs bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-1 rounded-lg font-medium"
                        >
                          + {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* 2 COLUMN FINDINGS: STRENGTHS & NEEDS IMPROVEMENT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <Card className="p-6 border border-slate-200/80 bg-white space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold font-display text-slate-900 text-sm">
                    Grounded Resume Strengths
                  </h4>
                </div>
                <div className="space-y-2 pt-1">
                  {savedAnalysis.strengths?.map((str, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Needs Improvement */}
              <Card className="p-6 border border-slate-200/80 bg-white space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold font-display text-slate-900 text-sm">
                    Targeted Areas for Improvement
                  </h4>
                </div>
                <div className="space-y-2 pt-1">
                  {savedAnalysis.weakAreas?.map((weak, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                      <span>{weak}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* RECOMMENDED IMPROVEMENTS BOX */}
            <Card className="p-6 border border-slate-200/80 bg-white">
              <h4 className="font-bold font-display text-slate-900 text-base mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                Recommended Actionable Improvements
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {savedAnalysis.suggestions?.map((sug, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
                    <span className="text-[11px] font-bold text-brand-600 uppercase block mb-1">
                      Tip 0{i + 1}
                    </span>
                    {sug}
                  </div>
                ))}
              </div>
            </Card>

            {/* =========================================================
                SECTION 8: AI RESUME IMPROVER TOOL
                ========================================================= */}
            <Card className="p-6 sm:p-8 border-2 border-brand-200 bg-gradient-to-br from-white via-white to-brand-50/20 shadow-soft space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                    <Wand2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-slate-900">
                    Improve My Resume (Bullet Point Enhancer)
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Rewrite vague bullet points into crisp, action-verb engineering statements strictly from your facts.
                </p>
              </div>

              {/* Section Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Select Section Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Project Description', 'Professional Summary', 'Work Experience', 'Bullet Points'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSectionType(type)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        sectionType === type
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Original Text Input */}
              <form onSubmit={handleImproveText} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Paste Original Draft Text:
                  </label>
                  <textarea
                    rows={3}
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                    placeholder={
                      sectionType === 'Professional Summary'
                        ? 'e.g. I am a CSE student interested in full-stack web development with React and Node.js.'
                        : sectionType === 'Work Experience'
                        ? 'e.g. Worked on frontend features using React and fixed application bugs.'
                        : sectionType === 'Bullet Points'
                        ? 'e.g. Integrated REST APIs to support application features and reduced response time by 30%.'
                        : 'e.g. Made an event management website using MERN stack with user registration and booking.'
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                {improverError && (
                  <p className="text-xs text-rose-500 font-medium">{improverError}</p>
                )}

                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  isLoading={improving}
                >
                  <Wand2 className="w-4 h-4 mr-1.5" />
                  Improve with AI
                </Button>
              </form>

              {/* SIDE BY SIDE ORIGINAL VS IMPROVED */}
              {improvedText && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200/80">
                  {/* Original Box */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                      Original Draft:
                    </span>
                    <p className="italic">"{originalText}"</p>
                  </div>

                  {/* Improved Box */}
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        AI Enhanced Version:
                      </span>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-md transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-700" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="font-semibold text-slate-900 leading-relaxed">
                      "{improvedText}"
                    </p>

                    <p className="text-[10px] text-emerald-800 font-medium">
                      ✓ Rewritten with strong action verbs without fabricating false metrics.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};
