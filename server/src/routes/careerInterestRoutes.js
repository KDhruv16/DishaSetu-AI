import express from 'express';
import {
  getCareerInterests,
  getActiveCareerInterests,
  createCareerInterest,
  updateCareerInterest,
  updateCareerInterestStatus,
  deleteCareerInterest,
} from '../controllers/careerInterestController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/active', getActiveCareerInterests);
router.get('/', protect, requireAdmin, getCareerInterests);
router.post('/', protect, requireAdmin, createCareerInterest);
router.put('/:id', protect, requireAdmin, updateCareerInterest);
router.patch('/:id/status', protect, requireAdmin, updateCareerInterestStatus);
router.delete('/:id', protect, requireAdmin, deleteCareerInterest);

export default router;
