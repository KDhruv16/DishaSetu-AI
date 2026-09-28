import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Compass,
  Cpu,
  HelpCircle,
  BookOpen,
  Map,
  TrendingUp,
  ArrowRight,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  GraduationCap,
} from 'lucide-react';
import api from '../../utils/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/stats');
      if (res.data?.success) {
        setData(res.data);
      } else {
        setError('Failed to load dashboard metrics.');
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError(err.response?.data?.message || 'Failed to connect to administrative stats API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading master admin metrics from database..." />;
  }

  const stats = data?.stats || {};
  const recentCandidates = data?.recentCandidates || [];

  const statCards = [
    { title: 'Total Candidates', value: stats.totalCandidates ?? 0, icon: Users, color: 'from-blue-600 to-indigo-600', link: '/admin/users' },
    { title: 'Active Candidates', value: stats.activeCandidates ?? 0, icon: ShieldCheck, color: 'from-emerald-600 to-teal-600', link: '/admin/users' },
    { title: 'Target Roles', value: stats.totalRoles ?? 0, icon: Compass, color: 'from-amber-500 to-orange-600', link: '/admin/roles' },
    { title: 'Skills Taxonomy', value: stats.totalSkills ?? 0, icon: Cpu, color: 'from-purple-600 to-pink-600', link: '/admin/skills' },
    { title: 'Interview Questions', value: stats.totalQuestions ?? 0, icon: HelpCircle, color: 'from-rose-500 to-red-600', link: '/admin/questions' },
    { title: 'Learning Resources', value: stats.totalLearning ?? 0, icon: BookOpen, color: 'from-cyan-600 to-blue-600', link: '/admin/learning' },
    { title: 'Roadmap Templates', value: stats.totalRoadmaps ?? 0, icon: Map, color: 'from-indigo-600 to-purple-600', link: '/admin/roadmaps' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200/60">
              Administrative Control
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Database Connected
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight">
            System Overview & Master Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time management for degrees, target roles, skill benchmarks, and AI evaluation question banks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/questions"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm shadow-brand-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </Link>
          <Link
            to="/admin/roles"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200/80 shadow-2xs transition-all"
          >
            <Compass className="w-4 h-4 text-slate-500" />
            <span>Manage Roles</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span className="font-medium">{error}</span>
          </div>
          <button
            onClick={fetchStats}
            className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Real Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-300 hover:shadow-sm transition-all hover:translate-y-[-2px] group block space-y-3 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-sm`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 transition-colors" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
                  {card.value}
                </p>
                <p className="text-xs font-semibold text-slate-500 mt-0.5 truncate">{card.title}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout: Quick Actions & Recent Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Management Shortcuts */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-display">
              <Layers className="w-4 h-4 text-brand-600" />
              Quick Actions
            </h3>
          </div>

          <div className="space-y-2">
            {[
              { title: 'Education Degrees', desc: 'Manage degrees and specializations', link: '/admin/education', icon: GraduationCap },
              { title: 'Target Roles', desc: 'Add new job roles for career mapping', link: '/admin/roles', icon: Compass },
              { title: 'Skill Taxonomies', desc: 'Create canonical skills', link: '/admin/skills', icon: Cpu },
              { title: 'Role-Skill Benchmarks', desc: 'Configure required skills per role', link: '/admin/role-skills', icon: Layers },
              { title: 'Interview Questions', desc: 'Add questions and evaluation rubrics', link: '/admin/questions', icon: HelpCircle },
              { title: 'Learning Content', desc: 'Add curated courses and tutorials', link: '/admin/learning', icon: BookOpen },
            ].map((action, i) => {
              const ActionIcon = action.icon;
              return (
                <Link
                  key={i}
                  to={action.link}
                  className="p-3 rounded-xl bg-slate-50/60 hover:bg-brand-50/60 border border-slate-200/60 hover:border-brand-200 flex items-center justify-between text-xs font-medium text-slate-700 hover:text-brand-900 transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ActionIcon className="w-4 h-4 text-brand-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 group-hover:text-brand-700 truncate">{action.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">{action.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Registered Candidates */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-display">
              <Users className="w-4 h-4 text-brand-600" />
              Recent Candidate Registrations
            </h3>
            <Link to="/admin/users" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px]">
                  <th className="py-3 px-3.5">Candidate</th>
                  <th className="py-3 px-3.5">Email</th>
                  <th className="py-3 px-3.5">Onboarded</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentCandidates.length > 0 ? (
                  recentCandidates.map((cand) => (
                    <tr key={cand._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-3.5 text-slate-900 font-semibold">{cand.name}</td>
                      <td className="py-3.5 px-3.5 text-slate-500">{cand.email}</td>
                      <td className="py-3.5 px-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cand.isOnboarded ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-slate-100 text-slate-600'}`}>
                          {cand.isOnboarded ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cand.isActive !== false ? 'bg-teal-50 text-teal-700 border border-teal-200/60' : 'bg-rose-50 text-rose-700 border border-rose-200/60'}`}>
                          {cand.isActive !== false ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 text-right text-slate-400 text-[11px]">
                        {new Date(cand.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                      No candidate registrations yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
