import React, { useState, useEffect } from 'react';
import {
  GitFork,
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
} from 'lucide-react';
import api from '../../utils/api';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminRoleSkillsPage = () => {
  const [items, setItems] = useState([]);
  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    roleName: '',
    skillName: '',
    priority: 'High',
    requiredLevel: 'Intermediate',
    reason: '',
    order: 0,
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
      const res = await api.get('/admin/role-skills', {
        params: {
          roleName: selectedRole || undefined,
          priority: priorityFilter || undefined,
          search: search || undefined,
          limit: 100,
        },
      });
      if (res.data?.success) {
        setItems(res.data.items);
      }
    } catch (err) {
      console.error('Error fetching role-skill mappings:', err);
      setError(err.response?.data?.message || 'Failed to fetch role-skill mappings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedRole, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      roleName: selectedRole || (roles[0]?.name || 'Data Analyst'),
      skillName: skills[0]?.name || 'SQL',
      priority: 'High',
      requiredLevel: 'Intermediate',
      reason: '',
      order: items.length + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      roleName: item.roleName,
      skillName: item.skillName,
      priority: item.priority || 'High',
      requiredLevel: item.requiredLevel || 'Intermediate',
      reason: item.reason || '',
      order: item.order || 0,
      isActive: item.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roleName || !formData.skillName) return;

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        roleName: formData.roleName.trim(),
        skillName: formData.skillName.trim(),
        priority: formData.priority,
        requiredLevel: formData.requiredLevel,
        reason: formData.reason.trim(),
        order: Number(formData.order) || 0,
        isActive: formData.isActive,
      };

      if (editingItem) {
        await api.put(`/admin/role-skills/${editingItem._id}`, payload);
        setSuccessMsg('Role-skill mapping updated successfully.');
      } else {
        await api.post('/admin/role-skills', payload);
        setSuccessMsg('New role-skill mapping added successfully.');
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
      const res = await api.patch(`/admin/role-skills/${item._id}/toggle`);
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
    if (!window.confirm('Are you sure you want to remove this skill from the target role?')) return;
    try {
      await api.delete(`/admin/role-skills/${id}`);
      setItems(items.filter((it) => it._id !== id));
      setSuccessMsg('Role-skill mapping removed.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to delete mapping.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <GitFork className="w-4 h-4 text-brand-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200/60">
              Master Governance
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">Role → Skill Mapping Matrix</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Define mandatory and priority skills required for each career path to compute authentic candidate Skill Match.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={openCreateModal} className="shrink-0">
          <Plus className="w-4 h-4 mr-1.5" />
          Map Skill to Role
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
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-2xs"
          >
            <option value="">All Target Roles ({roles.length})</option>
            {roles.map((r) => (
              <option key={r._id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-2xs"
          >
            <option value="">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search role or skill..."
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
                <th className="py-3 px-4">Target Role</th>
                <th className="py-3 px-4">Mapped Skill</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Required Level</th>
                <th className="py-3 px-4">Rationale / Context</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <LoadingSpinner label="Loading mappings from database..." />
                  </td>
                </tr>
              ) : items.length > 0 ? (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-brand-600" />
                      {item.roleName}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200/60">
                        {item.skillName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.priority === 'High'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            : item.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{item.requiredLevel}</td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {item.reason || '—'}
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
                        title="Edit Mapping"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 transition-colors"
                        title="Delete Mapping"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 italic">
                    No role-skill mappings found.
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
          <div className="bg-white border border-slate-200/80 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5 max-h-[calc(100vh-48px)] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-display">
                {editingItem ? 'Edit Role-Skill Mapping' : 'Map Skill to Target Role'}
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
                  {editingItem ? (
                    <input
                      type="text"
                      disabled
                      value={formData.roleName}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-500"
                    />
                  ) : (
                    <select
                      value={formData.roleName}
                      onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    >
                      {roles.map((r) => (
                        <option key={r._id} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold uppercase tracking-wider mb-1">
                    Required Skill *
                  </label>
                  {editingItem ? (
                    <input
                      type="text"
                      disabled
                      value={formData.skillName}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-500"
                    />
                  ) : (
                    <select
                      value={formData.skillName}
                      onChange={(e) => setFormData({ ...formData, skillName: e.target.value })}
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold uppercase tracking-wider mb-1">
                    Importance Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold uppercase tracking-wider mb-1">
                    Required Proficiency
                  </label>
                  <select
                    value={formData.requiredLevel}
                    onChange={(e) => setFormData({ ...formData, requiredLevel: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold uppercase tracking-wider mb-1">
                  Reason / Production Rationale
                </label>
                <textarea
                  rows={2}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Explain why this skill is necessary for this target role..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mapActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded bg-white border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="mapActive" className="text-slate-700 font-medium">
                  Active (enforced during Skill Match analysis)
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
                  {editingItem ? 'Save Changes' : 'Create Mapping'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
