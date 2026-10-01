/**
 * Comprehensive Mock Interview AI Evaluator Regression Test Suite
 * Validates all required benchmark scenarios, partial credit cases, and adversarial anti-manipulation tests.
 */

import { evaluateStudentAnswer } from '../services/interviewService.js';
import { evaluateLocalFallback } from '../services/interviewEvaluator.js';

const regressionTestCases = [
  // -------------------------------------------------------------------------
  // MANDATORY SCREENSHOT EXACT BUG TEST CASES (Docker)
  // -------------------------------------------------------------------------
  {
    id: 'CRITICAL BUG: Docker Question Copied + Fluff (The Exact User Failure Case)',
    question: 'Explain the difference between a Docker image and a container, and how multi-stage Docker builds reduce production image size.',
    answer: 'Explain the difference between a Docker image and a container, and how multi-stage Docker builds reduce production image size yes right correct nice good amazing it is very easy to use',
    expectedStatus: 'INSUFFICIENT',
    maxScore: 5,
    expectedVerdict: 'incorrect',
    expectedCopied: true,
    mustNotContainFeedback: ['demonstrating understanding of docker', 'demonstrated understanding', 'good answer'],
    rationale: 'Must detect question copying with appended fluff and give near zero (<= 5) with zero positive feedback.',
  },
  {
    id: 'CRITICAL TEST: Docker Question Genuine Substantive Answer',
    question: 'Explain the difference between a Docker image and a container, and how multi-stage Docker builds reduce production image size.',
    answer: 'A Docker image is a read-only template containing the application and its dependencies. A container is a running instance created from an image. Multi-stage Docker builds allow build dependencies to remain in an intermediate stage while only the required production artifacts are copied into the final image, reducing its size.',
    expectedStatus: 'VALID',
    minScore: 80,
    expectedVerdict: 'excellent',
    expectedCopied: false,
    rationale: 'Genuine answer covering definitions, distinctions, and multi-stage builds must receive high score.',
  },

  // -------------------------------------------------------------------------
  // CORE SCENARIOS
  // -------------------------------------------------------------------------
  {
    id: 'Test 1: Generic words on technical question',
    question: 'Explain polymorphism in Java with an example.',
    answer: 'good nice',
    expectedStatus: 'INSUFFICIENT',
    maxScore: 5,
    expectedVerdict: 'incorrect',
    rationale: 'Generic filler words must be rejected with very low/zero score.',
  },
  {
    id: 'Test 2: Genuine substantive technical answer',
    question: 'Explain polymorphism in Java with an example.',
    answer: 'Polymorphism allows the same interface to represent different implementations. In Java, method overriding demonstrates runtime polymorphism where a parent reference points to a child instance.',
    expectedStatus: 'VALID',
    minScore: 70,
    rationale: 'Substantive explanation answering definition, mechanism, and example must receive a strong score.',
  },
  {
    id: 'Test 3: Question copied / parroted',
    question: 'What is REST API?',
    answer: 'What is REST API? REST API?',
    expectedStatus: 'INSUFFICIENT',
    maxScore: 5,
    expectedVerdict: 'incorrect',
    rationale: 'Repeating the question must not fool the evaluator into giving credit.',
  },
  {
    id: 'Test 4: Irrelevant answer',
    question: 'What is REST API?',
    answer: 'My favorite programming language is Java and I have solved many LeetCode problems.',
    expectedStatus: 'INSUFFICIENT',
    maxScore: 10,
    expectedVerdict: 'incorrect',
    rationale: 'Irrelevant off-topic text must receive very low relevance and overall score.',
  },
  {
    id: 'Test 5: Concise accurate technical answer',
    question: 'What is binary search?',
    answer: 'Binary search works on sorted data and repeatedly divides the search range in half, giving O(log n) time complexity.',
    expectedStatus: 'VALID',
    minScore: 80,
    rationale: 'Short but technically precise and comprehensive answer should score high.',
  },
  {
    id: 'Test 6: Partially correct / incomplete answer',
    question: 'Compare ArrayList and LinkedList.',
    answer: 'Both are collections.',
    expectedStatus: 'PARTIAL',
    minScore: 30,
    maxScore: 55,
    rationale: 'Partially true fact should receive partial credit without full score.',
  },
  {
    id: 'Test 7: Behavioral project challenge question',
    question: 'Tell me about a project challenge.',
    answer: 'In my project, I faced a MongoDB connection issue. I checked the environment variables, verified the connection string, and resolved the configuration error.',
    expectedStatus: 'VALID',
    minScore: 65,
    rationale: 'Valid behavioral answer with problem context, debugging action, and outcome.',
  },
  {
    id: 'Test 8: Coding question with generic text',
    question: 'Write Java code to reverse a string.',
    answer: 'good reverse string',
    expectedStatus: 'INSUFFICIENT',
    maxScore: 5,
    rationale: 'Coding question answered with fluff text without code implementation must be invalid.',
  },
  {
    id: 'Test 9: Yes/No question with bare answer',
    question: 'Is Java platform independent?',
    answer: 'Yes.',
    expectedStatus: 'PARTIAL',
    minScore: 30,
    maxScore: 55,
    rationale: 'Bare Yes answer is valid format but lacks bytecode/JVM explanation.',
  },
  {
    id: 'Test 10: Yes/No question with full technical justification',
    question: 'Is Java platform independent?',
    answer: 'Yes. Java source code is compiled into bytecode that runs on the JVM, allowing the same bytecode to run on different operating systems.',
    expectedStatus: 'VALID',
    minScore: 80,
    rationale: 'Affirmative stance + bytecode + JVM justification deserves high score.',
  },
  {
    id: 'Test 11: Encapsulation with fluff words',
    question: 'Explain encapsulation.',
    answer: 'Encapsulation is important and good in Java. It is useful and very good.',
    expectedStatus: 'INSUFFICIENT',
    maxScore: 5,
    rationale: 'Using words like important/good without explaining bundling/data hiding is fluff.',
  },
  {
    id: 'Test 12: Encapsulation with technical definition & mechanisms',
    question: 'Explain encapsulation.',
    answer: 'Encapsulation bundles data and methods inside a class and restricts direct access to internal state using access modifiers such as private.',
    expectedStatus: 'VALID',
    minScore: 80,
    rationale: 'Accurate technical definition covering data bundling and access control modifiers.',
  },
  {
    id: 'Test 13: Technically correct but answers a different question',
    question: 'Explain the Node.js Event Loop mechanism and how it achieves non-blocking asynchronous I/O with single-threaded execution.',
    answer: 'javascript is the scripting language which is used to write business logic and it is not used to build server and node.js is the run time environment which is used to javascript outside the terminal',
    expectedStatus: 'INSUFFICIENT',
    maxScore: 40,
    rationale: 'Answers what Node/JS are instead of explaining the event loop. Technically true statements but completely fails to answer the question asked.',
  },
  {
    id: 'Test 14: Empty/very short answer',
    question: 'Explain polymorphism in Java.',
    answer: 'It is',
    expectedStatus: 'INSUFFICIENT',
    maxScore: 15,
    rationale: 'Very short answer must be rejected.',
  },
  {
    id: 'Test 15: Gemini failure / API failure (Local Fallback)',
    question: 'Explain polymorphism in Java.',
    answer: 'Polymorphism allows the same interface to represent different implementations. In Java, method overriding demonstrates runtime polymorphism.',
    expectedStatus: 'INSUFFICIENT',
    maxScore: 30,
    rationale: 'Fallback evaluator cannot verify correctness semantically, so it must return a conservative INSUFFICIENT score.',
    useFallback: true,
  },

  // -------------------------------------------------------------------------
  // ADVERSARIAL & ANTI-MANIPULATION SCENARIOS
  // -------------------------------------------------------------------------
  {
    id: 'Adversarial 1: Looped word repetition (good good good)',
    question: 'Explain polymorphism in Java.',
    answer: 'good good good good good',
    expectedStatus: 'INSUFFICIENT',
    maxScore: 5,
    rationale: 'Word repetition spam must be caught and given 0-5.',
  },
  {
    id: 'Adversarial 2: Language name spam (Java Java Java)',
    question: 'Explain polymorphism in Java.',
    answer: 'Java Java Java Java Java',
    expectedStatus: 'INSUFFICIENT',
    maxScore: 5,
    rationale: 'Keyword spamming language names must be caught.',
  },
  {
    id: 'Adversarial 3: Concept name spam (polymorphism polymorphism)',
    question: 'Explain polymorphism in Java.',
    answer: 'polymorphism polymorphism polymorphism',
    expectedStatus: 'INSUFFICIENT',
    maxScore: 5,
    rationale: 'Repeated topic name without sentence structure must be rejected.',
  },
  {
    id: 'Adversarial 4: Circular fluff tautology',
    question: 'Explain polymorphism in Java.',
    answer: 'This is a very good and important concept because it is good.',
    expectedStatus: 'INSUFFICIENT',
    maxScore: 5,
    rationale: 'Grammatically formed circular fluff without technical concepts must be rejected.',
  },
  {
    id: 'Adversarial 5: Exact Question Copy',
    question: 'Explain polymorphism in Java with an example.',
    answer: 'Explain polymorphism in Java with an example.',
    expectedStatus: 'INSUFFICIENT',
    maxScore: 5,
    rationale: 'Verbatim question copy must receive 0-5 score.',
  },
  {
    id: 'Adversarial 6: Question Copy + Fluff Append',
    question: 'Explain polymorphism in Java with an example.',
    answer: 'Explain polymorphism in Java with an example. good nice excellent',
    expectedStatus: 'INSUFFICIENT',
    maxScore: 5,
    rationale: 'Question copy with appended praise words must be rejected.',
  },
  {
    id: 'Adversarial 7: Keyword Stuffing without Sentences',
    question: 'Explain binary search.',
    answer: 'Binary search algorithm array sorted searching binary search fast efficient O(log n) array binary tree searching algorithm good nice',
    expectedStatus: 'INSUFFICIENT',
    maxScore: 10,
    rationale: 'High keyword density without explanatory grammar/reasoning must be capped at <= 10.',
  },
  {
    id: 'Adversarial 8: Explicit "I do not know" Admission',
    question: 'Explain polymorphism in Java.',
    answer: "I don't know the answer.",
    expectedStatus: 'INSUFFICIENT',
    maxScore: 0,
    rationale: 'Honest lack of knowledge admission must receive score 0.',
  },
];

