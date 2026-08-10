import { Response } from 'express';
import {
  createSkillSchema,
  getSkillsSchema,
  incrementUsageSchema,
  getForMultiSelectSchema,
} from '../validators/skill.validator.js';
import { AppError } from '../lib/errors.js';
import {
  getAllSkills as getAllSkillsService,
  createSkill as createSkillService,
  incrementUsage as incrementUsageService,
  initializePredefined as initializePredefinedService,
  getForMultiSelect as getForMultiSelectService,
} from '../services/skill.service.js';
import { catchAsync, sendResponse, sendError } from '../lib/http.js';
import { AuthRequest } from '../middleware/auth.js';

function handleServiceError(err: unknown, res: Response) {
  if (err instanceof AppError) sendError(res, err.statusCode, err.message);
  else throw err;
}

/**
 * GET /api/v1/skills
 */
export const getAllSkills = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const query = getSkillsSchema.parse(req.query);
    const data = await getAllSkillsService(query);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * POST /api/v1/skills
 */
export const createSkill = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = createSkillSchema.parse(req.body);
    const data = await createSkillService(req.user!.id, body);
    sendResponse(res, 201, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * POST /api/v1/skills/increment-usage
 */
export const incrementUsage = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = incrementUsageSchema.parse(req.body);
    const data = await incrementUsageService(body);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * POST /api/v1/skills/initialize
 */
export const initializePredefined = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const data = await initializePredefinedService();
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/skills/multi-select
 */
export const getForMultiSelect = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const query = getForMultiSelectSchema.parse(req.query);
    const data = await getForMultiSelectService(query);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});