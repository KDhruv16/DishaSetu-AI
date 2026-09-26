import CareerAnalysis from '../models/CareerAnalysis.js';
import Profile from '../models/Profile.js';
import { generateCareerAnalysis } from '../services/aiService.js';
import { calculateReadinessScore } from '../services/readinessService.js';

// Helper to validate profile completeness
const isProfileComplete = (profile) => {
  if (!profile) return false;
  const hasTarget = !!profile.career?.targetRole;
  const hasSkills = Array.isArray(profile.skills?.currentSkills) && profile.skills.currentSkills.length > 0;
  return hasTarget && hasSkills;
};

// @desc    Get or auto-generate Career Analysis
// @route   GET /api/ai/career-analysis
// @access  Private
export const getCareerAnalysis = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });

    if (!isProfileComplete(profile)) {
      return res.status(200).json({
        success: false,
        incomplete: true,
        message: 'Complete your profile to unlock your career analysis.',
      });
    }

    // Check if analysis already exists in DB
    let analysis = await CareerAnalysis.findOne({ userId: req.user._id });

    if (analysis) {
      return res.status(200).json({
        success: true,
        analysis,
      });
    }

    // If none exists, generate the initial analysis
    const aiResult = await generateCareerAnalysis(profile);
    const readiness = calculateReadinessScore(profile, aiResult);

    analysis = await CareerAnalysis.create({
      userId: req.user._id,
      careers: aiResult.careers,
      readinessScore: readiness,
      generatedAt: new Date(),
    });

    // Sync to Profile model for quick overview
    if (profile.readiness) {
      profile.readiness.readinessScore = readiness.overall;
      profile.readiness.skillMatchScore = aiResult.careers[0]?.matchPercentage || 82;
      profile.readiness.nextBestStep = aiResult.careers[0]?.nextStep || profile.readiness.nextBestStep;
      profile.readiness.topSkillGaps = (aiResult.careers[0]?.missingSkills || []).map((m) => ({
        name: m.skill,
        priority: m.priority,
        reason: m.reason,
      }));
      await profile.save();
    }

    return res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('Error fetching career analysis:', error);
    return res.status(500).json({
      success: false,
      message: "Career analysis couldn't be completed right now. Please try again.",
    });
  }
};

// @desc    Generate or Refresh Career Analysis
// @route   POST /api/ai/career-analysis
// @access  Private
export const refreshCareerAnalysis = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });

    if (!isProfileComplete(profile)) {
      return res.status(400).json({
        success: false,
        incomplete: true,
        message: 'Complete your profile to unlock your career analysis.',
      });
    }

    // Generate fresh AI analysis
    const aiResult = await generateCareerAnalysis(profile);
    const readiness = calculateReadinessScore(profile, aiResult);

    // Save or update in MongoDB
    const analysis = await CareerAnalysis.findOneAndUpdate(
      { userId: req.user._id },
      {
        careers: aiResult.careers,
        readinessScore: readiness,
        generatedAt: new Date(),
      },
      { new: true, upsert: true, runValidators: true }
    );

    // Sync to Profile model
    if (profile.readiness) {
      profile.readiness.readinessScore = readiness.overall;
      profile.readiness.skillMatchScore = aiResult.careers[0]?.matchPercentage || 82;
      profile.readiness.nextBestStep = aiResult.careers[0]?.nextStep || profile.readiness.nextBestStep;
      profile.readiness.topSkillGaps = (aiResult.careers[0]?.missingSkills || []).map((m) => ({
        name: m.skill,
        priority: m.priority,
        reason: m.reason,
      }));
      await profile.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Career analysis refreshed successfully',
      analysis,
    });
  } catch (error) {
    console.error('Error refreshing career analysis:', error);
    return res.status(500).json({
      success: false,
      message: "Career analysis couldn't be completed right now. Please try again.",
    });
  }
};
