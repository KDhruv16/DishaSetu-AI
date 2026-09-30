import React, { useState, useEffect } from 'react';
import { Save, Loader } from 'lucide-react';

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
      const response = await fetch('/api/organization/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
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
      const response = await fetch('/api/organization/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profile)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSaveMessage('Saved successfully');
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setError(data.message || 'Unable to save profile.');
      }
    } catch (err) {
      setError('Unable to save profile. Network error.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Organization Profile</h1>
        <p className="text-gray-600 mt-1">Manage your organization's public details and contact information.</p>
      </div>
      
      {/* Profile Completion Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Profile Completion</h3>
          <span className="text-sm font-bold text-primary">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
              <input
                type="text"
                name="organizationName"
                value={profile.organizationName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
              <input
                type="text"
                name="industry"
                value={profile.industry}
                onChange={handleChange}
                placeholder="e.g. Information Technology"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Organization Type</label>
              <select
                name="organizationType"
                value={profile.organizationType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select Type</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Startup">Startup</option>
                <option value="Agency">Agency</option>
                <option value="SME">SME</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                name="website"
                value={profile.website}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleChange}
                placeholder="City, Country"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                value={profile.contactEmail}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee Count</label>
              <select
                name="employeeCount"
                value={profile.employeeCount}
                onChange={handleChange}
                className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select Range</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="500+">500+</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">About Organization</label>
              <textarea
                name="about"
                value={profile.about}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Brief description of your organization..."
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
              <input
                type="url"
                name="logo"
                value={profile.logo}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
            <div>
              {error && (
                <div className="text-sm text-red-600 flex items-center gap-2">
                  <span className="font-semibold">Error:</span> {error} 
                  <button type="button" onClick={handleSubmit} className="text-primary hover:underline font-medium ml-2 border border-primary/20 px-2 py-0.5 rounded text-xs bg-primary/5">Try Again</button>
                </div>
              )}
              {saveMessage && <span className="text-sm text-green-600 font-medium flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> {saveMessage}</span>}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
