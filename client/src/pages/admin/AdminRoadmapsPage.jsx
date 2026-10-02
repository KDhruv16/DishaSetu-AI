import React, { useState, useEffect } from 'react';
import {
  Map,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  Layers,
} from 'lucide-react';
import api from '../../utils/api';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminRoadmapsPage = () => {
  const [items, setItems] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    skill: 'SQL',
    title: '',
    description: '',
    category: 'Technical',
    milestones: [],
    isActive: true,
  });

  const fetchOptions = async () => {
    try {
      const res = await api.get('/admin/skills?status=active&limit=100');
      if (res.data?.success) setSkills(res.data.items);
    } catch (err) {
      console.warn('Skill option fetch note:', err.message);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/roadmaps', {
        params: { search: search || undefined, status: statusFilter || undefined, limit: 100 },
      });
      if (res.data?.success) {
        setItems(res.data.items);
      }
    } catch (err) {
      console.error('Error fetching roadmaps:', err);
      setError(err.response?.data?.message || 'Failed to fetch roadmap templates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      skill: skills[0]?.name || 'SQL',
      title: 'SQL Sprint Roadmap',
      description: 'Step-by-step progressive milestones from database basics to advanced analytics.',
      category: 'Technical',
      milestones: [
        {
          title: 'Foundations & Basic Queries',
          description: 'SELECT, WHERE, ORDER BY, and basic aggregations.',
          order: 1,
          tasks: [
            { title: 'Learn relational schema fundamentals', type: 'learn', duration: '1 day' },
            { title: 'Practice multi-condition filtering queries', type: 'practice', duration: '1 day' },
          ],
        },
        {
          title: 'Relational Joins & Set Operations',
          description: 'INNER JOIN, LEFT JOIN, FULL OUTER JOIN, and UNION.',
          order: 2,
          tasks: [
            { title: 'Master multi-table join mechanisms', type: 'learn', duration: '2 days' },
            { title: 'Solve complex e-commerce order join problems', type: 'practice', duration: '1 day' },
          ],
        },
      ],
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      skill: item.skill,
      title: item.title,
      description: item.description || '',
      category: item.category || 'Technical',
      milestones: item.milestones || [],
      isActive: item.isActive !== false,
    });
    setModalOpen(true);
  };

  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [
        ...formData.milestones,
        {
          title: `Milestone ${formData.milestones.length + 1}`,
          description: '',
          order: formData.milestones.length + 1,
          tasks: [{ title: 'Learn key concepts', type: 'learn', duration: '1 day' }],
        },
      ],
    });
  };

  const updateMilestone = (index, field, value) => {
    const updated = [...formData.milestones];
    updated[index][field] = value;
    setFormData({ ...formData, milestones: updated });
  };

  const removeMilestone = (index) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((_, i) => i !== index),
    });
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.skill.trim() || !formData.title.trim()) return;

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        skill: formData.skill.trim(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        milestones: formData.milestones,
        isActive: formData.isActive,
      };

      if (editingItem) {
        await api.put(`/admin/roadmaps/${editingItem._id}`, payload);
        setSuccessMsg('Roadmap template updated successfully.');
      } else {
        await api.post('/admin/roadmaps', payload);
        setSuccessMsg('New roadmap template created successfully.');
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
      const res = await api.patch(`/admin/roadmaps/${item._id}/toggle`);
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
    if (!window.confirm('Are you sure you want to delete this roadmap template?')) return;
    try {
      await api.delete(`/admin/roadmaps/${id}`);
      setItems(items.filter((it) => it._id !== id));
      setSuccessMsg('Roadmap template deleted.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to delete template.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Map className="w-4 h-4 text-brand-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200/60">
              Roadmap Governance
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">Roadmap Milestone Templates</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Define milestone scaffolding and learning task sequences used to generate personalized candidate roadmaps.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={openCreateModal} className="shrink-0">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Roadmap Template
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
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-2xs"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-2xs"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Disabled Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] bg-slate-50/80">
                <th className="py-3 px-4">Skill & Template</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Milestones Structure</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <LoadingSpinner label="Loading roadmap templates..." />
                  </td>
                </tr>
              ) : items.length > 0 ? (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="font-semibold text-slate-900 text-sm">{item.title}</div>
                      <span className="inline-block px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200/60 text-[10px] font-semibold">
                        Target Skill: {item.skill}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{item.category}</td>
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="text-slate-900 font-semibold">
                        {item.milestones?.length || 0} Milestones Defined
                      </div>
                      <div className="text-[11px] text-slate-500 max-w-xs truncate">
                        {item.milestones?.map((m) => m.title).join(' → ') || 'No milestones'}
                      </div>
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
                        title="Edit Roadmap Template"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 transition-colors"
                        title="Delete Template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 italic">
                    No roadmap templates found.
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
          <div className="bg-white border border-slate-200/80 rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-5 max-h-[calc(100vh-48px)] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-display">
                {editingItem ? 'Edit Roadmap Template' : 'Create Roadmap Template'}
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
                    Target Skill *
                  </label>
                  {editingItem ? (
                    <input
                      type="text"
                      disabled
                      value={formData.skill}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-500"
                    />
                  ) : (
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
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold uppercase tracking-wider mb-1">
                    Roadmap Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. SQL Data Analyst Roadmap"
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview of the learning progression..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              {/* Milestones Editor */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-bold uppercase tracking-wider">
                    Milestones ({formData.milestones.length})
                  </span>
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Milestone
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {formData.milestones.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-500">
                          Milestone #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeMilestone(idx)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={m.title}
                        onChange={(e) => updateMilestone(idx, 'title', e.target.value)}
                        placeholder="Milestone Title (e.g. Relational Joins & Subqueries)"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />

                      <input
                        type="text"
                        value={m.description}
                        onChange={(e) => updateMilestone(idx, 'description', e.target.value)}
                        placeholder="Milestone brief overview..."
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mapTemplateActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded bg-white border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="mapTemplateActive" className="text-slate-700 font-medium">
                  Active (used by Dynamic Roadmap Generator)
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
                  {editingItem ? 'Save Changes' : 'Create Template'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
