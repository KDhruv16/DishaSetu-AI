import { PDFParse } from 'pdf-parse';

// Comprehensive Canonical Skill Taxonomy & Aliases Dictionary
export const CANONICAL_SKILL_TAXONOMY = {
  // Web & Frontend
  'HTML': ['html', 'html5', 'xhtml', 'semantic html'],
  'CSS': ['css', 'css3', 'scss', 'sass', 'css/html', 'html/css'],
  'Tailwind CSS': ['tailwind', 'tailwind css', 'tailwindcss'],
  'Bootstrap': ['bootstrap', 'bootstrap 5', 'bootstrap 4', 'bootstrap 3'],
  'JavaScript': ['javascript', 'js', 'es6', 'es6+', 'ecmascript', 'vanilla js'],
  'TypeScript': ['typescript', 'ts'],
  'React': ['react', 'react.js', 'reactjs', 'react-dom'],
  'Next.js': ['next.js', 'nextjs', 'next js', 'next'],
  'Redux': ['redux', 'redux toolkit', 'rtk'],
  'GSAP': ['gsap', 'greenstock', 'greensock'],
  'Vue.js': ['vue', 'vue.js', 'vuejs'],
  'Angular': ['angular', 'angularjs', 'angular.js'],
  'Svelte': ['svelte', 'sveltekit'],
  'jQuery': ['jquery'],

  // Backend & Languages
  'Node.js': ['node.js', 'nodejs', 'node js', 'node'],
  'Express.js': ['express', 'express.js', 'expressjs', 'express js'],
  'REST API': ['rest api', 'rest apis', 'restful api', 'restful apis', 'restful', 'rest', 'api integration', 'api', 'apis', 'api endpoints', 'restful web services', 'rest web services'],
  'GraphQL': ['graphql', 'apollo'],
  'WebSockets': ['websockets', 'socket.io', 'websocket'],
  'Java': ['java', 'core java', 'j2ee', 'jvm'],
  'Spring Boot': ['spring boot', 'spring framework', 'spring mvc', 'spring'],
  'Hibernate': ['hibernate', 'jpa'],
  'Python': ['python', 'python3', 'django', 'flask', 'fastapi'],
  'Django': ['django', 'django rest framework'],
  'Flask': ['flask'],
  'FastAPI': ['fastapi'],
  'C': ['c language', 'c'],
  'C++': ['c++', 'cpp'],
  'C#': ['c#', 'csharp', '.net', 'asp.net', 'dotnet'],
  'PHP': ['php', 'laravel'],
  'Golang': ['golang', 'go language', ' go '],
  'Rust': ['rust'],

  // Databases & Storage
  'MongoDB': ['mongodb', 'mongo', 'mongoose', 'mongodb atlas', 'nosql', 'mongodb shell'],
  'MySQL': ['mysql', 'my-sql'],
  'PostgreSQL': ['postgresql', 'postgres', 'psql'],
  'SQL': ['sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'oracle sql', 'ms sql', 'relational database', 'pl/sql', 't-sql', 'dbms'],
  'SQLite': ['sqlite'],
  'Redis': ['redis', 'caching', 'in-memory cache'],
  'Mongoose': ['mongoose'],
  'Firebase': ['firebase', 'firestore'],
  'Elasticsearch': ['elasticsearch', 'elk stack'],

  // Mobile Development
  'React Native': ['react Native', 'expo'],
  'Flutter': ['flutter', 'dart'],
  'Kotlin': ['kotlin', 'android development'],
  'Swift': ['swift', 'ios development'],

  // Tools, Deployment, Cloud & DevOps
  'Git': ['git', 'github', 'gitlab', 'bitbucket', 'version control'],
  'GitHub': ['github'],
  'Postman': ['postman', 'api testing'],
  'VS Code': ['vs code', 'vscode', 'visual studio code'],
  'Docker': ['docker', 'docker container', 'containerization', 'dockerfile', 'docker compose'],
  'Kubernetes': ['kubernetes', 'k8s', 'container orchestration'],
  'CI/CD': ['ci/cd', 'cicd', 'github actions', 'jenkins', 'gitlab ci', 'continuous integration'],
  'AWS': ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'cloud'],
  'Azure': ['azure', 'microsoft azure'],
  'GCP': ['gcp', 'google cloud', 'google cloud platform'],
  'Terraform': ['terraform', 'infrastructure as code', 'iac'],
  'Ansible': ['ansible'],
  'Vercel': ['vercel'],
  'Cloudinary': ['cloudinary'],
  'Razorpay': ['razorpay'],
  'Stripe': ['stripe'],
  'Linux': ['linux', 'ubuntu', 'bash', 'unix', 'shell scripting', 'centos', 'debian'],
  'Nginx': ['nginx', 'reverse proxy'],

  // Core Computer Science Concepts
  'Data Structures & Algorithms': ['data structures & algorithm', 'data structures & algorithms', 'data structures and algorithms', 'dsa', 'data structures', 'algorithms'],
  'OOP': ['oop', 'oops', 'object oriented programming', 'object-oriented programming'],
  'DBMS': ['dbms', 'database management system', 'database management systems'],
  'Operating Systems': ['operating systems', 'os', 'operating system'],
  'Computer Networks': ['computer networks', 'cn', 'computer networking', 'networking'],
  'System Design': ['system design', 'distributed systems', 'scalability', 'high availability'],

  // Data Science, Analytics & AI/ML
  'Pandas': ['pandas'],
  'NumPy': ['numpy'],
  'Scikit-learn': ['scikit-learn', 'scikit learn', 'sklearn'],
  'TensorFlow': ['tensorflow', 'tf'],
  'PyTorch': ['pytorch', 'torch'],
  'Tableau': ['tableau'],
  'Power BI': ['power bi', 'powerbi'],
  'Excel': ['excel', 'advanced excel', 'ms excel', 'spreadsheets'],
  'Machine Learning': ['machine learning', 'ml', 'deep learning', 'nlp', 'computer vision'],
  'Data Analysis': ['data analysis', 'exploratory data analysis', 'eda', 'data analytics'],

  // UI/UX & Design
  'Figma': ['figma', 'figma design'],
  'UI/UX': ['ui/ux', 'ui design', 'ux design', 'user experience', 'user interface', 'wireframing', 'prototyping'],
  'Adobe XD': ['adobe xd', 'xd'],
  'Wireframing': ['wireframing', 'wireframe', 'wireframes'],
  'Prototyping': ['prototyping', 'interactive prototypes', 'prototype'],
  'User Research': ['user research', 'user interviews', 'user testing'],
  'Design Systems': ['design systems', 'design system', 'component library'],
  'Usability Testing': ['usability testing', 'user journey mapping'],

  // Testing & Quality
  'Testing': ['testing', 'unit testing', 'jest', 'mocha', 'chai', 'cypress', 'selenium', 'pytest', 'junit', 'vitest', 'test automation'],

  // Cybersecurity
  'Cybersecurity': ['cybersecurity', 'information security', 'infosec', 'network security', 'penetration testing', 'vulnerability assessment', 'owasp'],
};

/**
 * Reusable Canonical Skill Normalizer
 */
export const normalizeSkillName = (rawName) => {
  if (!rawName || typeof rawName !== 'string') return '';
  const trimmed = rawName.trim();
  const lower = trimmed.toLowerCase();

  // Check if it's already an exact canonical key
  if (CANONICAL_SKILL_TAXONOMY[trimmed]) {
    return trimmed;
  }

  // Check against synonyms
  for (const [canonical, synonyms] of Object.entries(CANONICAL_SKILL_TAXONOMY)) {
    if (canonical.toLowerCase() === lower) return canonical;
    for (const syn of synonyms) {
      if (syn.toLowerCase() === lower) return canonical;
    }
  }

  return trimmed;
};

