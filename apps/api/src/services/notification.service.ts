/* eslint-disable @typescript-eslint/no-explicit-any */
import User from '../db/models/user';
import Notification from '../db/models/notification';
import { AppError } from '../lib/errors.js';
import {
  GetUserNotificationsQuery,
  MarkAsReadParams,
} from '../validators/notification.validator.js';

// Cast models to avoid Mongoose union-type generic issues with .find() overloads
const UserModel = User as any;
const NotificationModel = Notification as any;

export async function getUserNotifications(
  userId: string,
  input: GetUserNotificationsQuery,
) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const { page, limit, unreadOnly } = input;
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = { user: user._id };
  if (unreadOnly) {
    query.isRead = false;
  }

  const notifications = await NotificationModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await NotificationModel.countDocuments(query);

  return {
    notifications,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}

export async function markAsRead(userId: string, notificationId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const notification = await NotificationModel.findOneAndUpdate(
    { _id: notificationId, user: user._id },
    { isRead: true, readAt: new Date() },
    { new: true },
  );

  if (!notification) {
    throw new AppError(404, 'Notification not found');
  }

  return notification;
}

export async function markAllAsRead(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const result = await NotificationModel.updateMany(
    { user: user._id, isRead: false },
    { isRead: true, readAt: new Date() },
  );

  return { success: true, updatedCount: result.modifiedCount };
}

export async function getUnreadCount(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const count = await NotificationModel.countDocuments({
    user: user._id,
    isRead: false,
  });

  return { count };
}

export async function getNotificationHistory(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const notifications = await NotificationModel.find({ user: user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  let allNotifications: unknown[] = [];
  if (user.role === 'admin') {
    allNotifications = await NotificationModel.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  }

  return {
    userNotifications: notifications,
    allNotifications: user.role === 'admin' ? allNotifications : [],
    userInfo: {
      name: user.name,
      email: user.email,
      role: user.role,
      organization_profile: user.organization_profile,
    },
  };
}