import { Response } from 'express';
import {
  organizationIdParamSchema,
  listOrganizationsSchema,
  favoriteOrganizationSchema,
  favoritesPaginationSchema,
} from '../validators/organization-profile.validator.js';
import { AppError } from '../lib/errors.js';
import {
  getOrganizationProfile as getOrganizationProfileService,
  getAllOrganizations as getAllOrganizationsService,
  getFavoriteStatus as getFavoriteStatusService,
  toggleFavorite as toggleFavoriteService,
  getFavoriteOrganizationsWithPagination as getFavoriteOrganizationsWithPaginationService,
  getOrganizationNames as getOrganizationNamesService,
} from '../services/organization-profile.service.js';
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
 * GET /api/v1/organization-profiles
 */
export const getAllOrganizations = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const input = listOrganizationsSchema.parse(req.query);
    const data = await getAllOrganizationsService(input);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/organization-profiles/names
 */
export const getOrganizationNames = catchAsync(async (_req: AuthRequest, res: Response) => {
  try {
    const data = await getOrganizationNamesService();
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/organization-profiles/favorites/status/:organizationId
 */
export const getFavoriteStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const input = favoriteOrganizationSchema.parse({
      organizationId: paramString(req.params.organizationId),
    });
    const data = await getFavoriteStatusService(req.user!.id, input);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * PUT /api/v1/organization-profiles/favorites/:organizationId
 */
export const toggleFavorite = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const input = favoriteOrganizationSchema.parse({
      organizationId: paramString(req.params.organizationId),
    });
    const data = await toggleFavoriteService(req.user!.id, input);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/organization-profiles/favorites
 */
export const getFavoriteOrganizationsWithPagination = catchAsync(
  async (req: AuthRequest, res: Response) => {
    try {
      const input = favoritesPaginationSchema.parse(req.query);
      const data = await getFavoriteOrganizationsWithPaginationService(req.user!.id, input);
      sendResponse(res, 200, data);
    } catch (err) {
      handleServiceError(err, res);
    }
  },
);

/**
 * GET /api/v1/organization-profiles/:id
 */
export const getOrganizationProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = organizationIdParamSchema.parse(paramString(req.params.id));
    const data = await getOrganizationProfileService(req.user!.id, organizationId);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});