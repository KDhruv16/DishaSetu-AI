import OrganizationInterview from '../models/OrganizationInterview.js';

// @desc    Get candidate's interviews scheduled by organizations
// @route   GET /api/candidate/interviews
// @access  Private (Candidate only)
export const getCandidateInterviews = async (req, res) => {
  try {
    const interviews = await OrganizationInterview.find({ candidate: req.user._id })
      .populate('organization', 'name')
      .populate('opportunity', 'title company')
      .sort({ scheduledDate: 1, startTime: 1 });

    return res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews
    });
  } catch (error) {
    console.error('getCandidateInterviews error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching interviews'
    });
  }
};

// @desc    Confirm an interview
// @route   PATCH /api/candidate/interviews/:id/confirm
// @access  Private (Candidate only)
export const confirmInterview = async (req, res) => {
  try {
    const interview = await OrganizationInterview.findOne({
      _id: req.params.id,
      candidate: req.user._id
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (interview.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Can only confirm scheduled interviews'
      });
    }

    interview.status = 'confirmed';
    await interview.save();

    return res.status(200).json({
      success: true,
      data: interview,
      message: 'Interview confirmed successfully.'
    });
  } catch (error) {
    console.error('confirmInterview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error confirming interview'
    });
  }
};