async function runRegressionSuite() {
  console.log('========================================================================');
  console.log('🚀 RUNNING DISHASETU AI MOCK INTERVIEW EVALUATOR REGRESSION TEST SUITE');
  console.log('========================================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < regressionTestCases.length; i++) {
    const tc = regressionTestCases[i];
    console.log(`[CASE ${i + 1}/${regressionTestCases.length}] ${tc.id}`);
    console.log(`  Question : "${tc.question}"`);
    console.log(`  Answer   : "${tc.answer}"`);

    try {
      let result;
      if (tc.useFallback) {
        result = evaluateLocalFallback(tc.question, tc.answer);
      } else {
        result = await evaluateStudentAnswer(
          tc.question,
          tc.answer,
          'Full Stack Developer',
          'Technical',
          'Medium'
        );
      }

      console.log(`  -> Status: ${result.answerStatus} | Score: ${result.score}/100 | Verdict: ${result.verdict}`);
      console.log(`  -> Evidence: ${result.skillEvidence} | Tech: ${result.scores.technicalAccuracy}% | Comp: ${result.scores.completeness}% | Rel: ${result.scores.relevance}%`);
      console.log(`  -> Feedback: "${result.feedback}"`);
      console.log(`  -> Strengths:`, result.strengths);
      console.log(`  -> Missing:`, result.whatIsMissing);

      let pass = true;
      const errors = [];

      if (tc.expectedStatus && result.answerStatus !== tc.expectedStatus) {
        pass = false;
        errors.push(`Expected answerStatus=${tc.expectedStatus}, got ${result.answerStatus}`);
      }

      if (tc.maxScore !== undefined && result.score > tc.maxScore) {
        pass = false;
        errors.push(`Score ${result.score} exceeded maximum allowed score ${tc.maxScore}`);
      }

      if (tc.minScore !== undefined && result.score < tc.minScore) {
        pass = false;
        errors.push(`Score ${result.score} fell below minimum required score ${tc.minScore}`);
      }

      if (tc.expectedVerdict && result.verdict !== tc.expectedVerdict) {
        pass = false;
        errors.push(`Expected verdict=${tc.expectedVerdict}, got ${result.verdict}`);
      }

      if (tc.mustNotContainFeedback) {
        const feedbackLower = (result.feedback || '').toLowerCase();
        for (const forbidden of tc.mustNotContainFeedback) {
          if (feedbackLower.includes(forbidden.toLowerCase())) {
            pass = false;
            errors.push(`Feedback hallucinated positive credit: "${forbidden}"`);
          }
        }
      }

      if (pass) {
        console.log(`  ✅ PASSED (${tc.rationale})\n`);
        passedCount++;
      } else {
        console.error(`  ❌ FAILED: ${errors.join(', ')} (${tc.rationale})\n`);
        failedCount++;
      }
    } catch (err) {
      console.error(`  💥 ERROR in ${tc.id}:`, err);
      failedCount++;
    }
  }

  console.log('========================================================================');
  console.log(`🎯 FINAL REGRESSION RESULTS: ${passedCount} PASSED, ${failedCount} FAILED (TOTAL ${regressionTestCases.length})`);
  console.log('========================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runRegressionSuite();