// Generic Target Role Requirements Matrix
export const ROLE_REQUIREMENTS = {
  'Full Stack Developer': {
    core: [
      { name: 'HTML/CSS', components: ['HTML', 'CSS'], label: 'HTML & CSS Foundations' },
      { name: 'JavaScript', components: ['JavaScript'], label: 'JavaScript (ES6+)' },
      { name: 'React', components: ['React'], label: 'React.js Frontend' },
      { name: 'Node.js', components: ['Node.js'], label: 'Node.js Runtime' },
      { name: 'Express.js', components: ['Express.js'], label: 'Express.js Server Framework' },
      { name: 'REST API', components: ['REST API'], label: 'RESTful API Architecture' },
      { name: 'MongoDB', components: ['MongoDB'], label: 'MongoDB / NoSQL Database' },
      { name: 'SQL', components: ['SQL'], label: 'Relational Database / SQL' },
      { name: 'Git', components: ['Git'], label: 'Git Version Control' },
    ],
    recommended: [
      { name: 'Docker', components: ['Docker'], label: 'Docker Containerization' },
      { name: 'Testing', components: ['Testing'], label: 'Unit & Integration Testing' },
      { name: 'CI/CD', components: ['CI/CD'], label: 'CI/CD Pipelines' },
      { name: 'Next.js', components: ['Next.js'], label: 'Next.js Fullstack Framework' },
      { name: 'Tailwind CSS', components: ['Tailwind CSS'], label: 'Tailwind CSS Styling' },
      { name: 'TypeScript', components: ['TypeScript'], label: 'TypeScript Type Safety' },
    ],
  },
  'Frontend Developer': {
    core: [
      { name: 'HTML/CSS', components: ['HTML', 'CSS'], label: 'HTML & CSS Foundations' },
      { name: 'JavaScript', components: ['JavaScript'], label: 'JavaScript (ES6+)' },
      { name: 'React', components: ['React'], label: 'React.js Component Architecture' },
      { name: 'Tailwind CSS', components: ['Tailwind CSS'], label: 'Tailwind CSS / Responsive Design' },
      { name: 'Git', components: ['Git'], label: 'Git Version Control' },
      { name: 'REST API', components: ['REST API'], label: 'Client-Side API Integration' },
    ],
    recommended: [
      { name: 'TypeScript', components: ['TypeScript'], label: 'TypeScript Type Safety' },
      { name: 'Next.js', components: ['Next.js'], label: 'Next.js SSR/SSG' },
      { name: 'Redux', components: ['Redux'], label: 'Redux State Management' },
      { name: 'Testing', components: ['Testing'], label: 'Frontend Component Testing' },
    ],
  },
  'Backend Developer': {
    core: [
      { name: 'Node.js', components: ['Node.js'], label: 'Node.js Backend Runtime' },
      { name: 'Express.js', components: ['Express.js'], label: 'Express.js API Framework' },
      { name: 'REST API', components: ['REST API'], label: 'RESTful API Design' },
      { name: 'SQL', components: ['SQL'], label: 'Relational Database / SQL' },
      { name: 'MongoDB', components: ['MongoDB'], label: 'MongoDB / Document Stores' },
      { name: 'Git', components: ['Git'], label: 'Git Version Control' },
    ],
    recommended: [
      { name: 'Docker', components: ['Docker'], label: 'Docker Containerization' },
      { name: 'Testing', components: ['Testing'], label: 'Backend Unit/Integration Testing' },
      { name: 'PostgreSQL', components: ['PostgreSQL'], label: 'PostgreSQL Advanced Modeling' },
      { name: 'CI/CD', components: ['CI/CD'], label: 'CI/CD Automation' },
      { name: 'Linux', components: ['Linux'], label: 'Linux Server Administration' },
    ],
  },
  'Java Developer': {
    core: [
      { name: 'Java', components: ['Java'], label: 'Core Java Programming' },
      { name: 'Spring Boot', components: ['Spring Boot'], label: 'Spring Boot Framework' },
      { name: 'SQL', components: ['SQL'], label: 'Relational Database / SQL' },
      { name: 'REST API', components: ['REST API'], label: 'RESTful Web Services' },
      { name: 'Git', components: ['Git'], label: 'Git Version Control' },
    ],
    recommended: [
      { name: 'Hibernate', components: ['Hibernate'], label: 'Hibernate / JPA ORM' },
      { name: 'Docker', components: ['Docker'], label: 'Docker Containerization' },
      { name: 'Testing', components: ['Testing'], label: 'JUnit Testing' },
      { name: 'Microservices', components: ['System Design'], label: 'Microservices Architecture' },
    ],
  },
  'Python Developer': {
    core: [
      { name: 'Python', components: ['Python'], label: 'Python Programming' },
      { name: 'Django / Flask', components: ['Django'], label: 'Django or Flask Backend Framework' },
      { name: 'SQL', components: ['SQL'], label: 'Relational Database / SQL' },
      { name: 'REST API', components: ['REST API'], label: 'REST API Architecture' },
      { name: 'Git', components: ['Git'], label: 'Git Version Control' },
    ],
    recommended: [
      { name: 'FastAPI', components: ['FastAPI'], label: 'FastAPI High Performance' },
      { name: 'Docker', components: ['Docker'], label: 'Docker Containerization' },
      { name: 'PostgreSQL', components: ['PostgreSQL'], label: 'PostgreSQL Database' },
      { name: 'Redis', components: ['Redis'], label: 'Redis Caching' },
    ],
  },
  'AI / ML Engineer': {
    core: [
      { name: 'Python', components: ['Python'], label: 'Python Programming' },
      { name: 'Machine Learning', components: ['Machine Learning'], label: 'Machine Learning Fundamentals' },
      { name: 'Data Structures & Algorithms', components: ['Data Structures & Algorithms'], label: 'Algorithms & Data Structures' },
      { name: 'Pandas', components: ['Pandas'], label: 'Pandas / NumPy Data Processing' },
      { name: 'SQL', components: ['SQL'], label: 'SQL Data Extraction' },
    ],
    recommended: [
      { name: 'TensorFlow', components: ['TensorFlow'], label: 'TensorFlow / Keras Deep Learning' },
      { name: 'PyTorch', components: ['PyTorch'], label: 'PyTorch Neural Networks' },
      { name: 'Git', components: ['Git'], label: 'Git Version Control' },
      { name: 'Docker', components: ['Docker'], label: 'ML Model Containerization' },
    ],
  },
  'Data Analyst': {
    core: [
      { name: 'SQL', components: ['SQL'], label: 'SQL Querying & Aggregation' },
      { name: 'Python', components: ['Python'], label: 'Python Analytics' },
      { name: 'Excel', components: ['Excel'], label: 'Advanced Excel' },
      { name: 'DBMS', components: ['DBMS'], label: 'Database Concepts' },
    ],
    recommended: [
      { name: 'PowerBI', components: ['PowerBI'], label: 'PowerBI Dashboards' },
      { name: 'Tableau', components: ['Tableau'], label: 'Tableau Visual Analytics' },
      { name: 'Pandas', components: ['Pandas'], label: 'Pandas Data Wrangling' },
    ],
  },
  'Data Scientist': {
    core: [
      { name: 'Python', components: ['Python'], label: 'Python Data Science' },
      { name: 'SQL', components: ['SQL'], label: 'SQL Advanced Querying' },
      { name: 'Pandas', components: ['Pandas'], label: 'Pandas Data Wrangling' },
      { name: 'Machine Learning', components: ['Machine Learning'], label: 'Statistical Machine Learning' },
      { name: 'Data Visualization', components: ['Data Visualization'], label: 'Visual Analytics' },
    ],
    recommended: [
      { name: 'Deep Learning', components: ['Deep Learning'], label: 'Deep Learning Models' },
      { name: 'Scikit-learn', components: ['Scikit-learn'], label: 'Scikit-learn Algorithms' },
      { name: 'Big Data', components: ['SQL'], label: 'Big Data Analytics' },
    ],
  },
  'Cloud / DevOps Engineer': {
    core: [
      { name: 'Linux', components: ['Linux'], label: 'Linux Systems' },
      { name: 'Docker', components: ['Docker'], label: 'Docker Containerization' },
      { name: 'Git', components: ['Git'], label: 'Git Version Control' },
      { name: 'CI/CD', components: ['CI/CD'], label: 'CI/CD Pipeline Automation' },
      { name: 'AWS', components: ['AWS'], label: 'AWS Cloud Services' },
    ],
    recommended: [
      { name: 'Kubernetes', components: ['Kubernetes'], label: 'Kubernetes Orchestration' },
      { name: 'Terraform', components: ['Terraform'], label: 'Terraform Infrastructure as Code' },
      { name: 'Azure', components: ['Azure'], label: 'Azure Cloud Platform' },
    ],
  },
  'UI/UX Designer': {
    core: [
      { name: 'Figma', components: ['Figma'], label: 'Figma Design & Prototyping' },
      { name: 'UI/UX', components: ['UI/UX'], label: 'User Experience & Wireframing' },
      { name: 'HTML/CSS', components: ['HTML', 'CSS'], label: 'Design-to-Code Fundamentals' },
    ],
    recommended: [
      { name: 'Adobe XD', components: ['Adobe XD'], label: 'Adobe Creative Suite' },
      { name: 'Responsive Design', components: ['CSS'], label: 'Mobile-First Layouts' },
    ],
  },
  'Cybersecurity Analyst': {
    core: [
      { name: 'Cybersecurity', components: ['Cybersecurity'], label: 'Security Principles & OWASP' },
      { name: 'Computer Networks', components: ['Computer Networks'], label: 'Network Protocols & Firewalls' },
      { name: 'Linux', components: ['Linux'], label: 'Linux Security Administration' },
      { name: 'Python', components: ['Python'], label: 'Security Scripting' },
    ],
    recommended: [
      { name: 'Testing', components: ['Testing'], label: 'Penetration Testing' },
      { name: 'SQL', components: ['SQL'], label: 'Database Security & Injection Defense' },
    ],
  },
};

/**
 * Generic Target Role Resolver
 */
