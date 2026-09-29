import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Zap,
  Target,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TopHeader } from '../components/common/TopHeader';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { AiLoadingAnimation } from '../components/common/AiLoadingAnimation';
import api from '../utils/api';

export const CareerPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isIncomplete, setIsIncomplete] = useState(false);

  // Fetch or retrieve existing career analysis
  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsIncomplete(false);

      const res = await api.get('/ai/career-analysis');
      if (res.data?.incomplete) {
        const isUserOnboarded = user?.isOnboarded || !!profile?.career?.targetRole || !!profile?.targetRole;
        if (isUserOnboarded) {
          const refreshRes = await api.post('/ai/career-analysis');
          if (refreshRes.data?.success && refreshRes.data.analysis) {
            setAnalysis(refreshRes.data.analysis);
            setIsIncomplete(false);
            return;
          }
        }
        setIsIncomplete(true);
      } else if (res.data?.success && res.data.analysis) {
        setAnalysis(res.data.analysis);
      } else {
        const isUserOnboarded = user?.isOnboarded || !!profile?.career?.targetRole || !!profile?.targetRole;
        if (isUserOnboarded) {
          const refreshRes = await api.post('/ai/career-analysis');
          if (refreshRes.data?.success && refreshRes.data.analysis) {
            setAnalysis(refreshRes.data.analysis);
            setIsIncomplete(false);
            return;
          }
        }
        setError(res.data?.message || "Career analysis couldn't be completed right now.");
      }
    } catch (err) {
      console.error('Fetch career analysis error:', err);
      const isUserOnboarded = user?.isOnboarded || !!profile?.career?.targetRole || !!profile?.targetRole;
      if (isUserOnboarded) {
        try {
          const refreshRes = await api.post('/ai/career-analysis');
          if (refreshRes.data?.success && refreshRes.data.analysis) {
            setAnalysis(refreshRes.data.analysis);
            setIsIncomplete(false);
            return;
          }
        } catch (_) {}
      }
      setError("Career analysis couldn't be completed right now.");
    } finally {
      setLoading(false);
    }
  };

  // Refresh analysis explicitly
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await api.post('/ai/career-analysis');
      if (res.data?.success && res.data.analysis) {
        setAnalysis(res.data.analysis);
        setIsIncomplete(false);
      } else {
        setError(res.data?.message || "Career analysis couldn't be completed right now.");
      }
    } catch (err) {
      console.error('Refresh career analysis error:', err);
      setError("Career analysis couldn't be completed right now.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const primaryCareer = analysis?.careers?.[0];
  const alternativeCareers = analysis?.careers?.slice(1, 3) || [];

  return (
    <div className="min-h-screen bg-[#fafcff] flex flex-col">
      <TopHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Title & Refresh Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md">
              Career Direction
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mt-2">
              Your Recommended Career Pathway
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Personalized career guidance derived strictly from your verified profile & skills.
            </p>
          </div>

          {!isIncomplete && !error && !loading && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              isLoading={refreshing}
              className="self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Analysis
            </Button>
          )}
        </div>

        {/* LOADING STATE */}
        {(loading || refreshing) && (
          <AiLoadingAnimation label={refreshing ? 'Refreshing AI Career Intelligence...' : 'Analyzing Your Career Pathway...'} />
        )}

        {/* INCOMPLETE PROFILE STATE */}
        {!loading && !refreshing && isIncomplete && (
          <Card className="p-8 text-center max-w-lg mx-auto border border-amber-200 bg-amber-50/40">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-900 mb-1">
              Complete Your Profile
            </h3>
            <p className="text-xs text-slate-600 mb-6">
              Complete your profile to unlock your personalized AI career analysis and skill gap diagnosis.
            </p>
            <Button variant="primary" onClick={() => navigate('/onboarding')}>
              Complete Profile
            </Button>
          </Card>
        )}

        {/* ERROR STATE */}
        {!loading && !refreshing && error && (
          <Card className="p-8 text-center max-w-lg mx-auto border border-rose-200 bg-rose-50/40">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-900 mb-1">
              Analysis Notice
            </h3>
            <p className="text-xs text-slate-600 mb-6">{error}</p>
            <Button variant="primary" onClick={fetchAnalysis}>
              Try Again
            </Button>
          </Card>
        )}

        {/* MAIN ANALYSIS CONTENT */}
        {!loading && !refreshing && !isIncomplete && !error && primaryCareer && (
          <>
            {/* PRIMARY RECOMMENDATION CARD */}
            <Card className="p-6 sm:p-8 bg-gradient-to-br from-white via-white to-blue-50/40 border-2 border-brand-200 shadow-premium">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="space-y-5 flex-1">
                  {/* Role Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-brand-500/20">
                      <Compass className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="brand" size="sm">Top AI Recommendation</Badge>
                        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" /> High Industry Demand
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 mt-0.5">
                        {primaryCareer.role}
                      </h3>
                    </div>
                  </div>

                  {/* 1. WHY THIS MATCHES YOU */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Why This Matches You:
                    </span>
                    <div className="space-y-1.5">
                      {primaryCareer.whyItMatches?.map((reason, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. SKILLS TO BUILD */}
                  {primaryCareer.missingSkills?.length > 0 && (
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Skills to Build:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {primaryCareer.missingSkills.map((gap, i) => (
                          <div
                            key={i}
                            className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs"
                          >
                            <span className="font-bold text-slate-900">{gap.skill}</span>
                            <Badge
                              variant={gap.priority === 'High' ? 'danger' : 'warning'}
                              size="sm"
                            >
                              {gap.priority} Priority
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. YOUR NEXT BEST STEP */}
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      Your Next Best Step:
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      "{primaryCareer.nextStep}"
                    </p>
                  </div>
                </div>

                {/* Score Box & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shrink-0 min-w-[200px]">
                  <div className="text-center">
                    <span className="text-4xl sm:text-5xl font-extrabold font-display text-brand-600">
                      {primaryCareer.matchPercentage}%
                    </span>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                      Profile Match
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => navigate('/skills')}
                    className="w-full whitespace-nowrap"
                  >
                    View Skill Gaps
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* OTHER CAREER PATHS */}
            {alternativeCareers.length > 0 && (
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-4">
                  Alternative Career Paths
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {alternativeCareers.map((alt, idx) => (
                    <Card key={idx} hoverEffect className="p-6 border border-slate-200/80 bg-white space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-indigo-600" />
                          <h4 className="font-bold font-display text-slate-900 text-base">
                            {alt.role}
                          </h4>
                        </div>
                        <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200/60">
                          {alt.matchPercentage}% Match
                        </span>
                      </div>

                      <div className="space-y-1">
                        {alt.whyItMatches?.slice(0, 2).map((w, i) => (
                          <p key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                            <span className="text-slate-400">•</span>
                            <span>{w}</span>
                          </p>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">
                          Missing: {alt.missingSkills?.map((m) => m.skill).join(', ') || 'None'}
                        </span>
                        <button
                          onClick={() => navigate('/skills')}
                          className="text-brand-600 font-semibold hover:underline"
                        >
                          Details →
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
