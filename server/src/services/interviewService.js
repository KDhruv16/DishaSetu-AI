/**
 * AI Mock Interview Service with Google Gemini Integration
 * Evaluates candidate answers using Google Gemini with structured JSON output and rigorous evidence validation.
 */

import { normalizeSkillName, ROLE_SKILL_BENCHMARKS } from '../utils/skillNormalization.js';

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

const HR_QUESTIONS = [
  { skill: 'Communication', difficulty: 'Medium', text: 'Tell me about yourself, your educational background in college, and what drew you to this technical field.', expectedRubric: 'Clear narrative covering college education, passion for software engineering, technical projects built, and future career goals.' },
  { skill: 'Problem Solving', difficulty: 'Medium', text: 'Describe a challenging bug or technical roadblock you encountered in a project and how you systematically resolved it.', expectedRubric: 'Demonstrates STAR method: explains the problem context, debugging steps taken, root cause identified, and lasting solution implemented.' },
  { skill: 'Time Management', difficulty: 'Medium', text: 'How do you prioritize deadlines when managing multiple coursework assignments and software projects simultaneously?', expectedRubric: 'Mentions prioritization frameworks (Eisenhower matrix, sprint planning, milestones), calendar blocking, and proactive communication.' },
];

import InterviewQuestion from '../models/InterviewQuestion.js';

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
    const query = { isActive: true };
    if (type === 'HR') {
      query.type = 'HR';
    } else {
      query.role = targetRole;
    }
    dbQuestions = await InterviewQuestion.find(query);
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
 * STAGE 1: Deterministic Heuristic & Algorithmic Answer Validity Gate
 * Checks candidate answer for empty, gibberish, explicit unknown, question echo / repetition + agreement,
 * filler padding, off-topic personal intro, and keyword-only spam.
 *
 * Returns: {
 *   isMeaningfulAnswer: boolean,
 *   isQuestionRestatement: boolean,
 *   isOffTopic: boolean,
 *   isExplicitUnknown: boolean,
 *   isKeywordSpam: boolean,
 *   answerStatus: 'VALID' | 'PARTIAL' | 'INSUFFICIENT',
 *   reason: string
 * }
 */
