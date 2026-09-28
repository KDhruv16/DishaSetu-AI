import { evaluateStudentAnswer } from '../services/interviewService.js';

async function runTests() {
  console.log('================================================================');
  console.log('RUNNING MANDATORY REAL-WORLD EVALUATION PIPELINE TESTS');
  console.log('================================================================\n');

  const testCases = [
    {
      id: 'TEST 1 (Gibberish)',
      question: 'Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN in SQL with practical use cases.',
      answer: 'abc',
      expectedStatus: 'INSUFFICIENT',
      expectedMaxScore: 0,
    },
    {
      id: 'TEST 2 (Explicit Unknown)',
      question: 'Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN in SQL with practical use cases.',
      answer: "I don't know the answer.",
      expectedStatus: 'INSUFFICIENT',
      expectedMaxScore: 0,
    },
    {
      id: 'TEST 3 (Question Restatement/Copy Only)',
      question: 'Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN in SQL with practical use cases.',
      answer: 'Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN in SQL with practical use cases.',
      expectedStatus: 'INSUFFICIENT',
      expectedMaxScore: 0,
    },
    {
      id: 'TEST 4 (Question Copy + Agreement)',
      question: 'Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN in SQL with practical use cases.',
      answer: 'Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN in SQL with practical use cases. Yes, I agree.',
      expectedStatus: 'INSUFFICIENT',
      expectedMaxScore: 0,
    },
    {
      id: 'EXACT SCREENSHOT SCENARIO (The 83% Proven Bug)',
      question: 'Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN in SQL with practical use cases.',
      answer: 'Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN in SQL with practical use cases yeah it is right i am agree with our point',
      expectedStatus: 'INSUFFICIENT',
      expectedMaxScore: 0,
    },
    {
      id: 'TEST 5 (Short Correct Technical Answer)',
      question: 'Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN in SQL with practical use cases.',
      answer: 'INNER JOIN returns matching rows from both tables, while LEFT JOIN returns all rows from the left table and matching rows from the right table.',
      expectedStatus: 'VALID',
      expectedMinScore: 60,
    },
    {
      id: 'TEST 6 (Keyword Spam)',
      question: 'Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN in SQL with practical use cases.',
      answer: 'INNER JOIN LEFT JOIN SQL TABLE DATABASE JOIN JOIN',
      expectedStatus: 'INSUFFICIENT',
      expectedMaxScore: 0,
    },
    {
      id: 'TEST 7 (Off-Topic Personal Introduction)',
      question: 'Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN in SQL with practical use cases.',
      answer: 'My name is Rahul and I am a B.Tech student.',
      expectedStatus: 'INSUFFICIENT',
      expectedMaxScore: 0,
    },
    {
      id: 'TEST 8 (Comprehensive Correct Answer with Examples)',
      question: 'Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN in SQL with practical use cases.',
      answer: 'INNER JOIN returns only records that have matching values in both tables. LEFT JOIN returns all records from the left table and matched records from the right table, inserting NULLs for missing right-side values. FULL OUTER JOIN returns all rows when there is a match in either table, combining both matched and unmatched records. In practice, an e-commerce platform uses INNER JOIN to find users who placed active orders, LEFT JOIN to audit all registered users whether or not they made a purchase, and FULL OUTER JOIN for reconciling disparate payment databases.',
      expectedStatus: 'VALID',
      expectedMinScore: 75,
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    console.log(`----------------------------------------------------------------`);
    console.log(`RUNNING: ${tc.id}`);
    console.log(`Question: "${tc.question}"`);
    console.log(`Answer: "${tc.answer}"`);

    try {
      const result = await evaluateStudentAnswer(
        tc.question,
        tc.answer,
        'Data Analyst',
        'Technical',
        'Medium'
      );

      console.log(`-> Result Status: ${result.answerStatus}`);
      console.log(`-> Result Score: ${result.score}`);
      console.log(`-> Verdict: ${result.verdict}`);
      console.log(`-> Skill Evidence: ${result.skillEvidence}`);
      console.log(`-> Feedback: ${result.feedback}`);
      console.log(`-> Scores:`, result.scores);

      let isSuccess = true;

      if (tc.expectedStatus === 'INSUFFICIENT') {
        if (result.answerStatus !== 'INSUFFICIENT' || result.score > 0 || result.skillEvidence !== 'insufficient') {
          isSuccess = false;
          console.error(`FAILED: Expected INSUFFICIENT with score 0, got status=${result.answerStatus}, score=${result.score}`);
        }
      } else {
        if (result.answerStatus === 'INSUFFICIENT' || (tc.expectedMinScore && result.score < tc.expectedMinScore)) {
          isSuccess = false;
          console.error(`FAILED: Expected VALID/PARTIAL with score >= ${tc.expectedMinScore}, got status=${result.answerStatus}, score=${result.score}`);
        }
      }

      if (isSuccess) {
        console.log(`PASSED ${tc.id}`);
        passed++;
      } else {
        failed++;
      }
    } catch (err) {
      console.error(`ERROR running ${tc.id}:`, err);
      failed++;
    }
    console.log(`\n`);
  }

  console.log('================================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL ${testCases.length})`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
