import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getRecruitmentStatus,
  recruitApplicant,
  getRecruitedApplicants,
} from '../controllers/organisation-recruitment.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/status/:applicationId', getRecruitmentStatus);
router.get('/', getRecruitedApplicants);
router.post('/', recruitApplicant);

export default router;