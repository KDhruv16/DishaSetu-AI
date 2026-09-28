import express from 'express';
import {
  getMetaOptions,
  getActiveEducation,
  getActiveRoles,
  getActiveSkills,
} from '../controllers/metaController.js';

const router = express.Router();

router.get('/options', getMetaOptions);
router.get('/education', getActiveEducation);
router.get('/roles', getActiveRoles);
router.get('/skills', getActiveSkills);

export default router;
