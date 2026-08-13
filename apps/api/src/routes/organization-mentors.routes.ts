import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireOrg, allowRoles } from '../middleware/role-guard.js';
import { UserRole } from '../db/interfaces/user.js';
import {
  inviteMentor,
  acceptInvitation,
  markAsMentor,
  removeMentor,
  toggleMentor,
  getOpportunityMentors,
  getMentors,
} from '../controllers/organization-mentors.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/organization/:organizationId', getMentors);
router.get('/opportunity/:opportunityId', getOpportunityMentors);
router.post('/invite', requireOrg, inviteMentor);
router.post('/accept-invitation', allowRoles(UserRole.MENTOR), acceptInvitation);
router.post('/mark-as-mentor', requireOrg, markAsMentor);
router.delete('/remove', requireOrg, removeMentor);
router.patch('/toggle', requireOrg, toggleMentor);

export default router;