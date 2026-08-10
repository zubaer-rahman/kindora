import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getAllOrganizations,
  getOrganizationNames,
  getFavoriteStatus,
  toggleFavorite,
  getFavoriteOrganizationsWithPagination,
  getOrganizationProfile,
} from '../controllers/organization-profile.controller.js';

const router = Router();

router.get('/', getAllOrganizations);

router.use(requireAuth);

router.get('/names', getOrganizationNames);
router.get('/favorites', getFavoriteOrganizationsWithPagination);
router.get('/favorites/status/:organizationId', getFavoriteStatus);
router.put('/favorites/:organizationId', toggleFavorite);
router.get('/:id', getOrganizationProfile);

export default router;