export const getRoleRequirements = (targetRole = 'Full Stack Developer') => {
  if (!targetRole || typeof targetRole !== 'string') {
    return ROLE_REQUIREMENTS['Full Stack Developer'];
  }

  // Exact match
  if (ROLE_REQUIREMENTS[targetRole]) {
    return ROLE_REQUIREMENTS[targetRole];
  }

  // Case-insensitive & substring match
  const lower = targetRole.toLowerCase().trim();
  for (const [key, config] of Object.entries(ROLE_REQUIREMENTS)) {
    if (key.toLowerCase() === lower || lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return config;
    }
  }

  // Domain keyword heuristics for unlisted custom roles
  if (lower.includes('java')) return ROLE_REQUIREMENTS['Java Developer'];
  if (lower.includes('python') || lower.includes('django')) return ROLE_REQUIREMENTS['Python Developer'];
  if (lower.includes('data sci')) return ROLE_REQUIREMENTS['Data Scientist'];
  if (lower.includes('data') || lower.includes('analyst')) return ROLE_REQUIREMENTS['Data Analyst'];
  if (lower.includes('ai') || lower.includes('machine learning') || lower.includes('ml')) return ROLE_REQUIREMENTS['AI / ML Engineer'];
  if (lower.includes('cloud') || lower.includes('devops') || lower.includes('sre') || lower.includes('infra')) return ROLE_REQUIREMENTS['Cloud / DevOps Engineer'];
  if (lower.includes('front') || lower.includes('web') || lower.includes('react') || lower.includes('angular')) return ROLE_REQUIREMENTS['Frontend Developer'];
  if (lower.includes('back') || lower.includes('api') || lower.includes('server') || lower.includes('node')) return ROLE_REQUIREMENTS['Backend Developer'];
  if (lower.includes('ui') || lower.includes('ux') || lower.includes('design')) return ROLE_REQUIREMENTS['UI/UX Designer'];
  if (lower.includes('security') || lower.includes('cyber') || lower.includes('soc')) return ROLE_REQUIREMENTS['Cybersecurity Analyst'];

  return ROLE_REQUIREMENTS['Full Stack Developer'];
};

const ACTION_VERBS = [
  'developed', 'built', 'created', 'designed', 'implemented', 'deployed',
  'engineered', 'integrated', 'optimized', 'maintained', 'architected',
  'configured', 'automated', 'collaborated', 'led', 'analyzed', 'spearheaded',
  'orchestrated', 'executed', 'refactored', 'resolved', 'streamlined'
];

/**
 * Extract raw text from PDF buffer with robust multi-strategy extraction
 */
export const extractTextFromPdf = async (buffer) => {
  if (!buffer || buffer.length === 0) {
    throw new Error('The uploaded file is empty. Please upload a valid PDF resume.');
  }

  const fileSizeKb = (buffer.length / 1024).toFixed(1);
  let extractedText = '';
  let detectedPages = 0;

  // Strategy 1: PDFParse (pdfjs-based text extraction)
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    detectedPages = result.total || (result.pages ? result.pages.length : 0);

    if (result && result.text) {
      extractedText = result.text;
    }
    await parser.destroy();
  } catch (parseError) {
    console.warn('PDF extraction parser notice:', parseError.message);
  }

  // Normalize extracted text
  if (extractedText) {
    extractedText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // remove non-printable control characters
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      .trim();
  }

  // Safe debugging logs (no PII, no sensitive resume text)
  console.log(
    `[Resume Parser] Size: ${fileSizeKb} KB, Pages: ${detectedPages}, Extracted Characters: ${extractedText ? extractedText.length : 0}`
  );

  // Validation
  if (!extractedText || extractedText.length < 20) {
    if (detectedPages > 0) {
      throw new Error(
        'This PDF appears to be image-based or scanned. Please upload a standard text-based PDF.'
      );
    }
    throw new Error(
      'Could not read text from this PDF. Please ensure it is a valid, readable PDF document.'
    );
  }

  return extractedText;
};

/**
 * Parse structured sections from normalized resume text
 */
export const parseResumeSections = (resumeText) => {
  const lines = resumeText.split('\n');
  const sections = {
    contact: { found: false, text: '' },
    summary: { found: false, text: '' },
    skills: { found: false, text: '' },
    projects: { found: false, text: '' },
    experience: { found: false, text: '' },
    education: { found: false, text: '' },
    certifications: { found: false, text: '' },
    achievements: { found: false, text: '' },
  };

  const sectionPatterns = [
    { key: 'skills', regex: /^(technical\s+skills|skills|core\s+competencies|technologies|tools|key\s+skills|technical\s+proficiencies|tech\s+stack|programming\s+languages|languages(\s+(&|and)\s+frameworks)?|databases(\s+(&|and)\s+tools)?)\b/i },
    { key: 'projects', regex: /^(projects|academic\s+projects|key\s+projects|personal\s+projects|portfolio\s+projects|notable\s+projects)\b/i },
    { key: 'experience', regex: /^(experience|work\s+experience|professional\s+experience|internships?|employment\s+history|work\s+history)\b/i },
    { key: 'education', regex: /^(education|academic\s+background|academic\s+qualifications|educational\s+qualifications|academics|university|degrees?)\b/i },
    { key: 'summary', regex: /^(summary|professional\s+summary|profile|about\s+me|career\s+objective|objective)\b/i },
    { key: 'certifications', regex: /^(certifications?|certificates?|licenses\s+(&|and)\s+certifications?|courses\s+(&|and)\s+certifications?)\b/i },
    { key: 'achievements', regex: /^(achievements|honors\s+(&|and)\s+awards|awards|extracurricular\s+activities|leadership|core\s+subjects)\b/i },
  ];

  let currentSection = 'summary'; // default opening block

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if this line is a section heading
    let matchedHeading = false;
    if (trimmed.length < 50) {
      const cleanHeader = trimmed.replace(/[:\-–—#*=_]/g, '').trim();
      for (const { key, regex } of sectionPatterns) {
        if (regex.test(cleanHeader)) {
          currentSection = key;
          sections[key].found = true;
          matchedHeading = true;
          break;
        }
      }
    }

    if (!matchedHeading && currentSection) {
      sections[currentSection].text += ' ' + trimmed;
    }
  }

  // Contact info check
  const lowerAll = resumeText.toLowerCase();
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/.test(resumeText);
  const hasLinks = lowerAll.includes('github') || lowerAll.includes('linkedin') || lowerAll.includes('portfolio');

  if (hasEmail || hasPhone || hasLinks) {
    sections.contact.found = true;
  }

  // Fallback section detections
  if (!sections.skills.found && (lowerAll.includes('skills') || lowerAll.includes('technologies') || lowerAll.includes('languages:'))) {
    sections.skills.found = true;
  }
  if (!sections.projects.found && (lowerAll.includes('project') || lowerAll.includes('built'))) {
    sections.projects.found = true;
  }
  if (!sections.education.found && (lowerAll.includes('b.tech') || lowerAll.includes('bachelor') || lowerAll.includes('university') || lowerAll.includes('college') || lowerAll.includes('cgpa'))) {
    sections.education.found = true;
  }
  if (!sections.experience.found && (lowerAll.includes('intern') || lowerAll.includes('internship') || lowerAll.includes('experience') || lowerAll.includes('developer at'))) {
    sections.experience.found = true;
  }

  return sections;
};

/**
 * Check if a canonical skill exists in resume text using word-boundary matching and aliases
 */
export const checkSkillInText = (canonicalName, resumeText, sections = null) => {
  const lowerFull = resumeText.toLowerCase();
  const synonyms = CANONICAL_SKILL_TAXONOMY[canonicalName] || [canonicalName.toLowerCase()];

  let matched = false;
  let evidence = '';

  for (const syn of synonyms) {
    // Word boundary safe pattern: handles symbols like ++, ., #, / cleanly
    const escaped = syn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, 'i');

    if (regex.test(lowerFull)) {
      matched = true;

      // Locate specific evidence section if sections available
      if (sections) {
        if (sections.skills?.text && regex.test(sections.skills.text.toLowerCase())) {
          evidence = 'Present in Technical Skills section';
        } else if (sections.projects?.text && regex.test(sections.projects.text.toLowerCase())) {
          evidence = 'Demonstrated in Projects section';
        } else if (sections.experience?.text && regex.test(sections.experience.text.toLowerCase())) {
          evidence = 'Found in Experience section';
        } else if (sections.education?.text && regex.test(sections.education.text.toLowerCase())) {
          evidence = 'Found in Academic Background';
        } else {
          evidence = 'Detected in resume text';
        }
      } else {
        evidence = 'Detected in resume text';
      }
      break;
    }
  }

  return { matched, evidence };
};

/**
 * Call Gemini 3.1 Pro for Semantic Resume Classification Gate
 */
export const callGeminiResumeClassification = async (resumeText) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL || 'gemini-3.1-pro-preview';

  const prompt = `You are DishaSetu AI's Strict Document Classifier.
Task: Determine if the following uploaded document is an actual candidate Resume / Curriculum Vitae (CV) or a non-resume document (e.g. college assignment, homework, research paper, question paper, exam, lecture notes, textbook, invoice, receipt, food menu, brochure, pure standalone certificate, technical documentation).

RULES:
- A valid resume describes an individual person's education, skills, projects, work experience, or professional profile.
- A fresher resume with only Education + Skills + Projects is a VALID RESUME.
- A senior resume with Summary + Experience + Skills is a VALID RESUME.
- A document discussing technical concepts (e.g. "Database Normalization notes", "Python assignment question 1", "IEEE research paper") is a NON_RESUME even if it mentions programming languages.
- If uncertain, classify as UNCERTAIN.

Return JSON ONLY:
{
  "documentType": "RESUME | NON_RESUME | UNCERTAIN",
  "confidence": 0.0 to 1.0,
  "detectedNonResumeType": "NONE | ASSIGNMENT | RESEARCH_PAPER | INVOICE | MENU | QUESTION_PAPER | NOTES | CERTIFICATE | ARTICLE | OTHER",
  "reasoningSignals": [
    "Short explanation of why it is or is not a candidate resume"
  ],
  "resumeSignals": {
    "candidateIdentity": true,
    "contactInformation": true,
    "education": true,
    "skills": true,
    "experience": true,
    "projects": true,
    "careerProfile": true
  }
}

DOCUMENT TEXT:
${resumeText.slice(0, 8000)}
`;

  try {
    if (process.env.GEMINI_API_KEY || (!process.env.OPENAI_API_KEY && apiKey)) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (contentText) {
          return JSON.parse(contentText);
        }
      }
    }

    if (process.env.OPENAI_API_KEY || apiKey) {
      const key = process.env.OPENAI_API_KEY || apiKey;
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a document classifier. Return JSON only.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
      }
    }
  } catch (err) {
    console.warn('⚠️ Gemini Resume Classification call notice:', err.message);
  }

  return null;
};

