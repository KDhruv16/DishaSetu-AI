import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  ChevronRight,
  Sparkles
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
  // STATUS DERIVATION — Unified candidateProgress Single Source of Truth
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

  const isCareerReadyDone = cp
    ? (cp.readiness?.overall !== null && cp.readiness.overall >= 80)
    : Boolean(typeof readinessScore === 'number' && readinessScore >= 80 && isResumeDone && isInterviewDone && isRoadmapStarted);

  // Exact 9 Stages requested:
  // Explore → Assess → Learn → Practice → Build → Get Certified → Interview → Apply → Get Hired
  const getStageStatus = (key) => {
    switch (key) {
      case 'explore':
        return isProfileDone ? 'completed' : 'current';
      case 'assess':
        if (isCareerDone) return 'completed';
        return isProfileDone ? 'current' : 'upcoming';
      case 'learn':
        if (isSkillGapDone) return 'completed';
        return isCareerDone ? 'current' : 'upcoming';
      case 'practice':
        if (isLearningActive) return 'completed';
        return isSkillGapDone ? 'current' : 'upcoming';
      case 'build':
        if (isRoadmapCompleted) return 'completed';
        return isRoadmapStarted ? 'current' : (isSkillGapDone ? 'current' : 'upcoming');
      case 'get-certified':
        if (isResumeDone) return 'completed';
        return isRoadmapStarted ? 'current' : 'upcoming';
      case 'interview':
        if (isInterviewDone) return 'completed';
        return isResumeDone ? 'current' : 'upcoming';
      case 'apply':
        if (isOpportunitiesDone) return 'completed';
        return isInterviewDone ? 'current' : 'upcoming';
      case 'get-hired':
        if (isCareerReadyDone) return 'completed';
        return isOpportunitiesDone ? 'current' : 'upcoming';
      default:
        return 'upcoming';
    }
  };

  const stages = [
    {
      id: 'explore',
      name: 'Explore',
      sub: 'Profile Intake',
      icon: UserCheck,
      route: '/onboarding',
      status: getStageStatus('explore'),
      detail: isProfileDone ? 'Baseline Verified' : 'Complete Intake',
    },
    {
      id: 'assess',
      name: 'Assess',
      sub: 'Target Alignment',
      icon: Compass,
      route: '/career',
      status: getStageStatus('assess'),
      detail: isCareerDone ? '95% Role Match' : 'Role Analysis',
    },
    {
      id: 'learn',
      name: 'Learn',
      sub: 'Skill Diagnosis',
      icon: Zap,
      route: '/skills',
      status: getStageStatus('learn'),
      detail: isSkillGapDone ? 'Competencies Met' : 'Assess Skills',
    },
    {
      id: 'practice',
      name: 'Practice',
      sub: 'Curated Path',
      icon: BookOpen,
      route: '/learning',
      status: getStageStatus('practice'),
      detail: isLearningActive ? 'Curriculum Active' : 'Select Modules',
    },
    {
      id: 'build',
      name: 'Build',
      sub: 'Sprint Milestones',
      icon: Milestone,
      route: '/roadmap',
      status: getStageStatus('build'),
      detail: isRoadmapCompleted ? '12/12 Tasks Done' : (isRoadmapStarted ? 'Sprint In Progress' : 'Start Sprint'),
    },
    {
      id: 'get-certified',
      name: 'Get Certified',
      sub: 'Resume ATS',
      icon: FileCheck,
      route: '/resume',
      status: getStageStatus('get-certified'),
      detail: isResumeDone ? `${cp?.resume?.atsScore || 96}% ATS Score` : 'Upload Resume',
    },
    {
      id: 'interview',
      name: 'Interview',
      sub: 'AI Evaluation',
      icon: MessageSquareCode,
      route: '/interview',
      status: getStageStatus('interview'),
      detail: isInterviewDone ? `${cp?.mockInterview?.score || 58}% Evaluated` : 'Take Mock Call',
    },
    {
      id: 'apply',
      name: 'Apply',
      sub: 'Target Drives',
      icon: Briefcase,
      route: '/opportunities',
      status: getStageStatus('apply'),
      detail: `${recommendedOpps?.length || 6} Matched Roles`,
    },
    {
      id: 'get-hired',
      name: 'Get Hired',
      sub: 'Corporate Offer',
      icon: Award,
      route: '/applications',
      status: getStageStatus('get-hired'),
      detail: isCareerReadyDone ? 'Hire Ready Tier' : 'Placement Goal',
    },
  ];

  const completedCount = stages.filter((s) => s.status === 'completed').length;
  const currentStage = stages.find((s) => s.status === 'current') || stages[stages.length - 1];
  const progressPercent = Math.round((completedCount / stages.length) * 100);

  return (
    <section className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <span>Campus to Corporate Career Journey</span>
            </h2>
            <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/80">
              {completedCount} of 9 Verified ({progressPercent}%)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end continuous loop from campus intake to verified corporate offer.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Current Milestone:</span>
            <span className="font-bold text-indigo-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
              {currentStage.name}
            </span>
          </div>
        </div>
      </div>

      {/* Connected 9-Stage Pipeline Visualization */}
      <div className="pt-6 overflow-x-auto pb-2 no-scrollbar">
        <div className="min-w-[840px] relative">
          
          {/* Continuous Connecting Railway / Rail Line */}
          <div className="absolute top-5 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
          
          {/* Progress Overlay Line */}
          <div
            className="absolute top-5 left-6 h-0.5 bg-emerald-500 transition-all duration-700 -z-0"
            style={{
              width: `${Math.min(100, Math.max(0, ((completedCount - 0.5) / (stages.length - 1)) * 100))}%`
            }}
          />

          {/* 9 Stage Nodes */}
          <div className="grid grid-cols-9 gap-2 relative z-10">
            {stages.map((stg, idx) => {
              const Icon = stg.icon;
              const isCompleted = stg.status === 'completed';
              const isCurrent = stg.status === 'current';

              return (
                <div
                  key={stg.id}
                  onClick={() => navigate(stg.route)}
                  className="flex flex-col items-center text-center cursor-pointer group"
                >
                  {/* Node Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                      isCompleted
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-50 shadow-xs group-hover:bg-emerald-700 group-hover:scale-105'
                        : isCurrent
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-sm animate-pulse group-hover:bg-indigo-700 group-hover:scale-105'
                        : 'bg-white text-slate-400 border-2 border-slate-300 group-hover:border-slate-400 group-hover:text-slate-600'
                    }`}
                    title={`Stage 0${idx + 1}: ${stg.name} (${stg.detail})`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-white stroke-[2.5]" />
                    ) : isCurrent ? (
                      <Icon className="w-4 h-4 text-white" />
                    ) : (
                      <span className="font-mono text-[11px] font-semibold">0{idx + 1}</span>
                    )}
                  </div>

                  {/* Stage Label & Details */}
                  <div className="mt-2.5 space-y-0.5 px-0.5">
                    <p className={`text-xs font-bold font-display leading-tight transition-colors ${
                      isCurrent
                        ? 'text-indigo-900 font-extrabold'
                        : isCompleted
                        ? 'text-slate-900 group-hover:text-emerald-700'
                        : 'text-slate-500 group-hover:text-slate-800'
                    }`}>
                      {stg.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium leading-tight truncate max-w-[85px]">
                      {stg.sub}
                    </p>
                  </div>

                  {/* Micro Status Chip */}
                  <div className="mt-2">
                    <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded font-mono block whitespace-nowrap ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                        : isCurrent
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold'
                        : 'text-slate-400'
                    }`}>
                      {isCompleted ? '✓ Done' : isCurrent ? 'Active Focus' : 'Upcoming'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

    </section>
  );
};
