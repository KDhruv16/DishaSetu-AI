import React, { useState } from 'react';
import {
  X,
  Building2,
  MapPin,
  Briefcase,
  FileText,
  Calendar,
  Sparkles,
  ShieldCheck,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { ApplicationTimeline } from './ApplicationTimeline';
import api from '../../utils/api';

export const ApplicationDetailsModal = ({
  data,
  isOpen,
  onClose,
  onRefresh,
}) => {
  if (!isOpen || !data) return null;

  const { application, interview, hiring } = data;
  const opp = application?.opportunity || {};
  const org = application?.organization || {};
  const resume = application?.resume;
  const [respondingOffer, setRespondingOffer] = useState(false);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'applied':
        return (
          <Badge variant="neutral" size="sm" className="font-bold">
            <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
            Applied
          </Badge>
        );
      case 'under_review':
        return (
          <Badge variant="brand" size="sm" className="font-bold">
            <Clock className="w-3.5 h-3.5 mr-1 text-brand-600 animate-spin" />
            Under Review
          </Badge>
        );
      case 'shortlisted':
        return (
          <Badge variant="success" size="sm" className="font-bold bg-emerald-50 text-emerald-800 border-emerald-200">
            <Award className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Shortlisted
          </Badge>
        );
      case 'interview':
        return (
          <Badge variant="purple" size="sm" className="font-bold bg-purple-50 text-purple-800 border-purple-200">
            <Calendar className="w-3.5 h-3.5 mr-1 text-purple-600" />
            Interview
          </Badge>
        );
      case 'selected':
      case 'hired':
        return (
          <Badge variant="success" size="sm" className="font-bold bg-green-50 text-green-800 border-green-200">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-green-600" />
            Selected
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="danger" size="sm" className="font-bold bg-rose-50 text-rose-800 border-rose-200">
            <X className="w-3.5 h-3.5 mr-1 text-rose-600" />
            Not Selected
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="sm" className="capitalize">
            {status?.replace('_', ' ')}
          </Badge>
        );
    }
  };

  const handleRespondOffer = async (action) => {
    if (!hiring?._id) return;
    if (!confirm(`Are you sure you want to ${action} this job offer?`)) return;

    try {
      setRespondingOffer(true);
      const res = await api.patch(`/candidate/hiring/${hiring._id}/respond`, { action });
      if (res.data?.success) {
        alert(`Offer successfully ${action}ed!`);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update offer response');
    } finally {
      setRespondingOffer(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      {/* Header Section */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {getStatusBadge(application?.status)}
            <Badge variant="neutral" size="sm">
              {opp.type || 'Opportunity'}
            </Badge>
            {opp.workMode && (
              <span className="text-xs text-slate-500 font-medium">
                • {opp.workMode}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
            {opp.title || 'Opportunity Application'}
          </h2>

          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600">
            <span className="flex items-center gap-1 font-semibold text-slate-800">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {opp.organization || org.name || 'Organization'}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {opp.location || 'Location'}
            </span>
            {opp.stipendOrSalary && (
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                {opp.stipendOrSalary}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors shrink-0"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Application Timeline Section */}
      <div className="bg-slate-50/70 rounded-2xl p-5 sm:p-6 border border-slate-200/80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2 uppercase tracking-wider text-xs">
            <Clock className="w-4 h-4 text-brand-600" />
            Application Lifecycle Timeline
          </h3>
          <span className="text-xs text-slate-500">
            Applied on {new Date(application?.createdAt || application?.appliedAt).toLocaleDateString()}
          </span>
        </div>

        <ApplicationTimeline application={application} interview={interview} compact={false} />
      </div>

      {/* ATS Resume Submitted Section */}
      {resume && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  ATS Resume Linked
                </h4>
                <p className="text-xs text-slate-500">
                  {resume.fileName || 'Verified Profile Resume'}
                </p>
              </div>
            </div>

            {resume.overallScore && (
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  {resume.overallScore}% ATS Score
                </span>
              </div>
            )}
          </div>

          {resume.targetRole && (
            <p className="text-xs text-slate-600">
              Target Role evaluated: <strong>{resume.targetRole}</strong>
            </p>
          )}
        </div>
      )}

      {/* Official Offer Box if Offer sent */}
      {hiring && hiring.status !== 'pending_offer' && (
        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <h4 className="text-sm font-bold text-emerald-950">
                Official Job Offer: {hiring.status.replace('_', ' ').toUpperCase()}
              </h4>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-900">
            <p><strong>Role:</strong> {hiring.offerDetails?.role || opp.title}</p>
            <p><strong>Compensation:</strong> {hiring.offerDetails?.compensation || 'Competitive'}</p>
            {hiring.offerDetails?.joiningDate && (
              <p><strong>Joining Date:</strong> {new Date(hiring.offerDetails.joiningDate).toLocaleDateString()}</p>
            )}
            {hiring.offerDetails?.employmentType && (
              <p><strong>Type:</strong> {hiring.offerDetails.employmentType}</p>
            )}
          </div>

          {hiring.offerDetails?.additionalNotes && (
            <p className="text-xs text-emerald-800 bg-white/70 p-2.5 rounded-xl border border-emerald-100">
              <strong>Offer Notes:</strong> {hiring.offerDetails.additionalNotes}
            </p>
          )}

          {hiring.status === 'offer_sent' && (
            <div className="pt-2 flex gap-3">
              <Button
                variant="primary"
                size="sm"
                disabled={respondingOffer}
                onClick={() => handleRespondOffer('accept')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Accept Offer
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={respondingOffer}
                onClick={() => handleRespondOffer('decline')}
                className="border-rose-200 text-rose-700 hover:bg-rose-50"
              >
                Decline Offer
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modal Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Application ID: <code className="text-slate-600 font-mono text-[11px]">{application?._id}</code>
        </span>
        <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
          Close
        </Button>
      </div>
    </Modal>
  );
};
