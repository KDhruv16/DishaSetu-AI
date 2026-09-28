import Profile from '../models/Profile.js';
import User from '../models/User.js';
import CareerAnalysis from '../models/CareerAnalysis.js';
import Roadmap from '../models/Roadmap.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import Interview from '../models/Interview.js';
import { computeNextBestStep } from '../services/nextBestStepService.js';


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
    skillAssessmentScore: null,
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

    profile.readiness = {
      ...profile.readiness.toObject(),
      ...metrics,
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

