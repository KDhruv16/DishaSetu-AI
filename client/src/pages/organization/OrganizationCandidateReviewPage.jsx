import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, AlertCircle, ArrowLeft, Download, CheckCircle, XCircle, Clock, MapPin, Briefcase, GraduationCap, Award, Brain, FileText, Check } from 'lucide-react';
import api from '../../utils/api';

export const OrganizationCandidateReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'shortlisted' | 'rejected' | 'selected' | null
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerForm, setOfferForm] = useState({
    role: '',
    compensation: '',
    joiningDate: '',
    employmentType: 'Full Time',
    additionalNotes: ''
  });
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    title: 'Technical Interview',
    type: 'technical',
    scheduledDate: '',
    startTime: '10:00',
    endTime: '11:00',
    mode: 'online',
    meetingLink: '',
    location: '',
    instructions: ''
  });
  const [scheduling, setScheduling] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);

  useEffect(() => {
    fetchApplicationDetails();
    fetchNotes();
  }, [id]);

  const fetchNotes = async () => {
    try {
      const res = await api.get(`/organization/notes/application/${id}`);
      if (res.data?.success) setNotes(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    try {
      setSavingNote(true);
      const res = await api.post('/organization/notes', { applicationId: id, content: newNote });
      if (res.data?.success) {
        setNotes([res.data.data, ...notes]);
        setNewNote('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/organization/applications/${id}`);
      if (res.data?.success) {
        setData(res.data.data);
      } else {
        setError('Failed to load candidate information');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching candidate details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if ((newStatus === 'shortlisted' || newStatus === 'interview' || newStatus === 'rejected' || newStatus === 'selected') && confirmAction !== newStatus) {
      setConfirmAction(newStatus);
      return;
    }

    try {
      setUpdating(true);
      const res = await api.patch(`/organization/applications/${id}/status`, { status: newStatus });
      if (res.data?.success) {
        setData(prev => ({
          ...prev,
          application: {
            ...prev.application,
            status: newStatus,
            statusHistory: res.data.data.statusHistory
          }
        }));
        setConfirmAction(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleGenerateEvaluation = async () => {
    try {
      setEvaluating(true);
      const res = await api.post(`/organization/applications/${id}/evaluate`);
      if (res.data?.success) {
        setData(prev => ({
          ...prev,
          application: {
            ...prev.application,
            evaluation: res.data.data
          }
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate AI evaluation');
    } finally {
      setEvaluating(false);
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    try {
      setScheduling(true);
      const res = await api.post('/organization/interviews', {
        applicationId: application._id,
        ...interviewForm
      });
      if (res.data?.success) {
        alert('Interview scheduled successfully!');
        setShowInterviewModal(false);
        // Maybe fetch applications again or redirect
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setScheduling(false);
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      setSubmittingOffer(true);
      const res = await api.post('/organization/hiring', {
        applicationId: application._id,
        offerDetails: offerForm
      });
      if (res.data?.success) {
        alert('Offer created successfully!');
        setShowOfferModal(false);
        // Maybe fetch applications again or set status
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create offer');
    } finally {
      setSubmittingOffer(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto mt-12 bg-red-50 text-red-600 p-6 rounded-2xl flex flex-col items-center text-center">
        <AlertCircle className="w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="mb-6">{error || 'Candidate not found'}</p>
        <button 
          onClick={() => navigate('/organization/applications')}
          className="px-6 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700"
        >
          Back to Applications
        </button>
      </div>
    );
  }

  const { application, candidate, opportunity, match } = data;
  const profile = candidate.profile;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'applied':
        return <span className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-gray-700 bg-gray-100 rounded-lg"><Clock className="w-4 h-4" /> Applied</span>;
      case 'under_review':
        return <span className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg"><Loader className="w-4 h-4" /> Under Review</span>;
      case 'shortlisted':
        return <span className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg"><CheckCircle className="w-4 h-4" /> Shortlisted</span>;
      case 'interview':
        return <span className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg"><Clock className="w-4 h-4" /> Interview</span>;
      case 'selected':
        return <span className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg"><CheckCircle className="w-4 h-4" /> Selected</span>;
      case 'hired':
        return <span className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-green-700 bg-green-50 border border-green-200 rounded-lg"><CheckCircle className="w-4 h-4" /> Hired</span>;
      case 'rejected':
        return <span className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg"><XCircle className="w-4 h-4" /> Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <button 
        onClick={() => navigate('/organization/applications')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Applications
      </button>

      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{candidate.name}</h1>
            {getStatusBadge(application.status)}
          </div>
          <p className="text-gray-600 flex items-center gap-2">
            Applicant for <span className="font-semibold text-gray-900">{opportunity.title}</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">Applied on {new Date(application.appliedAt).toLocaleDateString()}</p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col items-start md:items-end w-full md:w-auto">
          {confirmAction ? (
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-sm text-sm">
              <p className="font-bold text-gray-900 mb-1">
                {confirmAction === 'shortlisted' ? 'Shortlist this candidate?' 
                 : confirmAction === 'interview' ? 'Move candidate to Interview stage?'
                 : confirmAction === 'selected' ? 'Select this candidate?' 
                 : 'Reject this application?'}
              </p>
              <p className="text-gray-500 mb-3">
                {confirmAction === 'shortlisted' 
                  ? 'The candidate will be moved to the Shortlisted stage.' 
                  : confirmAction === 'interview'
                  ? 'The candidate will be moved to the Interview stage.'
                  : confirmAction === 'selected'
                  ? 'This will move the application to the Selected stage.'
                  : 'The candidate will be moved to the Rejected stage.'}
              </p>
              <div className="flex gap-2 justify-end">
                <button 
                  onClick={() => setConfirmAction(null)}
                  disabled={updating}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleStatusChange(confirmAction)}
                  disabled={updating}
                  className={`px-3 py-1.5 text-white rounded-lg font-bold transition-colors ${
                    confirmAction === 'shortlisted' || confirmAction === 'interview' || confirmAction === 'selected' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {updating ? 'Updating...' : confirmAction === 'shortlisted' ? 'Shortlist' : confirmAction === 'interview' ? 'Move to Interview' : confirmAction === 'selected' ? 'Select Candidate' : 'Reject'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-end gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Update Status</label>
              <div className="flex flex-wrap gap-2">
                {application.status === 'applied' && (
                  <>
                    <button onClick={() => handleStatusChange('under_review')} disabled={updating} className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-xl text-sm font-bold transition-colors">Start Review</button>
                    <button onClick={() => handleStatusChange('rejected')} disabled={updating} className="px-4 py-2 bg-white text-gray-600 border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl text-sm font-bold transition-colors">Reject</button>
                  </>
                )}
                {application.status === 'under_review' && (
                  <>
                    <button onClick={() => handleStatusChange('shortlisted')} disabled={updating} className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-sm font-bold transition-colors">Shortlist</button>
                    <button onClick={() => handleStatusChange('rejected')} disabled={updating} className="px-4 py-2 bg-white text-gray-600 border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl text-sm font-bold transition-colors">Reject</button>
                  </>
                )}
                {application.status === 'shortlisted' && (
                  <>
                    <button onClick={() => handleStatusChange('interview')} disabled={updating} className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded-xl text-sm font-bold transition-colors">Move to Interview</button>
                    <button onClick={() => setShowInterviewModal(true)} disabled={updating} className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded-xl text-sm font-bold transition-colors">Schedule Interview</button>
                    <button onClick={() => handleStatusChange('rejected')} disabled={updating} className="px-4 py-2 bg-white text-gray-600 border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl text-sm font-bold transition-colors">Reject</button>
                  </>
                )}
                {application.status === 'interview' && (
                  <>
                    <button onClick={() => setShowInterviewModal(true)} disabled={updating} className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded-xl text-sm font-bold transition-colors">{application.interview ? 'Reschedule Interview' : 'Schedule Interview'}</button>
                    <button onClick={() => handleStatusChange('selected')} disabled={updating} className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-sm font-bold transition-colors">Select Candidate</button>
                    <button onClick={() => handleStatusChange('rejected')} disabled={updating} className="px-4 py-2 bg-white text-gray-600 border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl text-sm font-bold transition-colors">Reject</button>
                  </>
                )}
                {application.status === 'selected' && (
                  <>
                    <button onClick={() => { setOfferForm({...offerForm, role: opportunity.title}); setShowOfferModal(true); }} disabled={updating} className="px-4 py-2 bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 rounded-xl text-sm font-bold transition-colors">Create Offer</button>
                    <button onClick={() => handleStatusChange('rejected')} disabled={updating} className="px-4 py-2 bg-white text-gray-600 border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl text-sm font-bold transition-colors">Reject</button>
                  </>
                )}
                {application.status === 'rejected' && (
                  <p className="text-sm text-gray-500 italic mt-2">Application is closed.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Candidate Evaluation Section */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm overflow-hidden relative">
            {/* Background decorative element */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 blur-2xl opacity-70"></div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Brain className="w-6 h-6 text-indigo-600" />
                AI Candidate Evaluation
              </h2>
              
              {!application.evaluation ? (
                <button 
                  onClick={handleGenerateEvaluation}
                  disabled={evaluating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {evaluating ? (
                    <><Loader className="w-4 h-4 animate-spin" /> Analyzing candidate evidence...</>
                  ) : (
                    'Generate Evaluation'
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Evaluation Ready
                  </span>
                  <button 
                    onClick={handleGenerateEvaluation}
                    disabled={evaluating}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline disabled:opacity-50"
                  >
                    {evaluating ? 'Re-evaluating...' : 'Re-evaluate'}
                  </button>
                </div>
              )}
            </div>

            {application.evaluation && (
              <div className="space-y-6 relative z-10">
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <h3 className="text-sm font-bold text-indigo-900 mb-1">AI Summary</h3>
                  <p className="text-sm text-indigo-800/80 leading-relaxed">{application.evaluation.summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Key Strengths
                    </h3>
                    <ul className="space-y-2">
                      {application.evaluation.strengths?.map((strength, i) => (
                        <li key={i} className="text-sm text-emerald-900 flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">•</span> {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                    <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> Skill Gaps
                    </h3>
                    <ul className="space-y-2">
                      {application.evaluation.skillGaps?.map((gap, i) => (
                        <li key={i} className="text-sm text-amber-900 flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span> {gap}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Evidence Analysis</h3>
                  
                  {[
                    { label: 'Experience Relevance', data: application.evaluation.experienceAnalysis },
                    { label: 'Resume Alignment', data: application.evaluation.resumeAlignment },
                    { label: 'Assessment Evidence', data: application.evaluation.assessmentEvidence },
                    { label: 'Certification Relevance', data: application.evaluation.certificationRelevance },
                    { label: 'Project Relevance', data: application.evaluation.projectRelevance },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-48 shrink-0">
                        <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                        <div className="mt-1">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold capitalize
                            ${item.data?.level === 'strong' ? 'bg-emerald-100 text-emerald-700' : 
                              item.data?.level === 'moderate' ? 'bg-blue-100 text-blue-700' :
                              item.data?.level === 'limited' ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-500'}`}
                          >
                            {item.data?.level?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{item.data?.evidence}</p>
                        {item.data?.details && item.data.details !== 'Not available' && (
                          <p className="text-xs text-gray-500 mt-1">{item.data.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {application.evaluation.areasToVerify?.length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Areas to Verify in Interview</h3>
                    <ul className="space-y-1.5">
                      {application.evaluation.areasToVerify.map((area, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-indigo-400 mt-0.5 font-bold">?</span> {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="text-[10px] text-gray-400 text-right pt-2">
                  Evaluation generated: {new Date(application.evaluation.evaluatedAt || Date.now()).toLocaleString()}
                </div>
              </div>
            )}
          </section>

          {/* Candidate Profile Details */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-400" />
              Candidate Profile
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Email</p>
                <p className="font-semibold text-gray-900">{candidate.email}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Location</p>
                <p className="font-semibold text-gray-900">{profile?.personal?.location || profile?.personal?.city || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Education</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                  {profile?.personal?.degree || 'Not specified'} {profile?.personal?.branch && `in ${profile.personal.branch}`}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Target Role</p>
                <p className="font-semibold text-gray-900">{profile?.career?.targetRole || 'Not specified'}</p>
              </div>
            </div>
          </section>

          {/* Skill Matching Section */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Brain className="w-5 h-5 text-gray-400" />
                Skill Alignment
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${match.skillMatch >= 40 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {match.matchPercentage}% Overall Match
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-3">
                  ✓ Matched Skills ({match.matchedSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {match.matchedSkills.length > 0 ? (
                    match.matchedSkills.map(skill => (
                      <span key={skill} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No skills matched</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-3">
                  ✗ Missing Skills ({match.missingSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {match.missingSkills.length > 0 ? (
                    match.missingSkills.map(skill => (
                      <span key={skill} className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                      <Check className="w-4 h-4" /> Candidate has all required skills
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                <strong className="text-gray-900">Why this matches:</strong> {match.whyItMatches}
              </p>
            </div>
          </section>

          {/* Assessment & Resume (Read-only data from existing platform) */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              Platform Assessments & Resume
            </h2>
            
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-2">Resume ATS Scan</h3>
                {candidate.resume ? (
                  <div>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center font-bold text-lg text-primary">
                        {candidate.resume.atsScore?.overall || 0}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{candidate.resume.fileName || 'Submitted Resume'}</p>
                        <p className="text-xs text-gray-500">Submitted on: {new Date(candidate.resume.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowResumeModal(true)}
                      className="text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" /> View Resume Details
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No resume analysis available.</p>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-2">Mock Interview Performance</h3>
                {candidate.assessments && candidate.assessments.completed ? (
                  <div>
                     <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center font-bold text-lg text-indigo-600">
                        {candidate.assessments.overallScore?.overall || candidate.assessments.scores?.overall || 0}%
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{candidate.assessments.jobRole || 'Technical Interview'}</p>
                        <p className="text-xs text-gray-500">Completed on: {new Date(candidate.assessments.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No interview assessments completed.</p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-gray-400" />
              Certifications
            </h2>
            
            {profile?.certifications && profile.certifications.length > 0 ? (
              <ul className="space-y-4 text-sm">
                {profile.certifications.map((cert, i) => (
                  <li key={i} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <p className="font-bold text-gray-900">{cert.title || cert.name}</p>
                    <p className="text-gray-500">{cert.issuer || cert.organization}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No certifications listed.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              Projects
            </h2>
            
            {profile?.projects && profile.projects.length > 0 ? (
              <ul className="space-y-4 text-sm">
                {profile.projects.map((proj, i) => (
                  <li key={i} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <p className="font-bold text-gray-900">{proj.title || proj.name}</p>
                    <p className="text-gray-500 mt-1 line-clamp-3">{proj.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No projects listed.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Application Timeline
            </h2>
            
            <div className="space-y-4">
              {application.statusHistory && application.statusHistory.length > 0 ? (
                application.statusHistory.map((hist, idx) => (
                  <div key={idx} className="relative pl-6 pb-4 last:pb-0">
                    <div className="absolute left-2 top-1.5 w-2 h-2 rounded-full bg-primary ring-4 ring-primary/10"></div>
                    {idx !== application.statusHistory.length - 1 && (
                      <div className="absolute left-[11px] top-4 bottom-0 w-px bg-gray-200"></div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-gray-900 capitalize">
                        {hist.status.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(hist.changedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="relative pl-6">
                  <div className="absolute left-2 top-1.5 w-2 h-2 rounded-full bg-primary ring-4 ring-primary/10"></div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 capitalize">
                      {application.status.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(application.appliedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              Recruiter Notes
            </h2>
            
            <div className="space-y-4 mb-4 max-h-64 overflow-y-auto pr-2">
              {notes.length > 0 ? (
                notes.map(note => (
                  <div key={note._id} className="p-3 bg-yellow-50/50 border border-yellow-100 rounded-lg text-sm">
                    <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
                    <p className="text-[10px] text-gray-400 mt-2 text-right">{new Date(note.createdAt).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No notes yet.</p>
              )}
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <textarea 
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a private note..."
                className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-brand-500 mb-2"
                rows="3"
              />
              <button 
                onClick={handleSaveNote}
                disabled={savingNote || !newNote.trim()}
                className="w-full px-4 py-2 bg-brand-600 text-white font-bold text-sm rounded-lg hover:bg-brand-700 disabled:opacity-50"
              >
                {savingNote ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {showInterviewModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[24px] pb-[24px] px-[20px] bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 max-h-[calc(100vh-48px)] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Schedule Interview</h2>
              <button onClick={() => setShowInterviewModal(false)} className="text-gray-500 hover:text-gray-800"><XCircle className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleScheduleInterview} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Title</label>
                <input type="text" required value={interviewForm.title} onChange={e => setInterviewForm({...interviewForm, title: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Type</label>
                  <select value={interviewForm.type} onChange={e => setInterviewForm({...interviewForm, type: e.target.value})} className="w-full px-3 py-2 border rounded-xl">
                    <option value="technical">Technical</option>
                    <option value="hr">HR</option>
                    <option value="managerial">Managerial</option>
                    <option value="final">Final</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Date</label>
                  <input type="date" required value={interviewForm.scheduledDate} onChange={e => setInterviewForm({...interviewForm, scheduledDate: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Start Time</label>
                  <input type="time" required value={interviewForm.startTime} onChange={e => setInterviewForm({...interviewForm, startTime: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">End Time</label>
                  <input type="time" required value={interviewForm.endTime} onChange={e => setInterviewForm({...interviewForm, endTime: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Mode</label>
                <select value={interviewForm.mode} onChange={e => setInterviewForm({...interviewForm, mode: e.target.value})} className="w-full px-3 py-2 border rounded-xl">
                  <option value="online">Online</option>
                  <option value="offline">Offline / In-person</option>
                  <option value="phone">Phone</option>
                </select>
              </div>
              {interviewForm.mode === 'online' && (
                <div>
                  <label className="block text-sm font-semibold mb-1">Meeting Link</label>
                  <input type="url" value={interviewForm.meetingLink} onChange={e => setInterviewForm({...interviewForm, meetingLink: e.target.value})} className="w-full px-3 py-2 border rounded-xl" placeholder="https://meet.google.com/..." />
                </div>
              )}
              {interviewForm.mode === 'offline' && (
                <div>
                  <label className="block text-sm font-semibold mb-1">Location</label>
                  <input type="text" value={interviewForm.location} onChange={e => setInterviewForm({...interviewForm, location: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold mb-1">Instructions (Optional)</label>
                <textarea value={interviewForm.instructions} onChange={e => setInterviewForm({...interviewForm, instructions: e.target.value})} className="w-full px-3 py-2 border rounded-xl" rows={3}></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowInterviewModal(false)} className="px-4 py-2 border rounded-xl text-gray-700">Cancel</button>
                <button type="submit" disabled={scheduling} className="px-4 py-2 bg-brand-600 text-white font-bold rounded-xl disabled:opacity-50">
                  {scheduling ? 'Scheduling...' : 'Schedule Interview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[24px] pb-[24px] px-[20px] bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 max-h-[calc(100vh-48px)] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create Offer Details</h2>
              <button onClick={() => setShowOfferModal(false)} className="text-gray-500 hover:text-gray-800"><XCircle className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleCreateOffer} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Role</label>
                <input type="text" required value={offerForm.role} onChange={e => setOfferForm({...offerForm, role: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Compensation</label>
                  <input type="text" required value={offerForm.compensation} onChange={e => setOfferForm({...offerForm, compensation: e.target.value})} placeholder="e.g. ₹8 LPA" className="w-full px-3 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Employment Type</label>
                  <select value={offerForm.employmentType} onChange={e => setOfferForm({...offerForm, employmentType: e.target.value})} className="w-full px-3 py-2 border rounded-xl">
                    <option value="Full Time">Full Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Joining Date</label>
                <input type="date" required value={offerForm.joiningDate} onChange={e => setOfferForm({...offerForm, joiningDate: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Additional Notes (Optional)</label>
                <textarea value={offerForm.additionalNotes} onChange={e => setOfferForm({...offerForm, additionalNotes: e.target.value})} className="w-full px-3 py-2 border rounded-xl" rows={3}></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowOfferModal(false)} className="px-4 py-2 border rounded-xl text-gray-700">Cancel</button>
                <button type="submit" disabled={submittingOffer} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl disabled:opacity-50">
                  {submittingOffer ? 'Creating...' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResumeModal && candidate?.resume && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[24px] pb-[24px] px-[20px] bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[calc(100vh-48px)] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  {candidate.resume.fileName || 'Candidate Resume'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Submitted on {new Date(candidate.resume.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setShowResumeModal(false)} className="text-gray-500 hover:text-gray-800 p-1"><XCircle className="w-6 h-6"/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 whitespace-pre-wrap font-mono text-sm text-gray-800">
                {candidate.resume.resumeText || 'No text content available.'}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100 mt-4 flex justify-end shrink-0">
              <button onClick={() => setShowResumeModal(false)} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
