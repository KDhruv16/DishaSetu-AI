import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Users, MessageSquare, CheckCircle, FileText } from 'lucide-react';
import api from '../../utils/api';

export const OrganizationDashboardPage = () => {
  const { user } = useAuth();

  const [statsData, setStatsData] = useState({
    activeOps: 0,
    totalApps: 0,
    shortlisted: 0,
    selected: 0,
    offersSent: 0,
    accepted: 0,
    hired: 0
  });

  const [hiringRecords, setHiringRecords] = useState([]);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [appsRes, opsRes, hiringRes] = await Promise.all([
          api.get('/organization/applications'),
          api.get('/organization/opportunities'),
          api.get('/organization/hiring')
        ]);
        
        let apps = appsRes.data?.data || [];
        let ops = opsRes.data?.data || [];
        let hires = hiringRes.data?.data || [];
        
        setHiringRecords(hires);

        setStatsData({
          activeOps: ops.filter(o => o.status === 'published').length,
          totalApps: apps.length,
          shortlisted: apps.filter(a => a.status === 'shortlisted').length,
          selected: apps.filter(a => a.status === 'selected').length,
          offersSent: hires.filter(h => h.status === 'offer_sent').length,
          accepted: hires.filter(h => h.status === 'accepted').length,
          hired: hires.filter(h => h.status === 'hired').length
        });
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, []);

  const handleMarkHired = async (id) => {
    try {
      await api.patch(`/organization/hiring/${id}/status`, { status: 'hired' });
      alert('Candidate marked as hired!');
      window.location.reload();
    } catch (e) {
      alert('Failed to update status');
    }
  }

  const stats = [
    { label: 'Selected Candidates', value: statsData.selected, icon: CheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Offers Sent', value: statsData.offersSent, icon: FileText, color: 'text-brand-600', bg: 'bg-brand-100' },
    { label: 'Accepted', value: statsData.accepted, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Hired', value: statsData.hired, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Organization Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome, {user?.name}</p>
      </div>

      <h2 className="text-xl font-bold mb-4">Hiring Pipeline</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold mb-4">Recent Hiring Records</h2>
        {hiringRecords.length > 0 ? (
          <div className="space-y-4">
            {hiringRecords.map(record => (
              <div key={record._id} className="flex items-center justify-between p-4 border rounded-xl bg-gray-50">
                <div>
                  <p className="font-bold">{record.candidate?.name}</p>
                  <p className="text-sm text-gray-600">{record.opportunity?.title}</p>
                  <p className="text-xs font-semibold uppercase text-brand-600 mt-1">Status: {record.status.replace('_', ' ')}</p>
                </div>
                {record.status === 'accepted' && (
                  <button onClick={() => handleMarkHired(record._id)} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg text-sm">
                    Complete Hiring
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No offers sent yet.</p>
        )}
      </div>
    </div>
  );
};