export const determineAnswerValidity = (text, questionText = '', expectedRubric = '') => {
  if (!text || typeof text !== 'string') {
    return {
      isMeaningfulAnswer: false,
      isQuestionRestatement: false,
      isOffTopic: false,
      isExplicitUnknown: false,
      isKeywordSpam: false,
      answerStatus: 'INSUFFICIENT',
      reason: 'The response is empty.',
    };
  }

  const clean = text.trim();
  const lower = clean.toLowerCase();
  const words = clean.split(/\s+/).filter(Boolean);

  // 1. Empty or extremely short nonsense ("abc", "xyz", "..")
  if (clean.length < 3 || words.length < 1) {
    return {
      isMeaningfulAnswer: false,
      isQuestionRestatement: false,
      isOffTopic: false,
      isExplicitUnknown: false,
      isKeywordSpam: false,
      answerStatus: 'INSUFFICIENT',
      reason: 'The response does not contain substantive content.',
    };
  }

  const pureGibberish = new Set([
    'abc', 'xyz', 'asdf', 'qwerty', 'ok', 'hello', 'hi', 'hey', 'test', 'testing',
    'idk', 'pass', 'skip', 'na', 'n/a', 'none', 'nothing', 'bla', 'blabla', 'blah',
    'yes', 'no', 'dunno', 'nope', 'nah', 'lol', 'good', 'nice', 'cool',
  ]);
  if (pureGibberish.has(lower) || /^(.)\1{3,}$/.test(lower)) {
    return {
      isMeaningfulAnswer: false,
      isQuestionRestatement: false,
      isOffTopic: false,
      isExplicitUnknown: false,
      isKeywordSpam: false,
      answerStatus: 'INSUFFICIENT',
      reason: 'The response contains meaningless or single-character gibberish.',
    };
  }

  // 2. Explicit "I don't know" / unknown statements
  const unknownPatterns = [
    /\bi don'?t know\b/i,
    /\bi dont know\b/i,
    /\bnot know the answer\b/i,
    /\bdo not know the answer\b/i,
    /\bdon'?t know the answer\b/i,
    /\bhave no idea\b/i,
    /\bhave no clue\b/i,
    /\bcannot answer\b/i,
    /\bcan'?t answer\b/i,
    /\bnot sure about this\b/i,
    /\bno knowledge\b/i,
    /\bnot aware\b/i,
    /\bunable to answer\b/i,
    /\bi am not know\b/i,
    /\bnot knowing\b/i,
  ];
  const hasUnknownStatement = unknownPatterns.some((pattern) => pattern.test(lower));

  // 3. Filler / Padding / Intentional word count inflation
  const fillerPatterns = [
    /\bincreasing the size\b/i,
    /\banswer ok\b/i,
    /\bok answer\b/i,
    /\bwhats? is the answer\b/i,
    /\bjust writing text\b/i,
    /\brandome? text\b/i,
    /\blorem ipsum\b/i,
    /\blook real for testing\b/i,
    /\btesting only\b/i,
  ];
  const hasFiller = fillerPatterns.some((pattern) => pattern.test(lower));

  // 4. CRITICAL QUESTION-REPETITION / ECHO & AGREEMENT DETECTION
  // E.g. Question: "Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN in SQL with practical use cases."
  // Answer: "Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN in SQL with practical use cases yeah it is right i am agree with our point"
  const cleanQ = questionText.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
  const qWords = cleanQ.split(/\s+/).filter((w) => w.length >= 2);
  const qWordSet = new Set(qWords);

  const cleanAns = lower.replace(/[^\w\s]/g, ' ').trim();
  const ansWords = cleanAns.split(/\s+/).filter((w) => w.length >= 2);

  // Common agreement/filler words often appended to copied question
  const agreementAndFillerWords = new Set([
    'yes', 'yeah', 'yep', 'it', 'is', 'right', 'i', 'am', 'agree', 'with', 'our', 'point',
    'points', 'correct', 'true', 'ok', 'okay', 'sure', 'fine', 'exactly', 'same', 'as',
    'above', 'well', 'said', 'understood', 'know', 'that', 'this', 'can', 'you', 'please',
    'tell', 'me', 'what', 'how', 'why'
  ]);

  // Check how many words in candidate answer come from the question or agreement filler
  let questionMatchCount = 0;
  let substantiveNovelWords = [];

  for (const w of ansWords) {
    if (qWordSet.has(w)) {
      questionMatchCount++;
    } else if (!agreementAndFillerWords.has(w)) {
      substantiveNovelWords.push(w);
    }
  }

  const questionOverlapRatio = ansWords.length > 0 ? questionMatchCount / ansWords.length : 0;
  const isQuestionExactCopy = cleanAns === cleanQ || cleanAns.startsWith(cleanQ);

  if (isQuestionExactCopy && substantiveNovelWords.length < 5) {
    return {
      isMeaningfulAnswer: false,
      isQuestionRestatement: true,
      isOffTopic: false,
      isExplicitUnknown: false,
      isKeywordSpam: false,
      answerStatus: 'INSUFFICIENT',
      reason: 'The candidate merely repeated/copied the question with agreement or filler and did not provide an answer.',
    };
  }

  if (questionOverlapRatio > 0.60 && substantiveNovelWords.length < 5 && ansWords.length >= 5) {
    return {
      isMeaningfulAnswer: false,
      isQuestionRestatement: true,
      isOffTopic: false,
      isExplicitUnknown: false,
      isKeywordSpam: false,
      answerStatus: 'INSUFFICIENT',
      reason: 'The response repeats the question terms with agreement words without introducing new explanatory content.',
    };
  }

  // Extract key concept tokens from expected rubric (NOT the question, to prevent echo passing)
  const stopWords = new Set([
    'what', 'explain', 'difference', 'between', 'with', 'from', 'this', 'that', 'they',
    'does', 'your', 'about', 'when', 'which', 'where', 'have', 'been', 'should', 'would',
    'could', 'into', 'some', 'more', 'also', 'such', 'like', 'than', 'them', 'these', 'those'
  ]);
  const rawRubricTokens = (expectedRubric || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !stopWords.has(w));
  const uniqueRubricTokens = Array.from(new Set(rawRubricTokens));

  const matchedRubricTokens = uniqueRubricTokens.filter((token) => {
    const stem = token.length > 5 ? token.slice(0, 5) : token;
    return lower.includes(token) || lower.includes(stem);
  });
  const rubricMatchRatio = uniqueRubricTokens.length > 0 ? matchedRubricTokens.length / uniqueRubricTokens.length : 0;

  // 5. Personal introduction without technical relevance (e.g. "My name is Rahul and I am a B.Tech student.")
  const isPersonalIntro = /^(hello|hi|hey|good morning|good afternoon)?\s*,?\s*(my name is|i am|i'm|myself)\s+/i.test(lower);
  if (isPersonalIntro && rubricMatchRatio === 0) {
    return {
      isMeaningfulAnswer: false,
      isQuestionRestatement: false,
      isOffTopic: true,
      isExplicitUnknown: false,
      isKeywordSpam: false,
      answerStatus: 'INSUFFICIENT',
      reason: 'The response is an off-topic personal introduction unrelated to the technical question.',
    };
  }

  // 6. Explicit unknown statements without technical explanation
  if (hasUnknownStatement && (substantiveNovelWords.length < 4 || rubricMatchRatio === 0)) {
    return {
      isMeaningfulAnswer: false,
      isQuestionRestatement: false,
      isOffTopic: false,
      isExplicitUnknown: true,
      isKeywordSpam: false,
      answerStatus: 'INSUFFICIENT',
      reason: 'The candidate explicitly stated a lack of knowledge with no valid technical explanation.',
    };
  }

  // 7. Filler / intentional padding with no explanation
  if (hasFiller && (substantiveNovelWords.length < 4 || rubricMatchRatio === 0)) {
    return {
      isMeaningfulAnswer: false,
      isQuestionRestatement: false,
      isOffTopic: false,
      isExplicitUnknown: false,
      isKeywordSpam: false,
      answerStatus: 'INSUFFICIENT',
      reason: 'The response contains filler phrases / intentional padding with no technical explanation.',
    };
  }

  // 8. Keyword spam without explanatory sentence structure
  // E.g. "INNER JOIN LEFT JOIN SQL TABLE DATABASE JOIN JOIN"
  const explanatoryTokens = [
    'is', 'are', 'was', 'were', 'returns', 'preserves', 'calculates', 'allows', 'without',
    'because', 'when', 'which', 'that', 'where', 'while', 'than', 'perform', 'calculate',
    'spills', 'used', 'uses', 'using', 'identify', 'identifying', 'handle', 'handling',
    'dropping', 'imputing', 'impute', 'converting', 'convert', 'measure', 'measures',
    'structure', 'structuring', 'filter', 'filters', 'filtering', 'aggregate', 'aggregates',
    'aggregation', 'sensitive', 'robust', 'instead', 'difference', 'lookup', 'lookups',
    'searches', 'with', 'by', 'for', 'from', 'into', 'then', 'also', 'matches', 'unmatched',
    'null', 'nulls', 'table', 'rows', 'columns', 'value', 'values', 'query', 'queries'
  ];
  const hasExplanatoryStructure = explanatoryTokens.some((t) => lower.includes(t));

  if (words.length >= 4 && words.length <= 25 && !hasExplanatoryStructure) {
    return {
      isMeaningfulAnswer: false,
      isQuestionRestatement: false,
      isOffTopic: false,
      isExplicitUnknown: false,
      isKeywordSpam: true,
      answerStatus: 'INSUFFICIENT',
      reason: 'The response is a list of keywords without conceptual explanation or reasoning.',
    };
  }

  // 9. Zero concept overlap with the expected rubric
  if (rubricMatchRatio === 0) {
    return {
      isMeaningfulAnswer: false,
      isQuestionRestatement: false,
      isOffTopic: true,
      isExplicitUnknown: false,
      isKeywordSpam: false,
      answerStatus: 'INSUFFICIENT',
      reason: 'The response does not address the interview question or core technical concepts.',
    };
  }

  // Passed Stage 1: VALID or PARTIAL
  if (rubricMatchRatio >= 0.20 && hasExplanatoryStructure) {
    return {
      isMeaningfulAnswer: true,
      isQuestionRestatement: false,
      isOffTopic: false,
      isExplicitUnknown: false,
      isKeywordSpam: false,
      answerStatus: 'VALID',
      reason: 'Response provides relevant technical propositions answering the question.',
    };
  }

  return {
    isMeaningfulAnswer: true,
    isQuestionRestatement: false,
    isOffTopic: false,
    isExplicitUnknown: false,
    isKeywordSpam: false,
    answerStatus: 'PARTIAL',
    reason: 'Response provides partial technical information.',
  };
};

/**
 * STAGE 1 AI CALL: Dedicated Gemini Answer Validity Judge
 * Responsible ONLY for answering: "Does this candidate response actually attempt to answer the question?"
 * Must NOT calculate a quality score.
 */
export const callGeminiValidityJudge = async (
  questionText,
  studentAnswer,
  role = 'Data Analyst',
  skill = 'SQL'
) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const models = [
    process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'gemini-pro',
  ];

  const prompt = `You are DishaSetu AI's Stage 1 Answer Validity Judge.
Your ONLY responsibility is to determine: "Does this candidate response actually attempt to provide a meaningful answer to the technical question?"
Do NOT calculate a numerical score.

TARGET ROLE: ${role}
SKILL: ${skill}
INTERVIEW QUESTION: "${questionText}"

CANDIDATE ACTUAL ANSWER:
"""${studentAnswer}"""

DECISION RULES FOR STAGE 1:
Return validity = "INSUFFICIENT" (and isMeaningfulAnswer = false) if the candidate:
1. Writes "abc", "xyz", random gibberish, or single-character spam.
2. Says "I don't know", "no idea", "not know the answer", "cannot answer", "not sure", or equivalents.
3. Gives off-topic personal introductions or irrelevant filler (e.g., "My name is Rahul and I am a B.Tech student").
4. Repeats or paraphrases the question without providing an answer.
5. Copies the question and merely appends agreement words (e.g., "Explain INNER JOIN... yeah it is right i am agree with our point", "yes", "I agree", "correct").
6. Lists keywords without conceptual explanation or propositional content.
7. Provides filler padding or a long response containing no actual explanation.

Return validity = "VALID" or "PARTIAL" (and isMeaningfulAnswer = true) ONLY if the candidate provides NEW technical information and explanation addressing the question.

Return STRICT JSON matching this schema:
{
  "isMeaningfulAnswer": true | false,
  "isQuestionRestatement": true | false,
  "isOffTopic": true | false,
  "isExplicitUnknown": true | false,
  "isKeywordSpam": true | false,
  "validity": "VALID" | "PARTIAL" | "INSUFFICIENT",
  "reason": "Clear concise reason for validity verdict."
}`;

  for (const model of models) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.0,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          const parsed = JSON.parse(candidateText);
          if (parsed && typeof parsed.validity === 'string') {
            const valUpper = parsed.validity.toUpperCase();
            const validity = (valUpper === 'VALID' || valUpper === 'PARTIAL') ? valUpper : 'INSUFFICIENT';
            return {
              isMeaningfulAnswer: parsed.isMeaningfulAnswer === true && validity !== 'INSUFFICIENT',
              isQuestionRestatement: parsed.isQuestionRestatement === true,
              isOffTopic: parsed.isOffTopic === true,
              isExplicitUnknown: parsed.isExplicitUnknown === true,
              isKeywordSpam: parsed.isKeywordSpam === true,
              validity,
              reason: parsed.reason || (validity === 'INSUFFICIENT' ? 'The response does not meaningfully answer the question.' : 'Valid technical response.'),
            };
          }
        }
      }
    } catch (modelErr) {
      console.warn(`Gemini validity judge (${model}) failed:`, modelErr.message);
    }
  }

  return null;
};

