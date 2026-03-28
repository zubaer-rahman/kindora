import { router } from "@/server/trpc";
import { protectedProcedure } from "@/server/middlewares/with-auth";
import { favoriteOpportunityValidation } from "./favorite-opportunity.validation";
import User from "@/server/db/models/user";
import FavoriteOpportunity from "@/server/db/models/favorite-opportunity";
import Opportunity from "@/server/db/models/opportunity";
import { JwtPayload } from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import mongoose from "mongoose";

export const favoriteOpportunityRouter = router({
  getFavoriteStatus: protectedProcedure
    .input(favoriteOpportunityValidation.getFavoriteStatusSchema)
    .query(async ({ ctx, input }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          return { isFavorite: false };
        }

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          return { isFavorite: false };
        }

        if (!mongoose.Types.ObjectId.isValid(input.opportunityId)) {
          return { isFavorite: false };
        }

        const favorite = await FavoriteOpportunity.findOne({
          user: user._id,
          opportunity: input.opportunityId,
        });

        return {
          isFavorite: !!favorite,
        };
      } catch (error) {
        console.error("Error getting favorite status:", error);
        return { isFavorite: false };
      }
    }),

  toggleFavorite: protectedProcedure
    .input(favoriteOpportunityValidation.toggleFavoriteSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to toggle favorites.",
          });
        }

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found.",
          });
        }

        if (!mongoose.Types.ObjectId.isValid(input.opportunityId)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid opportunity ID.",
          });
        }

        const favorite = await FavoriteOpportunity.findOne({
          user: user._id,
          opportunity: input.opportunityId,
        });

        if (favorite) {
          await FavoriteOpportunity.deleteOne({
            user: user._id,
            opportunity: input.opportunityId,
          });
          return { isFavorite: false };
        } else {
          await FavoriteOpportunity.create({
            user: user._id,
            opportunity: input.opportunityId,
          });
          return { isFavorite: true };
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
        throw error;
      }
    }),

  getFavoriteOpportunities: protectedProcedure.query(async ({ ctx }) => {
    try {
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser?.email) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view favorites.",
        });
      }

      const user = await User.findOne({ email: sessionUser.email });
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found.",
        });
      }

      const favorites = await FavoriteOpportunity.find({ user: user._id })
        .select("opportunity")
        .lean()
        .exec();

      return favorites.map(fav => ({
        _id: fav._id,
        opportunity: fav.opportunity
      }));
    } catch (error) {
      console.error("Error fetching favorite opportunities:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch favorite opportunities",
        cause: error,
      });
    }
  }),

  getFavoriteOpportunitiesWithPagination: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(6),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          return { opportunities: [], total: 0, totalPages: 0 };
        }

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          return { opportunities: [], total: 0, totalPages: 0 };
        }

        const { page, limit } = input;
        const skip = (page - 1) * limit;

        // Get favorite opportunity IDs for this user
        const favorites = await FavoriteOpportunity.find({ user: user._id })
          .select("opportunity")
          .lean()
          .exec();

        const favoriteOpportunityIds = favorites.map(fav => fav.opportunity);

        if (favoriteOpportunityIds.length === 0) {
          return {
            opportunities: [],
            total: 0,
            totalPages: 0,
            currentPage: page,
            hasNextPage: false,
            hasPrevPage: false,
          };
        }

        // Get total count for pagination
        const total = await Opportunity.countDocuments({
          _id: { $in: favoriteOpportunityIds },
          is_archived: { $ne: true },
        });

        const totalPages = Math.ceil(total / limit);

        // Fetch opportunities with pagination
        const opportunities = await Opportunity.find({
          _id: { $in: favoriteOpportunityIds },
          is_archived: { $ne: true },
        })
          .populate("organization_profile")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean();

        return {
          opportunities,
          total,
          totalPages,
          currentPage: page,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        };
      } catch (error) {
        console.error("Error fetching favorite opportunities with pagination:", error);
        return { opportunities: [], total: 0, totalPages: 0 };
      }
    }),

  getFavoriteOpportunitiesCount: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          return { total: 0 };
        }

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          return { total: 0 };
        }

        // Get favorite opportunity IDs for this user
        const favorites = await FavoriteOpportunity.find({ user: user._id })
          .select("opportunity")
          .lean()
          .exec();

        const favoriteOpportunityIds = favorites.map(fav => fav.opportunity);

        if (favoriteOpportunityIds.length === 0) {
          return { total: 0 };
        }

        // Count opportunities that are not archived
        const total = await Opportunity.countDocuments({
          _id: { $in: favoriteOpportunityIds },
          is_archived: { $ne: true },
        });

        return { total };
      } catch (error) {
        console.error("Error fetching favorite opportunities count:", error);
        return { total: 0 };
      }
    }),
});