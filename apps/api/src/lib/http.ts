import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async route handler and forwards errors to the Express global error handler.
 */
export const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };

/**
 * Standard API response helper
 */
export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  data: T,
  message = 'Success'
) => {
  res.status(statusCode).json({ success: true, message, data });
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string
) => {
  res.status(statusCode).json({ success: false, message });
};
