import express from 'express';
import { chatWithCopilot } from '../controllers/careerAssistantController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/chat', chatWithCopilot);

export default router;
