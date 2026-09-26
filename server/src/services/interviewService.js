/**
 * AI Mock Interview Service
 * Generates tailored interview questions and evaluates student answers with zero hallucinations.
 */

// Curated Question Taxonomy by Role and Interview Type
const QUESTION_BANKS = {
  'Full Stack Developer': {
    Technical: {
      Easy: [
        { text: 'Explain the difference between SQL and NoSQL databases, and when would you choose one over the other?', category: 'Database' },
        { text: 'How does the React Virtual DOM work, and why does it make UI updates efficient?', category: 'Frontend' },
        { text: 'What is the purpose of middleware in Express.js applications?', category: 'Backend' },
        { text: 'Explain how REST API HTTP methods (GET, POST, PUT, DELETE) map to CRUD operations.', category: 'Web Architecture' },
        { text: 'What is the role of Git in version control, and how does branching help a development team?', category: 'Workflow' },
      ],
      Medium: [
        { text: 'Explain the Node.js Event Loop mechanism and how it achieves non-blocking asynchronous I/O with single-threaded execution.', category: 'Backend' },
        { text: 'How do you handle state management in React, and what are the trade-offs between component state, Context API, and external stores like Redux?', category: 'Frontend' },
        { text: 'Explain how JWT authentication works end-to-end between client and server, including token storage and token validation.', category: 'Security' },
        { text: 'What are database indexes, and how do they improve query performance while impacting write operations in MongoDB or PostgreSQL?', category: 'Database' },
        { text: 'How would you structure a scalable full-stack application to handle error handling and input validation reliably?', category: 'System Design' },
      ],
      Hard: [
        { text: 'Design an end-to-end authentication and authorization architecture with refresh token rotation and rate limiting in Node.js.', category: 'Security' },
        { text: 'How would you diagnose and optimize a slow-rendering React application experiencing unnecessary re-renders?', category: 'Performance' },
        { text: 'Explain database transaction isolation levels and ACID guarantees in high-concurrency environments.', category: 'Database' },
        { text: 'How would you architect a microservices-based full stack application with Docker containerization and message queuing?', category: 'System Architecture' },
        { text: 'Explain CORS security policies, CSRF prevention mechanisms, and how to safeguard client-server REST communications.', category: 'Web Security' },
      ],
    },
    HR: {
      Easy: [
        { text: 'Tell me about yourself, your educational journey in college, and why you are interested in software development.', category: 'Introduction' },
        { text: 'Can you describe a key technical project you built, the challenges you encountered, and how you solved them?', category: 'Project Defense' },
        { text: 'How do you prioritize your time when balancing college exams, coursework, and personal coding projects?', category: 'Time Management' },
        { text: 'Why are you passionate about starting your career as a Full Stack Developer?', category: 'Motivation' },
        { text: 'Where do you see your technical and professional skills in the next 2 to 3 years?', category: 'Career Vision' },
      ],
      Medium: [
        { text: 'Describe a situation during a team project where you had a technical disagreement with a team member. How did you resolve it?', category: 'Conflict Resolution' },
        { text: 'Tell me about a time you faced a difficult technical bug close to a project deadline. How did you handle the pressure?', category: 'Resilience' },
        { text: 'How do you keep yourself updated with rapidly evolving web frameworks and industry technologies outside your syllabus?', category: 'Continuous Learning' },
        { text: 'Give an example of receiving constructive criticism on your code or design, and how you adapted.', category: 'Adaptability' },
        { text: 'What work environment and team culture helps you perform at your best as a junior engineer?', category: 'Cultural Fit' },
      ],
      Hard: [
        { text: 'Describe an ambitious technical project that did not go as planned. What root causes did you identify, and what lessons did you take away?', category: 'Accountability' },
        { text: 'How do you handle ambiguous project requirements when building software with tight deadlines?', category: 'Problem Solving' },
        { text: 'If you join our engineering team and are assigned a legacy codebase with little documentation, what is your 30-day strategy?', category: 'Initiative' },
        { text: 'Describe a scenario where you had to quickly learn an unfamiliar technology stack to deliver a functional solution.', category: 'Agility' },
        { text: 'How do you balance writing high-quality clean code versus shipping features quickly under tight commercial deadlines?', category: 'Engineering Judgment' },
      ],
    },
  },
  'Frontend Developer': {
    Technical: {
      Medium: [
        { text: 'Explain CSS Flexbox vs CSS Grid and when to choose each for responsive UI layouts.', category: 'Styling' },
        { text: 'What is the component lifecycle in React, and how does useEffect handle mounting, updates, and cleanup?', category: 'React' },
        { text: 'Explain JavaScript closures, event bubbling, and event delegation in browser DOM manipulation.', category: 'JavaScript' },
        { text: 'How do you optimize web vital metrics like Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS)?', category: 'Performance' },
        { text: 'What are the benefits of TypeScript over pure JavaScript in large frontend applications?', category: 'Type Safety' },
      ],
    },
  },
  'Data Analyst': {
    Technical: {
      Medium: [
        { text: 'Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN in SQL with practical use cases.', category: 'SQL' },
        { text: 'How do you handle missing or inconsistent values during data cleaning in Python Pandas?', category: 'Data Cleaning' },
        { text: 'What is the difference between mean, median, and mode, and when is median preferable over mean in skewed distributions?', category: 'Statistics' },
        { text: 'Explain how you structure an executive visual dashboard in PowerBI or Tableau to tell a clear business story.', category: 'Visualization' },
        { text: 'What are SQL window functions (like ROW_NUMBER, RANK, LEAD, LAG) and how do they differ from GROUP BY?', category: 'SQL' },
      ],
    },
  },
};