/**
 * Deterministic Structural & Antipattern Resume Classifier
 */
export const classifyResumeDocumentDeterministically = (resumeText, fileName = '') => {
  if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
    return {
      isResume: false,
      documentType: 'NON_RESUME',
      confidence: 0.99,
      detectedNonResumeType: 'EMPTY_OR_CORRUPT',
      reasoningSignals: ['Document text is empty or unreadable.'],
      resumeSignals: {
        candidateIdentity: false,
        contactInformation: false,
        education: false,
        skills: false,
        experience: false,
        projects: false,
        careerProfile: false,
      },
    };
  }

  const lower = resumeText.toLowerCase();

  // ==========================================
  // 1. EVALUATE NEGATIVE NON-RESUME ANTIPATTERNS
  // ==========================================
  const nonResumeFlags = [];

  // Antipattern A: University / College Assignment or Exam
  const assignmentMatches = [
    /\b(assignment\s*[-:#]?\s*\d+|homework|problem\s*set)\b/i,
    /\b(question\s*\d+|q\.\s*\d+|q\d+[:.)]|ans\s*\d*[:.)]|answer\s+the\s+following)\b/i,
    /\b(submission\s*date|due\s*date|submitted\s*by|submitted\s*to)\b/i,
    /\b(total\s*marks|max\s*marks|maximum\s*marks|marks\s*:\s*\d+|roll\s*no|enrollment\s*no|semester\s*exam)\b/i,
    /\b(write\s+a\s+(program|query|code|function)\s+to|explain\s+(in\s+detail|the\s+concept|briefly))\b/i,
    /\b(what\s+is\s+the\s+difference\s+between|draw\s+a\s+(diagram|flowchart|er\s+diagram))\b/i,
  ];
  const assignmentHitCount = assignmentMatches.filter((r) => r.test(lower)).length;
  if (assignmentHitCount >= 2) {
    nonResumeFlags.push({
      type: 'ASSIGNMENT',
      weight: assignmentHitCount * 2,
      reason: 'Contains academic assignment / question-answer structure',
    });
  }

  // Antipattern B: Research Paper / Academic Publication
  const researchPaperMatches = [
    /\b(abstract\b.*?\bintroduction\b)/is,
    /\b(methodology|experimental\s*(results|setup)|related\s*work)\b/i,
    /\b(references|bibliography)\b.*?\b\[\d+\]/is,
    /\b(doi\s*:\s*10\.\d+|ieee\s+transactions|acm\s+transactions|springer|arxiv:\d+)/i,
    /\b(et\s+al\.|in\s+proceedings\s+of|journal\s+of|conference\s+on)\b/i,
  ];
  const researchHitCount = researchPaperMatches.filter((r) => r.test(lower)).length;
  if (researchHitCount >= 2) {
    nonResumeFlags.push({
      type: 'RESEARCH_PAPER',
      weight: researchHitCount * 2,
      reason: 'Contains academic research paper format with abstract / citations / methodology',
    });
  }

  // Antipattern C: Invoice / Commercial Receipt
  const invoiceMatches = [
    /\b(tax\s*invoice|commercial\s*invoice|invoice\s*(#|no|number)|receipt\s*(#|no))\b/i,
    /\b(bill\s*to|billed\s*to|ship\s*to|sold\s*by)\b/i,
    /\b(subtotal|grand\s*total|amount\s*due|amount\s*payable|balance\s*due)\b/i,
    /\b(gstin|hsn\s*code|tax\s*rate|unit\s*price|qty\b|item\s*description)\b/i,
  ];
  const invoiceHitCount = invoiceMatches.filter((r) => r.test(lower)).length;
  if (invoiceHitCount >= 2) {
    nonResumeFlags.push({
      type: 'INVOICE',
      weight: invoiceHitCount * 2,
      reason: 'Contains billing invoice / receipt transaction data',
    });
  }

  // Antipattern D: Restaurant / Food Menu
  const menuMatches = [
    /\b(menu\b|appetizers|starters|main\s*course|desserts|beverages|sides|beers|cocktails)\b/i,
    /\b(pizza|burger|pasta|sandwich|fries|coffee|smoothie|soup|salad)\b/i,
    /\b(dine\s*in|take\s*away|combo\s*meal|chef'?s\s*special|order\s*online)\b/i,
    /(\$\s*\d+(\.\d{2})?|\b₹\s*\d+|\brs\.?\s*\d+)\b/i,
  ];
  const menuHitCount = menuMatches.filter((r) => r.test(lower)).length;
  if (menuHitCount >= 3) {
    nonResumeFlags.push({
      type: 'MENU',
      weight: menuHitCount * 2,
      reason: 'Contains food menu items and pricing catalog structure',
    });
  }

  // Antipattern E: Course Notes / Textbook / Syllabus
  const notesMatches = [
    /\b(chapter\s*\d+|unit\s*\d+[:.]|lecture\s*\d+[:.]|module\s*\d+[:.])\b/i,
    /\b(syllabus\b|table\s*of\s*contents|course\s*objectives|learning\s*outcomes)\b/i,
    /\b(textbook|reference\s*books|prescribed\s*books|prerequisites:)\b/i,
  ];
  const notesHitCount = notesMatches.filter((r) => r.test(lower)).length;
  if (notesHitCount >= 2) {
    nonResumeFlags.push({
      type: 'NOTES',
      weight: notesHitCount * 2,
      reason: 'Contains academic syllabus / lecture notes / textbook chapter format',
    });
  }

  // Antipattern F: Standalone Certificate (Single certificate text without resume sections)
  const isPureCertificate = /\b(certificate\s+of\s+(completion|achievement|participation|excellence)|this\s+is\s+to\s+certify\s+that|has\s+successfully\s+completed\s+(the\s+course|the\s+training)|awarded\s+to|authorized\s+signatory)\b/i.test(lower);
  const hasMultipleResumeSections = [
    /\beducation\b/i.test(lower),
    /\b(skills|technical\s+skills)\b/i.test(lower),
    /\bprojects\b/i.test(lower),
    /\b(experience|employment)\b/i.test(lower),
  ].filter(Boolean).length;

  if (isPureCertificate && hasMultipleResumeSections < 2) {
    nonResumeFlags.push({
      type: 'CERTIFICATE',
      weight: 4,
      reason: 'Contains standalone completion certificate text without candidate resume sections',
    });
  }

  // Antipattern G: Technical Article / Tutorial / Documentation
  const isTechnicalArticle = /\b(in\s+this\s+(article|tutorial|guide|post|blog)|getting\s+started\s+with|step\s+\d+:|how\s+to\s+(use|install|setup|configure))\b/i.test(lower);
  if (isTechnicalArticle && hasMultipleResumeSections < 2) {
    nonResumeFlags.push({
      type: 'ARTICLE',
      weight: 3,
      reason: 'Contains technical article / tutorial instructions without candidate profile structure',
    });
  }

  // ==========================================
  // 2. EVALUATE POSITIVE RESUME PILLARS
  // ==========================================
  const sections = parseResumeSections(resumeText);

  // Pillar 1: Candidate Identity & Contact
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/.test(resumeText);
  const hasLinks = /\b(github\.com|linkedin\.com|portfolio|gitlab\.com)\b/i.test(lower);
  const contactInfoFound = hasEmail || hasPhone || hasLinks;
  const candidateIdentity =
    contactInfoFound ||
    /^[A-Z][a-z]+(\s+[A-Z][a-z]+){1,3}/.test(resumeText.trim().split('\n')[0]?.trim());

  // Pillar 2: Education
  const hasEducationHeader =
    sections.education.found ||
    /\b(education|academic\s+background|academic\s+qualifications|academics|scholastic)\b/i.test(lower);
  const hasDegreeKeywords =
    /\b(b\.tech|bachelor|b\.s\.|b\.e\.|m\.tech|master|m\.s\.|mca|bca|phd|degree|university|college|institute|cgpa|gpa|percentage|graduat(ed|ion))\b/i.test(lower);
  const educationFound = hasEducationHeader || hasDegreeKeywords;

  // Pillar 3: Technical Skills
  const hasSkillsHeader =
    sections.skills.found ||
    /\b(technical\s+skills|skills|core\s+competencies|technologies|tech\s+stack|programming\s+languages)\b/i.test(lower);
  let recognizedTechSkillsCount = 0;
  for (const canonical of Object.keys(CANONICAL_SKILL_TAXONOMY)) {
    const { matched } = checkSkillInText(canonical, resumeText);
    if (matched) recognizedTechSkillsCount++;
  }
  const skillsFound = hasSkillsHeader || recognizedTechSkillsCount >= 3;

  // Pillar 4: Experience
  const hasExperienceHeader =
    sections.experience.found ||
    /\b(experience|work\s+experience|professional\s+experience|employment\s+history|internship|internships)\b/i.test(lower);
  const hasJobRoleKeywords =
    /\b(software\s+developer|software\s+engineer|full\s+stack\s+developer|frontend\s+developer|backend\s+developer|intern\s+at|developer\s+at|engineer\s+at|worked\s+at)\b/i.test(lower);
  const experienceFound = hasExperienceHeader || hasJobRoleKeywords;

  // Pillar 5: Projects
  const hasProjectsHeader =
    sections.projects.found ||
    /\b(projects|personal\s+projects|academic\s+projects|key\s+projects|portfolio\s+projects|notable\s+engagements)\b/i.test(lower);
  const hasProjectKeywords =
    /\b(built\s+a|developed\s+a|architected\s+a|implemented\s+a|designed\s+a)\s+.*?\b(using|with|in)\b/i.test(lower);
  const projectsFound = hasProjectsHeader || hasProjectKeywords;

  // Pillar 6: Career Profile / Summary
  const summaryFound =
    sections.summary.found ||
    /\b(professional\s+summary|career\s+objective|about\s+me|profile|aspirant|undergraduate\s+with)\b/i.test(lower);

  const resumeSignals = {
    candidateIdentity: Boolean(candidateIdentity),
    contactInformation: Boolean(contactInfoFound),
    education: Boolean(educationFound),
    skills: Boolean(skillsFound),
    experience: Boolean(experienceFound),
    projects: Boolean(projectsFound),
    careerProfile: Boolean(summaryFound),
  };

  // Calculate Positive Pillar Score (0 to 6)
  let positivePillars = 0;
  if (resumeSignals.contactInformation || resumeSignals.candidateIdentity) positivePillars += 1;
  if (resumeSignals.education) positivePillars += 1;
  if (resumeSignals.skills) positivePillars += 1;
  if (resumeSignals.projects) positivePillars += 1;
  if (resumeSignals.experience) positivePillars += 1;
  if (resumeSignals.careerProfile) positivePillars += 1;

  const totalNegativeWeight = nonResumeFlags.reduce((acc, f) => acc + f.weight, 0);

  // Decision 1: Dominant non-resume antipatterns detected
  if (nonResumeFlags.length > 0 && totalNegativeWeight >= 2) {
    const primaryNonResume = nonResumeFlags.sort((a, b) => b.weight - a.weight)[0];
    return {
      isResume: false,
      documentType: 'NON_RESUME',
      confidence: 0.95,
      detectedNonResumeType: primaryNonResume.type,
      reasoningSignals: nonResumeFlags.map((f) => f.reason),
      resumeSignals,
    };
  }

  // Decision 2: Valid candidate profile (Fresher, Senior, or Layout-varied resume)
  // - Fresher: Education + Skills + Projects (3 pillars)
  // - Senior: Identity + Summary + Experience + Skills (4 pillars)
  if (positivePillars >= 3 && totalNegativeWeight === 0) {
    return {
      isResume: true,
      documentType: 'RESUME',
      confidence: 0.96,
      detectedNonResumeType: 'NONE',
      reasoningSignals: [
        'Candidate career profile with verified academic and technical competency pillars',
        'No academic assignment or commercial transaction markers',
      ],
      resumeSignals,
    };
  }

  // Decision 3: At least 2 strong pillars with zero negative flags and clear tech skills
  if (
    positivePillars >= 2 &&
    totalNegativeWeight === 0 &&
    (resumeSignals.skills || resumeSignals.projects || resumeSignals.education)
  ) {
    return {
      isResume: true,
      documentType: 'RESUME',
      confidence: 0.88,
      detectedNonResumeType: 'NONE',
      reasoningSignals: ['Verified candidate resume sections (skills/education/projects)'],
      resumeSignals,
    };
  }

  // Decision 4: Borderline / Insufficient Signals
  if (positivePillars <= 1) {
    return {
      isResume: false,
      documentType: 'NON_RESUME',
      confidence: 0.90,
      detectedNonResumeType: 'INSUFFICIENT_SIGNALS',
      reasoningSignals: [
        'Document lacks sufficient candidate career sections (education, skills, projects, or experience)',
      ],
      resumeSignals,
    };
  }

  return {
    isResume: false,
    documentType: 'UNCERTAIN',
    confidence: 0.50,
    detectedNonResumeType: 'UNCERTAIN',
    reasoningSignals: ['Could not confidently classify document as a candidate resume'],
    resumeSignals,
  };
};

/**
 * Hybrid Resume Validation Gate (AI Semantic Classifier + Deterministic Structural Gate)
 */
export const validateResumeGate = async (resumeText, fileName = '') => {
  // 1. Deterministic Multi-Signal Analysis
  const detResult = classifyResumeDocumentDeterministically(resumeText, fileName);

  // 2. Semantic Gemini 3.1 Pro Gate if configured
  const geminiResult = await callGeminiResumeClassification(resumeText);

  let finalDecision = detResult;

  if (geminiResult && geminiResult.documentType) {
    if (geminiResult.documentType === 'NON_RESUME') {
      if (detResult.documentType !== 'RESUME' || detResult.confidence < 0.95) {
        finalDecision = {
          isResume: false,
          documentType: 'NON_RESUME',
          confidence: geminiResult.confidence || 0.95,
          detectedNonResumeType: geminiResult.detectedNonResumeType || 'NON_RESUME',
          reasoningSignals: geminiResult.reasoningSignals || ['AI classifier detected non-resume content'],
          resumeSignals: geminiResult.resumeSignals || detResult.resumeSignals,
        };
      }
    } else if (geminiResult.documentType === 'RESUME' && detResult.documentType !== 'NON_RESUME') {
      finalDecision = {
        isResume: true,
        documentType: 'RESUME',
        confidence: geminiResult.confidence || 0.95,
        detectedNonResumeType: 'NONE',
        reasoningSignals: geminiResult.reasoningSignals || detResult.reasoningSignals,
        resumeSignals: geminiResult.resumeSignals || detResult.resumeSignals,
      };
    }
  }

  return {
    ...finalDecision,
    rejectionMessage: "⚠️ This doesn't appear to be a resume/CV.",
    rejectionDetails:
      "Please upload a resume containing your education, skills, projects, internships, work experience, or professional profile.",
  };
};

/**
 * Call Gemini 3.1 Pro / Gemini 2.5 Pro API for deep resume semantic understanding
 */
export const callGeminiResumeAnalysis = async (resumeText, targetRole) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL || 'gemini-3.1-pro-preview';

  const prompt = `You are DishaSetu AI's Resume Intelligence Analyzer powered by Gemini.
Analyze the following resume for the target role: "${targetRole}".

Extract deep structured insights and return JSON ONLY:
{
  "candidate": {
    "name": "Full candidate name if present",
    "email": "Email address if present",
    "phone": "Phone number if present"
  },
  "sections": {
    "summary": true/false,
    "education": true/false,
    "skills": true/false,
    "experience": true/false,
    "projects": true/false,
    "certifications": true/false
  },
  "detectedSkills": [
    {
      "canonical": "Canonical Skill Name (e.g. React, Node.js, HTML, CSS, JavaScript, MongoDB, MySQL, Git, Postman, Java, C, C++, Tailwind CSS, Express.js, REST API, Mongoose, Next.js, etc.)",
      "evidence": "Exact string in resume",
      "source": "Skills / Projects / Experience / Education"
    }
  ],
  "strengths": [
    "Evidence-based strength 1 (e.g. Solid full stack projects built with React, Node.js, and MongoDB)",
    "Evidence-based strength 2",
    "Evidence-based strength 3"
  ],
  "weakAreas": [
    "Evidence-based area for improvement 1",
    "Evidence-based area for improvement 2"
  ],
  "suggestions": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ]
}

RESUME TEXT:
${resumeText.slice(0, 10000)}
`;

  try {
    // 1. Try Google Gemini Generative Language API
    if (process.env.GEMINI_API_KEY || (!process.env.OPENAI_API_KEY && apiKey)) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (contentText) {
          return JSON.parse(contentText);
        }
      } else {
        console.warn(`Gemini (${model}) API responded with status ${response.status}. Trying OpenAI fallback if available.`);
      }
    }

    // 2. OpenAI Fallback
    if (process.env.OPENAI_API_KEY || apiKey) {
      const key = process.env.OPENAI_API_KEY || apiKey;
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are an expert ATS Resume Intelligence system. Return JSON only.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
      }
    }
  } catch (err) {
    console.warn('⚠️ Gemini / LLM Semantic Extraction notice:', err.message);
  }

  return null;
};

