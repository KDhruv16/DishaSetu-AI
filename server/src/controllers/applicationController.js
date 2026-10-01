import Application from '../models/Application.js';
import Opportunity from '../models/Opportunity.js';
import Hiring from '../models/Hiring.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';

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
