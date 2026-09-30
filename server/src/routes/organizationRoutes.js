import express from 'express';
import { getOrganizationProfile, upsertOrganizationProfile } from '../controllers/organizationProfileController.js';
import { protect, requireOrganization } from '../middleware/auth.js';

const router = express.Router();

// All organization routes require authentication and organization role
router.use(protect);
router.use(requireOrganization);

router.route('/profile')
  .get(getOrganizationProfile)
  .post(upsertOrganizationProfile)
  .put(upsertOrganizationProfile);

export default router;
