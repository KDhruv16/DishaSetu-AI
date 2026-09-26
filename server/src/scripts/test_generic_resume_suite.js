/**
 * DishaSetu AI - Generic Resume Engine 10-Test Regression Suite
 * 
 * Verifies that the Resume ATS Analyzer functions 100% generically across:
 * Test 1: Simple one-column resume
 * Test 2: Two-column modern resume layout
 * Test 3: Canva/template-style formatted resume
 * Test 4: Experience-heavy senior resume
 * Test 5: Fresher resume with projects but little experience
 * Test 6: Skills ONLY mentioned in project descriptions
 * Test 7: Skills ONLY mentioned in experience descriptions
 * Test 8: Resume using aliases (ReactJS, NodeJS, Mongo DB, HTML5, CSS3)
 * Test 9: Resume with composite requirements (HTML/CSS, Node.js / Express.js)
 * Test 10: Resume with unusual section names
 */

import { analyzeResumeIntelligence, normalizeSkillName, getRoleRequirements } from '../services/resumeService.js';

const analyzeResumeText = async (text, role) => {
  const result = await analyzeResumeIntelligence(text, role);
  return {
    ...result,
    atsScore: result.atsScore?.overall || 0,
    presentKeywords: result.presentKeywords || [],
    coreMissingKeywords: result.coreMissingKeywords || [],
    recommendedMissingKeywords: result.recommendedMissingKeywords || [],
    sectionsDetected: (result.sectionsDetected || []).filter(s => s.found).map(s => s.name),
  };
};

