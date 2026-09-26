import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import CareerAnalysis from '../models/CareerAnalysis.js';
import Roadmap from '../models/Roadmap.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import Interview from '../models/Interview.js';
import { calculateReadinessScore } from '../services/readinessService.js';

export const seedDemoProfile = async () => {
  try {
    const demoEmail = 'demo@dishasetu.ai';
    let demoUser = await User.findOne({ email: demoEmail });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('DemoPassword123!', salt);

    if (!demoUser) {
      demoUser = await User.create({
        name: 'Aarav Sharma (Demo Profile)',
        email: demoEmail,
        password: hashedPassword,
        isOnboarded: true,
      });
      console.log('✅ Demo user account created: demo@dishasetu.ai');
    } else {
      demoUser.name = 'Aarav Sharma (Demo Profile)';
      demoUser.password = hashedPassword;
      demoUser.isOnboarded = true;
      await demoUser.save();
    }

    const userId = demoUser._id;

    // 1. Seed Demo Profile
    const demoProfileData = {
      user: userId,
      personal: {
        name: 'Aarav Sharma (Demo Profile)',
        email: demoEmail,
        phone: '+91 98765 43210',
        location: 'Bhopal, Madhya Pradesh',
      },
      academics: {
        degree: 'B.Tech - Computer Science & Engineering',
        college: 'Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV), Bhopal',
        graduationYear: '2026',
        cgpa: '8.4',
        backlogs: 'None',
      },
      career: {
        targetRole: 'Full Stack Developer',
        domainInterest: 'Web Technologies & Cloud Services',
        preferredWorkMode: 'Hybrid / Remote',
        preferredLocation: 'Bhopal / Indore / Remote',
      },
      skills: {
        currentSkills: [
          'React',
          'Node.js',
          'JavaScript',
          'HTML/CSS',
          'Git',
          'MongoDB',
          'Tailwind CSS',
          'Express.js',
          'REST APIs',
        ],
        projects: [
          'DishaSetu AI Career Portal (React, Node.js, Express, MongoDB)',
          'MP Citizen Grievance Portal (Full Stack MERN with Role Auth)',
          'Campus Resource Hub (Responsive UI with Tailwind & Vite)',
        ],
        internships: [
          'Web Development Intern at MP State Electronics Development Corp (3 Months)',
        ],
        certifications: [
          'NPTEL Cloud Computing & Distributed Systems (Elite)',
          'Meta Front-End Developer Certificate (Coursera)',
        ],
      },
      readiness: {
        readinessScore: 82,
        skillMatchScore: 85,
        resumeScore: 84,
        interviewScore: 78,
        topSkillGaps: [
          {
            name: 'Docker',
            priority: 'High',
            reason: 'Essential for modern containerized microservice deployments in production.',
          },
          {
            name: 'Testing',
            priority: 'Medium',
            reason: 'High industry demand for unit & integration testing (Jest/Supertest).',
          },
          {
            name: 'SQL',
            priority: 'Medium',
            reason: 'Crucial for relational schema modeling and database migrations.',
          },
        ],
        nextBestStep: 'Complete Docker Containerization Task in Week 1 of your Roadmap Sprint.',
      },
    };

    await Profile.findOneAndUpdate({ user: userId }, demoProfileData, { upsert: true, new: true });

    // 2. Seed Demo Career Analysis
    const demoCareerAnalysisData = {
      userId: userId,
      user: userId,
      careers: [

        {
          role: 'Full Stack Developer',
          matchPercentage: 86,
          requiredSkills: [
            'React',
            'Node.js',
            'JavaScript',
            'HTML/CSS',
            'MongoDB',
            'SQL',
            'Docker',
            'Testing',
          ],
          whyItMatches: [
            'Strong foundation in core JavaScript and MERN stack technologies.',
            'Demonstrated 3 full-stack projects including MP Citizen Grievance Portal.',
            'Academics in CSE with 8.4 CGPA aligns directly with software engineer criteria.',
          ],
          missingSkills: [
            {
              skill: 'Docker',
              priority: 'High',
              reason: 'Essential for containerizing microservices and CI/CD pipelines.',
            },
            {
              skill: 'Testing',
              priority: 'Medium',
              reason: 'High requirement for writing automated test suites with Jest and Mocha.',
            },
            {
              skill: 'SQL',
              priority: 'Medium',
              reason: 'Standard relational querying competency expected in enterprise teams.',
            },
          ],
          nextStep: 'Complete Docker Containerization Sprint Task in your personalized roadmap.',
        },
        {
          role: 'Frontend Developer',
          matchPercentage: 92,
          requiredSkills: ['React', 'JavaScript', 'HTML/CSS', 'Tailwind CSS', 'Git', 'Testing'],
          whyItMatches: [
            'Exceptional command of React components and responsive Tailwind styling.',
            'Proven frontend portfolio with responsive layouts.',
          ],
          missingSkills: [
            {
              skill: 'Testing',
              priority: 'Medium',
              reason: 'Writing React Testing Library component tests.',
            },
          ],
          nextStep: 'Build interactive dashboard component test suites.',
        },
        {
          role: 'Backend Developer',
          matchPercentage: 78,
          requiredSkills: ['Node.js', 'Express.js', 'MongoDB', 'SQL', 'Docker', 'Authentication'],
          whyItMatches: [
            'Solid grasp of RESTful APIs, JWT authentication, and MongoDB schema design.',
          ],
          missingSkills: [
            {
              skill: 'Docker',
              priority: 'High',
              reason: 'Containerization and environment reproducibility.',
            },
            {
              skill: 'SQL',
              priority: 'Medium',
              reason: 'Relational database schema modeling and transactions.',
            },
          ],
          nextStep: 'Implement PostgreSQL database migrations and Docker Compose.',
        },
      ],
      readinessScore: {
        overall: 82,
        breakdown: {
          technicalSkills: 88,
          projects: 90,
          experience: 75,
          education: 84,
          targetSkillCoverage: 86,
          interviewReadiness: 78,
        },
      },
    };

    await CareerAnalysis.findOneAndUpdate({ userId: userId }, demoCareerAnalysisData, {
      upsert: true,
      new: true,
    });

    // 3. Seed Demo Roadmap (4-Week Sprint with 3 completed tasks -> 25% progress)
    const demoRoadmapData = {
      user: userId,
      targetRole: 'Full Stack Developer',
      weeks: [
        {
          weekNumber: 1,
          title: 'Docker Fundamentals & Containerization',
          description: 'Master Docker container lifecycle, Dockerfile creation, and multi-container orchestration with Docker Compose.',
          tasks: [
            {
              taskId: 'w1_t1',
              title: 'Understand Docker container architecture and CLI commands',
              description: 'Install Docker Desktop, understand images vs containers, and run standard Node.js containers locally.',
              skill: 'Docker',
              priority: 'High',
              estimatedHours: 4,
              completed: true,
              completedAt: new Date(Date.now() - 86400000 * 3),
            },
            {
              taskId: 'w1_t2',
              title: 'Write production multi-stage Dockerfile for MERN app',
              description: 'Containerize backend Express server and Vite frontend using optimized multi-stage build layers.',
              skill: 'Docker',
              priority: 'High',
              estimatedHours: 5,
              completed: true,
              completedAt: new Date(Date.now() - 86400000 * 2),
            },
            {
              taskId: 'w1_t3',
              title: 'Orchestrate MongoDB + Node.js with Docker Compose',
              description: 'Create docker-compose.yml linking backend API and MongoDB with persistent volume storage.',
              skill: 'Docker',
              priority: 'High',
              estimatedHours: 4,
              completed: true,
              completedAt: new Date(Date.now() - 86400000 * 1),
            },
          ],
        },
        {
          weekNumber: 2,
          title: 'Automated Testing & Code Quality',
          description: 'Solidify your code reliability with unit testing and API integration test suites.',
          tasks: [
            {
              taskId: 'w2_t1',
              title: 'Set up Jest and Supertest for Express API endpoints',
              description: 'Configure test runner environment and write unit tests for authentication routes.',
              skill: 'Testing',
              priority: 'High',
              estimatedHours: 4,
              completed: false,
            },
            {
              taskId: 'w2_t2',
              title: 'Implement component tests with React Testing Library',
              description: 'Write automated tests for forms, loading states, and dashboard metric widgets.',
              skill: 'Testing',
              priority: 'Medium',
              estimatedHours: 5,
              completed: false,
            },
            {
              taskId: 'w2_t3',
              title: 'Measure code coverage and add pre-commit test hooks',
              description: 'Target 80%+ test branch coverage across critical business logic controllers.',
              skill: 'Testing',
              priority: 'Medium',
              estimatedHours: 3,
              completed: false,
            },
          ],
        },
        {
          weekNumber: 3,
          title: 'SQL Relational Modeling & Complex Queries',
          description: 'Deep-dive into PostgreSQL schema design, indexes, and transactional query optimizations.',
          tasks: [
            {
              taskId: 'w3_t1',
              title: 'Master relational schema normalization and SQL joins',
              description: 'Design multi-table relational schema with primary keys, foreign keys, and indexes.',
              skill: 'SQL',
              priority: 'Medium',
              estimatedHours: 4,
              completed: false,
            },
            {
              taskId: 'w3_t2',
              title: 'Optimize aggregation queries and transaction integrity',
              description: 'Write analytical SQL queries and implement ACID transactions for financial/order records.',
              skill: 'SQL',
              priority: 'Medium',
              estimatedHours: 4,
              completed: false,
            },
            {
              taskId: 'w3_t3',
              title: 'Connect PostgreSQL with Prisma / Sequelize ORM',
              description: 'Implement type-safe database queries and migration scripts in Node.js backend.',
              skill: 'SQL',
              priority: 'Medium',
              estimatedHours: 4,
              completed: false,
            },
          ],
        },
        {
          weekNumber: 4,
          title: 'Capstone Production Project & Career Launch',
          description: 'Deploy full-stack containerized platform to cloud and prepare mock interview readiness.',
          tasks: [
            {
              taskId: 'w4_t1',
              title: 'Architect verified full-stack project incorporating Docker & SQL',
              description: 'Assemble all sprint competencies into a polished showcase repository with clear README.',
              skill: 'Full Stack Developer',
              priority: 'High',
              estimatedHours: 6,
              completed: false,
            },
            {
              taskId: 'w4_t2',
              title: 'Deploy to Cloud with CI/CD GitHub Actions',
              description: 'Automate build, test, and containerized deployment to cloud virtual instances.',
              skill: 'DevOps / Cloud',
              priority: 'High',
              estimatedHours: 5,
              completed: false,
            },
            {
              taskId: 'w4_t3',
              title: 'Complete DishaSetu Mock Interview & Apply to Opportunities',
              description: 'Score 80%+ in mock interview studio and submit application to top matched MP Tech positions.',
              skill: 'Interview Readiness',
              priority: 'Medium',
              estimatedHours: 3,
              completed: false,
            },
          ],
        },
      ],
      totalTasks: 12,
      completedTasks: 3,
      overallProgress: 25,
      nextBestStep: 'Start Week 2: Set up Jest and Supertest for Express API endpoints',
    };

    await Roadmap.findOneAndUpdate({ user: userId }, demoRoadmapData, {
      upsert: true,
      new: true,
    });

    // 4. Seed Demo Resume Analysis
    const demoResumeData = {
      userId: userId,
      user: userId,
      fileName: 'Aarav_Sharma_FullStack_Resume.pdf',
      targetRole: 'Full Stack Developer',
      atsScore: {
        overall: 84,
        breakdown: {
          keywordMatch: 85,
          sectionCompleteness: 90,
          projectAndExperience: 80,
          formattingAndClarity: 85,
        },
      },
      strengths: [
        'Strong technical core with clear proficiency in React, Node.js, and MongoDB.',
        'Well-documented academic profile with 8.4 CGPA and CSE specialization.',
        'Clear project highlights with technology stacks and functional breakdown.',
        'Practical internship experience at MP State Electronics Development Corp.',
      ],
      weakAreas: [
        'Lacks quantifiable metrics (e.g. percentage latency improvement, active user count).',
        'Missing keywords for containerization (Docker) and automated testing in work experience.',
        'Project descriptions could utilize more authoritative action verbs.',
      ],
      missingKeywords: ['Docker', 'Jest / Testing', 'PostgreSQL', 'CI/CD Pipelines', 'Redis'],
      suggestions: [
        'Quantify achievements in project bullets (e.g. "reduced API response time by 35%").',
        'Add newly completed Docker containerization work under technical skills & projects.',
        'Include link to live hosted demo applications and GitHub repositories.',
      ],
      parsedTextPreview: 'Aarav Sharma | B.Tech CSE (2026) | Full Stack Developer | React, Node.js, Express, MongoDB, Git...',
    };

    await ResumeAnalysis.findOneAndUpdate({ userId: userId }, demoResumeData, {
      upsert: true,
      new: true,
    });

    // 5. Seed Demo Interview Session
    const demoInterviewData = {
      userId: userId,
      user: userId,
      role: 'Full Stack Developer',
      type: 'Technical',
      difficulty: 'Medium',
      completed: true,
      questions: [
        {
          questionIndex: 0,
          questionText: 'Explain how Node.js handles asynchronous operations using the Event Loop and Libuv.',
          category: 'Architecture',
          studentAnswer:
            'Node.js uses a single-threaded event loop driven by Libuv. When asynchronous I/O tasks like database queries or file reading occur, they are delegated to worker threads in Libuv thread pool or kernel. When completed, callback events are queued in microtask/macrotask queues and executed on the main thread.',
          scores: {
            technicalAccuracy: 85,
            completeness: 80,
            clarity: 82,
            relevance: 90,
            overall: 84,
          },
          whatWentWell: [
            'Accurately explained Libuv thread pool delegation and single-threaded nature.',
            'Mentioned task queue distinction correctly.',
          ],
          howToImprove: [
            'Mention process.nextTick vs Promise microtask queue priority order.',
          ],
          betterApproach:
            'Outline the specific phases of the Event Loop (timers, pending callbacks, poll, check, close) for added depth.',
          isAnswered: true,
        },
        {
          questionIndex: 1,
          questionText: 'What are the main differences between SQL and NoSQL databases, and when would you choose MongoDB over PostgreSQL?',
          category: 'Databases',
          studentAnswer:
            'SQL databases are relational with structured tables, ACID transactions, and strict schemas. NoSQL databases like MongoDB are document-based, schema-flexible, and scale horizontally with sharding. I choose MongoDB for rapid prototyping and nested hierarchical JSON documents, and PostgreSQL for strict relational data with complex transactions.',
          scores: {
            technicalAccuracy: 88,
            completeness: 82,
            clarity: 85,
            relevance: 88,
            overall: 86,
          },
          whatWentWell: [
            'Clearly articulated trade-offs between rigid relational schema and flexible document models.',
            'Identified appropriate production use-cases for both.',
          ],
          howToImprove: [
            'Mention MongoDB multi-document ACID transactions introduced in modern versions.',
          ],
          betterApproach:
            'Contrast indexing strategies and foreign key constraints between the two systems.',
          isAnswered: true,
        },
        {
          questionIndex: 2,
          questionText: 'How do you optimize the performance of a React single-page application experiencing slow rendering times?',
          category: 'Frontend Performance',
          studentAnswer:
            'I use React.memo to prevent unnecessary re-renders of child components, useMemo and useCallback for memoizing heavy calculations and callbacks, code splitting with React.lazy and Suspense, and virtualizing long lists with windowing libraries.',
          scores: {
            technicalAccuracy: 85,
            completeness: 75,
            clarity: 80,
            relevance: 85,
            overall: 81,
          },
          whatWentWell: [
            'Covered key React performance tools (memo, useMemo, useCallback, lazy loading).',
          ],
          howToImprove: [
            'Mention Chrome DevTools Profiler / React DevTools Profiler for diagnosing render bottlenecks before optimizing.',
          ],
          betterApproach:
            'Explain how identifying the root cause with Profiler prevents premature memoization overhead.',
          isAnswered: true,
        },
        {
          questionIndex: 3,
          questionText: 'How would you secure a REST API against common vulnerabilities like SQL/NoSQL injection and unauthorized access?',
          category: 'Security',
          studentAnswer:
            'For authentication and authorization, use JWT tokens with HTTPS and HTTP-only cookies. Sanitize inputs using express-validator to prevent NoSQL operator injection. Use rate limiting to protect against brute force attacks, and enable Helmet middleware for secure HTTP headers.',
          scores: {
            technicalAccuracy: 80,
            completeness: 75,
            clarity: 78,
            relevance: 82,
            overall: 79,
          },
          whatWentWell: [
            'Good security coverage including JWT, input sanitization, rate limiting, and Helmet.',
          ],
          howToImprove: [
            'Discuss CORS origin whitelisting and CSRF protection mechanisms.',
          ],
          betterApproach:
            'Mention role-based access control (RBAC) middleware verifying permissions per route.',
          isAnswered: true,
        },
        {
          questionIndex: 4,
          questionText: 'Describe a challenging bug you encountered in a full-stack project and your systematic approach to solving it.',
          category: 'Problem Solving',
          studentAnswer:
            'In my MP Grievance Portal project, users were experiencing race conditions when submitting duplicate tickets simultaneously. I reproduced the issue using network throttling, diagnosed that the database query checked for existing tickets before atomic insertion, and fixed it by adding a unique compound index and database transaction lock.',
          scores: {
            technicalAccuracy: 80,
            completeness: 76,
            clarity: 78,
            relevance: 80,
            overall: 78,
          },
          whatWentWell: [
            'Followed the STAR method (Situation, Task, Action, Result) effectively.',
            'Demonstrated solid root-cause analysis.',
          ],
          howToImprove: [
            'Mention automated regression test added to prevent the bug from recurring.',
          ],
          betterApproach:
            'Emphasize how automated unit/integration tests verified the resolution.',
          isAnswered: true,
        },
      ],
      overallScore: {
        overall: 78,
        breakdown: {
          technicalAccuracy: 84,
          completeness: 79,
          clarity: 81,
          relevance: 85,
        },
      },
    };

    await Interview.findOneAndUpdate({ userId: userId }, demoInterviewData, {
      upsert: true,
      new: true,
    });


    console.log('🌟 Complete Demo Profile seeded and verified successfully.');
    return { success: true, user: demoUser };
  } catch (error) {
    console.error('Error seeding demo profile:', error);
    return { success: false, error: error.message };
  }
};
