import express from 'express';
import {
  getProfile,
  saveOnboardingProfile,
  updateProfile,
  getNextBestStepHandler,
} from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All profile routes are protected

router.get('/', getProfile);
router.get('/next-best-step', getNextBestStepHandler);
router.post('/onboarding', saveOnboardingProfile);
router.put('/', updateProfile);

export default router;

