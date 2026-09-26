import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { TopHeader } from '../components/common/TopHeader';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  BookOpen,
  Sparkles,
  Award,
  ExternalLink,
  Search,
  Filter,
  ArrowLeft,
  Clock,
  CheckCircle2,
  CheckCircle,
  GraduationCap,
  Layers,
  Milestone,
} from 'lucide-react';

export const LearningPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const skillParam = searchParams.get('skill') || 'All';

  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('Recommended');
  const [courses, setCourses] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState(skillParam);
  const [selectedProvider, setSelectedProvider] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (skillParam && skillParam !== 'All') {
      setSelectedSkill(skillParam);
      setActiveTab('Courses');
    }
  }, [skillParam]);

  useEffect(() => {
    fetchCourses();
    fetchRecommended();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/courses');
      if (res.data?.success) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommended = async () => {
    try {
      const res = await api.get('/courses/recommended');
      if (res.data?.success) {
        setRecommended(res.data.courses);
      }
    } catch (err) {
      console.error('Failed to load recommended courses:', err);
    }
  };

  // Distinct list of available skills
  const availableSkills = ['All', 'Docker', 'Testing', 'SQL', 'Node.js', 'Python', 'Power BI', 'Git', 'Cloud'];

  // Filter list
  const filteredList = (activeTab === 'Recommended' ? recommended : courses).filter((item) => {
    // Tab filtering
    if (activeTab === 'Certifications' && !item.certificateAvailable) return false;
    if (activeTab === 'Courses' && item.type !== 'Course' && item.type !== 'Track') {
      // allow tutorial if chosen
    }

    // Skill filtering
    if (selectedSkill !== 'All') {
      if (!item.skill.toLowerCase().includes(selectedSkill.toLowerCase())) {
        return false;
      }
    }

    // Provider filtering
    if (selectedProvider !== 'All') {
      if (item.provider !== selectedProvider) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSkill = item.skill.toLowerCase().includes(q);
      const matchProvider = item.provider.toLowerCase().includes(q);
      if (!matchTitle && !matchSkill && !matchProvider) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#fafcff] flex flex-col">
      <TopHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* =========================================================
            HEADER
            ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-100">
                Learning & Certifications Hub
              </span>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                Verified Curated Resources
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 mt-2">
              Learn What You're Missing
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Curated open courses, government certifications, and hands-on tracks mapped directly to your missing skill gaps.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/roadmap')}
              className="text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Milestone className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
              Back to Career Sprint
            </Button>
          </div>
        </div>

        {/* =========================================================
            FILTER TABS & SEARCH
            ========================================================= */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Primary Tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              {['Recommended', 'Courses', 'Certifications'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab === 'Recommended' && <Sparkles className="w-3.5 h-3.5 inline mr-1" />}
                  {tab === 'Certifications' && <Award className="w-3.5 h-3.5 inline mr-1" />}
                  {tab}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, skills, or providers..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-hidden focus:border-brand-500 text-slate-800 placeholder-slate-400 shadow-2xs"
              />
            </div>
          </div>

          {/* Skill Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Skill Gap:
            </span>
            {availableSkills.map((skill) => (
              <button
                key={skill}
                onClick={() => setSelectedSkill(skill)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSkill === skill
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* =========================================================
            COURSES GRID
            ========================================================= */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">
              Loading curated learning pathways...
            </p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No learning resources found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try resetting your search query or choosing "All" skills above.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedSkill('All');
                setSelectedProvider('All');
                setSearchQuery('');
              }}
              className="text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredList.map((c) => (
              <Card
                key={c._id}
                hoverEffect
                className="p-5 border border-slate-200/90 bg-white rounded-2xl flex flex-col justify-between hover:border-brand-300 transition-all duration-200"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge
                      variant={
                        c.provider === 'NPTEL' || c.provider === 'SWAYAM'
                          ? 'purple'
                          : c.provider === 'Skill India'
                          ? 'success'
                          : 'brand'
                      }
                      size="sm"
                    >
                      {c.provider}
                    </Badge>

                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                      {c.isFree && (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                          Free
                        </span>
                      )}
                      {c.certificateAvailable && (
                        <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                          <Award className="w-3 h-3" /> Certified
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold font-display text-slate-900 line-clamp-2">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>

                  {/* Why recommended rationale */}
                  {c.whyRecommended && (
                    <div className="mt-3 p-2.5 rounded-xl bg-brand-50/70 border border-brand-100 text-[11px] text-brand-900 leading-relaxed">
                      <span className="font-bold flex items-center gap-1 mb-0.5">
                        <Sparkles className="w-3 h-3 text-brand-600" />
                        Why Recommended:
                      </span>
                      {c.whyRecommended}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {c.duration}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">
                      Skill: {c.skill}
                    </span>
                    <span>•</span>
                    <span>{c.level}</span>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {c.source}
                  </span>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition-all"
                  >
                    Start Learning
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
