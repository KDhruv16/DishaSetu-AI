import React, { useState, useEffect } from 'react';
import { Loader, Calendar, Video, MapPin, Phone } from 'lucide-react';
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

  if (loading) {
    return <div className="flex justify-center p-12"><Loader className="w-8 h-8 animate-spin text-brand-600" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Upcoming Interviews</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {interviews.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Candidate</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Date & Time</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {interviews.map(inv => (
                <tr key={inv._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{inv.candidate?.name || 'Unknown'}</td>
                  <td className="px-6 py-4">{inv.opportunity?.title || 'Role'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(inv.scheduledDate).toLocaleDateString()} at {inv.startTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize">{inv.type}</td>
                  <td className="px-6 py-4 capitalize font-semibold text-brand-600">{inv.status}</td>
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
