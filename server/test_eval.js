import('./src/services/interviewEvaluator.js').then(async ({ evaluateInterviewAnswer }) => {
  const q = 'Explain the difference between a Docker image and a container, and how multi-stage Docker builds reduce production image size.';
  const goodA = 'A Docker image is a read-only template containing the application and its dependencies. A container is a running instance created from an image. Multi-stage Docker builds allow build dependencies to remain in an intermediate stage while only the required production artifacts are copied into the final image, reducing its size.';
  const badA = 'Explain the difference between a Docker image and a container, and how multi-stage Docker builds reduce production image size yes right correct nice good amazing it is very easy to use';
  const shortA = '404 means not found.';
  const shortQ = 'What does HTTP 404 mean?';
  const partialA = 'A Docker image is a template and a container is the running app.';
  const irrelevantA = 'I built a react application with nodejs and mongodb.';
  const keywordA = 'Docker image container multi-stage Docker production image Docker container Docker.';
  const unknownA = 'I do not know the answer.';

  const logResult = (name, res) => {
    console.log(`${name} -> Score: ${res.score}, Status: ${res.answerStatus}, Verdict: ${res.verdict}, Copied: ${res.evaluation.validity.isQuestionCopied}, Generic: ${res.evaluation.validity.isGenericFiller}`);
  };

  console.log('--- GOOD ANSWER 10 RUNS ---');
  for(let i=0; i<10; i++) {
    const r = await evaluateInterviewAnswer(q, goodA, 'Data Analyst', 'Technical', 'Medium', '');
    console.log(`Run ${i+1}: Score=${r.score}, Status=${r.answerStatus}, Tech=${r.scores.technicalAccuracy}, Comp=${r.scores.completeness}, Rel=${r.scores.relevance}, Clar=${r.scores.clarity}, Copied=${r.evaluation.validity.isQuestionCopied}, Generic=${r.evaluation.validity.isGenericFiller}`);
  }

  console.log('\n--- BAD ANSWER 10 RUNS ---');
  for(let i=0; i<10; i++) {
    const r = await evaluateInterviewAnswer(q, badA, 'Data Analyst', 'Technical', 'Medium', '');
    console.log(`Run ${i+1}: Score=${r.score}, Status=${r.answerStatus}, Tech=${r.scores.technicalAccuracy}, Comp=${r.scores.completeness}, Rel=${r.scores.relevance}, Clar=${r.scores.clarity}, Copied=${r.evaluation.validity.isQuestionCopied}, Generic=${r.evaluation.validity.isGenericFiller}`);
  }

  console.log('\n--- EDGE CASES ---');
  logResult('SHORT', await evaluateInterviewAnswer(shortQ, shortA, 'Data Analyst', 'Technical', 'Medium', ''));
  logResult('PARTIAL', await evaluateInterviewAnswer(q, partialA, 'Data Analyst', 'Technical', 'Medium', ''));
  logResult('IRRELEVANT', await evaluateInterviewAnswer(q, irrelevantA, 'Data Analyst', 'Technical', 'Medium', ''));
  logResult('KEYWORD', await evaluateInterviewAnswer(q, keywordA, 'Data Analyst', 'Technical', 'Medium', ''));
  logResult('UNKNOWN', await evaluateInterviewAnswer(q, unknownA, 'Data Analyst', 'Technical', 'Medium', ''));

  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
