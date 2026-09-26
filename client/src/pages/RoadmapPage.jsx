import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { TopHeader } from '../components/common/TopHeader';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Milestone,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  RefreshCw,
  BookOpen,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Flame,
  Target,
  Layers,
  Check,
  Zap,
} from 'lucide-react';

export const RoadmapPage = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [togglingTaskId, setTogglingTaskId] = useState(null);

  const generationSteps = [
    'Understanding your career goal...',
    'Prioritizing your high-impact skill gaps...',
    'Structuring weekly milestone sprints...',
    'Building your verified learning path...',
  ];

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const res = await api.get('/roadmap');
      if (res.data?.success && res.data.roadmap) {
        setRoadmap(res.data.roadmap);
      }
    } catch (err) {
      console.error('Failed to load roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    try {
      setGenerating(true);
      setShowRegenModal(false);

      // Smooth step progression animation
      for (let i = 0; i < generationSteps.length; i++) {
        setGenerationStep(i);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const res = await api.post('/roadmap/generate');
      if (res.data?.success && res.data.roadmap) {
        setRoadmap(res.data.roadmap);
      }
    } catch (err) {
      console.error('Failed to generate roadmap:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      setTogglingTaskId(taskId);
      const res = await api.patch(`/roadmap/task/${taskId}`);
      if (res.data?.success && res.data.roadmap) {
        setRoadmap(res.data.roadmap);
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    } finally {
      setTogglingTaskId(null);
    }
  };

  const targetRole =
    roadmap?.targetRole ||
    profile?.career?.targetRole ||
    profile?.targetRole ||
    'Full Stack Developer';

  return (
    <div className="min-h-screen bg-[#fafcff] flex flex-col">
      <TopHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* =========================================================
            HEADER & SPRINT METRICS
            ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-100">
                Actionable Milestones
              </span>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                Role: {targetRole}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 mt-2">
              4-Week Sprint to {targetRole}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Targeted weekly roadmap engineered around your identified skill gaps and verified project requirements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRegenModal(true)}
              className="text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Regenerate Sprint
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/learning')}
              className="text-xs font-semibold shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1.5" />
              Explore Learning Hub
            </Button>
          </div>
        </div>

        {/* =========================================================
            OVERALL SPRINT PROGRESS BAR & NEXT BEST STEP
            ========================================================= */}
        {roadmap && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Progress Card */}
            <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Overall Sprint Completion
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-extrabold font-display text-slate-900">
                    {roadmap.completedTasks}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    of {roadmap.totalTasks} Tasks Finished
                  </span>
                </div>
                <div className="w-48 bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
                  <div
                    className="bg-brand-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${roadmap.overallProgress}%` }}
                  />
                </div>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex flex-col items-center justify-center font-extrabold font-display text-base shrink-0 border border-brand-100">
                <span>{roadmap.overallProgress}%</span>
                <span className="text-[9px] font-medium text-brand-500 uppercase">Ready</span>
              </div>
            </div>

            {/* Next Best Step Card */}
            <div className="md:col-span-7 bg-gradient-to-r from-brand-600 to-indigo-600 p-5 rounded-2xl text-white shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-200">
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  Your Next Best Step
                </div>
                <h4 className="text-sm sm:text-base font-bold font-display text-white leading-snug">
                  {roadmap.nextBestStep}
                </h4>
                <p className="text-xs text-brand-100/90">
                  Focus on this single task to maintain steady weekly momentum.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const firstIncomplete = document.querySelector('[data-incomplete="true"]');
                  if (firstIncomplete) {
                    firstIncomplete.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 shrink-0 text-xs"
              >
                Focus Task →
              </Button>
            </div>
          </div>
        )}

        {/* =========================================================
            GENERATION OVERLAY ANIMATION
            ========================================================= */}
        {generating && (
          <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="w-12 h-12 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <div>
              <h3 className="text-base font-bold font-display text-slate-900">
                Generating Your Custom Roadmap
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {generationSteps[generationStep]}
              </p>
            </div>
          </div>
        )}

        {/* =========================================================
            VERTICAL TIMELINE SPRINT
            ========================================================= */}
        {!generating && roadmap && roadmap.weeks && (
          <div className="space-y-8 pt-2">
            {roadmap.weeks.map((week) => {
              const weekCompleted = week.tasks.filter((t) => t.completed).length;
              const weekTotal = week.tasks.length;
              const weekPct = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;
              const isWeekFullyFinished = weekCompleted === weekTotal;

              return (
                <div key={week.weekNumber} className="space-y-4">
                  {/* Week Header Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-100/80 p-3.5 rounded-2xl border border-slate-200/70">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isWeekFullyFinished
                            ? 'bg-emerald-600 text-white'
                            : 'bg-brand-600 text-white'
                        }`}
                      >
                        {isWeekFullyFinished ? '✓' : `W${week.weekNumber}`}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Week {week.weekNumber}: {week.title}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          {week.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className="text-xs font-semibold text-slate-600">
                        {weekCompleted} of {weekTotal} tasks
                      </span>
                      <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${weekPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tasks List for Week */}
                  <div className="grid grid-cols-1 gap-3.5 pl-2 sm:pl-4">
                    {week.tasks.map((task) => {
                      const isToggling = togglingTaskId === task.taskId;

                      return (
                        <Card
                          key={task.taskId}
                          data-incomplete={!task.completed}
                          className={`p-4 sm:p-5 border rounded-2xl transition-all duration-200 ${
                            task.completed
                              ? 'bg-emerald-50/40 border-emerald-200/80'
                              : 'bg-white border-slate-200/90 hover:border-brand-300 hover:shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            {/* Interactive Checkbox */}
                            <button
                              onClick={() => handleToggleTask(task.taskId)}
                              disabled={isToggling}
                              className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0 ${
                                task.completed
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'border-2 border-slate-300 hover:border-brand-500 bg-white'
                              }`}
                            >
                              <AnimatePresence>
                                {task.completed && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                  >
                                    <Check className="w-4 h-4 stroke-[3]" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </button>

                            {/* Task Content */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`text-sm font-bold ${
                                    task.completed
                                      ? 'text-slate-500 line-through'
                                      : 'text-slate-900'
                                  }`}
                                >
                                  {task.title}
                                </span>
                                <Badge
                                  variant={task.priority === 'High' ? 'danger' : 'brand'}
                                  size="sm"
                                >
                                  {task.skill}
                                </Badge>
                              </div>

                              <p className="text-xs text-slate-500 leading-relaxed">
                                {task.description}
                              </p>

                              <div className="flex flex-wrap items-center gap-4 pt-1.5 text-[11px] text-slate-400">
                                <span className="flex items-center gap-1 font-medium">
                                  <Clock className="w-3 h-3" />
                                  Est. {task.estimatedHours} Hours
                                </span>

                                <button
                                  onClick={() =>
                                    navigate(
                                      `/learning?skill=${encodeURIComponent(task.skill)}`
                                    )
                                  }
                                  className="text-brand-600 hover:text-brand-800 font-bold flex items-center gap-0.5 hover:underline"
                                >
                                  <BookOpen className="w-3 h-3" />
                                  Find {task.skill} Resources →
                                </button>
                              </div>
                            </div>

                            {/* Mark complete status button */}
                            <button
                              onClick={() => handleToggleTask(task.taskId)}
                              disabled={isToggling}
                              className={`hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                                task.completed
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-700'
                              }`}
                            >
                              {task.completed ? 'Completed ✓' : 'Mark Done'}
                            </button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* =========================================================
            EMPTY STATE: NO ROADMAP GENERATED YET
            ========================================================= */}

        {!generating && !roadmap && (
          <Card className="p-8 sm:p-12 text-center max-w-xl mx-auto border border-slate-200/90 bg-white shadow-soft space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-2xs">
              <Milestone className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-md">
                Sprint Not Initialized
              </span>
              <h3 className="text-xl font-bold font-display text-slate-900 mt-2">
                No Active 4-Week Sprint Generated
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                Generate your personalized 4-week roadmap sprint to sequence your missing skill gaps into weekly manageable tasks.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 max-w-md mx-auto text-left space-y-1">
              <span className="font-bold text-slate-800 block">Why this sprint matters:</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                • Target role: <strong className="text-slate-800">{targetRole}</strong>
                <br />• 4 structured weeks with weekly milestones and resource links.
                <br />• Automatically updates your career readiness score upon completion.
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleGenerateRoadmap}
                className="group"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate 4-Week Sprint Now
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </Card>
        )}


        {/* =========================================================
            CONFIRMATION MODAL: REGENERATE ROADMAP
            ========================================================= */}
        {showRegenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
            <div
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-display text-slate-900">
                Regenerate Career Roadmap?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your 4-week sprint will be freshly structured around your most recent career target and missing skill priorities. Existing progress will be reset.
              </p>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRegenModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleGenerateRoadmap}
                  className="text-xs font-bold bg-brand-600 hover:bg-brand-700"
                >
                  Yes, Regenerate Roadmap
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
