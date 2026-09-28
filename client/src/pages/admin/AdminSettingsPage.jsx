import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Shield,
  Layers,
  HelpCircle,
  Mail,
  Sparkles,
} from 'lucide-react';
import api from '../../utils/api';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminSettingsPage = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/settings');
      if (res.data?.success) {
        setSettings(res.data.settings || []);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.response?.data?.message || 'Failed to fetch platform settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings(settings.map((s) => (s.key === key ? { ...s, value } : s)));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const res = await api.put('/admin/settings', { settings });
      if (res.data?.success) {
        setSettings(res.data.settings);
        setSuccessMsg('Platform settings saved successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading platform configuration..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Settings className="w-4 h-4 text-brand-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200/60">
              System Configuration
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">Platform Settings</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure global platform parameters, evaluation thresholds, and contact information.
          </p>
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

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-2xl bg-white border border-slate-200/80 p-6 space-y-6 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3 font-display">
            <Layers className="w-4 h-4 text-brand-600" />
            General Branding & Metadata
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {settings
              .filter((s) => s.category === 'general')
              .map((s) => (
                <div key={s.key} className="space-y-1.5">
                  <label className="block text-slate-700 font-semibold uppercase tracking-wider">
                    {s.key}
                  </label>
                  <input
                    type="text"
                    value={s.value}
                    onChange={(e) => handleChange(s.key, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  {s.description && <p className="text-[11px] text-slate-400">{s.description}</p>}
                </div>
              ))}
          </div>

          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3 pt-2 font-display">
            <HelpCircle className="w-4 h-4 text-brand-600" />
            Evaluation & Threshold Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {settings
              .filter((s) => s.category === 'interview' || s.category === 'assessment')
              .map((s) => (
                <div key={s.key} className="space-y-1.5">
                  <label className="block text-slate-700 font-semibold uppercase tracking-wider">
                    {s.key}
                  </label>
                  <input
                    type="number"
                    value={s.value}
                    onChange={(e) => handleChange(s.key, Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  {s.description && <p className="text-[11px] text-slate-400">{s.description}</p>}
                </div>
              ))}
          </div>

          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3 pt-2 font-display">
            <Mail className="w-4 h-4 text-brand-600" />
            Contact & Support
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {settings
              .filter((s) => s.category === 'contact')
              .map((s) => (
                <div key={s.key} className="space-y-1.5">
                  <label className="block text-slate-700 font-semibold uppercase tracking-wider">
                    {s.key}
                  </label>
                  <input
                    type="text"
                    value={s.value}
                    onChange={(e) => handleChange(s.key, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  {s.description && <p className="text-[11px] text-slate-400">{s.description}</p>}
                </div>
              ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={saving}>
            <Save className="w-4 h-4 mr-2" />
            Save Platform Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
