import { Response } from 'express';
import {
  getAvailableUsersSchema,
  onlineStatusQuerySchema,
  getOrganizationUsersSchema,
  userIdParamSchema,
  updateUserSchema,
  resetPasswordSchema,
  volunteerProfileSchema,
  mentorProfileSchema,
  organizationProfileSchema,
  updateUserRoleSchema,
} from '../validators/user.validator.js';
import { AppError } from '../lib/errors.js';
import {
  getAvailableUsers as getAvailableUsersService,
  updateUser as updateUserService,
  profileCheckup as profileCheckupService,
  setupVolunteerProfile as setupVolunteerProfileService,
  setupMentorProfile as setupMentorProfileService,
  setupOrgProfile as setupOrgProfileService,
  resetPassword as resetPasswordService,
  getOrganizationUsers as getOrganizationUsersService,
  updateUserRole as updateUserRoleService,
  demoteMentor as demoteMentorService,
  deleteUser as deleteUserService,
  sendHeartbeat as sendHeartbeatService,
  getUsersOnlineStatus as getUsersOnlineStatusService,
  getPublicVolunteers as getPublicVolunteersService,
} from '../services/user.service.js';
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
 * GET /api/v1/users/public/volunteers
 */
export const getPublicVolunteers = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const input = getAvailableUsersSchema.parse(req.query);
    const data = await getPublicVolunteersService(input);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * POST /api/v1/users/reset-password
 */
export const resetPassword = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = resetPasswordSchema.parse(req.body);
    const data = await resetPasswordService(body);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/users/available
 */
export const getAvailableUsers = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const input = getAvailableUsersSchema.parse(req.query);
    const data = await getAvailableUsersService(req.user!.id, input);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/users/me/profile-checkup
 */
export const profileCheckup = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const data = await profileCheckupService(req.user!.id);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * PATCH /api/v1/users/me
 */
export const updateUser = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = updateUserSchema.parse(req.body);
    const user = await updateUserService(req.user!.id, body);
    sendResponse(res, 200, user, 'User updated successfully.');
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * POST /api/v1/users/me/volunteer-profile
 */
export const setupVolunteerProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = volunteerProfileSchema.parse(req.body);
    const profile = await setupVolunteerProfileService(req.user!.id, body);
    sendResponse(res, 201, profile, 'Volunteer profile created successfully.');
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * POST /api/v1/users/me/mentor-profile
 */
export const setupMentorProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = mentorProfileSchema.parse(req.body);
    const profile = await setupMentorProfileService(req.user!.id, body);
    sendResponse(res, 201, profile, 'Mentor profile created successfully.');
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * POST /api/v1/users/me/organization-profile
 */
export const setupOrgProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = organizationProfileSchema.parse(req.body);
    const profile = await setupOrgProfileService(req.user!.id, body);
    sendResponse(res, 201, profile, 'Organization profile saved successfully.');
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/users/organization/:organizationId
 */
export const getOrganizationUsers = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const input = getOrganizationUsersSchema.parse({
      organizationId: paramString(req.params.organizationId),
    });
    const data = await getOrganizationUsersService(req.user!.id, input);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * POST /api/v1/users/heartbeat
 */
export const sendHeartbeat = catchAsync(async (_req: AuthRequest, res: Response) => {
  try {
    const data = await sendHeartbeatService();
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/users/online-status
 */
export const getUsersOnlineStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const input = onlineStatusQuerySchema.parse(req.query);
    const data = await getUsersOnlineStatusService(input);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * PATCH /api/v1/users/:userId/role
 */
export const updateUserRole = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = updateUserRoleSchema.parse({
      userId: paramString(req.params.userId),
      role: req.body.role,
    });
    const user = await updateUserRoleService(req.user!.id, body);
    sendResponse(res, 200, user, 'User role updated successfully.');
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * POST /api/v1/users/:userId/demote
 */
export const demoteMentor = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const input = userIdParamSchema.parse({
      userId: paramString(req.params.userId),
    });
    const user = await demoteMentorService(req.user!.id, input);
    sendResponse(res, 200, user, 'Mentor demoted successfully.');
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * DELETE /api/v1/users/:userId
 */
export const deleteUser = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const input = userIdParamSchema.parse({
      userId: paramString(req.params.userId),
    });
    await deleteUserService(req.user!.id, input);
    sendResponse(res, 200, null, 'User deleted successfully.');
  } catch (err) {
    handleServiceError(err, res);
  }
});