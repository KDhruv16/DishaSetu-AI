import Application from '../models/Application.js';
import Opportunity from '../models/Opportunity.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import Interview from '../models/Interview.js';
import OrganizationInterview from '../models/OrganizationInterview.js';
import { calculateOpportunityMatch } from '../services/matchingService.js';
import { generateCandidateEvaluation } from '../services/evaluationService.js';

// @desc    Get all applications for the organization
// @route   GET /api/organization/applications
// @access  Private (Organization only)
export const getOrganizationApplications = async (req, res) => {
  try {
    const { opportunityId, status, search, page = 1, limit = 20 } = req.query;
    
    // Base query restricts to this organization
    const query = { organization: req.user._id };
    
    if (opportunityId && opportunityId !== 'All') {
      query.opportunity = opportunityId;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim()) {
      // Find candidate users matching the search
      const matchingCandidates = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      const candidateIds = matchingCandidates.map(c => c._id);
      query.candidate = { $in: candidateIds };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await Application.find(query)
      .populate('opportunity', 'title type location workMode')
      .populate('candidate', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Application.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: applications.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: applications,
    });
  } catch (error) {
    console.error('getOrganizationApplications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Get detailed application and candidate review info
// @route   GET /api/organization/applications/:id
// @access  Private (Organization only)
export const getApplicationDetails = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      organization: req.user._id,
    })
    .populate('opportunity')
    .populate('candidate', 'name email')
    .populate('resume');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized access',
      });
    }

    const candidateId = application.candidate._id;

    // Fetch existing candidate data securely
    const [profile, latestResumeAnalysis, interviewAnalysis, orgInterview] = await Promise.all([
      Profile.findOne({ user: candidateId }),
      ResumeAnalysis.findOne({ userId: candidateId }).sort({ createdAt: -1 }),
      Interview.findOne({ userId: candidateId }).sort({ createdAt: -1 }),
      OrganizationInterview.findOne({ application: application._id }).sort({ createdAt: -1 })
    ]);

    // Snapshot behavior: use application.resume if available, fallback to latest
    const resumeAnalysis = application.resume || latestResumeAnalysis;

    // Compute deterministic match
    const match = calculateOpportunityMatch(application.opportunity, profile);

    return res.status(200).json({
      success: true,
      data: {
        application: {
          _id: application._id,
          status: application.status,
          appliedAt: application.createdAt,
          updatedAt: application.updatedAt,
          statusHistory: application.statusHistory || [],
          evaluation: application.evaluation || null,
          interview: orgInterview || null,
        },
        opportunity: {
          _id: application.opportunity._id,
          title: application.opportunity.title,
          skills: application.opportunity.skills,
        },
        candidate: {
          _id: application.candidate._id,
          name: application.candidate.name,
          email: application.candidate.email,
          profile: profile || null,
          resume: resumeAnalysis || null,
          assessments: interviewAnalysis || null,
        },
        match,
      },
    });
  } catch (error) {
    console.error('getApplicationDetails error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Update application status
// @route   PATCH /api/organization/applications/:id/status
// @access  Private (Organization only)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['applied', 'under_review', 'shortlisted', 'selected', 'hired', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const application = await Application.findOne({
      _id: req.params.id,
      organization: req.user._id, // Strict ownership check
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized access',
      });
    }

    const currentStatus = application.status;

    // Validate state transitions
    const validTransitions = {
      'applied': ['under_review', 'rejected'],
      'under_review': ['shortlisted', 'rejected'],
      'shortlisted': ['selected', 'rejected'],
      'selected': ['hired', 'rejected'],
      'rejected': [], 
      'hired': []
    };

    if (!validTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transition from ${currentStatus} to ${status}`,
      });
    }

    // Step 3 — Interview completion requirement
    if (status === 'selected') {
      const completedInterview = await OrganizationInterview.findOne({
        application: application._id,
        status: 'completed'
      });
      
      if (!completedInterview) {
        return res.status(400).json({
          success: false,
          message: 'Cannot select candidate until an interview is completed.'
        });
      }
    }

    application.status = status;
    application.statusHistory = application.statusHistory || [];
    application.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user._id
    });

    await application.save();

    return res.status(200).json({
      success: true,
      data: application,
      message: 'Status updated successfully',
    });
  } catch (error) {
    console.error('updateApplicationStatus error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Generate AI Evaluation for an application
// @route   POST /api/organization/applications/:id/evaluate
// @access  Private (Organization only)
export const evaluateApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      organization: req.user._id, // Strict ownership check
    }).populate('opportunity');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized access',
      });
    }

    const candidateId = application.candidate;

    // Fetch existing candidate data securely
    const [profile, resumeAnalysis, interviewAnalysis] = await Promise.all([
      Profile.findOne({ user: candidateId }),
      ResumeAnalysis.findOne({ userId: candidateId }).sort({ createdAt: -1 }),
      Interview.findOne({ userId: candidateId }).sort({ createdAt: -1 })
    ]);

    // Re-calculate deterministic skill match
    const matchData = calculateOpportunityMatch(application.opportunity, profile);

    // Run AI Evaluation
    const evaluation = await generateCandidateEvaluation(
      application.opportunity,
      profile,
      resumeAnalysis,
      interviewAnalysis,
      matchData
    );

    evaluation.evaluatedAt = new Date();

    // Save evaluation to application
    application.evaluation = evaluation;
    await application.save();

    return res.status(200).json({
      success: true,
      data: evaluation,
      message: 'Evaluation generated successfully',
    });
  } catch (error) {
    console.error('evaluateApplication error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error generating evaluation',
    });
  }
};
