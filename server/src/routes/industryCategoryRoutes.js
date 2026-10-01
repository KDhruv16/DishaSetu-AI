import express from 'express';
import {
  getIndustryCategories,
  getActiveIndustryCategories,
  createIndustryCategory,
  updateIndustryCategory,
  updateIndustryCategoryStatus,
  deleteIndustryCategory,
} from '../controllers/industryCategoryController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/active', getActiveIndustryCategories);
router.get('/', protect, requireAdmin, getIndustryCategories);
router.post('/', protect, requireAdmin, createIndustryCategory);
router.put('/:id', protect, requireAdmin, updateIndustryCategory);
router.patch('/:id/status', protect, requireAdmin, updateIndustryCategoryStatus);
router.delete('/:id', protect, requireAdmin, deleteIndustryCategory);

export default router;
