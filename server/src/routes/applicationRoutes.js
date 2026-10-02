import express from 'express';
import {
  applyToOpportunity,
  getApplicationStatus,
  getMyApplications,
  getCandidateApplicationDetails,
} from '../controllers/applicationController.js';
import { protect, requireCandidate } from '../middleware/auth.js';

const router = express.Router();

router.get('/my', protect, requireCandidate, getMyApplications);
router.get('/my-applications', protect, requireCandidate, getMyApplications);
router.get('/detail/:id', protect, requireCandidate, getCandidateApplicationDetails);
router.get('/status/:opportunityId', protect, requireCandidate, getApplicationStatus);
router.post('/:opportunityId', protect, requireCandidate, applyToOpportunity);

export default router;
