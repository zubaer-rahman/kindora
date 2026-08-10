import { Response } from 'express';
import {
  recruitApplicantSchema,
  recruitedApplicantsQuerySchema,
} from '../validators/organisation-recruitment.validator.js';
import { AppError } from '../lib/errors.js';
import {
  getRecruitmentStatus as getRecruitmentStatusService,
  recruitApplicant as recruitApplicantService,
  getRecruitedApplicants as getRecruitedApplicantsService,
} from '../services/organisation-recruitment.service.js';
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
 * GET /api/v1/recruitments/status/:applicationId
 */
export const getRecruitmentStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const input = recruitApplicantSchema.parse({
      applicationId: paramString(req.params.applicationId),
    });
    const data = await getRecruitmentStatusService(input);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * POST /api/v1/recruitments
 */
export const recruitApplicant = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = recruitApplicantSchema.parse(req.body);
    const recruitment = await recruitApplicantService(req.user!.id, body);
    sendResponse(res, 201, recruitment, 'Applicant recruited successfully.');
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/recruitments
 */
export const getRecruitedApplicants = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const input = recruitedApplicantsQuerySchema.parse(req.query);
    const data = await getRecruitedApplicantsService(req.user!.id, input);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});