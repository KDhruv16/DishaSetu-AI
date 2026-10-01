import express from 'express';
import { applyToOpportunity, getApplicationStatus } from '../controllers/applicationController.js';
import { protect, requireCandidate } from '../middleware/auth.js';

const router = express.Router();

router.post('/:opportunityId', protect, requireCandidate, applyToOpportunity);
router.get('/status/:opportunityId', protect, requireCandidate, getApplicationStatus);

export default router;
