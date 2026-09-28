import Profile from '../models/Profile.js';
import CareerAnalysis from '../models/CareerAnalysis.js';
import Roadmap from '../models/Roadmap.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import Interview from '../models/Interview.js';
import Course from '../models/Course.js';
import Opportunity from '../models/Opportunity.js';
import { calculateReadinessScore } from './readinessService.js';
import { computeNextBestStep } from './nextBestStepService.js';

/**
 * Deterministic Career Analytics & Progress Intelligence Service
 * Synthesizes data across all 8 modules into one explainable progress intelligence model.
 */
export const getStudentAnalytics = async (userId) => {
  // 1. Fetch all existing models for the student
  const [profile, careerAnalysis, roadmap, resumeAnalysis, interview, courses] =
    await Promise.all([
      Profile.findOne({ user: userId }),
      CareerAnalysis.findOne({ userId }),
      Roadmap.findOne({ user: userId }),
      ResumeAnalysis.findOne({ userId }).sort({ createdAt: -1 }),
      Interview.findOne({ userId }).sort({ createdAt: -1 }),
      Course.find({}),
    ]);

  const targetRole =
    roadmap?.targetRole ||
    careerAnalysis?.careers?.[0]?.role ||
    profile?.career?.targetRole ||
    profile?.targetRole ||
    'Full Stack Developer';

  const userSkills = (profile?.skills?.currentSkills || []).map((s) => s.trim());
  const normalizedUserSkills = userSkills.map((s) => s.toLowerCase());

  // 2. Career Readiness (Source of Truth: readinessService)
  const isInterviewCompleted = Boolean(interview && interview.completed);
  const interviewScore = isInterviewCompleted
    ? (interview.overallScore?.overall || interview.scores?.overall || 0)
    : null;
  const resumeScore = resumeAnalysis?.atsScore?.overall || null;

  const readinessCalc = calculateReadinessScore(profile, careerAnalysis, interviewScore, resumeScore);
  const readinessScore = readinessCalc.overall;
  const breakdownRaw = readinessCalc.breakdown;

  const projectCount = (profile?.skills?.projects || []).filter((p) => p && p.trim().length > 0).length;
  const expCount =
    (profile?.skills?.internships || []).filter((i) => i && i.trim().length > 0).length +
    (profile?.skills?.certifications || []).filter((c) => c && c.trim().length > 0).length;

  // Generate explainable breakdown with grounded explanations and improvement actions
  const readinessBreakdown = [
    {
      key: 'technicalSkills',
      label: 'Technical Skills Foundation',
      weight: '30%',
      score: breakdownRaw.technicalSkills,
      status: breakdownRaw.technicalSkills >= 80 ? 'Strong' : breakdownRaw.technicalSkills >= 60 ? 'Developing' : breakdownRaw.technicalSkills > 0 ? 'Needs Focus' : 'Not Recorded',
      explanation:
        userSkills.length > 0
          ? `${userSkills.length} technical skills recorded in your profile.`
          : 'No technical skills recorded yet in your profile.',
      improvementAction:
        userSkills.length < 5
          ? 'Add your technical competencies in your profile.'
          : 'Complete your highest-priority missing skill milestone.',
    },
    {
      key: 'projects',
      label: 'Practical Projects Portfolio',
      weight: '20%',
      score: breakdownRaw.projects,
      status: breakdownRaw.projects >= 80 ? 'Strong' : breakdownRaw.projects >= 50 ? 'Developing' : breakdownRaw.projects > 0 ? 'Needs Focus' : 'Not Recorded',
      explanation:
        projectCount > 0
          ? `${projectCount} projects listed in your profile.`
          : 'No projects listed in your profile yet.',
      improvementAction:
        projectCount < 2
          ? 'Build and add at least 2 showcase projects for your target role.'
          : 'Ensure projects feature live deployed links and GitHub documentation.',
    },
    {
      key: 'experience',
      label: 'Internships & Certifications',
      weight: '15%',
      score: breakdownRaw.experience,
      status: breakdownRaw.experience >= 80 ? 'Strong' : breakdownRaw.experience >= 50 ? 'Developing' : breakdownRaw.experience > 0 ? 'Needs Focus' : 'Not Recorded',
      explanation:
        expCount > 0
          ? `${expCount} internships or certifications recorded in your profile.`
          : 'No internships or certifications recorded yet.',
      improvementAction:
        expCount === 0
          ? 'Apply for state apprenticeships or add completed course certifications.'
          : 'Add government or industry-standard certifications (NPTEL, SWAYAM).',
    },
    {
      key: 'education',
      label: 'Academics & CGPA Benchmark',
      weight: '10%',
      score: breakdownRaw.education,
      status: breakdownRaw.education >= 70 ? 'Strong' : breakdownRaw.education > 0 ? 'Developing' : 'Pending',
      explanation: profile?.academics?.degree
        ? `${profile.academics.degree}${profile.academics.cgpa ? ` (CGPA: ${profile.academics.cgpa})` : ''}.`
        : 'Academic background recorded in profile.',
      improvementAction: 'Maintain steady academic performance to meet eligibility cutoffs.',
    },
    {
      key: 'targetSkillCoverage',
      label: 'Target Role Skill Coverage',
      weight: '15%',
      score: breakdownRaw.targetSkillCoverage,
      status: breakdownRaw.targetSkillCoverage >= 80 ? 'Strong' : breakdownRaw.targetSkillCoverage >= 50 ? 'Developing' : breakdownRaw.targetSkillCoverage > 0 ? 'Needs Focus' : 'Pending',
      explanation: `Alignment percentage against required ${targetRole} technical competencies.`,
      improvementAction: 'Bridge missing high-priority gaps identified in your skill matrix.',
    },
    {
      key: 'interviewReadiness',
      label: 'Mock Interview Readiness',
      weight: '10%',
      score: breakdownRaw.interviewReadiness,
      status: isInterviewCompleted ? 'Completed' : 'Not Attempted',
      explanation: isInterviewCompleted
        ? `Evaluated across ${interview.questions?.length || 5} questions in latest mock session.`
        : 'Mock interview not attempted yet. Complete a session to measure interview readiness.',
      improvementAction: !isInterviewCompleted
        ? 'Attempt a 5-question mock interview in the studio.'
        : 'Practice another round focusing on communication and technical depth.',
    },
  ];

  // 3. Skills Progress & Coverage Logic (Explainable & Deterministic)
  const requiredSkills =
    careerAnalysis?.careers?.[0]?.requiredSkills ||
    ['React', 'Node.js', 'MongoDB', 'JavaScript', 'SQL', 'Docker', 'Testing'];

  const missingSkills =
    careerAnalysis?.careers?.[0]?.missingSkills ||
    profile?.readiness?.topSkillGaps ||
    [];

  const skillsAnalytics = requiredSkills.map((skill) => {
    const isMastered = normalizedUserSkills.includes(skill.toLowerCase());
    const gapInfo = missingSkills.find(
      (m) => (m.skill || m.name || '').toLowerCase() === skill.toLowerCase()
    );

    let status = 'Developing';
    let proficiency = 50;
    let level = 'Developing';

    if (isMastered) {
      status = 'Mastered';
      proficiency = 88;
      level = 'Strong';
    } else if (gapInfo?.priority === 'High') {
      status = 'Missing';
      proficiency = 25;
      level = 'Beginner';
    } else {
      status = 'Developing';
      proficiency = 50;
      level = 'Developing';
    }

    return {
      name: skill,
      status,
      proficiency,
      level,
      priority: gapInfo?.priority || (isMastered ? 'Mastered' : 'Medium'),
      reason: gapInfo?.reason || `Standard required skill for ${targetRole}.`,
      isMastered,
    };
  });

  // 4. Roadmap Sprint Progress Logic
  let roadmapAnalytics = {
    hasRoadmap: false,
    targetRole,
    completedTasks: 0,
    totalTasks: 0,
    overallProgress: 0,
    currentWeek: 1,
    currentPriority: 'High',
    nextTask: 'Generate your 4-week sprint roadmap to start tracking.',
    weeksSummary: [],
  };

  if (roadmap && Array.isArray(roadmap.weeks) && roadmap.weeks.length > 0) {
    let completedCount = 0;
    let totalCount = 0;
    let currentWeekNum = 1;
    let nextTaskTitle = '';
    let nextTaskPriority = 'High';

    const weeksSummary = roadmap.weeks.map((w) => {
      const wTasks = w.tasks || [];
      const wCompleted = wTasks.filter((t) => t.completed).length;
      const wTotal = wTasks.length;
      completedCount += wCompleted;
      totalCount += wTotal;

      if (!nextTaskTitle) {
        const firstInc = wTasks.find((t) => !t.completed);
        if (firstInc) {
          nextTaskTitle = firstInc.title;
          nextTaskPriority = firstInc.priority || 'High';
          currentWeekNum = w.weekNumber;
        }
      }

      return {
        weekNumber: w.weekNumber,
        title: w.title,
        completedTasks: wCompleted,
        totalTasks: wTotal,
        percentage: wTotal > 0 ? Math.round((wCompleted / wTotal) * 100) : 0,
      };
    });

    const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    roadmapAnalytics = {
      hasRoadmap: true,
      targetRole: roadmap.targetRole || targetRole,
      completedTasks: completedCount,
      totalTasks: totalCount,
      overallProgress: progressPct,
      currentWeek: currentWeekNum,
      currentPriority: nextTaskPriority,
      nextTask: nextTaskTitle || 'All sprint tasks completed!',
      weeksSummary,
    };
  }

  // 5. Learning Progress Logic
  const missingSkillNames = missingSkills.map((m) => (m.skill || m.name || '').toLowerCase());
  const relevantCourses = courses.filter((c) =>
    missingSkillNames.some((m) => c.skill.toLowerCase().includes(m))
  );

  const learningAnalytics = {
    totalCurated: courses.length,
    relevantCurated: relevantCourses.length > 0 ? relevantCourses.length : 6,
    completedTasksCount: roadmapAnalytics.completedTasks,
    enrolledSkillTracks: missingSkills.slice(0, 3).map((m) => m.skill || m.name),
    certificateAvailableCount: courses.filter((c) => c.certificateAvailable).length,
  };

  // 6. Resume ATS Analytics
  const hasResume = Boolean(resumeAnalysis && typeof resumeAnalysis.atsScore?.overall === 'number');
  const resumeAnalytics = {
    hasResume,
    fileName: hasResume ? resumeAnalysis.fileName : 'No resume uploaded yet',
    atsScore: hasResume ? resumeAnalysis.atsScore.overall : null,
    breakdown: hasResume ? resumeAnalysis.atsScore.breakdown : {
      keywordMatch: 0,
      sectionCompleteness: 0,
      projectAndExperience: 0,
      formattingAndClarity: 0,
    },
    strengthsCount: resumeAnalysis?.strengths?.length || 0,
    missingKeywords: resumeAnalysis?.missingKeywords || [],
    suggestionsCount: resumeAnalysis?.suggestions?.length || 0,
  };

  // 7. Interview Performance Analytics
  const hasInterview = isInterviewCompleted;
  const interviewAnalytics = {
    hasInterview,
    completed: hasInterview,
    role: hasInterview ? (interview.role || targetRole) : targetRole,
    latestScore: hasInterview ? (interview.overallScore?.overall || interview.scores?.overall || null) : null,
    breakdown: hasInterview ? (interview.overallScore?.breakdown || interview.scores || {
      technicalAccuracy: 0,
      completeness: 0,
      clarity: 0,
      relevance: 0,
    }) : {
      technicalAccuracy: 0,
      completeness: 0,
      clarity: 0,
      relevance: 0,
    },
    questionsAnswered: hasInterview ? (interview.questions?.filter((q) => q.isAnswered)?.length || 0) : 0,
  };

  // 8. Weekly Progress Summary (Synthesized strictly from actual data)
  const activities = [];
  if (roadmapAnalytics.completedTasks > 0) {
    activities.push(`Completed ${roadmapAnalytics.completedTasks} structured roadmap tasks.`);
  }
  if (interviewAnalytics.completed && interviewAnalytics.latestScore) {
    activities.push(`Completed technical mock interview (Score: ${interviewAnalytics.latestScore}%).`);
  }
  if (resumeAnalytics.hasResume && resumeAnalytics.atsScore) {
    activities.push(`Scanned resume with ATS optimizer (Score: ${resumeAnalytics.atsScore}%).`);
  }
  if (userSkills.length > 0) {
    activities.push(`${userSkills.length} technical skills recorded in candidate profile.`);
  }

  const weeklyProgress = {
    roadmapTasksCompleted: roadmapAnalytics.completedTasks,
    interviewsCompleted: interviewAnalytics.completed ? 1 : 0,
    resumeAudited: resumeAnalytics.hasResume,
    skillsMastered: skillsAnalytics.filter((s) => s.isMastered).length,
    activitiesSummary:
      activities.length > 0
        ? activities
        : ['Profile initialized. Upload your resume or start Week 1 roadmap tasks to build your progress history.'],
    nextAction: roadmapAnalytics.nextTask,
  };

  // 9. Career Milestones (8 Sequential Milestones)
  const isProfileComplete = Boolean(profile && userSkills.length > 0);
  const isCareerIdentified = Boolean(careerAnalysis?.careers?.length > 0 || profile?.career?.targetRole);
  const isSkillGapIdentified = Boolean(missingSkills.length > 0 || isCareerIdentified);
  const isRoadmapStarted = Boolean(roadmapAnalytics.hasRoadmap);
  const isLearningStarted = Boolean(roadmapAnalytics.completedTasks > 0);
  const isResumeReady = Boolean(resumeAnalytics.hasResume && resumeAnalytics.atsScore >= 75);
  const isInterviewReady = Boolean(interviewAnalytics.completed && interviewAnalytics.latestScore >= 70);
  const isCareerReady = Boolean(readinessScore >= 80 && isResumeReady && isInterviewReady);

  const getMilestoneStatus = (isDone, prevDone) => {
    if (isDone) return 'completed';
    if (prevDone) return 'current';
    return 'upcoming';
  };

  const milestones = [
    {
      id: 1,
      title: 'Profile Complete',
      description: 'Academics, personal details & recorded skills saved.',
      status: getMilestoneStatus(isProfileComplete, true),
      route: '/onboarding',
    },
    {
      id: 2,
      title: 'Career Identified',
      description: `Target career role established: ${targetRole}.`,
      status: getMilestoneStatus(isCareerIdentified, isProfileComplete),
      route: '/career',
    },
    {
      id: 3,
      title: 'Skill Gap Identified',
      description: 'Competency benchmarks and missing skills diagnosed.',
      status: getMilestoneStatus(isSkillGapIdentified, isCareerIdentified),
      route: '/skills',
    },
    {
      id: 4,
      title: 'Roadmap Started',
      description: '4-week targeted sprint generated for missing skills.',
      status: getMilestoneStatus(isRoadmapStarted, isSkillGapIdentified),
      route: '/roadmap',
    },
    {
      id: 5,
      title: 'Learning Started',
      description: 'Milestone tasks and curated courses in progress.',
      status: getMilestoneStatus(isLearningStarted, isRoadmapStarted),
      route: '/learning',
    },
    {
      id: 6,
      title: 'Resume Ready',
      description: 'PDF resume scanned and ATS score calibrated (75%+).',
      status: getMilestoneStatus(isResumeReady, isLearningStarted || isRoadmapStarted),
      route: '/resume',
    },
    {
      id: 7,
      title: 'Interview Ready',
      description: 'Technical mock interview completed with passing score.',
      status: getMilestoneStatus(isInterviewReady, isResumeReady),
      route: '/interview',
    },
    {
      id: 8,
      title: 'Career Ready',
      description: 'Candidate ready with comprehensive hiring portfolio.',
      status: getMilestoneStatus(isCareerReady, isInterviewReady),
      route: '/dashboard',
    },
  ];

  // 10. Next Best Step (Deterministic)
  const nextBestStep = computeNextBestStep({
    profile,
    careerAnalysis,
    roadmap,
    resumeAnalysis,
    interview,
  });

  return {
    success: true,
    student: {
      name: profile?.personal?.name || 'Student',
      targetRole,
      college: profile?.academics?.college || 'University',
      degree: profile?.academics?.degree || 'Engineering',
      cgpa: profile?.academics?.cgpa || '8.0',
    },
    readiness: {
      overall: readinessScore,
      breakdown: readinessBreakdown,
    },
    skills: skillsAnalytics,
    roadmap: roadmapAnalytics,
    learning: learningAnalytics,
    resume: resumeAnalytics,
    interview: interviewAnalytics,
    weeklyProgress,
    milestones,
    nextBestStep,
    history: {
      isAvailable: false,
      message: 'Score history will appear as you complete more weekly career activities.',
    },
  };
};
