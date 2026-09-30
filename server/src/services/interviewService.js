/**
 * AI Mock Interview Service with Google Gemini Integration & Robust Multi-Stage Evaluation
 * Evaluates candidate answers using Google Gemini with structured JSON output and rigorous evidence validation.
 */

import mongoose from 'mongoose';
import { normalizeSkillName, ROLE_SKILL_BENCHMARKS } from '../utils/skillNormalization.js';
import InterviewQuestion from '../models/InterviewQuestion.js';
import {
  evaluateInterviewAnswer,
  analyzeAnswerSubstance,
  extractQuestionIntent,
  callGeminiStageA,
  evaluateOfflineStageA,
  calculateFinalScoreAndFeedback,
} from './interviewEvaluator.js';

// Comprehensive Question Taxonomy with Expected Concepts / Rubrics
export const ROLE_SKILL_QUESTIONS = {
  'Data Analyst': [
    {
      skill: 'SQL',
      difficulty: 'Medium',
      text: 'Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN in SQL with practical use cases.',
      expectedRubric: 'INNER JOIN returns only matching rows from both tables. LEFT JOIN preserves all rows from left table and matched rows from right (filling NULLs for missing right rows). FULL OUTER JOIN returns all rows from both tables, filling NULLs where no match exists.',
    },
    {
      skill: 'SQL',
      difficulty: 'Medium',
      text: 'What are SQL window functions (like ROW_NUMBER, RANK, LEAD, LAG) and how do they differ from GROUP BY aggregations?',
      expectedRubric: 'Window functions perform calculations across a partition of table rows related to the current row without collapsing rows into a single summary row like GROUP BY does.',
    },
    {
      skill: 'Excel',
      difficulty: 'Medium',
      text: 'How do you use XLOOKUP/VLOOKUP and INDEX-MATCH in Excel for robust financial modeling, and what are the benefits of dynamic array formulas?',
      expectedRubric: 'INDEX-MATCH and XLOOKUP allow leftward lookups, do not break with inserted columns, and dynamic arrays (FILTER, UNIQUE) allow spilling results without repetitive helper columns.',
    },
    {
      skill: 'PowerBI/Tableau',
      difficulty: 'Medium',
      text: 'Explain how you structure an executive visual dashboard in PowerBI or Tableau with DAX measures and interactive drill-through filters.',
      expectedRubric: 'Create high-level KPI cards at the top, trend/variance charts in the middle, use DAX for dynamic time-intelligence measures (YTD, YoY), and configure drill-through filters for granular dimension exploration.',
    },
    {
      skill: 'Statistics',
      difficulty: 'Medium',
      text: 'What is the difference between mean, median, and mode, and when is median preferable over mean in skewed business metrics?',
      expectedRubric: 'Mean is the mathematical average sensitive to extreme outliers; median is the 50th percentile robust against skewed distributions (like salaries or transaction sizes); mode is the most frequent value.',
    },
    {
      skill: 'Data Cleaning',
      difficulty: 'Medium',
      text: 'How do you identify and handle missing values, duplicate records, and data type inconsistencies during data cleaning in Python Pandas?',
      expectedRubric: 'Identify missing values with isna().sum() and duplicates with duplicated(). Handle by dropping or imputing numerical fields with median/mean and categorical with mode, converting types using astype() or pd.to_datetime().',
    },
    {
      skill: 'Python',
      difficulty: 'Medium',
      text: 'How do you perform grouping and pivot operations in Pandas to aggregate multi-dimensional dataset metrics efficiently?',
      expectedRubric: 'Use df.groupby() with .agg() for multiple aggregation functions (sum, mean, count) and df.pivot_table() with index, columns, and values for cross-tabular metric analysis.',
    },
    {
      skill: 'Reporting',
      difficulty: 'Medium',
      text: 'How do you design executive weekly KPI summaries to communicate actionable insights and variance analysis to non-technical stakeholders?',
      expectedRubric: 'Highlight bottom-line KPI variance against target benchmarks, explain the underlying root causes in plain language, and recommend 2-3 concrete operational next steps.',
    },
  ],

  'Full Stack Developer': [
    {
      skill: 'React',
      difficulty: 'Medium',
      text: 'How does the React Virtual DOM work, and how do useEffect and useMemo optimize client-side rendering performance?',
      expectedRubric: 'Virtual DOM is an in-memory representation of real DOM; React diffs previous and new vDOM trees to perform minimal batched DOM updates. useEffect handles side effects, while useMemo caches expensive computation results.',
    },
    {
      skill: 'Node.js',
      difficulty: 'Medium',
      text: 'Explain the Node.js Event Loop mechanism and how it achieves non-blocking asynchronous I/O with single-threaded execution.',
      expectedRubric: 'The event loop processes phases (timers, I/O callbacks, poll, check, close) using libuv thread pool for background I/O operations without blocking the main V8 execution thread.',
    },
    {
      skill: 'JavaScript',
      difficulty: 'Medium',
      text: 'Explain JavaScript closures, Promises, async/await, and event bubbling in modern web applications.',
      expectedRubric: 'Closures allow inner functions to retain access to outer lexical scope variables. Promises and async/await handle asynchronous control flow cleanly. Event bubbling propagates DOM events from target element up through ancestors.',
    },
    {
      skill: 'MongoDB',
      difficulty: 'Medium',
      text: 'How do document schema design, embedding vs referencing, and indexing work in MongoDB for high-throughput applications?',
      expectedRubric: 'Embedding is ideal for 1-to-few related data queried together; referencing is for 1-to-many or frequently updated data to avoid unbounded growth. B-tree indexes improve read query speeds while adding slight write overhead.',
    },
    {
      skill: 'SQL',
      difficulty: 'Medium',
      text: 'Explain database transaction isolation levels and ACID guarantees in relational databases like PostgreSQL.',
      expectedRubric: 'ACID guarantees Atomicity, Consistency, Isolation, and Durability. Isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable) prevent dirty reads, non-repeatable reads, and phantom reads.',
    },
    {
      skill: 'Docker',
      difficulty: 'Medium',
      text: 'Explain the difference between a Docker image and a container, and how multi-stage Docker builds reduce production image size.',
      expectedRubric: 'An image is a static read-only template with application code and dependencies; a container is a running isolated instance. Multi-stage builds compile code in a builder stage and copy only production artifacts into a slim base image.',
    },
    {
      skill: 'Testing',
      difficulty: 'Medium',
      text: 'How do you write reliable unit and integration tests using Jest and Supertest for REST API endpoints and error handlers?',
      expectedRubric: 'Unit tests isolate individual helper functions with mocked dependencies. Integration tests use Supertest to send HTTP requests to Express app, asserting status codes, response payloads, and database mutations.',
    },
    {
      skill: 'Git',
      difficulty: 'Easy',
      text: 'What is the role of Git branching workflows (like Gitflow or Trunk-based development) in collaborative engineering teams?',
      expectedRubric: 'Branching isolates feature work and bugfixes from the main production branch, enabling code reviews via Pull Requests, automated CI testing, and conflict resolution before merging.',
    },
  ],

  'Frontend Developer': [
    {
      skill: 'React',
      difficulty: 'Medium',
      text: 'Explain the component lifecycle in React, custom hooks, and state management trade-offs between Context API and Redux Toolkit.',
      expectedRubric: 'Lifecycle involves mount, update, and unmount handled by useEffect. Custom hooks encapsulate reusable stateful logic. Context API is suitable for low-frequency global state (themes/auth), whereas Redux is suited for high-frequency complex state.',
    },
    {
      skill: 'JavaScript',
      difficulty: 'Medium',
      text: 'Explain the prototype chain, closures, and asynchronous event loops in modern JavaScript (ES6+).',
      expectedRubric: 'Objects inherit properties via prototype linkages (__proto__). Closures preserve outer lexical environments. The event loop coordinates call stack, microtask queue (Promises), and macrotask queue (setTimeout).',
    },
    {
      skill: 'TypeScript',
      difficulty: 'Medium',
      text: 'What are the key benefits of TypeScript over pure JavaScript in building type-safe UI components and generic API wrappers?',
      expectedRubric: 'Compile-time type checking, interfaces, union types, and generics prevent runtime null/undefined bugs, improve IDE autocomplete, and ensure contract enforcement with backend APIs.',
    },
    {
      skill: 'Tailwind CSS',
      difficulty: 'Medium',
      text: 'How do utility classes in Tailwind CSS enable rapid UI development and maintain consistent design design tokens?',
      expectedRubric: 'Utility classes allow styling directly in markup without switching files, purging unused CSS in production builds, and enforcing consistent spacing, color, and typography scales from config.',
    },
    {
      skill: 'HTML/CSS',
      difficulty: 'Easy',
      text: 'How do you optimize Core Web Vitals (LCP, FID/INP, CLS) in modern browser rendering?',
      expectedRubric: 'Optimize LCP by preloading hero images and minimizing render-blocking scripts; optimize INP by breaking long tasks; prevent CLS by setting explicit width/height dimensions on images and dynamic containers.',
    },
  ],

  'Backend Developer': [
    {
      skill: 'Node.js',
      difficulty: 'Medium',
      text: 'How does Node.js handle CPU-intensive tasks without blocking the main event loop, and when should worker threads or child processes be used?',
      expectedRubric: 'Use Worker Threads (worker_threads module) to share memory and execute intensive CPU tasks (cryptography/image processing) in background threads without blocking main V8 event loop.',
    },
    {
      skill: 'Express.js',
      difficulty: 'Medium',
      text: 'How do Express.js middleware pipelines work, and how do you structure central error handling and request validation?',
      expectedRubric: 'Middleware functions execute in sequence with (req, res, next). Central error handling uses 4-argument error middleware (err, req, res, next) catching thrown errors or next(err) invocations.',
    },
    {
      skill: 'REST APIs',
      difficulty: 'Medium',
      text: 'What are the principles of RESTful API design, HTTP status codes, and idempotency across API endpoints?',
      expectedRubric: 'REST uses stateless client-server communication with standard HTTP verbs (GET, POST, PUT, DELETE). GET, PUT, and DELETE are idempotent; POST is non-idempotent. Proper status codes (200, 201, 400, 401, 404, 500) convey outcomes.',
    },
    {
      skill: 'Authentication',
      difficulty: 'Medium',
      text: 'Explain end-to-end JWT authentication with access token/refresh token rotation and secure cookie handling.',
      expectedRubric: 'Short-lived access tokens authenticate API requests; long-lived refresh tokens stored in httpOnly, secure, SameSite cookies obtain new access tokens. Refresh token rotation invalidates old tokens upon exchange to prevent reuse.',
    },
    {
      skill: 'System Design',
      difficulty: 'Hard',
      text: 'How would you architect a rate limiting and caching system using Redis to protect high-traffic backend endpoints?',
      expectedRubric: 'Use Redis key-value stores with TTL for caching hot query responses and sliding window counter or token bucket algorithms in Redis to enforce per-IP / per-user rate limits with HTTP 429 headers.',
    },
  ],
};

