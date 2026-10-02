import Application from '../models/Application.js';
import Opportunity from '../models/Opportunity.js';
import Hiring from '../models/Hiring.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import OrganizationInterview from '../models/OrganizationInterview.js';
import { notifyApplicationStatusChange } from '../services/notificationService.js';

// @desc    Apply to an opportunity
// @route   POST /api/applications/:opportunityId
// @access  Private (Candidate only)
export const applyToOpportunity = async (req, res) => {
  try {
    const { opportunityId } = req.params;

    // Verify opportunity exists and is published
    const opportunity = await Opportunity.findOne({
      _id: opportunityId,
      status: 'published'
    });

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found or not open for applications',
      });
    }

    // Ensure it's an organization opportunity (legacy ones might not be fully integrated yet)
    if (!opportunity.organizationId) {
      return res.status(400).json({
        success: false,
        message: 'This opportunity requires external application',
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      candidate: req.user._id,
      opportunity: opportunityId,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this opportunity',
      });
    }

    const latestResume = await ResumeAnalysis.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

    const application = await Application.create({
      candidate: req.user._id,
      opportunity: opportunityId,
      organization: opportunity.organizationId,
      resume: latestResume ? latestResume._id : null,
      status: 'applied',
      statusHistory: [
        {
          status: 'applied',
          changedAt: new Date(),
          changedBy: req.user._id
        }
      ]
    });

    // Generate Candidate Notification for application submission
    try {
      await notifyApplicationStatusChange({
        application: {
          _id: application._id,
          candidate: req.user._id,
          opportunity,
        },
        status: 'applied',
        changedBy: req.user._id,
      });
    } catch (notifErr) {
      console.error('Failed to dispatch application_submitted notification:', notifErr);
    }

    return res.status(201).json({
      success: true,
      data: application,
      message: 'Successfully applied to the opportunity',
    });
  } catch (error) {
    console.error('applyToOpportunity error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this opportunity',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to submit application',
    });
  }
};

// @desc    Get candidate's application status for an opportunity
// @route   GET /api/applications/status/:opportunityId
// @access  Private
export const getApplicationStatus = async (req, res) => {
  try {
    const { opportunityId } = req.params;

    const application = await Application.findOne({
      candidate: req.user._id,
      opportunity: opportunityId,
    });

    let hiring = null;
    if (application) {
      hiring = await Hiring.findOne({ application: application._id });
    }

    return res.status(200).json({
      success: true,
      hasApplied: !!application,
      status: application ? application.status : null,
      statusHistory: application ? application.statusHistory : [],
      appliedAt: application ? application.createdAt : null,
      hiring: hiring || null
    });
  } catch (error) {
    console.error('getApplicationStatus error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Get all applications for the authenticated candidate
// @route   GET /api/applications/my
// @access  Private (Candidate only)
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate('opportunity')
      .populate('organization', 'name email company')
      .populate('resume', 'fileName targetRole overallScore')
      .sort({ createdAt: -1 });

    // Compute application summary statistics from real backend records
    const summary = {
      total: applications.length,
      under_review: applications.filter(a => a.status === 'under_review').length,
      shortlisted: applications.filter(a => a.status === 'shortlisted').length,
      interview: applications.filter(a => a.status === 'interview').length,
      selected: applications.filter(a => a.status === 'selected' || a.status === 'hired').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
    };

    return res.status(200).json({
      success: true,
      count: applications.length,
      summary,
      data: applications,
    });
  } catch (error) {
    console.error('getMyApplications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching candidate applications',
    });
  }
};

// @desc    Get detailed candidate application info with interview & offer
// @route   GET /api/applications/detail/:id
// @access  Private (Candidate only)
export const getCandidateApplicationDetails = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      candidate: req.user._id, // Strict candidate isolation
    })
      .populate('opportunity')
      .populate('organization', 'name email')
      .populate('resume', 'fileName targetRole overallScore skillsFound');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized',
      });
    }

    const [interview, hiring] = await Promise.all([
      OrganizationInterview.findOne({ application: application._id }).sort({ createdAt: -1 }),
      Hiring.findOne({ application: application._id }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        application,
        interview: interview || null,
        hiring: hiring || null,
      },
    });
  } catch (error) {
    console.error('getCandidateApplicationDetails error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching application details',
    });
  }
};
