import express from 'express';
import { getCandidateInterviews, confirmInterview } from '../controllers/candidateOrganizationInterviewController.js';
import { protect, requireCandidate } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(requireCandidate);

router.route('/')
  .get(getCandidateInterviews);

router.route('/:id/confirm')
  .patch(confirmInterview);

export default router;
