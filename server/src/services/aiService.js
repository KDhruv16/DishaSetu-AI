/**
 * AI Career Intelligence Service
 * Analyzes authentic student profile data and generates structured career recommendations.
 */

// Industry skill benchmark taxonomy for accurate skill matching & gap discovery
const INDUSTRY_TAXONOMY = {
  'Full Stack Developer': {
    required: ['React', 'Node.js', 'JavaScript', 'HTML/CSS', 'MongoDB', 'SQL', 'Git', 'Docker', 'Testing'],
    reasons: {
      Docker: 'Essential for containerizing microservices and ensuring consistent deployments.',
      Testing: 'Required for writing reliable test suites (Jest/Supertest) in production teams.',
      SQL: 'Fundamental for relational database queries and complex reporting.',
      'Node.js': 'Crucial for server-side business logic and API endpoints.',
      React: 'Industry standard for high-performance single-page web applications.',
      Git: 'Indispensable for team collaboration and version control.',
    },
    nextSteps: {
      Docker: 'Learn Docker containerization fundamentals and write a Dockerfile for an existing project.',
      Testing: 'Add unit and integration tests to your backend API using Jest.',
      SQL: 'Practice relational schema design and complex joins with PostgreSQL.',
    },
  },
  'Frontend Developer': {
    required: ['React', 'JavaScript', 'HTML/CSS', 'Tailwind CSS', 'TypeScript', 'Git', 'Redux', 'UI/UX Basics'],
    reasons: {
      TypeScript: 'Crucial for large-scale frontend codebases with strict type safety.',
      'Tailwind CSS': 'Standard utility-first CSS framework across modern web applications.',
      Redux: 'Important for complex global client-side state management.',
      'UI/UX Basics': 'Vital for crafting accessible and polished user interfaces.',
    },
    nextSteps: {
      TypeScript: 'Convert one React component library or project to TypeScript.',
      'Tailwind CSS': 'Build a responsive, modern dashboard layout using Tailwind CSS.',
      Redux: 'Implement centralized state management with Redux Toolkit.',
    },
  },
  'Backend Developer': {
    required: ['Node.js', 'Express.js', 'SQL', 'MongoDB', 'Docker', 'REST APIs', 'Authentication', 'System Design'],
    reasons: {
      'System Design': 'Required for structuring scalable microservices and caching layers.',
      Docker: 'Standard for packaging backend services into reproducible containers.',
      SQL: 'Essential for robust ACID transactions and relational data modeling.',
      Authentication: 'Required for implementing secure JWT and OAuth session architectures.',
    },
    nextSteps: {
      'System Design': 'Design and document a scalable REST API with rate limiting and caching.',
      Docker: 'Containerize your backend API service with a Docker Compose stack.',
      SQL: 'Optimize SQL indexing and query execution plans for database performance.',
    },
  },
  'AI / ML Engineer': {
    required: ['Python', 'Machine Learning', 'TensorFlow/PyTorch', 'Data Analysis', 'Pandas', 'SQL', 'Math/Stats'],
    reasons: {
      'TensorFlow/PyTorch': 'Core frameworks for building and fine-tuning neural network models.',
      Pandas: 'Standard library for structured data manipulation and feature engineering.',
      SQL: 'Essential for extracting datasets from enterprise data warehouses.',
      'Math/Stats': 'Foundational for understanding model convergence and loss metrics.',
    },
    nextSteps: {
      'TensorFlow/PyTorch': 'Train and evaluate a supervised learning classification model on a real-world dataset.',
      Pandas: 'Perform exploratory data analysis and feature engineering on Kaggle datasets.',
      Python: 'Deepen Python data structures and asynchronous API integrations.',
    },
  },
  'Data Analyst': {
    required: ['SQL', 'Python', 'Excel', 'PowerBI/Tableau', 'Statistics', 'Data Cleaning', 'Reporting'],
    reasons: {
      'PowerBI/Tableau': 'Essential for creating executive visual dashboards and reports.',
      SQL: 'Crucial for querying enterprise relational databases and aggregates.',
      Statistics: 'Key for hypothesis testing and trend significance analysis.',
      Excel: 'Standard tool for rapid business analysis and financial modeling.',
    },
    nextSteps: {
      'PowerBI/Tableau': 'Build an interactive business intelligence dashboard using sample retail data.',
      SQL: 'Master window functions and subqueries for advanced metric calculation.',
      Python: 'Automate data cleaning and report generation using Python scripts.',
    },
  },
  'Cloud / DevOps Engineer': {
    required: ['Linux', 'Docker', 'Kubernetes', 'AWS/Azure', 'CI/CD', 'Git', 'Terraform', 'Networking'],
    reasons: {
      Kubernetes: 'Industry standard for orchestrating containerized clusters in production.',
      'CI/CD': 'Crucial for automated build, test, and release delivery pipelines.',
      Linux: 'Fundamental OS layer for cloud server management and bash scripting.',
      Terraform: 'Leading Infrastructure-as-Code tool for cloud provisioning.',
    },
    nextSteps: {
      'CI/CD': 'Create a GitHub Actions workflow to automatically test and deploy your web app.',
      Docker: 'Build and run multi-stage Docker container builds.',
      Kubernetes: 'Deploy a multi-service app on a local Minikube / K8s cluster.',
    },
  },
};

