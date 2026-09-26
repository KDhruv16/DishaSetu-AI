import express from 'express';
import {
  getOpportunities,
  getRecommendedOpportunities,
  getOpportunityById,
} from '../controllers/opportunityController.js';
import { protect } from '../middleware/auth.js';


const router = express.Router();

// All opportunity routes require authentication to evaluate student profile
router.use(protect);

router.get('/', getOpportunities);
router.get('/recommended', getRecommendedOpportunities);
router.get('/:id', getOpportunityById);

export default router;
