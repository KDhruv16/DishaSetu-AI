import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, MapPin, Briefcase, Calendar, Loader, AlertCircle, Eye } from 'lucide-react';
import api from '../../utils/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const OrganizationOpportunitiesPage = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/organization/opportunities');
      if (res.data?.success) {
        setOpportunities(res.data.data);
      } else {
        setError('Failed to load opportunities');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete Opportunity?\n\nThis action cannot be undone.')) {
      return;
    }

    try {
      const res = await api.delete(`/organization/opportunities/${id}`);
      if (res.data?.success) {
        setOpportunities(opportunities.filter(opp => opp._id !== id));
      } else {
        alert(res.data?.message || 'Failed to delete opportunity');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting opportunity');
    }
  };

  const filteredOpportunities = opportunities.filter(opp => {
    if (filter === 'All') return true;
    if (filter === 'Draft') return opp.status === 'draft';
    if (filter === 'Published') return opp.status === 'published';
    if (filter === 'Closed') return opp.status === 'closed';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto pb-12">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900 tracking-tight">My Opportunities</h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Create and manage your organization's job and internship postings.
          </p>
        </div>
        <div className="shrink-0">
          <Link to="/organization/opportunities/create">
            <Button variant="primary" className="shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Opportunity
            </Button>
          </Link>
        </div>
      </div>

      {/* Segmented Filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'Draft', 'Published', 'Closed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${filter === f
                ? 'bg-brand-50 text-brand-900 border border-brand-200 shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader className="w-10 h-10 text-brand-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-5 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={fetchOpportunities} className="ml-auto text-xs uppercase tracking-wider font-bold text-rose-800 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors">
            Try Again
          </button>
        </div>
      ) : filteredOpportunities.length === 0 ? (
        /* Empty State */
        <Card className="max-w-2xl border-slate-200 shadow-sm p-10 sm:p-14 text-center mx-auto mt-4">
          <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-8 ring-brand-50/50">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold font-display text-slate-900 mb-2">
            {filter === 'All' ? 'No opportunities yet' : `No ${filter.toLowerCase()} opportunities`}
          </h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
            {filter === 'All'
              ? 'Create your first opportunity to start hiring and connecting with talented candidates.'
              : `You don't have any opportunities currently matching the ${filter.toLowerCase()} status.`}
          </p>
          {filter === 'All' && (
            <Link to="/organization/opportunities/create">
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Opportunity
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opp) => (
            <Card key={opp._id} className="flex flex-col overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow group bg-white">
              <div className="p-6 flex-1 flex flex-col">

                {/* Card Header & Badge */}
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h3 className="text-[17px] font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-brand-700 transition-colors" title={opp.title}>
                    {opp.title}
                  </h3>
                  <span className={`shrink-0 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${opp.status === 'published' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' :
                      opp.status === 'closed' ? 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20' :
                        'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'
                    }`}>
                    {opp.status}
                  </span>
                </div>

                {/* Metadata */}
                <div className="space-y-2.5 mt-3 text-[13px] text-slate-600 font-medium">
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="line-clamp-1">{opp.type}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="line-clamp-1">{opp.location} • {opp.workMode}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Deadline: {opp.deadline || 'N/A'}</span>
                  </div>
                </div>

                <div className="mt-auto pt-5">
                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                    <div className="text-xs font-medium text-slate-500">
                      <span className="text-slate-900 font-bold text-sm">{opp.applicationCount || 0}</span> Application{opp.applicationCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-100 flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => navigate(`/organization/opportunities/edit/${opp._id}`)}
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 font-semibold text-xs shadow-none"
                >
                  <Edit className="w-3.5 h-3.5 mr-1.5" />
                  Edit
                </Button>
                <Button
                  type="button"
                  onClick={() => handleDelete(opp._id)}
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border-rose-200 hover:border-rose-300 font-semibold text-xs shadow-none"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
