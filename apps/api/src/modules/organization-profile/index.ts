import { protectedProcedure } from "@/server/middlewares/with-auth";
import { router, publicProcedure } from "@/server/trpc";
import OrganizationProfile from "@/server/db/models/organization-profile";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { JwtPayload } from "jsonwebtoken";
import User from "@/server/db/models/user";
import Opportunity from "@/server/db/models/opportunity";
import FavoriteOrganization from "@/server/db/models/favorite-organization";
import mongoose from "mongoose";

export const organizationProfileRouter = router({
  getOrganizationProfile: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input: organizationId }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser || !sessionUser?.email) {
          throw new Error("You must be logged in to access this data.");
        }

        const user = await User.findOne({ email: sessionUser.email });

        if (!user) {
          throw new Error("User not found.");
        }
        const organizationProfile = await OrganizationProfile.findById(
          organizationId
        );

        if (!organizationProfile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organisation profile not found",
          });
        }

        return {
          organizationProfile,
          user: {
            name: user.name,
            email: user.email
          }
        };
      } catch (error) {
        console.error("Error fetching organisation profile:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch organisation profile",
          cause: error,
        });
      }
    }),

  getAllOrganizations: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      category: z.string().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(10),
      sortBy: z.enum(["name", "updated"]).default("updated"),
    }))
    .query(async ({ input }) => {
      try {
        const { search, category, page, limit, sortBy } = input;
        const skip = (page - 1) * limit;

        // Build query
        const query: Record<string, unknown> = {};

        if (search) {
          query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { bio: { $regex: search, $options: 'i' } },
            { area: { $regex: search, $options: 'i' } },
            { state: { $regex: search, $options: 'i' } },
          ];
        }

        if (category) {
          query.opportunity_types = { $in: [category] };
        }

        // Build sort object
        let sortObject: Record<string, 1 | -1> = {};
        switch (sortBy) {
          case "name":
            sortObject = { title: 1 };
            break;
          case "updated":
          default:
            sortObject = { updatedAt: -1 };
            break;
        }

        // Get organizations with pagination and sorting
        const organizations = await OrganizationProfile.find(query)
          .sort(sortObject)
          .skip(skip)
          .limit(limit);

        // Get total count for pagination
        const total = await OrganizationProfile.countDocuments(query);

        // Get opportunity counts for each organization
        const organizationsWithCounts = await Promise.all(
          organizations.map(async (org) => {
            const now = new Date();

            // Count active opportunities
            const opportunityCount = await Opportunity.countDocuments({
              organization_profile: org._id,
              is_archived: false,
              $or: [
                // Opportunities without specific dates (always active)
                {
                  start_date: { $exists: false },
                  'recurrence.date_range.start_date': { $exists: false }
                },
                // Single-date opportunities that haven't passed
                {
                  start_date: { $exists: true, $gte: now },
                  'recurrence.date_range.start_date': { $exists: false }
                },
                // Recurring opportunities that haven't ended
                {
                  'recurrence.date_range.end_date': { $exists: true, $gte: now }
                },
                // Recurring opportunities without end date (always active)
                {
                  'recurrence.date_range.start_date': { $exists: true },
                  'recurrence.date_range.end_date': { $exists: false }
                }
              ]
            });

            return {
              ...org.toObject(),
              opportunityCount,
            };
          })
        );

        return {
          organizations: organizationsWithCounts,
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        };
      } catch (error) {
        console.error("Error fetching organizations:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch organizations",
          cause: error,
        });
      }
    }),

  getFavoriteStatus: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
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

        if (!mongoose.Types.ObjectId.isValid(input.organizationId)) {
          return { isFavorite: false };
        }

        const favorite = await FavoriteOrganization.findOne({
          user: user._id,
          organization: input.organizationId,
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
    .input(z.object({ organizationId: z.string() }))
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

        if (!mongoose.Types.ObjectId.isValid(input.organizationId)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid organisation ID.",
          });
        }

        const favorite = await FavoriteOrganization.findOne({
          user: user._id,
          organization: input.organizationId,
        });

        if (favorite) {
          await FavoriteOrganization.deleteOne({
            user: user._id,
            organization: input.organizationId,
          });
          return { isFavorite: false };
        } else {
          await FavoriteOrganization.create({
            user: user._id,
            organization: input.organizationId,
          });
          return { isFavorite: true };
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
        throw error;
      }
    }),

  getFavoriteOrganizationsWithPagination: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(6),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          return { organizations: [], total: 0, totalPages: 0 };
        }

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          return { organizations: [], total: 0, totalPages: 0 };
        }

        const { page, limit } = input;
        const skip = (page - 1) * limit;

        const favorites = await FavoriteOrganization.find({ user: user._id })
          .select("organization")
          .lean()
          .exec();

        const favoriteOrganizationIds = favorites.map(fav => fav.organization);

        if (favoriteOrganizationIds.length === 0) {
          return {
            organizations: [],
            total: 0,
            totalPages: 0,
            currentPage: page,
          };
        }

        const total = await OrganizationProfile.countDocuments({
          _id: { $in: favoriteOrganizationIds },
        });

        const organizations = await OrganizationProfile.find({
          _id: { $in: favoriteOrganizationIds },
        })
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean();

        // Get opportunity counts for each organization
        const now = new Date();
        const organizationsWithCounts = await Promise.all(
          organizations.map(async (org) => {
            const opportunityCount = await Opportunity.countDocuments({
              organization_profile: org._id,
              is_archived: false,
            });

            return {
              ...org,
              opportunityCount,
            };
          })
        );

        return {
          organizations: organizationsWithCounts,
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        };
      } catch (error) {
        console.error("Error fetching favorite organizations:", error);
        return { organizations: [], total: 0, totalPages: 0 };
      }
    }),
  getOrganizationNames: protectedProcedure.query(async () => {
    try {
      const organizations = await OrganizationProfile.find({})
        .select("title _id")
        .sort({ title: 1 })
        .lean();

      return (organizations as any[]).map((org) => ({
        label: org.title,
        value: org._id.toString(),
      }));
    } catch (error) {
      console.error("Error fetching organisation names:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch organisation names",
      });
    }
  }),
});
