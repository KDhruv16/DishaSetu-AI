/**
 * Next Best Step Engine (Client-side deterministic helper)
 * Follows the exact required deterministic priority:
 * 1. High-priority incomplete roadmap skill task
 * 2. Important incomplete skill-gap task
 * 3. Resume improvement
 * 4. Interview practice
 * 5. Matching opportunity
 */

export const getDeterministicNextStep = ({
  profile = null,
  analysis = null,
  roadmapData = null,
  resumeAnalysis = null,
  interviewAnalysis = null,
  recommendedOpps = [],
}) => {
  const targetRole =
    roadmapData?.targetRole ||
    analysis?.careers?.[0]?.role ||
    profile?.career?.targetRole ||
    profile?.targetRole ||
    'Full Stack Developer';

  // Priority 1: High-priority incomplete roadmap task
  if (roadmapData && Array.isArray(roadmapData.weeks) && roadmapData.weeks.length > 0) {
    for (const week of roadmapData.weeks) {
      if (Array.isArray(week.tasks)) {
        const highPri = week.tasks.find((t) => !t.completed && t.priority === 'High');
        if (highPri) {
          return {
            title: highPri.title,
            description: highPri.description || `Milestone in Week ${week.weekNumber} for ${highPri.skill}.`,
            reason: `${highPri.skill} is one of your priority career skill gaps.`,
            action: 'Continue Roadmap Sprint',
            route: '/roadmap',
            badge: 'Roadmap Milestone',
          };
        }
        const nextIncomplete = week.tasks.find((t) => !t.completed);
        if (nextIncomplete) {
          return {
            title: nextIncomplete.title,
            description: nextIncomplete.description || `Milestone in Week ${week.weekNumber} for ${nextIncomplete.skill}.`,
            reason: `Completing Week ${week.weekNumber} tasks maintains steady weekly sprint momentum.`,
            action: 'Continue Roadmap Sprint',
            route: '/roadmap',
            badge: 'Roadmap Milestone',
          };
        }
      }
    }
  }

  // Priority 2: Important incomplete skill gap task
  const missingSkills =
    analysis?.careers?.[0]?.missingSkills ||
    profile?.readiness?.topSkillGaps ||
    [];

  if (missingSkills.length > 0) {
    const firstGap = missingSkills[0];
    const skillName = firstGap.skill || firstGap.name || 'Core Skills';
    const reasonText = firstGap.reason || `${skillName} is a priority competency required for ${targetRole}.`;

    return {
      title: `Complete ${skillName} Fundamentals`,
      description: `Strengthen your technical foundation in ${skillName} to bridge key industry requirements.`,
      reason: reasonText,
      action: 'Diagnose Skill Gaps',
      route: '/skills',
      badge: 'Priority Skill Gap',
    };
  }

  // Priority 3: Resume improvement
  const resumeScore = resumeAnalysis?.atsScore?.overall || profile?.readiness?.resumeScore || 0;
  if (!resumeAnalysis || resumeScore < 75) {
    return {
      title: resumeScore === 0 ? 'Upload & Audit Resume ATS Score' : 'Optimize Resume with Action Verbs',
      description:
        resumeScore === 0
          ? 'Upload your PDF resume to get an objective ATS score and keyword gap analysis.'
          : `Current ATS score is ${resumeScore}%. Target 85%+ by adding essential technical keywords.`,
      reason: 'Recruiter ATS scanners filter applications before human review.',
      action: 'Optimize Resume',
      route: '/resume',
      badge: 'Resume Health',
    };
  }

  // Priority 4: Interview practice
  const interviewDone = interviewAnalysis?.completed;
  const interviewScore = interviewAnalysis?.overallScore?.overall || profile?.readiness?.interviewScore || 0;

  if (!interviewDone || interviewScore < 70) {
    return {
      title: 'Practice with DishaSetu Mock Interview',
      description: !interviewDone
        ? `Complete a 5-question AI mock interview for ${targetRole} to evaluate communication and depth.`
        : `Your latest mock score is ${interviewScore}%. Practice another round to increase fluency.`,
      reason: 'Structured mock evaluation highlights strengths and specific areas to polish before actual interviews.',
      action: 'Start Mock Interview',
      route: '/interview',
      badge: 'Interview Studio',
    };
  }

  // Priority 5: Matching opportunity
  if (recommendedOpps && recommendedOpps.length > 0) {
    const top = recommendedOpps[0];
    return {
      title: `Apply to ${top.title}`,
      description: `${top.organization} • ${top.location} • ${top.stipendOrSalary}`,
      reason: `Your profile matches ${top.matchPercentage}% of the requirements for this role.`,
      action: 'Explore Opportunity',
      route: '/opportunities',
      badge: 'Top Match Opportunity',
    };
  }

  return {
    title: 'Keep Exploring Opportunities & Courses',
    description: 'Review your personalized recommendations and continue building showcase projects.',
    reason: 'Active project development improves overall candidate readiness.',
    action: 'View Opportunities',
    route: '/opportunities',
    badge: 'Career Growth',
  };
};
