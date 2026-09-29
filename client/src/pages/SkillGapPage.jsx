import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Check,
  AlertCircle,
  ArrowRight,
  Milestone,
  RefreshCw,
  Target,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TopHeader } from '../components/common/TopHeader';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { AiLoadingAnimation } from '../components/common/AiLoadingAnimation';
import { normalizeSkillName, ROLE_SKILL_BENCHMARKS } from '../utils/skillNormalization';
import api from '../utils/api';

export const SkillGapPage = () => {
  const { profile: authProfile } = useAuth();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [userProfile, setUserProfile] = useState(authProfile || null);
  const [candidateProgress, setCandidateProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const [analysisRes, profileRes, progressRes] = await Promise.allSettled([
          api.get('/ai/career-analysis'),
          api.get('/profile'),
          api.get('/profile/candidate-progress'),
        ]);

        if (analysisRes.status === 'fulfilled' && analysisRes.value.data?.success && analysisRes.value.data.analysis) {
          setAnalysis(analysisRes.value.data.analysis);
        } else if (analysisRes.status === 'fulfilled' && analysisRes.value.data?.incomplete) {
          navigate('/onboarding');
        }

        if (profileRes.status === 'fulfilled' && profileRes.value.data?.success && profileRes.value.data.profile) {
          setUserProfile(profileRes.value.data.profile);
        }

        if (progressRes.status === 'fulfilled' && progressRes.value.data?.success && progressRes.value.data.progress) {
          setCandidateProgress(progressRes.value.data.progress);
        }
      } catch (err) {
        console.error('Error in SkillGapPage:', err);
        setError("Couldn't load skill gap analysis.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [navigate]);

  const activeProfile = userProfile || authProfile;
  const cp = candidateProgress;
  
  const primaryCareer = analysis?.careers?.[0];
  const targetRole = cp?.targetRole || primaryCareer?.role || activeProfile?.career?.targetRole || activeProfile?.targetRole || 'Full Stack Developer';
  
  const requiredSkills = primaryCareer?.requiredSkills || ROLE_SKILL_BENCHMARKS[targetRole] || ['React', 'Node.js', 'MongoDB', 'JavaScript', 'SQL', 'Docker', 'Testing'];

  const masteredSkills = cp?.skillAssessment?.masteredList || (activeProfile?.skills?.currentSkills || []).map((s) => normalizeSkillName(s));
  const normalizedMastered = masteredSkills.map((s) => s.toLowerCase());

  const readySkills = cp?.skillGap?.readyForEvaluation || (activeProfile?.skills?.readyForEvaluationSkills || []).map((s) => normalizeSkillName(s));
  const normalizedReady = readySkills.map((s) => s.toLowerCase());

  const learningSkills = cp?.skillGap?.learning || (activeProfile?.skills?.learningSkills || []).map((s) => normalizeSkillName(s));
  const normalizedLearning = learningSkills.map((s) => s.toLowerCase());

  // Filter missing skills from career analysis or target role benchmarks:
  // Exclude skills that are ALREADY mastered or completed/ready for evaluation
  const rawMissingSkills = cp?.skillGap?.missingSkills || primaryCareer?.missingSkills || [
    { skill: 'Docker', priority: 'High', reason: 'Essential for containerizing microservices and deployments.' },
    { skill: 'Testing', priority: 'Medium', reason: 'Required for writing reliable test suites in production.' },
    { skill: 'SQL', priority: 'Medium', reason: 'Fundamental for relational database queries and reporting.' },
  ];

  const activePriorityGaps = rawMissingSkills.filter(
    (m) => m.skill && !normalizedMastered.includes(normalizeSkillName(m.skill).toLowerCase()) && !normalizedReady.includes(normalizeSkillName(m.skill).toLowerCase())
  );

  const getSkillStatus = (skill) => {
    const sCanonical = normalizeSkillName(skill);
    const sLower = sCanonical.toLowerCase();
    if (normalizedMastered.includes(sLower)) {
      return { label: 'Mastered ✓', variant: 'success', color: 'emerald', icon: 'check' };
    }
    if (normalizedReady.includes(sLower)) {
      return { label: 'Ready for Re-evaluation 🟡', variant: 'warning', color: 'amber', icon: 'clock' };
    }
    if (normalizedLearning.includes(sLower)) {
      return { label: 'Learning 🔵', variant: 'info', color: 'indigo', icon: 'zap' };
    }
    return { label: 'Skill Gap !', variant: 'danger', color: 'rose', icon: 'alert' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafcff] flex flex-col">
        <TopHeader />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AiLoadingAnimation label="Diagnosing Your Technical Skill Gaps..." />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafcff] flex flex-col">
      <TopHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md">
            Skill Diagnostics
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mt-2">
            Know What You're Missing
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time competency benchmark against target role: <strong className="text-slate-900">{targetRole}</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Your Skills & Target Matrix */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="p-6 border border-slate-200/80 bg-white">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-brand-600" />
                  <h3 className="font-bold font-display text-slate-900 text-base">
                    Target Skill Matrix: {targetRole}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {requiredSkills.filter((r) => normalizedMastered.includes(r.toLowerCase())).length} of {requiredSkills.length} Mastered
                </span>
              </div>

              <div className="divide-y divide-slate-100 mt-3">
                {requiredSkills.map((skill, idx) => {
                  const status = getSkillStatus(skill);
                  return (
                    <div
                      key={idx}
                      className="py-3 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {status.icon === 'check' && (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {status.icon === 'clock' && (
                          <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">
                            🟡
                          </div>
                        )}
                        {status.icon === 'zap' && (
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                            <Zap className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {status.icon === 'alert' && (
                          <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold shrink-0">
                            !
                          </div>
                        )}
                        <span className="text-sm font-semibold text-slate-900">
                          {skill}
                        </span>
                      </div>

                      <Badge
                        variant={status.variant}
                        size="sm"
                      >
                        {status.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Your other acquired profile skills */}
            {masteredSkills.length > 0 && (
              <Card className="p-5 border border-slate-200/80 bg-slate-50/50">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Other Verified Skills in Your Profile:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {masteredSkills.map((s, i) => (
                    <span
                      key={i}
                      className="text-xs bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right: Priority Skills to Bridge */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6 border-2 border-brand-200 bg-gradient-to-br from-white via-white to-brand-50/40">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="font-bold font-display text-slate-900 text-base">
                  Top Priority Skills to Bridge
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-5">
                Closing these missing gaps will bring your candidate match to 95%+.
              </p>

              <div className="space-y-4">
                {activePriorityGaps.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">
                        {readySkills.length > 0 ? 'Ready for Validation!' : 'Zero Skill Gaps Detected!'}
                      </h4>
                      <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                        {readySkills.length > 0
                          ? `You completed roadmap tasks for ${readySkills.join(', ')}. Validate your mastery in a Mock Interview!`
                          : `You have mastered all core competencies required for ${targetRole}.`}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/interview')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    >
                      Take Mock Interview →
                    </Button>
                  </div>
                ) : (
                  activePriorityGaps.map((gap, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">
                          {idx + 1}. {gap.skill}
                        </h4>
                        <Badge
                          variant={gap.priority === 'High' ? 'danger' : 'warning'}
                          size="sm"
                        >
                          {gap.priority} Priority
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {gap.reason}
                      </p>
                      <div className="pt-2 flex items-center justify-between">
                        <button
                          onClick={() => navigate(`/learning?skill=${encodeURIComponent(gap.skill)}`)}
                          className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-500" />
                          Find Courses →
                        </button>

                        <button
                          onClick={() => navigate('/roadmap')}
                          className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-1"
                        >
                          Roadmap Sprint <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => navigate('/roadmap')}
                >
                  <Milestone className="w-4 h-4 mr-2" />
                  View 4-Week Sprint
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/learning')}
                >
                  <Zap className="w-4 h-4 mr-2 text-brand-600" />
                  Learning Hub
                </Button>
              </div>

            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

