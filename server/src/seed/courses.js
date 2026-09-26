import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';

dotenv.config();

export const seedCoursesData = [
  {
    title: 'Cloud Computing & Containerization (Docker Fundamentals)',
    provider: 'NPTEL',
    skill: 'Docker',
    level: 'Beginner',
    type: 'Certification',
    isFree: true,
    duration: '4 Weeks',
    description:
      'Official IIT Kharagpur/NPTEL course covering virtualization, container architectures, Dockerfile creation, multi-container orchestration, and container networking.',
    url: 'https://nptel.ac.in/courses/106105167',
    source: 'SWAYAM / NPTEL India',
    certificateAvailable: true,
  },
  {
    title: 'Docker & Docker Compose Full Crash Course',
    provider: 'FreeCodeCamp',
    skill: 'Docker',
    level: 'Beginner',
    type: 'Tutorial',
    isFree: true,
    duration: '3 Hours',
    description:
      'Complete practical walkthrough on containerizing Node.js, Python, and React applications with Docker Compose and volume management.',
    url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo',
    source: 'FreeCodeCamp Open Learning',
    certificateAvailable: false,
  },
  {
    title: 'Automated Software Testing & API Validation',
    provider: 'SWAYAM',
    skill: 'Testing',
    level: 'Intermediate',
    type: 'Course',
    isFree: true,
    duration: '4 Weeks',
    description:
      'Covers unit testing, integration testing, test-driven development (TDD), mocking HTTP endpoints, and Jest testing best practices.',
    url: 'https://swayam.gov.in/explorer?category=COMP_SCI_ENGG',
    source: 'Ministry of Education SWAYAM Portal',
    certificateAvailable: true,
  },
  {
    title: 'JavaScript & Node.js Testing with Jest & Supertest',
    provider: 'YouTube',
    skill: 'Testing',
    level: 'Beginner',
    type: 'Tutorial',
    isFree: true,
    duration: '2.5 Hours',
    description:
      'Learn how to write unit tests for Express REST APIs, test async controllers, and verify MongoDB operations with in-memory databases.',
    url: 'https://www.youtube.com/results?search_query=jest+supertest+nodejs+tutorial',
    source: 'Open Developer Community',
    certificateAvailable: false,
  },
  {
    title: 'Database Management Systems & Relational SQL',
    provider: 'NPTEL',
    skill: 'SQL',
    level: 'Beginner',
    type: 'Certification',
    isFree: true,
    duration: '8 Weeks',
    description:
      'Comprehensive university course by IIT Madras on relational algebra, SQL querying, complex JOINs, indexing strategies, and database normalization.',
    url: 'https://nptel.ac.in/courses/106106093',
    source: 'NPTEL / IIT Madras',
    certificateAvailable: true,
  },
  {
    title: 'Relational Database & Advanced SQL Certification',
    provider: 'FreeCodeCamp',
    skill: 'SQL',
    level: 'Intermediate',
    type: 'Certification',
    isFree: true,
    duration: '20 Hours',
    description:
      'Interactive coding course on PostgreSQL, schema migrations, complex subqueries, window functions, and database design.',
    url: 'https://www.freecodecamp.org/learn/relational-database/',
    source: 'FreeCodeCamp Curriculum',
    certificateAvailable: true,
  },
  {
    title: 'Python for Data Science and Applied Analytics',
    provider: 'NPTEL',
    skill: 'Python',
    level: 'Beginner',
    type: 'Certification',
    isFree: true,
    duration: '4 Weeks',
    description:
      'Learn data manipulation with NumPy, Pandas dataframe operations, descriptive statistics, and exploratory data visualization.',
    url: 'https://nptel.ac.in/courses/106106212',
    source: 'NPTEL / IIT Madras',
    certificateAvailable: true,
  },
  {
    title: 'Microsoft Power BI Data Analyst Certification Track',
    provider: 'Microsoft Learn',
    skill: 'Power BI',
    level: 'Beginner',
    type: 'Track',
    isFree: true,
    duration: '6 Modules',
    description:
      'Official Microsoft guided track to prepare datasets, write DAX calculations, model relationships, and build executive reporting dashboards.',
    url: 'https://learn.microsoft.com/en-us/training/paths/data-analytics-microsoft/',
    source: 'Microsoft Learn Official',
    certificateAvailable: true,
  },
  {
    title: 'Full Stack Web Development with Node.js & React',
    provider: 'Skill India',
    skill: 'Node.js',
    level: 'Beginner',
    type: 'Course',
    isFree: true,
    duration: '6 Weeks',
    description:
      'Government accredited skill training module covering RESTful backend services, asynchronous programming, JWT security, and React integration.',
    url: 'https://www.skillindiadigital.gov.in',
    source: 'Skill India Digital Hub',
    certificateAvailable: true,
  },
  {
    title: 'Git & GitHub Collaboration Workflow for Developers',
    provider: 'YouTube',
    skill: 'Git',
    level: 'Beginner',
    type: 'Tutorial',
    isFree: true,
    duration: '1.5 Hours',
    description:
      'Master Git branching, pull requests, resolving merge conflicts, and setting up automated GitHub Actions CI/CD workflows.',
    url: 'https://www.youtube.com/results?search_query=git+github+crash+course',
    source: 'Tech Dev Community',
    certificateAvailable: false,
  },
  {
    title: 'Cloud Practitioner Foundations (AWS & Azure Basics)',
    provider: 'SWAYAM',
    skill: 'Cloud',
    level: 'Beginner',
    type: 'Course',
    isFree: true,
    duration: '4 Weeks',
    description:
      'Foundational concepts in cloud architecture, virtual private clouds, cloud storage, serverless compute, and security compliance.',
    url: 'https://swayam.gov.in/explorer?category=COMP_SCI_ENGG',
    source: 'SWAYAM Central Portal',
    certificateAvailable: true,
  },
];

export const seedCourses = async () => {
  try {
    const count = await Course.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding initial curated courses & certifications...');
      await Course.insertMany(seedCoursesData);
      console.log(`✅ Successfully seeded ${seedCoursesData.length} curated courses!`);
    } else {
      console.log(`ℹ️ Courses collection already has ${count} records. Skipping initial seed.`);
    }
  } catch (error) {
    console.error('❌ Error during courses seeding:', error);
  }
};

// Standalone execution script: `node src/seed/courses.js`
if (process.argv[1]?.includes('courses.js')) {
  mongoose
    .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dishasetu')
    .then(async () => {
      console.log('🔗 Connected to MongoDB for courses seeding...');
      await Course.deleteMany({});
      await Course.insertMany(seedCoursesData);
      console.log(`✨ Re-seeded ${seedCoursesData.length} courses successfully!`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Course seeder connection error:', err);
      process.exit(1);
    });
}
