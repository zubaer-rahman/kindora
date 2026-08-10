import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  streamMessages,
  streamConversations,
} from '../controllers/sse.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/messages', streamMessages);
router.get('/conversations', streamConversations);

// add more streams here as needed

export default router;