/**
 * STAGE 2 AI CALL: Dedicated Gemini Answer Quality Scorer
 * ONLY executed if Stage 1 validity is VALID or PARTIAL.
 * Evaluates technical correctness, completeness, depth, and clarity.
 */
export const callGeminiQualityScorer = async (
  questionText,
  studentAnswer,
  role = 'Data Analyst',
  skill = 'SQL',
  expectedRubric = ''
) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const models = [
    process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'gemini-pro',
  ];

  const prompt = `You are DishaSetu AI's Stage 2 Technical Answer Quality Scorer.
This response has ALREADY been verified by Stage 1 as a genuine answer attempt.
Now evaluate the technical quality, correctness, depth, and clarity.

TARGET ROLE: ${role}
SKILL BEING EVALUATED: ${skill}
INTERVIEW QUESTION: "${questionText}"
EXPECTED CONCEPTS / RUBRIC: "${expectedRubric || 'Accurate concept definitions, practical mechanisms, and trade-offs.'}"

CANDIDATE ACTUAL ANSWER:
"""${studentAnswer}"""

SCORING CRITERIA (0 - 100 each):
- relevance (25% weight): How directly and accurately does this answer address the question?
- technicalAccuracy (30% weight): Are technical claims, syntax, mechanisms, and facts correct?
- completeness (20% weight): Did the candidate cover the major parts of the rubric?
- depth (15% weight): Does the answer demonstrate deep understanding vs superficial buzzwords?
- communicationClarity (10% weight): Is the technical explanation structured and easy to follow?

Return STRICT JSON matching this schema:
{
  "relevance": 0-100,
  "technicalAccuracy": 0-100,
  "completeness": 0-100,
  "depth": 0-100,
  "communicationClarity": 0-100,
  "skillEvidence": "strong" | "moderate" | "insufficient",
  "feedback": "Concise 1-2 sentence constructive feedback.",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "howToImprove": ["..."],
  "betterApproach": "..."
}`;

  for (const model of models) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          const parsed = JSON.parse(candidateText);
          if (parsed) {
            const relevance = Math.min(100, Math.max(0, typeof parsed.relevance === 'number' ? parsed.relevance : 0));
            const technicalAccuracy = Math.min(100, Math.max(0, typeof parsed.technicalAccuracy === 'number' ? parsed.technicalAccuracy : 0));
            const completeness = Math.min(100, Math.max(0, typeof parsed.completeness === 'number' ? parsed.completeness : 0));
            const depth = Math.min(100, Math.max(0, typeof parsed.depth === 'number' ? parsed.depth : technicalAccuracy));
            const communicationClarity = Math.min(100, Math.max(0, typeof parsed.communicationClarity === 'number' ? parsed.communicationClarity : 0));

            return {
              relevance,
              technicalAccuracy,
              completeness,
              depth,
              communicationClarity,
              feedback: parsed.feedback || `Evaluated for ${skill} technical accuracy.`,
              strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 2) : [],
              weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 2) : [],
              howToImprove: Array.isArray(parsed.howToImprove) && parsed.howToImprove.length > 0 ? parsed.howToImprove.slice(0, 2) : [
                `Review ${skill} core mechanics: ${expectedRubric.slice(0, 100)}...`,
                'Ground theoretical points with concrete production examples.',
              ],
              betterApproach: parsed.betterApproach || expectedRubric || 'Provide definitions and explain how it operates in real-world systems.',
            };
          }
        }
      }
    } catch (modelErr) {
      console.warn(`Gemini quality scorer (${model}) failed:`, modelErr.message);
    }
  }

  return null;
};

