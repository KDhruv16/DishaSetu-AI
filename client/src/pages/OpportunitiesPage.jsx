import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { TopHeader } from '../components/common/TopHeader';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Briefcase,
  MapPin,
  Building2,
  ExternalLink,
  Sparkles,
  Landmark,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Filter,
  Layers,
  ShieldCheck,
  Search,
  X,
  ArrowRight,
  HelpCircle,
  FileText,
  Zap,
  Check,
  Award,
  BookOpen,
  MessageSquareCode,
  TrendingUp,
} from 'lucide-react';

export const OpportunitiesPage = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const [opportunities, setOpportunities] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [modalIntelligence, setModalIntelligence] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [candidateProgress, setCandidateProgress] = useState(null);

  useEffect(() => {
    fetchOpportunities();
    fetchRecommended();
    fetchCandidateProgress();
  }, [profile]);

  const fetchCandidateProgress = async () => {
    try {
      const res = await api.get('/profile/candidate-progress');
      if (res.data?.success) {
        setCandidateProgress(res.data.progress);
      }
    } catch (err) {
      console.error('Failed to load candidate progress:', err);
    }
  };

  const isProfileComplete = candidateProgress
    ? candidateProgress.profile?.status === 'COMPLETED'
    : Boolean(user?.isOnboarded);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const res = await api.get('/opportunities');
      if (res.data?.success) {
        setOpportunities(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommended = async () => {
    try {
      const res = await api.get('/opportunities/recommended');
      if (res.data?.success) {
        setRecommended(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load recommended opportunities:', err);
    }
  };

  const openOpportunityModal = async (op) => {
    setSelectedOpportunity(op);
    setModalLoading(true);
    setModalIntelligence(null);
    try {
      const res = await api.get(`/opportunities/${op._id}`);
      if (res.data?.success) {
        setModalIntelligence(res.data.data || res.data);
      }
    } catch (err) {
      console.error('Failed to load opportunity detail intelligence:', err);
    } finally {
      setModalLoading(false);
    }
  };

  // Filter logic
  const filteredList = opportunities.filter((op) => {
    // Tab filter
    if (activeTab === 'Jobs' && op.type !== 'Job') return false;
    if (activeTab === 'Internships' && op.type !== 'Internship') return false;
    if (activeTab === 'Government' && !op.isGovernment && op.type !== 'Government') return false;
    if (activeTab === 'Apprenticeships' && op.type !== 'Apprenticeship') return false;

    // Location filter
    if (selectedLocation !== 'All') {
      if (!op.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory !== 'All') {
      if (op.category !== selectedCategory) {
        return false;
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = op.title.toLowerCase().includes(q);
      const matchOrg = op.organization.toLowerCase().includes(q);
      const matchSkill = (op.skills || []).some((s) => s.toLowerCase().includes(q));
      if (!matchTitle && !matchOrg && !matchSkill) return false;
    }

    return true;
  });

  const getMatchBadgeColor = (pct) => {
    if (pct >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (pct >= 60) return 'bg-blue-50 text-brand-700 border-blue-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const activeOp = modalIntelligence || selectedOpportunity;

  return (
    <div className="min-h-screen bg-[#fafcff] flex flex-col">
      <TopHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* =========================================================
            HEADER SECTION
            ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-100">
                Application Intelligence
              </span>
              {profile?.targetRole && (
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                  Target: <strong className="text-slate-800">{profile.targetRole}</strong>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 mt-2">
              Opportunities & Match Intelligence
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Understand why an opportunity matches you, what skills are missing, your application readiness, and what to prepare before applying.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/career')}
              className="text-xs text-slate-700"
            >
              Update Career Target
            </Button>
          </div>
        </div>

        {/* =========================================================
            INCOMPLETE PROFILE BANNER (IF APPLICABLE)
            ========================================================= */}
        {!isProfileComplete && (
          <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Complete your profile for deterministic match scoring
                </h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  We calculate deterministic match scores against your target role, degree, and verified technical skills.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/onboarding')}
              className="shrink-0 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white border-none shadow-xs"
            >
              Complete Profile →
            </Button>
          </div>
        )}

        {/* =========================================================
            SECTION 1: RECOMMENDED FOR YOU (TOP 4 MATCHES)
            ========================================================= */}
        {recommended.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-display text-slate-900">
                    Recommended For You
                  </h2>
                  <p className="text-xs text-slate-500">
                    Highest alignment with your target role and technical skills.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                Top {recommended.length} Matches
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {recommended.map((op) => (
                <Card
                  key={op._id}
                  hoverEffect
                  onClick={() => openOpportunityModal(op)}
                  className="p-5 border border-slate-200/90 bg-white rounded-2xl flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all duration-200 hover:border-brand-300 hover:shadow-md"
                >
                  {/* Top Bar inside Card */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            op.isGovernment
                              ? 'purple'
                              : op.type === 'Job'
                              ? 'brand'
                              : 'success'
                          }
                          size="sm"
                        >
                          {op.isGovernment ? 'Government Initiative' : op.type}
                        </Badge>
                        <span className="text-xs text-slate-500 font-medium">
                          {op.workMode}
                        </span>
                      </div>

                      {/* Deterministic Match Badge */}
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 ${getMatchBadgeColor(
                          op.matchPercentage
                        )}`}
                      >
                        <Sparkles className="w-3 h-3" />
                        {op.matchPercentage}% Match
                      </span>
                    </div>

                    <h3 className="text-base font-bold font-display text-slate-900 group-hover:text-brand-600 transition-colors">
                      {op.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-600 mt-1 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {op.organization}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {op.location}
                      </span>
                      <span className="font-semibold text-slate-700">
                        {op.stipendOrSalary}
                      </span>
                    </div>

                    {/* Why This Matches You Callout */}
                    <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                      <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1">
                        <span className="text-brand-600 font-bold">Why this matches:</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {op.whyItMatches}
                      </p>

                      {/* Matched vs Missing Skills */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/50">
                        {op.matchedSkills && op.matchedSkills.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1">
                            {op.matchedSkills.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-0.5 text-[11px] font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        {op.missingSkills && op.missingSkills.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1">
                            {op.missingSkills.slice(0, 2).map((skill, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-0.5 text-[11px] font-medium text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md"
                              >
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {op.deadline}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openOpportunityModal(op);
                      }}
                      className="text-xs font-semibold"
                    >
                      View Match & Readiness
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            SECTION 2: DEDICATED GOVERNMENT & SKILL SCHEMES SPOTLIGHT
            ========================================================= */}
        <div className="bg-gradient-to-r from-purple-900/5 via-indigo-900/5 to-blue-900/5 rounded-3xl p-6 sm:p-7 border border-indigo-100/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold font-display text-slate-900">
                    Government & State Skill Opportunities
                  </h3>
                  <Badge variant="purple" size="sm">
                    MP State & National
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Official state technology missions, subsidized apprenticeships, and government skill pathways.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveTab('Government');
                window.scrollTo({ top: 500, behavior: 'smooth' });
              }}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 transition-colors self-start sm:self-auto"
            >
              Browse All Government ({opportunities.filter((o) => o.isGovernment).length}) →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {opportunities
              .filter((o) => o.isGovernment)
              .slice(0, 3)
              .map((gov) => (
                <div
                  key={gov._id}
                  onClick={() => openOpportunityModal(gov)}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                        {gov.category}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {gov.matchPercentage}% Match
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-2">
                      {gov.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {gov.organization}
                    </p>
                    <div className="mt-2 text-xs font-medium text-emerald-700 bg-emerald-50/70 px-2 py-1 rounded-md">
                      {gov.stipendOrSalary}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      {gov.location}
                    </span>
                    <span className="font-bold text-purple-600 flex items-center gap-0.5">
                      View <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* =========================================================
            SECTION 3: BROWSE ALL OPPORTUNITIES & FILTER BAR
            ========================================================= */}
        <div className="space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900">
                Explore All Opportunities
              </h2>
              <p className="text-xs text-slate-500">
                Showing {filteredList.length} verified openings for students and fresh graduates.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
              {['All', 'Jobs', 'Internships', 'Government', 'Apprenticeships'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Secondary Minimal Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by role, company, or required skill (e.g. React, Python)..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-brand-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-brand-500 text-slate-700 font-medium"
              >
                <option value="All">All Locations</option>
                <option value="Bhopal">Bhopal, MP</option>
                <option value="Indore">Indore, MP</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-brand-500 text-slate-700 font-medium"
              >
                <option value="All">All Categories</option>
                <option value="Technology">Technology & Software</option>
                <option value="Data">Data & Analytics</option>
                <option value="Public Sector">Public Sector & MP Govt</option>
                <option value="Skill Development">Skill Development & NAPS</option>
              </select>
            </div>
          </div>

          {/* Opportunities List */}
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">
                Matching and ranking curated opportunities for you...
              </p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                No opportunities match your filter
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try resetting your search query or selecting a different location or category.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveTab('All');
                  setSelectedLocation('All');
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="text-xs"
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredList.map((op) => (
                <Card
                  key={op._id}
                  hoverEffect
                  onClick={() => openOpportunityModal(op)}
                  className="p-5 border border-slate-200/90 bg-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 cursor-pointer hover:border-brand-300"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          op.isGovernment
                            ? 'purple'
                            : op.type === 'Job'
                            ? 'brand'
                            : 'success'
                        }
                        size="sm"
                      >
                        {op.isGovernment ? 'Govt Scheme' : op.type}
                      </Badge>
                      <span className="text-xs text-slate-500 font-medium">
                        {op.category}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getMatchBadgeColor(
                          op.matchPercentage
                        )}`}
                      >
                        {op.matchPercentage}% Match
                      </span>
                    </div>

                    <h3 className="text-base font-bold font-display text-slate-900 hover:text-brand-600 transition-colors">
                      {op.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {op.organization}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {op.location} ({op.workMode})
                      </span>
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {op.stipendOrSalary}
                      </span>
                    </div>

                    {/* Skill Tags */}
                    <div className="pt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">
                        Skills:
                      </span>
                      {op.skills.map((s, idx) => {
                        const isStudentSkill = (profile?.skills?.currentSkills || profile?.skills || []).some(
                          (sk) => String(sk).toLowerCase() === s.toLowerCase()
                        );
                        return (
                          <span
                            key={idx}
                            className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                              isStudentSkill
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isStudentSkill ? `✓ ${s}` : s}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex sm:flex-col items-end justify-center gap-2">
                    <span className="text-[11px] text-slate-400 hidden sm:block">
                      Deadline: {op.deadline}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openOpportunityModal(op);
                      }}
                      className="whitespace-nowrap text-xs font-semibold text-brand-600 border-brand-200 hover:bg-brand-50"
                    >
                      View Details & Readiness
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* =========================================================
            MODAL: COMPREHENSIVE OPPORTUNITY & APPLICATION INTELLIGENCE
            ========================================================= */}
        {selectedOpportunity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
            <div
              className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge
                      variant={
                        activeOp.isGovernment
                          ? 'purple'
                          : activeOp.type === 'Job'
                          ? 'brand'
                          : 'success'
                      }
                      size="sm"
                    >
                      {activeOp.isGovernment ? 'Government Portal' : activeOp.type}
                    </Badge>
                    <span className="text-xs text-slate-500 font-medium">
                      {activeOp.category}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getMatchBadgeColor(
                        activeOp.matchPercentage || activeOp.overallMatch || 50
                      )}`}
                    >
                      {activeOp.matchPercentage || activeOp.overallMatch || 50}% Profile Match
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                    {activeOp.title}
                  </h2>
                  <p className="text-sm font-semibold text-brand-600 mt-1 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    {activeOp.organization}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedOpportunity(null);
                    setModalIntelligence(null);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 4-Factor Match Breakdown Card */}
              {activeOp.breakdown && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                      4-Factor Deterministic Match Breakdown
                    </span>
                    <span className="text-xs font-extrabold text-brand-700">
                      Overall: {activeOp.matchPercentage}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Skills (60%)</span>
                        <span className="font-bold text-slate-800">{activeOp.breakdown.skillScore}/60</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1">
                        <div className="bg-brand-600 h-1 rounded-full" style={{ width: `${(activeOp.breakdown.skillScore / 60) * 100}%` }} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Role Match (20%)</span>
                        <span className="font-bold text-slate-800">{activeOp.breakdown.roleScore}/20</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1">
                        <div className="bg-indigo-600 h-1 rounded-full" style={{ width: `${(activeOp.breakdown.roleScore / 20) * 100}%` }} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Education (10%)</span>
                        <span className="font-bold text-slate-800">{activeOp.breakdown.eduScore}/10</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1">
                        <div className="bg-emerald-600 h-1 rounded-full" style={{ width: `${(activeOp.breakdown.eduScore / 10) * 100}%` }} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Experience (10%)</span>
                        <span className="font-bold text-slate-800">{activeOp.breakdown.expScore}/10</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1">
                        <div className="bg-purple-600 h-1 rounded-full" style={{ width: `${(activeOp.breakdown.expScore / 10) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Match Rationale Card */}
              <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-100 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-brand-900 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  Why this matches you:
                </div>
                <div className="space-y-1.5 text-xs text-brand-950">
                  {activeOp.reasons && activeOp.reasons.length > 0 ? (
                    activeOp.reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))
                  ) : (
                    <p>{activeOp.whyItMatches}</p>
                  )}
                </div>

                {/* Skills breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-brand-100">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 uppercase block mb-1">
                      ✓ Your Matched Skills ({activeOp.matchedSkills?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {activeOp.matchedSkills?.length > 0 ? (
                        activeOp.matchedSkills.map((s, i) => (
                          <span
                            key={i}
                            className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-medium"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">
                          No exact skill overlap found
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-amber-800 uppercase block mb-1">
                      ⚠ Skills To Improve ({activeOp.missingSkills?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {activeOp.missingSkills?.length > 0 ? (
                        activeOp.missingSkills.map((s, i) => (
                          <span
                            key={i}
                            className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-medium"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-medium">
                          You meet all required skills!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Readiness Section */}
              {activeOp.applicationReadiness && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 block">
                        Opportunity Readiness Intelligence
                      </span>
                      <h4 className="text-base font-bold font-display text-white mt-0.5">
                        Application Readiness: {activeOp.applicationReadiness.status}
                      </h4>
                    </div>
                    <Badge variant={activeOp.applicationReadiness.score >= 70 ? 'success' : 'warning'} size="sm">
                      {activeOp.applicationReadiness.score}% Ready
                    </Badge>
                  </div>

                  {/* 4 Factor Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {Object.entries(activeOp.applicationReadiness.factors || {}).map(([key, f]) => (
                      <div key={key} className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                        <span className="text-[10px] text-slate-400 block truncate">{f.label}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`w-2 h-2 rounded-full ${f.met ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          <span className="font-bold text-white truncate text-[11px]">{f.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Preparation Steps */}
                  {activeOp.preparationSteps?.length > 0 && (
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        Recommended Preparation Before Applying:
                      </span>
                      <div className="space-y-1.5">
                        {activeOp.preparationSteps.map((step, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedOpportunity(null);
                              navigate(step.route);
                            }}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Badge variant={step.priority === 'High' ? 'danger' : 'warning'} size="sm">
                                {step.priority}
                              </Badge>
                              <span className="font-semibold text-slate-200">{step.text}</span>
                            </div>
                            <span className="text-brand-300 text-[11px] font-bold whitespace-nowrap hover:underline">
                              {step.action} →
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Key Opportunity Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Location</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">
                    {activeOp.location}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Work Mode</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">
                    {activeOp.workMode}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Compensation / Stipend</span>
                  <span className="font-bold text-emerald-700 mt-0.5 block">
                    {activeOp.stipendOrSalary}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Experience Level</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">
                    {activeOp.experience}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Application Deadline</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">
                    {activeOp.deadline}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Source / Portal</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">
                    {activeOp.source}
                  </span>
                </div>
              </div>

              {/* Description & Eligibility */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Opportunity Description
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {activeOp.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Eligibility & Qualification
                  </h4>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                    <p>
                      <strong>Eligible Degrees:</strong> {activeOp.qualification}
                    </p>
                    <p>
                      <strong>Batch / Criteria:</strong> {activeOp.eligibility}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer CTA */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedOpportunity(null);
                    setModalIntelligence(null);
                  }}
                  className="w-full sm:w-auto text-xs text-slate-600"
                >
                  Close
                </Button>

                <a
                  href={activeOp.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-xs"
                >
                  {activeOp.isGovernment
                    ? 'Visit Official Government Portal'
                    : 'View & Apply on Official Source'}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