// Universal Canonical Technical & General Questions Knowledge Pool
export const CANONICAL_QUESTIONS_POOL = [
  {
    skill: 'Java',
    difficulty: 'Medium',
    text: 'Explain polymorphism in Java with an example.',
    expectedRubric: 'Polymorphism allows objects to take many forms. Compile-time (method overloading) and runtime polymorphism (method overriding). In runtime polymorphism, a parent class reference refers to a child object and executes overridden methods.',
  },
  {
    skill: 'Java',
    difficulty: 'Medium',
    text: 'Explain polymorphism in Java.',
    expectedRubric: 'Polymorphism allows objects to take many forms. Compile-time (method overloading) and runtime polymorphism (method overriding). In runtime polymorphism, a parent class reference refers to a child object and executes overridden methods.',
  },
  {
    skill: 'Java',
    difficulty: 'Medium',
    text: 'Explain encapsulation in Java.',
    expectedRubric: 'Encapsulation bundles data (variables) and code (methods) together within a single unit/class, restricting direct access to fields using private access modifiers and providing public getter and setter methods.',
  },
  {
    skill: 'Java',
    difficulty: 'Medium',
    text: 'Explain encapsulation.',
    expectedRubric: 'Encapsulation bundles data (variables) and code (methods) together within a single unit/class, restricting direct access to fields using private access modifiers and providing public getter and setter methods.',
  },
  {
    skill: 'Java',
    difficulty: 'Easy',
    text: 'Is Java platform independent?',
    expectedRubric: 'Yes. Java source code is compiled into platform-independent bytecode (.class) which runs on the Java Virtual Machine (JVM) available across different operating systems (Write Once, Run Anywhere).',
  },
  {
    skill: 'Data Structures',
    difficulty: 'Medium',
    text: 'What is a binary search tree?',
    expectedRubric: 'A binary search tree is a node-based binary tree data structure where each node has at most two children, and for any node, all left subtree keys are smaller and all right subtree keys are greater.',
  },
  {
    skill: 'Algorithms',
    difficulty: 'Medium',
    text: 'What is binary search?',
    expectedRubric: 'Binary search is an efficient search algorithm on sorted arrays that repeatedly divides the search interval in half, achieving O(log n) time complexity.',
  },
  {
    skill: 'Algorithms',
    difficulty: 'Medium',
    text: 'What is the time complexity of binary search?',
    expectedRubric: 'O(log n) time complexity because the search space is divided by two at each iteration.',
  },
  {
    skill: 'Java',
    difficulty: 'Medium',
    text: 'Compare ArrayList and LinkedList.',
    expectedRubric: 'ArrayList is backed by a dynamic resizable array offering O(1) random access but O(n) element insertion/deletion. LinkedList is backed by a doubly linked list offering O(1) insertion/deletion at nodes but O(n) sequential search access.',
  },
  {
    skill: 'REST APIs',
    difficulty: 'Medium',
    text: 'What is REST API?',
    expectedRubric: 'REST (Representational State Transfer) is an architectural style for networked web services using HTTP methods (GET, POST, PUT, DELETE), stateless communication, and standard data interchange formats like JSON.',
  },
  {
    skill: 'REST APIs',
    difficulty: 'Medium',
    text: 'Explain REST APIs.',
    expectedRubric: 'REST (Representational State Transfer) is an architectural style for networked web services using HTTP methods (GET, POST, PUT, DELETE), stateless communication, and standard data interchange formats like JSON.',
  },
  {
    skill: 'Java',
    difficulty: 'Medium',
    text: 'Write Java code to reverse a string.',
    expectedRubric: 'Provide a Java method using StringBuilder.reverse() or a loop swapping characters from start to end with O(n) complexity.',
  },
  {
    skill: 'Java',
    difficulty: 'Medium',
    text: 'What is inheritance in Java?',
    expectedRubric: 'Inheritance allows a child/subclass to inherit fields and methods from a parent/superclass using the extends keyword, enabling code reusability and method overriding.',
  },
];

