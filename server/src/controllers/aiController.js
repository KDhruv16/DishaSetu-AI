import CareerAnalysis from '../models/CareerAnalysis.js';
import Profile from '../models/Profile.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import Interview from '../models/Interview.js';
import { generateCareerAnalysis } from '../services/aiService.js';
import { calculateReadinessScore } from '../services/readinessService.js';
import { normalizeSkillName, ROLE_SKILL_BENCHMARKS } from '../utils/skillNormalization.js';

// Helper to validate profile completeness
const isProfileComplete = (profile, user) => {
  if (user?.isOnboarded) return true;
  if (!profile) return false;
  const hasTarget = !!profile.career?.targetRole || !!profile.targetRole || !!user?.targetRole;
  const hasPersonal = !!profile.personal?.name || !!profile.personal?.degree || !!profile.degree;
  const hasAcademics = !!profile.academics?.degree || !!profile.academics?.branch || !!profile.academics?.semester;
  const hasSkills = (Array.isArray(profile.skills?.currentSkills) && profile.skills.currentSkills.length > 0) ||
                    (Array.isArray(profile.currentSkills) && profile.currentSkills.length > 0);
  return Boolean(hasTarget || hasPersonal || hasAcademics || hasSkills);
};

// @desc    Get or auto-generate Career Analysis
// @route   GET /api/ai/career-analysis
// @access  Private
export const getCareerAnalysis = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id });

    if (!profile && req.user?.isOnboarded) {
      profile = await Profile.create({
        user: req.user._id,
        personal: { name: req.user.name },
        career: { targetRole: 'Full Stack Developer' },
        skills: { currentSkills: [] },
      });
    }

    if (!isProfileComplete(profile, req.user)) {
      return res.status(200).json({
        success: false,
        incomplete: true,
        message: 'Complete your profile to unlock your career analysis.',
      });
    }

    // Check if analysis already exists in DB
    let analysis = await CareerAnalysis.findOne({ userId: req.user._id });

    if (analysis) {
      // Synchronize career missing skills with latest live profile currentSkills
      const currentSkillsLower = (profile.skills?.currentSkills || []).map((s) => normalizeSkillName(s).toLowerCase());
      let changed = false;

      if (analysis.careers && analysis.careers.length > 0) {
        analysis.careers.forEach((career) => {
          const benchmarkSkills = ROLE_SKILL_BENCHMARKS[career.role] || career.requiredSkills || [];
          const matched = benchmarkSkills.filter((b) => currentSkillsLower.includes(normalizeSkillName(b).toLowerCase()));
          const remaining = benchmarkSkills.filter((b) => !currentSkillsLower.includes(normalizeSkillName(b).toLowerCase()));

          const newMatchPct = benchmarkSkills.length > 0
            ? Math.round((matched.length / benchmarkSkills.length) * 100)
            : career.matchPercentage;

          career.matchPercentage = newMatchPct;
          career.missingSkills = remaining.map((skill, idx) => ({
            skill: normalizeSkillName(skill),
            priority: idx === 0 ? 'High' : 'Medium',
            reason: `Important for modern ${career.role} development and industry standard practices.`,
          }));
          changed = true;
        });
      }

      if (changed) {
        await analysis.save();
      }

      return res.status(200).json({
        success: true,
        analysis,
      });
    }

    // If none exists, generate the initial analysis
    const aiResult = await generateCareerAnalysis(profile);
    const resumeDoc = await ResumeAnalysis.findOne({ userId: req.user._id });
    const interviewDoc = await Interview.findOne({ userId: req.user._id, completed: true });

    const readiness = calculateReadinessScore(
      profile,
      aiResult,
      interviewDoc?.overallScore?.overall || interviewDoc?.scores?.overall || null,
      resumeDoc?.atsScore?.overall || null
    );

    analysis = await CareerAnalysis.create({
      userId: req.user._id,
      careers: aiResult.careers,
      readinessScore: readiness,
      generatedAt: new Date(),
    });

    // Sync to Profile model for quick overview
    if (profile.readiness) {
      profile.readiness.readinessScore = readiness.overall;
      profile.readiness.skillMatchScore = aiResult.careers[0]?.matchPercentage || null;
      profile.readiness.nextBestStep = aiResult.careers[0]?.nextStep || profile.readiness.nextBestStep;
      profile.readiness.topSkillGaps = (aiResult.careers[0]?.missingSkills || []).map((m) => ({
        name: normalizeSkillName(m.skill),
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
    let profile = await Profile.findOne({ user: req.user._id });

    if (!profile && req.user?.isOnboarded) {
      profile = await Profile.create({
        user: req.user._id,
        personal: { name: req.user.name },
        career: { targetRole: 'Full Stack Developer' },
        skills: { currentSkills: [] },
      });
    }

    if (!isProfileComplete(profile, req.user)) {
      return res.status(400).json({
        success: false,
        incomplete: true,
        message: 'Complete your profile to unlock your career analysis.',
      });
    }

    // Generate fresh AI analysis
    const aiResult = await generateCareerAnalysis(profile);
    const resumeDoc = await ResumeAnalysis.findOne({ userId: req.user._id });
    const interviewDoc = await Interview.findOne({ userId: req.user._id, completed: true });

    const readiness = calculateReadinessScore(
      profile,
      aiResult,
      interviewDoc?.overallScore?.overall || interviewDoc?.scores?.overall || null,
      resumeDoc?.atsScore?.overall || null
    );

    let analysis = await CareerAnalysis.findOne({ userId: req.user._id });

    if (analysis) {
      analysis.careers = aiResult.careers;
      analysis.readinessScore = readiness;
      analysis.generatedAt = new Date();
      await analysis.save();
    } else {
      analysis = await CareerAnalysis.create({
        userId: req.user._id,
        careers: aiResult.careers,
        readinessScore: readiness,
        generatedAt: new Date(),
      });
    }

    // Sync to Profile model
    if (profile.readiness) {
      profile.readiness.readinessScore = readiness.overall;
      profile.readiness.skillMatchScore = aiResult.careers[0]?.matchPercentage || null;
      profile.readiness.nextBestStep = aiResult.careers[0]?.nextStep || profile.readiness.nextBestStep;
      profile.readiness.topSkillGaps = (aiResult.careers[0]?.missingSkills || []).map((m) => ({
        name: normalizeSkillName(m.skill),
        priority: m.priority,
        reason: m.reason,
      }));
      await profile.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Career analysis refreshed successfully.',
      analysis,
    });
  } catch (error) {
    console.error('Error refreshing career analysis:', error);
    return res.status(500).json({
      success: false,
      message: "Career analysis couldn't be refreshed right now. Please try again.",
    });
  }
};
