/**
 * DishaSetu AI - Resume Improver Section & Intent Intelligence Test Suite
 */

import { improveResumeContent } from '../services/resumeService.js';

const testCases = [
  // 1. Invalid / Insufficient Inputs
  {
    id: 'INV-1',
    input: 'hii',
    section: 'Work Experience',
    role: 'Full Stack Developer',
    expectedValid: false,
    description: 'Single word greeting "hii" should be rejected with validation message',
  },
  {
    id: 'INV-2',
    input: 'test',
    section: 'Project Description',
    role: 'Full Stack Developer',
    expectedValid: false,
    description: 'Generic word "test" should be rejected with validation message',
  },

  // 2. Project Description Tests
  {
    id: 'PRJ-1',
    input: 'made an event management website using MERN',
    section: 'Project Description',
    role: 'Full Stack Developer',
    expectedValid: true,
    mustContain: ['event management', 'MERN'],
    mustNotStartWith: ['I am', 'Experienced software engineer with'],
    description: 'Event management project should produce professional project description',
  },
  {
    id: 'PRJ-2',
    input: 'made a food ordering website using React and Node',
    section: 'Project Description',
    role: 'Full Stack Developer',
    expectedValid: true,
    mustContain: ['food ordering', 'React', 'Node'],
    description: 'Food ordering app project description',
  },
  {
    id: 'PRJ-3',
    input: 'built an ecommerce website using React and Node',
    section: 'Project Description',
    role: 'Full Stack Developer',
    expectedValid: true,
    mustContain: ['e-commerce', 'React', 'Node'],
    description: 'E-commerce application project description',
  },

  // 3. Work Experience Tests
  {
    id: 'EXP-1',
    input: 'worked on frontend and fixed bugs',
    section: 'Work Experience',
    role: 'Full Stack Developer',
    expectedValid: true,
    mustContain: ['frontend', 'bugs'],
    mustNotStartWith: ['I am'],
    description: 'Work experience with frontend and bug fixes',
  },
  {
    id: 'EXP-2',
    input: 'fixed bugs in the application',
    section: 'Work Experience',
    role: 'Full Stack Developer',
    expectedValid: true,
    mustStartWithOneOf: ['Resolved', 'Fixed', 'Debugged'],
    mustNotStartWith: ['Developed', 'I am'],
    description: 'Bug fixing experience should use Resolved/Fixed/Debugged, never Developed',
  },
  {
    id: 'EXP-3',
    input: 'integrated REST APIs',
    section: 'Work Experience',
    role: 'Full Stack Developer',
    expectedValid: true,
    mustStartWithOneOf: ['Integrated', 'Connected'],
    mustNotStartWith: ['Developed', 'I am'],
    description: 'API integration experience should use Integrated, never Developed',
  },
  {
    id: 'EXP-4',
    input: 'worked with team on frontend',
    section: 'Work Experience',
    role: 'Full Stack Developer',
    expectedValid: true,
    mustStartWithOneOf: ['Collaborated'],
    mustNotStartWith: ['Developed', 'I am'],
    description: 'Team collaboration experience should use Collaborated',
  },
  {
    id: 'EXP-5',
    input: 'learned React',
    section: 'Work Experience',
    role: 'Full Stack Developer',
    expectedValid: true,
    mustStartWithOneOf: ['Gained'],
    mustNotStartWith: ['Developed', 'Engineered', 'Architected'],
    description: 'Learning input must not falsely claim senior development',
  },

  // 4. Professional Summary Tests
  {
    id: 'SUM-1',
    input: 'I am a CSE student interested in web development',
    section: 'Professional Summary',
    role: 'Full Stack Developer',
    expectedValid: true,
    mustNotStartWith: ['Developed', 'Built', 'Implemented', 'Engineered'],
    mustContain: ['Computer Science', 'web development'],
    description: 'Professional Summary must be written in summary tone, never starting with Developed',
  },
  {
    id: 'SUM-2',
    input: 'I am a Java developer with internship experience',
    section: 'Professional Summary',
    role: 'Java Developer',
    expectedValid: true,
    mustNotStartWith: ['Developed', 'Built', 'Implemented'],
    mustContain: ['Java', 'experience'],
    description: 'Java developer summary with internship experience',
  },
  {
    id: 'SUM-3',
    input: 'I am a CSE student interested in full stack development',
    section: 'Professional Summary',
    role: 'Full Stack Developer',
    expectedValid: true,
    mustNotStartWith: ['Developed', 'Built'],
    mustContain: ['Computer Science', 'full-stack'],
    description: 'CSE full stack aspirant summary',
  },

  // 5. Bullet Points Tests
  {
    id: 'BLT-1',
    input: 'made login page',
    section: 'Bullet Points',
    role: 'Full Stack Developer',
    expectedValid: true,
    mustContain: ['login', 'authentication'],
    description: 'Login page bullet point',
  },
  {
    id: 'BLT-2',
    input: 'integrated APIs',
    section: 'Bullet Points',
    role: 'Full Stack Developer',
    expectedValid: true,
    mustStartWithOneOf: ['Integrated'],
    description: 'API integration bullet point',
  },
  {
    id: 'BLT-3',
    input: 'reduced API response time by 30%',
    section: 'Bullet Points',
    role: 'Backend Developer',
    expectedValid: true,
    mustContain: ['30%'],
    description: 'Fact preservation test: 30% metric must be preserved',
  },
];