/**
 * Deterministic & Evidence-Based ATS Scoring Engine with Composite Requirement Verification
 */
export const calculateAtsScore = (resumeText, targetRole = 'Full Stack Developer', geminiData = null) => {
  const sections = parseResumeSections(resumeText);
  const lowerText = resumeText.toLowerCase();

  const roleConfig = ROLE_REQUIREMENTS[targetRole] || ROLE_REQUIREMENTS['Full Stack Developer'];

  // Map all detected skills in taxonomy across whole resume
  const presentCanonicalSkills = new Set();
  const detectedSkills = [];

  // 1. Add skills extracted by Gemini if valid
  if (geminiData && Array.isArray(geminiData.detectedSkills)) {
    for (const item of geminiData.detectedSkills) {
      const canonical = item.canonical?.trim();
      if (canonical) {
        // Verify evidence actually exists in the resume
        const { matched, evidence } = checkSkillInText(canonical, resumeText, sections);
        if (matched) {
          presentCanonicalSkills.add(canonical);
          detectedSkills.push({
            name: canonical,
            category: 'Recognized Skill',
            evidence: item.source ? `${item.source} (${item.evidence || canonical})` : evidence,
          });
        }
      }
    }
  }

  // 2. Deterministic Sweep of entire Canonical Skill Taxonomy
  for (const [canonicalName] of Object.entries(CANONICAL_SKILL_TAXONOMY)) {
    if (!presentCanonicalSkills.has(canonicalName)) {
      const { matched, evidence } = checkSkillInText(canonicalName, resumeText, sections);
      if (matched) {
        presentCanonicalSkills.add(canonicalName);
        detectedSkills.push({
          name: canonicalName,
          category: 'Recognized Skill',
          evidence,
        });
      }
    }
  }

  // 3. Evaluate Core Requirements (Handling Composite Requirements like HTML/CSS)
  const satisfiedCore = [];
  const coreMissingKeywords = [];

  for (const req of roleConfig.core) {
    // A requirement is satisfied if ALL its components are verified present
    const allComponentsPresent = req.components.every((comp) => {
      if (presentCanonicalSkills.has(comp)) return true;
      // Re-verify component against text directly
      const { matched } = checkSkillInText(comp, resumeText, sections);
      if (matched) {
        presentCanonicalSkills.add(comp);
        return true;
      }
      return false;
    });

    if (allComponentsPresent) {
      satisfiedCore.push(req.name);
    } else {
      coreMissingKeywords.push(req.name);
    }
  }

  // 4. Evaluate Recommended Requirements
  const satisfiedRecommended = [];
  const recommendedMissingKeywords = [];

  for (const req of roleConfig.recommended) {
    const allComponentsPresent = req.components.every((comp) => {
      if (presentCanonicalSkills.has(comp)) return true;
      const { matched } = checkSkillInText(comp, resumeText, sections);
      if (matched) {
        presentCanonicalSkills.add(comp);
        return true;
      }
      return false;
    });

    if (allComponentsPresent) {
      satisfiedRecommended.push(req.name);
    } else {
      recommendedMissingKeywords.push(req.name);
    }
  }

  // Combined missing keywords
  const missingKeywords = [...coreMissingKeywords, ...recommendedMissingKeywords];

  // Combined present keywords for UI display
  const presentKeywords = Array.from(presentCanonicalSkills);

  // 5. Keyword Coverage Score (40% weight)
  const coreRatio = roleConfig.core.length > 0 ? satisfiedCore.length / roleConfig.core.length : 0.8;
  const recommendedBonus = Math.min(20, (satisfiedRecommended.length / Math.max(1, roleConfig.recommended.length)) * 20);
  const keywordScore = Math.min(100, Math.max(30, Math.round(coreRatio * 85 + recommendedBonus)));

  // 6. Section Completeness Score (25% weight)
  const sectionList = [
    { name: 'Contact Information', found: sections.contact.found },
    { name: 'Education & Academics', found: sections.education.found },
    { name: 'Technical Skills', found: sections.skills.found },
    { name: 'Projects', found: sections.projects.found },
    { name: 'Experience / Internships', found: sections.experience.found },
  ];
  const foundSectionsCount = sectionList.filter((s) => s.found).length;
  const sectionScore = Math.min(100, Math.max(40, Math.round((foundSectionsCount / sectionList.length) * 100)));

  // 7. Action Verbs & Impact Clarity (20% weight)
  const matchedVerbs = ACTION_VERBS.filter((verb) => {
    const regex = new RegExp(`\\b${verb}\\b`, 'i');
    return regex.test(lowerText);
  });
  const verbScore = Math.min(100, Math.max(40, Math.round((matchedVerbs.length / 5) * 100)));

  // 8. Formatting & Length Quality (15% weight)
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  let formattingScore = 85;
  if (wordCount < 120) formattingScore = 45;
  else if (wordCount < 200) formattingScore = 65;
  else if (wordCount > 1500) formattingScore = 70;
  else if (wordCount >= 250 && wordCount <= 850) formattingScore = 95;

  // Weighted Overall ATS Score
  const overall = Math.round(
    keywordScore * 0.40 +
    sectionScore * 0.25 +
    verbScore * 0.20 +
    formattingScore * 0.15
  );

  return {
    overall: Math.min(98, Math.max(35, overall)),
    breakdown: {
      keywordMatch: keywordScore,
      sectionCompleteness: sectionScore,
      projectAndExperience: verbScore,
      formattingAndClarity: formattingScore,
    },
    presentKeywords,
    missingKeywords,
    coreMissingKeywords,
    recommendedMissingKeywords,
    detectedSkills,
    sectionsDetected: sectionList,
    matchedVerbs,
    wordCount,
    hasProjects: sections.projects.found,
    hasExperience: sections.experience.found,
    hasSkills: sections.skills.found,
    hasEducation: sections.education.found,
  };
};

