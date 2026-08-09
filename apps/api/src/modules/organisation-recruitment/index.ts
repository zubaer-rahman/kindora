import { router } from "@/server/trpc";
import { protectedProcedure } from "@/server/middlewares/with-auth";
import { JwtPayload } from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import User from "@/server/db/models/user";
import OrganisationRecruitment from "@/server/db/models/organisation-recruitment";
import VolunteerApplication from "@/server/db/models/volunteer-application";
import connectDB from "@/server/config/mongoose";
import { organisationRecruitmentValidation } from "./organisation-recruitment.validation";
import { z } from "zod";
import { sendRecruitmentConfirmationMail } from "@/utils/helpers/sendRecruitmentConfirmationMail";
import { formatText } from "@/utils/helpers/formatText";

export const organisationRecruitmentRouter = router({
  getRecruitmentStatus: protectedProcedure
    .input(organisationRecruitmentValidation.recruitApplicantSchema)
    .query(async ({   input }) => {
      try {
        await connectDB();
       
        const recruitment = await OrganisationRecruitment.findOne({
          application: input.applicationId,
        });

        return { isRecruited: !!recruitment };
      } catch (error) {
        console.error("Error checking recruitment status:", error);
        return { isRecruited: false };
      }
    }),

  recruitApplicant: protectedProcedure
    .input(organisationRecruitmentValidation.recruitApplicantSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await connectDB();

        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to recruit applicants.",
          });
        }

        const recruiter = await User.findOne({ email: sessionUser.email });
        if (!recruiter) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Recruiter not found.",
          });
        }

        const application = await VolunteerApplication.findById(
          input.applicationId
        );
        if (!application) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Application not found.",
          });
        }

        // Check if already recruited
        const existingRecruitment = await OrganisationRecruitment.findOne({
          application: input.applicationId,
        });

        if (existingRecruitment) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Applicant has already been recruited for this opportunity.",
          });
        }

        // Create the recruitment record
        const organisationRecruitment = await OrganisationRecruitment.create({
          application: input.applicationId,
          recruited_by: recruiter._id,
        });

        // Update the volunteer application status to approved
        await VolunteerApplication.findByIdAndUpdate(
          input.applicationId,
          { status: "approved" },
          { new: true }
        );

        // Recruitment confirmation email disabled – only auth emails (sign up, reset password) are sent.
        // await sendRecruitmentConfirmationMail(input.applicationId);

        return organisationRecruitment;
      } catch (error) {
        console.error("Error in recruitApplicant:", error);
        throw error;
      }
    }),

  getRecruitedApplicants: protectedProcedure
    .input(z.object({ opportunityId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        await connectDB();

        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to view recruited applicants.",
          });
        }

        // Build the match condition based on whether opportunityId is provided
        const matchCondition = input.opportunityId 
          ? { opportunity: input.opportunityId }
          : {};

        // Find all recruited applications
        const recruitedApplications = await OrganisationRecruitment.find()
          .populate({
            path: "application",
            match: matchCondition,
            populate: [
              {
                path: "volunteer",
                select: "name email image",
                populate: {
                  path: "volunteer_profile",
                  select:
                    "state area bio interested_on completed_projects availability",
                },
              },
              {
                path: "opportunity",
                select: "title description category location commitment_type is_deleted is_archived",
              },
            ],
          })
          .sort({ createdAt: -1 }) // Sort by recruitment date, most recent first
          .lean();

        // Filter out null applications (where opportunity didn't match) and applications with missing volunteer data
        const validRecruitedApplications = recruitedApplications.filter(
          (recruitment) => {
            if (!recruitment.application || !recruitment.application.volunteer) return false;
            const opp = recruitment.application.opportunity;
            if (!opp) return false;
            if (opp.is_deleted === true) return false;
            if (opp.is_archived === true) return false;
            return true;
          }
        );

        // Transform the data to match the expected format and deduplicate by volunteer ID
        const transformedData = validRecruitedApplications.map((recruitment) => {
          const app = recruitment as unknown as {
            application: {
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
              opportunity?: {
                _id: { toString(): string };
                title?: string;
                description?: string;
                category?: string[];
                location?: string;
                commitment_type?: string;
              };
            };
          };

          // Construct location from state and area
          const state = app.application.volunteer.volunteer_profile?.state || "";
          const area = app.application.volunteer.volunteer_profile?.area || "";
          const location = formatText(area, state);

          return {
            id: app.application.volunteer._id.toString(),
            name: app.application.volunteer.name || "",
            email: app.application.volunteer.email || "",
            profileImg:
              app.application.volunteer.image || null,
            location: location,
            bio: app.application.volunteer.volunteer_profile?.bio || "",
            skills: app.application.volunteer.volunteer_profile?.interested_on || [],
            completedProjects:
              app.application.volunteer.volunteer_profile?.completed_projects ||
              0,
            availability:
              app.application.volunteer.volunteer_profile?.availability || "",
            applicationId: app.application._id.toString(),
            opportunity: app.application.opportunity ? {
              id: app.application.opportunity._id.toString(),
              title: app.application.opportunity.title || "",
              description: app.application.opportunity.description || "",
              category: app.application.opportunity.category || [],
              location: app.application.opportunity.location || "",
              commitment_type: app.application.opportunity.commitment_type || "",
            } : null,
          } as const;
        });

        // Deduplicate by volunteer ID to prevent showing the same person multiple times
        const uniqueRecruits = Array.from(
          new Map(transformedData.map(item => [item.id, item])).values()
        );

        return uniqueRecruits;
      } catch (error) {
        console.error("Error in getRecruitedApplicants:", error);
        throw error;
      }
    }),
});
