import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { uploadFile } from '../controllers/upload.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/', uploadFile);

export default router;