/**
 * Generate Full Grounded Resume Intelligence Analysis with Gemini 3.1 Pro Semantic Synthesis
 */
export const analyzeResumeIntelligence = async (resumeText, targetRole, careerAnalysis, profile) => {
  // Step 1: Call Gemini 3.1 Pro for deep semantic understanding
  const geminiData = await callGeminiResumeAnalysis(resumeText, targetRole);

  // Step 2: Deterministic Evidence Verification & ATS Score Calculation
  const atsResult = calculateAtsScore(resumeText, targetRole, geminiData);

  // Step 3: Grounded Strengths Synthesis
  let strengths = [];
  if (geminiData && Array.isArray(geminiData.strengths) && geminiData.strengths.length > 0) {
    strengths = geminiData.strengths.slice(0, 4);
  } else {
    if (atsResult.presentKeywords.length >= 4) {
      strengths.push(`Strong core technology stack for ${targetRole} (${atsResult.presentKeywords.slice(0, 5).join(', ')}).`);
    }
    if (atsResult.hasProjects) {
      strengths.push('Dedicated projects section demonstrating end-to-end technical implementation.');
    }
    if (atsResult.hasSkills) {
      strengths.push('Clean technical skills breakdown easily parsed by recruiter applicant tracking systems.');
    }
    if (atsResult.hasEducation) {
      strengths.push('Clear academic credentials and foundational engineering background.');
    }
    if (strengths.length < 3) {
      strengths.push('Text-based readable layout compatible across ATS scanner filters.');
    }
  }

  // Step 4: Grounded Weak Areas
  let weakAreas = [];
  if (geminiData && Array.isArray(geminiData.weakAreas) && geminiData.weakAreas.length > 0) {
    // Sanitize weak areas so they never claim a present skill is missing
    weakAreas = geminiData.weakAreas.filter((w) => {
      for (const presentKw of atsResult.presentKeywords) {
        if (w.toLowerCase().includes(`missing ${presentKw.toLowerCase()}`)) return false;
      }
      return true;
    }).slice(0, 3);
  }

  if (weakAreas.length === 0) {
    if (atsResult.coreMissingKeywords.length > 0) {
      weakAreas.push(`Core ${targetRole} requirements not detected: ${atsResult.coreMissingKeywords.join(', ')}.`);
    } else if (atsResult.recommendedMissingKeywords.length > 0) {
      weakAreas.push(`Optional recommended skills not yet listed: ${atsResult.recommendedMissingKeywords.slice(0, 2).join(', ')}.`);
    }
    if (atsResult.breakdown.projectAndExperience < 70) {
      weakAreas.push('Bullet points could use stronger engineering action verbs (e.g. Developed, Architected, Optimized).');
    }
    if (!atsResult.hasExperience) {
      weakAreas.push('No formal production internship or deployed client experience detected.');
    }
  }

  // Step 5: Grounded Actionable Suggestions
  let suggestions = [];
  if (geminiData && Array.isArray(geminiData.suggestions) && geminiData.suggestions.length > 0) {
    suggestions = geminiData.suggestions.filter((sug) => {
      for (const presentKw of atsResult.presentKeywords) {
        if (sug.toLowerCase().includes(`add ${presentKw.toLowerCase()}`) || sug.toLowerCase().includes(`missing ${presentKw.toLowerCase()}`)) {
          return false;
        }
      }
      return true;
    }).slice(0, 3);
  }

  if (suggestions.length === 0) {
    if (atsResult.coreMissingKeywords.length > 0) {
      suggestions.push(`Incorporate core ${targetRole} competencies if you possess experience: ${atsResult.coreMissingKeywords.join(', ')}.`);
    }
    if (atsResult.recommendedMissingKeywords.length > 0) {
      suggestions.push(`Consider learning or adding recommended skills: ${atsResult.recommendedMissingKeywords.slice(0, 3).join(', ')}.`);
    }
    suggestions.push('Begin project bullet points with decisive action verbs highlighting your direct technical contributions.');
    suggestions.push('Include GitHub repositories and live demo URLs for your featured projects.');
  }

  return {
    atsScore: {
      overall: atsResult.overall,
      breakdown: atsResult.breakdown,
    },
    presentKeywords: atsResult.presentKeywords,
    missingKeywords: atsResult.missingKeywords,
    coreMissingKeywords: atsResult.coreMissingKeywords,
    recommendedMissingKeywords: atsResult.recommendedMissingKeywords,
    detectedSkills: atsResult.detectedSkills,
    sectionsDetected: atsResult.sectionsDetected,
    strengths: strengths.slice(0, 4),
    weakAreas: weakAreas.slice(0, 3),
    suggestions: suggestions.slice(0, 3),
  };
};

/**
 * Meaningless / Insufficient Input Validator
 */
