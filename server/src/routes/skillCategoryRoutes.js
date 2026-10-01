import express from 'express';
import {
  getSkillCategories,
  getActiveSkillCategories,
  createSkillCategory,
  updateSkillCategory,
  deleteSkillCategory,
  toggleSkillCategoryStatus
} from '../controllers/skillCategoryController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public / Semi-public routes (for candidates/orgs loading forms)
router.get('/active', getActiveSkillCategories);

// Admin only routes
router.use(protect);
router.use(requireAdmin);

router.route('/')
  .get(getSkillCategories)
  .post(createSkillCategory);

router.route('/:id')
  .put(updateSkillCategory)
  .delete(deleteSkillCategory);

router.patch('/:id/status', toggleSkillCategoryStatus);

export default router;
