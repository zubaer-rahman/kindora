import { Response } from 'express';
import {
  getRosterShiftsParamsSchema,
  createShiftSchema,
  shiftIdParamsSchema,
  updateShiftSchema,
  assignVolunteerSchema,
  updateVolunteerStatusSchema,
  signupForShiftSchema,
} from '../validators/roster.validator.js';
import { AppError } from '../lib/errors.js';
import {
  getRosterShifts as getRosterShiftsService,
  createShift as createShiftService,
  updateShift as updateShiftService,
  deleteShift as deleteShiftService,
  assignVolunteer as assignVolunteerService,
  unassignVolunteer as unassignVolunteerService,
  updateVolunteerStatus as updateVolunteerStatusService,
  signupForShift as signupForShiftService,
  withdrawFromShift as withdrawFromShiftService,
} from '../services/roster.service.js';
import { catchAsync, sendResponse, sendError } from '../lib/http.js';
import { AuthRequest } from '../middleware/auth.js';

function handleServiceError(err: unknown, res: Response) {
  if (err instanceof AppError) sendError(res, err.statusCode, err.message);
  else throw err;
}

/**
 * GET /api/v1/rosters/opportunity/:opportunityId/shifts
 */
export const getRosterShifts = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const input = getRosterShiftsParamsSchema.parse(req.params);
    const data = await getRosterShiftsService(req.user!.id, input);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * POST /api/v1/rosters/shifts
 */
export const createShift = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = createShiftSchema.parse(req.body);
    const data = await createShiftService(req.user!.id, body);
    sendResponse(res, 201, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * PATCH /api/v1/rosters/shifts/:shiftId
 */
export const updateShift = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = { ...req.params, ...req.body } as {
      shiftId: string;
      title: string;
      date: string;
      startTime: string;
      endTime: string;
      role: string;
      maxVolunteers: number;
    };
    const parsed = updateShiftSchema.parse(body);
    const data = await updateShiftService(req.user!.id, parsed);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * DELETE /api/v1/rosters/shifts/:shiftId
 */
export const deleteShift = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const { shiftId } = shiftIdParamsSchema.parse(req.params);
    const data = await deleteShiftService(req.user!.id, { shiftId });
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * POST /api/v1/rosters/shifts/:shiftId/assign
 */
export const assignVolunteer = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = { ...req.params, ...req.body } as {
      shiftId: string;
      volunteerId: string;
    };
    const parsed = assignVolunteerSchema.parse(body);
    const data = await assignVolunteerService(req.user!.id, parsed);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * DELETE /api/v1/rosters/shifts/:shiftId/assign
 */
export const unassignVolunteer = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = { shiftId: req.params.shiftId, ...req.body } as {
      shiftId: string;
      volunteerId: string;
    };
    const parsed = assignVolunteerSchema.parse(body);
    const data = await unassignVolunteerService(req.user!.id, parsed);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * PATCH /api/v1/rosters/shifts/:shiftId/status
 */
export const updateVolunteerStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = { ...req.params, ...req.body } as {
      shiftId: string;
      volunteerId: string;
      status: 'pending' | 'confirmed' | 'absent';
    };
    const parsed = updateVolunteerStatusSchema.parse(body);
    const data = await updateVolunteerStatusService(req.user!.id, parsed);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * POST /api/v1/rosters/shifts/:shiftId/signup
 */
export const signupForShift = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const { shiftId } = signupForShiftSchema.parse(req.params);
    const data = await signupForShiftService(req.user!.id, { shiftId });
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * POST /api/v1/rosters/shifts/:shiftId/withdraw
 */
export const withdrawFromShift = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const { shiftId } = signupForShiftSchema.parse(req.params);
    const data = await withdrawFromShiftService(req.user!.id, { shiftId });
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});