const HR_QUESTIONS = [
  {
    skill: 'Communication',
    difficulty: 'Medium',
    text: 'Tell me about yourself, your educational background in college, and what drew you to this technical field.',
    expectedRubric: 'Clear narrative covering college education, passion for software engineering, technical projects built, and future career goals.',
  },
  {
    skill: 'Problem Solving',
    difficulty: 'Medium',
    text: 'Describe a challenging bug or technical roadblock you encountered in a project and how you systematically resolved it.',
    expectedRubric: 'Demonstrates STAR method: explains the problem context, debugging steps taken, root cause identified, and lasting solution implemented.',
  },
  {
    skill: 'Problem Solving',
    difficulty: 'Medium',
    text: 'Tell me about a project challenge.',
    expectedRubric: 'Describes project context, specific technical hurdle faced, systematic debugging or resolution steps taken, and the positive outcome.',
  },
  {
    skill: 'Time Management',
    difficulty: 'Medium',
    text: 'How do you prioritize deadlines when managing multiple coursework assignments and software projects simultaneously?',
    expectedRubric: 'Mentions prioritization frameworks (Eisenhower matrix, sprint planning, milestones), calendar blocking, and proactive communication.',
  },
];

/**
 * Generate 5 Tailored Interview Questions
 * Uses dynamic database-backed question bank managed by Admin, falling back gracefully to curated taxonomy.
 */
