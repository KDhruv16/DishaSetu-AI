import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Filter, Loader, AlertCircle, ChevronRight, CheckCircle, Clock, XCircle, Search } from 'lucide-react';
import api from '../../utils/api';

export const OrganizationApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Add debouncing for search
    const timer = setTimeout(() => {
      fetchApplications();
    }, 300);
    return () => clearTimeout(timer);
  }, [filter, searchQuery]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filter !== 'All') {
        params.append('status', filter.toLowerCase().replace(' ', '_'));
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      
      const res = await api.get(`/organization/applications?${params.toString()}`);
      if (res.data?.success) {
        setApplications(res.data.data);
      } else {
        setError('Failed to load applications');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching applications');
    } finally {
      setLoading(false);
    }
  };

  // Use applications directly since filtering is now server-side
  const filteredApplications = applications;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'applied':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-gray-700 bg-gray-100 rounded-md"><Clock className="w-3.5 h-3.5" /> Applied</span>;
      case 'under_review':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-md"><Loader className="w-3.5 h-3.5" /> Under Review</span>;
      case 'shortlisted':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md"><CheckCircle className="w-3.5 h-3.5" /> Shortlisted</span>;
      case 'interview':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-md"><Clock className="w-3.5 h-3.5" /> Interview</span>;
      case 'selected':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-md"><CheckCircle className="w-3.5 h-3.5" /> Selected</span>;
      case 'hired':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-md"><CheckCircle className="w-3.5 h-3.5" /> Hired</span>;
      case 'rejected':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-md"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
      default:
        return null;
    }
  };

  // Group by opportunity for better organization
  const groupedApplications = filteredApplications.reduce((acc, app) => {
    const oppId = app.opportunity?._id;
    const oppTitle = app.opportunity?.title || 'Unknown Opportunity';
    if (!acc[oppId]) {
      acc[oppId] = {
        title: oppTitle,
        applications: []
      };
    }
    acc[oppId].applications.push(app);
    return acc;
  }, {});

  const stats = {
    total: applications.length,
    underReview: applications.filter(a => a.status === 'under_review').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Applications Management</h1>
        <p className="text-gray-600 mt-1">Review candidates who have applied to your opportunities.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Applications</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-blue-600">Under Review</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.underReview}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-emerald-600">Shortlisted</p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.shortlisted}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-red-600">Rejected</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 flex-1">
          {['All', 'Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Hired', 'Rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                filter === f 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate or job..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
          <button onClick={fetchApplications} className="ml-auto underline font-medium">Try Again</button>
        </div>
      ) : Object.keys(groupedApplications).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchQuery || filter !== 'All' 
              ? 'Try adjusting your filters or search query.' 
              : 'Applications submitted to your opportunities will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedApplications).map(([oppId, data]) => (
            <div key={oppId} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{data.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{data.applications.length} Application{data.applications.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {data.applications.map((app) => (
                  <div key={app._id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                    <div>
                      <h4 className="font-bold text-gray-900">{app.candidate?.name || 'Unknown Candidate'}</h4>
                      <p className="text-sm text-gray-500 mt-1">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      {getStatusBadge(app.status)}
                      
                      <button
                        onClick={() => navigate(`/organization/applications/${app._id}`)}
                        className="ml-auto sm:ml-0 flex items-center px-4 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        Review Candidate
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