async function runImproverTestSuite() {
  console.log('='.repeat(75));
  console.log('DISHESETU AI — RESUME IMPROVER INTELLIGENCE TEST SUITE');
  console.log('='.repeat(75));

  let passed = 0;
  let total = testCases.length;

  for (const t of testCases) {
    console.log(`\n------------------------------------------------------------`);
    console.log(`TEST [${t.id}] (${t.section}): "${t.input}"`);

    const result = await improveResumeContent(t.input, t.section, t.role);

    let errors = [];

    // Check 1: Validity
    if (t.expectedValid !== result.isValid) {
      errors.push(`Expected isValid: ${t.expectedValid}, but got: ${result.isValid}`);
    }

    if (!t.expectedValid) {
      if (!result.validationMessage || !result.example) {
        errors.push(`Missing validationMessage or example for invalid input`);
      }
      console.log(`> Validation Response: "${result.validationMessage}"`);
      console.log(`> Provided Example    : "${result.example}"`);
    } else {
      const output = result.improvedText || '';
      console.log(`> Intent Detected     : ${result.intent}`);
      console.log(`> Action Verb         : ${result.actionVerb}`);
      console.log(`> Output Text         : "${output}"`);

      // Check 2: mustNotStartWith
      if (t.mustNotStartWith) {
        for (const badStart of t.mustNotStartWith) {
          if (output.toLowerCase().startsWith(badStart.toLowerCase())) {
            errors.push(`Output illegally starts with "${badStart}"`);
          }
        }
      }

      // Check 3: mustStartWithOneOf
      if (t.mustStartWithOneOf) {
        const startsOk = t.mustStartWithOneOf.some(verb => output.toLowerCase().startsWith(verb.toLowerCase()));
        if (!startsOk) {
          errors.push(`Output should start with one of [${t.mustStartWithOneOf.join(', ')}], but got: "${output}"`);
        }
      }

      // Check 4: mustContain
      if (t.mustContain) {
        for (const req of t.mustContain) {
          if (!output.toLowerCase().includes(req.toLowerCase())) {
            errors.push(`Output missing required entity: "${req}"`);
          }
        }
      }
    }

    if (errors.length === 0) {
      console.log(`✅ RESULT: PASSED`);
      passed++;
    } else {
      console.log(`❌ RESULT: FAILED`);
      errors.forEach(e => console.log(`   - ${e}`));
    }
  }

  console.log(`\n` + '='.repeat(75));
  console.log(`RESUME IMPROVER SUITE SUMMARY: ${passed}/${total} TESTS PASSED`);
  console.log('='.repeat(75));

  if (passed === total) {
    console.log('🎉 ALL RESUME IMPROVER TEST CASES PASSED WITH 100% ACCURACY!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runImproverTestSuite();