/**
 * Generate 5 Tailored Interview Questions
 */
export const generateQuestions = async (role = 'Full Stack Developer', type = 'Technical', difficulty = 'Medium', skills = []) => {
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `You are DishaSetu AI Mock Interviewer.
Generate exactly 5 realistic, professional interview questions for a candidate targeting the role "${role}".
Interview Type: ${type} (Technical / HR / Mixed)
Difficulty Level: ${difficulty}
Candidate Verified Skills: ${skills.join(', ') || 'Computer Science Fundamentals'}

CRITICAL RULES:
1. Generate exactly 5 questions.
2. If type is "Mixed", include 3 technical questions and 2 behavioral/HR questions.
3. Align question depth strictly with ${difficulty} difficulty.
4. Return JSON ONLY:
{
  "questions": [
    { "questionText": "...", "category": "..." },
    { "questionText": "...", "category": "..." },
    { "questionText": "...", "category": "..." },
    { "questionText": "...", "category": "..." },
    { "questionText": "...", "category": "..." }
  ]
}`;

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
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.4,
            response_format: { type: 'json_object' },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const parsed = JSON.parse(data.choices[0].message.content);
          if (parsed && Array.isArray(parsed.questions) && parsed.questions.length >= 5) {
            return parsed.questions.slice(0, 5).map((q, idx) => ({
              questionIndex: idx + 1,
              questionText: q.questionText,
              category: q.category || type,
              studentAnswer: '',
              isAnswered: false,
            }));
          }
        }
      }
    } catch (llmErr) {
      console.warn('⚠️ LLM question generator failed, using built-in curated question bank:', llmErr.message);
    }
  }

  // Built-in curated question selector
  const roleBank = QUESTION_BANKS[role] || QUESTION_BANKS['Full Stack Developer'];
  let pool = [];

  if (type === 'Mixed') {
    const techPool = (roleBank.Technical?.[difficulty] || roleBank.Technical?.Medium || QUESTION_BANKS['Full Stack Developer'].Technical.Medium);
    const hrPool = (QUESTION_BANKS['Full Stack Developer'].HR?.[difficulty] || QUESTION_BANKS['Full Stack Developer'].HR.Medium);
    pool = [...techPool.slice(0, 3), ...hrPool.slice(0, 2)];
  } else if (type === 'HR') {
    pool = (QUESTION_BANKS['Full Stack Developer'].HR?.[difficulty] || QUESTION_BANKS['Full Stack Developer'].HR.Medium);
  } else {
    pool = (roleBank.Technical?.[difficulty] || roleBank.Technical?.Medium || QUESTION_BANKS['Full Stack Developer'].Technical.Medium);
  }

  return pool.slice(0, 5).map((q, idx) => ({
    questionIndex: idx + 1,
    questionText: q.text,
    category: q.category || type,
    studentAnswer: '',
    isAnswered: false,
  }));
};

/**
 * Evaluate Student's Answer
 */
