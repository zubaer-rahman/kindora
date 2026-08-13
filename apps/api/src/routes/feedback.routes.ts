import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireSystemAdmin } from '../middleware/role-guard.js';
import {
  createFeedback,
  getAllFeedback,
  getMyFeedback,
} from '../controllers/feedback.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/all', requireSystemAdmin, getAllFeedback);
router.get('/mine', getMyFeedback);
router.post('/', createFeedback);

export default router;