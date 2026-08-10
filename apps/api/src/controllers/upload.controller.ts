import { Response } from 'express';
import { uploadFileSchema } from '../validators/upload.validator.js';
import { AppError } from '../lib/errors.js';
import { uploadFile as uploadFileService } from '../services/upload.service.js';
import { catchAsync, sendResponse, sendError } from '../lib/http.js';
import { AuthRequest } from '../middleware/auth.js';

function handleServiceError(err: unknown, res: Response) {
  if (err instanceof AppError) sendError(res, err.statusCode, err.message);
  else throw err;
}

/**
 * POST /api/v1/upload
 */
export const uploadFile = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = uploadFileSchema.parse(req.body);
    const data = await uploadFileService(body);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});