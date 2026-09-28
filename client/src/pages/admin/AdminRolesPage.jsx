import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  Layers,
} from 'lucide-react';
import api from '../../utils/api';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminRolesPage = () => {
  const [items, setItems] = useState([]);
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
    name: '',
    category: 'Software Engineering',
    description: '',
    isActive: true,
    order: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/roles', {
        params: { search: search || undefined, status: statusFilter || undefined, limit: 100 },
      });
      if (res.data?.success) {
        setItems(res.data.items);
      }
    } catch (err) {
      console.error('Error fetching target roles:', err);
      setError(err.response?.data?.message || 'Failed to fetch target roles.');
    } finally {
      setLoading(false);
    }
  };

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
      name: '',
      category: 'Software Engineering',
      description: '',
      isActive: true,
      order: items.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category || 'Software Engineering',
      description: item.description || '',
      isActive: item.isActive !== false,
      order: item.order || 0,
    });
    setModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive,
        order: Number(formData.order) || 0,
      };

      if (editingItem) {
        await api.put(`/admin/roles/${editingItem._id}`, payload);
        setSuccessMsg('Target role updated successfully.');
      } else {
        await api.post('/admin/roles', payload);
        setSuccessMsg('New target role created successfully.');
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
      const res = await api.patch(`/admin/roles/${item._id}/toggle`);
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
    if (!window.confirm('Are you sure you want to delete this target role?')) return;
    try {
      await api.delete(`/admin/roles/${id}`);
      setItems(items.filter((it) => it._id !== id));
      setSuccessMsg('Target role deleted.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to delete.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Compass className="w-4 h-4 text-brand-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200/60">
              Master Governance
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">Target Job Roles</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Define available target careers available for candidate goal setting and ATS benchmark matching.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={openCreateModal} className="shrink-0">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Target Role
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
            placeholder="Search roles..."
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
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Role Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <LoadingSpinner label="Loading target roles from database..." />
                  </td>
                </tr>
              ) : items.length > 0 ? (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 font-mono">{item.order}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{item.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{item.category}</td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-sm truncate">
                      {item.description || '—'}
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
                        title="Edit Role"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 transition-colors"
                        title="Delete Role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 italic">
                    No target roles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-display">
                {editingItem ? 'Edit Target Role' : 'Add New Target Role'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold uppercase tracking-wider mb-1">
                  Target Role Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Data Analyst"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold uppercase tracking-wider mb-1">
                    Industry Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Data & Analytics">Data & Analytics</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Design & Product">Design & Product</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Primary role responsibilities and summary..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="roleActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded bg-white border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="roleActive" className="text-slate-700 font-medium">
                  Active (appears for candidate selection)
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
                  {editingItem ? 'Save Changes' : 'Create Role'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
