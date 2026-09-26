import Course from '../models/Course.js';
import Profile from '../models/Profile.js';
import CareerAnalysis from '../models/CareerAnalysis.js';

// @desc    Get all courses with optional filtering
// @route   GET /api/courses
// @access  Private
export const getCourses = async (req, res) => {
  try {
    const { skill, provider, type, isFree, certificateAvailable, search } = req.query;

    const query = {};

    if (skill && skill !== 'All') {
      query.skill = { $regex: skill, $options: 'i' };
    }
    if (provider && provider !== 'All') {
      query.provider = provider;
    }
    if (type && type !== 'All') {
      query.type = type;
    }
    if (isFree !== undefined && isFree !== 'All') {
      query.isFree = isFree === 'true';
    }
    if (certificateAvailable !== undefined && certificateAvailable !== 'All') {
      query.certificateAvailable = certificateAvailable === 'true';
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { skill: { $regex: search, $options: 'i' } },
        { provider: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(query).sort({ certificateAvailable: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error('getCourses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message,
    });
  }
};

// @desc    Get recommended courses based on student's missing skill gaps
// @route   GET /api/courses/recommended
// @access  Private
export const getRecommendedCourses = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    const careerAnalysis = await CareerAnalysis.findOne({ user: req.user._id });

    // Extract student's missing skills
    const rawGaps = careerAnalysis?.careers?.[0]?.missingSkills || [];
    const missingSkillNames = rawGaps.map((g) => g.skill) || [];

    // Fallback if no specific analysis exists yet
    const targetGaps =
      missingSkillNames.length > 0
        ? missingSkillNames
        : ['Docker', 'Testing', 'SQL', 'Python', 'Node.js'];

    // Find courses matching any of the missing skills
    const courses = await Course.find({
      skill: { $in: targetGaps.map((s) => new RegExp(s, 'i')) },
    });

    const targetRole =
      careerAnalysis?.careers?.[0]?.role ||
      profile?.targetRole ||
      'your target career';

    const decorated = courses.map((c) => {
      const matchingGap = rawGaps.find(
        (g) => g.skill.toLowerCase() === c.skill.toLowerCase()
      );
      const priority = matchingGap?.priority || 'High';
      const reason =
        matchingGap?.reason ||
        `${c.skill} is a core competency required for ${targetRole}.`;

      return {
        ...c.toObject(),
        priority,
        whyRecommended: `${c.skill} is a ${priority.toLowerCase()}-priority skill gap for ${targetRole}. ${reason}`,
      };
    });

    // Sort by priority (High first) and certificates
    decorated.sort((a, b) => {
      if (a.priority === 'High' && b.priority !== 'High') return -1;
      if (b.priority === 'High' && a.priority !== 'High') return 1;
      return (b.certificateAvailable ? 1 : 0) - (a.certificateAvailable ? 1 : 0);
    });

    res.status(200).json({
      success: true,
      count: decorated.length,
      targetRole,
      missingSkills: targetGaps,
      courses: decorated.slice(0, 6),
    });
  } catch (error) {
    console.error('getRecommendedCourses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommended courses',
      error: error.message,
    });
  }
};