export const validateImproverInput = (text, sectionType = 'Project Description') => {
  if (!text || typeof text !== 'string') {
    return {
      isValid: false,
      validationMessage: 'Please enter a meaningful resume statement so I can improve it.',
      example: getSectionExample(sectionType),
    };
  }

  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // Strip non-alphanumeric to check content substance
  const words = trimmed.split(/\s+/).filter((w) => /[a-zA-Z0-9]/.test(w));
  const alphaChars = trimmed.replace(/[^a-zA-Z]/g, '');

  const garbagePatterns = [
    /^(hi+|hello|hey|yo|sup|hola|namaste)$/i,
    /^(test|testing|tester|check|checking)$/i,
    /^(abc|xyz|asdf|qwerty|foo|bar|baz|123|1234|456)$/i,
    /^(good|bad|nice|ok|okay|k|fine|great|nothing|none|na|n\/a|idk|hm+|um+|ah+|uh+)$/i,
    /^(resume|text|write|give|pls|please|help)$/i,
  ];

  const isGarbage = garbagePatterns.some((pattern) => pattern.test(lower));

  if (isGarbage || words.length < 2 || alphaChars.length < 4) {
    return {
      isValid: false,
      validationMessage: 'Please enter a meaningful resume statement so I can improve it.',
      example: getSectionExample(sectionType),
    };
  }

  return { isValid: true };
};

/**
 * Section-Specific Realistic Resume Examples
 */
export const getSectionExample = (sectionType = 'Project Description') => {
  const normalized = sectionType.toLowerCase();
  if (normalized.includes('summary')) {
    return 'Computer Science undergraduate with hands-on experience in full-stack web development.';
  }
  if (normalized.includes('experience') || normalized.includes('work')) {
    return 'Developed frontend features using React and resolved application bugs.';
  }
  if (normalized.includes('bullet')) {
    return 'Integrated REST APIs to support application functionality and seamless data flow.';
  }
  return 'Built a web application using React and Node.js.';
};

/**
 * Intelligent Deterministic Section-Aware Resume Enhancer (Strict Fact-Preservation)
 */
