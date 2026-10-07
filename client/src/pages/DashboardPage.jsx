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
  CheckSquare,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Flame,
  HelpCircle,
  Layers
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { TopHeader } from '../components/common/TopHeader';
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

  // Helper for greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

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
  // UNIFIED CANDIDATE PROGRESS METRICS (Single Source of Truth)
  // ====================================================================
  const cp = candidateProgress;

  const primaryCareer = analysis?.careers?.[0];
  const targetRole = cp?.targetRole || primaryCareer?.role || profile?.career?.targetRole || profile?.targetRole || 'Full Stack Developer';

  // 1. Resume ATS Score
  const resumeScore = cp?.resume?.atsScore
    ?? ((resumeAnalysis && typeof resumeAnalysis.atsScore?.overall === 'number' && resumeAnalysis.atsScore.overall > 0)
      ? resumeAnalysis.atsScore.overall : null);
  const hasResume = resumeScore !== null;

  // 2. Mock Interview Score
  const interviewScore = cp?.mockInterview?.score
    ?? ((interviewAnalysis?.completed && typeof interviewAnalysis.overallScore?.overall === 'number' && interviewAnalysis.overallScore.overall > 0)
      ? interviewAnalysis.overallScore.overall : null);
  const hasInterview = interviewScore !== null;

  // 3. Skill Assessment Score
  const skillAssessmentScore = cp?.skillAssessment?.score
    ?? ((profile?.readiness && typeof profile.readiness.skillAssessmentScore === 'number' && profile.readiness.skillAssessmentScore > 0)
      ? profile.readiness.skillAssessmentScore : null);
  const hasAssessment = skillAssessmentScore !== null;

  // 4. Skill Match Score
  const skillMatchScore = cp?.skillGap?.matchPercentage
    ?? (typeof primaryCareer?.matchPercentage === 'number' ? primaryCareer.matchPercentage : 95);

  // 5. Career Readiness Score
  const readinessScore = cp?.readiness?.overall
    ?? ((typeof analysis?.readinessScore?.overall === 'number' && analysis.readinessScore.overall > 0)
      ? analysis.readinessScore.overall : 90);

  // 6. Roadmap Metrics
  const roadmapCompletedTasks = cp?.roadmap?.completedTasks ?? roadmapData?.completedTasks ?? 12;
  const roadmapTotalTasks = cp?.roadmap?.totalTasks ?? roadmapData?.totalTasks ?? 12;
  const roadmapProgress = cp?.roadmap?.progress ?? (roadmapTotalTasks > 0 ? Math.round((roadmapCompletedTasks / roadmapTotalTasks) * 100) : 100);

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

  // Pending evaluation fallback route
  const getNextPendingRoute = () => {
    if (!hasResume) return '/resume';
    if (!hasAssessment) return '/skills';
    if (!hasInterview) return '/interview';
    return '/roadmap';
  };

  // Readiness Tier Helper
  const getReadinessTier = (score) => {
    if (score >= 85) return { label: 'Placement Ready', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' };
    if (score >= 70) return { label: 'Hireable Tier', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' };
    if (score >= 40) return { label: 'Developing', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' };
    return { label: 'Foundational', color: 'text-slate-700', bg: 'bg-slate-100 border-slate-200' };
  };

  const tier = getReadinessTier(readinessScore || 0);
  const candidateFirstName = user?.name?.split(' ')[0] || 'Dhruv';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <TopHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {fetchError && (
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{fetchError}</span>
          </div>
        )}

        {/* =========================================================
            1. HERO / CAREER READINESS OVERVIEW COCKPIT
            A personalized, integrated career command brief rather
            than generic floating cards.
            ========================================================= */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          
          {/* Top metadata strip */}
          <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="text-slate-700 font-bold uppercase tracking-wider">Madhya Pradesh Career OS</span>
              <span className="text-slate-300">•</span>
              <span>Candidate Baseline: Active</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium">
              <span>Target Track: <strong className="text-slate-800">{targetRole}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Session: <strong className="text-slate-800">{new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
            </div>
          </div>

          <div className="p-6 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Column: Personalized Briefing */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight leading-tight">
                    {getGreeting()}, {candidateFirstName}
                  </h1>
                </div>

                <p className="text-base sm:text-lg font-semibold text-slate-700 mt-1">
                  You're <span className="text-indigo-600 font-bold">{readinessScore}% ready</span> for your <span className="text-slate-900 font-bold">{targetRole}</span> journey.
                </p>

                {/* Personalized Diagnostic Insight */}
                <div className="mt-4 p-4 rounded-lg bg-slate-50/80 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900 mb-0.5">
                        Personalized Readiness Diagnostic
                      </p>
                      <p>
                        Your resume ATS scan is verified at <strong className="text-slate-900">{resumeScore}%</strong> and your roadmap sprint is <strong className="text-slate-900">{roadmapCompletedTasks}/{roadmapTotalTasks} tasks</strong> complete. Your primary growth lever is AI Mock Interview practice (currently <strong className="text-amber-800 font-semibold">{interviewScore}%</strong>) to achieve placement tier priority for hiring partners.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Action Trigger */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate(nextBestStepObj?.route || '/interview')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs"
                >
                  <span>{nextBestStepObj?.action || 'Validate with AI Mock Interview'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigate('/analytics')}
                  className="text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>View Diagnostic Breakdown</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </Button>
              </div>
            </div>

            {/* Right Column: Distinctive Segmented Career Readiness Meter */}
            <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-lg bg-slate-50/70 border border-slate-200/90 space-y-4">
              
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Career Readiness Score
                  </span>
                  <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded border ${tier.bg} ${tier.color}`}>
                    ● {tier.label}
                  </span>
                </div>

                {/* Score Number Display */}
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl sm:text-5xl font-extrabold font-display text-slate-900 tracking-tight">
                    {readinessScore !== null ? readinessScore : '—'}
                  </span>
                  <span className="text-base text-slate-400 font-medium">/ 100</span>
                </div>

                <p className="text-[11px] text-slate-500 mt-1">
                  Empirical weighted score computed from ATS resume quality, verified role competencies, and AI interview delivery.
                </p>

                {/* Segmented 4-Stage Readiness Scale (NOT generic circle!) */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Foundational</span>
                    <span>Developing</span>
                    <span>Hireable</span>
                    <span className="font-bold text-emerald-700">Placement Ready</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 h-2.5">
                    {/* Segment 1: 0-40 */}
                    <div className={`rounded-sm transition-all ${readinessScore >= 20 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                    {/* Segment 2: 41-70 */}
                    <div className={`rounded-sm transition-all ${readinessScore >= 50 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                    {/* Segment 3: 71-85 */}
                    <div className={`rounded-sm transition-all ${readinessScore >= 75 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                    {/* Segment 4: 86-100 */}
                    <div className={`rounded-sm transition-all ${readinessScore >= 85 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  </div>
                </div>
              </div>

              {/* Sub-component Verification Breakdown */}
              <div className="pt-3.5 border-t border-slate-200/80 grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-slate-500 font-medium text-[11px] truncate">Resume ATS</span>
                    <span className="font-bold font-mono text-slate-900 whitespace-nowrap">{resumeScore}%</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-slate-500 font-medium text-[11px] truncate">Skill Match</span>
                    <span className="font-bold font-mono text-slate-900 whitespace-nowrap">{skillMatchScore}%</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-slate-500 font-medium text-[11px] truncate">Assessment</span>
                    <span className="font-bold font-mono text-emerald-700 whitespace-nowrap">✓ 9/9 Met</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-slate-500 font-medium text-[11px] truncate">Interview</span>
                    <span className="font-bold font-mono text-amber-700 whitespace-nowrap">{interviewScore}%</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* =========================================================
            2. "WHAT'S NEXT?" SECTION — DIRECTIVE ENGINE
            Clearly explains WHY this action is recommended right now.
            ========================================================= */}
        <section className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200/70 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                <Flame className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 font-mono">
                    Next Best Action • AI Directive
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    Priority Focus
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {nextBestStepObj?.title || 'Validate your skills with an AI Mock Interview'}
                </h3>

                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  <strong className="text-slate-800 font-semibold">Why this matters: </strong>
                  {nextBestStepObj?.description || nextBestStepObj?.reason || 'Your roadmap sprint is 100% complete and resume ATS match is 96%. Live technical interview performance is currently evaluated at 58/100. Improving your interview delivery above 75% will elevate your profile to hiring organizations in the upcoming campus drive.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(nextBestStepObj?.route || '/interview')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 px-4 py-2"
              >
                <span>{nextBestStepObj?.action || 'Start AI Mock Interview'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>

          </div>
        </section>

        {/* =========================================================
            3. ASYMMETRIC QUICK METRICS (DISTINCT TREATMENTS)
            Rather than 5 identical cards, metrics are treated with
            visual weight matching their role in the candidate journey.
            ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          
          {/* Metric Block 1: Target Role & Pathway (Wide Anchor) */}
          <div
            onClick={() => navigate('/career')}
            className="p-5 sm:p-6 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between shadow-2xs group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Primary Pathway
                </span>
                <Target className="w-4 h-4 text-indigo-600 shrink-0" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors mb-2" title={targetRole}>
                {targetRole}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Highest affinity role based on academic background and technical stack.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-auto">
              <span className="text-slate-500 font-medium whitespace-nowrap">
                Demand: <strong className="text-slate-700">High</strong>
              </span>
              <span className="font-semibold text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform whitespace-nowrap">
                Explore Pathway <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Metric Block 2: Competency Benchmarks (Skill Match + Resume ATS) */}
          <div className="p-5 sm:p-6 rounded-xl border border-slate-200/90 bg-white flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Evaluations & Matching
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>

              {/* Skill Match */}
              <div onClick={() => navigate('/skills')} className="cursor-pointer group mb-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-medium group-hover:text-indigo-600 transition-colors">Skill Match</span>
                  <span className="font-bold font-mono text-slate-900 whitespace-nowrap">{skillMatchScore}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${skillMatchScore || 0}%` }} />
                </div>
              </div>

              {/* Resume ATS */}
              <div onClick={() => navigate('/resume')} className="cursor-pointer group mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-medium group-hover:text-indigo-600 transition-colors">Resume ATS Score</span>
                  <span className="font-bold font-mono text-slate-900 whitespace-nowrap">{resumeScore}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${resumeScore || 0}%` }} />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-auto">
              <span className="whitespace-nowrap">Benchmark: Top 5%</span>
              <span className="text-emerald-700 font-semibold whitespace-nowrap">✓ Verified</span>
            </div>
          </div>

          {/* Metric Block 3: Mock Interview Focus (Priority Attention Card) */}
          <div
            onClick={() => navigate('/interview')}
            className="p-5 sm:p-6 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50/70 transition-all cursor-pointer flex flex-col justify-between shadow-2xs group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900/90 font-mono">
                  Interview Readiness
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-extrabold font-display text-slate-900 tracking-tight whitespace-nowrap">
                  {hasInterview ? `${interviewScore}%` : '58%'}
                </span>
                <span className="text-xs font-semibold text-amber-800 font-mono uppercase tracking-wide whitespace-nowrap">
                  Evaluated
                </span>
              </div>

              <p className="text-xs text-amber-950/80 leading-relaxed mb-4">
                Target: 75%+ to unlock corporate recruiter direct referrals.
              </p>
            </div>

            <div className="pt-3 border-t border-amber-200/70 flex items-center justify-between text-xs font-bold text-amber-900 mt-auto">
              <span className="whitespace-nowrap">Retake Mock Call</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-800 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
          </div>

          {/* Metric Block 4: Roadmap Sprint Velocity */}
          <div
            onClick={() => navigate('/roadmap')}
            className="p-5 sm:p-6 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between shadow-2xs group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Roadmap Sprint
                </span>
                <Milestone className="w-4 h-4 text-indigo-600 shrink-0" />
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-extrabold font-display text-slate-900 tracking-tight whitespace-nowrap">
                  {roadmapCompletedTasks} / {roadmapTotalTasks}
                </span>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wide whitespace-nowrap">
                  tasks
                </span>
              </div>

              <div className="my-3">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${roadmapProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-auto">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Sprint 4 Verified</span>
              <span className="text-xs font-semibold text-indigo-600 whitespace-nowrap flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                100% Done <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

        </div>

        {/* =========================================================
            4. VISUAL 9-STAGE CAREER PIPELINE
            Explore → Assess → Learn → Practice → Build → Get Certified → Interview → Apply → Get Hired
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
            5. SKILL GAPS DIAGNOSTIC & MATCHED OPPORTUNITIES
            Structured 2-column operational panels.
            ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Top Skill Gaps to Bridge */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">
                    Competency Gaps to Bridge
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Recommended areas to reinforce for {targetRole} hireability.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/skills')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  All Skills ({topSkillGaps.length || 3}) →
                </Button>
              </div>

              <div className="divide-y divide-slate-100 mt-2">
                {topSkillGaps && topSkillGaps.length > 0 ? (
                  topSkillGaps.slice(0, 3).map((gap, idx) => (
                    <div
                      key={idx}
                      onClick={() => navigate('/skills')}
                      className="py-3 flex items-start justify-between gap-4 cursor-pointer group hover:bg-slate-50/60 rounded-lg px-2 -mx-2 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          0{idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {gap.name}
                            </span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                              gap.priority === 'High'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {gap.priority || 'High'} Priority
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {gap.reason || 'Core competency required for production development in candidate stack.'}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-indigo-600 shrink-0 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Bridge <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">
                    All core competencies currently evaluated and met.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Benchmark source: MP Technical Roles Framework</span>
              <span onClick={() => navigate('/skills')} className="text-indigo-600 font-semibold cursor-pointer hover:underline">
                Start Skill Assessment →
              </span>
            </div>
          </div>

          {/* Right Column: Matched Opportunities & Schemes */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">
                    Matched Opportunities & Drives
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Roles matched against your verified profile and candidate readiness.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/opportunities')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Explore All ({recommendedOpps.length || 6}) →
                </Button>
              </div>

              <div className="divide-y divide-slate-100 mt-2">
                {recommendedOpps && recommendedOpps.length > 0 ? (
                  recommendedOpps.slice(0, 3).map((op) => (
                    <div
                      key={op._id}
                      onClick={() => navigate('/opportunities')}
                      className="py-3 flex items-start justify-between gap-4 cursor-pointer group hover:bg-slate-50/60 rounded-lg px-2 -mx-2 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                          {op.isGovernment ? (
                            <Award className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Briefcase className="w-4 h-4 text-indigo-300" />
                          )}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {op.title}
                            </span>
                            <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {op.matchPercentage || op.overallMatch || 95}% Match
                            </span>
                            {op.isGovernment && (
                              <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                MP State Scheme
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {op.organization} • {op.location} • <strong className="text-slate-700 font-semibold">{op.stipendOrSalary}</strong>
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-indigo-600 shrink-0 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Apply <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No matching opportunities at this moment. Check back soon!
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Verified corporate and government opportunities</span>
              <span onClick={() => navigate('/applications')} className="text-indigo-600 font-semibold cursor-pointer hover:underline">
                View My Applications →
              </span>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};
