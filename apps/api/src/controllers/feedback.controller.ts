import { Response } from 'express';
import { createFeedbackSchema, getFeedbackSchema } from '../validators/feedback.validator.js';
import { AppError } from '../lib/errors.js';
import {
  createFeedback as createFeedbackService,
  getAllFeedback as getAllFeedbackService,
  getMyFeedback as getMyFeedbackService,
} from '../services/feedback.service.js';
import { catchAsync, sendResponse, sendError } from '../lib/utils.js';
import { AuthRequest } from '../middleware/auth.js';

function handleServiceError(err: unknown, res: Response) {
  if (err instanceof AppError) sendError(res, err.statusCode, err.message);
  else throw err;
}

/**
 * POST /api/v1/feedback
 */
export const createFeedback = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = createFeedbackSchema.parse(req.body);
    const data = await createFeedbackService(req.user!.id, body);
    sendResponse(res, 201, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/feedback/all
 */
export const getAllFeedback = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const query = getFeedbackSchema.parse(req.query);
    const data = await getAllFeedbackService(req.user!.id, req.user!.role, query);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/feedback/mine
 */
export const getMyFeedback = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const query = getFeedbackSchema.parse(req.query);
    const data = await getMyFeedbackService(req.user!.id, query);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});