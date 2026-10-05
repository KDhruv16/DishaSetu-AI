import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader, Calendar, Video, MapPin, Phone, Building2, Sparkles, Brain } from 'lucide-react';
import api from '../../utils/api';

export const CandidateInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/candidate/interviews');
      if (res.data?.success) {
        setInterviews(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmInterview = async (id) => {
    try {
      const res = await api.patch(`/candidate/interviews/${id}/confirm`);
      if (res.data?.success) {
        setInterviews(prev => prev.map(inv => inv._id === id ? { ...inv, status: 'confirmed' } : inv));
        alert('Interview confirmed!');
      }
    } catch (error) {
      alert('Failed to confirm interview');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader className="w-8 h-8 animate-spin text-brand-600" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">My Interviews</h1>
      <div className="space-y-4">
        {interviews.length > 0 ? (
          interviews.map(inv => (
            <div key={inv._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{inv.title}</h3>
                  <p className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                    <Building2 className="w-4 h-4"/> {inv.organization?.name} - {inv.opportunity?.title}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${inv.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {inv.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                <div>
                  <span className="font-semibold block text-gray-900">Date & Time</span>
                  {new Date(inv.scheduledDate).toLocaleDateString()} • {inv.startTime} - {inv.endTime}
                </div>
                <div>
                  <span className="font-semibold block text-gray-900">Mode</span>
                  <div className="flex items-center gap-2">
                    <span className="capitalize">{inv.mode}</span>
                    {inv.interviewType === 'ai' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                        <Sparkles className="w-3 h-3 text-purple-600" /> AI Avatar Interview
                      </span>
                    )}
                  </div>
                  {inv.interviewType === 'ai' ? (
                    <Link
                      to={`/ai-interview/${inv._id}`}
                      className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Join AI Interview
                    </Link>
                  ) : (
                    inv.mode === 'online' && inv.meetingLink && (
                      <a href={inv.meetingLink} target="_blank" rel="noreferrer" className="block text-brand-600 font-bold hover:underline mt-1">Join Meeting</a>
                    )
                  )}
                  {inv.mode === 'offline' && inv.location && (
                    <span className="block mt-1">{inv.location}</span>
                  )}
                </div>
              </div>
              {inv.instructions && (
                <div className="mb-6 p-3 bg-gray-50 rounded-lg text-sm border border-gray-100">
                  <span className="font-bold text-gray-900">Instructions: </span>
                  {inv.instructions}
                </div>
              )}
              {inv.status === 'scheduled' && (
                <button onClick={() => confirmInterview(inv._id)} className="px-5 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700">
                  Confirm Attendance
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl shadow-sm border border-gray-200 text-gray-500">No upcoming interviews.</div>
        )}
      </div>
    </div>
  );
};
