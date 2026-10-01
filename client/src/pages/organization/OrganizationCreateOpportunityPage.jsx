import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Send, Loader, ArrowLeft, X, Plus } from 'lucide-react';
import api from '../../utils/api';

export const OrganizationCreateOpportunityPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    type: 'Job',
    location: '',
    experience: '',
    stipendOrSalary: '',
    deadline: '',
    description: '',
    responsibilities: '',
    eligibility: '',
    status: 'draft'
  });

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  
  const [preferredSkills, setPreferredSkills] = useState([]);
  const [preferredSkillInput, setPreferredSkillInput] = useState('');

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing) {
      fetchOpportunity();
    }
  }, [id]);

  const fetchOpportunity = async () => {
    try {
      const res = await api.get(`/organization/opportunities/${id}`);
      if (res.data?.success) {
        const opp = res.data.data;
        setFormData({
          title: opp.title || '',
          type: opp.type || 'Job',
          location: opp.location || '',
          experience: opp.experience || '',
          stipendOrSalary: opp.stipendOrSalary || '',
          deadline: opp.deadline || '',
          description: opp.description || '',
          responsibilities: opp.responsibilities || '',
          eligibility: opp.eligibility || '',
          status: opp.status || 'draft'
        });
        setSkills(opp.skills || []);
        setPreferredSkills(opp.preferredSkills || []);
      }
    } catch (err) {
      setError('Failed to load opportunity data.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addSkill = (e, type) => {
    e.preventDefault();
    if (type === 'required' && skillInput.trim()) {
      const newSkill = skillInput.trim();
      if (!skills.find(s => s.toLowerCase() === newSkill.toLowerCase())) {
        setSkills([...skills, newSkill]);
      }
      setSkillInput('');
    } else if (type === 'preferred' && preferredSkillInput.trim()) {
      const newSkill = preferredSkillInput.trim();
      if (!preferredSkills.find(s => s.toLowerCase() === newSkill.toLowerCase())) {
        setPreferredSkills([...preferredSkills, newSkill]);
      }
      setPreferredSkillInput('');
    }
  };

  const removeSkill = (index, type) => {
    if (type === 'required') {
      setSkills(skills.filter((_, i) => i !== index));
    } else {
      setPreferredSkills(preferredSkills.filter((_, i) => i !== index));
    }
  };

  const handleSave = async (status) => {
    setSaving(true);
    setError(null);
    
    // Basic validation for publishing
    if (status === 'published') {
      if (!formData.title || !formData.description || !formData.type || !formData.location || skills.length === 0 || !formData.eligibility) {
        setError('Please fill all required fields and add at least one required skill before publishing.');
        setSaving(false);
        return;
      }
    } else {
      // Draft validation (minimal)
      if (!formData.title) {
        setError('Title is required to save a draft.');
        setSaving(false);
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        skills,
        preferredSkills,
        status
      };

      let res;
      if (isEditing) {
        res = await api.put(`/organization/opportunities/${id}`, payload);
      } else {
        res = await api.post('/organization/opportunities', payload);
      }

      if (res.data?.success) {
        navigate('/organization/opportunities');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save opportunity.');
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
      <button 
        onClick={() => navigate('/organization/opportunities')}
        className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Opportunities
      </button>

      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Opportunity' : 'Create Opportunity'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Update the details of your job or internship posting.' : 'Define a new job or internship posting.'}
          </p>
        </div>
        {isEditing && (
          <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
            formData.status === 'published' ? 'bg-green-100 text-green-700' :
            formData.status === 'closed' ? 'bg-red-100 text-red-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            Current: {formData.status}
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Opportunity Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Java Backend Developer"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Type <span className="text-red-500">*</span></label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="Job">Full Time Job</option>
                <option value="Internship">Internship</option>
                <option value="Apprenticeship">Apprenticeship</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Bengaluru, Remote"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience Required</label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="e.g. 0-2 Years"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salary / Stipend</label>
              <input
                type="text"
                name="stipendOrSalary"
                value={formData.stipendOrSalary}
                onChange={handleChange}
                placeholder="e.g. ₹6-8 LPA"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                placeholder="e.g. Oct 30, 2026 or Rolling Basis"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <hr className="my-8 border-gray-200" />

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Description <span className="text-red-500">*</span></label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Detail the opportunity..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Responsibilities</label>
              <textarea
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleChange}
                rows={3}
                placeholder="What will the candidate do..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Eligibility Criteria <span className="text-red-500">*</span></label>
              <textarea
                name="eligibility"
                value={formData.eligibility}
                onChange={handleChange}
                rows={2}
                placeholder="e.g. Open to B.Tech 2026 graduates"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <hr className="my-8 border-gray-200" />

          <div className="space-y-8">
            {/* Required Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills <span className="text-red-500">*</span></label>
              <p className="text-xs text-gray-500 mb-3">Add skills necessary for this role. These will be used for AI matching.</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-100">
                    {skill}
                    <button type="button" onClick={() => removeSkill(index, 'required')} className="text-blue-400 hover:text-blue-800 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill(e, 'required')}
                  placeholder="e.g. Java, React, SQL..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={(e) => addSkill(e, 'required')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preferred Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Skills (Optional)</label>
              <p className="text-xs text-gray-500 mb-3">Add skills that are nice to have but not strictly required.</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {preferredSkills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200">
                    {skill}
                    <button type="button" onClick={() => removeSkill(index, 'preferred')} className="text-gray-400 hover:text-gray-800 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={preferredSkillInput}
                  onChange={(e) => setPreferredSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill(e, 'preferred')}
                  placeholder="e.g. AWS, Docker..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={(e) => addSkill(e, 'preferred')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-5 border-t border-gray-200 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            {saving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Draft
          </button>
          
          <button
            type="button"
            onClick={() => handleSave('published')}
            disabled={saving}
            className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            {saving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};