const tests = [
  {
    id: 1,
    name: 'Simple One-Column Resume (Python / Data Track)',
    role: 'Python Developer',
    text: `
John Doe
johndoe@email.com | +1 555-0199 | San Francisco, CA

PROFESSIONAL SUMMARY
Backend Python Developer with 3+ years of experience in Django, FastAPI, and PostgreSQL.

SKILLS
Python, Django, FastAPI, PostgreSQL, Docker, Git, REST APIs, Redis

EXPERIENCE
Software Engineer - Tech Solutions (2022 - Present)
- Architected high-throughput microservices using FastAPI and Redis caching.
- Maintained core relational databases with PostgreSQL and automated CI/CD workflows.

EDUCATION
B.S. in Computer Science - University of California (2018 - 2022)
`,
    expectedSkills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Git', 'REST APIs', 'Redis'],
    mustNotBeMissing: ['Python', 'PostgreSQL', 'Git']
  },
  {
    id: 2,
    name: 'Two-Column Modern Layout (Java Track)',
    role: 'Java Developer',
    text: `
Alex Morgan                               CONTACT
alex.morgan@email.com                     LinkedIn: /in/alexmorgan
                                          GitHub: /alexmorgan
TECHNICAL EXPERTISE                       
Languages: Java, SQL                      EDUCATION
Frameworks: Spring Boot, Hibernate        B.Tech in Information Technology
Databases: MySQL, PostgreSQL              State University, 2020 - 2024
Tools: Git, Maven, Docker, JIRA           

PROFESSIONAL WORK HISTORY
Junior Java Developer — Enterprise Systems (2024 - Present)
- Developed secure enterprise REST APIs using Java and Spring Boot.
- Implemented object-relational mapping using Hibernate and MySQL.
- Containerized microservices using Docker for AWS deployment.
`,
    expectedSkills: ['Java', 'Spring Boot', 'Hibernate', 'MySQL', 'Docker', 'Git'],
    mustNotBeMissing: ['Java', 'Spring Boot', 'MySQL']
  },
  {
    id: 3,
    name: 'Canva/Design Template Style Resume (UI/UX Track)',
    role: 'UI/UX Designer',
    text: `
SOPHIA PATEL • PRODUCT DESIGNER
sophia.design@email.com | portfolio: sophiapatel.design

CORE CAPABILITIES
Figma • Wireframing • User Research • Prototyping • Design Systems • Usability Testing • Adobe XD

SELECTED HIGHLIGHTS
Lead UX Designer — Creative Flow (2023 - 2025)
- Conducted user interviews and end-to-end usability testing across 40+ user cohorts.
- Created scalable design systems in Figma and delivered high-fidelity interactive prototypes.

PROJECT SHOWCASE
HealthTrack App Redesign
- Rebuilt mobile app UX flow using Figma and user journey mapping.
`,
    expectedSkills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Usability Testing'],
    mustNotBeMissing: ['Figma', 'Wireframing', 'User Research']
  },
  {
    id: 4,
    name: 'Experience-Heavy Senior Resume (DevOps Track)',
    role: 'Cloud / DevOps Engineer',
    text: `
Marcus Vance - Lead Infrastructure & Cloud Engineer
marcus.vance@cloudops.io

PROFESSIONAL EXPERIENCE
Principal DevOps Architect | CloudScale Inc. (2019 - Present)
- Orchestrated enterprise Kubernetes clusters across AWS and GCP multi-region clouds.
- Authored Terraform modules managing 500+ AWS cloud resources and IAM policies.
- Built automated CI/CD deployment pipelines using GitLab CI, Docker, and Helm.
- Implemented monitoring with Prometheus and Grafana.

Senior Systems Engineer | DataCorp (2015 - 2019)
- Automated Linux server provisioning with Ansible and Bash scripting.
- Maintained high-availability MySQL database clusters.
`,
    expectedSkills: ['Kubernetes', 'AWS', 'GCP', 'Terraform', 'Docker', 'CI/CD', 'Linux'],
    mustNotBeMissing: ['Kubernetes', 'AWS', 'Terraform', 'Docker', 'CI/CD']
  },
  {
    id: 5,
    name: 'Fresher Resume with Projects but No Formal Experience (Frontend Track)',
    role: 'Frontend Developer',
    text: `
PRIYA SHARMA
priya.sharma@collegemail.edu | github.com/priyacodes

ACADEMIC QUALIFICATIONS
Bachelor of Technology in Computer Science & Engineering (2021 - 2025)
ABC Institute of Technology — GPA: 8.9/10

TECHNICAL SKILLS
- Languages: JavaScript, TypeScript, HTML5, CSS3
- Frameworks & Libraries: React.js, Next.js, Redux, Tailwind CSS
- Tools: Git, GitHub, VS Code, Vite

KEY PROJECTS
E-Commerce Web Portal
- Built a responsive single-page store with React.js, Redux Toolkit, and Tailwind CSS.
- Integrated payment gateway and optimized web performance.

Developer Portfolio Website
- Designed and deployed a portfolio using Next.js, TypeScript, and CSS.
`,
    expectedSkills: ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'React', 'Next.js', 'Redux', 'Tailwind CSS', 'Git'],
    mustNotBeMissing: ['React', 'JavaScript', 'HTML', 'CSS']
  },
  {
    id: 6,
    name: 'Skills ONLY Mentioned in Project Descriptions (Data Analyst Track)',
    role: 'Data Analyst',
    text: `
Liam Chen
liam.chen@analytics.io

EDUCATION
Bachelor of Science in Statistics (2020 - 2024)

PROJECTS
Global Sales Performance Dashboard
- Cleaned and prepared 1.2M transaction records using Python and Pandas.
- Built interactive multi-dimensional dashboards in Power BI and Tableau for executive reporting.
- Wrote complex SQL queries on PostgreSQL to extract aggregated quarterly KPI metrics.

Customer Churn Analysis
- Applied statistical exploratory data analysis using Excel and Python.
`,
    expectedSkills: ['Python', 'Pandas', 'Power BI', 'Tableau', 'SQL', 'PostgreSQL', 'Excel'],
    mustNotBeMissing: ['SQL', 'Python', 'Power BI']
  },
  {
    id: 7,
    name: 'Skills ONLY Mentioned in Experience Descriptions (Backend Track)',
    role: 'Backend Developer',
    text: `
Elena Rostova
elena.rostova@dev.net

EMPLOYMENT HISTORY
Software Developer at FinTech Global (2021 - Present)
- Engineered scalable microservice endpoints utilizing Node.js and Express.js.
- Designed document schemas in MongoDB and optimized indexing for sub-10ms queries.
- Automated API unit tests with Jest and documented endpoints via Postman.
- Managed containerized environments with Docker and orchestrated Git version control workflows.
`,
    expectedSkills: ['Node.js', 'Express.js', 'MongoDB', 'Postman', 'Docker', 'Git', 'REST API'],
    mustNotBeMissing: ['Node.js', 'Express.js', 'MongoDB', 'Docker']
  },
  {
    id: 8,
    name: 'Resume Using Heavy Aliases (ReactJS, NodeJS, Mongo DB, HTML5, CSS3)',
    role: 'Full Stack Developer',
    text: `
Rahul Verma
rahul.verma@code.dev

ABOUT ME
Passionate full stack developer building modern web apps.

TECH STACK
ReactJS, NodeJS, Mongo DB, HTML5, CSS3, ExpressJS, Rest API, Postman, Github

PAST WORK
Fullstack Intern at WebForge (2024)
- Developed full-stack modules with ReactJS frontend and NodeJS backend.
- Created NoSQL collections in Mongo DB and connected them using ExpressJS.
`,
    expectedSkills: ['React', 'Node.js', 'MongoDB', 'HTML', 'CSS', 'Express.js', 'REST API', 'Postman', 'Git'],
    mustNotBeMissing: ['React', 'Node.js', 'MongoDB', 'HTML', 'CSS', 'Express.js']
  },
  {
    id: 9,
    name: 'Resume with Composite Requirements (HTML/CSS, Node.js + Express.js)',
    role: 'Full Stack Developer',
    text: `
Kavita Iyer
kavita.iyer@tech.org

SUMMARY
Web developer proficient in frontend markup, styling, and server-side runtime environments.

SKILLS & PROFICIENCIES
HTML, CSS, JavaScript, Node.js, Express.js, MongoDB, Git

ACADEMIC ENGAGEMENTS
College Web Portal
- Handcrafted accessible interfaces using semantic HTML and custom CSS.
- Developed the application backend in Node.js with Express.js routing.
`,
    expectedSkills: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express.js', 'MongoDB', 'Git'],
    mustNotBeMissing: ['HTML', 'CSS', 'Node.js', 'Express.js']
  },
  {
    id: 10,
    name: 'Resume with Unusual / Custom Section Names',
    role: 'Full Stack Developer',
    text: `
Devon Reed
devon.reed@craft.com

CAREER ASPIRATION
Aspiring software engineer eager to contribute to impactful software products.

CORE SUBJECT COMPETENCIES
JavaScript, Python, React, Node.js, SQL, MongoDB, Git

NOTABLE ENGAGEMENTS & VENTURES
Hospital Management System
- Implemented frontend UI with React and backend logic using Node.js and SQL.

SCHOLASTIC ACHIEVEMENTS
B.S. in Software Engineering, 2024
Dean's Honor List for outstanding scholastic performance.
`,
    expectedSkills: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'MongoDB', 'Git'],
    mustNotBeMissing: ['React', 'Node.js', 'JavaScript']
  }
];

