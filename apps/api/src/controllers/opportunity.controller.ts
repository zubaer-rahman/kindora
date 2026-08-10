import { Response } from 'express';
import {
  createOpportunitySchema,
  updateOpportunitySchema,
  listQuerySchema,
} from '../validators/opportunity.validator.js';
import { AppError } from '../lib/errors.js';
import {
  createOpportunity as createOpportunityService,
  getAllOpportunities as getAllOpportunitiesService,
  getPublicOpportunities as getPublicOpportunitiesService,
  getPublicOpportunity as getPublicOpportunityService,
  getPublicOpportunitiesByMentor as getPublicOpportunitiesByMentorService,
  getOrganizationOpportunities as getOrganizationOpportunitiesService,
  getMentorOpportunities as getMentorOpportunitiesService,
  getMentorOpportunitiesCount as getMentorOpportunitiesCountService,
  getMentorOpportunitiesAll as getMentorOpportunitiesAllService,
  getAllOpportunitiesCount as getAllOpportunitiesCountService,
  getOpportunity as getOpportunityService,
  updateOpportunity as updateOpportunityService,
  archiveOpportunity as archiveOpportunityService,
  unarchiveOpportunity as unarchiveOpportunityService,
  deleteOpportunity as deleteOpportunityService,
} from '../services/opportunity.service.js';
import { catchAsync, sendResponse, sendError } from '../lib/http.js';
import { AuthRequest } from '../middleware/auth.js';

function handleServiceError(err: unknown, res: Response) {
  if (err instanceof AppError) sendError(res, err.statusCode, err.message);
  else throw err;
}

function paramString(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * POST /api/v1/opportunities
 */
export const createOpportunity = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = createOpportunitySchema.parse(req.body);
    const opportunity = await createOpportunityService(req.user!.id, body);
    sendResponse(res, 201, opportunity, 'Opportunity created successfully.');
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/opportunities
 */
export const getAllOpportunities = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const input = listQuerySchema.parse(req.query);
    const data = await getAllOpportunitiesService(req.user?.id, input);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/opportunities/public
 */
export const getPublicOpportunities = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const input = listQuerySchema.parse(req.query);
    const data = await getPublicOpportunitiesService(input);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/opportunities/public/:id
 */
export const getPublicOpportunity = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const opportunity = await getPublicOpportunityService(paramString(req.params.id));
    sendResponse(res, 200, opportunity);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/opportunities/public/by-mentor/:userId
 */
export const getPublicOpportunitiesByMentor = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const data = await getPublicOpportunitiesByMentorService(paramString(req.params.userId));
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/opportunities/my-org
 */
export const getOrganizationOpportunities = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const data = await getOrganizationOpportunitiesService(req.user!.id);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/opportunities/mentor
 */
export const getMentorOpportunities = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const input = listQuerySchema.parse(req.query);
    const data = await getMentorOpportunitiesService(req.user!.id, input);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/opportunities/mentor/count
 */
export const getMentorOpportunitiesCount = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const data = await getMentorOpportunitiesCountService(req.user!.id);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/opportunities/mentor/all
 */
export const getMentorOpportunitiesAll = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const data = await getMentorOpportunitiesAllService(req.user!.id);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/opportunities/count
 */
export const getAllOpportunitiesCount = catchAsync(async (_req: AuthRequest, res: Response) => {
  try {
    const data = await getAllOpportunitiesCountService();
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/opportunities/:id
 */
export const getOpportunity = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const opportunity = await getOpportunityService(paramString(req.params.id));
    sendResponse(res, 200, opportunity);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * PUT /api/v1/opportunities/:id
 */
export const updateOpportunity = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = updateOpportunitySchema.parse(req.body);
    const updated = await updateOpportunityService(req.user!.id, paramString(req.params.id), body);
    sendResponse(res, 200, updated, 'Opportunity updated successfully.');
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * PATCH /api/v1/opportunities/:id/archive
 */
export const archiveOpportunity = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const updated = await archiveOpportunityService(req.user!.id, paramString(req.params.id));
    sendResponse(res, 200, updated, 'Opportunity archived successfully.');
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * PATCH /api/v1/opportunities/:id/unarchive
 */
export const unarchiveOpportunity = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const data = await unarchiveOpportunityService(req.user!.id, paramString(req.params.id));
    sendResponse(res, 200, data, 'Opportunity unarchived successfully.');
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * DELETE /api/v1/opportunities/:id
 */
export const deleteOpportunity = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    await deleteOpportunityService(req.user!.id, paramString(req.params.id));
    sendResponse(res, 200, null, 'Opportunity deleted successfully.');
  } catch (err) {
    handleServiceError(err, res);
  }
});