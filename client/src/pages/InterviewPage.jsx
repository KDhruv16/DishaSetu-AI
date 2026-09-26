import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquareCode,
  Play,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  RotateCcw,
  Check,
  Target,
  BrainCircuit,
  Award,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TopHeader } from '../components/common/TopHeader';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { GaugeChart } from '../components/common/GaugeChart';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import api from '../utils/api';

export const InterviewPage = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Setup Form State
  const defaultRole = profile?.career?.targetRole || 'Full Stack Developer';
  const [selectedRole, setSelectedRole] = useState(defaultRole);
  const [selectedType, setSelectedType] = useState('Technical');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');

  // Active Question & Answer State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentEval, setCurrentEval] = useState(null);

  // Fetch latest saved interview on mount
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        setLoadingLatest(true);
        const res = await api.get('/interview/latest');
        if (res.data?.success && res.data.interview) {
          setInterview(res.data.interview);
          if (!res.data.interview.completed) {
            // Resume uncompleted interview
            const nextUnansweredIdx = res.data.interview.questions.findIndex((q) => !q.isAnswered);
            setCurrentQuestionIdx(nextUnansweredIdx !== -1 ? nextUnansweredIdx : 0);
          }
        }
      } catch (err) {
        console.warn('Fetch interview note:', err.message);
      } finally {
        setLoadingLatest(false);
      }
    };

    fetchLatest();
  }, []);

  // Start New Interview Session
  const handleStartInterview = async () => {
    try {
      setStarting(true);
      setError(null);

      const res = await api.post('/interview/start', {
        role: selectedRole,
        type: selectedType,
        difficulty: selectedDifficulty,
      });

      if (res.data?.success && res.data.interview) {
        setInterview(res.data.interview);
        setCurrentQuestionIdx(0);
        setCurrentAnswer('');
        setCurrentEval(null);
      } else {
        setError('Failed to start interview session.');
      }
    } catch (err) {
      console.error('Start interview error:', err);
      setError(err.response?.data?.message || 'Failed to start interview session. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!currentAnswer.trim()) {
      setError('Please type your answer before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const question = interview.questions[currentQuestionIdx];

      const res = await api.post(`/interview/${interview._id}/answer`, {
        questionIndex: question.questionIndex,
        studentAnswer: currentAnswer.trim(),
      });

      if (res.data?.success && res.data.interview) {
        setInterview(res.data.interview);
        setCurrentEval(res.data.currentEvaluation);
      } else {
        setError('Failed to evaluate answer. Please try again.');
      }
    } catch (err) {
      console.error('Submit answer error:', err);
      setError('Something went wrong while evaluating your answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Move to Next Question
  const handleNextQuestion = () => {
    setCurrentAnswer('');
    setCurrentEval(null);
    setError(null);
    setCurrentQuestionIdx((prev) => prev + 1);
  };

  // Reset to Start Screen
  const handleRestart = () => {
    setInterview(null);
    setCurrentEval(null);
    setCurrentAnswer('');
    setCurrentQuestionIdx(0);
    setError(null);
  };

  if (loadingLatest) {
    return <LoadingSpinner fullScreen label="Loading your mock interview studio..." />;
  }

  const currentQuestion = interview?.questions?.[currentQuestionIdx];
  const isLastQuestion = currentQuestionIdx === (interview?.questions?.length || 5) - 1;

  return (
    <div className="min-h-screen bg-[#fafcff] flex flex-col">
      <TopHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* =========================================================
            STATE 1: SETUP / START SCREEN (When no active interview)
            ========================================================= */}
        {!interview && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-md">
                Interactive Mock Studio
              </span>
              <h2 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight">
                Practice Before You Face the Interview
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Prepare for your target role with a tailored, text-based 5-question AI interview.
              </p>
            </div>

            <Card className="p-6 sm:p-8 max-w-xl mx-auto border border-slate-200/90 bg-white shadow-premium space-y-6">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Target Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Target Role
                </label>
                <input
                  type="text"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  placeholder="e.g. Full Stack Developer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              {/* Interview Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Interview Type
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {['Technical', 'HR', 'Mixed'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedType(t)}
                      className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                        selectedType === t
                          ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {['Easy', 'Medium', 'Hard'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDifficulty(d)}
                      className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                        selectedDifficulty === d
                          ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Questions info */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span className="font-medium">Total Questions:</span>
                <span className="font-bold text-slate-900">5 Structured Questions</span>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleStartInterview}
                isLoading={starting}
                className="w-full group"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Mock Interview
              </Button>
            </Card>
          </div>
        )}

        {/* =========================================================
            STATE 2: ACTIVE QUESTION & ANSWER SCREEN
            ========================================================= */}
        {interview && !interview.completed && currentQuestion && (
          <div className="space-y-6 max-w-3xl mx-auto">
            {/* Top Stepper Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Question {currentQuestionIdx + 1} of {interview.questions.length}
                </span>
                <span className="text-slate-300">•</span>
                <Badge variant="brand" size="sm">{currentQuestion.category || interview.type}</Badge>
              </div>

              <span className="text-xs font-semibold text-slate-500">
                {interview.role} ({interview.difficulty})
              </span>
            </div>

            {/* Progress Track */}
            <div className="grid grid-cols-5 gap-2">
              {interview.questions.map((q, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    q.isAnswered
                      ? 'bg-emerald-500'
                      : idx === currentQuestionIdx
                      ? 'bg-brand-600 animate-pulse'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Question Card */}
            <Card className="p-6 sm:p-8 border border-slate-200/90 bg-white shadow-premium space-y-6">
              <div>
                <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block mb-1">
                  Interviewer Question:
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900 leading-snug">
                  "{currentQuestion.questionText}"
                </h3>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Answer Input (If not evaluated yet) */}
              {!currentEval && (
                <form onSubmit={handleSubmitAnswer} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Your Answer:
                    </label>
                    <textarea
                      rows={5}
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Type your response clearly. Explain concepts, architectural trade-offs, and practical examples..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-400">
                      Take your time. Answer as you would in an actual interview.
                    </span>

                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={submitting}
                    >
                      Submit Answer
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </form>
              )}

              {/* AI Real-Time Feedback Card (After submission) */}
              {currentEval && (
                <div className="space-y-6 pt-2 border-t border-slate-100">
                  {/* Scores Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Technical Depth
                      </span>
                      <span className="text-xl font-extrabold font-display text-brand-600">
                        {currentEval.scores?.technicalAccuracy}%
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Completeness
                      </span>
                      <span className="text-xl font-extrabold font-display text-indigo-600">
                        {currentEval.scores?.completeness}%
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Clarity
                      </span>
                      <span className="text-xl font-extrabold font-display text-emerald-600">
                        {currentEval.scores?.clarity}%
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Relevance
                      </span>
                      <span className="text-xl font-extrabold font-display text-amber-600">
                        {currentEval.scores?.relevance}%
                      </span>
                    </div>
                  </div>

                  {/* Feedback Points */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* What Went Well */}
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                      <span className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> What You Did Well:
                      </span>
                      <div className="space-y-1">
                        {currentEval.whatWentWell?.map((w, i) => (
                          <p key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{w}</span>
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* How to Improve */}
                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                      <span className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-600" /> How to Improve:
                      </span>
                      <div className="space-y-1">
                        {currentEval.howToImprove?.map((h, i) => (
                          <p key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{h}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Better Approach Tip */}
                  {currentEval.betterApproach && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                      <span className="font-bold text-brand-600 uppercase text-[10px] block mb-0.5">
                        Suggested Approach:
                      </span>
                      {currentEval.betterApproach}
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex justify-end pt-2">
                    {isLastQuestion ? (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => {
                          // Trigger reload of interview object
                          api.get('/interview/latest').then((res) => {
                            if (res.data?.interview) setInterview(res.data.interview);
                          });
                        }}
                      >
                        <Award className="w-4 h-4 mr-1.5" />
                        View Final Performance Report
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleNextQuestion}
                      >
                        Next Question
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* =========================================================
            STATE 3: FINAL INTERVIEW REPORT SCREEN (Completed)
            ========================================================= */}
        {interview && interview.completed && (
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Hero Final Report Card */}
            <Card className="p-6 sm:p-8 bg-gradient-to-br from-white via-white to-emerald-50/40 border-2 border-emerald-200 shadow-premium">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left: Score Gauge */}
                <div className="lg:col-span-6 flex items-center justify-center lg:justify-start">
                  <GaugeChart
                    score={interview.overallScore?.overall || 78}
                    max={100}
                    label="MOCK INTERVIEW READINESS"
                    subtext={`Evaluated across 5 questions for ${interview.role} (${interview.difficulty} difficulty).`}
                  />
                </div>

                {/* Right: Breakdown */}
                <div className="lg:col-span-6 bg-slate-50/80 rounded-2xl p-5 sm:p-6 border border-slate-200/70 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Performance Metrics
                    </span>
                    <Badge variant="success" size="sm">Interview Completed ✓</Badge>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Technical Accuracy</span>
                      <span className="text-brand-600">{interview.overallScore?.breakdown?.technicalAccuracy || 75}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-brand-500 h-1.5 rounded-full"
                        style={{ width: `${interview.overallScore?.breakdown?.technicalAccuracy || 75}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Completeness of Response</span>
                      <span className="text-indigo-600">{interview.overallScore?.breakdown?.completeness || 70}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full"
                        style={{ width: `${interview.overallScore?.breakdown?.completeness || 70}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Communication Clarity</span>
                      <span className="text-emerald-600">{interview.overallScore?.breakdown?.clarity || 80}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full"
                        style={{ width: `${interview.overallScore?.breakdown?.clarity || 80}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Relevance to Prompt</span>
                      <span className="text-amber-600">{interview.overallScore?.breakdown?.relevance || 85}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full"
                        style={{ width: `${interview.overallScore?.breakdown?.relevance || 85}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Questions Recap */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold font-display text-slate-900 text-lg">
                  Question Review & Evaluations
                </h4>
                <Button variant="outline" size="sm" onClick={handleRestart}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Practice Again
                </Button>
              </div>

              <div className="space-y-3">
                {interview.questions?.map((q, idx) => (
                  <Card key={idx} className="p-5 border border-slate-200 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">Q0{idx + 1}</span>
                        <Badge variant="brand" size="sm">{q.category}</Badge>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {q.scores?.overall || 75}% Score
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900">
                      "{q.questionText}"
                    </p>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-xs text-slate-700">
                      <span className="font-bold text-slate-400 uppercase text-[10px] block mb-0.5">
                        Your Answer:
                      </span>
                      <p className="italic">"{q.studentAnswer}"</p>
                    </div>

                    {q.betterApproach && (
                      <p className="text-xs text-slate-500 pt-1">
                        <strong className="text-brand-600">Tip:</strong> {q.betterApproach}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
