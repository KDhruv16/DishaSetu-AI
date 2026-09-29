/**
 * Candidate Progress Service — Single Source of Truth
 * 
 * Aggregates real persisted state from ALL modules into one unified progress object.
 * The Dashboard and all frontend components must derive their status from this.
 * 
 * No hardcoded/fake statuses. Every field comes from actual database state.
 */

import Profile from '../models/Profile.js';
import CareerAnalysis from '../models/CareerAnalysis.js';
import Roadmap from '../models/Roadmap.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import Interview from '../models/Interview.js';
import { normalizeSkillName, ROLE_SKILL_BENCHMARKS } from '../utils/skillNormalization.js';

/**
 * Compute the unified candidate progress for a given userId.
 * Returns a structured object representing every module's real status.
 */
export const computeCandidateProgress = async (userId) => {
  // Fetch ALL relevant data in parallel from the real database
  const [profile, careerAnalysis, roadmap, latestResume, latestInterview, allInterviews] = await Promise.all([
    Profile.findOne({ user: userId }),
    CareerAnalysis.findOne({ $or: [{ userId }, { user: userId }] }),
    Roadmap.findOne({ user: userId }),
    ResumeAnalysis.findOne({ userId }).sort({ createdAt: -1 }),
    Interview.findOne({ userId }).sort({ createdAt: -1 }),
    Interview.find({ userId, completed: true }).sort({ createdAt: -1 }).limit(5),
  ]);

  // === 1. PROFILE STATUS ===
  const hasProfile = !!profile;
  const isProfileComplete = !!(
    profile &&
    profile.personal?.name &&
    profile.career?.targetRole &&
    Array.isArray(profile.skills?.currentSkills) &&
    profile.skills.currentSkills.length > 0
  );

  const profileStatus = {
    status: isProfileComplete ? 'COMPLETED' : (hasProfile ? 'IN_PROGRESS' : 'NOT_STARTED'),
    name: profile?.personal?.name || null,
    targetRole: profile?.career?.targetRole || null,
  };

  // === 2. CAREER GOAL ===
  const targetRole = profile?.career?.targetRole || 'Full Stack Developer';

  const careerGoalStatus = {
    status: targetRole ? 'COMPLETED' : 'NOT_STARTED',
    targetRole,
  };

  // === 3. SKILL ASSESSMENT (derived from actual skills data) ===
  const benchmarkSkills = ROLE_SKILL_BENCHMARKS[targetRole] || ROLE_SKILL_BENCHMARKS['Full Stack Developer'] || [];
  const currentSkills = (profile?.skills?.currentSkills || []).map(s => normalizeSkillName(s));
  const currentSkillsLower = currentSkills.map(s => s.toLowerCase());
  const readySkills = (profile?.skills?.readyForEvaluationSkills || []).map(s => normalizeSkillName(s));
  const learningSkills = (profile?.skills?.learningSkills || []).map(s => normalizeSkillName(s));

  const matchedSkills = benchmarkSkills.filter(b => currentSkillsLower.includes(normalizeSkillName(b).toLowerCase()));
  const missingSkills = benchmarkSkills.filter(b => !currentSkillsLower.includes(normalizeSkillName(b).toLowerCase()));

  // Skill assessment score: percentage of benchmark skills mastered
  const skillAssessmentScore = benchmarkSkills.length > 0
    ? Math.round((matchedSkills.length / benchmarkSkills.length) * 100)
    : null;

  const hasSkillAssessment = isProfileComplete && currentSkills.length > 0;

  const skillAssessmentStatus = {
    status: hasSkillAssessment ? 'COMPLETED' : 'NOT_STARTED',
    score: hasSkillAssessment ? skillAssessmentScore : null,
    totalSkills: benchmarkSkills.length,
    masteredSkills: matchedSkills.length,
    masteredList: matchedSkills.map(s => normalizeSkillName(s)),
    missingList: missingSkills.map(s => normalizeSkillName(s)),
  };

  // === 4. AI SKILL-GAP ANALYSIS ===
  const hasCareerAnalysis = !!(careerAnalysis && careerAnalysis.careers && careerAnalysis.careers.length > 0);
  const primaryCareer = careerAnalysis?.careers?.[0];

  const skillGapStatus = {
    status: hasCareerAnalysis ? 'COMPLETED' : (isProfileComplete ? 'AVAILABLE' : 'NOT_STARTED'),
    matchPercentage: primaryCareer?.matchPercentage || skillAssessmentScore || null,
    missingSkills: (primaryCareer?.missingSkills || []).map(m => ({
      skill: m.skill,
      priority: m.priority,
      reason: m.reason,
    })),
    masteredCount: matchedSkills.length,
    totalBenchmark: benchmarkSkills.length,
    readyForEvaluation: readySkills,
    learning: learningSkills,
  };

  // === 5. CAREER ROADMAP ===
  const hasRoadmap = !!(roadmap && roadmap.weeks && roadmap.weeks.length > 0);
  const roadmapCompletedTasks = roadmap?.completedTasks || 0;
  const roadmapTotalTasks = roadmap?.totalTasks || 0;
  const roadmapProgress = roadmap?.overallProgress || (roadmapTotalTasks > 0 ? Math.round((roadmapCompletedTasks / roadmapTotalTasks) * 100) : 0);

  let roadmapStatusVal;
  if (!hasRoadmap) {
    roadmapStatusVal = 'NOT_STARTED';
  } else if (roadmapCompletedTasks >= roadmapTotalTasks && roadmapTotalTasks > 0) {
    roadmapStatusVal = 'COMPLETED';
  } else if (roadmapCompletedTasks > 0) {
    roadmapStatusVal = 'IN_PROGRESS';
  } else {
    roadmapStatusVal = 'NOT_STARTED';
  }

  const roadmapResult = {
    status: roadmapStatusVal,
    completedTasks: roadmapCompletedTasks,
    totalTasks: roadmapTotalTasks,
    progress: roadmapProgress,
    targetRole: roadmap?.targetRole || targetRole,
  };

  // === 6. LEARNING / COURSES ===
  let learningStatusVal;
  if (readySkills.length > 0 || (roadmapCompletedTasks > 0 && roadmapCompletedTasks >= roadmapTotalTasks)) {
    learningStatusVal = 'COMPLETED';
  } else if (learningSkills.length > 0 || roadmapCompletedTasks > 0) {
    learningStatusVal = 'IN_PROGRESS';
  } else {
    learningStatusVal = 'NOT_STARTED';
  }

  const learningResult = {
    status: learningStatusVal,
    learningSkills,
    readyForEvaluation: readySkills,
    roadmapProgress,
  };

  // === 7. CERTIFICATION ===
  const userCertifications = profile?.skills?.certifications || [];
  const hasCertifications = userCertifications.length > 0;
  const hasVerifiedSkills = readySkills.length > 0;

  const certificationResult = {
    status: hasCertifications ? 'COMPLETED' : (hasVerifiedSkills ? 'AVAILABLE' : 'NOT_STARTED'),
    certifications: userCertifications,
    verifiedSkills: readySkills,
  };

  // === 8. RESUME / ATS ===
  const hasResume = !!(latestResume && typeof latestResume.atsScore?.overall === 'number' && latestResume.atsScore.overall > 0);

  const resumeResult = {
    status: hasResume ? 'ANALYZED' : 'NOT_UPLOADED',
    atsScore: hasResume ? latestResume.atsScore.overall : null,
    fileName: latestResume?.fileName || null,
    analyzedAt: latestResume?.generatedAt || latestResume?.createdAt || null,
  };

  // === 9. MOCK INTERVIEW ===
  const hasCompletedInterview = !!(latestInterview && latestInterview.completed === true);
  const interviewInProgress = !!(latestInterview && !latestInterview.completed);
  const interviewScore = hasCompletedInterview
    ? (latestInterview.overallScore?.overall || 0)
    : null;

  let interviewStatusVal;
  if (hasCompletedInterview) {
    interviewStatusVal = 'COMPLETED';
  } else if (interviewInProgress) {
    interviewStatusVal = 'IN_PROGRESS';
  } else {
    interviewStatusVal = 'NOT_STARTED';
  }

  const interviewResult = {
    status: interviewStatusVal,
    score: interviewScore,
    role: latestInterview?.role || null,
    totalCompleted: allInterviews.length,
    completedAt: hasCompletedInterview ? latestInterview.updatedAt : null,
  };

  // === 10. JOB READINESS ===
  const weights = {
    profile: 10,
    skillAssessment: 15,
    skillGap: 10,
    roadmap: 15,
    learning: 10,
    resume: 20,
    interview: 20,
  };

  let readinessNumerator = 0;
  let readinessDenominator = 0;
  const readinessBreakdown = {};

  // Profile: 10%
  const profileScoreVal = isProfileComplete ? 100 : 0;
  readinessNumerator += profileScoreVal * weights.profile;
  readinessDenominator += weights.profile;
  readinessBreakdown.profile = { score: profileScoreVal, weight: weights.profile, status: profileStatus.status };

  // Skill Assessment: 15%
  const saScore = hasSkillAssessment ? (skillAssessmentScore || 0) : 0;
  readinessNumerator += saScore * weights.skillAssessment;
  readinessDenominator += weights.skillAssessment;
  readinessBreakdown.skillAssessment = { score: saScore, weight: weights.skillAssessment, status: skillAssessmentStatus.status };

  // Skill Gap: 10%
  const sgScore = hasCareerAnalysis ? (primaryCareer?.matchPercentage || saScore) : 0;
  readinessNumerator += sgScore * weights.skillGap;
  readinessDenominator += weights.skillGap;
  readinessBreakdown.skillGap = { score: sgScore, weight: weights.skillGap, status: skillGapStatus.status };

  // Roadmap: 15%
  readinessNumerator += roadmapProgress * weights.roadmap;
  readinessDenominator += weights.roadmap;
  readinessBreakdown.roadmap = { score: roadmapProgress, weight: weights.roadmap, status: roadmapResult.status };

  // Learning: 10%
  const learnScore = learningStatusVal === 'COMPLETED' ? 100 : (learningStatusVal === 'IN_PROGRESS' ? 50 : 0);
  readinessNumerator += learnScore * weights.learning;
  readinessDenominator += weights.learning;
  readinessBreakdown.learning = { score: learnScore, weight: weights.learning, status: learningResult.status };

  // Resume: 20%
  const resScore = hasResume ? latestResume.atsScore.overall : 0;
  readinessNumerator += resScore * weights.resume;
  readinessDenominator += weights.resume;
  readinessBreakdown.resume = { score: resScore, weight: weights.resume, status: resumeResult.status };

  // Interview: 20%
  const intScore = hasCompletedInterview ? interviewScore : 0;
  readinessNumerator += intScore * weights.interview;
  readinessDenominator += weights.interview;
  readinessBreakdown.interview = { score: intScore, weight: weights.interview, status: interviewResult.status };

  const overallReadiness = readinessDenominator > 0
    ? Math.round(readinessNumerator / readinessDenominator)
    : null;

  const hasAllEvaluations = hasResume && hasCompletedInterview && hasSkillAssessment;

  const readinessResult = {
    overall: hasAllEvaluations ? overallReadiness : null,
    isPending: !hasAllEvaluations,
    breakdown: readinessBreakdown,
  };

  // === 11. OPPORTUNITIES ===
  const hasOpportunities = hasResume || hasCompletedInterview || isProfileComplete;

  const opportunitiesResult = {
    status: hasOpportunities ? 'AVAILABLE' : 'NOT_STARTED',
  };

  // === UNIFIED PROGRESS OBJECT ===
  return {
    profile: profileStatus,
    careerGoal: careerGoalStatus,
    skillAssessment: skillAssessmentStatus,
    skillGap: skillGapStatus,
    roadmap: roadmapResult,
    learning: learningResult,
    certification: certificationResult,
    resume: resumeResult,
    mockInterview: interviewResult,
    readiness: readinessResult,
    opportunities: opportunitiesResult,
    targetRole,
    _raw: {
      hasCareerAnalysis,
      primaryCareerRole: primaryCareer?.role || null,
      topSkillGaps: (primaryCareer?.missingSkills || []).slice(0, 3),
    },
  };
};
