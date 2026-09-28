import { normalizeSkillName, ROLE_SKILL_BENCHMARKS } from '../utils/skillNormalization.js';

export const generatePersonalizedRoadmap = (profile, careerAnalysis) => {
  const targetRole =
    profile?.career?.targetRole ||
    careerAnalysis?.careers?.[0]?.role ||
    profile?.targetRole ||
    'Full Stack Developer';

  const masteredSkills = (profile?.skills?.currentSkills || []).map((s) => normalizeSkillName(s).toLowerCase());
  const readySkills = (profile?.skills?.readyForEvaluationSkills || []).map((s) => normalizeSkillName(s).toLowerCase());

  // Extract missing skills with priority from career analysis, profile gaps, or role benchmarks
  const rawMissingSkills = careerAnalysis?.careers?.[0]?.missingSkills || [];
  let allGaps = [];
  if (rawMissingSkills.length > 0) {
    allGaps = rawMissingSkills;
  } else if (profile?.readiness?.topSkillGaps?.length > 0) {
    allGaps = profile.readiness.topSkillGaps.map((g) => ({
      skill: g.name || g.skill,
      priority: g.priority || 'High',
      reason: g.reason || `Crucial competency for ${targetRole}.`,
    }));
  } else {
    const benchmarks = ROLE_SKILL_BENCHMARKS[targetRole] || ROLE_SKILL_BENCHMARKS['Full Stack Developer'] || [];
    allGaps = benchmarks.map((skill, idx) => ({
      skill,
      priority: idx === 0 ? 'High' : 'Medium',
      reason: `Fundamental requirement for ${targetRole} workflows.`,
    }));
  }

  // Filter out skills the user has ALREADY mastered or completed in prior sprints
  const activeMissingSkills = allGaps.filter(
    (m) => m.skill && !masteredSkills.includes(m.skill.toLowerCase()) && !readySkills.includes(m.skill.toLowerCase())
  );

  const missingSkills = activeMissingSkills.length > 0
    ? activeMissingSkills
    : [
        { skill: 'System Architecture', priority: 'High', reason: `High-level design patterns and microservice scalability for ${targetRole}.` },
        { skill: 'Performance Optimization', priority: 'Medium', reason: `Benchmarking, query profiling, and latency reduction in production.` },
        { skill: 'Production Deployment & Security', priority: 'Medium', reason: `Security best practices, auth hardening, and cloud monitoring.` },
      ];

  // Pick top 3 gap skills for the roadmap weeks
  const topGaps = missingSkills.slice(0, 3);
  const gap1 = topGaps[0]?.skill || 'Core Architecture';
  const gap2 = topGaps[1]?.skill || 'Testing & Quality';
  const gap3 = topGaps[2]?.skill || 'Database & System Design';

  const weeks = [
    {
      weekNumber: 1,
      title: `${gap1} Fundamentals & Practical Setup`,
      description: `Master the foundational concepts of ${gap1} to eliminate your highest-priority career skill gap.`,
      tasks: [
        {
          taskId: 'w1_t1',
          title: `Understand core ${gap1} concepts and architecture`,
          description: `Study the fundamentals of ${gap1}, lifecycle conventions, and common production use-cases.`,
          skill: gap1,
          priority: 'High',
          estimatedHours: 4,
          completed: false,
        },
        {
          taskId: 'w1_t2',
          title: `Build hands-on ${gap1} configuration/setup`,
          description: `Create initial working prototypes applying ${gap1} directly to a sample project repository.`,
          skill: gap1,
          priority: 'High',
          estimatedHours: 5,
          completed: false,
        },
        {
          taskId: 'w1_t3',
          title: `Integrate ${gap1} with your existing tech stack`,
          description: `Refactor your local workflow to integrate ${gap1} seamlessly with your primary framework.`,
          skill: gap1,
          priority: 'High',
          estimatedHours: 4,
          completed: false,
        },
      ],
    },
    {
      weekNumber: 2,
      title: `${gap2} Implementation & Automation`,
      description: `Solidify your code quality and competency in ${gap2} required for ${targetRole} roles.`,
      tasks: [
        {
          taskId: 'w2_t1',
          title: `Master ${gap2} best practices and frameworks`,
          description: `Review industry-standard conventions and workflow patterns for ${gap2}.`,
          skill: gap2,
          priority: topGaps[1]?.priority || 'Medium',
          estimatedHours: 3,
          completed: false,
        },
        {
          taskId: 'w2_t2',
          title: `Implement practical ${gap2} suites across API endpoints`,
          description: `Write automated tests/queries covering edge cases, authentication flows, and error handlers.`,
          skill: gap2,
          priority: topGaps[1]?.priority || 'Medium',
          estimatedHours: 5,
          completed: false,
        },
        {
          taskId: 'w2_t3',
          title: `Validate performance and benchmarks`,
          description: `Verify stability, measure response times, and resolve discovered bottlenecks.`,
          skill: gap2,
          priority: 'Medium',
          estimatedHours: 3,
          completed: false,
        },
      ],
    },
    {
      weekNumber: 3,
      title: `${gap3} & Advanced Optimization`,
      description: `Deep-dive into ${gap3} to reach comprehensive technical fluency.`,
      tasks: [
        {
          taskId: 'w3_t1',
          title: `Deep-dive into ${gap3} structure and queries`,
          description: `Explore advanced patterns, schema design, indexes, and complex logic operations.`,
          skill: gap3,
          priority: topGaps[2]?.priority || 'Medium',
          estimatedHours: 4,
          completed: false,
        },
        {
          taskId: 'w3_t2',
          title: `Optimize queries and data persistence models`,
          description: `Analyze performance efficiency, caching layers, and relationship integrity.`,
          skill: gap3,
          priority: topGaps[2]?.priority || 'Medium',
          estimatedHours: 4,
          completed: false,
        },
        {
          taskId: 'w3_t3',
          title: `Perform practical exercises on public datasets / APIs`,
          description: `Complete real-world problem sets to prove hands-on fluency in ${gap3}.`,
          skill: gap3,
          priority: 'Medium',
          estimatedHours: 4,
          completed: false,
        },
      ],
    },
    {
      weekNumber: 4,
      title: `Capstone Production Project & Deployment`,
      description: `Unify all newly acquired competencies into a verified portfolio project for ${targetRole}.`,
      tasks: [
        {
          taskId: 'w4_t1',
          title: `Architect complete end-to-end ${targetRole} application`,
          description: `Incorporate ${gap1}, ${gap2}, and ${gap3} into an impressive full-scale portfolio build.`,
          skill: targetRole,
          priority: 'High',
          estimatedHours: 6,
          completed: false,
        },
        {
          taskId: 'w4_t2',
          title: `Deploy to cloud infrastructure with automated CI/CD`,
          description: `Host live application, set up environment secrets, and publish verified repository.`,
          skill: 'DevOps / Cloud',
          priority: 'High',
          estimatedHours: 5,
          completed: false,
        },
        {
          taskId: 'w4_t3',
          title: `Sync resume & take mock interview for ${targetRole}`,
          description: `Add the verified capstone project to your resume and benchmark your readiness in DishaSetu Mock Interview.`,
          skill: 'Interview Readiness',
          priority: 'Medium',
          estimatedHours: 3,
          completed: false,
        },
      ],
    },
  ];

  const totalTasks = weeks.reduce((acc, w) => acc + w.tasks.length, 0);

  return {
    targetRole,
    weeks,
    totalTasks,
    completedTasks: 0,
    overallProgress: 0,
    nextBestStep: `Start Week 1: ${weeks[0].tasks[0].title}`,
  };
};

export const calculateNextBestStep = (weeks) => {
  if (!weeks || weeks.length === 0) {
    return 'Generate your personalized career roadmap to begin.';
  }

  for (const week of weeks) {
    for (const task of week.tasks) {
      if (!task.completed) {
        return `Week ${week.weekNumber}: ${task.title}`;
      }
    }
  }

  return 'All roadmap milestones complete! Take a Mock Interview or Apply to Recommended Opportunities.';
};
