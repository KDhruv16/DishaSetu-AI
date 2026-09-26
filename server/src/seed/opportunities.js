import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Opportunity from '../models/Opportunity.js';

dotenv.config();

export const seedOpportunitiesData = [
  {
    title: 'Full Stack Web Development Intern',
    organization: 'MP State Electronics Development Corp (MPSEDC)',
    type: 'Internship',
    category: 'Technology',
    description:
      'Join the state e-Governance digitalization team building citizen-facing portals and internal API microservices using modern web stacks. Hands-on mentorship from senior state IT architects.',
    location: 'Bhopal / Hybrid',
    workMode: 'Hybrid',
    stipendOrSalary: '₹15,000 / month',
    skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'REST APIs'],
    eligibility: 'B.Tech / BCA / MCA / B.Sc (CS/IT) pre-final or final year students.',
    qualification: 'B.Tech (CS/IT) / BCA / MCA',
    experience: 'Fresher / Student (0-1 Years)',
    deadline: 'Rolling 2026 Batch',
    applicationUrl: 'https://mpsedc.mp.gov.in',
    source: 'MPSEDC Citizen Tech Initiative',
    sourceType: 'curated',
    isGovernment: true,
    isVerified: true,
  },
  {
    title: 'Associate Software Engineer (Full Stack)',
    organization: 'Infosys Innovation Development Hub',
    type: 'Job',
    category: 'Technology',
    description:
      'Full-time opening for entry-level developers to build scalable enterprise cloud microservices. Training provided on high-throughput backend architecture, CI/CD automation, and React frontend integration.',
    location: 'Indore, MP',
    workMode: 'On-site',
    stipendOrSalary: '₹4.5 - ₹6.2 LPA',
    skills: ['Java', 'Spring Boot', 'React', 'SQL', 'Git'],
    eligibility: 'Graduating batch 2025/2026 with minimum 60% aggregate.',
    qualification: 'B.Tech / B.E. / MCA',
    experience: 'Fresher (0-1 Years)',
    deadline: 'April 30, 2026',
    applicationUrl: 'https://www.infosys.com/careers',
    source: 'MP Campus Recruitment Drive 2026',
    sourceType: 'curated',
    isGovernment: false,
    isVerified: true,
  },
  {
    title: 'Backend Engineering Intern (Node.js & Cloud)',
    organization: 'CloudScale Technologies Pvt Ltd',
    type: 'Internship',
    category: 'Technology',
    description:
      'Work on building resilient distributed APIs, caching with Redis, MongoDB query optimization, and asynchronous message queues for high-traffic SaaS applications.',
    location: 'Remote / Indore',
    workMode: 'Remote',
    stipendOrSalary: '₹18,000 / month',
    skills: ['Node.js', 'Express', 'MongoDB', 'Docker', 'Redis'],
    eligibility: 'Demonstrated proficiency in building RESTful services and backend logic.',
    qualification: 'B.Tech / BCA / MCA / Self-taught developers',
    experience: 'Fresher / Student (0-1 Years)',
    deadline: 'May 15, 2026',
    applicationUrl: 'https://angel.co/company/cloudscale',
    source: 'Tech Startup Ecosystem',
    sourceType: 'curated',
    isGovernment: false,
    isVerified: true,
  },
  {
    title: 'Junior Data Analyst & Business Intelligence Trainee',
    organization: 'Madhya Pradesh State Data Centre (MPSDC)',
    type: 'Internship',
    category: 'Data',
    description:
      'Assist state departments in analyzing public service delivery metrics, building interactive Power BI dashboards, and writing SQL ETL pipelines for citizen welfare analytics.',
    location: 'Bhopal, MP',
    workMode: 'On-site',
    stipendOrSalary: '₹14,000 / month',
    skills: ['Python', 'SQL', 'Excel', 'Power BI', 'Statistics'],
    eligibility: 'Students with strong analytical problem solving and data visualization fundamentals.',
    qualification: 'B.Tech / B.Sc (Stats/CS) / BCA / MCA',
    experience: 'Fresher (0-1 Years)',
    deadline: 'May 20, 2026',
    applicationUrl: 'https://mpsedc.mp.gov.in',
    source: 'State Data Governance Cell',
    sourceType: 'curated',
    isGovernment: true,
    isVerified: true,
  },
  {
    title: 'National Apprenticeship Promotion Scheme (NAPS - IT/ITES)',
    organization: 'Ministry of Skill Development & Entrepreneurship (MSDE)',
    type: 'Apprenticeship',
    category: 'Skill Development',
    description:
      'Government subsidized 1-year on-the-job apprenticeship with designated industry partners across Madhya Pradesh. Features direct monthly DBT stipend support and NCVT certification.',
    location: 'Multiple Districts (Indore, Bhopal, Jabalpur, Gwalior)',
    workMode: 'On-site',
    stipendOrSalary: '₹9,000 - ₹12,000 / month (Govt Direct Benefit)',
    skills: ['Computer Fundamentals', 'Python', 'Web Development Basics', 'Database Management'],
    eligibility: 'All diploma, undergraduate degree holders and final year students.',
    qualification: 'Diploma / B.Sc / BCA / B.Tech / B.Com (Computers)',
    experience: 'Fresher (0-1 Years)',
    deadline: 'Ongoing Scheme 2026',
    applicationUrl: 'https://www.apprenticeshipindia.gov.in',
    source: 'Official NAPS Apprenticeship Portal',
    sourceType: 'curated',
    isGovernment: true,
    isVerified: true,
  },
  {
    title: 'MP Rojgar Setu Tech Mission & Placement Cohort',
    organization: 'MP State Skill Development & Employment Generation Board',
    type: 'Government',
    category: 'Public Sector',
    description:
      'Flagship state initiative bridging college graduates with IT companies in Madhya Pradesh. Includes free 6-week industry readiness bootcamps followed by guaranteed interview drives.',
    location: 'Bhopal / Indore / Jabalpur',
    workMode: 'Hybrid',
    stipendOrSalary: 'Free Training + Direct Industry Placement',
    skills: ['Full Stack Development', 'Cloud Fundamentals', 'Aptitude & Communication'],
    eligibility: 'Residents of MP enrolled in or graduated from recognized colleges in 2024, 2025, or 2026.',
    qualification: 'Graduate in any STEM discipline',
    experience: 'Fresher (0-1 Years)',
    deadline: 'June 30, 2026',
    applicationUrl: 'https://mprojgar.gov.in',
    source: 'MP Rojgar Official Portal',
    sourceType: 'curated',
    isGovernment: true,
    isVerified: true,
  },
  {
    title: 'Frontend React Developer (Graduate Trainee)',
    organization: 'CyberTech Global Solutions',
    type: 'Job',
    category: 'Technology',
    description:
      'Build responsive UI applications using React, Tailwind CSS, and state management tools. Excellent opportunity for fresh graduates with portfolio projects.',
    location: 'Indore / Hybrid',
    workMode: 'Hybrid',
    stipendOrSalary: '₹3.8 - ₹5.0 LPA',
    skills: ['React', 'JavaScript', 'HTML/CSS', 'Tailwind CSS', 'Redux'],
    eligibility: 'Final year students or recent 2025/2026 graduates with hands-on project work.',
    qualification: 'BCA / B.Sc CS / B.Tech',
    experience: 'Fresher (0-1 Years)',
    deadline: 'May 10, 2026',
    applicationUrl: 'https://cybertech.com/careers',
    source: 'IT Park Indore Employment Drive',
    sourceType: 'curated',
    isGovernment: false,
    isVerified: true,
  },
  {
    title: 'National Informatics Centre (NIC MP) Digital Fellow',
    organization: 'National Informatics Centre (NIC), Madhya Pradesh State Centre',
    type: 'Government',
    category: 'Public Sector',
    description:
      'Participate in national e-governance infrastructure, API integration pipelines, and open-source database management for public service systems.',
    location: 'Bhopal, MP',
    workMode: 'On-site',
    stipendOrSalary: '₹22,000 / month fellowship',
    skills: ['Java', 'SQL', 'Linux', 'Network Fundamentals', 'API Security'],
    eligibility: 'B.Tech / MCA graduates with minimum 65% aggregate.',
    qualification: 'B.Tech (CS/IT/ECE) / MCA',
    experience: 'Fresher (0-1 Years)',
    deadline: 'June 15, 2026',
    applicationUrl: 'https://mp.nic.in',
    source: 'NIC Madhya Pradesh State Centre',
    sourceType: 'curated',
    isGovernment: true,
    isVerified: true,
  },
  {
    title: 'Python & Data Analytics Trainee',
    organization: 'Insightix Data Labs',
    type: 'Internship',
    category: 'Data',
    description:
      'Assist in cleaning large enterprise datasets, building Pandas/NumPy data processing pipelines, and training entry-level machine learning regression/classification models.',
    location: 'Remote',
    workMode: 'Remote',
    stipendOrSalary: '₹12,000 / month',
    skills: ['Python', 'Pandas', 'NumPy', 'SQL', 'Data Visualization'],
    eligibility: 'Enthusiastic learners with solid Python scripting and database query skills.',
    qualification: 'Any STEM Degree / B.Tech / BCA',
    experience: 'Fresher (0-1 Years)',
    deadline: 'Rolling 2026 Batch',
    applicationUrl: 'https://insightix.ai/careers',
    source: 'DataTech Network',
    sourceType: 'curated',
    isGovernment: false,
    isVerified: true,
  },
  {
    title: 'PMKVY 4.0 Advanced Tech & Cloud Skills Apprenticeship',
    organization: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)',
    type: 'Apprenticeship',
    category: 'Skill Development',
    description:
      'Specialized central government program offering aligned training in cloud computing, modern full-stack web architectures, and cybersecurity with industry certifications and job assistance.',
    location: 'State Training Centers (Indore, Bhopal, Ujjain)',
    workMode: 'On-site',
    stipendOrSalary: 'Free Training + State Stipend Allowance',
    skills: ['Cloud Basics', 'Linux', 'JavaScript', 'Networking'],
    eligibility: 'Undergraduate students and recent graduates looking for hands-on technical skills.',
    qualification: 'Open to all graduates / pursuing students',
    experience: 'Fresher (0-1 Years)',
    deadline: 'July 31, 2026',
    applicationUrl: 'https://www.pmkvyofficial.org',
    source: 'Skill India Digital Hub',
    sourceType: 'curated',
    isGovernment: true,
    isVerified: true,
  },
];

export const seedOpportunities = async () => {
  try {
    const count = await Opportunity.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding initial curated opportunities dataset...');
      await Opportunity.insertMany(seedOpportunitiesData);
      console.log(`✅ Successfully seeded ${seedOpportunitiesData.length} curated opportunities!`);
    } else {
      console.log(`ℹ️ Opportunities collection already has ${count} records. Skipping initial seed.`);
    }
  } catch (error) {
    console.error('❌ Error during opportunities seeding:', error);
  }
};

// Standalone execution script if run directly: `node src/seed/opportunities.js`
if (process.argv[1]?.includes('opportunities.js')) {
  mongoose
    .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dishasetu')
    .then(async () => {
      console.log('🔗 Connected to MongoDB for seeding...');
      await Opportunity.deleteMany({});
      await Opportunity.insertMany(seedOpportunitiesData);
      console.log(`✨ Re-seeded ${seedOpportunitiesData.length} opportunities successfully!`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeder connection error:', err);
      process.exit(1);
    });
}
