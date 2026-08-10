import { Response } from 'express';
import {
  getUserNotificationsSchema,
  markAsReadParamsSchema,
} from '../validators/notification.validator.js';
import { AppError } from '../lib/errors.js';
import {
  getUserNotifications as getUserNotificationsService,
  markAsRead as markAsReadService,
  markAllAsRead as markAllAsReadService,
  getUnreadCount as getUnreadCountService,
  getNotificationHistory as getNotificationHistoryService,
} from '../services/notification.service.js';
import { catchAsync, sendResponse, sendError } from '../lib/http.js';
import { AuthRequest } from '../middleware/auth.js';

function handleServiceError(err: unknown, res: Response) {
  if (err instanceof AppError) sendError(res, err.statusCode, err.message);
  else throw err;
}

/**
 * GET /api/v1/notifications
 */
export const getUserNotifications = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const query = getUserNotificationsSchema.parse(req.query);
    const data = await getUserNotificationsService(req.user!.id, query);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * PATCH /api/v1/notifications/read/:notificationId
 */
export const markAsRead = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const { notificationId } = markAsReadParamsSchema.parse(req.params);
    const data = await markAsReadService(req.user!.id, notificationId);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * POST /api/v1/notifications/read-all
 */
export const markAllAsRead = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const data = await markAllAsReadService(req.user!.id);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/notifications/unread-count
 */
export const getUnreadCount = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const data = await getUnreadCountService(req.user!.id);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/notifications/history
 */
export const getNotificationHistory = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const data = await getNotificationHistoryService(req.user!.id);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});