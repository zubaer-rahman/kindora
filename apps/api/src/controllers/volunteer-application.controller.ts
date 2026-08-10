import { Response } from 'express';
import {
  getApplicationStatusSchema,
  applyToOpportunitySchema,
  getOpportunityApplicantsSchema,
  volunteerIdParamSchema,
  paginationSchema,
  completedOpportunitiesQuerySchema,
} from '../validators/volunteer-application.validator.js';
import { AppError } from '../lib/errors.js';
import {
  getApplicationStatus as getApplicationStatusService,
  getVolunteerApplications as getVolunteerApplicationsService,
  getCurrentUserApplications as getCurrentUserApplicationsService,
  getCurrentUserActiveApplications as getCurrentUserActiveApplicationsService,
  getCurrentUserApprovedApplications as getCurrentUserApprovedApplicationsService,
  getCurrentUserRecentApplications as getCurrentUserRecentApplicationsService,
  getCurrentUserActiveApplicationsCount as getCurrentUserActiveApplicationsCountService,
  getCurrentUserRecentApplicationsCount as getCurrentUserRecentApplicationsCountService,
  applyToOpportunity as applyToOpportunityService,
  revokeApplication as revokeApplicationService,
  getFavoriteStatus as getFavoriteStatusService,
  toggleFavorite as toggleFavoriteService,
  getVolunteersByOpportunity as getVolunteersByOpportunityService,
  getOpportunityApplicants as getOpportunityApplicantsService,
  getDynamicCompletedOpportunities as getDynamicCompletedOpportunitiesService,
} from '../services/volunteer-application.service.js';
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
 * GET /api/v1/applications/volunteer/:volunteerId
 */
export const getVolunteerApplications = catchAsync(
  async (req: AuthRequest, res: Response) => {
    try {
      const volunteerId = volunteerIdParamSchema.parse(
        paramString(req.params.volunteerId),
      );
      const data = await getVolunteerApplicationsService(volunteerId);
      sendResponse(res, 200, data);
    } catch (err) {
      handleServiceError(err, res);
    }
  },
);

/**
 * GET /api/v1/applications/status/:opportunityId
 */
export const getApplicationStatus = catchAsync(
  async (req: AuthRequest, res: Response) => {
    try {
      const input = getApplicationStatusSchema.parse({
        opportunityId: paramString(req.params.opportunityId),
      });
      const data = await getApplicationStatusService(req.user!.id, input);
      sendResponse(res, 200, data);
    } catch (err) {
      handleServiceError(err, res);
    }
  },
);

/**
 * GET /api/v1/applications/me
 */
export const getCurrentUserApplications = catchAsync(
  async (req: AuthRequest, res: Response) => {
    try {
      const input = paginationSchema.parse(req.query);
      const data = await getCurrentUserApplicationsService(req.user!.id, input);
      sendResponse(res, 200, data);
    } catch (err) {
      handleServiceError(err, res);
    }
  },
);

/**
 * GET /api/v1/applications/me/active
 */
export const getCurrentUserActiveApplications = catchAsync(
  async (req: AuthRequest, res: Response) => {
    try {
      const input = paginationSchema.parse(req.query);
      const data = await getCurrentUserActiveApplicationsService(req.user!.id, input);
      sendResponse(res, 200, data);
    } catch (err) {
      handleServiceError(err, res);
    }
  },
);

/**
 * GET /api/v1/applications/me/approved
 */
export const getCurrentUserApprovedApplications = catchAsync(
  async (req: AuthRequest, res: Response) => {
    try {
      const input = paginationSchema.parse(req.query);
      const data = await getCurrentUserApprovedApplicationsService(req.user!.id, input);
      sendResponse(res, 200, data);
    } catch (err) {
      handleServiceError(err, res);
    }
  },
);

/**
 * GET /api/v1/applications/me/recent
 */
export const getCurrentUserRecentApplications = catchAsync(
  async (req: AuthRequest, res: Response) => {
    try {
      const input = paginationSchema.parse(req.query);
      const data = await getCurrentUserRecentApplicationsService(req.user!.id, input);
      sendResponse(res, 200, data);
    } catch (err) {
      handleServiceError(err, res);
    }
  },
);