export const generateQuestions = async (
  role = 'Full Stack Developer',
  type = 'Technical',
  difficulty = 'Medium',
  skills = [],
  readySkills = []
) => {
  const targetRole = role || 'Full Stack Developer';
  let dbQuestions = [];

  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const query = { isActive: true };
      if (type === 'HR') {
        query.type = 'HR';
      } else {
        query.role = targetRole;
      }
      dbQuestions = await InterviewQuestion.find(query);
    }
  } catch (err) {
    console.warn('DB InterviewQuestion query fallback:', err.message);
  }

  const rolePool = dbQuestions.length > 0
    ? dbQuestions.map((q) => ({
        skill: q.skill,
        difficulty: q.difficulty || 'Medium',
        text: q.questionText,
        expectedRubric: q.expectedRubric,
      }))
    : (ROLE_SKILL_QUESTIONS[targetRole] || ROLE_SKILL_QUESTIONS['Full Stack Developer'] || []);

  const normalizedReady = (readySkills || []).map((s) => normalizeSkillName(s).toLowerCase());
  let selected = [];

  if (type === 'HR') {
    selected = (rolePool.length > 0 ? rolePool : HR_QUESTIONS).slice(0, 5);
  } else if (type === 'Mixed') {
    const techPick = rolePool.slice(0, 3);
    const hrPick = HR_QUESTIONS.slice(0, 2);
    selected = [...techPick, ...hrPick];
  } else {
    // Prioritize questions assessing candidate's readySkills or skill gaps
    const priorityQuestions = rolePool.filter((q) =>
      normalizedReady.includes(normalizeSkillName(q.skill).toLowerCase())
    );
    const otherQuestions = rolePool.filter(
      (q) => !normalizedReady.includes(normalizeSkillName(q.skill).toLowerCase())
    );

    const combined = [...priorityQuestions, ...otherQuestions];
    const usedSkills = new Set();

    for (const q of combined) {
      const canonical = normalizeSkillName(q.skill);
      if (!usedSkills.has(canonical)) {
        selected.push(q);
        usedSkills.add(canonical);
      }
      if (selected.length === 5) break;
    }

    if (selected.length < 5) {
      for (const q of rolePool) {
        if (!selected.includes(q)) {
          selected.push(q);
        }
        if (selected.length === 5) break;
      }
    }
  }

  return selected.slice(0, 5).map((q, idx) => ({
    questionIndex: idx + 1,
    questionText: q.text,
    category: normalizeSkillName(q.skill) || 'Technical',
    studentAnswer: '',
    isAnswered: false,
  }));
};

