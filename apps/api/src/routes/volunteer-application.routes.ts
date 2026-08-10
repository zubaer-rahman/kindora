import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getVolunteerApplications,
  getApplicationStatus,
  getCurrentUserApplications,
  getCurrentUserActiveApplications,
  getCurrentUserApprovedApplications,
  getCurrentUserRecentApplications,
  getCurrentUserActiveApplicationsCount,
  getCurrentUserRecentApplicationsCount,
  applyToOpportunity,
  revokeApplication,
  getFavoriteStatus,
  toggleFavorite,
  getVolunteersByOpportunity,
  getOpportunityApplicants,
  getDynamicCompletedOpportunities,
} from '../controllers/volunteer-application.controller.js';

const router = Router();

router.get('/volunteer/:volunteerId', getVolunteerApplications);

router.use(requireAuth);

router.get('/completed/count', getDynamicCompletedOpportunities);
router.get('/status/:opportunityId', getApplicationStatus);
router.get('/favorite-status/:opportunityId', getFavoriteStatus);
router.put('/favorite/:opportunityId', toggleFavorite);
router.get('/volunteers/:opportunityId', getVolunteersByOpportunity);
router.get('/applicants/:opportunityId', getOpportunityApplicants);
router.get('/me/active/count', getCurrentUserActiveApplicationsCount);
router.get('/me/recent/count', getCurrentUserRecentApplicationsCount);
router.get('/me/active', getCurrentUserActiveApplications);
router.get('/me/approved', getCurrentUserApprovedApplications);
router.get('/me/recent', getCurrentUserRecentApplications);
router.get('/me', getCurrentUserApplications);

router.post('/apply', applyToOpportunity);
router.delete('/:opportunityId', revokeApplication);

export default router;