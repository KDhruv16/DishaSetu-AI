import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck,
  MessageSquareCode,
  Zap,
  CheckCircle2,
  BookOpen,
  Briefcase,
  Target,
  Award,
  RefreshCw,
  Bot,
  Milestone,
  AlertCircle,
  Clock,
  Compass,
  BarChart3,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { TopHeader } from '../components/common/TopHeader';
import { GaugeChart } from '../components/common/GaugeChart';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { CareerJourney } from '../components/common/CareerJourney';
import { getDeterministicNextStep } from '../utils/nextBestStep';
import api from '../utils/api';

export const DashboardPage = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [interviewAnalysis, setInterviewAnalysis] = useState(null);
  const [recommendedOpps, setRecommendedOpps] = useState([]);
  const [roadmapData, setRoadmapData] = useState(null);
  const [candidateProgress, setCandidateProgress] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Fetch all career intelligence datasets simultaneously
  useEffect(() => {
    if (!authLoading && (!user || !user.isOnboarded)) {
      navigate('/onboarding');
      return;
    }

    const loadCareerIntelligence = async () => {
      try {
        setAnalysisLoading(true);
        setFetchError(null);

        const [careerRes, resumeRes, interviewRes, oppsRes, roadmapRes, progressRes] = await Promise.allSettled([
          api.get('/ai/career-analysis'),
          api.get('/resume/latest'),
          api.get('/interview/latest'),
          api.get('/opportunities/recommended'),
          api.get('/roadmap'),
          api.get('/profile/candidate-progress'),
        ]);

        if (careerRes.status === 'fulfilled' && careerRes.value.data?.success) {
          setAnalysis(careerRes.value.data.analysis);
        }
        if (resumeRes.status === 'fulfilled' && resumeRes.value.data?.success && resumeRes.value.data.analysis) {
          setResumeAnalysis(resumeRes.value.data.analysis);
        }
        if (interviewRes.status === 'fulfilled' && interviewRes.value.data?.success && interviewRes.value.data.interview) {
          setInterviewAnalysis(interviewRes.value.data.interview);
        }
        if (oppsRes.status === 'fulfilled' && oppsRes.value.data?.success && oppsRes.value.data.data) {
          setRecommendedOpps(oppsRes.value.data.data);
        }
        if (roadmapRes.status === 'fulfilled' && roadmapRes.value.data?.success && roadmapRes.value.data.roadmap) {
          setRoadmapData(roadmapRes.value.data.roadmap);
        }
        if (progressRes.status === 'fulfilled' && progressRes.value.data?.success && progressRes.value.data.progress) {
          setCandidateProgress(progressRes.value.data.progress);
        }
      } catch (err) {
        console.warn('Dashboard intelligence fetch note:', err.message);
        setFetchError('Some intelligence modules could not be refreshed. Displaying cached profile baseline.');
      } finally {
        setAnalysisLoading(false);
      }
    };

    if (user && user.isOnboarded) {
      loadCareerIntelligence();
    }
  }, [user, authLoading, navigate]);

  if (authLoading || analysisLoading) {
    return <LoadingSpinner fullScreen label="Loading your career readiness intelligence..." />;
  }

  // ====================================================================
  // ALL METRICS DERIVED FROM UNIFIED CANDIDATE PROGRESS (Single Source of Truth)
  // Falls back to old logic ONLY if progress endpoint hasn't loaded yet
  // ====================================================================
  const cp = candidateProgress;

  const primaryCareer = analysis?.careers?.[0];
  const targetRole = cp?.targetRole || primaryCareer?.role || profile?.career?.targetRole || profile?.targetRole || 'Full Stack Developer';

  // 1. Resume ATS Score — from unified progress
  const resumeScore = cp?.resume?.atsScore
    ?? ((resumeAnalysis && typeof resumeAnalysis.atsScore?.overall === 'number' && resumeAnalysis.atsScore.overall > 0)
      ? resumeAnalysis.atsScore.overall : null);
  const hasResume = resumeScore !== null;

  // 2. Mock Interview Score — from unified progress
  const interviewScore = cp?.mockInterview?.score
    ?? ((interviewAnalysis?.completed && typeof interviewAnalysis.overallScore?.overall === 'number' && interviewAnalysis.overallScore.overall > 0)
      ? interviewAnalysis.overallScore.overall : null);
  const hasInterview = interviewScore !== null;

  // 3. Skill Assessment Score — from unified progress (THIS WAS THE BUG)
  const skillAssessmentScore = cp?.skillAssessment?.score
    ?? ((profile?.readiness && typeof profile.readiness.skillAssessmentScore === 'number' && profile.readiness.skillAssessmentScore > 0)
      ? profile.readiness.skillAssessmentScore : null);
  const hasAssessment = skillAssessmentScore !== null;

  // 4. Skill Match Score
  const skillMatchScore = cp?.skillGap?.matchPercentage
    ?? (typeof primaryCareer?.matchPercentage === 'number' ? primaryCareer.matchPercentage : null);

  // 5. Career Readiness Score — from unified progress
  const readinessScore = cp?.readiness?.overall
    ?? ((typeof analysis?.readinessScore?.overall === 'number' && analysis.readinessScore.overall > 0)
      ? analysis.readinessScore.overall : null);

  // 6. Roadmap Metrics — from unified progress
  const roadmapCompletedTasks = cp?.roadmap?.completedTasks ?? roadmapData?.completedTasks ?? 0;
  const roadmapTotalTasks = cp?.roadmap?.totalTasks ?? roadmapData?.totalTasks ?? 12;
  const roadmapProgress = cp?.roadmap?.progress ?? (roadmapTotalTasks > 0 ? Math.round((roadmapCompletedTasks / roadmapTotalTasks) * 100) : 0);

  // Deterministic Next Best Step
  const nextBestStepObj = getDeterministicNextStep({
    profile,
    analysis,
    roadmapData,
    resumeAnalysis,
    interviewAnalysis,
    recommendedOpps,
  });

  const topSkillGaps = cp?._raw?.topSkillGaps?.map((m) => ({
    name: m.skill,
    priority: m.priority,
    reason: m.reason,
  })) || primaryCareer?.missingSkills?.slice(0, 3).map((m) => ({
    name: m.skill,
    priority: m.priority,
    reason: m.reason,
  })) || profile?.readiness?.topSkillGaps || [];

  const isProfileDone = cp?.profile?.status === 'COMPLETED'
    || Boolean(user?.isOnboarded && profile?.skills?.currentSkills?.length > 0);

  // First pending evaluation route for CTA button
  const getNextPendingRoute = () => {
    if (!hasResume) return '/resume';
    if (!hasAssessment) return '/skills';
    if (!hasInterview) return '/interview';
    return '/roadmap';
  };

  return (
    <div className="min-h-screen bg-[#fafcff] flex flex-col">
      <TopHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {fetchError && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{fetchError}</span>
          </div>
        )}

        {/* =========================================================
            SECTION 1: HERO READINESS, EVALUATION CHECKLIST & NEXT BEST STEP
            ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-6 sm:p-7 bg-white border border-slate-200/90 shadow-premium">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column: Gauge Score & Breakdown */}
              <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <GaugeChart
                      score={readinessScore}
                      max={100}
                      size={110}
                      strokeWidth={10}
                      showSubtext={false}
                    />
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200/60 px-2 py-0.5 rounded-md inline-block">
                      Career Readiness Score
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900 leading-tight">
                      {readinessScore !== null
                        ? (readinessScore >= 75 ? 'Strong Employability Potential' : 'Developing Potential')
                        : 'Evaluation Pending'}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {readinessScore !== null
                    ? `Based on your resume, skills, assessment performance and interview readiness, you are well on track for a ${targetRole} role.`
                    : 'Complete your profile evaluations to get your Career Readiness Score and personalized career insights.'}
                </p>

                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(readinessScore !== null ? '/analytics' : getNextPendingRoute())}
                    className="text-slate-700 hover:text-brand-700 bg-slate-50 hover:bg-brand-50 border-slate-200 hover:border-brand-300 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
                  >
                    <span>{readinessScore !== null ? 'View Full Breakdown' : 'Continue Evaluation'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-brand-600" />
                  </Button>
                </div>
              </div>

              {/* Middle Column: Evaluation Checklist (Timeline) */}
              <div className="lg:col-span-4 flex flex-col justify-center border-t lg:border-t-0 lg:border-l lg:border-r border-slate-200/80 pt-5 lg:pt-0 px-0 lg:px-5">
                <div className="space-y-3.5">
                  {/* Item 1: Profile */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-xs ${isProfileDone ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {isProfileDone ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Profile</h4>
                        <p className="text-[11px] text-slate-500">Education, skills, interests</p>
                      </div>
                    </div>
                    {isProfileDone ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full shrink-0">
                        Completed
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full shrink-0">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Connector */}
                  <div className="w-px h-2.5 border-l-2 border-dashed border-slate-200 ml-3 -my-1" />

                  {/* Item 2: Resume / ATS Analysis */}
                  <div
                    onClick={() => !hasResume && navigate('/resume')}
                    className={`flex items-center justify-between gap-3 ${!hasResume ? 'cursor-pointer group' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-xs ${hasResume ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                        {hasResume ? <CheckCircle2 className="w-4 h-4" /> : <FileCheck className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">Resume / ATS Analysis</h4>
                        <p className="text-[11px] text-slate-500">{hasResume ? 'Resume quality & keyword match' : 'Upload your resume for AI analysis'}</p>
                      </div>
                    </div>
                    {hasResume ? (
                      <span className="text-[11px] font-bold text-brand-700 bg-brand-50 border border-brand-200/80 px-2.5 py-0.5 rounded-full shrink-0">
                        {resumeScore}/100
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full shrink-0 group-hover:bg-amber-100 transition-colors">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Connector */}
                  <div className="w-px h-2.5 border-l-2 border-dashed border-slate-200 ml-3 -my-1" />

                  {/* Item 3: Skill Assessment */}
                  <div
                    onClick={() => navigate('/skills')}
                    className="flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-xs ${hasAssessment ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                        {hasAssessment ? <CheckCircle2 className="w-4 h-4" /> : <Zap className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">Skill Assessment</h4>
                        <p className="text-[11px] text-slate-500">{hasAssessment ? `${cp?.skillAssessment?.masteredSkills || '—'}/${cp?.skillAssessment?.totalSkills || '—'} skills mastered` : 'Take a role-based assessment'}</p>
                      </div>
                    </div>
                    {hasAssessment ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full shrink-0">
                        Completed
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full shrink-0 group-hover:bg-amber-100 transition-colors">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Connector */}
                  <div className="w-px h-2.5 border-l-2 border-dashed border-slate-200 ml-3 -my-1" />

                  {/* Item 4: Mock Interview */}
                  <div
                    onClick={() => navigate('/interview')}
                    className="flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-xs ${hasInterview ? 'bg-emerald-500 text-white' : (cp?.mockInterview?.status === 'IN_PROGRESS' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400 border border-slate-200')}`}>
                        {hasInterview ? <CheckCircle2 className="w-4 h-4" /> : <MessageSquareCode className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">Mock Interview</h4>
                        <p className="text-[11px] text-slate-500">{hasInterview ? `Score: ${interviewScore}/100 · View Feedback` : (cp?.mockInterview?.status === 'IN_PROGRESS' ? 'Continue your interview' : 'Give a mock interview with AI')}</p>
                      </div>
                    </div>
                    {hasInterview ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full shrink-0">
                        {interviewScore}/100
                      </span>
                    ) : cp?.mockInterview?.status === 'IN_PROGRESS' ? (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full shrink-0">
                        In Progress
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full shrink-0 group-hover:bg-amber-100 transition-colors">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Next Best Step or Complete Your Evaluation */}
              <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-md relative overflow-hidden border border-slate-800 flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/15 rounded-full blur-2xl pointer-events-none" />

                {readinessScore !== null ? (
                  <>
                    <div>
                      <div className="flex items-center gap-1.5 mb-2 relative z-10">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                          ★ YOUR NEXT BEST STEP
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold font-display text-white leading-snug relative z-10">
                        {nextBestStepObj.title}
                      </h3>

                      <p className="text-xs text-slate-300 mt-2 leading-relaxed relative z-10">
                        {nextBestStepObj.description || nextBestStepObj.reason}
                      </p>
                    </div>

                    <div className="mt-4 relative z-10">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(nextBestStepObj.route || '/roadmap')}
                        className="w-full bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <span>{nextBestStepObj.action || 'Continue Roadmap'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center gap-1.5 mb-2 relative z-10">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                          ★ Complete Your Evaluation
                        </span>
                      </div>

                      <h3 className="text-base font-bold font-display text-white leading-snug relative z-10">
                        Unlock Your Career Potential
                      </h3>

                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed relative z-10">
                        Complete your AI-powered evaluations to generate your deterministic score:
                      </p>

                      <div className="space-y-1.5 mt-3 relative z-10 text-[11px]">
                        <div className="flex items-center gap-2 text-slate-300">
                          <span className={hasResume ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                            {hasResume ? '✓' : '○'}
                          </span>
                          <span>AI Resume Analysis (ATS)</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <span className={hasAssessment ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                            {hasAssessment ? '✓' : '○'}
                          </span>
                          <span>Role-based Skill Assessment</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <span className={hasInterview ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                            {hasInterview ? '✓' : '○'}
                          </span>
                          <span>AI Mock Interview</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <span className={roadmapCompletedTasks > 0 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                            {roadmapCompletedTasks > 0 ? '✓' : '○'}
                          </span>
                          <span>Personalized Career Roadmap</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 relative z-10">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(getNextPendingRoute())}
                        className="w-full bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <span>Start Evaluation</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* =========================================================
            SECTION 2: 5 KEY METRIC CARDS (TARGET ROLE, SKILLS, ATS, INTERVIEW, ROADMAP)
            ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Target Career */}
          <Card hoverEffect onClick={() => navigate('/career')} className="p-5 border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Target Role
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <h4 className="text-base font-bold text-slate-900 truncate" title={targetRole}>
              {targetRole}
            </h4>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-500">AI Direction</span>
              <span className="font-bold text-brand-600">Top Match →</span>
            </div>
          </Card>

          {/* Card 2: Skill Match Benchmark */}
          <Card hoverEffect onClick={() => navigate('/skills')} className="p-5 border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Skill Match
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <h4 className="text-2xl font-extrabold font-display text-slate-900">
                {skillMatchScore !== null ? `${skillMatchScore}%` : '—'}
              </h4>
              {skillMatchScore === null && (
                <span className="text-[11px] text-slate-400 ml-1">Complete assessment</span>
              )}
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${skillMatchScore || 0}%` }}
              />
            </div>
          </Card>

          {/* Card 3: Resume ATS Score */}
          <Card hoverEffect onClick={() => navigate('/resume')} className="p-5 border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Resume ATS
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <h4 className="text-2xl font-extrabold font-display text-slate-900">
                {hasResume ? `${resumeScore}%` : '—'}
              </h4>
              {!hasResume && (
                <span className="text-[11px] text-slate-400 ml-1">Upload resume</span>
              )}
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${resumeScore || 0}%` }}
              />
            </div>
          </Card>

          {/* Card 4: Mock Interview */}
          <Card hoverEffect onClick={() => navigate('/interview')} className="p-5 border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Mock Interview
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageSquareCode className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <h4 className={`font-extrabold font-display text-slate-900 ${hasInterview ? 'text-2xl' : 'text-lg'}`}>
                {hasInterview ? `${interviewScore}%` : (cp?.mockInterview?.status === 'IN_PROGRESS' ? 'In Progress' : 'Pending')}
              </h4>
              {!hasInterview && (
                <span className="text-[11px] text-slate-400 ml-1">
                  {cp?.mockInterview?.status === 'IN_PROGRESS' ? 'Continue interview' : 'Start interview'}
                </span>
              )}
              {hasInterview && (
                <span className="text-[11px] text-slate-400 ml-1">View Feedback</span>
              )}
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${interviewScore || 0}%` }}
              />
            </div>
          </Card>

          {/* Card 5: Roadmap Sprint */}
          <Card hoverEffect onClick={() => navigate('/roadmap')} className="p-5 border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Roadmap Sprint
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Milestone className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <h4 className="text-2xl font-extrabold font-display text-slate-900">
                {roadmapCompletedTasks} / {roadmapTotalTasks} tasks
              </h4>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${roadmapProgress}%` }}
              />
            </div>
          </Card>
        </div>

        {/* =========================================================
            SECTION 3: VISUAL 9-STAGE CAREER JOURNEY
            ========================================================= */}
        <CareerJourney
          user={user}
          profile={profile}
          analysis={analysis}
          roadmapData={roadmapData}
          resumeAnalysis={resumeAnalysis}
          interviewAnalysis={interviewAnalysis}
          recommendedOpps={recommendedOpps}
          readinessScore={readinessScore}
          candidateProgress={candidateProgress}
        />

        {/* =========================================================
            SECTION 4: TOP SKILL GAPS & RECOMMENDED OPPORTUNITIES
            ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Top Skill Gaps (Left Column) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900">
                  Top Skill Gaps to Bridge
                </h3>
                <p className="text-xs text-slate-500">
                  Essential competencies required to maximize your candidate hireability.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/skills')}
                className="text-brand-600"
              >
                View all gaps →
              </Button>
            </div>

            <div className="space-y-3">
              {topSkillGaps.map((gap, idx) => (
                <Card
                  key={idx}
                  hoverEffect
                  onClick={() => navigate('/skills')}
                  className="p-4 flex items-start justify-between gap-4 border border-slate-200/80 bg-white"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      !
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {gap.name}
                        </h4>
                        <Badge
                          variant={gap.priority === 'High' ? 'danger' : 'warning'}
                          size="sm"
                        >
                          {gap.priority} Priority
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {gap.reason}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-brand-600 whitespace-nowrap shrink-0 hover:underline">
                    Bridge Gap →
                  </span>
                </Card>
              ))}
            </div>
          </div>

          {/* Recommended Opportunities (Right Column) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900">
                  Recommended Opportunities
                </h3>
                <p className="text-xs text-slate-500">
                  Matching jobs, internships and state initiatives based on your verified profile.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/opportunities')}
                className="text-brand-600"
              >
                Explore all ({recommendedOpps.length || 6}) →
              </Button>
            </div>

            <div className="space-y-3">
              {recommendedOpps && recommendedOpps.length > 0 ? (
                recommendedOpps.slice(0, 3).map((op) => (
                  <Card
                    key={op._id}
                    hoverEffect
                    onClick={() => navigate('/opportunities')}
                    className="p-4 border border-slate-200/80 bg-white flex items-center justify-between gap-4 cursor-pointer hover:border-brand-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center shrink-0">
                        {op.isGovernment ? (
                          <Award className="w-5 h-5 text-purple-600" />
                        ) : (
                          <Briefcase className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                            {op.title}
                          </h4>
                          <Badge
                            variant={op.isGovernment ? 'purple' : 'success'}
                            size="sm"
                          >
                            {op.matchPercentage || op.overallMatch}% Match
                          </Badge>
                          {op.missingSkills && op.missingSkills.length > 0 ? (
                            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                              Missing: {op.missingSkills[0]}
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                              ✓ Skills Met
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {op.organization} • {op.location} • {op.stipendOrSalary}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-brand-600 shrink-0">
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Card>
                ))
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                  <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">
                    No Opportunities Matched Yet
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Complete your onboarding profile to unlock personalized job and internship matches.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => navigate('/opportunities')}>
                    Browse All Opportunities
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
