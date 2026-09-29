import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { calculateOpportunityMatch, calculateApplicationReadiness } from './src/services/matchingService.js';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = (await import('./src/models/User.js')).default;
  const Profile = (await import('./src/models/Profile.js')).default;
  const Opportunity = (await import('./src/models/Opportunity.js')).default;

  const user = await User.findOne({});
  const profile = await Profile.findOne({ user: user._id });
  const opps = await Opportunity.find({}).limit(1);

  if (profile && opps.length > 0) {
    const opp = opps[0];
    console.log("=== Profile ===");
    console.log(profile.personal?.degree, profile.career?.targetRole);
    console.log("=== MATCH ===");
    const match = calculateOpportunityMatch(opp, profile);
    console.log(match.matchPercentage, match.whyItMatches);
    
    console.log("=== READINESS ===");
    const readiness = calculateApplicationReadiness(opp, profile, null, null);
    console.log(readiness.score, readiness.status);
    console.log("Factors:", readiness.factors);
  } else {
    console.log('No data found.');
  }
  mongoose.disconnect();
}).catch(console.error);
