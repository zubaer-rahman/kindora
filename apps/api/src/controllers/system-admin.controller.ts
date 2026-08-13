import { Response } from 'express';
import { catchAsync, sendResponse, sendError } from '../lib/http.js';
import { AppError } from '../lib/errors.js';
import { AuthRequest } from '../middleware/auth.js';
import User from '../db/models/user.js';
import bcrypt from 'bcryptjs';

const SYSTEM_ADMIN_DOMAIN = '.kindora.com';

const UserModel = User as any;

function isSystemAdmin(req: AuthRequest): boolean {
  return (
    !!req.user?.email &&
    req.user.email.endsWith(SYSTEM_ADMIN_DOMAIN) &&
    req.user.role === 'system_admin'
  );
}

/**
 * GET /api/v1/admin/users
 * List all users (system-admin only)
 */
export const listAllUsers = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!isSystemAdmin(req)) return sendError(res, 403, 'System admin access required.');

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = (req.query.search as string) || '';
  const skip = (page - 1) * limit;

  const query = search
    ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] }
    : {};

  const [users, total] = await Promise.all([
    UserModel.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),
    UserModel.countDocuments(query),
  ]);

  sendResponse(res, 200, {
    users,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  });
});

/**
 * PATCH /api/v1/admin/users/:userId/block
 * Block or unblock a user (system-admin only)
 */
export const setUserBlockStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!isSystemAdmin(req)) return sendError(res, 403, 'System admin access required.');

  const { userId } = req.params;
  const { is_blocked } = req.body;

  if (typeof is_blocked !== 'boolean') {
    return sendError(res, 400, 'is_blocked must be a boolean.');
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { is_blocked },
    { new: true }
  ).select('-password');

  if (!user) throw new AppError(404, 'User not found.');
  sendResponse(res, 200, user, `User ${is_blocked ? 'blocked' : 'unblocked'} successfully.`);
});

/**
 * PATCH /api/v1/admin/users/:userId/password
 * Set a new password for any user (system-admin only)
 */
export const setUserPassword = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!isSystemAdmin(req)) return sendError(res, 403, 'System admin access required.');

  const { userId } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return sendError(res, 400, 'Password must be at least 6 characters.');
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  const user = await UserModel.findByIdAndUpdate(userId, { password: hashed }, { new: true }).select('-password');
  if (!user) throw new AppError(404, 'User not found.');

  sendResponse(res, 200, null, 'Password updated successfully.');
});

/**
 * PATCH /api/v1/admin/users/:userId
 * Edit basic user info (system-admin only)
 */
export const editUser = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!isSystemAdmin(req)) return sendError(res, 403, 'System admin access required.');

  const { userId } = req.params;
  const { name, role } = req.body;

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { ...(name && { name }), ...(role && { role }) },
    { new: true }
  ).select('-password');

  if (!user) throw new AppError(404, 'User not found.');
  sendResponse(res, 200, user, 'User updated successfully.');
});

/**
 * DELETE /api/v1/admin/users/:userId
 * Delete any user (system-admin only)
 */
export const deleteAnyUser = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!isSystemAdmin(req)) return sendError(res, 403, 'System admin access required.');

  const { userId } = req.params;
  const user = await UserModel.findByIdAndDelete(userId);
  if (!user) throw new AppError(404, 'User not found.');

  sendResponse(res, 200, null, 'User deleted successfully.');
});
