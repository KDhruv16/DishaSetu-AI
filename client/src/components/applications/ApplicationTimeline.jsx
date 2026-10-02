import React from 'react';
import {
  Check,
  Clock,
  X,
  Calendar,
  Video,
  MapPin,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const ApplicationTimeline = ({ application, interview, compact = false }) => {
  if (!application) return null;

  const currentStatus = application.status || 'applied';
  const history = application.statusHistory || [];
  const isRejected = currentStatus === 'rejected';

  // Standard lifecycle stages in order
  const STAGES = [
    { key: 'applied', label: 'Application Submitted', desc: 'Application & resume received by system' },
    { key: 'received', label: 'Application Received', desc: 'Application acknowledged by company recruiting team' },
    { key: 'under_review', label: 'Under Review', desc: 'Profile, skills, and qualifications being assessed' },
    { key: 'shortlisted', label: 'Shortlisted', desc: 'Candidate shortlisted for interview rounds' },
    { key: 'interview', label: 'Interview', desc: 'Technical / HR interview scheduling & evaluation' },
    { key: 'selected', label: 'Selected', desc: 'Candidate selected for offer / onboarding' },
  ];

  // Helper to determine status order index
  const statusRank = {
    applied: 1,
    received: 2,
    under_review: 3,
    shortlisted: 4,
    interview: 5,
    selected: 6,
    hired: 6,
    rejected: -1,
  };

  const currentRank = statusRank[currentStatus] || 1;

  // Find history timestamp for a given status
  const getHistoryEntry = (stageKey) => {
    if (stageKey === 'received') {
      // Received timestamp matches applied or first history entry
      return history.find((h) => h.status === 'applied') || { changedAt: application.createdAt || application.appliedAt };
    }
    return history.find((h) => h.status === stageKey);
  };

  const rejectionEntry = history.find((h) => h.status === 'rejected');

  if (compact) {
    // Compact inline timeline for cards
    return (
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
        {STAGES.map((stg, i) => {
          const rank = statusRank[stg.key];
          const isPassed = !isRejected && currentRank > rank;
          const isCurrent = !isRejected && currentRank === rank;
          const isPending = !isRejected && currentRank < rank;

          return (
            <React.Fragment key={stg.key}>
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  isPassed
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : isCurrent
                    ? 'bg-brand-50 text-brand-700 border border-brand-300 font-bold ring-2 ring-brand-100'
                    : isRejected
                    ? 'bg-slate-100 text-slate-400'
                    : 'bg-slate-50 text-slate-400'
                }`}
              >
                {isPassed && <Check className="w-3 h-3 text-emerald-600" />}
                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />}
                {isPending && <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                <span>{stg.label.replace('Application ', '')}</span>
              </div>
              {i < STAGES.length - 1 && (
                <div
                  className={`w-3 h-0.5 shrink-0 ${
                    !isRejected && currentRank > rank ? 'bg-emerald-300' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
        {isRejected && (
          <>
            <div className="w-3 h-0.5 shrink-0 bg-rose-200" />
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
              <X className="w-3 h-3 text-rose-600" />
              <span>Not Selected</span>
            </div>
          </>
        )}
      </div>
    );
  }

  // Full detailed timeline for modal
  return (
    <div className="space-y-6">
      <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {STAGES.map((stg) => {
          const rank = statusRank[stg.key];
          const histEntry = getHistoryEntry(stg.key);
          const isPassed = !isRejected && currentRank > rank;
          const isCurrent = !isRejected && currentRank === rank;
          const isFuture = isRejected ? true : currentRank < rank;

          let icon = null;
          let nodeClass = '';

          if (isPassed) {
            icon = <Check className="w-3.5 h-3.5 text-white" />;
            nodeClass = 'bg-emerald-600 text-white ring-4 ring-emerald-100';
          } else if (isCurrent) {
            icon = <span className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />;
            nodeClass = 'bg-brand-600 text-white ring-4 ring-brand-100 animate-pulse';
          } else {
            icon = <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />;
            nodeClass = 'bg-slate-100 text-slate-400 border border-slate-300';
          }

          return (
            <div key={stg.key} className="relative group">
              {/* Timeline Bullet Node */}
              <div
                className={`absolute -left-6 top-1 w-6 h-6 rounded-full flex items-center justify-center transition-all ${nodeClass}`}
              >
                {icon}
              </div>

              {/* Stage Content */}
              <div className="pl-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-sm font-bold ${
                        isCurrent
                          ? 'text-brand-700'
                          : isPassed
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {stg.label}
                    </h4>

                    {isCurrent && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-brand-100 text-brand-700 px-2 py-0.5 rounded-md">
                        Current Status
                      </span>
                    )}
                  </div>

                  {histEntry?.changedAt && (
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(histEntry.changedAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>

                <p
                  className={`text-xs mt-0.5 ${
                    isCurrent || isPassed ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {stg.desc}
                </p>

                {/* Recruiter Note if attached to this step */}
                {histEntry?.note && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800">Recruiter Note: </span>
                      {histEntry.note}
                    </div>
                  </div>
                )}

                {/* Rich Interview Box if stage is interview and an interview exists */}
                {stg.key === 'interview' && interview && (
                  <div className="mt-3 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                          <Video className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-indigo-950">
                            {interview.title || 'Scheduled Interview Round'}
                          </h5>
                          <p className="text-[11px] text-indigo-700 capitalize">
                            Type: {interview.type || 'Technical'} • Mode: {interview.mode || 'Online'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          interview.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : interview.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-indigo-200/60 text-indigo-900'
                        }`}
                      >
                        {interview.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-indigo-900 pt-1 border-t border-indigo-100">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        <span>
                          {new Date(interview.scheduledDate).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                          {interview.startTime && ` • ${interview.startTime} - ${interview.endTime}`}
                        </span>
                      </div>

                      {interview.meetingLink && (
                        <a
                          href={interview.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold underline truncate"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Join Video Meeting</span>
                        </a>
                      )}

                      {interview.location && (
                        <div className="flex items-center gap-1 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{interview.location}</span>
                        </div>
                      )}
                    </div>

                    {interview.instructions && (
                      <p className="text-[11px] text-indigo-800/80 bg-white/60 p-2 rounded-lg">
                        <strong>Instructions:</strong> {interview.instructions}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Rejection Stage if rejected */}
        {isRejected && (
          <div className="relative group">
            <div className="absolute -left-6 top-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center ring-4 ring-rose-100">
              <X className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="pl-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-rose-700">Application Not Selected</h4>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
                    Closed
                  </span>
                </div>
                {rejectionEntry?.changedAt && (
                  <span className="text-xs text-rose-500 font-medium">
                    {new Date(rejectionEntry.changedAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
              <p className="text-xs text-rose-600 mt-0.5">
                The recruiter has reviewed your application and decided not to move forward at this time.
              </p>
              {rejectionEntry?.note && (
                <div className="mt-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-xs text-rose-800">
                  <strong>Feedback / Note:</strong> {rejectionEntry.note}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
