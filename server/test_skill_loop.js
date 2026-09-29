import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { computeCandidateProgress } from './src/services/candidateProgressService.js';
import { generateCareerAnalysis } from './src/services/aiService.js';
import { startSkillLearning, completeSkillLearning, validateSkill } from './src/controllers/profileController.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = (await import('./src/models/User.js')).default;
  const Profile = (await import('./src/models/Profile.js')).default;

  const user = await User.findOne({});
  let profile = await Profile.findOne({ user: user._id });

  if (profile) {
    const mockReq = (body) => ({ user: { _id: user._id }, body });
    const mockRes = () => ({ status: (code) => ({ json: (data) => console.log(data.message || data) }) });

    console.log("=== BEFORE LOOP ===");
    let cp = await computeCandidateProgress(user._id);
    console.log("Skill Gaps:", cp.skillGap.missingSkills.map(s => s.skill));
    console.log("Current Skills:", profile.skills.currentSkills);
    console.log("Career Match:", cp.skillGap.matchPercentage);

    console.log("\n=== START LEARNING: SQL ===");
    await startSkillLearning(mockReq({ skill: 'SQL' }), mockRes());
    
    console.log("\n=== COMPLETE LEARNING: SQL ===");
    await completeSkillLearning(mockReq({ skill: 'SQL' }), mockRes());
    
    console.log("\n=== FAILED VALIDATION: SQL ===");
    await validateSkill(mockReq({ skill: 'SQL', passed: false, score: 55 }), mockRes());
    
    profile = await Profile.findOne({ user: user._id });
    console.log("Ready for Evaluation:", profile.skills.readyForEvaluationSkills);

    console.log("\n=== PASSED VALIDATION: SQL ===");
    await validateSkill(mockReq({ skill: 'SQL', passed: true, score: 85 }), mockRes());
    
    console.log("\n=== AFTER LOOP ===");
    cp = await computeCandidateProgress(user._id);
    console.log("Skill Gaps:", cp.skillGap.missingSkills.map(s => s.skill));
    profile = await Profile.findOne({ user: user._id });
    console.log("Current Skills:", profile.skills.currentSkills);
    console.log("Career Match:", cp.skillGap.matchPercentage);

  } else {
    console.log('No data found.');
  }
  mongoose.disconnect();
}).catch(console.error);
