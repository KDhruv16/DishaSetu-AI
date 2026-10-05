import React, { useState, useEffect } from 'react';
import { Loader, Calendar, Video, MapPin, Phone, Sparkles, User, ExternalLink } from 'lucide-react';
import api from '../../utils/api';

export const OrganizationInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/organization/interviews');
      if (res.data?.success) {
        setInterviews(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleInterviewType = async (interviewId, currentType) => {
    const nextType = currentType === 'ai' ? 'human' : 'ai';
    try {
      const res = await api.patch(`/organization/interviews/${interviewId}/type`, { interviewType: nextType });
      if (res.data?.success) {
        setInterviews(prev => prev.map(inv => inv._id === interviewId ? { ...inv, interviewType: nextType } : inv));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to switch interview format');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader className="w-8 h-8 animate-spin text-brand-600" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 font-display">Upcoming Interviews</h1>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {interviews.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Candidate</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Date & Time</th>
                <th className="px-6 py-4 font-semibold">Format</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {interviews.map(inv => (
                <tr key={inv._id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{inv.candidate?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-gray-700">{inv.opportunity?.title || 'Role'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(inv.scheduledDate).toLocaleDateString()} at {inv.startTime}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {inv.interviewType === 'ai' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        AI Interview
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        Human Interview
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 capitalize font-medium text-gray-600">{inv.type}</td>
                  <td className="px-6 py-4 capitalize font-semibold text-brand-600">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs ${inv.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleInterviewType(inv._id, inv.interviewType)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition-colors"
                        title="Switch between Human and AI interview"
                      >
                        Switch to {inv.interviewType === 'ai' ? 'Human' : 'AI'}
                      </button>

                      {inv.interviewType === 'ai' && (
                        <a
                          href={`/ai-interview/${inv._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
                        >
                          <Sparkles className="w-3 h-3" /> Room
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-500">No interviews scheduled yet.</div>
        )}
      </div>
    </div>
  );
};
