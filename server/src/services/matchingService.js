/**
 * Matching Service for DishaSetu Opportunities
 * Deterministic calculation of opportunity relevance & application intelligence.
 * 
 * Formula Breakdown (Total 100%):
 * 1. Skill Match (60% weight):
 *    (Number of matched skills / Total required opportunity skills) * 60
 * 2. Career Role Match (20% weight):
 *    Alignment between student targetRole / careerInterests and opportunity title / category.
 * 3. Education & Eligibility Match (10% weight):
 *    Alignment between student degree / branch and opportunity qualification.
 * 4. Experience Match (10% weight):
 *    Alignment with student year of study / fresher status (0-1 years).
 */

export const calculateOpportunityMatch = (opportunity, profile) => {
  if (!profile) {
    const oppSkills = (opportunity.skills || []).map((s) => s.trim());
    return {
      matchPercentage: 50,
      overallMatch: 50,
      skillMatch: 0,
      roleMatch: 0,
      educationMatch: 0,
      experienceMatch: 0,
      matchedSkills: [],
      missingSkills: oppSkills,
      reasons: ['Complete your onboarding profile to unlock personalized match scoring.'],
      missingReasons: oppSkills.map((s) => `${s} is listed as a required skill.`),
      whyItMatches: 'Complete your profile to see personalized match insights.',
      breakdown: {
        skillScore: 0,
        roleScore: 0,
        eduScore: 0,
        expScore: 0,
      },
    };
  }

  const rawSkills = Array.isArray(profile.skills?.currentSkills)
    ? profile.skills.currentSkills
    : Array.isArray(profile.skills)
    ? profile.skills
    : [];
  const studentSkills = rawSkills.map((s) => String(s).toLowerCase().trim());
  const oppSkills = (opportunity.skills || []).map((s) => s.trim());

  // 1. Skill Match (60%)
  const matchedSkills = [];
  const missingSkills = [];

  oppSkills.forEach((reqSkill) => {
    const reqLower = reqSkill.toLowerCase();
    const isMatched = studentSkills.some(
      (s) => s.includes(reqLower) || reqLower.includes(s)
    );
    if (isMatched) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  const skillScore =
    oppSkills.length > 0
      ? Math.round((matchedSkills.length / oppSkills.length) * 60)
      : 'Not specified';

  // 2. Career Role & Category Match (20%)
  let roleScore = 0;
  const targetRole = (profile.career?.targetRole || profile.targetRole || '').toLowerCase();
  const rawInterests = Array.isArray(profile.career?.careerInterest)
    ? profile.career.careerInterest
    : profile.career?.careerInterest
    ? [profile.career.careerInterest]
    : Array.isArray(profile.careerInterests)
    ? profile.careerInterests
    : [];
  const careerInterests = rawInterests.map((c) => String(c).toLowerCase());
  const oppTitle = (opportunity.title || '').toLowerCase();
  const oppCategory = (opportunity.category || '').toLowerCase();

  const targetWords = targetRole.split(/\s+/).filter((w) => w.length > 2);

  const roleDirectMatch =
    targetRole &&
    (oppTitle.includes(targetRole) || targetRole.includes(oppTitle) || targetWords.some((w) => oppTitle.includes(w)));

  const categoryMatch = careerInterests.some(
    (ci) => oppCategory.includes(ci) || ci.includes(oppCategory) || oppTitle.includes(ci)
  );

  if (roleDirectMatch) {
    roleScore = 20;
  } else if (categoryMatch) {
    roleScore = 15;
  } else if (
    oppCategory === 'technology' &&
    (targetRole.includes('developer') || targetRole.includes('engineer') || targetRole.includes('tech'))
  ) {
    roleScore = 14;
  } else if (
    oppCategory === 'data' &&
    (targetRole.includes('data') || targetRole.includes('analyst') || targetRole.includes('ai'))
  ) {
    roleScore = 16;
  } else {
    roleScore = 5;
  }

  // 3. Education & Eligibility Match (10%)
  let eduScore = 10;
  const studentDegree = (profile.personal?.degree || profile.degree || '').toLowerCase();
  const studentBranch = (profile.personal?.branch || profile.branch || '').toLowerCase();
  const oppQual = (opportunity.qualification || '').toLowerCase();

  if (oppQual) {
    if (studentDegree && oppQual.includes(studentDegree)) {
      eduScore = 10;
    } else if (studentBranch && oppQual.includes(studentBranch)) {
      eduScore = 10;
    } else if (
      oppQual.includes('b.tech') ||
      oppQual.includes('bca') ||
      oppQual.includes('mca') ||
      oppQual.includes('graduate') ||
      oppQual.includes('open')
    ) {
      eduScore = 8;
    } else {
      eduScore = 6;
    }
  }

  // 4. Experience Match (10%)
  let expScore = 10;
  const oppExp = (opportunity.experience || '').toLowerCase();
  if (oppExp.includes('fresher') || oppExp.includes('0-1') || oppExp.includes('student') || oppExp.includes('intern')) {
    expScore = 10;
  } else {
    expScore = 7;
  }

  let matchPercentage;
  if (oppSkills.length > 0) {
    matchPercentage = Math.min(100, Math.max(15, skillScore + roleScore + eduScore + expScore));
  } else {
    matchPercentage = Math.round(((roleScore + eduScore + expScore) / 40) * 100);
  }

  // 5. Deterministic Explainable Reasons (Why it matches)
  const reasons = [];
  if (roleScore >= 14) {
    reasons.push(`Your target career (${profile.targetRole || 'Tech'}) matches this role.`);
  }
  if (matchedSkills.length > 0) {
    reasons.push(`You already have verified skills in ${matchedSkills.slice(0, 3).join(', ')}${matchedSkills.length > 3 ? ` and ${matchedSkills.length - 3} more` : ''}.`);
  }
  if (eduScore >= 8) {
    reasons.push(`Your academic background (${profile.degree || 'Engineering/Tech'}) meets the listed qualification.`);
  }
  if (expScore >= 8) {
    reasons.push('Your experience level matches the student/fresher requirement.');
  }
  if (opportunity.isGovernment) {
    reasons.push('Official government / public sector innovation initiative open for statewide candidates.');
  }

  // 6. Missing Requirements Rationale
  const missingReasons = [];
  if (missingSkills.length > 0) {
    missingSkills.forEach((s) => {
      missingReasons.push(`${s} is listed as a required skill.`);
    });
  }
  if (roleScore < 10) {
    missingReasons.push('Role title is in an adjacent specialization to your primary target career.');
  }

  // Human-friendly summary rationale
  let rationale = '';
  if (matchedSkills.length > 0 && roleScore >= 15) {
    rationale = `Matches your target career (${profile.targetRole || 'Tech'}) and aligns with ${matchedSkills.length} of your verified skills.`;
  } else if (matchedSkills.length > 0) {
    rationale = `Aligns with ${matchedSkills.length} key skill${matchedSkills.length > 1 ? 's' : ''} in your stack (${matchedSkills.slice(0, 3).join(', ')}).`;
  } else if (roleScore >= 15) {
    rationale = `Directly matches your designated target role: ${profile.targetRole}.`;
  } else {
    rationale = `Relevant entry-level opportunity for ${profile.degree || 'graduating students'}.`;
  }

  return {
    matchPercentage,
    overallMatch: matchPercentage,
    skillMatch: skillScore,
    roleMatch: roleScore,
    educationMatch: eduScore,
    experienceMatch: expScore,
    matchedSkills,
    missingSkills,
    reasons,
    missingReasons,
    whyItMatches: rationale,
    breakdown: {
      skillScore,
      roleScore,
      eduScore,
      expScore,
    },
  };
};/**
 * Calculates deterministic Opportunity-Specific Application Readiness
 */
export const calculateApplicationReadiness = (opportunity, profile, resumeAnalysis, interviewAnalysis) => {
  const match = calculateOpportunityMatch(opportunity, profile);

  const isProfileComplete = !!(
    profile &&
    profile.personal?.name &&
    profile.career?.targetRole &&
    Array.isArray(profile.skills?.currentSkills) &&
    profile.skills.currentSkills.length > 0
  );

  const totalReqSkills = (opportunity.skills || []).length;
  const matchedSkillsCount = match.matchedSkills.length;
  const skillCoveragePct = totalReqSkills > 0 ? Math.round((matchedSkillsCount / totalReqSkills) * 100) : 'Not specified';

  const atsScore = resumeAnalysis?.atsScore?.overall || 0;
  const isResumeReady = atsScore >= 60;

  const interviewScore = interviewAnalysis?.completed && interviewAnalysis?.overallScore?.overall
    ? interviewAnalysis.overallScore.overall
    : interviewAnalysis?.scores?.overall || 0;
  const isInterviewReady = interviewScore >= 60;

  // Opportunity-specific readiness score (0-100)
  let readinessScore = 0;
  if (totalReqSkills > 0) {
    readinessScore = Math.round(
      (skillCoveragePct * 0.40) +
      (isProfileComplete ? 20 : 5) +
      (isResumeReady ? (atsScore * 0.20) : 5) +
      (isInterviewReady ? (interviewScore * 0.20) : 5)
    );
  } else {
    // If no required skills, calculate based on the remaining 60 points and scale to 100%
    const earned = (isProfileComplete ? 20 : 5) +
                   (isResumeReady ? (atsScore * 0.20) : 5) +
                   (isInterviewReady ? (interviewScore * 0.20) : 5);
    readinessScore = Math.round((earned / 60) * 100);
  }

  let statusLabel = 'Preparation Recommended';
  let canApplyNow = false;

  if (readinessScore >= 75 && match.missingSkills.length === 0) {
    statusLabel = 'Ready to Apply';
    canApplyNow = true;
  } else if (readinessScore >= 60) {
    statusLabel = 'Almost Ready — Prepare Missing Items';
    canApplyNow = true;
  } else {
    statusLabel = 'Build Foundation First';
    canApplyNow = false;
  }

  // Deterministic Preparation Steps
  const preparationSteps = [];

  if (match.missingSkills.length > 0) {
    match.missingSkills.slice(0, 3).forEach((skill) => {
      preparationSteps.push({
        priority: 'High',
        action: `Bridge ${skill} Skill`,
        text: `Acquire practical familiarity with ${skill} via learning resources or roadmap tasks.`,
        route: `/learning?skill=${encodeURIComponent(skill)}`,
      });
    });
  }

  if (!isResumeReady) {
    preparationSteps.push({
      priority: atsScore > 0 ? 'Medium' : 'High',
      action: 'Optimize ATS Resume',
      text: `Scan and tailor your resume with keywords matching ${opportunity.title}.`,
      route: '/resume',
    });
  }

  if (!isInterviewReady) {
    preparationSteps.push({
      priority: 'Medium',
      action: 'Complete Mock Interview',
      text: `Practice answering technical and conceptual questions for ${opportunity.category || 'Tech'} roles.`,
      route: '/interview',
    });
  }

  if (!isProfileComplete) {
    preparationSteps.push({
      priority: 'High',
      action: 'Complete Profile Details',
      text: 'Ensure all academic credentials and verified skills are filled out.',
      route: '/onboarding',
    });
  }

  return {
    score: readinessScore,
    status: statusLabel,
    canApplyNow,
    factors: {
      profile: {
        label: 'Profile Completeness',
        status: isProfileComplete ? 'Complete' : 'Incomplete',
        met: isProfileComplete,
      },
      skills: {
        label: 'Skill Match Coverage',
        status: totalReqSkills > 0 ? `${skillCoveragePct}% (${matchedSkillsCount}/${totalReqSkills})` : 'Not specified',
        score: totalReqSkills > 0 ? skillCoveragePct : null,
        met: totalReqSkills > 0 ? skillCoveragePct >= 60 : null,
      },
      resume: {
        label: 'ATS Resume Ready',
        status: atsScore > 0 ? `ATS ${atsScore}%` : 'Not Scanned',
        score: atsScore,
        met: isResumeReady,
      },
      interview: {
        label: 'Mock Interview Practice',
        status: interviewScore > 0 ? `Score: ${interviewScore}%` : 'Pending Practice',
        score: interviewScore,
        met: isInterviewReady,
      },
    },
    preparationSteps,
  };
};

