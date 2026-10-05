import express from 'express';
import {
  getAiInterviewSession,
  submitCandidateResponseAndGetNextQuestion,
  endAiInterview,
  synthesizeAvatarVoice
} from '../controllers/aiAvatarInterviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/session/:interviewId', getAiInterviewSession);
router.post('/next-question', submitCandidateResponseAndGetNextQuestion);
router.post('/synthesize-voice', synthesizeAvatarVoice);
router.post('/end', endAiInterview);

export default router;

