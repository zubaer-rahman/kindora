import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getRosterShifts,
  createShift,
  updateShift,
  deleteShift,
  assignVolunteer,
  unassignVolunteer,
  updateVolunteerStatus,
  signupForShift,
  withdrawFromShift,
} from '../controllers/roster.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/opportunity/:opportunityId/shifts', getRosterShifts);
router.post('/shifts', createShift);
router.patch('/shifts/:shiftId', updateShift);
router.delete('/shifts/:shiftId', deleteShift);
router.post('/shifts/:shiftId/assign', assignVolunteer);
router.delete('/shifts/:shiftId/assign', unassignVolunteer);
router.patch('/shifts/:shiftId/status', updateVolunteerStatus);
router.post('/shifts/:shiftId/signup', signupForShift);
router.post('/shifts/:shiftId/withdraw', withdrawFromShift);

export default router;