/**
 * Deterministic Semantic Quality Scorer (Offline fallback when Gemini is unavailable)
 * Evaluates semantic concept overlap against EXPECTED RUBRIC (not question text).
 */
export const evaluateSemantically = (questionText, studentAnswer, role, skill, expectedRubric) => {
  const cleanAnswer = studentAnswer.trim();
  const lowerAnswer = cleanAnswer.toLowerCase();

  const stopWords = new Set([
    'what', 'explain', 'difference', 'between', 'with', 'from', 'this', 'that', 'they',
    'does', 'your', 'about', 'when', 'which', 'where', 'have', 'been', 'should', 'would',
    'could', 'into', 'some', 'more', 'also', 'such', 'like', 'than', 'them', 'these', 'those'
  ]);

  // Tokenize the expected rubric (semantic concepts)
  const rawRubricTokens = (expectedRubric || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !stopWords.has(w));
  const uniqueRubricTokens = Array.from(new Set(rawRubricTokens));

  const matchedTokens = uniqueRubricTokens.filter((token) => {
    const stem = token.length > 5 ? token.slice(0, 5) : token;
    return lowerAnswer.includes(token) || lowerAnswer.includes(stem);
  });
  const matchRatio = uniqueRubricTokens.length > 0 ? matchedTokens.length / uniqueRubricTokens.length : 0;

  const explanatoryTokens = [
    'is', 'are', 'was', 'were', 'returns', 'preserves', 'calculates', 'allows', 'without',
    'because', 'when', 'which', 'that', 'where', 'while', 'than', 'perform', 'calculate',
    'spills', 'used', 'uses', 'using', 'identify', 'identifying', 'handle', 'handling',
    'dropping', 'imputing', 'impute', 'converting', 'convert', 'measure', 'measures',
    'structure', 'structuring', 'filter', 'filters', 'filtering', 'aggregate', 'aggregates',
    'aggregation', 'sensitive', 'robust', 'instead', 'difference', 'lookup', 'lookups',
    'searches', 'with', 'by', 'for', 'from', 'into', 'then', 'also'
  ];
  const hasExplanatoryGrammar = explanatoryTokens.some((t) => lowerAnswer.includes(t));

  let relevance = 0;
  let technicalAccuracy = 0;
  let completeness = 0;
  let depth = 0;
  let communicationClarity = 0;

  if (matchRatio >= 0.28 && hasExplanatoryGrammar) {
    // High-quality comprehensive answer
    relevance = 90;
    technicalAccuracy = Math.min(95, 75 + Math.round(matchRatio * 20));
    completeness = Math.min(90, 70 + Math.round(matchRatio * 20));
    depth = 85;
    communicationClarity = 80;
  } else if (matchRatio >= 0.16 && hasExplanatoryGrammar) {
    // Concise but correct answer
    relevance = 80;
    technicalAccuracy = 75;
    completeness = 65;
    depth = 60;
    communicationClarity = 75;
  } else if (matchRatio >= 0.08 && hasExplanatoryGrammar) {
    // Partial answer
    relevance = 60;
    technicalAccuracy = 50;
    completeness = 45;
    depth = 40;
    communicationClarity = 60;
  } else {
    relevance = 30;
    technicalAccuracy = 20;
    completeness = 20;
    depth = 15;
    communicationClarity = 40;
  }

  return {
    relevance,
    technicalAccuracy,
    completeness,
    depth,
    communicationClarity,
    feedback: technicalAccuracy >= 70
      ? `Accurate explanation demonstrating clear understanding of ${skill}.`
      : `Partially addressed ${skill} principles, but needs more technical depth.`,
    strengths: technicalAccuracy >= 60 ? [`Demonstrated understanding of ${skill} concepts.`] : [],
    weaknesses: technicalAccuracy < 60 ? [`Lacks technical depth for ${skill}.`] : [],
    howToImprove: [
      `Review ${skill} core mechanics: ${expectedRubric.slice(0, 100)}...`,
      'Ground theoretical points with concrete production examples.',
    ],
    betterApproach: expectedRubric || 'Provide definitions and explain how it operates in real-world systems.',
  };
};

