import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

import User from '../models/User.js';
import Education from '../models/Education.js';
import TargetRole from '../models/TargetRole.js';
import Skill from '../models/Skill.js';
import RoleSkillMapping from '../models/RoleSkillMapping.js';
import InterviewQuestion from '../models/InterviewQuestion.js';
import LearningResource from '../models/LearningResource.js';
import RoadmapTemplate from '../models/RoadmapTemplate.js';
import PlatformSetting from '../models/PlatformSetting.js';
import { generateQuestions } from '../services/interviewService.js';

async function runVerification() {
  console.log('====================================================');
  console.log('STARTING COMPLETE ADMIN SYSTEM VERIFICATION SUITE');
  console.log('====================================================');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dishasetu';
  await mongoose.connect(mongoUri);
  console.log('✓ Connected to MongoDB');

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@dishasetu.ai').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@DishaSetu2026';

  // 1. Verify Admin Account in DB
  const adminUser = await User.findOne({ email: adminEmail }).select('+password');
  if (!adminUser) {
    throw new Error(`Admin user not found for email: ${adminEmail}`);
  }
  if (adminUser.role !== 'admin') {
    throw new Error(`Admin user has incorrect role: ${adminUser.role}`);
  }
  const isMatch = await bcrypt.compare(adminPassword, adminUser.password);
  if (!isMatch) {
    throw new Error('Admin password hash mismatch');
  }
  console.log(`✓ 1. Admin account exists with role="admin" and valid password hash (${adminEmail})`);

  // 2. Verify Candidate vs Admin authorization checks
  let candidateUser = await User.findOne({ email: 'test_candidate_eval@dishasetu.ai' });
  if (!candidateUser) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('CandidatePass123', salt);
    candidateUser = await User.create({
      name: 'Test Candidate',
      email: 'test_candidate_eval@dishasetu.ai',
      password: hash,
      role: 'user',
      isActive: true,
      targetRole: 'Data Analyst'
    });
  }
  if (candidateUser.role === 'admin') {
    throw new Error('Candidate user should NOT have role="admin"');
  }
  console.log('✓ 2. Candidate user strictly has role="user"');

  // 3. Verify Database Master Data Counts
  const [
    totalCandidates,
    totalRoles,
    totalSkills,
    totalMappings,
    totalQuestions,
    totalResources,
    totalTemplates,
    totalEducations
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    TargetRole.countDocuments(),
    Skill.countDocuments(),
    RoleSkillMapping.countDocuments(),
    InterviewQuestion.countDocuments(),
    LearningResource.countDocuments(),
    RoadmapTemplate.countDocuments(),
    Education.countDocuments(),
  ]);

  console.log(`✓ 3. Real Database Master Data Counts:
       - Candidates: ${totalCandidates}
       - Educations: ${totalEducations}
       - Target Roles: ${totalRoles}
       - Skills: ${totalSkills}
       - Role-Skill Mappings: ${totalMappings}
       - Interview Questions: ${totalQuestions}
       - Learning Resources: ${totalResources}
       - Roadmap Templates: ${totalTemplates}`);

  if (totalEducations === 0 || totalRoles === 0 || totalSkills === 0 || totalQuestions === 0) {
    throw new Error('Master data tables are unseeded!');
  }

  // 4. Test Education Management (Create, Disable, Active Query)
  const testEduName = 'M.S. in Artificial Intelligence (Test)';
  await Education.deleteMany({ name: testEduName });
  const createdEdu = await Education.create({
    name: testEduName,
    category: 'Postgraduate',
    specializations: ['Deep Learning', 'Robotics', 'NLP'],
    isActive: true
  });
  console.log(`✓ 4a. Admin created education: "${createdEdu.name}"`);

  let activeEdus = await Education.find({ isActive: true });
  if (!activeEdus.some(e => e.name === testEduName)) {
    throw new Error('Newly created education not found in active list');
  }

  createdEdu.isActive = false;
  await createdEdu.save();
  activeEdus = await Education.find({ isActive: true });
  if (activeEdus.some(e => e.name === testEduName)) {
    throw new Error('Disabled education should NOT appear in active list');
  }
  console.log('✓ 4b. Admin disabled education; verified it disappeared from candidate active options');
  await Education.deleteOne({ _id: createdEdu._id });

  // 5. Test Target Role Management
  const testRoleName = 'Quantum Computing Engineer (Test)';
  await TargetRole.deleteMany({ name: testRoleName });
  const createdRole = await TargetRole.create({
    name: testRoleName,
    category: 'Emerging Tech',
    description: 'Quantum circuits and algorithms',
    isActive: true
  });
  console.log(`✓ 5a. Admin created target role: "${createdRole.name}"`);

  let activeRoles = await TargetRole.find({ isActive: true });
  if (!activeRoles.some(r => r.name === testRoleName)) {
    throw new Error('Newly created target role not found in active roles');
  }
  createdRole.isActive = false;
  await createdRole.save();
  activeRoles = await TargetRole.find({ isActive: true });
  if (activeRoles.some(r => r.name === testRoleName)) {
    throw new Error('Disabled target role should NOT appear in candidate options');
  }
  console.log('✓ 5b. Admin disabled target role; verified candidate list excludes disabled role');
  await TargetRole.deleteOne({ _id: createdRole._id });

  // 6. Test Skill Management & Normalization
  const testSkillName = 'Rust Programming (Test)';
  await Skill.deleteMany({ name: testSkillName });
  const createdSkill = await Skill.create({
    name: testSkillName,
    category: 'Programming Languages',
    description: 'Systems programming with safety guarantees',
    isActive: true
  });
  console.log(`✓ 6a. Admin created skill: "${createdSkill.name}" (normalized: ${createdSkill.normalizedName})`);
  await Skill.deleteOne({ _id: createdSkill._id });

  // 7. Test Role-Skill Mapping
  const mapping = await RoleSkillMapping.findOne({ roleName: 'Data Analyst', skillName: 'SQL' });
  if (!mapping) {
    throw new Error('Role-Skill mapping for Data Analyst -> SQL missing');
  }
  console.log(`✓ 7. Verified Role-Skill Mapping: "${mapping.roleName}" -> "${mapping.skillName}" (Priority: ${mapping.priority}, Level: ${mapping.requiredLevel})`);

  // 8. Test Interview Question Bank & Dynamic Question Generation
  const activeQuestions = await InterviewQuestion.find({ isActive: true, role: 'Data Analyst' });
  console.log(`✓ 8a. Found ${activeQuestions.length} active questions in DB question bank for Data Analyst`);
  
  const generated = await generateQuestions('Data Analyst', 'Technical', 'Medium', ['SQL', 'Python', 'Excel'], ['SQL', 'Python', 'Excel']);
  console.log(`✓ 8b. Dynamic Interview Question generator produced ${generated.length} questions from question bank:`);
  generated.forEach((q, idx) => {
    console.log(`     Q${idx + 1} [${q.category}]: "${q.questionText.substring(0, 65)}..."`);
  });
  if (generated.length === 0) {
    throw new Error('Generated 0 interview questions');
  }

  // 9. Test Learning Resource Management
  const learningResources = await LearningResource.find({ isActive: true });
  console.log(`✓ 9. Found ${learningResources.length} active learning resources for candidate roadmap enrichment`);

  // 10. Test Platform Settings
  const settings = await PlatformSetting.find();
  console.log(`✓ 10. Found ${settings.length} configurable platform settings:`, settings.map(s => s.key));

  console.log('====================================================');
  console.log('ALL ADMIN MANAGEMENT SYSTEM VERIFICATIONS PASSED (100%)');
  console.log('====================================================');

  await mongoose.disconnect();
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
