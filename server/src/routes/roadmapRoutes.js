import express from 'express';
import {
  getRoadmap,
  generateRoadmap,
  toggleTask,
} from '../controllers/roadmapController.js';
import { protect } from '../middleware/auth.js';


const router = express.Router();

router.use(protect);

router.get('/', getRoadmap);
router.post('/generate', generateRoadmap);
router.patch('/task/:taskId', toggleTask);

export default router;
