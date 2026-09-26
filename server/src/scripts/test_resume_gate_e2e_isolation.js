/**
 * DishaSetu AI - Resume Gate End-to-End Database Isolation & Rejection Test
 * 
 * Verifies that:
 * 1. Non-resume PDF upload fails with HTTP 422.
 * 2. ZERO ResumeAnalysis documents are inserted in MongoDB for non-resumes.
 * 3. ZERO changes are made to user Profile readiness scores.
 * 4. Subsequent valid resume PDF upload passes with HTTP 200 and generates ATS score.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import '../models/User.js';
import '../models/Profile.js';
import '../models/ResumeAnalysis.js';
import { analyzeResume } from '../controllers/resumeController.js';

dotenv.config();

// Helpers to create mock PDF buffer
function createPdfBuffer(text) {
  const streamLines = text.trim().split('\n').map(l => `(${l.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')}) '`).join('\n');
  const contentStream = `BT\n/F1 10 Tf\n40 750 Td\n14 TL\n${streamLines}\nET`;
  const streamLength = Buffer.byteLength(contentStream, 'utf-8');

  let pdf = '%PDF-1.4\n';
  pdf += '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  pdf += '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  pdf += '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n';
  pdf += '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';
  pdf += `5 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj\n`;
  pdf += 'xref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000115 00000 n \n0000000260 00000 n \n0000000340 00000 n \n';
  pdf += 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n500\n%%EOF\n';
  return Buffer.from(pdf, 'utf-8');
}

async function runGateIsolationTest() {
  console.log('='.repeat(75));
  console.log('DISHESETU AI — RESUME GATE E2E ISOLATION & ZERO-LEAKAGE AUDIT');
  console.log('='.repeat(75));

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dishasetu');
  const User = mongoose.model('User');
  const Profile = mongoose.model('Profile');
  const ResumeAnalysis = mongoose.model('ResumeAnalysis');

  // 1. Setup Isolated Test User
  let testUser = await User.findOne({ email: 'gate.isolation.audit@dishasetu.ai' });
  if (!testUser) {
    testUser = await User.create({
      name: 'Gate Audit Candidate',
      email: 'gate.isolation.audit@dishasetu.ai',
      password: 'hashed_password_123',
    });
  }

  let profile = await Profile.findOne({ user: testUser._id });
  if (!profile) {
    profile = await Profile.create({
      user: testUser._id,
      career: { targetRole: 'Full Stack Developer' },
      readiness: { overall: 50, resumeScore: 0 },
    });
  } else {
    profile.readiness.resumeScore = 0;
    await profile.save();
  }

  // Clear prior analysis records
  await ResumeAnalysis.deleteMany({ userId: testUser._id });

  console.log(`[1] Initialized Clean Test User: ${testUser.name} (${testUser._id})`);
  console.log(`[2] Initial Profile Resume Score: ${profile.readiness.resumeScore}`);

  // 2. Upload NON-RESUME (College Assignment)
  console.log(`\n[3] Attempting upload of NON-RESUME PDF (Operating Systems Assignment)...`);
  const assignmentText = `
DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
OPERATING SYSTEMS ASSIGNMENT - 2
Course Code: CS-402 | Due Date: 15th October 2024
Total Marks: 50 | Submitted by: Roll No 42

Question 1: Explain Demand Paging and Page Replacement Algorithms in Python and C.
Question 2: Write SQL queries for concurrency control and database transaction locking.
`;
  const assignmentPdf = createPdfBuffer(assignmentText);

  let statusCode1 = null;
  let responseBody1 = null;

  const req1 = {
    file: {
      buffer: assignmentPdf,
      originalname: 'OS_Assignment_2.pdf',
      size: assignmentPdf.length,
      mimetype: 'application/pdf',
    },
    user: { _id: testUser._id },
  };

  const res1 = {
    status: (code) => {
      statusCode1 = code;
      return {
        json: (data) => {
          responseBody1 = data;
          return data;
        },
      };
    },
  };

  await analyzeResume(req1, res1);

  console.log(`> Response Status: ${statusCode1}`);
  console.log(`> Response Body  :`, JSON.stringify(responseBody1));

  // Verify Non-Resume Assertions
  const countAfterNonResume = await ResumeAnalysis.countDocuments({ userId: testUser._id });
  const profileAfterNonResume = await Profile.findOne({ user: testUser._id });

  console.log(`> MongoDB ResumeAnalysis Count: ${countAfterNonResume} (Expected: 0)`);
  console.log(`> Profile Resume Score: ${profileAfterNonResume.readiness.resumeScore} (Expected: 0)`);

  let errors = [];
  if (statusCode1 !== 422) errors.push(`Expected HTTP 422 for non-resume, but got HTTP ${statusCode1}`);
  if (responseBody1?.isResume !== false) errors.push(`Expected isResume: false for non-resume rejection`);
  if (countAfterNonResume !== 0) errors.push(`CRITICAL LEAK: ResumeAnalysis record was created in MongoDB for a non-resume!`);
  if (profileAfterNonResume.readiness.resumeScore !== 0) errors.push(`CRITICAL LEAK: Profile readiness score was updated for a non-resume!`);

  // 3. Upload VALID RESUME
  console.log(`\n[4] Attempting upload of VALID RESUME PDF (Fresher Candidate)...`);
  const resumeText = `
PRIYA SHARMA
priya.sharma@collegemail.edu | +91 9123456780 | Bhopal, India
GitHub: github.com/priyacodes | LinkedIn: linkedin.com/in/priyasharma

EDUCATION
Bachelor of Technology in Computer Science and Engineering
ABC Institute of Technology, Bhopal (2021 - 2025) | CGPA: 8.9/10

TECHNICAL SKILLS
- Languages: JavaScript, Java, Python, HTML5, CSS3
- Frameworks & Libraries: React.js, Node.js, Express.js, Tailwind CSS
- Databases & Tools: MongoDB, MySQL, Git, GitHub, Postman, VS Code

PROJECTS
1. E-Commerce Web Portal
- Built a responsive single-page store with React.js, Redux Toolkit, and Tailwind CSS.
- Integrated REST APIs for cart checkout and product catalog filtering.

2. Campus Placement Management System
- Developed full-stack portal with Node.js and MongoDB to streamline campus recruiting.
`;
  const resumePdf = createPdfBuffer(resumeText);

  let statusCode2 = null;
  let responseBody2 = null;

  const req2 = {
    file: {
      buffer: resumePdf,
      originalname: 'Priya_Sharma_Resume.pdf',
      size: resumePdf.length,
      mimetype: 'application/pdf',
    },
    user: { _id: testUser._id },
  };

  const res2 = {
    status: (code) => {
      statusCode2 = code;
      return {
        json: (data) => {
          responseBody2 = data;
          return data;
        },
      };
    },
  };

  await analyzeResume(req2, res2);

  console.log(`> Response Status: ${statusCode2}`);
  console.log(`> Generated ATS Score: ${responseBody2?.analysis?.atsScore?.overall}/100`);

  const countAfterResume = await ResumeAnalysis.countDocuments({ userId: testUser._id });
  const profileAfterResume = await Profile.findOne({ user: testUser._id });

  console.log(`> MongoDB ResumeAnalysis Count: ${countAfterResume} (Expected: 1)`);
  console.log(`> Updated Profile Resume Score: ${profileAfterResume.readiness.resumeScore} (Expected: > 0)`);

  if (statusCode2 !== 200) errors.push(`Expected HTTP 200 for valid resume, but got HTTP ${statusCode2}`);
  if (countAfterResume !== 1) errors.push(`Expected exactly 1 ResumeAnalysis document after valid resume upload`);
  if (profileAfterResume.readiness.resumeScore <= 0) errors.push(`Profile resume score was not updated for valid resume`);

  console.log(`\n` + '='.repeat(75));
  console.log(`AUDIT RESULTS:`);
  console.log('='.repeat(75));

  await mongoose.disconnect();

  if (errors.length === 0) {
    console.log('🎉 RESUME GATE E2E ISOLATION & REJECTION TEST PASSED WITH ZERO LEAKAGE!');
    process.exit(0);
  } else {
    console.error('❌ AUDIT FAILED WITH ERRORS:');
    errors.forEach(e => console.error(`   - ${e}`));
    process.exit(1);
  }
}

runGateIsolationTest();
