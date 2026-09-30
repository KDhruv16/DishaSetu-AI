import mongoose from 'mongoose';
import { evaluateStudentAnswer } from './src/services/interviewService.js';
import Interview from './src/models/Interview.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect('mongodb://127.0.0.1:27017/dishasetu').then(async () => {
  try {
    const questionText = "How do you write reliable unit and integration tests using Jest and Supertest for REST API endpoints and error handlers?";
    const studentAnswer = "Jest can be used for unit testing and Supertest can send HTTP requests to test REST API endpoints. We can also test successful responses and error cases.";
    const role = "Full Stack Developer";
    const type = "Technical";
    const difficulty = "Medium";
    const category = "Testing";
    
    console.log("Calling evaluateStudentAnswer...");
    const evaluation = await evaluateStudentAnswer(
      questionText,
      studentAnswer,
      role,
      type,
      difficulty,
      category
    );
    console.log("Success! Evaluation:");
    console.log(evaluation);
  } catch (err) {
    console.error("ERROR:");
    console.error(err);
  }
  process.exit();
});
