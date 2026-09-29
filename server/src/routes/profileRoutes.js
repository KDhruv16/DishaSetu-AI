import express from 'express';
import {
  getProfile,
  saveOnboardingProfile,
  updateProfile,
  getNextBestStepHandler,
  getCandidateProgress,
  startSkillLearning,
  completeSkillLearning,
  validateSkill,
} from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All profile routes are protected

router.get('/', getProfile);
router.get('/next-best-step', getNextBestStepHandler);
router.get('/candidate-progress', getCandidateProgress);
router.post('/onboarding', saveOnboardingProfile);
router.put('/', updateProfile);

// Closed Loop Skill Engine Routes
router.post('/skills/learn', startSkillLearning);
router.post('/skills/complete-learning', completeSkillLearning);
router.post('/skills/validate', validateSkill);

export default router;

