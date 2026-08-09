import { z } from "zod";
import { router, publicProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";
import VolunteerApplication from "../../db/models/volunteer-application";
import { IVolunteerApplication } from "../../db/interfaces/volunteer-application";
import { Document } from "mongoose";

interface Applicant extends Document {
  volunteer: {
    id: string;
    name: string;
    profile_img?: string;
    location: string;
    bio: string;
    skills: string[];
    completed_projects: number;
    availability: string;
  };
  id: string;
}

interface GetApplicantsInput {
  opportunityId: string;
}

export const applicantsRouter = router({
  getApplicants: publicProcedure
    .input(
      z.object({
        opportunityId: z.string(),
      })
    )
    .query(async ({ input }: { input: GetApplicantsInput }) => {
      const { opportunityId } = input;

      const applicants = await VolunteerApplication.find({
        opportunity: opportunityId,
        status: "approved",
      }).populate({
        path: "volunteer",
        select: "id name profile_img location bio skills completed_projects availability",
      }).sort({ createdAt: -1 });

      if (!applicants) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No applicants found for this opportunity",
        });
      }

      return applicants.map((applicant: IVolunteerApplication & Applicant) => ({
        id: applicant.volunteer.id,
        name: applicant.volunteer.name,
        profileImg: applicant.volunteer.profile_img || "/avatar.svg",
        location: applicant.volunteer.location,
        bio: applicant.volunteer.bio,
        skills: applicant.volunteer.skills,
        completedProjects: applicant.volunteer.completed_projects,
        availability: applicant.volunteer.availability,
        applicationId: applicant.id,
      }));
    }),
}); 