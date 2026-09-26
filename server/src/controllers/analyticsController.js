import { getStudentAnalytics } from '../services/analyticsService.js';

// @desc    Get Student Career Analytics & Progress Intelligence
// @route   GET /api/analytics
// @access  Private
export const getAnalytics = async (req, res) => {
  try {
    const analytics = await getStudentAnalytics(req.user._id);

    return res.status(200).json(analytics);
  } catch (error) {
    console.error('Analytics Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving career analytics',
      error: error.message,
    });
  }
};
