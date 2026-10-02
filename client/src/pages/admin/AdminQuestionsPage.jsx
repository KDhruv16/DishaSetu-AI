import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  Compass,
  Cpu,
  Sparkles,
} from 'lucide-react';
import api from '../../utils/api';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminQuestionsPage = () => {
  const [items, setItems] = useState([]);
  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [roleFilter, setRoleFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    questionText: '',
    role: 'Data Analyst',
    skill: 'SQL',
    difficulty: 'Medium',
    type: 'Technical',
    expectedRubric: '',
    evaluationGuidance: '',
    isActive: true,
  });

  const fetchOptions = async () => {
    try {
      const [roleRes, skillRes] = await Promise.all([
        api.get('/admin/roles?status=active&limit=100'),
        api.get('/admin/skills?status=active&limit=100'),
      ]);
      if (roleRes.data?.success) setRoles(roleRes.data.items);
      if (skillRes.data?.success) setSkills(skillRes.data.items);
    } catch (err) {
      console.warn('Option fetch note:', err.message);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/questions', {
        params: {
          role: roleFilter || undefined,
          skill: skillFilter || undefined,
          difficulty: difficultyFilter || undefined,
          status: statusFilter || undefined,
          search: search || undefined,
          limit: 100,
        },
      });
      if (res.data?.success) {
        setItems(res.data.items);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.response?.data?.message || 'Failed to fetch interview questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchData();
  }, [roleFilter, skillFilter, difficultyFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      questionText: '',
      role: roleFilter || (roles[0]?.name || 'Data Analyst'),
      skill: skillFilter || (skills[0]?.name || 'SQL'),
      difficulty: 'Medium',
      type: 'Technical',
      expectedRubric: '',
      evaluationGuidance: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      questionText: item.questionText,
      role: item.role,
      skill: item.skill,
      difficulty: item.difficulty || 'Medium',
      type: item.type || 'Technical',
      expectedRubric: item.expectedRubric || '',
      evaluationGuidance: item.evaluationGuidance || '',
      isActive: item.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.questionText.trim() || !formData.expectedRubric.trim()) return;

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        questionText: formData.questionText.trim(),
        role: formData.role.trim(),
        skill: formData.skill.trim(),
        difficulty: formData.difficulty,
        type: formData.type,
        expectedRubric: formData.expectedRubric.trim(),
        evaluationGuidance: formData.evaluationGuidance.trim(),
        isActive: formData.isActive,
      };

      if (editingItem) {
        await api.put(`/admin/questions/${editingItem._id}`, payload);
        setSuccessMsg('Interview question updated successfully.');
      } else {
        await api.post('/admin/questions', payload);
        setSuccessMsg('New interview question added to question bank.');
      }

      setModalOpen(false);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      const res = await api.patch(`/admin/questions/${item._id}/toggle`);
      if (res.data?.success) {
        setItems(items.map((it) => (it._id === item._id ? { ...it, isActive: !it.isActive } : it)));
        setSuccessMsg(res.data.message);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError('Failed to toggle status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this interview question?')) return;
    try {
      await api.delete(`/admin/questions/${id}`);
      setItems(items.filter((it) => it._id !== id));
      setSuccessMsg('Interview question deleted.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to delete question.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <HelpCircle className="w-4 h-4 text-brand-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200/60">
              Master Question Bank
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">Mock Interview Questions</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain curated interview questions and their expected technical rubrics used by the Gemini AI evaluation engine.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={openCreateModal} className="shrink-0">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Question
        </Button>
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
      <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-2xs"
          >
            <option value="">All Roles ({roles.length})</option>
            {roles.map((r) => (
              <option key={r._id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Skill Filter */}
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-2xs"
          >
            <option value="">All Skills ({skills.length})</option>
            {skills.map((s) => (
              <option key={s._id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-2xs"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-2xs"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Disabled Only</option>
          </select>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions or rubrics..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-2xs"
          />
        </form>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] bg-slate-50/80">
                <th className="py-3 px-4">Role & Skill</th>
                <th className="py-3 px-4">Interview Question</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">Expected Technical Rubric</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <LoadingSpinner label="Loading questions from database..." />
                  </td>
                </tr>
              ) : items.length > 0 ? (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 space-y-1">
                      <p className="font-semibold text-slate-900 truncate max-w-[140px]">{item.role}</p>
                      <span className="inline-block px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200/60 text-[10px] font-semibold">
                        {item.skill}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 max-w-sm">
                      "{item.questionText}"
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.difficulty === 'Hard'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            : item.difficulty === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        }`}
                      >
                        {item.difficulty}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate text-[11px]">
                      {item.expectedRubric}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggle(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                          item.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100/70'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/60 hover:bg-rose-100/70'
                        }`}
                      >
                        {item.isActive ? (
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
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                        title="Edit Question"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 transition-colors"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 italic">
                    No interview questions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-[24px] pb-[24px] px-[20px]">
          <div className="bg-white border border-slate-200/80 rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-5 max-h-[calc(100vh-48px)] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-display">
                {editingItem ? 'Edit Interview Question' : 'Add New Interview Question'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold uppercase tracking-wider mb-1">
                    Target Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    {roles.map((r) => (
                      <option key={r._id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold uppercase tracking-wider mb-1">
                    Target Skill *
                  </label>
                  <select
                    value={formData.skill}
                    onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    {skills.map((s) => (
                      <option key={s._id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold uppercase tracking-wider mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold uppercase tracking-wider mb-1">
                    Question Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    <option value="Technical">Technical</option>
                    <option value="HR">HR / Behavioral</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold uppercase tracking-wider mb-1">
                  Interview Question Text *
                </label>
                <textarea
                  rows={3}
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  placeholder="e.g. Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN with practical use cases."
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold uppercase tracking-wider mb-1">
                  Expected Technical Rubric & Concepts *
                </label>
                <textarea
                  rows={3}
                  value={formData.expectedRubric}
                  onChange={(e) => setFormData({ ...formData, expectedRubric: e.target.value })}
                  placeholder="Key concepts that must be covered (e.g. matching rows, left-side preservation, NULL fills, use cases)..."
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  This rubric is passed to the AI Quality Scorer to assess student completeness and technical depth.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold uppercase tracking-wider mb-1">
                  Evaluation Guidance (Optional)
                </label>
                <input
                  type="text"
                  value={formData.evaluationGuidance}
                  onChange={(e) => setFormData({ ...formData, evaluationGuidance: e.target.value })}
                  placeholder="e.g. Candidate should demonstrate STAR method with real project debugging..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="qActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded bg-white border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="qActive" className="text-slate-700 font-medium">
                  Active (eligible for random candidate interview generation)
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
                  {editingItem ? 'Save Changes' : 'Create Question'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
