import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Building, Globe, Mail, Phone, Users, CheckCircle, Save, Loader } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import api from '../../utils/api';

export const OrganizationProfilePage = () => {
  const [profile, setProfile] = useState({
    organizationName: '',
    industry: '',
    organizationType: '',
    website: '',
    location: '',
    contactEmail: '',
    phone: '',
    employeeCount: '',
    about: '',
    logo: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    calculateCompletion();
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/organization/profile');
      
      const data = res.data;
      
      if (data && data.success) {
        setProfile({
          organizationName: data.data.organizationName || '',
          industry: data.data.industry || '',
          organizationType: data.data.organizationType || '',
          website: data.data.website || '',
          location: data.data.location || '',
          contactEmail: data.data.contactEmail || '',
          phone: data.data.phone || '',
          employeeCount: data.data.employeeCount || '',
          about: data.data.about || '',
          logo: data.data.logo || ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletion = () => {
    const fields = Object.values(profile);
    const filledFields = fields.filter(field => field && field.trim() !== '');
    setCompletionPercentage(Math.round((filledFields.length / fields.length) * 100));
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveMessage(null);

    try {
      const res = await api.post('/organization/profile', profile);
      
      const data = res.data;
      
      if (data && data.success) {
        setSaveMessage('Saved successfully');
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setError(data.message || 'Unable to save profile.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save profile. Network error.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-10 h-10 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16">
      
      {/* Header Section with Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900 tracking-tight">Organization Profile</h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Build your organization's presence and help candidates understand who you are. A complete profile builds trust.
          </p>
        </div>
        
        <div className="flex flex-col items-end shrink-0">
          <Button
            onClick={handleSubmit}
            isLoading={saving}
            variant="primary"
            className="w-full md:w-auto shadow-sm"
          >
            {!saving && <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
          
          <div className="h-6 mt-2 flex items-center justify-end w-full">
            {error && (
              <span className="text-xs text-rose-600 font-medium">
                {error}
              </span>
            )}
            {saveMessage && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                {saveMessage}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Profile Completion Card */}
      <Card className="mb-8 overflow-hidden shadow-sm border-slate-200">
        <div className="p-6 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Profile Completion</h3>
              <p className="text-xs text-slate-500 mt-1">Complete your organization profile to build trust with candidates.</p>
            </div>
            <span className="text-xl font-bold text-brand-600 font-display">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 shadow-inner overflow-hidden">
            <div 
              className="bg-brand-500 h-2.5 rounded-full transition-all duration-1000 ease-out relative" 
              style={{ width: `${completionPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
            </div>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Organization Information Section */}
        <section className="space-y-4">
          <div className="pb-2 border-b border-slate-200/60">
            <h2 className="text-lg font-bold text-slate-900">Organization Information</h2>
            <p className="text-xs text-slate-500">Basic details about your organization</p>
          </div>
          
          <Card className="p-6 sm:p-8 shadow-sm border-slate-200">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Organization Name"
                    id="organizationName"
                    name="organizationName"
                    type="text"
                    icon={Building2}
                    value={profile.organizationName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Input
                  label="Industry"
                  id="industry"
                  name="industry"
                  type="text"
                  placeholder="e.g. Information Technology"
                  value={profile.industry}
                  onChange={handleChange}
                />

                <div className="space-y-1.5">
                  <label htmlFor="organizationType" className="block text-sm font-semibold text-slate-700">
                    Organization Type
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-slate-400" />
                    </div>
                    <select
                      id="organizationType"
                      name="organizationType"
                      value={profile.organizationType}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border-slate-300 border text-slate-900 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-shadow bg-white/50 focus:bg-white"
                    >
                      <option value="">Select Type</option>
                      <option value="Enterprise">Enterprise</option>
                      <option value="Startup">Startup</option>
                      <option value="Agency">Agency</option>
                      <option value="SME">SME</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Contact & Location Section */}
        <section className="space-y-4">
          <div className="pb-2 border-b border-slate-200/60">
            <h2 className="text-lg font-bold text-slate-900">Contact & Location</h2>
            <p className="text-xs text-slate-500">How candidates can reach your organization</p>
          </div>
          
          <Card className="p-6 sm:p-8 shadow-sm border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Website"
                id="website"
                name="website"
                type="url"
                icon={Globe}
                placeholder="https://..."
                value={profile.website}
                onChange={handleChange}
              />

              <Input
                label="Location"
                id="location"
                name="location"
                type="text"
                icon={MapPin}
                placeholder="City, Country"
                value={profile.location}
                onChange={handleChange}
              />

              <Input
                label="Contact Email"
                id="contactEmail"
                name="contactEmail"
                type="email"
                icon={Mail}
                placeholder="hr@company.com"
                value={profile.contactEmail}
                onChange={handleChange}
              />

              <Input
                label="Phone"
                id="phone"
                name="phone"
                type="text"
                icon={Phone}
                placeholder="+1 (555) 000-0000"
                value={profile.phone}
                onChange={handleChange}
              />
            </div>
          </Card>
        </section>

        {/* Organization Details Section */}
        <section className="space-y-4">
          <div className="pb-2 border-b border-slate-200/60">
            <h2 className="text-lg font-bold text-slate-900">Organization Details</h2>
            <p className="text-xs text-slate-500">Additional information for candidates</p>
          </div>
          
          <Card className="p-6 sm:p-8 shadow-sm border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 md:col-span-1">
                <label htmlFor="employeeCount" className="block text-sm font-semibold text-slate-700">
                  Employee Count
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-slate-400" />
                  </div>
                  <select
                    id="employeeCount"
                    name="employeeCount"
                    value={profile.employeeCount}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border-slate-300 border text-slate-900 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-shadow bg-white/50 focus:bg-white"
                  >
                    <option value="">Select Range</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-500">201-500</option>
                    <option value="500+">500+</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label htmlFor="about" className="block text-sm font-semibold text-slate-700">
                  About Organization
                </label>
                <textarea
                  id="about"
                  name="about"
                  value={profile.about}
                  onChange={handleChange}
                  rows={4}
                  className="block w-full p-3 sm:text-sm border-slate-300 border text-slate-900 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-shadow bg-white/50 focus:bg-white"
                  placeholder="Brief description of your organization, mission, and culture..."
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Logo URL (Optional)"
                  id="logo"
                  name="logo"
                  type="url"
                  placeholder="https://..."
                  value={profile.logo}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>
        </section>

      </form>
    </div>
  );
};
