import express from 'express';
import { getOrganizationProfile, upsertOrganizationProfile } from '../controllers/organizationProfileController.js';
import { 
  getOrganizationOpportunities, 
  createOpportunity, 
  getOrganizationOpportunity, 
  updateOpportunity, 
  deleteOpportunity 
} from '../controllers/organizationOpportunityController.js';
import {
  getOrganizationApplications,
  getApplicationDetails,
  updateApplicationStatus,
  evaluateApplication
} from '../controllers/organizationApplicationController.js';
import {
  scheduleInterview,
  getOrganizationInterviews,
  updateInterview,
  cancelInterview,
  submitInterviewFeedback,
  setInterviewType
} from '../controllers/organizationInterviewController.js';
import {
  createOffer,
  getOrganizationHiring,
  updateHiringStatus,
  getHiringByApplication
} from '../controllers/organizationHiringController.js';
import {
  getApplicationNotes,
  createApplicationNote
} from '../controllers/organizationNoteController.js';
import { protect, requireOrganization } from '../middleware/auth.js';

const router = express.Router();

// All organization routes require authentication and organization role
router.use(protect);
router.use(requireOrganization);

router.route('/profile')
  .get(getOrganizationProfile)
  .post(upsertOrganizationProfile)
  .put(upsertOrganizationProfile);

router.route('/opportunities')
  .get(getOrganizationOpportunities)
  .post(createOpportunity);

router.route('/opportunities/:id')
  .get(getOrganizationOpportunity)
  .put(updateOpportunity)
  .delete(deleteOpportunity);

router.route('/applications')
  .get(getOrganizationApplications);

router.route('/applications/:id')
  .get(getApplicationDetails);

router.route('/applications/:id/status')
  .patch(updateApplicationStatus);

router.route('/applications/:id/evaluate')
  .post(evaluateApplication);

router.route('/interviews')
  .get(getOrganizationInterviews)
  .post(scheduleInterview);

router.route('/interviews/:id')
  .put(updateInterview);

router.route('/interviews/:id/type')
  .patch(setInterviewType);

router.route('/interviews/:id/cancel')
  .patch(cancelInterview);

router.route('/interviews/:id/feedback')
  .patch(submitInterviewFeedback);

router.route('/hiring')
  .get(getOrganizationHiring)
  .post(createOffer);

router.route('/hiring/:id/status')
  .patch(updateHiringStatus);

router.route('/hiring/application/:applicationId')
  .get(getHiringByApplication);

router.route('/notes')
  .post(createApplicationNote);

router.route('/notes/application/:applicationId')
  .get(getApplicationNotes);

export default router;
