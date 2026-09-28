/**
 * Next Best Step Engine (Deterministic & Explainable)
 * 
 * Rules:
 * Priority 1: High-priority incomplete roadmap skill task
 * Priority 2: Important incomplete skill-gap task
 * Priority 3: Resume improvement (if not analyzed or ATS < 75)
 * Priority 4: Interview practice (if not taken or score < 70)
 * Priority 5: Matching opportunity
 * 
 * Returns:
 * {
 *   title: string,
 *   description: string,
 *   reason: string,
 *   action: string,
 *   route: string
 * }
 */

export const computeNextBestStep = ({
  profile = null,
  careerAnalysis = null,
  roadmap = null,
  resumeAnalysis = null,
  interview = null,
  recommendedOpportunities = [],
}) => {
  const targetRole =
    roadmap?.targetRole ||
    careerAnalysis?.careers?.[0]?.role ||
    profile?.career?.targetRole ||
    profile?.targetRole ||
    'Full Stack Developer';

  // 1. If roadmap is 100% completed and interview is pending / needs validation
  const isRoadmapDone = roadmap && roadmap.totalTasks > 0 && roadmap.completedTasks >= roadmap.totalTasks;
  const isInterviewDone = Boolean(interview?.completed && (interview?.overallScore?.overall || 0) >= 60);

  if (isRoadmapDone && !isInterviewDone) {
    return {
      title: 'Validate Your Progress',
      description: 'All roadmap milestones complete! Validate your newly acquired skills with an AI Mock Interview.',
      reason: 'Simulated interview evaluation verifies your newly learned competencies and updates your Career Readiness Score.',
      action: 'Take Mock Interview →',
      route: '/interview',
    };
  }

  // Priority 1: High-priority incomplete roadmap skill task
  if (roadmap && Array.isArray(roadmap.weeks) && roadmap.weeks.length > 0) {
    for (const week of roadmap.weeks) {
      if (Array.isArray(week.tasks)) {
        // Look for high priority incomplete task first
        const highPriTask = week.tasks.find((t) => !t.completed && t.priority === 'High');
        if (highPriTask) {
          return {
            title: highPriTask.title,
            description: highPriTask.description || `Milestone in Week ${week.weekNumber} for ${highPriTask.skill}.`,
            reason: `${highPriTask.skill} is a high-priority skill requirement for ${targetRole} roles.`,
            action: 'Continue Roadmap Sprint',
            route: '/roadmap',
          };
        }
        // If no high priority, any incomplete task in the earliest week
        const nextIncomplete = week.tasks.find((t) => !t.completed);
        if (nextIncomplete) {
          return {
            title: nextIncomplete.title,
            description: nextIncomplete.description || `Milestone in Week ${week.weekNumber} for ${nextIncomplete.skill}.`,
            reason: `Completing your Week ${week.weekNumber} milestone keeps your 4-week sprint on track.`,
            action: 'Continue Roadmap Sprint',
            route: '/roadmap',
          };
        }
      }
    }
  }

  // 2. Priority 2: Important incomplete skill-gap task
  const missingSkills =
    careerAnalysis?.careers?.[0]?.missingSkills ||
    profile?.readiness?.topSkillGaps ||
    [];

  if (missingSkills.length > 0) {
    const firstGap = missingSkills[0];
    const skillName = firstGap.skill || firstGap.name || 'Core Architecture';
    const reasonText = firstGap.reason || `${skillName} is a priority competency required for ${targetRole}.`;

    return {
      title: `Master ${skillName} Fundamentals`,
      description: `Build practical hands-on proficiency in ${skillName} to eliminate your primary skill gap.`,
      reason: reasonText,
      action: 'View Skill Gap Roadmap',
      route: '/skills',
    };
  }

  // 3. Priority 3: Resume improvement
  const atsScore = resumeAnalysis?.atsScore?.overall || profile?.readiness?.resumeScore || 0;
  if (!resumeAnalysis || atsScore < 75) {
    return {
      title: atsScore === 0 ? 'Scan and Optimize Your Resume' : 'Improve Resume ATS Alignment',
      description:
        atsScore === 0
          ? 'Upload your PDF resume to receive an objective ATS readiness audit.'
          : `Your ATS score is currently ${atsScore}%. Target 85%+ by adding required role keywords.`,
      reason: 'Recruiters and automated tracking systems screen resumes before scheduling interviews.',
      action: 'Optimize Resume',
      route: '/resume',
    };
  }

  // 4. Priority 4: Interview practice
  const interviewCompleted = interview?.completed;
  const interviewScore = interview?.overallScore?.overall || profile?.readiness?.interviewScore || 0;

  if (!interviewCompleted || interviewScore < 70) {
    return {
      title: 'Practice with DishaSetu Mock Interview',
      description:
        !interviewCompleted
          ? `Complete a 5-question mock interview for ${targetRole} to benchmark technical and communication fluency.`
          : `Your latest interview score was ${interviewScore}%. Retake practice rounds to strengthen technical clarity.`,
      reason: 'Mock interview practice builds confidence and provides instant actionable evaluation.',
      action: 'Start Mock Interview',
      route: '/interview',
    };
  }

  // 5. Priority 5: Matching opportunity
  if (recommendedOpportunities && recommendedOpportunities.length > 0) {
    const topOpp = recommendedOpportunities[0];
    return {
      title: `Apply to ${topOpp.title}`,
      description: `${topOpp.organization} • ${topOpp.location} • ${topOpp.stipendOrSalary}`,
      reason: `Your verified profile matches ${topOpp.matchPercentage}% of the requirements for this opening.`,
      action: 'View Opportunity',
      route: '/opportunities',
    };
  }

  // Fallback default
  return {
    title: 'Explore Career Opportunities & Skills',
    description: 'Review your personalized recommendations and keep building projects for your portfolio.',
    reason: 'Continuous project development strengthens your overall candidate readiness.',
    action: 'View Dashboard',
    route: '/dashboard',
  };
};