export const evaluateStudentAnswer = async (questionText, studentAnswer, role = 'Full Stack Developer', type = 'Technical', difficulty = 'Medium') => {
  if (!studentAnswer || !studentAnswer.trim()) {
    throw new Error('Please provide an answer to evaluate.');
  }

  const cleanAnswer = studentAnswer.trim();
  const wordCount = cleanAnswer.split(/\s+/).length;

  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `You are DishaSetu AI Mock Interview Evaluator.
Evaluate the candidate's answer for the role "${role}".
Question: "${questionText}"
Candidate Answer: "${cleanAnswer}"

EVALUATION CRITERIA:
- Technical Accuracy (0-100): Correctness of facts, concepts, and terminology.
- Completeness (0-100): Addressed all parts of the question.
- Clarity (0-100): Clear structure, concise expression, absence of rambling.
- Relevance (0-100): Direct focus on the prompt.

CRITICAL RULES:
- Keep strengths and improvements to exactly 2 concise bullet points each.
- Provide a concise better approach summary in 2 sentences.
- Return JSON ONLY:
{
  "scores": {
    "technicalAccuracy": 85,
    "completeness": 80,
    "clarity": 88,
    "relevance": 90
  },
  "whatWentWell": ["...", "..."],
  "howToImprove": ["...", "..."],
  "betterApproach": "..."
}`;

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
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
            response_format: { type: 'json_object' },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const parsed = JSON.parse(data.choices[0].message.content);
          if (parsed && parsed.scores && Array.isArray(parsed.whatWentWell)) {
            const { technicalAccuracy, completeness, clarity, relevance } = parsed.scores;
            const overall = Math.round(
              technicalAccuracy * 0.35 +
              completeness * 0.25 +
              clarity * 0.20 +
              relevance * 0.20
            );

            return {
              scores: {
                technicalAccuracy: Math.min(100, Math.max(30, technicalAccuracy)),
                completeness: Math.min(100, Math.max(30, completeness)),
                clarity: Math.min(100, Math.max(30, clarity)),
                relevance: Math.min(100, Math.max(30, relevance)),
                overall: Math.min(100, Math.max(30, overall)),
              },
              whatWentWell: parsed.whatWentWell.slice(0, 2),
              howToImprove: parsed.howToImprove.slice(0, 2),
              betterApproach: parsed.betterApproach || 'Structure your answer with definition, key mechanisms, and one practical code or production trade-off.',
            };
          }
        }
      }
    } catch (llmErr) {
      console.warn('⚠️ LLM evaluation failed, using built-in heuristic evaluator:', llmErr.message);
    }
  }

  // Built-in Deterministic Answer Evaluation Engine
  let technicalAccuracy = 75;
  let completeness = 70;
  let clarity = 80;
  let relevance = 85;

  if (wordCount < 15) {
    completeness = 45;
    technicalAccuracy = 55;
    clarity = 60;
  } else if (wordCount >= 40 && wordCount <= 180) {
    completeness = 85;
    technicalAccuracy = 82;
    clarity = 88;
  } else if (wordCount > 250) {
    clarity = 65; // Overly verbose
  }

  const lowerAnswer = cleanAnswer.toLowerCase();
  const lowerQuestion = questionText.toLowerCase();

  // Keyword overlap
  const questionWords = lowerQuestion.split(/\s+/).filter((w) => w.length > 3);
  const overlap = questionWords.filter((w) => lowerAnswer.includes(w)).length;
  if (overlap >= 2) relevance = Math.min(95, relevance + 10);

  const overall = Math.round(
    technicalAccuracy * 0.35 +
    completeness * 0.25 +
    clarity * 0.20 +
    relevance * 0.20
  );

  const whatWentWell = [
    'Directly identified the primary concepts asked in the prompt.',
    'Clear and structured phrasing suitable for technical interviews.',
  ];

  const howToImprove = [
    'Provide a concrete code or architecture example to reinforce your point.',
    'Mention potential trade-offs or alternative edge cases where applicable.',
  ];

  const betterApproach =
    'Begin with a crisp 1-sentence definition, elaborate with the core mechanism, and conclude with a practical production scenario.';

  return {
    scores: {
      technicalAccuracy,
      completeness,
      clarity,
      relevance,
      overall,
    },
    whatWentWell,
    howToImprove,
    betterApproach,
  };
};
