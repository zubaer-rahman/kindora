import User from "@/server/db/models/user";
import OrganizationProfile from "@/server/db/models/organization-profile";
import { protectedProcedure } from "@/server/middlewares/with-auth";
import { JwtPayload } from "jsonwebtoken";
import { userValidation } from "./users.validation";
import bcrypt from "bcryptjs";
import { publicProcedure, router } from "@/server/trpc";
import VolunteerProfile from "@/server/db/models/volunteer-profile";
import MentorProfile from "@/server/db/models/mentor-profile";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { presenceService } from "@/server/services/presence";

export const userRouter = router({
  getAvailableUsers: protectedProcedure
    .input(userValidation.getAvailableUsersSchema)
    .query(async ({ ctx, input }) => {
      const sessionUser = ctx.user as JwtPayload;
      console.log("Session User:", sessionUser);

      if (!sessionUser || !sessionUser?.id) {
        throw new Error("You must be logged in to view available users.");
      }

      const currentUser = await User.findById(sessionUser.id);
      console.log("Current User:", currentUser);

      if (!currentUser) {
        throw new Error("Current user not found");
      }

      const { page, limit, search, categories, studentType, memberType, availability, location, sortBy, includeMentors } = input;
      const skip = (page - 1) * limit;

      // Build base query
      const baseQuery: Record<string, unknown> = {
        _id: { $ne: currentUser._id },
      };

      // If user is a volunteer, show admins and mentors
      if (currentUser.role === "volunteer") {
        baseQuery.role = { $in: ["admin", "mentor"] };
      }
      // If user is an admin, mentor, or organization, show volunteers (and optionally mentors)
      else if (currentUser.role === "admin" || currentUser.role === "mentor" || currentUser.role === "organization") {
        baseQuery.role = includeMentors ? { $in: ["volunteer", "mentor"] } : "volunteer";
      } else {
        return { users: [], total: 0, totalPages: 0 };
      }

      // Add search filter
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        if (currentUser.role === "volunteer") {
          // When volunteer is searching for admins/mentors, search in organization fields
          baseQuery.$or = [
            { name: searchRegex },
            { 'organization_profile.title': searchRegex },
            { 'organization_profile.bio': searchRegex },
          ];
        } else if (includeMentors) {
          // When including mentors (e.g. Messages People tab), search by name only
          baseQuery.$or = [{ name: searchRegex }];
        } else {
          // When admin/mentor/organization is searching for volunteers, search in volunteer fields
          baseQuery.$or = [
            { name: searchRegex },
            { 'volunteer_profile.course': searchRegex },
            { 'volunteer_profile.bio': searchRegex },
            { 'volunteer_profile.interested_on': searchRegex },
          ];
        }
      }

      // Add category filter (only for volunteers; skip when including mentors)
      if (categories && categories.length > 0 && !includeMentors && (currentUser.role === "admin" || currentUser.role === "mentor" || currentUser.role === "organization")) {
        baseQuery['volunteer_profile.interested_on'] = { $in: categories };
      }

      // Add student type filter (only for volunteers; skip when including mentors)
      if (studentType !== "all" && !includeMentors && (currentUser.role === "admin" || currentUser.role === "mentor" || currentUser.role === "organization")) {
        baseQuery['volunteer_profile.is_currently_studying'] = studentType;
      } else if (studentType === "all" && !includeMentors && (currentUser.role === "admin" || currentUser.role === "mentor" || currentUser.role === "organization")) {
        baseQuery.$or = [
          { 'volunteer_profile.is_currently_studying': { $in: ["yes", "no"] } },
          { 'volunteer_profile.is_currently_studying': { $exists: false } }
        ];
      }

      // Add member type filter (only for volunteers who are not currently studying)
      if (memberType !== "all" && !includeMentors && (currentUser.role === "admin" || currentUser.role === "mentor" || currentUser.role === "organization")) {
        baseQuery['volunteer_profile.non_student_type'] = memberType;
      }

      // Add availability filter (only for volunteers)
      if (availability?.startDate && availability?.endDate && !includeMentors && (currentUser.role === "admin" || currentUser.role === "mentor" || currentUser.role === "organization")) {
        // Match the frontend logic: start_date <= endDate AND end_date >= startDate
        baseQuery['volunteer_profile.availability_date.start_date'] = {
          $exists: true,
          $ne: null,
          $lte: availability.endDate
        };
        baseQuery['volunteer_profile.availability_date.end_date'] = {
          $exists: true,
          $ne: null,
          $gte: availability.startDate
        };
      }

      // Add location filter
      if (location && !includeMentors && (currentUser.role === "admin" || currentUser.role === "mentor" || currentUser.role === "organization")) {
        const locationRegex = new RegExp(location, 'i');
        baseQuery.$or = [
          ...(baseQuery.$or as Array<Record<string, unknown>> || []),
          { 'volunteer_profile.area': locationRegex },
          { 'volunteer_profile.state': locationRegex }
        ];
      }

      // Add sortBy availability filter
      if (sortBy === "available" && !includeMentors && (currentUser.role === "admin" || currentUser.role === "mentor" || currentUser.role === "organization")) {
        baseQuery['volunteer_profile.is_available'] = true;
      } else if (sortBy === "not_available" && !includeMentors && (currentUser.role === "admin" || currentUser.role === "mentor" || currentUser.role === "organization")) {
        baseQuery['volunteer_profile.is_available'] = false;
      }

      console.log("Final Query:", JSON.stringify(baseQuery, null, 2));

      // Get total count for pagination
      let total, totalPages;

      if (currentUser.role === "volunteer") {
        total = await User.countDocuments(baseQuery);
        totalPages = Math.ceil(total / limit);
      } else if (includeMentors) {
        // Simple count when including both volunteers and mentors (e.g. Messages People tab)
        total = await User.countDocuments(baseQuery);
        totalPages = Math.ceil(total / limit);
      } else {
        // Use aggregation for accurate counting when filters are applied (volunteers only)
        const countPipeline = [
          { $match: { _id: { $ne: currentUser._id }, role: "volunteer" } },
          {
            $lookup: {
              from: "volunteer_profiles",
              localField: "volunteer_profile",
              foreignField: "_id",
              as: "volunteer_profile"
            }
          },
          { $unwind: "$volunteer_profile" },
          {
            $match: {
              $and: [
                // Search filter
                search ? {
                  $or: [
                    { name: new RegExp(search, 'i') },
                    { 'volunteer_profile.course': new RegExp(search, 'i') },
                    { 'volunteer_profile.bio': new RegExp(search, 'i') },
                    { 'volunteer_profile.interested_on': new RegExp(search, 'i') }
                  ]
                } : {},
                // Category filter
                categories && categories.length > 0 ? {
                  'volunteer_profile.interested_on': { $in: categories }
                } : {},
                // Student type filter - include both "yes" and "no" when "all" is selected
                studentType !== "all" ? {
                  'volunteer_profile.is_currently_studying': studentType
                } : {
                  $or: [
                    { 'volunteer_profile.is_currently_studying': { $in: ["yes", "no"] } },
                    { 'volunteer_profile.is_currently_studying': { $exists: false } }
                  ]
                },
                // Member type filter
                memberType !== "all" ? {
                  'volunteer_profile.non_student_type': memberType
                } : {},
                // Availability filter
                availability?.startDate && availability?.endDate ? {
                  'volunteer_profile.availability_date.start_date': {
                    $exists: true,
                    $ne: null,
                    $lte: availability.endDate
                  },
                  'volunteer_profile.availability_date.end_date': {
                    $exists: true,
                    $ne: null,
                    $gte: availability.startDate
                  }
                } : {},
                // Location filter
                location ? {
                  $or: [
                    { 'volunteer_profile.area': new RegExp(location, 'i') },
                    { 'volunteer_profile.state': new RegExp(location, 'i') }
                  ]
                } : {},
                // SortBy Availability filter
                sortBy === "available" ? {
                  'volunteer_profile.is_available': true
                } : {},
                sortBy === "not_available" ? {
                  'volunteer_profile.is_available': false
                } : {}
              ].filter(condition => Object.keys(condition).length > 0)
            }
          },
          { $count: "total" }
        ];

        const countResult = await User.aggregate(countPipeline);
        total = countResult.length > 0 ? countResult[0].total : 0;
        totalPages = Math.ceil(total / limit);
      }

      console.log("Total documents found:", total);
      console.log("Total pages:", totalPages);
      console.log("Skip:", skip);
      console.log("Limit:", limit);

      // Execute query with pagination using aggregation for proper filtering
      let users;
      if (currentUser.role === "volunteer") {
        users = await User.find(baseQuery)
          .select("name image role")
          .populate("organization_profile")
          .skip(skip)
          .limit(limit)
          .lean();
      } else if (includeMentors) {
        // Simple find when including both volunteers and mentors (e.g. Messages People tab)
        users = await User.find(baseQuery)
          .select("name image role")
          .skip(skip)
          .limit(limit)
          .lean();
      } else {
        // Use aggregation to properly filter on populated volunteer_profile fields
        const pipeline = [
          { $match: { _id: { $ne: currentUser._id }, role: "volunteer" } },
          {
            $lookup: {
              from: "volunteer_profiles",
              localField: "volunteer_profile",
              foreignField: "_id",
              as: "volunteer_profile"
            }
          },
          { $unwind: "$volunteer_profile" },
          {
            $match: {
              $and: [
                // Search filter
                search ? {
                  $or: [
                    { name: new RegExp(search, 'i') },
                    { 'volunteer_profile.course': new RegExp(search, 'i') },
                    { 'volunteer_profile.bio': new RegExp(search, 'i') },
                    { 'volunteer_profile.interested_on': new RegExp(search, 'i') }
                  ]
                } : {},
                // Category filter
                categories && categories.length > 0 ? {
                  'volunteer_profile.interested_on': { $in: categories }
                } : {},
                // Student type filter - include both "yes" and "no" when "all" is selected
                studentType !== "all" ? {
                  'volunteer_profile.is_currently_studying': studentType
                } : {
                  $or: [
                    { 'volunteer_profile.is_currently_studying': { $in: ["yes", "no"] } },
                    { 'volunteer_profile.is_currently_studying': { $exists: false } }
                  ]
                },
                // Member type filter
                memberType !== "all" ? {
                  'volunteer_profile.non_student_type': memberType
                } : {},
                // Availability filter
                availability?.startDate && availability?.endDate ? {
                  'volunteer_profile.availability_date.start_date': {
                    $exists: true,
                    $ne: null,
                    $lte: availability.endDate
                  },
                  'volunteer_profile.availability_date.end_date': {
                    $exists: true,
                    $ne: null,
                    $gte: availability.startDate
                  }
                } : {},
                // Location filter
                location ? {
                  $or: [
                    { 'volunteer_profile.area': new RegExp(location, 'i') },
                    { 'volunteer_profile.state': new RegExp(location, 'i') }
                  ]
                } : {},
                // SortBy Availability filter
                sortBy === "available" ? {
                  'volunteer_profile.is_available': true
                } : {},
                sortBy === "not_available" ? {
                  'volunteer_profile.is_available': false
                } : {}
              ].filter(condition => Object.keys(condition).length > 0)
            }
          },
          {
            $project: {
              name: 1,
              image: 1,
              role: 1,
              area: "$volunteer_profile.area",
              state: "$volunteer_profile.state",
              volunteer_profile: {
                student_type: 1,
                course: 1,
                availability_date: 1,
                interested_on: 1,
                bio: 1,
                is_available: 1
              }
            }
          },
          { $skip: skip },
          { $limit: limit }
        ];

        users = await User.aggregate(pipeline);
      }

      console.log(`Found ${users.length} users out of ${total} total`);

      return {
        users,
        total,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    }),
  updateUser: protectedProcedure
    .input(userValidation.updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser || !sessionUser?.email) {
        throw new Error("You must be logged in to update this data.");
      }

      const user = await User.findOne({ email: sessionUser.email });

      if (!user) {
        throw new Error("User not found.");
      }

      const updatedUser = await User.findOneAndUpdate(
        { email: sessionUser.email },
        { ...input },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        throw new Error("User update failed");
      }

      return updatedUser;
    }),

  profileCheckup: protectedProcedure.query(async ({ ctx }) => {
    const sessionUser = ctx.user as JwtPayload;
    if (!sessionUser || !sessionUser?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to check profile.",
      });
    }
    console.log("sessionUser", sessionUser);

    const user = await User.findOne({ email: sessionUser.email })
      .populate("volunteer_profile")
      .populate("mentor_profile")
      .populate("organization_profile");

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found in database.",
      });
    }

    // Add detailed logging of the organization profile
    console.log("Organization Profile Details:", {
      exists: !!user.organization_profile,
      raw: user.organization_profile,
      type: user.organization_profile?.type,
      title: user.organization_profile?.title,
      email: user.organization_profile?.contact_email,
    });

    const response = {
      hasVolunteerProfile: !!user.volunteer_profile,
      hasMentorProfile: !!user.mentor_profile,
      hasOrganizationProfile: !!user.organization_profile,
      volunteerProfile: user.volunteer_profile,
      mentorProfile: user.mentor_profile,
      organizationProfile: user.organization_profile,
    };

    // Log the response being sent
    console.log("Profile Checkup Response:", {
      email: sessionUser.email,
      hasVolunteerProfile: response.hasVolunteerProfile,
      hasMentorProfile: response.hasMentorProfile,
      hasOrganizationProfile: response.hasOrganizationProfile,
    });

    return response;
  }),

  setupVolunteerProfile: protectedProcedure
    .input(userValidation.volunteerProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser || !sessionUser?.id) {
        throw new Error("You must be logged in to setup your profile.");
      }

      const volunteerProfile = await VolunteerProfile.create({
        ...input,
      });

      if (!volunteerProfile) {
        throw new Error("Failed to create volunteer profile");
      }

      return volunteerProfile;
    }),

  setupMentorProfile: protectedProcedure
    .input(userValidation.mentorProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser || !sessionUser?.id) {
        throw new Error("You must be logged in to setup your profile.");
      }

      const mentorProfile = await MentorProfile.create({
        ...input,
      });

      if (!mentorProfile) {
        throw new Error("Failed to create mentor profile");
      }

      return mentorProfile;
    }),

  setupOrgProfile: protectedProcedure
    .input(userValidation.organizationProfileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser || !sessionUser?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to setup your profile.",
          });
        }

        console.log("Processing update for user:", sessionUser.email);
        console.log("Input data:", input);

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found.",
          });
        }

        // If user already has an organization profile, update it
        if (user.organization_profile) {
          console.log("Updating existing profile:", user.organization_profile);

          // Validate arrays before update
          if (!input.opportunity_types?.length) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "At least one opportunity type is required",
            });
          }
          if (!input.required_skills?.length) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "At least one required skill is required",
            });
          }

          const updateData = {
            ...input,
            updatedAt: new Date(),
          };

          console.log("Update data:", updateData);

          try {
            const updatedProfile = await OrganizationProfile.findByIdAndUpdate(
              user.organization_profile,
              updateData,
              {
                new: true,
                runValidators: true,
                context: "query",
              }
            );

            if (!updatedProfile) {
              console.error(
                "Failed to update profile for user:",
                sessionUser.email
              );
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to update organization profile",
              });
            }

            console.log("Profile updated successfully:", updatedProfile);
            return updatedProfile;
          } catch (error) {
            console.error("Mongoose validation error:", error);
            throw new TRPCError({
              code: "BAD_REQUEST",
              message:
                error instanceof Error ? error.message : "Validation failed",
            });
          }
        }

        // If user doesn't have an organization profile, create a new one
        console.log("Creating new profile for user:", sessionUser.email);

        try {
          const organizationProfile = await OrganizationProfile.create({
            ...input,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          if (!organizationProfile) {
            console.error(
              "Failed to create profile for user:",
              sessionUser.email
            );
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create organization profile",
            });
          }

          // Update user with the new organization profile reference
          await User.findByIdAndUpdate(
            user._id,
            {
              organization_profile: organizationProfile._id,
            },
            { new: true }
          );

          console.log("New profile created successfully:", organizationProfile);
          return organizationProfile;
        } catch (error) {
          console.error("Mongoose creation error:", error);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              error instanceof Error
                ? error.message
                : "Failed to create profile",
          });
        }
      } catch (error) {
        console.error("Error in setupOrgProfile:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to process organisation profile",
          cause: error,
        });
      }
    }),

  resetPassword: publicProcedure
    .input(userValidation.resetPasswordSchema)
    .mutation(async ({ input }) => {
      const { email, password } = input;

      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        throw new Error(
          "No account found with this email address. Please check and try again."
        );
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const updatedUser = await User.findOneAndUpdate(
        { email },
        { password: hashedPassword },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error("Password reset failed. Please try again.");
      }

      return {
        success: true,
        message: "Password has been successfully reset",
      };
    }),

  getOrganizationUsers: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser || !sessionUser?.email) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view users.",
        });
      }

      const currentUser = await User.findOne({ email: sessionUser.email });
      if (!currentUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Current user not found.",
        });
      }

      // Only admins can view organization users
      if (currentUser.role !== "admin" && currentUser.role !== "mentor") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view organisation users.",
        });
      }

      const users = await User.find({
        organization_profile: input.organizationId,
      }).select("name email role avatar");

      return users;
    }),

  updateUserRole: protectedProcedure
    .input(z.object({
      userId: z.string(),
      role: z.enum(["admin", "mentor"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser || !sessionUser?.email) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to update user roles.",
        });
      }

      const currentUser = await User.findOne({ email: sessionUser.email });
      if (!currentUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Current user not found.",
        });
      }

      // Only admins can update user roles
      if (currentUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update user roles.",
        });
      }

      const userToUpdate = await User.findById(input.userId);
      if (!userToUpdate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User to update not found.",
        });
      }

      // Ensure user belongs to the same organization
      if (userToUpdate.organization_profile?.toString() !== currentUser.organization_profile?.toString()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot update user from a different organization.",
        });
      }

      userToUpdate.role = input.role;
      await userToUpdate.save();

      return userToUpdate;
    }),

  demoteMentor: protectedProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser || !sessionUser?.email) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to demote mentors.",
        });
      }

      const currentUser = await User.findOne({ email: sessionUser.email });
      if (!currentUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Current user not found.",
        });
      }

      // Only admins can demote mentors
      if (currentUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can demote mentors.",
        });
      }

      const userToDemote = await User.findById(input.userId);
      if (!userToDemote) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User to demote not found.",
        });
      }

      // Ensure user belongs to the same organization
      if (userToDemote.organization_profile?.toString() !== currentUser.organization_profile?.toString()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot demote user from a different organization.",
        });
      }

      // Only allow demoting mentors
      if (userToDemote.role !== "mentor") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only demote users with mentor role.",
        });
      }

      userToDemote.role = "volunteer";
      await userToDemote.save();

      return userToDemote;
    }),

  deleteUser: protectedProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser || !sessionUser?.email) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete users.",
        });
      }

      const currentUser = await User.findOne({ email: sessionUser.email });
      if (!currentUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Current user not found.",
        });
      }

      // Only admins can delete users
      if (currentUser.role !== "admin" && currentUser.role !== "mentor") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete users.",
        });
      }

      const userToDelete = await User.findById(input.userId);
      if (!userToDelete) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User to delete not found.",
        });
      }

      // Ensure user belongs to the same organization
      if (userToDelete.organization_profile?.toString() !== currentUser.organization_profile?.toString()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete user from a different organization.",
        });
      }

      // Prevent deleting the last admin
      if (userToDelete.role === "admin") {
        const adminCount = await User.countDocuments({
          organization_profile: currentUser.organization_profile,
          role: "admin",
        });

        if (adminCount <= 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot delete the last admin of the organization.",
          });
        }
      }

      await User.findByIdAndDelete(input.userId);

      return { success: true };
    }),

  // DISABLED: heartbeat/presence - re-enable when we have paid servers
  sendHeartbeat: protectedProcedure
    .mutation(async ({ ctx }) => {
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser?.id) return { success: false };
      // await presenceService.setUserOnline(sessionUser.id);
      return { success: true };
    }),

  getUsersOnlineStatus: protectedProcedure
    .input(z.object({
      userIds: z.array(z.string())
    }))
    .query(async ({ input }) => {
      // DISABLED: return await presenceService.getManyUsersOnlineStatus(input.userIds);
      // Return all offline when presence is disabled (no Redis heartbeat)
      return input.userIds.length > 0
        ? input.userIds.reduce((acc, id) => ({ ...acc, [id]: false }), {} as Record<string, boolean>)
        : {};
    }),

  getPublicVolunteers: publicProcedure
    .input(userValidation.getAvailableUsersSchema)
    .query(async ({ input }) => {
      const {
        page,
        limit,
        search,
        categories,
        studentType,
        memberType,
        availability,
        location,
        sortBy
      } = input;
      const skip = (page - 1) * limit;

      const matchConditions = [
        // Search filter
        search ? {
          $or: [
            { name: new RegExp(search, 'i') },
            { 'volunteer_profile.course': new RegExp(search, 'i') },
            { 'volunteer_profile.bio': new RegExp(search, 'i') },
            { 'volunteer_profile.interested_on': { $in: [new RegExp(search, 'i')] } }
          ]
        } : {},
        // Student type filter
        studentType !== "all" ? {
          'volunteer_profile.is_currently_studying': studentType
        } : {},
        // Member type filter
        memberType !== "all" ? {
          'volunteer_profile.non_student_type': memberType
        } : {},
        // Availability filter
        availability?.startDate && availability?.endDate ? {
          'volunteer_profile.availability_date.start_date': {
            $exists: true,
            $ne: null,
            $lte: availability.endDate
          },
          'volunteer_profile.availability_date.end_date': {
            $exists: true,
            $ne: null,
            $gte: availability.startDate
          }
        } : {},
        // Location filter
        location ? {
          $or: [
            { 'volunteer_profile.state': new RegExp(location, 'i') },
            { 'volunteer_profile.area': new RegExp(location, 'i') }
          ]
        } : {},
        // Sort by availability filter (if applicable)
        sortBy === "available" ? {
          'volunteer_profile.is_available': true
        } : {},
        sortBy === "not_available" ? {
          'volunteer_profile.is_available': false
        } : {}
      ].filter(condition => Object.keys(condition).length > 0);

      const matchStage = matchConditions.length > 0 ? { $match: { $and: matchConditions } } : { $match: {} };

      // Use aggregation for accurate counting and filtering on populated fields
      const countPipeline: any[] = [
        { $match: { role: "volunteer" } },
        {
          $lookup: {
            from: "volunteer_profiles",
            localField: "volunteer_profile",
            foreignField: "_id",
            as: "volunteer_profile"
          }
        },
        { $unwind: "$volunteer_profile" },
        matchStage,
        { $count: "total" }
      ];

      const countResult = await User.aggregate(countPipeline);
      const total = countResult.length > 0 ? countResult[0].total : 0;
      const totalPages = Math.ceil(total / limit);

      // Execute query with pagination
      const pipeline: any[] = [
        { $match: { role: "volunteer" } },
        {
          $lookup: {
            from: "volunteer_profiles",
            localField: "volunteer_profile",
            foreignField: "_id",
            as: "volunteer_profile"
          }
        },
        { $unwind: "$volunteer_profile" },
        matchStage,
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            name: 1,
            image: 1,
            role: 1,
            area: "$volunteer_profile.area",
            state: "$volunteer_profile.state",
            'volunteer_profile.student_type': 1,
            'volunteer_profile.course': 1,
            'volunteer_profile.availability_date': 1,
            'volunteer_profile.interested_on': 1,
            'volunteer_profile.bio': 1,
            'volunteer_profile.is_available': 1,
            'volunteer_profile.state': 1,
            'volunteer_profile.area': 1,
          }
        }
      ];

      const users = await User.aggregate(pipeline);

      return {
        users,
        total,
        totalPages,
      };
    }),
});
