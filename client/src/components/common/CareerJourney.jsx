import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './Card';
import { Badge } from './Badge';
import {
  UserCheck,
  Compass,
  Zap,
  BookOpen,
  Milestone,
  FileCheck,
  MessageSquareCode,
  Briefcase,
  Award,
  CheckCircle2,
  ArrowRight,
  Circle,
} from 'lucide-react';

export const CareerJourney = ({
  user,
  profile,
  analysis,
  roadmapData,
  resumeAnalysis,
  interviewAnalysis,
  recommendedOpps = [],
  readinessScore = 0,
  candidateProgress = null,
}) => {
  const navigate = useNavigate();
  const cp = candidateProgress;

  // ====================================================================
  // STATUS DERIVATION — Uses unified candidateProgress (Single Source of Truth)
  // Falls back to old logic only when candidateProgress is unavailable
  // ====================================================================
  const isProfileDone = cp
    ? cp.profile?.status === 'COMPLETED'
    : Boolean(user?.isOnboarded && profile?.skills?.currentSkills?.length > 0);

  const isResumeDone = cp
    ? cp.resume?.status === 'ANALYZED'
    : Boolean(resumeAnalysis && typeof resumeAnalysis.atsScore?.overall === 'number' && resumeAnalysis.atsScore.overall > 0);

  const isInterviewDone = cp
    ? cp.mockInterview?.status === 'COMPLETED'
    : Boolean(interviewAnalysis && interviewAnalysis.completed === true);

  const isRoadmapStarted = cp
    ? (cp.roadmap?.status === 'IN_PROGRESS' || cp.roadmap?.status === 'COMPLETED')
    : Boolean(roadmapData && roadmapData.completedTasks > 0);

  const isRoadmapCompleted = cp
    ? cp.roadmap?.status === 'COMPLETED'
    : Boolean(roadmapData && roadmapData.completedTasks >= (roadmapData.totalTasks || 12) && roadmapData.completedTasks > 0);

  const isCareerDone = cp
    ? (cp.skillGap?.status === 'COMPLETED' || cp.skillGap?.status === 'AVAILABLE')
    : Boolean(analysis?.careers?.length > 0 && isProfileDone);

  // FIXED: Use unified progress for skill gap — this was the main bug source
  const isSkillGapDone = cp
    ? cp.skillAssessment?.status === 'COMPLETED'
    : Boolean(
        (profile?.readiness?.skillAssessmentScore && profile.readiness.skillAssessmentScore > 0) ||
        (isCareerDone && isProfileDone)
      );

  const isLearningActive = cp
    ? (cp.learning?.status === 'IN_PROGRESS' || cp.learning?.status === 'COMPLETED')
    : isRoadmapStarted;

  const isOpportunitiesDone = cp
    ? cp.opportunities?.status === 'AVAILABLE'
    : Boolean(isResumeDone && isInterviewDone && recommendedOpps && recommendedOpps.length > 0);

  const effectiveReadiness = cp?.readiness?.overall ?? readinessScore;
  const isCareerReadyDone = cp
    ? (cp.readiness?.overall !== null && cp.readiness.overall >= 80)
    : Boolean(typeof readinessScore === 'number' && readinessScore >= 80 && isResumeDone && isInterviewDone && isRoadmapStarted);

  // Compute status: 'completed' | 'current' | 'upcoming'
  const getStageStatus = (key) => {
    switch (key) {
      case 'profile':
        return isProfileDone ? 'completed' : 'current';
      case 'career':
        if (isCareerDone) return 'completed';
        return isProfileDone ? 'current' : 'upcoming';
      case 'skills':
        if (isSkillGapDone) return 'completed';
        return isCareerDone ? 'current' : 'upcoming';
      case 'learning':
        if (isLearningActive) return 'completed';
        return isSkillGapDone ? 'current' : 'upcoming';
      case 'roadmap':
        if (isRoadmapCompleted) return 'completed';
        return isRoadmapStarted ? 'current' : (isSkillGapDone ? 'upcoming' : 'upcoming');
      case 'resume':
        if (isResumeDone) return 'completed';
        return isProfileDone ? 'current' : 'upcoming';
      case 'interview':
        if (isInterviewDone) return 'completed';
        return isResumeDone ? 'current' : 'upcoming';
      case 'opportunities':
        if (isOpportunitiesDone) return 'completed';
        return isInterviewDone ? 'current' : 'upcoming';
      case 'ready':
        if (isCareerReadyDone) return 'completed';
        return isOpportunitiesDone ? 'current' : 'upcoming';
      default:
        return 'upcoming';
    }
  };

  const steps = [
    {
      id: 'profile',
      name: 'Profile',
      icon: UserCheck,
      route: '/onboarding',
      desc: 'Academic & skills baseline',
      status: getStageStatus('profile'),
    },
    {
      id: 'career',
      name: 'Career Analysis',
      icon: Compass,
      route: '/career',
      desc: 'Target pathway match',
      status: getStageStatus('career'),
    },
    {
      id: 'skills',
      name: 'Skill Gap',
      icon: Zap,
      route: '/skills',
      desc: 'Competency diagnosis',
      status: getStageStatus('skills'),
    },
    {
      id: 'learning',
      name: 'Learning',
      icon: BookOpen,
      route: '/learning',
      desc: 'Curated courses & certs',
      status: getStageStatus('learning'),
    },
    {
      id: 'roadmap',
      name: 'Roadmap',
      icon: Milestone,
      route: '/roadmap',
      desc: '4-week sprint milestones',
      status: getStageStatus('roadmap'),
    },
    {
      id: 'resume',
      name: 'Resume',
      icon: FileCheck,
      route: '/resume',
      desc: 'ATS scan & optimization',
      status: getStageStatus('resume'),
    },
    {
      id: 'interview',
      name: 'Interview',
      icon: MessageSquareCode,
      route: '/interview',
      desc: 'Mock practice & evaluation',
      status: getStageStatus('interview'),
    },
    {
      id: 'opportunities',
      name: 'Opportunities',
      icon: Briefcase,
      route: '/opportunities',
      desc: 'Targeted jobs & schemes',
      status: getStageStatus('opportunities'),
    },
    {
      id: 'ready',
      name: 'Career Ready',
      icon: Award,
      route: '/dashboard',
      desc: 'Offer-ready candidate',
      status: getStageStatus('ready'),
    },
  ];

  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const currentStep = steps.find((s) => s.status === 'current') || steps[steps.length - 1];

  return (
    <Card className="p-6 sm:p-7 border border-slate-200/90 bg-white shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold font-display text-slate-900">
              Visual Career Journey
            </h3>
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-200/60">
              {completedCount} of 9 Stages Done
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            End-to-end continuous loop from campus intake to verified corporate offer.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5">
          <span className="text-slate-400">Current Focus:</span>
          <span className="text-brand-600 font-bold">{currentStep.name}</span>
        </div>
      </div>

      {/* 9-Step Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = step.status === 'completed';
          const isCurrent = step.status === 'current';

          return (
            <div
              key={step.id}
              onClick={() => navigate(step.route)}
              className={`p-3 rounded-2xl border flex flex-col justify-between text-center cursor-pointer transition-all duration-200 relative group hover:scale-[1.02] ${
                isDone
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950 hover:bg-emerald-50 hover:border-emerald-300'
                  : isCurrent
                  ? 'bg-brand-50/70 border-brand-400 text-brand-950 shadow-xs ring-2 ring-brand-500/20'
                  : 'bg-slate-50/50 border-slate-200/80 text-slate-500 hover:bg-white hover:border-slate-300'
              }`}
            >
              {/* Step Top Badge */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[10px] font-bold text-slate-400">0{idx + 1}</span>
                {isDone ? (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                    ✓
                  </span>
                ) : isCurrent ? (
                  <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] font-bold animate-pulse shadow-2xs">
                    →
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-[10px] font-bold">
                    ○
                  </span>
                )}
              </div>

              {/* Step Icon & Title */}
              <div className="space-y-1 my-1">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110 ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-700'
                      : isCurrent
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold font-display leading-tight line-clamp-1 pt-1">
                  {step.name}
                </h4>
                <p className="text-[10px] text-slate-400 leading-tight line-clamp-1">
                  {step.desc}
                </p>
              </div>

              {/* Status Label */}
              <div className="mt-2 pt-1.5 border-t border-slate-200/40">
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider block ${
                    isDone
                      ? 'text-emerald-700'
                      : isCurrent
                      ? 'text-brand-700'
                      : 'text-slate-400'
                  }`}
                >
                  {isDone ? 'Completed' : isCurrent ? 'In Focus' : 'Upcoming'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
