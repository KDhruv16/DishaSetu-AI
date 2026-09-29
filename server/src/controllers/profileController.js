import Profile from '../models/Profile.js';
import User from '../models/User.js';
import CareerAnalysis from '../models/CareerAnalysis.js';
import Roadmap from '../models/Roadmap.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import Interview from '../models/Interview.js';
import { computeNextBestStep } from '../services/nextBestStepService.js';
import { computeCandidateProgress } from '../services/candidateProgressService.js';


// Skill benchmarks for target roles (rule-based intelligence for baseline readiness calculation)
export const ROLE_SKILL_BENCHMARKS = {
  'Full Stack Developer': ['React', 'Node.js', 'JavaScript', 'HTML/CSS', 'MongoDB', 'SQL', 'Git', 'Docker', 'Testing'],
  'Frontend Developer': ['React', 'JavaScript', 'HTML/CSS', 'Tailwind CSS', 'TypeScript', 'Git', 'Redux', 'UI/UX Basics'],
  'Backend Developer': ['Node.js', 'Express.js', 'SQL', 'MongoDB', 'Docker', 'REST APIs', 'Authentication', 'System Design'],
  'AI / ML Engineer': ['Python', 'Machine Learning', 'TensorFlow/PyTorch', 'Data Analysis', 'Pandas', 'SQL', 'Math/Stats'],
  'Data Analyst': ['SQL', 'Python', 'Excel', 'PowerBI/Tableau', 'Statistics', 'Data Cleaning', 'Reporting'],
  'Cloud / DevOps Engineer': ['Linux', 'Docker', 'Kubernetes', 'AWS/Azure', 'CI/CD', 'Git', 'Terraform', 'Networking'],
};

// Calculate initial readiness scores and skill gaps based on selected target role and current skills
const calculateReadiness = (targetRole, userSkills = []) => {
  const normalizedUserSkills = userSkills.map((s) => s.trim().toLowerCase());
  const benchmarkSkills = ROLE_SKILL_BENCHMARKS[targetRole] || ROLE_SKILL_BENCHMARKS['Full Stack Developer'];

  const matchedSkills = benchmarkSkills.filter((bSkill) =>
    normalizedUserSkills.includes(bSkill.toLowerCase())
  );

  const missingSkills = benchmarkSkills.filter(
    (bSkill) => !normalizedUserSkills.includes(bSkill.toLowerCase())
  );

  const skillMatchScore =
    userSkills.length > 0 && benchmarkSkills.length > 0
      ? Math.round((matchedSkills.length / benchmarkSkills.length) * 100)
      : null;

  // Skill Assessment Score: derived from how many benchmark skills the user currently has
  // This is the REAL score based on actual user skills — NOT hardcoded null
  const skillAssessmentScore =
    userSkills.length > 0 && benchmarkSkills.length > 0
      ? Math.round((matchedSkills.length / benchmarkSkills.length) * 100)
      : null;

  // New profiles start with Evaluation Pending (null) until real resume and mock interview are completed
  const readinessScore = null;

  const topSkillGaps = missingSkills.slice(0, 3).map((skill, index) => {
    let priority = index === 0 ? 'High' : 'Medium';
    let reason = `Crucial for industry ${targetRole} production workflows.`;
    if (skill === 'Docker') reason = 'Essential for modern containerized deployment and CI/CD pipelines.';
    if (skill === 'Testing') reason = 'Standard requirement for writing reliable, production-grade code.';
    if (skill === 'SQL') reason = 'Core relational database skill expected across all tech organizations.';
    return { name: skill, priority, reason };
  });

  const nextBestStep = 'Upload your resume and complete a mock interview to evaluate your Career Readiness.';

  return {
    readinessScore,
    skillMatchScore,
    resumeScore: null,
    interviewScore: null,
    skillAssessmentScore,
    topSkillGaps: topSkillGaps.length > 0 ? topSkillGaps : [],
    nextBestStep,
  };
};

