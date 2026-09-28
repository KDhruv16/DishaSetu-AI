import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Education from '../models/Education.js';
import TargetRole from '../models/TargetRole.js';
import Skill from '../models/Skill.js';
import RoleSkillMapping from '../models/RoleSkillMapping.js';
import InterviewQuestion from '../models/InterviewQuestion.js';
import LearningResource from '../models/LearningResource.js';
import RoadmapTemplate from '../models/RoadmapTemplate.js';
import PlatformSetting from '../models/PlatformSetting.js';
import { ROLE_SKILL_QUESTIONS } from '../services/interviewService.js';
import { ROLE_SKILL_BENCHMARKS, normalizeSkillName } from '../utils/skillNormalization.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dishasetu';

export async function seedAdminAndMasterData() {
  console.log('================================================================');
  console.log('SEEDING DISHASETU AI ADMIN & MASTER DATA');
  console.log('================================================================\n');

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB:', MONGO_URI);
  }

  // 1. Seed Administrator Account
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@dishasetu.ai').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

  let adminUser = await User.findOne({ email: adminEmail }).select('+password');
  if (!adminUser) {
    adminUser = await User.create({
      name: 'DishaSetu Administrator',
      email: adminEmail,
      password: adminPassword, // will be hashed by User pre-save hook
      role: 'admin',
      isOnboarded: true,
      isActive: true,
    });
    console.log(`✓ Admin account created: ${adminEmail}`);
  } else {
    adminUser.role = 'admin';
    adminUser.password = adminPassword; // Triggers pre-save hash
    adminUser.isActive = true;
    await adminUser.save();
    console.log(`✓ Admin account updated and verified: ${adminEmail}`);
  }

  // 2. Seed Master Education Options
  const educationData = [
    {
      name: 'B.Tech / B.E.',
      category: 'Undergraduate',
      specializations: [
        'Computer Science & Engineering',
        'Information Technology',
        'Electronics & Communication',
        'Artificial Intelligence & ML',
        'Data Science',
        'Mechanical Engineering',
        'Civil Engineering',
      ],
      description: 'Bachelor of Technology / Bachelor of Engineering degree program.',
      order: 1,
    },
    {
      name: 'BCA',
      category: 'Undergraduate',
      specializations: ['General Computer Applications', 'Cloud & Security', 'Data Analytics', 'Web Development'],
      description: 'Bachelor of Computer Applications degree program.',
      order: 2,
    },
    {
      name: 'MCA',
      category: 'Postgraduate',
      specializations: ['Software Engineering', 'Data Science & Analytics', 'Full Stack Development', 'Cybersecurity'],
      description: 'Master of Computer Applications degree program.',
      order: 3,
    },
    {
      name: 'B.Sc (IT / CS)',
      category: 'Undergraduate',
      specializations: ['Computer Science', 'Information Technology', 'Applied Statistics', 'Electronics'],
      description: 'Bachelor of Science in Information Technology or Computer Science.',
      order: 4,
    },
    {
      name: 'MBA',
      category: 'Postgraduate',
      specializations: ['Business Analytics', 'Information Systems', 'Operations', 'Finance & Analytics', 'Marketing'],
      description: 'Master of Business Administration degree program.',
      order: 5,
    },
    {
      name: 'M.Tech',
      category: 'Postgraduate',
      specializations: ['Computer Science & Engineering', 'Data Science & AI', 'Software Systems', 'VLSI & Embedded'],
      description: 'Master of Technology postgraduate engineering program.',
      order: 6,
    },
  ];

  for (const item of educationData) {
    await Education.findOneAndUpdate(
      { name: item.name },
      { ...item, createdBy: adminUser._id, updatedBy: adminUser._id },
      { upsert: true, new: true }
    );
  }
  console.log(`✓ Seeded ${educationData.length} master education degrees.`);

  // 3. Seed Target Roles
  const targetRolesData = [
    {
      name: 'Data Analyst',
      category: 'Data & Analytics',
      description: 'Extracts, cleans, analyzes, and visualizes complex business datasets to drive data-informed decisions.',
      order: 1,
    },
    {
      name: 'Full Stack Developer',
      category: 'Software Engineering',
      description: 'Designs and develops client-side and server-side web applications end-to-end.',
      order: 2,
    },
    {
      name: 'Frontend Developer',
      category: 'Software Engineering',
      description: 'Crafts intuitive, performant, and responsive browser user interfaces with modern frameworks.',
      order: 3,
    },
    {
      name: 'Backend Developer',
      category: 'Software Engineering',
      description: 'Architects robust server APIs, microservices, databases, authentication, and caching systems.',
      order: 4,
    },
    {
      name: 'AI / ML Engineer',
      category: 'Artificial Intelligence',
      description: 'Builds, trains, and deploys predictive machine learning and generative AI models.',
      order: 5,
    },
    {
      name: 'Cloud / DevOps Engineer',
      category: 'Infrastructure',
      description: 'Automates CI/CD deployment pipelines, containerization, cloud infrastructure, and monitoring.',
      order: 6,
    },
  ];

  for (const item of targetRolesData) {
    await TargetRole.findOneAndUpdate(
      { name: item.name },
      { ...item, createdBy: adminUser._id, updatedBy: adminUser._id },
      { upsert: true, new: true }
    );
  }
  console.log(`✓ Seeded ${targetRolesData.length} master target roles.`);

  // 4. Seed Canonical Skills
  const skillsData = [
    { name: 'SQL', category: 'Database', description: 'Relational database queries, joins, aggregations, and window functions.' },
    { name: 'Python', category: 'Programming', description: 'General-purpose programming, data manipulation (Pandas), scripting, and automation.' },
    { name: 'Excel', category: 'Data Analysis', description: 'Spreadsheet modeling, dynamic array formulas, XLOOKUP, and pivot tables.' },
    { name: 'PowerBI/Tableau', category: 'Data Visualization', description: 'Business intelligence dashboards, DAX calculations, and interactive reporting.' },
    { name: 'Statistics', category: 'Data Science', description: 'Descriptive & inferential statistics, probability distributions, hypothesis testing, and metrics.' },
    { name: 'Data Cleaning', category: 'Data Analysis', description: 'Handling missing values, deduplication, type casting, and anomaly filtering in datasets.' },
    { name: 'Reporting', category: 'Business Intelligence', description: 'Translating quantitative insights into executive KPI summaries and operational recommendations.' },
    { name: 'React', category: 'Frontend', description: 'Component lifecycle, hooks, state management, and virtual DOM optimization.' },
    { name: 'Node.js', category: 'Backend', description: 'Asynchronous event loop, server-side runtime, streams, and non-blocking I/O.' },
    { name: 'JavaScript', category: 'Programming', description: 'ES6+ closures, async/await, prototype chain, and event bubbling.' },
    { name: 'TypeScript', category: 'Frontend', description: 'Static typing, interfaces, generics, and compiler enforcement for JavaScript.' },
    { name: 'HTML/CSS', category: 'Frontend', description: 'Semantic markup, responsive layouts, flexbox, grid, and Core Web Vitals.' },
    { name: 'Tailwind CSS', category: 'Frontend', description: 'Utility-first CSS framework for rapid responsive UI development.' },
    { name: 'MongoDB', category: 'Database', description: 'NoSQL document database, aggregation pipelines, schema embedding vs referencing, and indexing.' },
    { name: 'Docker', category: 'DevOps', description: 'Containerization, Dockerfile multi-stage builds, images, and container networking.' },
    { name: 'Testing', category: 'Quality Assurance', description: 'Unit and integration testing with Jest, Supertest, and automated assertions.' },
    { name: 'Git', category: 'DevOps', description: 'Version control workflows, branching strategies, merge conflicts, and pull requests.' },
    { name: 'Express.js', category: 'Backend', description: 'Web middleware pipelines, RESTful routing, and centralized error handling.' },
    { name: 'REST APIs', category: 'Backend', description: 'Stateless HTTP API design, verbs, status codes, and idempotency principles.' },
    { name: 'Authentication', category: 'Security', description: 'JWT tokens, refresh token rotation, secure cookie handling, and bcrypt hashing.' },
    { name: 'System Design', category: 'Architecture', description: 'Scalable backend architectures, caching with Redis, rate limiting, and database sharding.' },
  ];

  for (const item of skillsData) {
    const canonicalName = normalizeSkillName(item.name).toLowerCase();
    await Skill.findOneAndUpdate(
      { canonicalName },
      { ...item, canonicalName, createdBy: adminUser._id, updatedBy: adminUser._id },
      { upsert: true, new: true }
    );
  }
  console.log(`✓ Seeded ${skillsData.length} master skills.`);

  // 5. Seed Role -> Skill Mappings
  const roleSkillMapEntries = [
    // Data Analyst
    { roleName: 'Data Analyst', skillName: 'SQL', priority: 'High', requiredLevel: 'Advanced', reason: 'Essential for querying relational databases and complex aggregations.' },
    { roleName: 'Data Analyst', skillName: 'Python', priority: 'High', requiredLevel: 'Intermediate', reason: 'Required for Pandas data manipulation and automation.' },
    { roleName: 'Data Analyst', skillName: 'Excel', priority: 'High', requiredLevel: 'Advanced', reason: 'Industry standard for financial modeling and quick analysis.' },
    { roleName: 'Data Analyst', skillName: 'PowerBI/Tableau', priority: 'High', requiredLevel: 'Intermediate', reason: 'Crucial for executive visual dashboards and DAX measures.' },
    { roleName: 'Data Analyst', skillName: 'Statistics', priority: 'Medium', requiredLevel: 'Intermediate', reason: 'Fundamental for outlier detection, skewness, and hypothesis tests.' },
    { roleName: 'Data Analyst', skillName: 'Data Cleaning', priority: 'High', requiredLevel: 'Advanced', reason: '80% of analyst workflow involves data cleansing and validation.' },
    { roleName: 'Data Analyst', skillName: 'Reporting', priority: 'Medium', requiredLevel: 'Intermediate', reason: 'Communicates quantitative findings to non-technical stakeholders.' },

    // Full Stack Developer
    { roleName: 'Full Stack Developer', skillName: 'React', priority: 'High', requiredLevel: 'Advanced', reason: 'Standard UI framework for modern interactive web applications.' },
    { roleName: 'Full Stack Developer', skillName: 'Node.js', priority: 'High', requiredLevel: 'Advanced', reason: 'Server-side runtime for high-throughput APIs.' },
    { roleName: 'Full Stack Developer', skillName: 'JavaScript', priority: 'High', requiredLevel: 'Advanced', reason: 'Core programming language across browser and backend.' },
    { roleName: 'Full Stack Developer', skillName: 'HTML/CSS', priority: 'High', requiredLevel: 'Intermediate', reason: 'Foundation for accessible and responsive interfaces.' },
    { roleName: 'Full Stack Developer', skillName: 'MongoDB', priority: 'Medium', requiredLevel: 'Intermediate', reason: 'Document database for flexible JSON schemas.' },
    { roleName: 'Full Stack Developer', skillName: 'SQL', priority: 'Medium', requiredLevel: 'Intermediate', reason: 'Relational data querying and transactions.' },
    { roleName: 'Full Stack Developer', skillName: 'Git', priority: 'High', requiredLevel: 'Intermediate', reason: 'Version control and team collaboration.' },
    { roleName: 'Full Stack Developer', skillName: 'Docker', priority: 'Medium', requiredLevel: 'Intermediate', reason: 'Containerization for consistent deployments.' },
    { roleName: 'Full Stack Developer', skillName: 'Testing', priority: 'Medium', requiredLevel: 'Intermediate', reason: 'Unit and integration test suites for code reliability.' },

    // Frontend Developer
    { roleName: 'Frontend Developer', skillName: 'React', priority: 'High', requiredLevel: 'Advanced', reason: 'Primary UI framework for enterprise SPAs.' },
    { roleName: 'Frontend Developer', skillName: 'JavaScript', priority: 'High', requiredLevel: 'Advanced', reason: 'Core client-side execution language.' },
    { roleName: 'Frontend Developer', skillName: 'HTML/CSS', priority: 'High', requiredLevel: 'Advanced', reason: 'Semantic browser markup and modern styling.' },
    { roleName: 'Frontend Developer', skillName: 'Tailwind CSS', priority: 'High', requiredLevel: 'Intermediate', reason: 'Utility CSS framework for modern design systems.' },
    { roleName: 'Frontend Developer', skillName: 'TypeScript', priority: 'High', requiredLevel: 'Intermediate', reason: 'Type safety and compile-time contract enforcement.' },
    { roleName: 'Frontend Developer', skillName: 'Git', priority: 'High', requiredLevel: 'Intermediate', reason: 'Code versioning and PR reviews.' },

    // Backend Developer
    { roleName: 'Backend Developer', skillName: 'Node.js', priority: 'High', requiredLevel: 'Advanced', reason: 'High-performance asynchronous server runtime.' },
    { roleName: 'Backend Developer', skillName: 'Express.js', priority: 'High', requiredLevel: 'Advanced', reason: 'API routing and middleware pipelines.' },
    { roleName: 'Backend Developer', skillName: 'SQL', priority: 'High', requiredLevel: 'Advanced', reason: 'ACID transactions, schema normalization, and indexing.' },
    { roleName: 'Backend Developer', skillName: 'MongoDB', priority: 'High', requiredLevel: 'Intermediate', reason: 'NoSQL document storage and aggregation queries.' },
    { roleName: 'Backend Developer', skillName: 'REST APIs', priority: 'High', requiredLevel: 'Advanced', reason: 'Stateless API architecture and standard HTTP codes.' },
    { roleName: 'Backend Developer', skillName: 'Authentication', priority: 'High', requiredLevel: 'Advanced', reason: 'JWT access/refresh tokens and password hashing security.' },
    { roleName: 'Backend Developer', skillName: 'Docker', priority: 'Medium', requiredLevel: 'Intermediate', reason: 'Containerizing backend services.' },
    { roleName: 'Backend Developer', skillName: 'System Design', priority: 'High', requiredLevel: 'Intermediate', reason: 'Redis caching, rate limiting, and distributed services.' },
  ];

  for (const item of roleSkillMapEntries) {
    await RoleSkillMapping.findOneAndUpdate(
      { roleName: item.roleName, skillName: item.skillName },
      { ...item, createdBy: adminUser._id, updatedBy: adminUser._id },
      { upsert: true, new: true }
    );
  }
  console.log(`✓ Seeded ${roleSkillMapEntries.length} role-to-skill mappings.`);

  // 6. Seed Interview Questions from ROLE_SKILL_QUESTIONS
  let questionCount = 0;
  for (const [roleName, qList] of Object.entries(ROLE_SKILL_QUESTIONS)) {
    for (const q of qList) {
      await InterviewQuestion.findOneAndUpdate(
        { questionText: q.text },
        {
          questionText: q.text,
          role: roleName,
          skill: normalizeSkillName(q.skill),
          difficulty: q.difficulty || 'Medium',
          type: 'Technical',
          expectedRubric: q.expectedRubric,
          evaluationGuidance: `Candidate should explain ${q.skill} mechanisms clearly with practical examples.`,
          isActive: true,
          createdBy: adminUser._id,
          updatedBy: adminUser._id,
        },
        { upsert: true, new: true }
      );
      questionCount++;
    }
  }
  console.log(`✓ Seeded ${questionCount} master interview questions with expected rubrics.`);

  // 7. Seed Learning Resources
  const learningResources = [
    { title: 'Complete SQL Mastery for Data Analysts', skill: 'SQL', resourceType: 'Course', difficulty: 'Beginner', platform: 'DishaSetu Learning', url: 'https://dishasetu.ai/learn/sql', estimatedDuration: '6 hours' },
    { title: 'Advanced Window Functions & Query Optimization', skill: 'SQL', resourceType: 'Article', difficulty: 'Advanced', platform: 'DishaSetu Engineering', url: 'https://dishasetu.ai/articles/sql-window-functions', estimatedDuration: '45 mins' },
    { title: 'Python Pandas Data Wrangling Bootcamp', skill: 'Python', resourceType: 'Course', difficulty: 'Intermediate', platform: 'DishaSetu Learning', url: 'https://dishasetu.ai/learn/python-pandas', estimatedDuration: '8 hours' },
    { title: 'Excel Dynamic Arrays, XLOOKUP & Financial Modeling', skill: 'Excel', resourceType: 'Video', difficulty: 'Intermediate', platform: 'DishaSetu Studio', url: 'https://dishasetu.ai/videos/excel-mastery', estimatedDuration: '2 hours' },
    { title: 'PowerBI DAX Time-Intelligence & Dashboard Architecture', skill: 'PowerBI/Tableau', resourceType: 'Project', difficulty: 'Intermediate', platform: 'DishaSetu Projects', url: 'https://dishasetu.ai/projects/powerbi-dax', estimatedDuration: '4 hours' },
    { title: 'Statistics for Machine Learning & Business Intelligence', skill: 'Statistics', resourceType: 'Course', difficulty: 'Beginner', platform: 'DishaSetu Learning', url: 'https://dishasetu.ai/learn/statistics', estimatedDuration: '5 hours' },
    { title: 'React 18 Architecture, Hooks & State Optimization', skill: 'React', resourceType: 'Course', difficulty: 'Intermediate', platform: 'DishaSetu Learning', url: 'https://dishasetu.ai/learn/react', estimatedDuration: '10 hours' },
    { title: 'Node.js Event Loop, Streams & Asynchronous I/O', skill: 'Node.js', resourceType: 'Documentation', difficulty: 'Advanced', platform: 'Node.js Official', url: 'https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick', estimatedDuration: '1 hour' },
  ];

  for (const item of learningResources) {
    await LearningResource.findOneAndUpdate(
      { title: item.title },
      { ...item, createdBy: adminUser._id, updatedBy: adminUser._id },
      { upsert: true, new: true }
    );
  }
  console.log(`✓ Seeded ${learningResources.length} learning resources.`);

  // 8. Seed Default Platform Settings
  const defaultSettings = [
    { key: 'platformName', value: 'DishaSetu AI', category: 'general', description: 'Official name of the platform.' },
    { key: 'platformTagline', value: 'Bridging Campus to Career with AI', category: 'general', description: 'Platform tagline displayed on hero sections.' },
    { key: 'maxInterviewQuestions', value: 5, category: 'interview', description: 'Number of structured questions generated per interview session.' },
    { key: 'minimumPassingScore', value: 60, category: 'assessment', description: 'Minimum score threshold required for skill mastery evidence.' },
    { key: 'supportEmail', value: 'support@dishasetu.ai', category: 'contact', description: 'Primary administrator support email.' },
  ];

  for (const s of defaultSettings) {
    await PlatformSetting.findOneAndUpdate(
      { key: s.key },
      { ...s, updatedBy: adminUser._id },
      { upsert: true, new: true }
    );
  }
  console.log(`✓ Seeded ${defaultSettings.length} platform settings.`);

  console.log('\n================================================================');
  console.log('ADMIN & MASTER DATA SEEDING COMPLETE');
  console.log(`Admin Login Email: ${adminEmail}`);
  console.log('================================================================\n');
}

// If run directly via node CLI
if (process.argv[1]?.endsWith('seed_admin_and_master_data.js')) {
  seedAdminAndMasterData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed script error:', err);
      process.exit(1);
    });
}