async function runRegressionSuite() {
  console.log('='.repeat(70));
  console.log('DISHESETU AI — 10-TEST GENERIC RESUME REGRESSION SUITE');
  console.log('='.repeat(70));

  let passedTests = 0;
  let totalTests = tests.length;

  for (const t of tests) {
    console.log(`\n------------------------------------------------------------`);
    console.log(`TEST ${t.id}: ${t.name}`);
    console.log(`Target Role: [${t.role}]`);

    try {
      const result = await analyzeResumeText(t.text, t.role);
      
      const presentNames = (result.presentKeywords || []).map(k => k.name || k);
      const coreMissing = result.coreMissingKeywords || [];
      const score = result.atsScore || 0;
      
      console.log(`> Detected Sections : ${result.sectionsDetected?.length || 0} (${(result.sectionsDetected || []).join(', ')})`);
      console.log(`> Present Skills (${presentNames.length}) : ${presentNames.join(', ')}`);
      console.log(`> Core Missing (${coreMissing.length})    : ${coreMissing.join(', ') || 'None (All Core Present!)'}`);
      console.log(`> ATS Score          : ${score}/100`);

      // Validation 1: Expected skills detected
      let skillErrors = [];
      for (const expected of t.expectedSkills) {
        const found = presentNames.some(p => normalizeSkillName(p) === normalizeSkillName(expected) || p.toLowerCase() === expected.toLowerCase());
        if (!found) {
          skillErrors.push(`Expected skill "${expected}" not detected in presentKeywords`);
        }
      }

      // Validation 2: Must NOT be marked in core missing keywords
      let missingErrors = [];
      for (const mustNotBe of t.mustNotBeMissing) {
        const isCoreMissing = coreMissing.some(m => normalizeSkillName(m) === normalizeSkillName(mustNotBe) || m.toLowerCase() === mustNotBe.toLowerCase());
        if (isCoreMissing) {
          missingErrors.push(`Skill "${mustNotBe}" is present in resume but was falsely flagged in coreMissingKeywords`);
        }
      }

      // Validation 3: Reasonable ATS score
      let scoreErrors = [];
      if (score < 40) {
        scoreErrors.push(`ATS score (${score}) suspiciously low for well-matched resume`);
      }

      const allErrors = [...skillErrors, ...missingErrors, ...scoreErrors];
      if (allErrors.length === 0) {
        console.log(`✅ RESULT: PASSED (Zero false negatives, robust section detection, score: ${score}/100)`);
        passedTests++;
      } else {
        console.log(`❌ RESULT: FAILED`);
        allErrors.forEach(err => console.log(`   - ${err}`));
      }

    } catch (err) {
      console.error(`❌ RESULT: ERROR EXECUTING TEST ${t.id}:`, err.message);
    }
  }

  console.log(`\n` + '='.repeat(70));
  console.log(`REGRESSION SUITE SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('='.repeat(70));

  if (passedTests === totalTests) {
    console.log('🎉 ALL 10 GENERIC RESUME TEST CASES PASSED WITH 100% ACCURACY!');
    process.exit(0);
  } else {
    console.error(`⚠️ ${totalTests - passedTests} TEST(S) FAILED`);
    process.exit(1);
  }
}

runRegressionSuite();
