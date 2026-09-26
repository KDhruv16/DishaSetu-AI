import express from 'express';
import {
  startInterview,
  submitAnswer,
  getLatestInterview,
} from '../controllers/interviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All interview routes are protected

router.post('/start', startInterview);
router.post('/:id/answer', submitAnswer);
router.get('/latest', getLatestInterview);

export default router;