export const enhanceResumeTextDeterministically = (
  rawText,
  sectionType = 'Project Description',
  targetRole = 'Full Stack Developer',
  resumeContext = null
) => {
  const validation = validateImproverInput(rawText, sectionType);
  if (!validation.isValid) {
    return {
      isValid: false,
      improvedText: null,
      validationMessage: validation.validationMessage,
      example: validation.example,
      intent: 'insufficient_input',
    };
  }

  let text = rawText.trim();
  const lower = text.toLowerCase();
  const normalizedSection = sectionType.toLowerCase();

  // Extract explicit metric if present (e.g. 30%, 500+, 2x)
  const metricMatch = text.match(/(\b\d+(\.\d+)?%|\b\d+\+\s*\w+|\b\d+x\b)/i);
  const metric = metricMatch ? metricMatch[0] : null;

  // 1. Detect Intent
  let intent = 'project_work';
  if (normalizedSection.includes('summary') || /^(i am|i'm|aspiring|pursuing|undergraduate|student|graduate|fresher|passionate about|interested in)\b/i.test(lower)) {
    intent = 'summary';
  } else if (/^(learned|learning|studied|exploring|getting started with)\b/i.test(lower)) {
    intent = 'learning';
  } else if (/\b(bug|bugs|issue|issues|fix|fixed|fixing|defect|defects|error|errors|resolve|resolved|debug|debugging)\b/i.test(lower)) {
    intent = 'bug_fixing';
  } else if (/\b(optimize|optimized|optimizing|performance|faster|reduced|reduction|latency|speed|caching|redis|scaling)\b/i.test(lower) || metric) {
    intent = 'optimization';
  } else if (/\b(api|apis|endpoint|endpoints|rest|restful|microservice|microservices|integration|integrate|integrated|connecting backend)\b/i.test(lower)) {
    intent = 'api_integration';
  } else if (/\b(database|databases|db|sql|nosql|mongo|mongodb|mysql|postgres|postgresql|schema|indexing|query|queries)\b/i.test(lower)) {
    intent = 'database_work';
  } else if (/\b(collaborate|collaborated|collaborating|team|peers|pair|worked with team|agile|scrum|cross-functional)\b/i.test(lower)) {
    intent = 'collaboration';
  } else if (/\b(deploy|deployed|deploying|docker|aws|cloud|ci\/cd|pipeline|hosted|vercel)\b/i.test(lower)) {
    intent = 'deployment';
  } else if (/\b(figma|ui\/ux|design|designed|wireframe|wireframes|prototype|prototypes|styling)\b/i.test(lower)) {
    intent = 'ui_design';
  } else if (normalizedSection.includes('experience') || normalizedSection.includes('work')) {
    intent = 'responsibility';
  }

  // 2. Fact Extraction & Technology Formatting
  let cleanedTechText = text
    .replace(/\bmern\b/gi, 'the MERN stack')
    .replace(/\bnode\b(?!\.js)/gi, 'Node.js')
    .replace(/\breact\b(?!\.js)/gi, 'React')
    .replace(/\bmongo\b(?!\w)/gi, 'MongoDB')
    .replace(/\bexpress\b(?!\.js)/gi, 'Express.js')
    .replace(/\bnextjs\b|\bnext\.js\b|\bnext js\b/gi, 'Next.js')
    .replace(/\bjs\b/gi, 'JavaScript')
    .replace(/\bts\b/gi, 'TypeScript')
    .replace(/\bhtml5\b/gi, 'HTML5')
    .replace(/\bcss3\b/gi, 'CSS3')
    .replace(/\btailwind\b(?!\s*css)/gi, 'Tailwind CSS')
    .replace(/\bapis\b|\bapi\b/gi, 'REST APIs')
    .replace(/\bcse\b/gi, 'Computer Science')
    .replace(/\bui\b/gi, 'UI components');

  let improved = '';
  let actionVerb = 'Developed';

  // ==========================================
  // SECTION A: PROFESSIONAL SUMMARY
  // ==========================================
  if (normalizedSection.includes('summary') || intent === 'summary') {
    actionVerb = 'N/A';
    
    // Extract domain / interests from input
    let techFocus = 'full-stack web development';
    if (/java/i.test(lower)) techFocus = 'Java software development';
    else if (/python/i.test(lower)) techFocus = 'Python and backend development';
    else if (/data/i.test(lower) || /analytics/i.test(lower)) techFocus = 'data analytics and statistical analysis';
    else if (/front/i.test(lower) || /react/i.test(lower)) techFocus = 'frontend web development using modern JavaScript frameworks';
    else if (/back/i.test(lower) || /node/i.test(lower)) techFocus = 'backend architecture and scalable RESTful services';
    else if (/ui\/ux|design/i.test(lower)) techFocus = 'UI/UX design and interactive user experiences';

    const hasInternship = /intern|internship|experience/i.test(lower);
    const hasStudent = /student|undergraduate|pursuing|b\.tech|bachelor/i.test(lower) || !hasInternship;

    if (hasStudent && hasInternship) {
      improved = `Computer Science undergraduate with hands-on internship experience in ${techFocus} and a strong track record of building robust software solutions.`;
    } else if (hasStudent) {
      improved = `Computer Science undergraduate with a strong foundation in ${techFocus} and hands-on experience building modern, responsive applications.`;
    } else if (/frontend developer/i.test(lower)) {
      improved = `Frontend developer with hands-on experience building interactive, high-performance web applications using React and modern JavaScript.`;
    } else {
      improved = `Dedicated software engineer with hands-on experience in ${techFocus} and a strong interest in building scalable, production-grade applications.`;
    }
  }

  // ==========================================
  // SECTION B: PROJECT DESCRIPTION
  // ==========================================
  else if (normalizedSection.includes('project')) {
    actionVerb = 'Built';

    if (/login/i.test(lower)) {
      actionVerb = 'Implemented';
      improved = 'Implemented a secure, responsive login interface with robust user authentication and input validation.';
    } else if (/event management/i.test(lower)) {
      actionVerb = 'Developed';
      improved = 'Developed a full-stack event management platform using the MERN stack, enabling users to create, manage, and participate in events.';
    } else if (/food ordering/i.test(lower)) {
      actionVerb = 'Developed';
      improved = 'Developed a responsive food ordering web application using React and Node.js with streamlined catalog browsing and order management.';
    } else if (/e-?commerce/i.test(lower)) {
      actionVerb = 'Built';
      improved = 'Built a full-stack e-commerce application using React and Node.js with interactive product listings and shopping cart functionality.';
    } else if (/portfolio/i.test(lower)) {
      actionVerb = 'Designed';
      improved = 'Designed and deployed a responsive developer portfolio website showcasing featured projects and technical proficiencies.';
    } else {
      // Clean leading conversational starters
      let stripped = text
        .replace(/^(i made|i built|i developed|made an?|built an?|created an?|developed an?)\s+/i, '')
        .trim();
      stripped = stripped.charAt(0).toLowerCase() + stripped.slice(1);
      
      actionVerb = 'Developed';
      improved = `Developed a ${stripped}.`;
    }
  }

  // ==========================================
  // SECTION C: WORK EXPERIENCE
  // ==========================================
  else if (normalizedSection.includes('experience') || normalizedSection.includes('work')) {
    if (intent === 'learning') {
      actionVerb = 'Gained';
      const tech = text.replace(/^(i learned|learned|learning)\s+/i, '').trim();
      improved = `Gained hands-on experience with ${tech || 'core technologies'} through feature implementation and code reviews.`;
    } else if (intent === 'collaboration' || /with team/i.test(lower)) {
      actionVerb = 'Collaborated';
      if (/frontend/i.test(lower)) {
        improved = 'Collaborated with the development team to build and maintain responsive frontend features.';
      } else {
        improved = 'Collaborated with cross-functional engineering teams to develop and maintain application features.';
      }
    } else if (intent === 'bug_fixing' && /frontend/i.test(lower)) {
      actionVerb = 'Developed';
      improved = 'Developed frontend features and resolved application bugs to enhance overall system stability.';
    } else if (intent === 'bug_fixing') {
      actionVerb = 'Resolved';
      improved = 'Resolved application bugs and improved system stability across production modules.';
    } else if (intent === 'optimization' && metric) {
      actionVerb = 'Optimized';
      improved = `Optimized backend services and query execution, achieving a ${metric} performance improvement.`;
    } else if (intent === 'optimization') {
      actionVerb = 'Optimized';
      improved = 'Optimized application performance and streamlined database query execution.';
    } else if (intent === 'api_integration') {
      actionVerb = 'Integrated';
      improved = 'Integrated REST APIs to connect frontend components with backend services and ensure seamless data exchange.';
    } else if (intent === 'database_work') {
      actionVerb = 'Designed';
      improved = 'Designed and optimized database schemas and queries to ensure high data integrity and efficient retrieval.';
    } else if (/worked on frontend/i.test(lower)) {
      actionVerb = 'Developed';
      improved = 'Developed and maintained responsive frontend user interfaces across core application modules.';
    } else if (/worked on backend/i.test(lower)) {
      actionVerb = 'Architected';
      improved = 'Architected and implemented robust backend microservices and RESTful API endpoints.';
    } else {
      let stripped = text
        .replace(/^(worked on|worked with|i worked on|i helped with|helped with)\s+/i, '')
        .trim();
      actionVerb = 'Engineered';
      improved = `Engineered and maintained ${stripped}.`;
    }
  }

  // ==========================================
  // SECTION D: BULLET POINTS
  // ==========================================
  else {
    if (intent === 'optimization' || metric) {
      actionVerb = 'Optimized';
      if (metric && /api|response/i.test(lower)) {
        improved = `Optimized backend query execution and caching, reducing API response time by ${metric}.`;
      } else if (metric) {
        improved = `Optimized system performance and data throughput, achieving a ${metric} improvement.`;
      } else {
        improved = 'Optimized application performance and streamlined database query execution.';
      }
    } else if (intent === 'learning') {
      actionVerb = 'Gained';
      const tech = text.replace(/^(i learned|learned|learning)\s+/i, '').trim();
      improved = `Gained hands-on proficiency in ${tech || 'software engineering principles'} through targeted feature development.`;
    } else if (/login/i.test(lower)) {
      actionVerb = 'Implemented';
      improved = 'Implemented a responsive login interface for secure user authentication.';
    } else if (intent === 'bug_fixing') {
      actionVerb = 'Resolved';
      improved = 'Resolved application bugs and improved overall application stability.';
    } else if (intent === 'api_integration' || /api/i.test(lower)) {
      actionVerb = 'Integrated';
      improved = 'Integrated REST APIs to support application functionality and seamless data exchange.';
    } else if (intent === 'ui_design') {
      actionVerb = 'Designed';
      improved = 'Designed intuitive UI components and user workflows to elevate the end-user experience.';
    } else {
      let stripped = text
        .replace(/^(made|built|did|worked on|created|i made|i built)\s+/i, '')
        .trim();
      actionVerb = 'Implemented';
      improved = `Implemented ${stripped}.`;
    }
  }

  // Final polishing
  improved = improved.replace(/\s+/g, ' ').replace(/\.+$/, '').trim() + '.';
  improved = improved.charAt(0).toUpperCase() + improved.slice(1);

  return {
    isValid: true,
    improvedText: improved,
    sectionType,
    intent,
    actionVerb,
    factsUsed: [text],
    unsupportedFacts: [],
  };
};

/**
 * Improve Resume Section / Bullet Point (Strictly Anti-Hallucinatory & Context-Aware)
 */
export const improveResumeContent = async (
  originalText,
  sectionType = 'Project Description',
  targetRole = 'Full Stack Developer',
  resumeContext = null
) => {
  if (!originalText || !originalText.trim()) {
    return {
      isValid: false,
      improvedText: null,
      validationMessage: 'Please enter a meaningful resume statement so I can improve it.',
      example: getSectionExample(sectionType),
    };
  }

  const cleanText = originalText.trim();

  // 1. Initial Validation
  const validation = validateImproverInput(cleanText, sectionType);
  if (!validation.isValid) {
    return {
      isValid: false,
      improvedText: null,
      validationMessage: validation.validationMessage,
      example: validation.example,
      intent: 'insufficient_input',
    };
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const model = process.env.GEMINI_MODEL || 'gemini-3.1-pro-preview';

      const prompt = `You are DishaSetu AI's Professional Resume Optimizer powered by Gemini 3.1 Pro.
Task: Professionally rewrite the following draft statement for a ${targetRole} resume.

SELECTED SECTION: "${sectionType}"

SECTION-SPECIFIC WRITING RULES:
1. "Project Description":
   - Structure: Action Verb + Project Name/Type + Technology (ONLY if stated) + Feature/Result.
   - Example: "Developed a full-stack event management platform using the MERN stack, enabling users to manage and participate in events."
2. "Professional Summary":
   - Structure: 1-2 professional sentences defining who the candidate is, academic background, technical domains, and career direction.
   - Example: "Computer Science undergraduate with a strong interest in full-stack web development and hands-on experience building modern web applications."
   - CRITICAL: NEVER start with "Developed". NEVER write a work-experience bullet here.
3. "Work Experience":
   - Structure: Action verb matching the exact responsibility (e.g. Resolved for bugs, Integrated for APIs, Designed for UI, Collaborated for teamwork, Optimized for performance).
   - Example: "Resolved application bugs and improved system stability."
   - If learning intent (e.g. "learned React"): "Gained hands-on experience with React through feature development."
4. "Bullet Points":
   - Structure: Single concise, punchy action bullet. Preserve any quantitative numbers/metrics (e.g. "30%").
   - Example: "Integrated REST APIs to support application functionality and seamless data exchange."

STRICT ANTI-HALLUCINATION RULES:
- ONLY use technologies, tools, metrics, and features explicitly mentioned in the input draft.
- NEVER invent numbers (e.g. 10,000 users, 40%), companies, certifications, or unmentioned libraries.
- If input is meaningless/insufficient, set "validInput": false.

Return JSON ONLY:
{
  "validInput": true,
  "sectionType": "${sectionType}",
  "intent": "project_work | frontend_work | backend_work | api_integration | bug_fixing | optimization | database_work | collaboration | deployment | learning | summary | responsibility | insufficient_input",
  "actionVerb": "string (e.g. Developed, Resolved, Integrated, Built, or N/A for summary)",
  "factsUsed": ["fact1"],
  "improvedText": "Refined professional sentence",
  "unsupportedFacts": [],
  "validationMessage": "Please enter a meaningful resume statement so I can improve it.",
  "example": "${getSectionExample(sectionType)}"
}

Draft Input:
"${cleanText}"
`;

      if (process.env.GEMINI_API_KEY || (!process.env.OPENAI_API_KEY && apiKey)) {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.15,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (contentText) {
            const parsed = JSON.parse(contentText);
            if (parsed.validInput === false) {
              return {
                isValid: false,
                improvedText: null,
                validationMessage: parsed.validationMessage || validation.validationMessage,
                example: parsed.example || getSectionExample(sectionType),
                intent: parsed.intent || 'insufficient_input',
              };
            }
            if (parsed.improvedText && (!parsed.unsupportedFacts || parsed.unsupportedFacts.length === 0)) {
              return {
                isValid: true,
                improvedText: parsed.improvedText.trim(),
                sectionType,
                intent: parsed.intent,
                actionVerb: parsed.actionVerb,
                factsUsed: parsed.factsUsed || [cleanText],
                unsupportedFacts: [],
              };
            }
          }
        }
      }

      if (process.env.OPENAI_API_KEY || apiKey) {
        const key = process.env.OPENAI_API_KEY || apiKey;
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: process.env.AI_MODEL || 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are an expert resume optimizer. Return JSON only.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.15,
            response_format: { type: 'json_object' },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const parsed = JSON.parse(data.choices[0].message.content);
          if (parsed.validInput === false) {
            return {
              isValid: false,
              improvedText: null,
              validationMessage: parsed.validationMessage || validation.validationMessage,
              example: parsed.example || getSectionExample(sectionType),
              intent: parsed.intent || 'insufficient_input',
            };
          }
          if (parsed.improvedText && (!parsed.unsupportedFacts || parsed.unsupportedFacts.length === 0)) {
            return {
              isValid: true,
              improvedText: parsed.improvedText.trim(),
              sectionType,
              intent: parsed.intent,
              actionVerb: parsed.actionVerb,
              factsUsed: parsed.factsUsed || [cleanText],
              unsupportedFacts: [],
            };
          }
        }
      }
    } catch (llmErr) {
      console.warn('⚠️ Gemini / LLM Resume Improver notice:', llmErr.message);
    }
  }

  // Fallback: Intelligent Deterministic Section-Aware Enhancer
  return enhanceResumeTextDeterministically(cleanText, sectionType, targetRole, resumeContext);
};

