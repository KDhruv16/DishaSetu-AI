import OrganizationInterview from '../models/OrganizationInterview.js';
import Application from '../models/Application.js';

// @desc    Schedule an interview
// @route   POST /api/organization/interviews
// @access  Private (Organization only)
export const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, title, type, scheduledDate, startTime, endTime, mode, meetingLink, location, instructions, timezone } = req.body;

    // Verify application exists and belongs to the organization
    const application = await Application.findOne({
      _id: applicationId,
      organization: req.user._id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized access'
      });
    }

    if (application.status !== 'shortlisted') {
      return res.status(400).json({
        success: false,
        message: 'Only shortlisted candidates can be scheduled for an interview.'
      });
    }

    // Check for conflicts for the same candidate
    const existingInterviews = await OrganizationInterview.find({
      candidate: application.candidate,
      status: { $in: ['scheduled', 'confirmed'] },
      scheduledDate: new Date(scheduledDate)
    });

    // Simple conflict check on the same date (can be refined to check time intersection)
    for (const interview of existingInterviews) {
      if ((startTime >= interview.startTime && startTime < interview.endTime) ||
          (endTime > interview.startTime && endTime <= interview.endTime)) {
        return res.status(400).json({
          success: false,
          message: 'This candidate already has an interview scheduled during this time.'
        });
      }
    }

    const interview = await OrganizationInterview.create({
      application: application._id,
      opportunity: application.opportunity,
      candidate: application.candidate,
      organization: req.user._id,
      title,
      type,
      scheduledDate: new Date(scheduledDate),
      startTime,
      endTime,
      timezone: timezone || 'UTC',
      mode,
      meetingLink: mode === 'online' ? meetingLink : undefined,
      location: mode === 'offline' ? location : undefined,
      instructions
    });

    return res.status(201).json({
      success: true,
      data: interview,
      message: 'Interview scheduled successfully'
    });
  } catch (error) {
    console.error('scheduleInterview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error scheduling interview'
    });
  }
};

// @desc    List organization interviews
// @route   GET /api/organization/interviews
// @access  Private (Organization only)
export const getOrganizationInterviews = async (req, res) => {
  try {
    const interviews = await OrganizationInterview.find({ organization: req.user._id })
      .populate('candidate', 'name email')
      .populate('opportunity', 'title')
      .sort({ scheduledDate: 1, startTime: 1 });

    return res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews
    });
  } catch (error) {
    console.error('getOrganizationInterviews error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching interviews'
    });
  }
};

// @desc    Update interview
// @route   PUT /api/organization/interviews/:id
// @access  Private (Organization only)
export const updateInterview = async (req, res) => {
  try {
    const { scheduledDate, startTime, endTime, mode, meetingLink, location, instructions, type, title } = req.body;

    const interview = await OrganizationInterview.findOne({
      _id: req.params.id,
      organization: req.user._id
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found or unauthorized'
      });
    }

    if (['completed', 'cancelled'].includes(interview.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify a completed or cancelled interview'
      });
    }

    interview.scheduledDate = scheduledDate ? new Date(scheduledDate) : interview.scheduledDate;
    interview.startTime = startTime || interview.startTime;
    interview.endTime = endTime || interview.endTime;
    interview.mode = mode || interview.mode;
    interview.meetingLink = mode === 'online' ? (meetingLink || interview.meetingLink) : undefined;
    interview.location = mode === 'offline' ? (location || interview.location) : undefined;
    interview.instructions = instructions !== undefined ? instructions : interview.instructions;
    interview.type = type || interview.type;
    interview.title = title || interview.title;
    
    // Status can optionally be reset if they confirm logic requires it, but let's just keep it simple.
    
    await interview.save();

    return res.status(200).json({
      success: true,
      data: interview,
      message: 'Interview updated successfully.'
    });
  } catch (error) {
    console.error('updateInterview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error updating interview'
    });
  }
};

// @desc    Cancel interview
// @route   PATCH /api/organization/interviews/:id/cancel
// @access  Private (Organization only)
export const cancelInterview = async (req, res) => {
  try {
    const interview = await OrganizationInterview.findOne({
      _id: req.params.id,
      organization: req.user._id
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found or unauthorized'
      });
    }

    interview.status = 'cancelled';
    await interview.save();

    return res.status(200).json({
      success: true,
      message: 'Interview cancelled successfully.'
    });
  } catch (error) {
    console.error('cancelInterview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error cancelling interview'
    });
  }
};

// @desc    Complete interview and add feedback
// @route   PATCH /api/organization/interviews/:id/feedback
// @access  Private (Organization only)
export const submitInterviewFeedback = async (req, res) => {
  try {
    const { feedback } = req.body;

    const interview = await OrganizationInterview.findOne({
      _id: req.params.id,
      organization: req.user._id
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found or unauthorized'
      });
    }

    interview.status = 'completed';
    interview.feedback = feedback;
    interview.feedbackUpdatedAt = new Date();
    await interview.save();

    return res.status(200).json({
      success: true,
      data: interview,
      message: 'Feedback submitted and interview completed.'
    });
  } catch (error) {
    console.error('submitInterviewFeedback error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error submitting feedback'
    });
  }
};
