import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  Eye,
  ShieldCheck,
  Award,
  GraduationCap,
  Compass,
  TrendingUp,
} from 'lucide-react';
import api from '../../utils/api';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminUsersPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Candidate Detail Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchCandidates = async (pageNumber = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/users', {
        params: {
          search: search || undefined,
          status: statusFilter || undefined,
          page: pageNumber,
          limit: 15,
        },
      });
      if (res.data?.success) {
        setCandidates(res.data.users);
        setPagination(res.data.pagination);
        setPage(res.data.pagination.page);
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError(err.response?.data?.message || 'Failed to fetch candidates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCandidates(1);
  };

  const handleToggleStatus = async (cand) => {
    try {
      const res = await api.patch(`/admin/users/${cand._id}/toggle`);
      if (res.data?.success) {
        setCandidates(
          candidates.map((c) => (c._id === cand._id ? { ...c, isActive: res.data.user.isActive } : c))
        );
        setSuccessMsg(res.data.message);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle candidate account status.');
    }
  };

  const viewCandidateDetails = async (cand) => {
    try {
      setDetailLoading(true);
      const res = await api.get(`/admin/users/${cand._id}`);
      if (res.data?.success) {
        setSelectedUser(res.data);
      }
    } catch (err) {
      console.error('Error loading candidate profile:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Users className="w-4 h-4 text-brand-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200/60">
              User Governance
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">Candidate Directory</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            View authentic candidate profiles, target role trajectories, and readiness evaluation summaries.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-medium bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs">
          Total Candidates: <strong className="text-slate-900 font-bold">{pagination.total}</strong>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by candidate name or email..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-2xs"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-2xs"
          >
            <option value="">All Account Statuses</option>
            <option value="active">Active Accounts Only</option>
            <option value="inactive">Deactivated Accounts Only</option>
          </select>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] bg-slate-50/80">
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Target Role</th>
                <th className="py-3 px-4">Education</th>
                <th className="py-3 px-4">Skill Match</th>
                <th className="py-3 px-4">Readiness</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <LoadingSpinner label="Loading candidates from database..." />
                  </td>
                </tr>
              ) : candidates.length > 0 ? (
                candidates.map((cand) => (
                  <tr key={cand._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 space-y-0.5">
                      <p className="font-semibold text-slate-900 text-sm">{cand.name}</p>
                      <p className="text-[11px] text-slate-500">{cand.email}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60 text-[11px] font-medium">
                        {cand.targetRole || 'Not Selected'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{cand.degree || '—'}</div>
                      {cand.college && <div className="text-[10px] text-slate-400 truncate max-w-xs">{cand.college}</div>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-brand-600 text-sm">
                        {cand.skillMatch > 0 ? `${cand.skillMatch}%` : '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-600 text-sm">
                        {cand.readinessScore > 0 ? `${cand.readinessScore}/100` : '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(cand)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                          cand.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100/70'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/60 hover:bg-rose-100/70'
                        }`}
                      >
                        {cand.isActive !== false ? (
                          <>
                            <Check className="w-3 h-3" /> Active
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3" /> Disabled
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => viewCandidateDetails(cand)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-colors shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-brand-600" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 italic">
                    No candidates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.pages > 1 && (
          <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchCandidates(pagination.page - 1)}
                className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-medium transition-colors shadow-2xs"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchCandidates(pagination.page + 1)}
                className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-medium transition-colors shadow-2xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Candidate Profile Inspector Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold">
                  {selectedUser.user.name[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">{selectedUser.user.name}</h3>
                  <p className="text-[11px] text-slate-500">{selectedUser.user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Evaluation Metrics Cards (Read-only) */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Career Readiness</span>
                <span className="text-xl font-bold text-emerald-600 font-display">
                  {selectedUser.profile?.readiness?.readinessScore ?? 0}/100
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Skill Match</span>
                <span className="text-xl font-bold text-brand-600 font-display">
                  {selectedUser.profile?.readiness?.skillMatchScore ?? 0}%
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Interview Score</span>
                <span className="text-xl font-bold text-indigo-600 font-display">
                  {selectedUser.profile?.readiness?.interviewScore ?? 0}/100
                </span>
              </div>
            </div>

            {/* Academic & Target Career Details */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                Academic Background
              </h4>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-500">Degree:</span>{' '}
                  <strong className="font-semibold">{selectedUser.profile?.education?.degree || 'Not Set'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">College:</span>{' '}
                  <strong className="font-semibold">{selectedUser.profile?.education?.college || 'Not Set'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Branch:</span>{' '}
                  <strong className="font-semibold">{selectedUser.profile?.education?.branch || 'Not Set'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Graduation Year:</span>{' '}
                  <strong className="font-semibold">{selectedUser.profile?.education?.graduationYear || 'Not Set'}</strong>
                </div>
              </div>
            </div>

            {/* Mastered & Gap Skills */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                Skills Diagnostic Evidence
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1 font-medium">Mastered Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUser.profile?.skills?.currentSkills?.length > 0 ? (
                      selectedUser.profile.skills.currentSkills.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-semibold"
                        >
                          ✓ {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">No mastered skills recorded.</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block mb-1 font-medium">Skills in Learning / Sprint:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUser.profile?.skills?.learningSkills?.length > 0 ? (
                      selectedUser.profile.skills.learningSkills.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60 text-[10px] font-semibold"
                        >
                          ⏳ {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">None currently in progress.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
