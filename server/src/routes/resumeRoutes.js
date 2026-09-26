import express from 'express';
import multer from 'multer';
import {
  analyzeResume,
  getLatestAnalysis,
  improveResumeText,
} from '../controllers/resumeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Configure in-memory multer storage (max 5MB, PDF only)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'), false);
    }
  },
});

router.use(protect); // All routes protected

router.post('/analyze', upload.single('resume'), analyzeResume);
router.get('/latest', getLatestAnalysis);
router.post('/improve', improveResumeText);

export default router;
