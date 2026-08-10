import { Response } from 'express';
import {
  updateVolunteerProfileSchema,
  opportunityIdSchema,
  volunteerIdParamSchema,
  favoritesPaginationSchema,
} from '../validators/volunteer-profile.validator.js';
import { AppError } from '../lib/errors.js';
import {
  getVolunteerById as getVolunteerByIdService,
  updateVolunteerProfile as updateVolunteerProfileService,
  getVolunteerProfile as getVolunteerProfileService,
  getFavoriteStatus as getFavoriteStatusService,
  toggleFavorite as toggleFavoriteService,
  getFavoriteOpportunities as getFavoriteOpportunitiesService,
  getFavoriteOpportunitiesWithPagination as getFavoriteOpportunitiesWithPaginationService,
  getFavoriteOpportunitiesCount as getFavoriteOpportunitiesCountService,
} from '../services/volunteer-profile.service.js';
import { catchAsync, sendResponse, sendError } from '../lib/utils.js';
import { AuthRequest } from '../middleware/auth.js';

function handleServiceError(err: unknown, res: Response) {
  if (err instanceof AppError) sendError(res, err.statusCode, err.message);
  else throw err;
}

function paramString(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * GET /api/v1/volunteer-profiles/me
 */
export const getVolunteerProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const data = await getVolunteerProfileService(req.user!.id);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * PATCH /api/v1/volunteer-profiles/me
 */
export const updateVolunteerProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = updateVolunteerProfileSchema.parse(req.body);
    const profile = await updateVolunteerProfileService(req.user!.id, body);
    sendResponse(res, 200, profile, 'Volunteer profile updated successfully.');
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/volunteer-profiles/favorites
 */
export const getFavoriteOpportunities = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const data = await getFavoriteOpportunitiesService(req.user!.id);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/volunteer-profiles/favorites/paginated
 */
export const getFavoriteOpportunitiesWithPagination = catchAsync(
  async (req: AuthRequest, res: Response) => {
    try {
      const input = favoritesPaginationSchema.parse(req.query);
      const data = await getFavoriteOpportunitiesWithPaginationService(req.user!.id, input);
      sendResponse(res, 200, data);
    } catch (err) {
      handleServiceError(err, res);
    }
  },
);

/**
 * GET /api/v1/volunteer-profiles/favorites/count
 */
export const getFavoriteOpportunitiesCount = catchAsync(
  async (req: AuthRequest, res: Response) => {
    try {
      const data = await getFavoriteOpportunitiesCountService(req.user!.id);
      sendResponse(res, 200, data);
    } catch (err) {
      handleServiceError(err, res);
    }
  },
);

/**
 * GET /api/v1/volunteer-profiles/favorites/status/:opportunityId
 */
export const getFavoriteStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const input = opportunityIdSchema.parse({
      opportunityId: paramString(req.params.opportunityId),
    });
    const data = await getFavoriteStatusService(req.user!.id, input);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * PUT /api/v1/volunteer-profiles/favorites/:opportunityId
 */
export const toggleFavorite = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const input = opportunityIdSchema.parse({
      opportunityId: paramString(req.params.opportunityId),
    });
    const data = await toggleFavoriteService(req.user!.id, input);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/volunteer-profiles/:id
 */
export const getVolunteerById = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const volunteerId = volunteerIdParamSchema.parse(paramString(req.params.id));
    const data = await getVolunteerByIdService(volunteerId);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});