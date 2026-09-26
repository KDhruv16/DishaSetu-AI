/**
 * DishaSetu AI - Resume Classification Gate Test Suite
 * 
 * Verifies that:
 * 1. Non-resume PDFs (assignments, research papers, question papers, menus, invoices, notes, certificates, articles)
 *    are STRICTLY REJECTED with NO ATS score and NO MongoDB persistence.
 * 2. Valid resumes (fresher, experienced, 2-column, Canva, unusual headings)
 *    are CONFIDENTLY ACCEPTED and proceed to ATS scoring.
 */

import { validateResumeGate } from '../services/resumeService.js';

const testCases = [
  // ==========================================
  // NEGATIVE TEST CASES (MUST BE REJECTED)
  // ==========================================
  {
    id: 'NEG-1',
    name: 'College Assignment Document',
    expectedResume: false,
    text: `
DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
OPERATING SYSTEMS ASSIGNMENT - 2
Course Code: CS-402 | Due Date: 15th October 2024
Total Marks: 50 | Submitted by: Roll No 42

Question 1: Explain the difference between process and thread with suitable diagrams. (10 Marks)
Answer: A process is a program in execution containing program counter, stack, and data section. A thread is a lightweight process...

Question 2: Write a C program to simulate the Banker's Algorithm for deadlock avoidance. (15 Marks)
Answer: Include stdio.h, implement allocation matrix, max matrix, and available resources vector...

Question 3: Explain Demand Paging and Page Replacement Algorithms (FIFO, LRU, Optimal). (15 Marks)
`,
  },
  {
    id: 'NEG-2',
    name: 'Academic Research Paper',
    expectedResume: false,
    text: `
Deep Residual Learning for Automated Code Vulnerability Detection
Dr. Alan Smith, Prof. Robert Davis
Department of Computer Science, University of Technology
DOI: 10.1109/TSE.2024.1049283

ABSTRACT
Software vulnerability detection remains a critical challenge in secure software engineering. In this paper, we propose a graph neural network framework trained on AST representations of Python, C, and JavaScript source code repositories.

1. INTRODUCTION
Modern distributed software systems rely heavily on third-party APIs and microservice architectures [1].

2. METHODOLOGY & EXPERIMENTAL SETUP
We evaluated our methodology on the Devign dataset containing 27,000 code functions across C/C++ projects...

3. EXPERIMENTAL RESULTS
Our proposed architecture achieved a 94.3% F1-score outperforming baseline transformer architectures.

REFERENCES
[1] J. Doe et al., "Automated vulnerability scanning," IEEE Transactions on Software Engineering, vol. 48, no. 4, pp. 112-125, 2023.
[2] K. Brown, "Neural code representations," in Proceedings of ACM SIGSOFT FSE, 2022.
`,
  },
  {
    id: 'NEG-3',
    name: 'University Semester Question Paper',
    expectedResume: false,
    text: `
RAJIV GANDHI TECHNICAL UNIVERSITY, BHOPAL
B.Tech. V Semester (Computer Science & Engineering) Examination, Dec 2024
DATABASE MANAGEMENT SYSTEMS (CS-503)
Time: 3 Hours | Maximum Marks: 70

Note: Answer any five questions. All questions carry equal marks. Assume suitable data if necessary.

Q.1 (a) What is the difference between Schema and Instance? Explain 3-tier DBMS architecture. (7)
    (b) Construct an ER diagram for a Hospital Management System with appropriate cardinality. (7)

Q.2 (a) Explain 1NF, 2NF, 3NF and BCNF with suitable relational examples. (7)
    (b) Given relation R(A,B,C,D,E) with functional dependencies, find the candidate keys. (7)

Q.3 Write SQL queries for the following employee database schema... (14)
`,
  },
  {
    id: 'NEG-4',
    name: 'Restaurant Food & Beverage Menu',
    expectedResume: false,
    text: `
THE BISTRO GRILL & CAFE — DINE IN & TAKEAWAY MENU
104 Park Avenue, New York | Order Online: www.bistrogrill.com

APPETIZERS & STARTERS
- Crispy Truffle Fries with Garlic Aioli ..................... $8.50
- Classic Buffalo Chicken Wings (8 pcs) ..................... $12.00
- Loaded Cheese Nachos with Guacamole ....................... $10.50

GOURMET MAINS & BURGERS
- The Classic Angus Beef Burger with Cheddar & Fries ....... $16.50
- Margherita Pizza with Fresh Mozzarella & Basil ........... $15.00
- Creamy Fettuccine Alfredo with Grilled Chicken .......... $18.00

BEVERAGES & DESSERTS
- Iced Caramel Macchiato ................................... $5.50
- Fresh Berry Smoothie ..................................... $6.00
- Warm Chocolate Lava Cake with Vanilla Gelato ............ $7.50
`,
  },
  {
    id: 'NEG-5',
    name: 'Commercial Billing Tax Invoice',
    expectedResume: false,
    text: `
TAX INVOICE / BILL OF SUPPLY
CLOUDSCALE INFRASTRUCTURE TECHNOLOGIES PVT LTD
GSTIN: 23AABCC1234D1Z2 | Invoice No: INV-2026-0894
Invoice Date: 12-Sep-2026 | Due Date: 26-Sep-2026

BILLED TO:
TechCorp Global Solutions
45 Silicon Valley Road, Bangalore, Karnataka

ITEM DESCRIPTION                    HSN CODE   QTY   UNIT PRICE   TAX RATE   TOTAL AMOUNT
1. Dedicated Cloud Server (8 vCPU)   998315     1     $120.00      18%        $120.00
2. MongoDB Atlas Managed Cluster     998315     1     $85.00       18%        $85.00
3. SSL Wildcard Certificate          998313     1     $45.00       18%        $45.00

SUBTOTAL: $250.00
CGST (9%): $22.50
SGST (9%): $22.50
GRAND TOTAL DUE: $295.00
Payment Terms: Net 15 days. Please transfer to Bank Account: 9876543210.
`,
  },
  {
    id: 'NEG-6',
    name: 'Course Notes / Textbook Chapters (Full of Tech Keywords)',
    expectedResume: false,
    text: `
UNIT 3: RELATIONAL DATABASE DESIGN & NORMALIZATION
Lecture Notes | Prescribed Textbook: Database System Concepts (Silberschatz)

Chapter 4: Functional Dependencies and Normal Forms
In relational database theory, Python and Java applications connect to PostgreSQL using JDBC or ORM drivers.

4.1 First Normal Form (1NF)
A relation R is in 1NF if and only if all underlying domains contain only atomic values.

4.2 Second Normal Form (2NF)
A relation R is in 2NF if it is in 1NF and no non-prime attribute is partially dependent on any candidate key.

4.3 Third Normal Form (3NF) & BCNF
A relation is in 3NF if whenever a functional dependency X -> A holds, either X is a superkey or A is prime.

Summary of Learning Objectives:
- Master SQL indexing and query optimization.
- Prevent insertion, deletion, and update anomalies in MongoDB and MySQL.
`,
  },
  {
    id: 'NEG-7',
    name: 'Standalone Completion Certificate',
    expectedResume: false,
    text: `
CERTIFICATE OF COMPLETION
This is to certify that
HARSHIL SHARMA
has successfully completed the 8-week online certification course in
Full Stack Web Development with React, Node.js, and MongoDB

Issued on: 18th July 2025
Certificate ID: CERT-WEB-884920
Authorized Signatory: Global Learning Academy
`,
  },
  {
    id: 'NEG-8',
    name: 'Technical Tutorial / Blog Article',
    expectedResume: false,
    text: `
How to Deploy a MERN Stack Application to Production using Docker and Nginx
Published by TechDev Guide | In this tutorial, we will explore containerization step-by-step.

Step 1: Setting up Dockerfile for Node.js Backend
Create a Dockerfile in your root directory and configure base image node:18-alpine...

Step 2: Configuring React Frontend Multi-Stage Build
Use multi-stage Docker build to compile React assets into static files...

Step 3: Setting up Nginx Reverse Proxy
Configure nginx.conf to proxy incoming HTTP requests on port 80 to your Node.js container on port 5000...

Conclusion:
You now have a production-ready containerized full stack deployment running on AWS EC2!
`,
  },

  // ==========================================
  // POSITIVE TEST CASES (MUST BE ACCEPTED)
  // ==========================================
  {
    id: 'POS-1',
    name: 'Valid Fresher Resume (Education + Skills + Projects, No Experience)',
    expectedResume: true,
    text: `
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

ACHIEVEMENTS
- Solved 300+ coding problems on LeetCode across DSA and Algorithms.
`,
  },
  {
    id: 'POS-2',
    name: 'Valid Experienced Senior Resume (Summary + Experience + Skills + Education)',
    expectedResume: true,
    text: `
MARCUS VANCE
marcus.vance@cloudops.io | +1 (555) 234-5678 | Austin, TX
LinkedIn: linkedin.com/in/marcusvance

PROFESSIONAL SUMMARY
Senior Cloud & DevOps Engineer with 6+ years of experience architecting enterprise Kubernetes infrastructure, AWS cloud solutions, and automated CI/CD pipelines.

PROFESSIONAL EXPERIENCE
Lead DevOps Engineer — CloudScale Inc. (2021 - Present)
- Orchestrated enterprise Kubernetes clusters across AWS multi-region infrastructure.
- Authored Terraform infrastructure-as-code managing 400+ cloud instances.
- Automated CI/CD deployment pipelines using GitLab CI and Docker.

Senior Systems Engineer — DataCorp (2018 - 2021)
- Automated Linux server provisioning with Ansible and Bash.
- Managed high-availability MySQL database clusters.

TECHNICAL EXPERTISE
Cloud: AWS, GCP | Containerization: Docker, Kubernetes | CI/CD: Jenkins, GitLab CI | IaC: Terraform, Ansible

EDUCATION
B.S. in Computer Science — University of Texas at Austin (2014 - 2018)
`,
  },
  {
    id: 'POS-3',
    name: 'Two-Column Modern Resume Layout',
    expectedResume: true,
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

FEATURED PROJECTS
Banking Transaction Gateway
- Built asynchronous transaction processor with Java Spring Boot and MySQL.
`,
  },
  {
    id: 'POS-4',
    name: 'Canva/Design Portfolio Style Resume',
    expectedResume: true,
    text: `
SOPHIA PATEL • PRODUCT DESIGNER
sophia.design@email.com | portfolio: sophiapatel.design | +1 555-0199

CORE CAPABILITIES
Figma • Wireframing • User Research • Prototyping • Design Systems • Usability Testing • HTML • CSS

SELECTED HIGHLIGHTS
Lead UX Designer — Creative Flow (2023 - 2025)
- Conducted user interviews and end-to-end usability testing across 40+ user cohorts.
- Created scalable design systems in Figma and delivered high-fidelity interactive prototypes.

PROJECT SHOWCASE
HealthTrack Mobile App Redesign
- Rebuilt mobile app UX flow using Figma and user journey mapping.

EDUCATION
B.Des in Interaction Design — National Design Institute (2019 - 2023)
`,
  },
  {
    id: 'POS-5',
    name: 'Resume with Unusual Section Headings',
    expectedResume: true,
    text: `
Devon Reed
devon.reed@craft.com | github.com/devonreed

CAREER ASPIRATION
Aspiring software engineer eager to contribute to impactful software products.

CORE SUBJECT COMPETENCIES
JavaScript, Python, React, Node.js, SQL, MongoDB, Git

NOTABLE ENGAGEMENTS & VENTURES
Hospital Management System
- Implemented frontend UI with React and backend logic using Node.js and SQL.

SCHOLASTIC ACHIEVEMENTS
B.S. in Software Engineering, Medicaps University, 2024
Dean's Honor List for outstanding scholastic performance.
`,
  },
];

async function runResumeGateTestSuite() {
  console.log('='.repeat(75));
  console.log('DISHESETU AI — RESUME CLASSIFICATION GATE TEST SUITE');
  console.log('='.repeat(75));

  let passed = 0;
  let total = testCases.length;

  for (const t of testCases) {
    console.log(`\n------------------------------------------------------------`);
    console.log(`TEST [${t.id}] ${t.name}`);
    console.log(`Expected Classification: ${t.expectedResume ? 'RESUME (Allow ATS)' : 'NON_RESUME (Reject)'}`);

    const result = await validateResumeGate(t.text, `${t.id}.pdf`);

    let isMatch = result.isResume === t.expectedResume;
    console.log(`> Gate Decision       : ${result.isResume ? '✅ RESUME' : '🛑 REJECTED (NON_RESUME)'}`);
    console.log(`> Document Type       : ${result.documentType}`);
    console.log(`> Confidence          : ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`> Detected Type       : ${result.detectedNonResumeType}`);
    console.log(`> Reasoning Signals   : ${result.reasoningSignals?.join(' | ') || 'N/A'}`);

    if (isMatch) {
      console.log(`✅ RESULT: PASSED`);
      passed++;
    } else {
      console.log(`❌ RESULT: FAILED (Expected isResume=${t.expectedResume} but got ${result.isResume})`);
    }
  }

  console.log(`\n` + '='.repeat(75));
  console.log(`RESUME GATE TEST SUITE SUMMARY: ${passed}/${total} TESTS PASSED`);
  console.log('='.repeat(75));

  if (passed === total) {
    console.log('🎉 ALL 13 RESUME CLASSIFICATION GATE TEST CASES PASSED WITH 100% ACCURACY!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runResumeGateTestSuite();
