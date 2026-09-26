import express from 'express';
import {
  getCareerAnalysis,
  refreshCareerAnalysis,
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All AI routes are protected by JWT

router.get('/career-analysis', getCareerAnalysis);
router.post('/career-analysis', refreshCareerAnalysis);

export default router;
