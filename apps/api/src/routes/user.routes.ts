import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getPublicVolunteers,
  resetPassword,
  getAvailableUsers,
  profileCheckup,
  updateUser,
  setupVolunteerProfile,
  setupMentorProfile,
  setupOrgProfile,
  getOrganizationUsers,
  sendHeartbeat,
  getUsersOnlineStatus,
  updateUserRole,
  demoteMentor,
  deleteUser,
} from '../controllers/user.controller.js';

const router = Router();

router.get('/public/volunteers', getPublicVolunteers);
router.post('/reset-password', resetPassword);

router.use(requireAuth);

router.get('/available', getAvailableUsers);
router.get('/me/profile-checkup', profileCheckup);
router.patch('/me', updateUser);
router.post('/me/volunteer-profile', setupVolunteerProfile);
router.post('/me/mentor-profile', setupMentorProfile);
router.post('/me/organization-profile', setupOrgProfile);
router.get('/organization/:organizationId', getOrganizationUsers);
router.post('/heartbeat', sendHeartbeat);
router.get('/online-status', getUsersOnlineStatus);

router.patch('/:userId/role', updateUserRole);
router.post('/:userId/demote', demoteMentor);
router.delete('/:userId', deleteUser);

export default router;