/**
 * Deterministic Career Readiness Score Calculator
 * 
 * Formula Weights:
 * - Technical Skills: 30%
 * - Projects: 20%
 * - Experience (Internships + Certifications): 15%
 * - Education (Academics & CGPA): 10%
 * - Target Skill Coverage: 15%
 * - Interview Readiness: 10% (Updated strictly with actual completed mock interview score)
 */

export const calculateReadinessScore = (profile, careerAnalysis = null, interviewScore = null) => {
  if (!profile) {
    return {
      overall: 0,
      breakdown: {
        technicalSkills: 0,
        projects: 0,
        experience: 0,
        education: 0,
        targetSkillCoverage: 0,
        interviewReadiness: 0,
      },
    };
  }

  const currentSkills = profile.skills?.currentSkills || [];
  const projects = profile.skills?.projects || [];
  const internships = profile.skills?.internships || [];
  const certifications = profile.skills?.certifications || [];
  const cgpaRaw = profile.academics?.cgpa;

  // 1. Technical Skills Score (Max 100) -> 30%
  const skillCount = currentSkills.length;
  const technicalSkills = skillCount > 0 ? Math.min(95, Math.max(10, skillCount * 10)) : 0;

  // 2. Projects Score (Max 100) -> 20%
  const projectCount = projects.filter((p) => p && p.trim().length > 0).length;
  let projectScore = 0;
  if (projectCount === 1) projectScore = 50;
  else if (projectCount === 2) projectScore = 75;
  else if (projectCount >= 3) projectScore = 90;

  // 3. Experience Score (Internships & Certifications) -> 15%
  const expCount =
    internships.filter((i) => i && i.trim().length > 0).length +
    certifications.filter((c) => c && c.trim().length > 0).length;
  let experienceScore = 0;
  if (expCount === 1) experienceScore = 50;
  else if (expCount === 2) experienceScore = 75;
  else if (expCount >= 3) experienceScore = 90;

  // 4. Education Score (CGPA & Academic Profile) -> 10%
  let educationScore = 0;
  if (cgpaRaw) {
    let parsedCgpa = parseFloat(cgpaRaw);
    if (!isNaN(parsedCgpa)) {
      if (parsedCgpa > 10) parsedCgpa = parsedCgpa / 10;
      educationScore = Math.min(98, Math.max(20, Math.round(parsedCgpa * 10)));
    }
  } else if (profile.academics?.degree || profile.personal?.degree) {
    educationScore = 60;
  }

  // 5. Target Skill Coverage Score -> 15%
  let targetSkillCoverage = 0;
  if (careerAnalysis?.careers?.[0]?.matchPercentage !== undefined) {
    targetSkillCoverage = careerAnalysis.careers[0].matchPercentage;
  } else if (careerAnalysis?.careers?.[0]?.requiredSkills?.length) {
    const required = careerAnalysis.careers[0].requiredSkills;
    const matched = required.filter((req) =>
      currentSkills.some((s) => s.toLowerCase() === req.toLowerCase())
    );
    targetSkillCoverage = Math.round((matched.length / required.length) * 100);
  } else if (currentSkills.length > 0) {
    targetSkillCoverage = Math.min(90, currentSkills.length * 10);
  }

  // 6. Interview Readiness Score -> 10%
  // Strictly uses verified completed mock interview score (0 if not yet attempted)
  let actualInterview = 0;
  if (typeof interviewScore === 'number' && interviewScore > 0) {
    actualInterview = interviewScore;
  }

  // Calculate Weighted Overall Score
  const overall = Math.round(
    technicalSkills * 0.30 +
    projectScore * 0.20 +
    experienceScore * 0.15 +
    educationScore * 0.10 +
    targetSkillCoverage * 0.15 +
    actualInterview * 0.10
  );

  return {
    overall: Math.min(96, Math.max(0, overall)),
    breakdown: {
      technicalSkills,
      projects: projectScore,
      experience: experienceScore,
      education: educationScore,
      targetSkillCoverage,
      interviewReadiness: actualInterview,
    },
  };
};

