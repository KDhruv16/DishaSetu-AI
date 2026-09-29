import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { computeCandidateProgress } from './src/services/candidateProgressService.js';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = (await import('./src/models/User.js')).default;
  const user = await User.findOne({});
  if (user) {
    const cp = await computeCandidateProgress(user._id);
    console.log(JSON.stringify(cp, null, 2));
  } else {
    console.log('No users found.');
  }
  mongoose.disconnect();
}).catch(console.error);
