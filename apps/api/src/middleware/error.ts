import { Request, Response, NextFunction } from 'express';
import env from '../config/env.js';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (env.env !== 'production') {
    console.error(`[ERROR] ${req.method} ${req.url} —`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.code && { code: err.code }),
    ...(env.env !== 'production' && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`,
  });
};
