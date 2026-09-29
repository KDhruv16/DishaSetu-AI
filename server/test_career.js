import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { generateCareerAnalysis } from './src/services/aiService.js';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = (await import('./src/models/User.js')).default;
  const Profile = (await import('./src/models/Profile.js')).default;

  const user = await User.findOne({});
  let profile = await Profile.findOne({ user: user._id });

  if (profile) {
    console.log("=== RUN 1 ===");
    const res1 = await generateCareerAnalysis(profile);
    console.log("Match %:", res1.careers[0].matchPercentage);
    console.log("Matched Skills:", res1.careers[0].whyItMatches[0]);

    console.log("=== RUN 2 ===");
    const res2 = await generateCareerAnalysis(profile);
    console.log("Match %:", res2.careers[0].matchPercentage);
    console.log("Matched Skills:", res2.careers[0].whyItMatches[0]);

    console.log("=== RUN 3 (Add SQL) ===");
    profile.skills.currentSkills.push('SQL');
    const res3 = await generateCareerAnalysis(profile);
    console.log("Match %:", res3.careers[0].matchPercentage);
    console.log("Matched Skills:", res3.careers[0].whyItMatches[0]);

  } else {
    console.log('No data found.');
  }
  mongoose.disconnect();
}).catch(console.error);
