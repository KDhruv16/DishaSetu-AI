import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Target,
  Zap,
  Milestone,
  BookOpen,
  FileCheck,
  MessageSquareCode,
  Award,
  Layers,
  HelpCircle,
  Clock,
  Check,
  Circle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TopHeader } from '../components/common/TopHeader';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { GaugeChart } from '../components/common/GaugeChart';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import api from '../utils/api';

export const AnalyticsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/analytics');
      if (res.data?.success) {
        setAnalytics(res.data);
      } else {
        setError('Unable to load career analytics.');
      }
    } catch (err) {
      console.error('Analytics load error:', err);
      setError('Career analytics could not be retrieved. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen label="Synthesizing your career progress intelligence..." />;
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-[#fafcff] flex flex-col">
        <TopHeader />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
          <Card className="p-8 text-center bg-white border border-rose-200/80 max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-900">
              Analytics Notice
            </h3>
            <p className="text-xs text-slate-500">{error || 'Could not load analytics.'}</p>
            <Button variant="primary" size="sm" onClick={fetchAnalytics}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Try Again
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  const {
    student,
    readiness,
    skills,
    roadmap,
    learning,
    resume,
    interview,
    weeklyProgress,
    milestones,
    nextBestStep,
    history,
  } = analytics;

  return (
    <div className="min-h-screen bg-[#fafcff] flex flex-col">
      <TopHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* =========================================================
            HEADER & STUDENT CONTEXT
            ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-100">
                Progress Intelligence
              </span>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                Target Role: <strong className="text-slate-800">{student?.targetRole}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 mt-2">
              Career Analytics & Progress Intelligence
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              An explainable diagnostic breakdown answering: Where am I? What improved? What is still missing? What should I do next?
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnalytics}
              className="text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-xs font-semibold shadow-xs"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* =========================================================
            SECTION 1 & 8: HERO READINESS & NEXT BEST STEP
            ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Readiness Score Card */}
          <div className="lg:col-span-5">
            <Card className="p-6 sm:p-7 bg-white border border-slate-200/90 shadow-soft h-full flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Current Readiness Score
                </span>
                <Badge variant={readiness.overall >= 80 ? 'success' : 'brand'} size="sm">
                  {readiness.overall >= 80 ? 'Placement Ready' : 'In Sprint Progress'}
                </Badge>
              </div>

              <div className="my-4 flex items-center justify-center">
                <GaugeChart
                  score={readiness.overall}
                  max={100}
                  label="CAREER READINESS"
                  subtext="Weighted synthesis across technical competencies, verified projects, academics, ATS resume, and mock interview."
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">ATS Resume</span>
                  <span className="text-xs font-extrabold font-display text-indigo-600">
                    {resume?.atsScore ? `${resume.atsScore}%` : 'Not Analyzed'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Interview</span>
                  <span className="text-xs font-extrabold font-display text-emerald-600">
                    {interview?.latestScore ? `${interview.latestScore}%` : 'Not Attempted'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Sprint</span>
                  <span className="text-sm font-extrabold font-display text-brand-600">
                    {roadmap.overallProgress}%
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Actionable Next Best Step Hero */}
          <div className="lg:col-span-7">
            <Card className="p-6 sm:p-7 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl shadow-md border border-slate-800 h-full flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
                      ★ Your Next Best Step
                    </span>
                  </div>
                  <Badge variant="brand" size="sm" className="bg-brand-500/20 text-brand-300 border-brand-400/30">
                    Priority Action
                  </Badge>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold font-display text-white leading-snug">
                  "{nextBestStep.title}"
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {nextBestStep.description}
                </p>

                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 text-xs text-amber-200/90 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <span>
                    <strong>Why this matters:</strong> {nextBestStep.reason}
                  </span>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 relative z-10">
                <span className="text-xs text-slate-400 font-medium">
                  Continuous focus accelerates your hiring readiness.
                </span>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate(nextBestStep.route)}
                  className="bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold shadow-md group"
                >
                  {nextBestStep.action}
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* =========================================================
            SECTION 2: CAREER READINESS BREAKDOWN (6 FACTORS)
            ========================================================= */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold font-display text-slate-900">
              Career Readiness Factor Breakdown
            </h2>
            <p className="text-xs text-slate-500">
              Transparent, weighted evaluation factors synthesized strictly from your verified activities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {readiness.breakdown.map((item) => (
              <Card key={item.key} className="p-5 border border-slate-200/80 bg-white rounded-2xl flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {item.label}
                    </span>
                    <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">
                      Weight: {item.weight}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-2xl font-extrabold font-display text-slate-900">
                      {item.score}%
                    </span>
                    <Badge
                      variant={item.score >= 80 ? 'success' : item.score >= 60 ? 'warning' : 'danger'}
                      size="sm"
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-3">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        item.score >= 80 ? 'bg-emerald-500' : item.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.explanation}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Improvement Action:
                  </span>
                  <p className="text-xs font-medium text-brand-700">
                    → {item.improvementAction}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* =========================================================
            SECTION 3: SKILL PROGRESS & TARGET MATRIX
            ========================================================= */}
        <Card className="p-6 border border-slate-200/80 bg-white rounded-3xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold font-display text-slate-900">
                  Target Skill Competency Matrix
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Benchmark competency level for role: <strong className="text-slate-800">{student?.targetRole}</strong>.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/skills')}
              className="text-xs text-brand-600 self-start sm:self-auto"
            >
              Diagnose Skills →
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {skills.map((skill, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {skill.name}
                    </h4>
                    <Badge
                      variant={skill.isMastered ? 'success' : skill.priority === 'High' ? 'danger' : 'warning'}
                      size="sm"
                    >
                      {skill.level}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mt-2 mb-1">
                    <span>Proficiency</span>
                    <span className="font-bold text-slate-700">{skill.proficiency}%</span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        skill.isMastered ? 'bg-emerald-500' : skill.priority === 'High' ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${skill.proficiency}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {skill.reason}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-400">
                    {skill.isMastered ? '✓ Mastered' : `Priority: ${skill.priority}`}
                  </span>
                  <button
                    onClick={() =>
                      navigate(
                        skill.isMastered
                          ? '/roadmap'
                          : `/learning?skill=${encodeURIComponent(skill.name)}`
                      )
                    }
                    className="text-brand-600 font-bold hover:underline"
                  >
                    {skill.isMastered ? 'Roadmap →' : 'Learn →'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* =========================================================
            SECTION 4 & 5: ROADMAP PROGRESS & LEARNING PROGRESS
            ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Roadmap Progress (Left Column) */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="p-6 border border-slate-200/80 bg-white rounded-3xl space-y-4 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Milestone className="w-5 h-5 text-purple-600" />
                    <h3 className="text-base font-bold font-display text-slate-900">
                      4-Week Roadmap Sprint Progress
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100">
                    Week {roadmap.currentWeek} Active
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Tasks Completed
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-2xl font-extrabold font-display text-slate-900">
                        {roadmap.completedTasks}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        of {roadmap.totalTasks} Total Sprint Tasks
                      </span>
                    </div>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex flex-col items-center justify-center font-extrabold font-display text-base shrink-0">
                    <span>{roadmap.overallProgress}%</span>
                  </div>
                </div>

                {/* 4-Week Progress Timeline */}
                <div className="mt-4 space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Weekly Sprint Breakdown:
                  </span>
                  {roadmap.weeksSummary?.length > 0 ? (
                    roadmap.weeksSummary.map((week) => (
                      <div
                        key={week.weekNumber}
                        className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                              week.percentage === 100
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {week.percentage === 100 ? '✓' : `W${week.weekNumber}`}
                          </span>
                          <span className="font-semibold text-slate-800 line-clamp-1">
                            {week.title}
                          </span>
                        </div>
                        <span className="text-slate-500 shrink-0 font-medium">
                          {week.completedTasks}/{week.totalTasks} ({week.percentage}%)
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">Generate your roadmap to track weekly milestone progress.</p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 truncate max-w-xs">
                  Next Task: <strong className="text-slate-800">{roadmap.nextTask}</strong>
                </span>
                <Button variant="outline" size="sm" onClick={() => navigate('/roadmap')} className="text-xs">
                  Open Sprint →
                </Button>
              </div>
            </Card>
          </div>

          {/* Learning & Weekly Activity Progress (Right Column) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6 border border-slate-200/80 bg-white rounded-3xl space-y-4 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-brand-600" />
                    <h3 className="text-base font-bold font-display text-slate-900">
                      Curated Learning Progress
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-100">
                    {learning.totalCurated} Resources
                  </span>
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-brand-50/50 border border-brand-100 space-y-2">
                  <span className="text-xs font-bold text-brand-900 uppercase tracking-wider block">
                    Enrolled Skill Tracks:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {learning.enrolledSkillTracks?.map((track, i) => (
                      <span
                        key={i}
                        className="text-xs bg-white text-brand-800 border border-brand-200 px-2.5 py-1 rounded-lg font-medium"
                      >
                        {track}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Verified Activities Summary */}
                <div className="mt-4 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Verified Activity Summary:
                  </span>
                  <div className="space-y-1.5">
                    {weeklyProgress.activitiesSummary?.map((act, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {history.message}
                </span>
                <Button variant="outline" size="sm" onClick={() => navigate('/learning')} className="text-xs">
                  Learning Hub →
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* =========================================================
            SECTION 7: 8 CAREER MILESTONES
            ========================================================= */}
        <Card className="p-6 sm:p-7 border border-slate-200/80 bg-white rounded-3xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold font-display text-slate-900">
                  8-Stage Career Milestones
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Verified milestone completion required to reach placement readiness.
              </p>
            </div>

            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200/80">
              {milestones.filter((m) => m.status === 'completed').length} of {milestones.length} Milestones Achieved
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {milestones.map((m) => {
              const isDone = m.status === 'completed';
              const isCurrent = m.status === 'current';

              return (
                <div
                  key={m.id}
                  onClick={() => navigate(m.route)}
                  className={`p-4 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
                    isDone
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950 hover:bg-emerald-50'
                      : isCurrent
                      ? 'bg-brand-50/70 border-brand-300 text-brand-950 shadow-xs'
                      : 'bg-slate-50/50 border-slate-200/80 text-slate-500'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[10px] font-bold text-slate-400">0{m.id}</span>
                      {isDone ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                      ) : isCurrent ? (
                        <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] font-bold animate-pulse">
                          →
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-[10px] font-bold">
                          ○
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold font-display leading-snug">
                      {m.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {m.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/40 flex items-center justify-between text-[11px]">
                    <span
                      className={`font-bold uppercase tracking-wider ${
                        isDone
                          ? 'text-emerald-700'
                          : isCurrent
                          ? 'text-brand-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {isDone ? 'Completed' : isCurrent ? 'In Focus' : 'Upcoming'}
                    </span>
                    <span className="text-brand-600 font-bold hover:underline">
                      View →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </main>
    </div>
  );
};
