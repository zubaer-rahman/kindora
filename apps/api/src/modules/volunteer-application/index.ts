import { publicProcedure, router } from "@/server/trpc";
import { protectedProcedure } from "@/server/middlewares/with-auth";
import { JwtPayload } from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import User from "@/server/db/models/user";
import VolunteerApplication from "@/server/db/models/volunteer-application";
import Opportunity from "@/server/db/models/opportunity";
import FavoriteOpportunity from "@/server/db/models/favorite-opportunity";
import OpportunityMentor from "@/server/db/models/opportunity-mentor";
import connectDB from "@/server/config/mongoose";
import { sendApplicationConfirmationMail } from "@/utils/helpers/sendApplicationConfirmationMail";
import { volunteerApplicationValidation } from "./volunteer-application.validation";
import { z } from "zod";
import { formatText } from "@/utils/helpers/formatText";

export const volunteerApplicationRouter = router({
  getApplicationStatus: protectedProcedure
    .input(volunteerApplicationValidation.getApplicationStatusSchema)
    .query(async ({ ctx, input }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          return { status: null };
        }

        const user = await User.findOne({ email: sessionUser.email });
        if (!user?.volunteer_profile) {
          return { status: null };
        }

        const application = (await VolunteerApplication.findOne({
          opportunity: input.opportunityId,
          volunteer: user._id,
        }).lean()) as { status?: string } | null;

        return { status: application?.status || null };
      } catch (error) {
        console.error("Error getting application status:", error);
        return { status: null };
      }
    }),

  getVolunteerApplications: publicProcedure
    .input(z.string())
    .query(async ({ input: volunteerId }) => {
      try {
        const applications = await VolunteerApplication.find({
          volunteer: volunteerId,
        })
          .populate({
            path: "opportunity",
            select: "title description category location commitment_type",
          })
          .sort({ createdAt: -1 })
          .lean();

        return applications;
      } catch (error) {
        console.error("Error fetching volunteer applications:", error);
        return [];
      }
    }),

  getCurrentUserApplications: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(6),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          return { applications: [], total: 0, totalPages: 0 };
        }

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          return { applications: [], total: 0, totalPages: 0 };
        }

        const { page, limit } = input;
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const total = await VolunteerApplication.countDocuments({
          volunteer: user._id,
        });

        const totalPages = Math.ceil(total / limit);

        const applications = await VolunteerApplication.find({
          volunteer: user._id,
        })
          .populate({
            path: "opportunity",
            select: "title description category location commitment_type organization_profile createdAt date time",
            populate: {
              path: "organization_profile",
              select: "title profile_img",
            },
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean();

        return {
          applications,
          total,
          totalPages,
          currentPage: page,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        };
      } catch (error) {
        console.error("Error fetching current user applications:", error);
        return { applications: [], total: 0, totalPages: 0 };
      }
    }),

  getCurrentUserActiveApplications: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(6),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          return { applications: [], total: 0, totalPages: 0 };
        }

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          return { applications: [], total: 0, totalPages: 0 };
        }

        const { page, limit } = input;
        const skip = (page - 1) * limit;
        const now = new Date();

         const allApplications = await VolunteerApplication.find({
          volunteer: user._id,
        })
          .populate({
            path: "opportunity",
            select: "title description category location commitment_type organization_profile createdAt date time is_deleted is_archived number_of_volunteers",
            populate: {
              path: "organization_profile",
              select: "title profile_img",
            },
          })
          .sort({ createdAt: -1 })
          .lean();

         const activeApplications = allApplications.filter((app) => {
          if (!app.opportunity) return false;
           if (app.opportunity.is_deleted === true) return false;
           if (app.opportunity.is_archived === true) return false;
           if (app.opportunity.date?.start_date) {
            const startDate = new Date(app.opportunity.date.start_date);
            return startDate >= now;  
          }
           return true;
        });

        // Calculate applicantCount for each opportunity
        const applicationsWithCounts = await Promise.all(
          activeApplications.map(async (app) => {
            if (!app.opportunity) return app;
            const applicantCount = await VolunteerApplication.countDocuments({
              opportunity: app.opportunity._id || app.opportunity.id,
              status: { $in: ["pending", "approved"] },
            });
            return {
              ...app,
              opportunity: {
                ...app.opportunity,
                applicantCount,
              },
            };
          })
        );

         const total = applicationsWithCounts.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = skip;
        const endIndex = startIndex + limit;
        const paginatedApplications = applicationsWithCounts.slice(startIndex, endIndex);

        return {
          applications: paginatedApplications,
          total,
          totalPages,
          currentPage: page,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        };
      } catch (error) {
        console.error("Error fetching current user active applications:", error);
        return { applications: [], total: 0, totalPages: 0 };
      }
    }),

  getCurrentUserApprovedApplications: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(6),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          return { applications: [], total: 0, totalPages: 0 };
        }

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          return { applications: [], total: 0, totalPages: 0 };
        }

        const { page, limit } = input;
        const skip = (page - 1) * limit;
        const now = new Date();

        // Get all approved applications for this user
        const allApplications = await VolunteerApplication.find({
          volunteer: user._id,
          status: "approved",
        })
          .populate({
            path: "opportunity",
            select: "title description category location commitment_type organization_profile createdAt date time is_deleted is_archived number_of_volunteers",
            populate: {
              path: "organization_profile",
              select: "title profile_img",
            },
          })
          .sort({ createdAt: -1 })
          .lean();

        // Filter to only ongoing opportunities (end date is in the future)
        const approvedApplications = allApplications.filter((app) => {
          if (!app.opportunity) return false;
          if (app.opportunity.is_deleted === true) return false;
          if (app.opportunity.is_archived === true) return false;
          
          // Use end_date to determine if it's ongoing
          const endDate = app.opportunity.date?.end_date 
            ? new Date(app.opportunity.date.end_date) 
            : app.opportunity.date?.start_date 
              ? new Date(app.opportunity.date.start_date)
              : null;

          if (endDate) {
            return endDate >= now;
          }
          return true; // Default to showing if no date is set
        });

        // Calculate applicantCount for each opportunity
        const applicationsWithCounts = await Promise.all(
          approvedApplications.map(async (app) => {
            if (!app.opportunity) return app;
            const applicantCount = await VolunteerApplication.countDocuments({
              opportunity: app.opportunity._id || app.opportunity.id,
              status: { $in: ["pending", "approved"] },
            });
            return {
              ...app,
              opportunity: {
                ...app.opportunity,
                applicantCount,
              },
            };
          })
        );

        const total = applicationsWithCounts.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = skip;
        const endIndex = startIndex + limit;
        const paginatedApplications = applicationsWithCounts.slice(startIndex, endIndex);

        return {
          applications: paginatedApplications,
          total,
          totalPages,
          currentPage: page,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        };
      } catch (error) {
        console.error("Error fetching current user approved applications:", error);
        return { applications: [], total: 0, totalPages: 0 };
      }
    }),

  getCurrentUserRecentApplications: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(6),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          return { applications: [], total: 0, totalPages: 0 };
        }

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          return { applications: [], total: 0, totalPages: 0 };
        }

        const { page, limit } = input;
        const skip = (page - 1) * limit;
        const now = new Date();

        // First, get all applications for this user
        const allApplications = await VolunteerApplication.find({
          volunteer: user._id,
        })
          .populate({
            path: "opportunity",
            select: "title description category location commitment_type organization_profile createdAt date time is_deleted is_archived",
            populate: {
              path: "organization_profile",
              select: "title profile_img",
            },
          })
          .sort({ createdAt: -1 })
          .lean();

        // Filter applications using the same logic as client-side
        const recentApplications = allApplications.filter((app) => {
          if (!app.opportunity) return false;
          if (app.opportunity.is_deleted === true) return false;
          if (app.opportunity.is_archived === true) return false;
          
          // For recent: show all applications where opportunity has already ended
          const endDate = app.opportunity.date?.end_date 
            ? new Date(app.opportunity.date.end_date) 
            : app.opportunity.date?.start_date 
              ? new Date(app.opportunity.date.start_date)
              : null;

          if (endDate) {
            return endDate < now; // Ended in the past
          }
          
          return false;
        });

        // Apply pagination to filtered results
        const total = recentApplications.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = skip;
        const endIndex = startIndex + limit;
        const paginatedApplications = recentApplications.slice(startIndex, endIndex);

        return {
          applications: paginatedApplications,
          total,
          totalPages,
          currentPage: page,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        };
      } catch (error) {
        console.error("Error fetching current user recent applications:", error);
        return { applications: [], total: 0, totalPages: 0 };
      }
    }),

  getCurrentUserActiveApplicationsCount: protectedProcedure
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

        const now = new Date();

        // Get all applications for this user
        const allApplications = await VolunteerApplication.find({
          volunteer: user._id,
        })
          .populate({
            path: "opportunity",
            select: "date is_deleted is_archived",
          })
          .lean();

        // Filter applications using the same logic
        const activeApplications = allApplications.filter((app) => {
          if (!app.opportunity) return false;
          if (app.opportunity.is_deleted === true) return false;
          if (app.opportunity.is_archived === true) return false;
          // For applied: show all applications where opportunity is current or upcoming
          if (app.opportunity.date?.start_date) {
            const startDate = new Date(app.opportunity.date.start_date);
            return startDate >= now; // Current or future start date
          }
          // If no start date, include it in applied (assuming it's upcoming)
          return true;
        });

        return { total: activeApplications.length };
      } catch (error) {
        console.error("Error fetching current user active applications count:", error);
        return { total: 0 };
      }
    }),

  getCurrentUserRecentApplicationsCount: protectedProcedure
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

        const now = new Date();

        // Get all applications for this user
        const allApplications = await VolunteerApplication.find({
          volunteer: user._id,
        })
          .populate({
            path: "opportunity",
            select: "date is_deleted is_archived",
          })
          .lean();

        // Filter applications using the same logic
        const recentApplications = allApplications.filter((app) => {
          if (!app.opportunity) return false;
          if (app.opportunity.is_deleted === true) return false;
          if (app.opportunity.is_archived === true) return false;
          
          // For recent: show all applications where opportunity has already ended
          const endDate = app.opportunity.date?.end_date 
            ? new Date(app.opportunity.date.end_date) 
            : app.opportunity.date?.start_date 
              ? new Date(app.opportunity.date.start_date)
              : null;

          if (endDate) {
            return endDate < now; // Ended in the past
          }
          
          return false;
        });

        return { total: recentApplications.length };
      } catch (error) {
        console.error("Error fetching current user recent applications count:", error);
        return { total: 0 };
      }
    }),

  applyToOpportunity: protectedProcedure
    .input(volunteerApplicationValidation.applyToOpportunitySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await connectDB();

        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser || !sessionUser?.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to apply for opportunities.",
          });
        }

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found.",
          });
        }

        const opportunity = await Opportunity.findById(input.opportunityId);
        if (!opportunity) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Opportunity not found.",
          });
        }

        // Check if opportunity has ended
        const now = new Date();
        const opportunityEndDate = opportunity.date?.end_date || opportunity.date?.start_date;
        
        if (opportunityEndDate && new Date(opportunityEndDate) < now) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This opportunity has already ended and is no longer accepting applications.",
          });
        }

        const existingApplication = await VolunteerApplication.findOne({
          opportunity: input.opportunityId,
          volunteer: user._id,
        });

        if (existingApplication) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You have already applied for this opportunity.",
          });
        }

        const application = await VolunteerApplication.create({
          opportunity: input.opportunityId,
          volunteer: user._id,
        });

        if (!application) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to apply for opportunity.",
          });
        }
        // Application confirmation email disabled – only auth emails (sign up, reset password) are sent.
        // sendApplicationConfirmationMail(
        //   sessionUser.email,
        //   sessionUser.name,
        //   input.opportunityId
        // );
        return application;
      } catch (error) {
        console.error("Error in applyToOpportunity:", error);
        throw error;
      }
    }),

  revokeApplication: protectedProcedure
    .input(z.object({ opportunityId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser?.email) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
      }
      const user = await User.findOne({ email: sessionUser.email });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      const result = await VolunteerApplication.findOneAndDelete({
        volunteer: user._id,
        opportunity: input.opportunityId,
      });
      if (!result) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      }
      // Remove mentorship assignment if exists
      await OpportunityMentor.deleteOne({
        volunteer: user._id,
        opportunity: input.opportunityId,
      });
      // Send notification to organization users
      const opportunity = await Opportunity.findById(input.opportunityId).populate('organization_profile', 'title');
      if (opportunity && opportunity.organization_profile) {
        const organizationId = opportunity.organization_profile._id?.toString();
        const organizationName = opportunity.organization_profile.title;
        const opportunityTitle = opportunity.title;
        const notificationService = (await import('../../services/notification')).notificationService;
        await notificationService.sendVolunteerWithdrewNotification(
          input.opportunityId,
          opportunityTitle,
          organizationId,
          organizationName,
          user.name
        );
      }
      return { success: true };
    }),

  getFavoriteStatus: protectedProcedure
    .input(volunteerApplicationValidation.getApplicationStatusSchema)
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
    .input(volunteerApplicationValidation.applyToOpportunitySchema)
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

  getVolunteersByOpportunity: protectedProcedure
    .input(volunteerApplicationValidation.getApplicationStatusSchema)
    .query(async ({ ctx, input }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to view volunteers",
          });
        }

        // Get all applications for this opportunity
        const applications = await VolunteerApplication.find({
          opportunity: input.opportunityId,
        })
          .populate({
            path: "volunteer",
            populate: {
              path: "user",
              select: "name email image",
            },
          })
          .lean();

        // Transform the data to include volunteer details
        const volunteers = applications.map((app) => ({
          _id: app.volunteer._id,
          name: app.volunteer.user.name,
          email: app.volunteer.user.email,
          image: app.volunteer.user.image,
          status: app.status,
          appliedAt: app.createdAt,
        }));

        return volunteers;
      } catch (error) {
        console.error("Error fetching volunteers by opportunity:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch volunteers",
          cause: error,
        });
      }
    }),

  getOpportunityApplicants: protectedProcedure
    .input(volunteerApplicationValidation.getOpportunityApplicantsSchema)
    .query(async ({ ctx, input }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to view applicants.",
          });
        }

        const applications = await VolunteerApplication.find({
          opportunity: input.opportunityId,
        })
          .populate({
            path: "volunteer",
            select: "name email image",
            populate: {
              path: "volunteer_profile",
              select:
                "state area bio interested_on completed_projects availability",
            },
          })
          .sort({ createdAt: -1 }) // Sort by application date, most recent first
          .lean();

        if (!applications) {
          return [];
        }

        // Filter out applications with missing volunteer data
        const validApplications = applications.filter(app => app.volunteer);

        return validApplications.map((application) => {
          const app = application as unknown as {
            _id: { toString(): string };
            volunteer: {
              _id: { toString(): string };
              name?: string;
              email?: string;
              image?: string;
                              volunteer_profile?: {
                  state?: string;
                  area?: string;
                  bio?: string;
                  interested_on?: string[];
                  completed_projects?: number;
                  availability?: string;
                };
            };
          };

          // Construct location from state and area
          const state = app.volunteer.volunteer_profile?.state || "";
          const area = app.volunteer.volunteer_profile?.area || "";
          const location = formatText(area, state);

          return {
            id: app.volunteer._id.toString(),
            name: app.volunteer.name || "",
            email: app.volunteer.email || "",
            profileImg:
              app.volunteer.image || null,
            location: location,
            bio: app.volunteer.volunteer_profile?.bio || "",
            skills: app.volunteer.volunteer_profile?.interested_on || [],
            completedProjects:
              app.volunteer.volunteer_profile?.completed_projects || 0,
            availability: app.volunteer.volunteer_profile?.availability || "",
            applicationId: app._id.toString(),
            status: (application as any).status || "pending",
          } as const;
        });
      } catch (error) {
        console.error("Error getting opportunity applicants:", error);
        throw error;
      }
    }),

  getDynamicCompletedOpportunities: protectedProcedure
    .input(z.object({
      volunteerId: z.string(),
      currentOpportunityId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to view completed opportunities.",
          });
        }

        // Get the current opportunity to check its organization and skills/categories
        const currentOpportunity = await Opportunity.findById(input.currentOpportunityId)
          .populate("organization_profile")
          .lean() as {
            organization_profile?: { _id: string };
            required_skills?: string[];
            category?: string[];
          } | null;

        if (!currentOpportunity) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Current opportunity not found.",
          });
        }

        // Get all approved applications for the volunteer
        const approvedApplications = await VolunteerApplication.find({
          volunteer: input.volunteerId,
          status: "approved",
        })
          .populate({
            path: "opportunity",
            select: "title description category required_skills organization_profile commitment_type date time",
            populate: {
              path: "organization_profile",
              select: "title _id",
            },
          })
          .lean();

        const now = new Date();

        // Filter applications based on criteria:
        // 1. Same organization as current opportunity
        // 2. Skills or categories match current opportunity
        // 3. Opportunity has actually ended based on commitment type
        const matchingApplications = approvedApplications.filter((app) => {
          if (!app.opportunity) return false;

          const opp = app.opportunity as {
            organization_profile?: { _id: string };
            required_skills?: string[];
            category?: string[];
            commitment_type?: string;
            date?: {
              start_date?: Date;
              end_date?: Date;
            };
            time?: {
              start_time?: string;
              end_time?: string;
            };
          };
          const currentOrgId = currentOpportunity.organization_profile?._id?.toString();
          const appOrgId = opp.organization_profile?._id?.toString();

          // Check if same organization
          const isSameOrganization = currentOrgId === appOrgId;

          // Check if skills or categories match
          const currentSkills = currentOpportunity.required_skills || [];
          const currentCategories = currentOpportunity.category || [];
          const appSkills = opp.required_skills || [];
          const appCategories = opp.category || [];

          const hasMatchingSkills = currentSkills.some((skill: string) =>
            appSkills.includes(skill)
          );
          const hasMatchingCategories = currentCategories.some((category: string) =>
            appCategories.includes(category)
          );

          // Check if opportunity has actually ended based on commitment type
          let hasEnded = false;
          
          if (opp.commitment_type === "workbased") {
            // For work-based: check if end_date and end_time have passed
            if (opp.date?.end_date && opp.time?.end_time) {
              const endDateTime = new Date(opp.date.end_date);
              const [endHour, endMinute] = opp.time.end_time.split(':').map(Number);
              endDateTime.setHours(endHour, endMinute, 0, 0);
              hasEnded = endDateTime < now;
            }
          } else if (opp.commitment_type === "eventbased") {
            // For event-based: check if start_date and start_time have passed
            if (opp.date?.start_date && opp.time?.start_time) {
              const startDateTime = new Date(opp.date.start_date);
              const [startHour, startMinute] = opp.time.start_time.split(':').map(Number);
              startDateTime.setHours(startHour, startMinute, 0, 0);
              hasEnded = startDateTime < now;
            }
          }

          return isSameOrganization && (hasMatchingSkills || hasMatchingCategories) && hasEnded;
        });

        return {
          count: matchingApplications.length,
        };
      } catch (error) {
        console.error("Error getting dynamic completed opportunities:", error);
        throw error;
      }
    }),
});
