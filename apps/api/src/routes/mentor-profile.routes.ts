import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getPublicMentors,
  getPublicMentorProfile,
  getMentorProfile,
  updateMentorProfile,
} from '../controllers/mentor-profile.controller.js';

const router = Router();

router.get('/public', getPublicMentors);
router.get('/public/:userId', getPublicMentorProfile);

router.use(requireAuth);

router.get('/me', getMentorProfile);
router.patch('/me', updateMentorProfile);

export default router;