/**
 * Perform Profile-Driven Career Analysis
 */
export const generateCareerAnalysis = async (profile) => {
  const currentSkills = profile.skills?.currentSkills || [];
  const targetRole = profile.career?.targetRole || 'Full Stack Developer';
  const careerInterest = profile.career?.careerInterest || 'Software Development';
  const degree = profile.personal?.degree || 'B.Tech';
  const branch = profile.personal?.branch || 'Computer Science';
  const semester = profile.academics?.semester || '6th Semester';
  const projects = profile.skills?.projects || [];

  // Check if external LLM API key is provided
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const systemPrompt = `You are DishaSetu AI, an expert career readiness mentor for college students in India.
Analyze the following student profile and return up to 3 suitable career recommendations in strictly valid JSON.
RULES:
1. Only analyze the provided student data. NEVER invent or fabricate skills, projects, experience, or achievements.
2. Recommend at most 3 realistic career paths. The primary recommendation must align with targetRole (${targetRole}) or careerInterest (${careerInterest}) using existing skills as evidence.
3. Identify genuine missing skills for each role.
4. Keep explanations concise and actionable.
5. Return JSON ONLY with no extra text or markdown formatting.

Required JSON Structure:
{
  "careers": [
    {
      "role": "Role Name",
      "matchPercentage": 85,
      "whyItMatches": [
        "Concise reason based strictly on their skills or projects"
      ],
      "requiredSkills": ["Skill 1", "Skill 2"],
      "missingSkills": [
        {
          "skill": "Missing Skill Name",
          "priority": "High" | "Medium" | "Low",
          "reason": "One concise sentence explaining why it is needed"
        }
      ],
      "nextStep": "One clear actionable step"
    }
  ]
}`;

      const userContent = JSON.stringify({
        name: profile.personal?.name,
        degree,
        branch,
        semester,
        targetRole,
        careerInterest,
        currentSkills,
        projects,
        internships: profile.skills?.internships || [],
        certifications: profile.skills?.certifications || [],
      });

      // Call LLM API (Generic OpenAI / compatible endpoint or Gemini)
      if (process.env.OPENAI_API_KEY || process.env.AI_API_KEY) {
        const key = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: process.env.AI_MODEL || 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userContent },
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const parsed = JSON.parse(data.choices[0].message.content);
          if (parsed && parsed.careers && parsed.careers.length > 0) {
            return parsed;
          }
        }
      }
    } catch (llmError) {
      console.warn('⚠️ External LLM call failed, falling back to built-in intelligence engine:', llmError.message);
    }
  }

  // Profile-driven deterministic intelligence engine
  return generateProfileDrivenAnalysis(profile);
};