/**
 * Main Evaluation Orchestrator:
 * Executes Question-Aware, Semantic, Deterministic Two-Stage Evaluation Pipeline
 */
export const evaluateStudentAnswer = async (
  questionText,
  studentAnswer,
  role = 'Data Analyst',
  type = 'Technical',
  difficulty = 'Medium',
  targetSkill = ''
) => {
  if (!studentAnswer || !studentAnswer.trim()) {
    throw new Error('Please provide an answer to evaluate.');
  }

  const cleanAnswer = studentAnswer.trim();
  const cleanQText = questionText.trim().toLowerCase();

  // 1. Find matching question rubric from DB, role pools, HR pool, or universal canonical pool
  let matchedQ = null;
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      matchedQ = await InterviewQuestion.findOne({ questionText: questionText.trim(), isActive: true });
    }
  } catch (err) {
    // ignore
  }

  if (!matchedQ) {
    // Search role pool
    const rolePool = ROLE_SKILL_QUESTIONS[role] || ROLE_SKILL_QUESTIONS['Full Stack Developer'] || [];
    matchedQ = rolePool.find((q) => q.text.trim().toLowerCase() === cleanQText);
  }

  if (!matchedQ) {
    // Search universal pool & HR pool
    const allPools = [...CANONICAL_QUESTIONS_POOL, ...HR_QUESTIONS];
    matchedQ = allPools.find((q) => q.text.trim().toLowerCase() === cleanQText);
  }

  if (!matchedQ) {
    // Fuzzy search universal pool
    const allPools = [...CANONICAL_QUESTIONS_POOL, ...HR_QUESTIONS];
    matchedQ = allPools.find((q) => {
      const qLower = q.text.toLowerCase();
      return cleanQText.includes(qLower) || qLower.includes(cleanQText);
    });
  }

  const skill = normalizeSkillName(matchedQ?.skill) || 'Technical';
  const expectedRubric = matchedQ?.expectedRubric || `Accurate technical definition and practical explanation for: "${questionText}".`;

  // 2. Delegate to the new robust multi-stage Evaluator Engine
  return evaluateInterviewAnswer(
    questionText,
    cleanAnswer,
    role,
    type,
    difficulty,
    expectedRubric,
    targetSkill
  );
};

// Backward-compatible export aliases
export const determineAnswerValidity = analyzeAnswerSubstance;
export const callGeminiValidityJudge = callGeminiStageA;
export const callGeminiQualityScorer = callGeminiStageA;
export const evaluateSemantically = evaluateOfflineStageA;
