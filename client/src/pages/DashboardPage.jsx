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

        const [careerRes, resumeRes, interviewRes, oppsRes, roadmapRes] = await Promise.allSettled([
          api.get('/ai/career-analysis'),
          api.get('/resume/latest'),
          api.get('/interview/latest'),
          api.get('/opportunities/recommended'),
          api.get('/roadmap'),
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

  // Live calculated core metrics
  const primaryCareer = analysis?.careers?.[0];
  const readinessScore = analysis?.readinessScore?.overall ?? profile?.readiness?.readinessScore ?? 0;
  const targetRole = primaryCareer?.role || profile?.career?.targetRole || profile?.targetRole || 'Full Stack Developer';
  const skillMatchScore = primaryCareer?.matchPercentage ?? profile?.readiness?.skillMatchScore ?? 0;
  const resumeScore = resumeAnalysis?.atsScore?.overall || 0;
  const interviewScore =
    interviewAnalysis?.completed && interviewAnalysis?.overallScore?.overall
      ? interviewAnalysis.overallScore.overall
      : (interviewAnalysis?.completed && interviewAnalysis?.scores?.overall ? interviewAnalysis.scores.overall : 0);

  // Deterministic Next Best Step
  const nextBestStepObj = getDeterministicNextStep({
    profile,
    analysis,
    roadmapData,
    resumeAnalysis,
    interviewAnalysis,
    recommendedOpps,
  });

  const topSkillGaps = primaryCareer?.missingSkills?.slice(0, 3).map((m) => ({
    name: m.skill,
    priority: m.priority,
    reason: m.reason,
  })) || profile?.readiness?.topSkillGaps || [
    { name: 'Docker', priority: 'High', reason: 'Essential for modern containerized microservice deployments.' },
    { name: 'Testing', priority: 'Medium', reason: 'High demand for test-driven codebases and QA pipelines.' },
    { name: 'SQL', priority: 'Medium', reason: 'Standard relational querying competency across industry.' },
  ];

  const roadmapProgress = roadmapData?.overallProgress || 0;
  const roadmapCompletedTasks = roadmapData?.completedTasks || 0;
  const roadmapTotalTasks = roadmapData?.totalTasks || 12;

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
            SECTION 1: HERO READINESS & "YOUR NEXT BEST STEP" (PRIORITY ACTION)
            ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-white via-white to-blue-50/40 border border-slate-200/90 shadow-premium">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left: Gauge Score */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center lg:items-start">
                <GaugeChart
                  score={readinessScore}
                  max={100}
                  label="CAREER READINESS SCORE"
                  subtext={`Deterministic score synthesized across technical skills, projects, ATS resume, and interview readiness for ${targetRole}.`}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/analytics')}
                  className="mt-4 text-brand-700 bg-brand-50/80 hover:bg-brand-100 border-brand-200 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <BarChart3 className="w-4 h-4 text-brand-600" />
                  View Career Analytics →
                </Button>
              </div>

              {/* Right: "Your Next Best Step" (Strong Visual Hierarchy) */}
              <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
                      ★ Your Next Best Step
                    </span>
                  </div>
                  <Badge variant="brand" size="sm" className="bg-brand-500/20 text-brand-300 border-brand-400/30">
                    {nextBestStepObj.badge || 'Highest Priority'}
                  </Badge>
                </div>

                <h3 className="text-lg sm:text-2xl font-bold font-display text-white leading-snug relative z-10">
                  "{nextBestStepObj.title}"
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed relative z-10">
                  {nextBestStepObj.description}
                </p>

                <div className="p-3 rounded-xl bg-white/10 border border-white/10 text-xs text-amber-200/90 mt-3 relative z-10 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                  <span>
                    <strong>Why this matters:</strong> {nextBestStepObj.reason}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 relative z-10">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => navigate(nextBestStepObj.route)}
                    className="bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold shadow-md group"
                  >
                    {nextBestStepObj.action}
                    <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                  </Button>

                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => navigate('/assistant')}
                    className="text-white bg-white/10 hover:bg-white/20 border-white/20"
                  >
                    <Bot className="w-4 h-4 mr-1.5 text-brand-300" />
                    Ask AI Copilot
                  </Button>

                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => navigate('/roadmap')}
                    className="text-slate-300 hover:text-white"
                  >
                    Roadmap ({roadmapProgress}%)
                  </Button>
                </div>
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
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
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
                {skillMatchScore}%
              </h4>
              <span className="text-xs text-slate-400">benchmark</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${skillMatchScore}%` }}
              />
            </div>
          </Card>

          {/* Card 3: Resume ATS Score */}
          <Card hoverEffect onClick={() => navigate('/resume')} className="p-5 border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Resume ATS
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <h4 className="text-2xl font-extrabold font-display text-slate-900">
                {resumeScore > 0 ? `${resumeScore}%` : 'Not Scanned'}
              </h4>
              {resumeScore > 0 && <span className="text-xs text-slate-400">ATS score</span>}
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-indigo-500 h-1.5 rounded-full"
                style={{ width: `${resumeScore}%` }}
              />
            </div>
          </Card>

          {/* Card 4: Interview Readiness */}
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
              <h4 className="text-2xl font-extrabold font-display text-slate-900">
                {interviewScore > 0 ? `${interviewScore}%` : 'Practice'}
              </h4>
              {interviewScore > 0 && <span className="text-xs text-slate-400">readiness</span>}
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: `${interviewScore || 40}%` }}
              />
            </div>
          </Card>

          {/* Card 5: 4-Week Roadmap Sprint Progress */}
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
                {roadmapProgress}%
              </h4>
              <span className="text-xs text-slate-400">
                {roadmapCompletedTasks}/{roadmapTotalTasks} tasks
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
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
