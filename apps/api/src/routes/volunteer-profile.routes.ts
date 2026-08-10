import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getVolunteerProfile,
  updateVolunteerProfile,
  getFavoriteOpportunities,
  getFavoriteOpportunitiesWithPagination,
  getFavoriteOpportunitiesCount,
  getFavoriteStatus,
  toggleFavorite,
  getVolunteerById,
} from '../controllers/volunteer-profile.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/me', getVolunteerProfile);
router.patch('/me', updateVolunteerProfile);
router.get('/favorites', getFavoriteOpportunities);
router.get('/favorites/paginated', getFavoriteOpportunitiesWithPagination);
router.get('/favorites/count', getFavoriteOpportunitiesCount);
router.get('/favorites/status/:opportunityId', getFavoriteStatus);
router.put('/favorites/:opportunityId', toggleFavorite);
router.get('/:id', getVolunteerById);

export default router;