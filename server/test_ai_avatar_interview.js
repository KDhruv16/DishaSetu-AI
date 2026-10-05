import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from './src/models/User.js';
import Opportunity from './src/models/Opportunity.js';
import Application from './src/models/Application.js';
import OrganizationInterview from './src/models/OrganizationInterview.js';
import { generateOpeningQuestion, generateNextInterviewQuestion } from './src/services/aiAvatarInterviewService.js';

async function runTest() {
  console.log('=== STARTING AI AVATAR INTERVIEW VERIFICATION ===');

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dishasetu');
  console.log('✓ Connected to MongoDB');

  // 1. Verify Gemini Dynamic Opening Question Generation
  console.log('\n[TEST 1] Testing Gemini Opening Question Generation...');
  const opening = await generateOpeningQuestion({
    candidateName: 'Dhruv Sharma',
    jobTitle: 'Senior Full Stack Engineer',
    companyName: 'TechNext Innovations',
    requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
    jobDescription: 'Building distributed scalable cloud web applications with microservices.'
  });
  console.log('✓ Gemini Generated Opening Question:', opening);

  // 2. Verify Gemini Dynamic Next Question Generation based on Candidate Response
  console.log('\n[TEST 2] Testing Gemini Dynamic Contextual Question Generation...');
  const candidateSpokenAnswer = "I recently led the development of a real-time analytics dashboard using React on the frontend and Node.js with PostgreSQL on the backend. We ran into database bottleneck issues under high write volume, so I introduced Redis for write-through caching and connection pooling.";
  
  const nextQ = await generateNextInterviewQuestion({
    candidateName: 'Dhruv Sharma',
    jobTitle: 'Senior Full Stack Engineer',
    companyName: 'TechNext Innovations',
    requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
    conversationHistory: [
      { questionText: opening.questionText, candidateResponse: candidateSpokenAnswer }
    ],
    latestCandidateResponse: candidateSpokenAnswer,
    currentQuestionNumber: 1,
    totalPlannedQuestions: 5
  });
  console.log('✓ Gemini Generated Dynamic Follow-up Question:', nextQ);

  // 3. Verify Database OrganizationInterview Model with interviewType and aiSession
  console.log('\n[TEST 3] Testing OrganizationInterview Model with interviewType and aiSession...');
  
  // Find any existing candidate and organization
  const candidate = await User.findOne({ role: 'candidate' }) || await User.findOne();
  const organization = await User.findOne({ role: 'organization' }) || await User.findOne();
  const opportunity = await Opportunity.findOne() || await Opportunity.create({
    title: 'Full Stack Developer',
    company: 'Innovate Labs',
    description: 'React and Node.js engineer',
    skills: ['React', 'Node.js'],
    organizationId: organization._id,
    type: 'Job'
  });

  let app = await Application.findOne({ candidate: candidate._id });
  if (!app) {
    app = await Application.create({
      candidate: candidate._id,
      organization: organization._id,
      opportunity: opportunity._id,
      status: 'interview'
    });
  }

  // Create or update interview
  let testInterview = await OrganizationInterview.findOne({ application: app._id });
  if (!testInterview) {
    testInterview = await OrganizationInterview.create({
      application: app._id,
      opportunity: opportunity._id,
      candidate: candidate._id,
      organization: organization._id,
      title: 'Full Stack Technical AI Interview',
      type: 'technical',
      scheduledDate: new Date(),
      startTime: '10:00',
      endTime: '11:00',
      mode: 'online',
      interviewType: 'ai',
      aiSession: {
        startedAt: new Date(),
        currentQuestionIndex: 0,
        persona: {
          name: 'Dr. Elena Vance',
          title: 'Senior AI Technical Interviewer',
          voice: 'female-professional'
        },
        questions: [
          {
            questionNumber: 1,
            questionText: opening.questionText,
            askedAt: new Date(),
            candidateResponse: candidateSpokenAnswer,
            answeredAt: new Date()
          }
        ]
      }
    });
  } else {
    testInterview.interviewType = 'ai';
    testInterview.aiSession = {
      startedAt: new Date(),
      currentQuestionIndex: 0,
      persona: {
        name: 'Dr. Elena Vance',
        title: 'Senior AI Technical Interviewer',
        voice: 'female-professional'
      },
      questions: [
        {
          questionNumber: 1,
          questionText: opening.questionText,
          askedAt: new Date(),
          candidateResponse: candidateSpokenAnswer,
          answeredAt: new Date()
        }
      ]
    };
    await testInterview.save();
  }

  console.log('✓ Successfully created/updated OrganizationInterview with AI mode:');
  console.log('  Interview ID:', testInterview._id);
  console.log('  Mode:', testInterview.mode);
  console.log('  InterviewType:', testInterview.interviewType);
  console.log('  AI Session Question Count:', testInterview.aiSession.questions.length);

  await mongoose.disconnect();
  console.log('\n=== ALL AI AVATAR INTERVIEW BACKEND TESTS PASSED ===');
}

runTest().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
