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

/**
 * Generate 5 Tailored Interview Questions
 */
export const generateQuestions = async (
  role = 'Full Stack Developer',
  type = 'Technical',
  difficulty = 'Medium',
  skills = [],
  readySkills = []
) => {
  const targetRole = ROLE_SKILL_QUESTIONS[role] ? role : 'Full Stack Developer';
  const rolePool = ROLE_SKILL_QUESTIONS[targetRole] || ROLE_SKILL_QUESTIONS['Full Stack Developer'];

  const normalizedReady = (readySkills || []).map((s) => normalizeSkillName(s).toLowerCase());
  let selected = [];

  if (type === 'HR') {
    selected = HR_QUESTIONS.slice(0, 5);
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
 * STAGE 1: Deterministic Answer Validity Gate
 * Determines whether candidate's response contains meaningful information attempting to answer THIS question.
 * Returns: { answerStatus: 'VALID' | 'PARTIAL' | 'INSUFFICIENT', reason: string }
 */
export const determineAnswerValidity = (text, questionText = '', expectedRubric = '') => {
  if (!text || typeof text !== 'string') {
    return { answerStatus: 'INSUFFICIENT', reason: 'The response is empty.' };
  }

  const clean = text.trim();
  const lower = clean.toLowerCase();
  const words = clean.split(/\s+/).filter(Boolean);

  // 1. Empty or extremely short nonsense ("abc", "xyz", "..")
  if (clean.length < 3 || words.length < 1) {
    return { answerStatus: 'INSUFFICIENT', reason: 'The response does not contain substantive content.' };
  }

  const pureGibberish = new Set([
    'abc', 'xyz', 'asdf', 'qwerty', 'ok', 'hello', 'hi', 'hey', 'test', 'testing',
    'idk', 'pass', 'skip', 'na', 'n/a', 'none', 'nothing', 'bla', 'blabla', 'blah',
    'yes', 'no', 'dunno', 'nope', 'nah', 'lol', 'good', 'nice', 'cool',
  ]);
  if (pureGibberish.has(lower) || /^(.)\1{3,}$/.test(lower)) {
    return { answerStatus: 'INSUFFICIENT', reason: 'The response contains meaningless or single-character gibberish.' };
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

  // Extract key concept tokens from question & expected rubric
  const combinedText = `${questionText} ${expectedRubric || ''}`;
  const stopWords = new Set([
    'what', 'explain', 'difference', 'between', 'with', 'from', 'this', 'that', 'they',
    'does', 'your', 'about', 'when', 'which', 'where', 'have', 'been', 'should', 'would',
    'could', 'into', 'some', 'more', 'also', 'such', 'like', 'than', 'them', 'these', 'those'
  ]);
  const rawTokens = combinedText
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !stopWords.has(w));
  const uniqueTokens = Array.from(new Set(rawTokens));

  const matchedTokens = uniqueTokens.filter((token) => {
    const stem = token.length > 5 ? token.slice(0, 5) : token;
    return lower.includes(token) || lower.includes(stem);
  });
  const matchRatio = uniqueTokens.length > 0 ? matchedTokens.length / uniqueTokens.length : 0;

  // If candidate stated they don't know or wrote padding, and matched <= 1 concept token
  if ((hasUnknownStatement || hasFiller) && matchedTokens.length <= 1) {
    return {
      answerStatus: 'INSUFFICIENT',
      reason: hasUnknownStatement
        ? 'The candidate explicitly stated a lack of knowledge with no valid technical explanation.'
        : 'The response contains filler phrases / intentional padding with no technical explanation.',
    };
  }

  // 4. Personal introduction without technical relevance (e.g. "My name is Rahul and I like cricket")
  const isPersonalIntro = /^(hello|hi|hey)?\s*(my name is|i am|i'm)\s+[a-z0-9_ -]+\s+and\s+/i.test(lower);
  if (isPersonalIntro && matchedTokens.length === 0) {
    return {
      answerStatus: 'INSUFFICIENT',
      reason: 'The response is an off-topic personal introduction unrelated to the technical question.',
    };
  }

  // 5. Keyword spam without explanatory sentence structure
  const explanatoryTokens = [
    'is', 'are', 'was', 'were', 'returns', 'preserves', 'calculates', 'allows', 'without',
    'because', 'when', 'which', 'that', 'where', 'while', 'than', 'perform', 'calculate',
    'spills', 'used', 'uses', 'using', 'identify', 'identifying', 'handle', 'handling',
    'dropping', 'imputing', 'impute', 'converting', 'convert', 'measure', 'measures',
    'structure', 'structuring', 'filter', 'filters', 'filtering', 'aggregate', 'aggregates',
    'aggregation', 'sensitive', 'robust', 'instead', 'difference', 'lookup', 'lookups',
    'searches', 'with', 'by', 'for', 'from', 'into', 'then', 'also'
  ];
  const hasExplanatoryStructure = explanatoryTokens.some((t) => lower.includes(t));

  if (words.length >= 4 && words.length <= 25 && !hasExplanatoryStructure) {
    if (matchRatio >= 0.5) {
      return {
        answerStatus: 'INSUFFICIENT',
        reason: 'The response is a list of keywords without conceptual explanation or reasoning.',
      };
    }
  }

  // 6. Zero concept overlap with the question domain
  if (matchRatio === 0 && words.length >= 4) {
    return {
      answerStatus: 'INSUFFICIENT',
      reason: 'The response does not address the interview question.',
    };
  }

  // Passed Stage 1: VALID or PARTIAL
  if (matchRatio >= 0.25 && hasExplanatoryStructure) {
    return { answerStatus: 'VALID' };
  }

  return { answerStatus: 'PARTIAL' };
};

/**
 * Call Google Gemini Generative AI API for Strict Technical Answer Evaluation
 */
export const callGeminiAnswerEvaluation = async (
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

  const prompt = `You are DishaSetu AI's Strict Senior Technical Interview Evaluator.
Evaluate the candidate's actual answer for the following technical question.

TARGET ROLE: ${role}
SKILL BEING EVALUATED: ${skill}
INTERVIEW QUESTION: "${questionText}"
EXPECTED CONCEPTS / RUBRIC: "${expectedRubric || 'Technically accurate concept definition, practical mechanisms, and trade-offs.'}"

CANDIDATE ACTUAL ANSWER:
"""${studentAnswer}"""

MANDATORY EVALUATION RULES (APPLY IN STRICT ORDER):

STAGE 1: ANSWER VALIDITY GATE (CRITICAL)
- Determine answerStatus: "VALID" | "PARTIAL" | "INSUFFICIENT".
- If the candidate writes:
  * "abc", gibberish, empty, or single-character spam
  * "I don't know", "no idea", "not know the answer", or equivalents
  * Off-topic personal introductions (e.g. talking about college/hobbies/unrelated tech)
  * Random filler, intentional padding, or repeated words
  * Keyword spam without explanatory structure
  THEN IMMEDIATELY RETURN:
  * answerStatus: "INSUFFICIENT"
  * score: 0
  * relevance: 0
  * technicalAccuracy: 0
  * completeness: 0
  * depth: 0
  * communicationClarity: 0
  * verdict: "incorrect"
  * skillEvidence: "insufficient"
  * strengths: [] (STRICTLY EMPTY ARRAY - NEVER invent fake strengths for invalid answers!)
  * weaknesses: ["The response does not address the interview question."]

STAGE 2: QUALITY SCORING FOR VALID/PARTIAL ANSWERS ONLY
- Formula:
  Score = (relevance * 0.25 + technicalAccuracy * 0.30 + completeness * 0.20 + depth * 0.15 + communicationClarity * 0.10)
- Answer length or word count MUST NEVER increase scores.
- "communicationClarity": Measures technical explanation clarity, NOT generic English readability.

Return JSON ONLY matching this schema:
{
  "answerStatus": "VALID | PARTIAL | INSUFFICIENT",
  "score": 0,
  "verdict": "excellent | good | partial | needs_improvement | incorrect",
  "relevance": 0,
  "technicalAccuracy": 0,
  "completeness": 0,
  "depth": 0,
  "communicationClarity": 0,
  "feedback": "Honest 1-2 sentence evaluation.",
  "strengths": [],
  "weaknesses": [],
  "howToImprove": ["..."],
  "betterApproach": "...",
  "skillEvidence": "strong | moderate | insufficient"
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
            const answerStatus = parsed.answerStatus === 'VALID' || parsed.answerStatus === 'PARTIAL' ? parsed.answerStatus : 'INSUFFICIENT';

            if (answerStatus === 'INSUFFICIENT') {
              return {
                answerStatus: 'INSUFFICIENT',
                score: 0,
                verdict: 'incorrect',
                skillEvidence: 'insufficient',
                feedback: parsed.feedback || 'The response does not provide a meaningful answer to the question.',
                strengths: [],
                whatWentWell: [],
                weaknesses: ['The response does not address the interview question.'],
                howToImprove: Array.isArray(parsed.howToImprove) && parsed.howToImprove.length > 0 ? parsed.howToImprove.slice(0, 2) : [
                  `Directly answer the question using technical principles of ${skill}.`,
                  'Explain the core concept definitions and give practical use cases.',
                ],
                betterApproach: parsed.betterApproach || expectedRubric || 'Define the key concepts and provide a concrete production example.',
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

            const relevance = Math.min(100, Math.max(0, typeof parsed.relevance === 'number' ? parsed.relevance : 0));
            const technicalAccuracy = Math.min(100, Math.max(0, typeof parsed.technicalAccuracy === 'number' ? parsed.technicalAccuracy : 0));
            const completeness = Math.min(100, Math.max(0, typeof parsed.completeness === 'number' ? parsed.completeness : 0));
            const depth = Math.min(100, Math.max(0, typeof parsed.depth === 'number' ? parsed.depth : technicalAccuracy));
            const communicationClarity = Math.min(100, Math.max(0, typeof parsed.communicationClarity === 'number' ? parsed.communicationClarity : 0));

            // Backend Scoring Formula
            let overall = Math.round(
              relevance * 0.25 +
              technicalAccuracy * 0.30 +
              completeness * 0.20 +
              depth * 0.15 +
              communicationClarity * 0.10
            );

            // Backend Override Rule: If relevance is very low or technical accuracy is very low, score must be 0
            if (relevance < 20 || technicalAccuracy < 20) {
              overall = 0;
            }

            const verdict = overall >= 85 ? 'excellent' : overall >= 70 ? 'good' : overall >= 50 ? 'partial' : overall > 0 ? 'needs_improvement' : 'incorrect';
            const skillEvidence = overall >= 75 && relevance >= 70 ? 'strong' : overall >= 60 && relevance >= 50 ? 'moderate' : 'insufficient';
            const strengths = overall >= 60 && Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 2) : [];

            return {
              answerStatus,
              score: overall,
              verdict,
              skillEvidence,
              feedback: parsed.feedback || (overall >= 70 ? `Accurate explanation demonstrating clear understanding of ${skill}.` : `Evaluated for ${skill} technical accuracy.`),
              strengths,
              whatWentWell: strengths,
              weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 2) : [],
              howToImprove: Array.isArray(parsed.howToImprove) && parsed.howToImprove.length > 0 ? parsed.howToImprove.slice(0, 2) : [
                `Review ${skill} core mechanics: ${expectedRubric.slice(0, 100)}...`,
                'Ground theoretical points with concrete production examples.',
              ],
              betterApproach: parsed.betterApproach || expectedRubric || 'Provide definitions and explain how it operates in real-world systems.',
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
          }
        }
      }
    } catch (modelErr) {
      console.warn(`Gemini (${model}) call failed, trying next model:`, modelErr.message);
    }
  }

  return null;
};

/**
 * Strict Semantic Evaluator (Deterministic offline evaluator based on actual concept understanding)
 */
export const evaluateSemantically = (questionText, studentAnswer, role, skill, expectedRubric) => {
  const cleanAnswer = studentAnswer.trim();
  const lowerAnswer = cleanAnswer.toLowerCase();

  // STAGE 1: Validity Gate
  const validity = determineAnswerValidity(cleanAnswer, questionText, expectedRubric);
  if (validity.answerStatus === 'INSUFFICIENT') {
    return {
      answerStatus: 'INSUFFICIENT',
      score: 0,
      verdict: 'incorrect',
      skillEvidence: 'insufficient',
      feedback: validity.reason || 'The response does not provide a meaningful answer to the question.',
      strengths: [],
      whatWentWell: [],
      weaknesses: ['The response does not address the interview question.'],
      howToImprove: [
        `Directly answer the question using technical definitions and principles of ${skill}.`,
        'Explain the core concept definitions and give practical use cases.',
      ],
      betterApproach: expectedRubric || 'Define the key concepts and provide a concrete production example.',
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

  // STAGE 2: Quality Evaluation
  const combinedText = `${questionText} ${expectedRubric || ''}`;
  const stopWords = new Set([
    'what', 'explain', 'difference', 'between', 'with', 'from', 'this', 'that', 'they',
    'does', 'your', 'about', 'when', 'which', 'where', 'have', 'been', 'should', 'would',
    'could', 'into', 'some', 'more', 'also', 'such', 'like', 'than', 'them', 'these', 'those'
  ]);

  const rawTokens = combinedText
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !stopWords.has(w));
  const uniqueTokens = Array.from(new Set(rawTokens));

  const matchedTokens = uniqueTokens.filter((token) => {
    const stem = token.length > 5 ? token.slice(0, 5) : token;
    return lowerAnswer.includes(token) || lowerAnswer.includes(stem);
  });
  const matchRatio = uniqueTokens.length > 0 ? matchedTokens.length / uniqueTokens.length : 0;

  // Detect fact inversions
  const hasInversion =
    (lowerAnswer.includes('inner join') && lowerAnswer.includes('all rows from') && !lowerAnswer.includes('left join returns all')) ||
    (lowerAnswer.includes('mean is not sensitive') || lowerAnswer.includes('median is sensitive'));

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

  if (hasInversion) {
    relevance = 50;
    technicalAccuracy = 20;
    completeness = 25;
    depth = 20;
    communicationClarity = 40;
  } else if (matchRatio >= 0.28 && hasExplanatoryGrammar) {
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
    relevance = 0;
    technicalAccuracy = 0;
    completeness = 0;
    depth = 0;
    communicationClarity = 0;
  }

  // Final Quality Score Formula
  const overall = Math.round(
    relevance * 0.25 +
    technicalAccuracy * 0.30 +
    completeness * 0.20 +
    depth * 0.15 +
    communicationClarity * 0.10
  );

  const verdict = overall >= 85 ? 'excellent' : overall >= 70 ? 'good' : overall >= 50 ? 'partial' : overall > 0 ? 'needs_improvement' : 'incorrect';
  const skillEvidence = overall >= 75 && relevance >= 70 ? 'strong' : overall >= 60 && relevance >= 50 ? 'moderate' : 'insufficient';
  const strengths = overall >= 60 ? [`Demonstrated accurate understanding of ${skill} concepts.`] : [];

  return {
    answerStatus: validity.answerStatus,
    score: overall,
    verdict,
    skillEvidence,
    feedback:
      overall >= 70
        ? `Accurate explanation demonstrating clear understanding of ${skill}.`
        : overall >= 50
        ? `Partially correct explanation, but lacks key technical details for ${skill}.`
        : `The response does not provide a meaningful answer to the question.`,
    strengths,
    whatWentWell: strengths,
    weaknesses: overall < 60 ? [`Lacks technical depth for ${skill}.`] : [],
    howToImprove: [
      `Review ${skill} core mechanics: ${expectedRubric.slice(0, 100)}...`,
      'Ground theoretical points with concrete production examples.',
    ],
    betterApproach: expectedRubric || 'Provide definitions and explain how it operates in real-world systems.',
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

/**
 * Main Evaluation Orchestrator: Validates -> Calls Gemini -> Falls back to Strict Semantic Evaluator
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

  // Find matching question rubric from curated banks
  const rolePool = ROLE_SKILL_QUESTIONS[role] || ROLE_SKILL_QUESTIONS['Data Analyst'] || [];
  const matchedQ = rolePool.find((q) => q.text.trim().toLowerCase() === questionText.trim().toLowerCase());
  const skill = normalizeSkillName(matchedQ?.skill) || 'Technical';
  const expectedRubric = matchedQ?.expectedRubric || `Accurate technical explanation for ${questionText}`;

  // STAGE 1: Deterministic Validity Gate
  const validity = determineAnswerValidity(cleanAnswer, questionText, expectedRubric);
  if (validity.answerStatus === 'INSUFFICIENT') {
    return {
      answerStatus: 'INSUFFICIENT',
      score: 0,
      verdict: 'incorrect',
      skillEvidence: 'insufficient',
      feedback: validity.reason || 'The response does not provide a meaningful answer to the question.',
      strengths: [],
      whatWentWell: [],
      weaknesses: ['The response does not address the interview question.'],
      howToImprove: [
        `Directly answer the question using technical definitions and principles of ${skill}.`,
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

  // STAGE 2: Call Google Gemini with strict prompt
  const geminiEval = await callGeminiAnswerEvaluation(
    questionText,
    cleanAnswer,
    role,
    skill,
    expectedRubric
  );

  if (geminiEval) {
    return geminiEval;
  }

  // Fallback to strict semantic evaluator
  return evaluateSemantically(questionText, cleanAnswer, role, skill, expectedRubric);
};