/**
 * Built-in Profile-Driven Intelligence Engine
 * Computes exact match percentages, why-it-matches reasons, skill gaps, and next best steps from live profile
 */
const generateProfileDrivenAnalysis = (profile) => {
  const currentSkills = (profile.skills?.currentSkills || []).map((s) => s.trim());
  const normalizedUserSkills = currentSkills.map((s) => s.toLowerCase());
  const targetRole = profile.career?.targetRole || 'Full Stack Developer';
  const projects = profile.skills?.projects || [];

  // Determine Primary Role and 2 Alternative Roles
  const allRoles = Object.keys(INDUSTRY_TAXONOMY);
  let primaryRole = targetRole;
  if (!INDUSTRY_TAXONOMY[primaryRole]) {
    primaryRole = 'Full Stack Developer';
  }

  const alternativeRoles = allRoles
    .filter((r) => r !== primaryRole)
    .slice(0, 2);

  const selectedRoles = [primaryRole, ...alternativeRoles];

  const careers = selectedRoles.map((role, index) => {
    const roleConfig = INDUSTRY_TAXONOMY[role] || INDUSTRY_TAXONOMY['Full Stack Developer'];
    const requiredSkills = roleConfig.required;

    // Matched skills from student profile
    const matchedSkills = requiredSkills.filter((req) =>
      normalizedUserSkills.includes(req.toLowerCase())
    );

    // Missing skills
    const missing = requiredSkills.filter(
      (req) => !normalizedUserSkills.includes(req.toLowerCase())
    );

    // Dynamic match percentage
    let matchPct = Math.round((matchedSkills.length / requiredSkills.length) * 100);
    // Primary role gets weighted context fit
    if (index === 0) {
      matchPct = Math.min(95, Math.max(55, matchPct + 15));
    } else {
      matchPct = Math.min(88, Math.max(40, matchPct));
    }

    // Why it matches (based ONLY on actual student skills & projects)
    const whyItMatches = [];
    if (matchedSkills.length > 0) {
      whyItMatches.push(
        `Hands-on proficiency in core technologies: ${matchedSkills.slice(0, 3).join(', ')}.`
      );
    }
    if (projects.length > 0 && projects[0].trim().length > 0) {
      whyItMatches.push(
        `Demonstrated project experience with "${projects[0]}".`
      );
    } else {
      whyItMatches.push(
        `Academic curriculum in ${profile.personal?.branch || 'Engineering'} provides foundational prerequisite concepts.`
      );
    }
    if (matchedSkills.length >= 3) {
      whyItMatches.push(
        `Matches ${matchedSkills.length} out of ${requiredSkills.length} core technical competencies for ${role}.`
      );
    }

    // Missing skills with priority and reasons
    const missingSkills = missing.slice(0, 3).map((mSkill, idx) => {
      const priority = idx === 0 ? 'High' : idx === 1 ? 'Medium' : 'Low';
      const reason =
        roleConfig.reasons[mSkill] ||
        `Important for modern ${role} development and industry standard practices.`;
      return {
        skill: mSkill,
        priority,
        reason,
      };
    });

    // Next step
    let nextStep = `Master ${missingSkills[0]?.skill || 'advanced concepts'} to accelerate your readiness for ${role}.`;
    if (missingSkills[0]?.skill && roleConfig.nextSteps[missingSkills[0].skill]) {
      nextStep = roleConfig.nextSteps[missingSkills[0].skill];
    }

    return {
      role,
      matchPercentage: matchPct,
      whyItMatches,
      requiredSkills,
      missingSkills,
      nextStep,
    };
  });

  return { careers: careers.slice(0, 3) };
};
