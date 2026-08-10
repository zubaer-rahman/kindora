import { Response } from 'express';
import {
  updateMentorProfileSchema,
  getPublicMentorsSchema,
  publicMentorProfileSchema,
} from '../validators/mentor-profile.validator.js';
import { AppError } from '../lib/errors.js';
import {
  getPublicMentors as getPublicMentorsService,
  getPublicMentorProfile as getPublicMentorProfileService,
  getMentorProfile as getMentorProfileService,
  updateMentorProfile as updateMentorProfileService,
} from '../services/mentor-profile.service.js';
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
 * GET /api/v1/mentor-profiles/public
 */
export const getPublicMentors = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const input = getPublicMentorsSchema.parse(req.query);
    const data = await getPublicMentorsService(input);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/mentor-profiles/public/:userId
 */
export const getPublicMentorProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const input = publicMentorProfileSchema.parse({
      userId: paramString(req.params.userId),
    });
    const data = await getPublicMentorProfileService(input);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/mentor-profiles/me
 */
export const getMentorProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const data = await getMentorProfileService(req.user!.id);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * PATCH /api/v1/mentor-profiles/me
 */
export const updateMentorProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = updateMentorProfileSchema.parse(req.body);
    const profile = await updateMentorProfileService(req.user!.id, body);
    sendResponse(res, 200, profile, 'Mentor profile updated successfully.');
  } catch (err) {
    handleServiceError(err, res);
  }
});