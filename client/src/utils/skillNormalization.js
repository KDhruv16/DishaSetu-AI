/**
 * Central Skill Normalization Utility for DishaSetu AI (Client side)
 * Provides canonical skill naming, alias mapping, and target role benchmarks.
 */

export const ROLE_SKILL_BENCHMARKS = {
  'Full Stack Developer': ['React', 'Node.js', 'JavaScript', 'HTML/CSS', 'MongoDB', 'SQL', 'Git', 'Docker', 'Testing'],
  'Frontend Developer': ['React', 'JavaScript', 'HTML/CSS', 'Tailwind CSS', 'TypeScript', 'Git', 'Redux', 'UI/UX Basics'],
  'Backend Developer': ['Node.js', 'Express.js', 'SQL', 'MongoDB', 'Docker', 'REST APIs', 'Authentication', 'System Design'],
  'AI / ML Engineer': ['Python', 'Machine Learning', 'TensorFlow/PyTorch', 'Data Analysis', 'Pandas', 'SQL', 'Math/Stats'],
  'Data Analyst': ['SQL', 'Python', 'Excel', 'PowerBI/Tableau', 'Statistics', 'Data Cleaning', 'Reporting'],
  'Cloud / DevOps Engineer': ['Linux', 'Docker', 'Kubernetes', 'AWS/Azure', 'CI/CD', 'Git', 'Terraform', 'Networking'],
};

const SKILL_ALIAS_MAP = {
  // Power BI / Tableau
  'power bi': 'PowerBI/Tableau',
  'powerbi': 'PowerBI/Tableau',
  'tableau': 'PowerBI/Tableau',
  'powerbi/tableau': 'PowerBI/Tableau',
  'power bi / tableau': 'PowerBI/Tableau',
  'visualization': 'PowerBI/Tableau',
  'data visualization': 'PowerBI/Tableau',
  'bi tools': 'PowerBI/Tableau',

  // SQL
  'sql': 'SQL',
  'mysql': 'SQL',
  'postgresql': 'SQL',
  'postgres': 'SQL',
  'sqlite': 'SQL',
  'relational database': 'SQL',
  'pl/sql': 'SQL',
  't-sql': 'SQL',
  'database': 'SQL',

  // Python
  'python': 'Python',
  'python3': 'Python',
  'py': 'Python',

  // Excel
  'excel': 'Excel',
  'ms excel': 'Excel',
  'advanced excel': 'Excel',
  'spreadsheets': 'Excel',

  // Statistics
  'statistics': 'Statistics',
  'stats': 'Statistics',
  'math/stats': 'Statistics',
  'probability': 'Statistics',
  'statistical analysis': 'Statistics',

  // Data Cleaning
  'data cleaning': 'Data Cleaning',
  'data preprocessing': 'Data Cleaning',
  'data wrangling': 'Data Cleaning',
  'data preparation': 'Data Cleaning',

  // Reporting
  'reporting': 'Reporting',
  'business reporting': 'Reporting',
  'executive reporting': 'Reporting',
  'dashboards': 'Reporting',

  // React
  'react': 'React',
  'react.js': 'React',
  'reactjs': 'React',

  // Node
  'node': 'Node.js',
  'node.js': 'Node.js',
  'nodejs': 'Node.js',

  // JavaScript
  'javascript': 'JavaScript',
  'js': 'JavaScript',
  'ecmascript': 'JavaScript',

  // HTML / CSS
  'html': 'HTML/CSS',
  'css': 'HTML/CSS',
  'html/css': 'HTML/CSS',
  'html5': 'HTML/CSS',
  'css3': 'HTML/CSS',

  // MongoDB
  'mongodb': 'MongoDB',
  'mongo': 'MongoDB',
  'nosql': 'MongoDB',

  // Docker
  'docker': 'Docker',
  'containerization': 'Docker',
  'containers': 'Docker',

  // Testing
  'testing': 'Testing',
  'unit testing': 'Testing',
  'integration testing': 'Testing',
  'jest': 'Testing',
  'qa': 'Testing',

  // Express
  'express': 'Express.js',
  'express.js': 'Express.js',
  'expressjs': 'Express.js',

  // REST APIs
  'rest': 'REST APIs',
  'rest api': 'REST APIs',
  'rest apis': 'REST APIs',
  'restful api': 'REST APIs',
  'api': 'REST APIs',
  'apis': 'REST APIs',

  // System Design
  'system design': 'System Design',
  'architecture': 'System Design',
  'software architecture': 'System Design',

  // Git
  'git': 'Git',
  'github': 'Git',
  'version control': 'Git',

  // TypeScript
  'typescript': 'TypeScript',
  'ts': 'TypeScript',

  // Tailwind CSS
  'tailwind': 'Tailwind CSS',
  'tailwind css': 'Tailwind CSS',
  'tailwindcss': 'Tailwind CSS',

  // Cloud / DevOps
  'linux': 'Linux',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  'aws': 'AWS/Azure',
  'azure': 'AWS/Azure',
  'aws/azure': 'AWS/Azure',
  'ci/cd': 'CI/CD',
  'cicd': 'CI/CD',
  'terraform': 'Terraform',
  'networking': 'Networking',

  // AI / ML
  'machine learning': 'Machine Learning',
  'ml': 'Machine Learning',
  'deep learning': 'Machine Learning',
  'tensorflow': 'TensorFlow/PyTorch',
  'pytorch': 'TensorFlow/PyTorch',
  'tensorflow/pytorch': 'TensorFlow/PyTorch',
  'pandas': 'Pandas',
  'numpy': 'Pandas',
  'data analysis': 'Data Analysis',
};

/**
 * Normalize any raw skill string to its canonical form
 */
export const normalizeSkillName = (rawSkill) => {
  if (!rawSkill || typeof rawSkill !== 'string') return '';
  const cleaned = rawSkill.trim().toLowerCase();
  return SKILL_ALIAS_MAP[cleaned] || rawSkill.trim();
};

/**
 * Check if two skill strings represent the same canonical skill
 */
export const isSameSkill = (skillA, skillB) => {
  if (!skillA || !skillB) return false;
  return normalizeSkillName(skillA).toLowerCase() === normalizeSkillName(skillB).toLowerCase();
};
