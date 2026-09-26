import express from 'express';
import { getCourses, getRecommendedCourses } from '../controllers/courseController.js';
import { protect } from '../middleware/auth.js';


const router = express.Router();

router.use(protect);

router.get('/', getCourses);
router.get('/recommended', getRecommendedCourses);

export default router;
