import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Users, MessageSquare, CheckCircle } from 'lucide-react';

export const OrganizationDashboardPage = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Active Opportunities', value: '0', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Applications', value: '0', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Shortlisted', value: '0', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Interviews', value: '0', icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Hired', value: '0', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Organization Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
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

      <div className="bg-primary/5 rounded-xl border border-primary/20 p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-bold text-primary mb-2">Welcome to DishaSetu AI Organization Portal</h2>
          <p className="text-gray-600 mb-6">
            Phase 1 is currently active. Please complete your Organization Profile to proceed. Opportunity creation, candidate evaluation, and hiring workflows will be unlocked in upcoming phases.
          </p>
        </div>
      </div>
    </div>
  );
};
