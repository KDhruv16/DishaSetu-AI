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
import api from '../utils/api';

export const SkillGapPage = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const res = await api.get('/ai/career-analysis');
        if (res.data?.success && res.data.analysis) {
          setAnalysis(res.data.analysis);
        } else if (res.data?.incomplete) {
          navigate('/onboarding');
        } else {
          setError("Couldn't load skill gap analysis.");
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

  const primaryCareer = analysis?.careers?.[0];
  const targetRole = primaryCareer?.role || profile?.career?.targetRole || 'Full Stack Developer';
  const requiredSkills = primaryCareer?.requiredSkills || ['React', 'Node.js', 'MongoDB', 'JavaScript', 'SQL', 'Docker', 'Testing'];
  const missingSkills = primaryCareer?.missingSkills || [
    { skill: 'Docker', priority: 'High', reason: 'Essential for containerizing microservices and deployments.' },
    { skill: 'Testing', priority: 'Medium', reason: 'Required for writing reliable test suites in production.' },
    { skill: 'SQL', priority: 'Medium', reason: 'Fundamental for relational database queries and reporting.' },
  ];

  const userSkills = (profile?.skills?.currentSkills || []).map((s) => s.trim());
  const normalizedUserSkills = userSkills.map((s) => s.toLowerCase());

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
                  {requiredSkills.filter((r) => normalizedUserSkills.includes(r.toLowerCase())).length} of {requiredSkills.length} Mastered
                </span>
              </div>

              <div className="divide-y divide-slate-100 mt-3">
                {requiredSkills.map((skill, idx) => {
                  const isAcquired = normalizedUserSkills.includes(skill.toLowerCase());
                  return (
                    <div
                      key={idx}
                      className="py-3 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isAcquired ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold shrink-0">
                            !
                          </div>
                        )}
                        <span className="text-sm font-semibold text-slate-900">
                          {skill}
                        </span>
                      </div>

                      <Badge
                        variant={isAcquired ? 'success' : 'danger'}
                        size="sm"
                      >
                        {isAcquired ? 'Mastered ✓' : 'Skill Gap !'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Your other acquired profile skills */}
            {userSkills.length > 0 && (
              <Card className="p-5 border border-slate-200/80 bg-slate-50/50">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Other Verified Skills in Your Profile:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {userSkills.map((s, i) => (
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
                {missingSkills.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">
                        Zero Skill Gaps Detected!
                      </h4>
                      <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                        You have mastered all core competencies required for <strong>{targetRole}</strong>.
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/interview')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Take Mock Interview →
                    </Button>
                  </div>
                ) : (
                  missingSkills.map((gap, idx) => (
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
