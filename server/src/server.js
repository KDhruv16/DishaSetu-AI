import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import opportunityRoutes from './routes/opportunityRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import careerAssistantRoutes from './routes/careerAssistantRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import metaRoutes from './routes/metaRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import candidateInterviewRoutes from './routes/candidateInterviewRoutes.js';
import candidateHiringRoutes from './routes/candidateHiringRoutes.js';
import careerInterestRoutes from './routes/careerInterestRoutes.js';
import industryCategoryRoutes from './routes/industryCategoryRoutes.js';
import skillCategoryRoutes from './routes/skillCategoryRoutes.js';
import { seedOpportunities } from './seed/opportunities.js';
import { seedCourses } from './seed/courses.js';
import { seedDemoProfile } from './seed/demoProfile.js';
import { seedCareerInterests } from './seed/careerInterests.js';
import { seedIndustryCategories } from './seed/industryCategories.js';
import { seedSkillCategories } from './seed/skillCategories.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB Database & Seed initial datasets
connectDB().then(() => {
  seedOpportunities();
  seedCourses();
  seedDemoProfile();
  seedCareerInterests();
  seedIndustryCategories();
  seedSkillCategories();
});


const app = express();

// Middleware
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
    credentials: true,
  })
);
app.use(express.json());

// API Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    project: 'DISHA SETU AI',
    tagline: 'Bridging Campus to Career',
    hackathon: 'MP Online Hackathon 2026',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/career-assistant', careerAssistantRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/candidate/interviews', candidateInterviewRoutes);
app.use('/api/candidate/hiring', candidateHiringRoutes);
app.use('/api/master-data/career-interests', careerInterestRoutes);
app.use('/api/master-data/industry-categories', industryCategoryRoutes);
app.use('/api/master-data/skill-categories', skillCategoryRoutes);



// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 DishaSetu AI Server running on http://localhost:${PORT}`);
});


