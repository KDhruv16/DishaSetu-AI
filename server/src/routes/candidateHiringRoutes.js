import express from 'express';
import { getCandidateOffers, respondToOffer } from '../controllers/candidateHiringController.js';
import { protect, requireCandidate } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(requireCandidate);

router.route('/')
  .get(getCandidateOffers);

router.route('/:id/respond')
  .patch(respondToOffer);

export default router;