// @desc    Get logged in user profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found. Please complete onboarding.',
      });
    }

    // Backfill: if user has currentSkills but skillAssessmentScore is null (legacy data),
    // compute the real score now so Dashboard shows correct state
    if (
      profile.readiness &&
      (profile.readiness.skillAssessmentScore === null || profile.readiness.skillAssessmentScore === undefined) &&
      Array.isArray(profile.skills?.currentSkills) &&
      profile.skills.currentSkills.length > 0
    ) {
      const targetRole = profile.career?.targetRole || 'Full Stack Developer';
      const benchmarkSkills = ROLE_SKILL_BENCHMARKS[targetRole] || ROLE_SKILL_BENCHMARKS['Full Stack Developer'];
      const normalizedUserSkills = profile.skills.currentSkills.map((s) => s.trim().toLowerCase());
      const matchedSkills = benchmarkSkills.filter((bSkill) =>
        normalizedUserSkills.includes(bSkill.toLowerCase())
      );
      const computedScore = benchmarkSkills.length > 0
        ? Math.round((matchedSkills.length / benchmarkSkills.length) * 100)
        : null;

      if (computedScore !== null && computedScore > 0) {
        profile.readiness.skillAssessmentScore = computedScore;
        await profile.save();
      }
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
      error: error.message,
    });
  }
};

// @desc    Save/Create 4-Step Onboarding Profile
// @route   POST /api/profile/onboarding
// @access  Private
export const saveOnboardingProfile = async (req, res) => {
  try {
    const { personal, academics, career, skills, targetRole: flatRole, currentSkills: flatSkills } = req.body;

    const targetRole = career?.targetRole || flatRole || 'Full Stack Developer';
    const userSkills = skills?.currentSkills || flatSkills || [];

    const readinessMetrics = calculateReadiness(targetRole, userSkills);

    let profile = await Profile.findOne({ user: req.user._id });

    if (profile) {
      profile.personal = personal || profile.personal;
      profile.academics = academics || profile.academics;
      profile.career = career || { targetRole };
      profile.skills = skills || { currentSkills: userSkills };
      profile.readiness = {
        ...profile.readiness,
        ...readinessMetrics,
      };
      await profile.save();
    } else {
      profile = await Profile.create({
        user: req.user._id,
        personal: personal || { name: req.user.name },
        academics: academics || {},
        career: career || { targetRole },
        skills: skills || { currentSkills: userSkills },
        readiness: readinessMetrics,
      });
    }

    // Mark user as onboarded
    await User.findByIdAndUpdate(req.user._id, { isOnboarded: true });

    return res.status(200).json({
      success: true,
      message: 'Career profile created successfully',
      profile,
    });
  } catch (error) {
    console.error('Save Onboarding Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error saving onboarding profile',
      error: error.message,
    });
  }
};

// @desc    Update profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      profile = new Profile({
        user: req.user._id,
        personal: {},
        academics: {},
        career: {},
        skills: { currentSkills: [] },
        readiness: {},
      });
    }

    const {
      name,
      college,
      degree,
      branch,
      targetRole,
      currentSkills,
      personal,
      academics,
      career,
      skills,
    } = req.body;

    // Handle nested or flat inputs
    if (personal) profile.personal = { ...profile.personal.toObject(), ...personal };
    if (name) profile.personal.name = name;
    if (college) profile.personal.college = college;
    if (degree) profile.personal.degree = degree;
    if (branch) profile.personal.branch = branch;

    if (academics) profile.academics = { ...profile.academics.toObject(), ...academics };

    if (career) profile.career = { ...profile.career.toObject(), ...career };
    if (targetRole) profile.career.targetRole = targetRole;

    if (skills) profile.skills = { ...profile.skills.toObject(), ...skills };
    if (currentSkills && Array.isArray(currentSkills)) {
      profile.skills.currentSkills = currentSkills;
    }

    const effectiveTargetRole = profile.career?.targetRole || targetRole || 'Full Stack Developer';
    const effectiveSkills = profile.skills?.currentSkills || [];
    const metrics = calculateReadiness(effectiveTargetRole, effectiveSkills);

    // Merge readiness metrics, preserving existing non-null real scores
    // (resumeScore, interviewScore come from their respective controllers, not from calculateReadiness)
    const existingReadiness = profile.readiness ? profile.readiness.toObject() : {};
    profile.readiness = {
      ...existingReadiness,
      ...metrics,
      // Preserve real scores that were set by resume/interview controllers
      resumeScore: metrics.resumeScore !== null ? metrics.resumeScore : existingReadiness.resumeScore,
      interviewScore: metrics.interviewScore !== null ? metrics.interviewScore : existingReadiness.interviewScore,
      readinessScore: metrics.readinessScore !== null ? metrics.readinessScore : existingReadiness.readinessScore,
    };

    await profile.save();

    // Ensure user marked onboarded
    await User.findByIdAndUpdate(req.user._id, { isOnboarded: true });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: error.message,
    });
  }
};

