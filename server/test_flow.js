import mongoose from 'mongoose';
import User from './src/models/User.js';
import Profile from './src/models/Profile.js';
import CareerAnalysis from './src/models/CareerAnalysis.js';
import Roadmap from './src/models/Roadmap.js';
import { startSkillLearning, completeSkillLearning, validateSkill } from './src/controllers/profileController.js';
import { computeCandidateProgress } from './src/services/candidateProgressService.js';

const mockReq = (user, body) => ({ user, body });
const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.data = data; return res; };
  return res;
};

mongoose.connect('mongodb://127.0.0.1:27017/dishasetu').then(async () => {
  console.log('--- DB CONNECTED ---');
  const email = `test_flow_${Date.now()}@example.com`;
  let user = await User.create({ name: 'Test User', email, password: 'password', role: 'user', isOnboarded: true });

  // 1. SETUP CLEAN STATE
  const targetRole = 'Data Analyst';
  const initialVerified = ['Python']; // SQL is missing
  
  let profile = await Profile.create({ user: user._id, career: { targetRole }, skills: { currentSkills: initialVerified, readyForEvaluationSkills: [], learningSkills: [] } });

  // Setup CA
  let ca = new CareerAnalysis({ userId: user._id });
  ca.careers = [{
    role: targetRole,
    matchPercentage: 20,
    nextStep: 'Learn SQL',
    missingSkills: [{ skill: 'SQL', priority: 'High', reason: 'Req' }, { skill: 'Statistics', priority: 'High', reason: 'Req' }]
  }];
  await ca.save();

  // Setup RM
  let rm = new Roadmap({ user: user._id, targetRole, totalTasks: 2, completedTasks: 0, weeks: [
    { weekNumber: 1, title: 'W1', description: 'desc', tasks: [{ taskId: 't1', title: 'Learn SQL', description: 'desc', skill: 'SQL', completed: false }] },
    { weekNumber: 2, title: 'W2', description: 'desc', tasks: [{ taskId: 't2', title: 'Learn Stats', description: 'desc', skill: 'Statistics', completed: false }] }
  ]});
  await rm.save();

  // 2. CHECK INITIAL PROGRESS
  let prog = await computeCandidateProgress(user._id);
  console.log('[INITIAL STATE]');
  console.log('Gaps:', prog.skillGap.missingSkills.map(s => s.skill));
  console.log('Learning:', prog.learning.learningSkills);
  console.log('Roadmap Progress:', prog.roadmap.progress);
  console.log('Dashboard Gap Count:', prog._raw.topSkillGaps.length);

  // 3. START LEARNING
  console.log('\n[USER CLICKS START LEARNING SQL]');
  let req = mockReq(user, { skill: 'SQL' });
  let res = mockRes();
  await startSkillLearning(req, res);
  
  prog = await computeCandidateProgress(user._id);
  console.log('Learning:', prog.learning.learningSkills);
  
  // 4. COMPLETE COURSE
  console.log('\n[USER COMPLETES SQL COURSE]');
  req = mockReq(user, { skill: 'SQL' });
  res = mockRes();
  await completeSkillLearning(req, res);

  prog = await computeCandidateProgress(user._id);
  console.log('Learning:', prog.learning.learningSkills);
  console.log('Ready for validation:', prog.learning.readyForEvaluation);

  // 5. VALIDATION PASS
  console.log('\n[USER PASSES SQL VALIDATION]');
  req = mockReq(user, { skill: 'SQL', passed: true, score: 95 });
  res = mockRes();
  await validateSkill(req, res);

  prog = await computeCandidateProgress(user._id);
  console.log('Learning:', prog.learning.learningSkills);
  console.log('Ready for validation:', prog.learning.readyForEvaluation);
  console.log('Verified:', prog.skillAssessment.masteredList);
  console.log('Gaps:', prog.skillGap.missingSkills.map(s => s.skill));
  console.log('Roadmap Progress:', prog.roadmap.progress);
  console.log('Match Percentage:', prog.skillGap.matchPercentage);
  console.log('Dashboard Gap Count:', prog._raw.topSkillGaps.length);

  process.exit(0);
});
