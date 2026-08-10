import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getAllSkills,
  createSkill,
  incrementUsage,
  initializePredefined,
  getForMultiSelect,
} from '../controllers/skill.controller.js';

const router = Router();

router.get('/', getAllSkills);
router.get('/multi-select', getForMultiSelect);
router.post('/increment-usage', incrementUsage);
router.post('/initialize', initializePredefined);

router.use(requireAuth);

router.post('/', createSkill);

export default router;