// @desc    Get Deterministic Next Best Step
// @route   GET /api/profile/next-best-step
// @access  Private
export const getNextBestStepHandler = async (req, res) => {
  try {
    const userId = req.user._id;

    const [profile, careerAnalysis, roadmap, resumeAnalysis, interview] = await Promise.all([
      Profile.findOne({ user: userId }),
      CareerAnalysis.findOne({ user: userId }),
      Roadmap.findOne({ user: userId }),
      ResumeAnalysis.findOne({ user: userId }),
      Interview.findOne({ user: userId }),
    ]);

    const nextStep = computeNextBestStep({
      profile,
      careerAnalysis,
      roadmap,
      resumeAnalysis,
      interview,
    });

    return res.status(200).json({
      success: true,
      nextBestStep: nextStep,
    });
  } catch (error) {
    console.error('Get Next Best Step Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error computing next best step',
      error: error.message,
    });
  }
};

// @desc    Get Unified Candidate Progress (Single Source of Truth)
// @route   GET /api/profile/candidate-progress
// @access  Private
export const getCandidateProgress = async (req, res) => {
  try {
    const progress = await computeCandidateProgress(req.user._id);

    return res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error('Get Candidate Progress Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error computing candidate progress',
      error: error.message,
    });
  }
};

// ==========================================
// CLOSED LOOP SKILL ENGINE
// ==========================================

// @desc    Start learning a specific skill
// @route   POST /api/profile/skills/learn
// @access  Private
export const startSkillLearning = async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill) return res.status(400).json({ success: false, message: 'Skill is required' });

    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    if (!profile.skills.learningSkills.includes(skill)) {
      profile.skills.learningSkills.push(skill);
      await profile.save();
    }

    return res.status(200).json({ success: true, message: 'Started learning skill', profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark skill learning as completed
// @route   POST /api/profile/skills/complete-learning
// @access  Private
export const completeSkillLearning = async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill) return res.status(400).json({ success: false, message: 'Skill is required' });

    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    // Remove from learningSkills
    profile.skills.learningSkills = profile.skills.learningSkills.filter(s => s !== skill);
    
    // Add to readyForEvaluationSkills
    if (!profile.skills.readyForEvaluationSkills.includes(skill) && !profile.skills.currentSkills.includes(skill)) {
      profile.skills.readyForEvaluationSkills.push(skill);
    }
    
    await profile.save();
    return res.status(200).json({ success: true, message: 'Learning completed, ready for evaluation', profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate a skill (e.g. via mock assessment)
// @route   POST /api/profile/skills/validate
// @access  Private
export const validateSkill = async (req, res) => {
  try {
    const { skill, passed, score } = req.body;
    if (!skill) return res.status(400).json({ success: false, message: 'Skill is required' });

    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    if (passed) {
      // Remove from readyForEvaluationSkills
      profile.skills.readyForEvaluationSkills = profile.skills.readyForEvaluationSkills.filter(s => s !== skill);
      
      // Add to currentSkills (VERIFIED)
      if (!profile.skills.currentSkills.includes(skill)) {
        profile.skills.currentSkills.push(skill);
      }
      
      // Also sync Readiness metrics automatically
      const targetRole = profile.career?.targetRole || 'Full Stack Developer';
      const metrics = calculateReadiness(targetRole, profile.skills.currentSkills);
      const existingReadiness = profile.readiness ? profile.readiness.toObject() : {};
      
      profile.readiness = {
        ...existingReadiness,
        ...metrics,
        resumeScore: existingReadiness.resumeScore,
        interviewScore: existingReadiness.interviewScore,
      };

      await profile.save();
      return res.status(200).json({ success: true, message: 'Skill validated successfully! Skill is now verified.', profile, passed: true });
    } else {
      // Failed - skill remains in readyForEvaluationSkills (not verified)
      return res.status(200).json({ success: true, message: 'Skill validation failed. Keep practicing!', passed: false, score });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

