import { evaluateInterviewAnswer } from './src/services/interviewEvaluator.js';
import dotenv from 'dotenv';
dotenv.config();

const question = "Explain database transaction isolation levels and ACID guarantees in relational databases like PostgreSQL.";
const badAnswer = "sql ka bada bhai hai postgresql is used for dancing and singing";
const goodAnswer = "ACID stands for atomicity, consistency, isolation, and durability. Atomicity ensures a transaction either completes fully or rolls back. Isolation controls how concurrent transactions interact, while durability ensures committed changes persist. PostgreSQL supports isolation levels such as Read Committed, Repeatable Read, and Serializable.";
const partialAnswer = "Explain INNER JOIN vs LEFT JOIN.";
const partialAnswerText = "INNER JOIN returns matching rows from both tables.";
const unrelatedAnswer = "Explain database normalization.";
const unrelatedAnswerText = "React uses components, props and hooks to build interactive user interfaces.";
const poemAnswer = "Roses are red, violets are blue, databases are waiting for you.";

async function test() {
  console.log("--- TEST BAD ANSWER ---");
  let res = await evaluateInterviewAnswer(question, badAnswer, 'Data Analyst', 'Technical', 'Medium', '', 'SQL');
  console.log('Bad Answer:', res.score, res.verdict, res.isMeaningfulAnswer);

  console.log("\n--- TEST GOOD ANSWER ---");
  res = await evaluateInterviewAnswer(question, goodAnswer, 'Data Analyst', 'Technical', 'Medium', '', 'SQL');
  console.log('Good Answer:', res.score, res.verdict, res.isMeaningfulAnswer);

  console.log("\n--- TEST PARTIAL ANSWER ---");
  res = await evaluateInterviewAnswer(partialAnswer, partialAnswerText, 'Data Analyst', 'Technical', 'Medium', '', 'SQL');
  console.log('Partial Answer:', res.score, res.verdict, res.isMeaningfulAnswer);

  console.log("\n--- TEST UNRELATED ANSWER ---");
  res = await evaluateInterviewAnswer(unrelatedAnswer, unrelatedAnswerText, 'Data Analyst', 'Technical', 'Medium', '', 'SQL');
  console.log('Unrelated Answer:', res.score, res.verdict, res.isMeaningfulAnswer);

  console.log("\n--- TEST POEM ANSWER ---");
  res = await evaluateInterviewAnswer(unrelatedAnswer, poemAnswer, 'Data Analyst', 'Technical', 'Medium', '', 'SQL');
  console.log('Poem Answer:', res.score, res.verdict, res.isMeaningfulAnswer);
}

test();
