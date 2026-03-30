import { router } from "../../trpc";
import { protectedProcedure } from "../../middlewares/with-auth";
import { Feedback } from "../../db/models";
import { createFeedbackSchema, getFeedbackSchema } from "./feedback.validation";
import { TRPCError } from "@trpc/server";
import { JwtPayload } from "jsonwebtoken";

export const feedbackRouter = router({
  // Create feedback - protected procedure (requires authentication)
  createFeedback: protectedProcedure
    .input(createFeedbackSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to submit feedback",
          });
        }

        const feedback = new Feedback({
          userId: sessionUser.id,
          message: input.message,
        });

        await feedback.save();

        return {
          success: true,
          message: "Feedback submitted successfully",
          feedback: {
            _id: feedback._id,
            message: feedback.message,
            createdAt: feedback.createdAt,
          },
        };
      } catch (error) {
        console.error("Error creating feedback:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit feedback",
        });
      }
    }),

  // Get all feedback - admin only
  getAllFeedback: protectedProcedure
    .input(getFeedbackSchema)
    .query(async ({ input, ctx }) => {
      const sessionUser = ctx.user as JwtPayload;
      // Check if user is admin
      if (!sessionUser?.role || sessionUser.role !== 'admin') {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }
      try {
        const { page, limit } = input;
        const skip = (page - 1) * limit;

        const [feedback, total] = await Promise.all([
          Feedback.find()
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          Feedback.countDocuments(),
        ]);

        return {
          feedback,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        console.error("Error fetching feedback:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch feedback",
        });
      }
    }),

  // Get user's own feedback
  getMyFeedback: protectedProcedure
    .input(getFeedbackSchema)
    .query(async ({ input, ctx }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        const { page, limit } = input;
        const skip = (page - 1) * limit;

        const [feedback, total] = await Promise.all([
          Feedback.find({ userId: sessionUser?.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          Feedback.countDocuments({ userId: sessionUser?.id }),
        ]);

        return {
          feedback,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        console.error("Error fetching user feedback:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch your feedback",
        });
      }
    }),
});