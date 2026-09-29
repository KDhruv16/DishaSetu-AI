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

// Helper to generate a deterministic fingerprint of candidate data
const generateDataFingerprint = (profile) => {
  const currentSkills = (profile.skills?.currentSkills || profile.currentSkills || []).map(s => s.toLowerCase()).sort().join(',');
  const targetRole = (profile.career?.targetRole || profile.targetRole || '').toLowerCase();
  const degree = (profile.personal?.degree || profile.degree || '').toLowerCase();
  const branch = (profile.personal?.branch || profile.branch || '').toLowerCase();
  const projects = (profile.skills?.projects || profile.projects || []).join(',').toLowerCase();
  
  return Buffer.from([targetRole, degree, branch, currentSkills, projects].join('|')).toString('base64');
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

    const dataFingerprint = generateDataFingerprint(profile);
    let analysis = await CareerAnalysis.findOne({ userId: req.user._id });

    if (analysis && analysis.dataFingerprint === dataFingerprint) {
      return res.status(200).json({
        success: true,
        analysis,
      });
    }

    // If none exists or fingerprint changed, generate deterministic analysis
    const aiResult = await generateCareerAnalysis(profile);
    const resumeDoc = await ResumeAnalysis.findOne({ userId: req.user._id });
    const interviewDoc = await Interview.findOne({ userId: req.user._id, completed: true });

    const readiness = calculateReadinessScore(
      profile,
      aiResult,
      interviewDoc?.overallScore?.overall || interviewDoc?.scores?.overall || null,
      resumeDoc?.atsScore?.overall || null
    );

    if (analysis) {
      analysis.careers = aiResult.careers;
      analysis.readinessScore = readiness;
      analysis.generatedAt = new Date();
      analysis.dataFingerprint = dataFingerprint;
      await analysis.save();
    } else {
      analysis = await CareerAnalysis.create({
        userId: req.user._id,
        careers: aiResult.careers,
        readinessScore: readiness,
        generatedAt: new Date(),
        dataFingerprint,
      });
    }

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

    const dataFingerprint = generateDataFingerprint(profile);
    let analysis = await CareerAnalysis.findOne({ userId: req.user._id });

    if (analysis && analysis.dataFingerprint === dataFingerprint) {
      return res.status(200).json({
        success: true,
        message: 'Career analysis is already up to date.',
        analysis,
      });
    }

    // Generate fresh deterministic analysis
    const aiResult = await generateCareerAnalysis(profile);
    const resumeDoc = await ResumeAnalysis.findOne({ userId: req.user._id });
    const interviewDoc = await Interview.findOne({ userId: req.user._id, completed: true });

    const readiness = calculateReadinessScore(
      profile,
      aiResult,
      interviewDoc?.overallScore?.overall || interviewDoc?.scores?.overall || null,
      resumeDoc?.atsScore?.overall || null
    );

    if (analysis) {
      analysis.careers = aiResult.careers;
      analysis.readinessScore = readiness;
      analysis.generatedAt = new Date();
      analysis.dataFingerprint = dataFingerprint;
      await analysis.save();
    } else {
      analysis = await CareerAnalysis.create({
        userId: req.user._id,
        careers: aiResult.careers,
        readinessScore: readiness,
        generatedAt: new Date(),
        dataFingerprint,
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
