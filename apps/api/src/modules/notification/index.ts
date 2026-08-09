import { router } from "@/server/trpc";
import { protectedProcedure } from "@/server/middlewares/with-auth";
import { TRPCError } from "@trpc/server";
import { JwtPayload } from "jsonwebtoken";
import { z } from "zod";
import User from "@/server/db/models/user";
import Notification from "@/server/db/models/notification";

export const notificationRouter = router({
  // Get user's notifications
  getUserNotifications: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(10),
      unreadOnly: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser || !sessionUser?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view notifications",
        });
      }

      try {
        const user = await User.findById(sessionUser.id);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const { page, limit, unreadOnly } = input;
        const skip = (page - 1) * limit;

        // Build query
        const query: Record<string, unknown> = { user: user._id };
        if (unreadOnly) {
          query.isRead = false;
        }

        // Get notifications
        const notifications = await Notification.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean();

        // Get total count
        const total = await Notification.countDocuments(query);

        return {
          notifications,
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        };
      } catch (error) {
        console.error("Error fetching notifications:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch notifications",
          cause: error,
        });
      }
    }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: notificationId }) => {
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser || !sessionUser?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to mark notifications as read",
        });
      }

      try {
        const user = await User.findById(sessionUser.id);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Update notification
        const notification = await Notification.findOneAndUpdate(
          { _id: notificationId, user: user._id },
          { isRead: true, readAt: new Date() },
          { new: true }
        );

        if (!notification) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Notification not found",
          });
        }

        return notification;
      } catch (error) {
        console.error("Error marking notification as read:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark notification as read",
          cause: error,
        });
      }
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser || !sessionUser?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to mark notifications as read",
        });
      }

      try {
        const user = await User.findById(sessionUser.id);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Update all unread notifications
        const result = await Notification.updateMany(
          { user: user._id, isRead: false },
          { isRead: true, readAt: new Date() }
        );

        return { success: true, updatedCount: result.modifiedCount };
      } catch (error) {
        console.error("Error marking all notifications as read:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark notifications as read",
          cause: error,
        });
      }
    }),

  // Get unread notification count
  getUnreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser || !sessionUser?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to get notification count",
        });
      }

      try {
        const user = await User.findById(sessionUser.id);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const count = await Notification.countDocuments({
          user: user._id,
          isRead: false,
        });

        return { count };
      } catch (error) {
        console.error("Error getting unread notification count:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get notification count",
          cause: error,
        });
      }
    }),

  // Get notification history/logs for debugging
  getNotificationHistory: protectedProcedure
    .query(async ({ ctx }) => {
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser || !sessionUser?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view notification history",
        });
      }

      try {
        const user = await User.findById(sessionUser.id);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Get all notifications for this user
        const notifications = await Notification.find({ user: user._id })
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();

        // Get all notifications in the system (for admin debugging)
        let allNotifications: unknown[] = [];
        if (user.role === 'admin') {
          allNotifications = await Notification.find()
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
            organization_profile: user.organization_profile
          }
        };
      } catch (error) {
        console.error("Error getting notification history:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get notification history",
          cause: error,
        });
      }
    }),
}); 