import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireSystemAdmin } from '../middleware/role-guard.js';
import {
  listAllUsers,
  setUserBlockStatus,
  setUserPassword,
  editUser,
  deleteAnyUser,
} from '../controllers/system-admin.controller.js';

const router = Router();

router.use(requireAuth, requireSystemAdmin);

router.get('/users', listAllUsers);
router.patch('/users/:userId/block', setUserBlockStatus);
router.patch('/users/:userId/password', setUserPassword);
router.patch('/users/:userId', editUser);
router.delete('/users/:userId', deleteAnyUser);

export default router;