/**
 * GET /api/v1/applications/me/active/count
 */
export const getCurrentUserActiveApplicationsCount = catchAsync(
  async (_req: AuthRequest, res: Response) => {
    try {
      const data = await getCurrentUserActiveApplicationsCountService(_req.user!.id);
      sendResponse(res, 200, data);
    } catch (err) {
      handleServiceError(err, res);
    }
  },
);

/**
 * GET /api/v1/applications/me/recent/count
 */
export const getCurrentUserRecentApplicationsCount = catchAsync(
  async (_req: AuthRequest, res: Response) => {
    try {
      const data = await getCurrentUserRecentApplicationsCountService(_req.user!.id);
      sendResponse(res, 200, data);
    } catch (err) {
      handleServiceError(err, res);
    }
  },
);

/**
 * POST /api/v1/applications/apply
 */
export const applyToOpportunity = catchAsync(
  async (req: AuthRequest, res: Response) => {
    try {
      const body = applyToOpportunitySchema.parse(req.body);
      const application = await applyToOpportunityService(req.user!.id, body);
      sendResponse(res, 201, application, 'Application submitted successfully.');
    } catch (err) {
      handleServiceError(err, res);
    }
  },
);

/**
 * DELETE /api/v1/applications/:opportunityId
 */
export const revokeApplication = catchAsync(
  async (req: AuthRequest, res: Response) => {
    try {
      const input = getApplicationStatusSchema.parse({
        opportunityId: paramString(req.params.opportunityId),
      });
      await revokeApplicationService(req.user!.id, input);
      sendResponse(res, 200, null, 'Application revoked successfully.');
    } catch (err) {
      handleServiceError(err, res);
    }
  },
);

/**
 * GET /api/v1/applications/favorite-status/:opportunityId
 */
export const getFavoriteStatus = catchAsync(
  async (req: AuthRequest, res: Response) => {
    try {
      const input = getApplicationStatusSchema.parse({
        opportunityId: paramString(req.params.opportunityId),
      });
      const data = await getFavoriteStatusService(req.user!.id, input);
      sendResponse(res, 200, data);
    } catch (err) {
      handleServiceError(err, res);
    }
  },
);

/**
 * PUT /api/v1/applications/favorite/:opportunityId
 */
export const toggleFavorite = catchAsync(
  async (req: AuthRequest, res: Response) => {
    try {
      const input = getApplicationStatusSchema.parse({
        opportunityId: paramString(req.params.opportunityId),
      });
      const data = await toggleFavoriteService(req.user!.id, input);
      sendResponse(res, 200, data);
    } catch (err) {
      handleServiceError(err, res);
    }
  },
);

/**
 * GET /api/v1/applications/volunteers/:opportunityId
 */
export const getVolunteersByOpportunity = catchAsync(
  async (req: AuthRequest, res: Response) => {
    try {
      const input = getApplicationStatusSchema.parse({
        opportunityId: paramString(req.params.opportunityId),
      });
      const data = await getVolunteersByOpportunityService(req.user!.id, input);
      sendResponse(res, 200, data);
    } catch (err) {
      handleServiceError(err, res);
    }
  },
);

/**
 * GET /api/v1/applications/applicants/:opportunityId
 */
export const getOpportunityApplicants = catchAsync(
  async (req: AuthRequest, res: Response) => {
    try {
      const input = getOpportunityApplicantsSchema.parse({
        opportunityId: paramString(req.params.opportunityId),
      });
      const data = await getOpportunityApplicantsService(req.user!.id, input);
      sendResponse(res, 200, data);
    } catch (err) {
      handleServiceError(err, res);
    }
  },
);

/**
 * GET /api/v1/applications/completed/count
 */
export const getDynamicCompletedOpportunities = catchAsync(
  async (req: AuthRequest, res: Response) => {
    try {
      const input = completedOpportunitiesQuerySchema.parse(req.query);
      const data = await getDynamicCompletedOpportunitiesService(req.user!.id, input);
      sendResponse(res, 200, data);
    } catch (err) {
      handleServiceError(err, res);
    }
  },
);