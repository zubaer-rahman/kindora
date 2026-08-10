import { Response } from 'express';
import {
  inviteMentorSchema,
  acceptInvitationSchema,
  mentorAssignmentSchema,
  opportunityMentorsQuerySchema,
  organizationMentorsQuerySchema,
} from '../validators/organization-mentors.validator.js';
import { AppError } from '../lib/errors.js';
import {
  inviteMentor as inviteMentorService,
  acceptInvitation as acceptInvitationService,
  markAsMentor as markAsMentorService,
  removeMentor as removeMentorService,
  toggleMentor as toggleMentorService,
  getOpportunityMentors as getOpportunityMentorsService,
  getMentors as getMentorsService,
} from '../services/organization-mentors.service.js';
import { catchAsync, sendResponse, sendError } from '../lib/http.js';
import { AuthRequest } from '../middleware/auth.js';

function handleServiceError(err: unknown, res: Response) {
  if (err instanceof AppError) sendError(res, err.statusCode, err.message);
  else throw err;
}

/**
 * POST /api/v1/organization-mentors/invite
 */
export const inviteMentor = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = inviteMentorSchema.parse(req.body);
    const data = await inviteMentorService(req.user!.id, body);
    sendResponse(res, 201, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * POST /api/v1/organization-mentors/accept-invitation
 */
export const acceptInvitation = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = acceptInvitationSchema.parse(req.body);
    const data = await acceptInvitationService(body);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * POST /api/v1/organization-mentors/mark-as-mentor
 */
export const markAsMentor = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = mentorAssignmentSchema.parse(req.body);
    const data = await markAsMentorService(req.user!.id, body);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * DELETE /api/v1/organization-mentors/remove
 */
export const removeMentor = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = mentorAssignmentSchema.parse(req.body);
    const data = await removeMentorService(req.user!.id, body);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * PATCH /api/v1/organization-mentors/toggle
 */
export const toggleMentor = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = mentorAssignmentSchema.parse(req.body);
    const data = await toggleMentorService(req.user!.id, body);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/organization-mentors/opportunity/:opportunityId
 */
export const getOpportunityMentors = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const input = opportunityMentorsQuerySchema.parse({
      opportunityId: req.params.opportunityId,
    });
    const data = await getOpportunityMentorsService(req.user!.id, input);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/organization-mentors/organization/:organizationId
 */
export const getMentors = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const input = organizationMentorsQuerySchema.parse({
      organizationId: req.params.organizationId,
    });
    const data = await getMentorsService(req.user!.id, input);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});