/**
 * Main Evaluation Orchestrator:
 * Executes Two-Stage Evaluation Pipeline:
 * STAGE 1: Answer Validity Judge (AI + Deterministic Gate)
 * If INSUFFICIENT -> Stage 2 is NEVER called; immediately returns 0/100, incorrect, insufficient evidence.
 * If VALID/PARTIAL -> STAGE 2: Answer Quality Scorer computes weighted score and skill evidence.
 */
export const evaluateStudentAnswer = async (
  questionText,
  studentAnswer,
  role = 'Data Analyst',
  type = 'Technical',
  difficulty = 'Medium'
) => {
  if (!studentAnswer || !studentAnswer.trim()) {
    throw new Error('Please provide an answer to evaluate.');
  }

  const cleanAnswer = studentAnswer.trim();

  // Find matching question rubric from DB or curated taxonomy
  let matchedQ = null;
  try {
    matchedQ = await InterviewQuestion.findOne({ questionText: questionText.trim(), isActive: true });
  } catch (err) {
    // ignore
  }

  if (!matchedQ) {
    const rolePool = ROLE_SKILL_QUESTIONS[role] || ROLE_SKILL_QUESTIONS['Data Analyst'] || [];
    matchedQ = rolePool.find((q) => q.text.trim().toLowerCase() === questionText.trim().toLowerCase());
  }

  const skill = normalizeSkillName(matchedQ?.skill) || 'Technical';
  const expectedRubric = matchedQ?.expectedRubric || `Accurate technical explanation for ${questionText}`;

  // =========================================================================
  // STAGE 1: ANSWER VALIDITY JUDGE
  // =========================================================================
  
  // 1. Run deterministic / algorithmic heuristic validity check first
  const deterministicValidity = determineAnswerValidity(cleanAnswer, questionText, expectedRubric);

  let validityResult = deterministicValidity;

  // If deterministic check deemed it insufficient (e.g. echo copy + agreement, gibberish, "i don't know"),
  // we do not need to call AI validity judge.
  // Otherwise, if Gemini is available, verify with Gemini Validity Judge
  if (deterministicValidity.answerStatus !== 'INSUFFICIENT') {
    const aiValidity = await callGeminiValidityJudge(questionText, cleanAnswer, role, skill);
    if (aiValidity) {
      validityResult = {
        isMeaningfulAnswer: aiValidity.isMeaningfulAnswer,
        isQuestionRestatement: aiValidity.isQuestionRestatement,
        isOffTopic: aiValidity.isOffTopic,
        isExplicitUnknown: aiValidity.isExplicitUnknown,
        isKeywordSpam: aiValidity.isKeywordSpam,
        answerStatus: aiValidity.validity,
        reason: aiValidity.reason || deterministicValidity.reason,
      };
    }
  }

  // =========================================================================
  // HARD BACKEND OVERRIDE FOR INSUFFICIENT ANSWERS
  // Stage 2 MUST NEVER run for INSUFFICIENT answers!
  // =========================================================================
  if (validityResult.answerStatus === 'INSUFFICIENT' || !validityResult.isMeaningfulAnswer) {
    return {
      answerStatus: 'INSUFFICIENT',
      isMeaningfulAnswer: false,
      isQuestionRestatement: validityResult.isQuestionRestatement || false,
      validityReason: validityResult.reason || 'The response does not provide a meaningful answer to the interview question.',
      score: 0,
      verdict: 'incorrect',
      skillEvidence: 'insufficient',
      feedback: validityResult.reason || 'The response does not provide a meaningful answer to the interview question.',
      strengths: [],
      whatWentWell: [],
      weaknesses: ['The response does not meaningfully address the question.'],
      howToImprove: [
        `Directly answer the question using technical principles of ${skill}.`,
        'Explain the core concept definitions and give practical use cases.',
      ],
      betterApproach: expectedRubric || 'State the core concept definition, explain how it works under the hood, and give one practical example.',
      scores: {
        technicalAccuracy: 0,
        completeness: 0,
        clarity: 0,
        communicationClarity: 0,
        relevance: 0,
        depth: 0,
        correctness: 0,
        overall: 0,
      },
    };
  }

  // =========================================================================
  // STAGE 2: ANSWER QUALITY SCORER
  // (Only executed for VALID or PARTIAL answers)
  // =========================================================================
  let qualityResult = await callGeminiQualityScorer(
    questionText,
    cleanAnswer,
    role,
    skill,
    expectedRubric
  );

  if (!qualityResult) {
    // Fallback to deterministic semantic quality scorer
    qualityResult = evaluateSemantically(questionText, cleanAnswer, role, skill, expectedRubric);
  }

  // Calculate final score using the strict weighted formula:
  // Relevance (25%) + Technical Accuracy (30%) + Completeness (20%) + Depth (15%) + Clarity (10%)
  const relevance = Math.min(100, Math.max(0, qualityResult.relevance || 0));
  const technicalAccuracy = Math.min(100, Math.max(0, qualityResult.technicalAccuracy || 0));
  const completeness = Math.min(100, Math.max(0, qualityResult.completeness || 0));
  const depth = Math.min(100, Math.max(0, qualityResult.depth || technicalAccuracy));
  const communicationClarity = Math.min(100, Math.max(0, qualityResult.communicationClarity || 0));

  let overall = Math.round(
    relevance * 0.25 +
    technicalAccuracy * 0.30 +
    completeness * 0.20 +
    depth * 0.15 +
    communicationClarity * 0.10
  );

  // Backend Hard Override Rule: If relevance < 25 or technicalAccuracy < 25, score MUST be 0
  if (relevance < 25 || technicalAccuracy < 25) {
    overall = 0;
  }

  const verdict = overall >= 85 ? 'excellent' : overall >= 70 ? 'good' : overall >= 50 ? 'partial' : overall > 0 ? 'needs_improvement' : 'incorrect';
  const skillEvidence = overall >= 75 && relevance >= 70 ? 'strong' : overall >= 60 && relevance >= 50 ? 'moderate' : 'insufficient';
  const strengths = overall >= 60 && Array.isArray(qualityResult.strengths) ? qualityResult.strengths.slice(0, 2) : [];
  const weaknesses = overall < 70 && Array.isArray(qualityResult.weaknesses) && qualityResult.weaknesses.length > 0
    ? qualityResult.weaknesses.slice(0, 2)
    : overall < 70
    ? [`Could provide deeper technical detail and production use cases for ${skill}.`]
    : [];

  return {
    answerStatus: validityResult.answerStatus,
    isMeaningfulAnswer: true,
    isQuestionRestatement: false,
    validityReason: validityResult.reason || '',
    score: overall,
    verdict,
    skillEvidence,
    feedback: qualityResult.feedback || (overall >= 70 ? `Accurate explanation demonstrating clear understanding of ${skill}.` : `Evaluated for ${skill} technical accuracy.`),
    strengths,
    whatWentWell: strengths,
    weaknesses,
    howToImprove: Array.isArray(qualityResult.howToImprove) && qualityResult.howToImprove.length > 0 ? qualityResult.howToImprove.slice(0, 2) : [
      `Review ${skill} core mechanics: ${expectedRubric.slice(0, 100)}...`,
      'Ground theoretical points with concrete production examples.',
    ],
    betterApproach: qualityResult.betterApproach || expectedRubric || 'Provide definitions and explain how it operates in real-world systems.',
    scores: {
      technicalAccuracy,
      completeness,
      clarity: communicationClarity,
      communicationClarity,
      relevance,
      depth,
      correctness: technicalAccuracy,
      overall,
    },
  };
};


