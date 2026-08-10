import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
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
router.post('/invite', inviteMentor);
router.post('/accept-invitation', acceptInvitation);
router.post('/mark-as-mentor', markAsMentor);
router.delete('/remove', removeMentor);
router.patch('/toggle', toggleMentor);

export default router;