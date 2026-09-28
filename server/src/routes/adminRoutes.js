import express from 'express';
import { protect, requireAdmin } from '../middleware/auth.js';
import {
  getDashboardStats,
  getEducationList,
  createEducation,
  updateEducation,
  toggleEducation,
  deleteEducation,
  getTargetRoles,
  createTargetRole,
  updateTargetRole,
  toggleTargetRole,
  deleteTargetRole,
  getSkills,
  createSkill,
  updateSkill,
  toggleSkill,
  deleteSkill,
  getRoleSkillMappings,
  createRoleSkillMapping,
  updateRoleSkillMapping,
  toggleRoleSkillMapping,
  deleteRoleSkillMapping,
  getInterviewQuestions,
  createInterviewQuestion,
  updateInterviewQuestion,
  toggleInterviewQuestion,
  deleteInterviewQuestion,
  getLearningResources,
  createLearningResource,
  updateLearningResource,
  toggleLearningResource,
  deleteLearningResource,
  getRoadmapTemplates,
  createRoadmapTemplate,
  updateRoadmapTemplate,
  toggleRoadmapTemplate,
  deleteRoadmapTemplate,
  getUsers,
  getUserById,
  toggleUserStatus,
  getSettings,
  updateSettings,
} from '../controllers/adminController.js';

const router = express.Router();

// Apply Authentication + Admin Authorization on all admin endpoints
router.use(protect);
router.use(requireAdmin);

// Dashboard Statistics
router.get('/stats', getDashboardStats);

// Education Management
router.get('/education', getEducationList);
router.post('/education', createEducation);
router.put('/education/:id', updateEducation);
router.patch('/education/:id/toggle', toggleEducation);
router.delete('/education/:id', deleteEducation);

// Target Roles Management
router.get('/roles', getTargetRoles);
router.post('/roles', createTargetRole);
router.put('/roles/:id', updateTargetRole);
router.patch('/roles/:id/toggle', toggleTargetRole);
router.delete('/roles/:id', deleteTargetRole);

// Skills Management
router.get('/skills', getSkills);
router.post('/skills', createSkill);
router.put('/skills/:id', updateSkill);
router.patch('/skills/:id/toggle', toggleSkill);
router.delete('/skills/:id', deleteSkill);

// Role -> Skill Mappings
router.get('/role-skills', getRoleSkillMappings);
router.post('/role-skills', createRoleSkillMapping);
router.put('/role-skills/:id', updateRoleSkillMapping);
router.patch('/role-skills/:id/toggle', toggleRoleSkillMapping);
router.delete('/role-skills/:id', deleteRoleSkillMapping);

// Interview Question Bank
router.get('/questions', getInterviewQuestions);
router.post('/questions', createInterviewQuestion);
router.put('/questions/:id', updateInterviewQuestion);
router.patch('/questions/:id/toggle', toggleInterviewQuestion);
router.delete('/questions/:id', deleteInterviewQuestion);

// Learning Resources
router.get('/learning', getLearningResources);
router.post('/learning', createLearningResource);
router.put('/learning/:id', updateLearningResource);
router.patch('/learning/:id/toggle', toggleLearningResource);
router.delete('/learning/:id', deleteLearningResource);

// Roadmap Templates
router.get('/roadmaps', getRoadmapTemplates);
router.post('/roadmaps', createRoadmapTemplate);
router.put('/roadmaps/:id', updateRoadmapTemplate);
router.patch('/roadmaps/:id/toggle', toggleRoadmapTemplate);
router.delete('/roadmaps/:id', deleteRoadmapTemplate);

// Candidate / User Management
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/toggle', toggleUserStatus);

// Platform Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
