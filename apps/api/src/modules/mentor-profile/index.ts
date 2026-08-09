import User from "@/server/db/models/user";
import { protectedProcedure } from "@/server/middlewares/with-auth";
import { JwtPayload } from "jsonwebtoken";
import { router, publicProcedure } from "@/server/trpc";
import { z } from "zod";
import { mentorProfileValidation } from "./mentor-profile.validation";
import MentorProfile from "@/server/db/models/mentor-profile";
import { TRPCError } from "@trpc/server";

const PLACEHOLDER_ROLES = ["Outreach Coordinator", "Logistics Coordinator", "Volunteer Engagement Lead", "Communications Specialist", "Event Planner", "Mentor"];

const isPlaceholder = (val: string | undefined): boolean =>
    !val || val.trim() === "" || val.trim().toLowerCase() === "to be updated";

function isMentorProfileComplete(profile: any): boolean {
    if (!profile) return false;
    const areaOk = !isPlaceholder(profile.area);
    const stateOk = !isPlaceholder(profile.state);
    return areaOk || stateOk;
}

export const mentorProfileRouter = router({
    getPublicMentors: publicProcedure
        .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
        .query(async ({ input }) => {
            const limit = input?.limit ?? 50;
            
            // Revert to a simpler, more robust query
            const users = await User.find({ role: "mentor" })
                .populate("mentor_profile")
                .limit(limit)
                .lean() as any[];

            const mentors = users
                .filter((u) => u.mentor_profile && u.name)
                .map((u, i) => {
                    const profile = u.mentor_profile;
                    const firstInterest = Array.isArray(profile?.interested_on) ? profile.interested_on[0] : null;
                    const role = firstInterest ? `${firstInterest} Mentor` : (PLACEHOLDER_ROLES[i % PLACEHOLDER_ROLES.length]);
                    
                    return {
                        id: u._id.toString(),
                        name: u.name,
                        image: u.image || null,
                        role,
                    };
                });

            return mentors;
        }),

    getPublicMentorProfile: publicProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ input }) => {
            const user = await User.findOne({ _id: input.userId, role: "mentor" })
                .populate("mentor_profile")
                .lean() as any;
            if (!user || !user.mentor_profile || !user.name) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Mentor profile not found." });
            }
            
            const profile = user.mentor_profile;
            const firstInterest = profile?.interested_on?.[0];
            const role = firstInterest ? `${firstInterest} Mentor` : "Mentor";
            
            return {
                id: user._id.toString(),
                name: user.name,
                image: user.image || null,
                role,
                bio: profile.bio || null,
                interested_on: profile.interested_on || [],
                interested_categories: profile.interested_categories || [],
                area: profile.area || null,
                state: profile.state || null,
                postcode: profile.postcode || null,
                country: profile.country || null,
                home_country: profile.home_country || null,
                student_type: profile.student_type || null,
                is_currently_studying: profile.is_currently_studying || null,
                non_student_type: profile.non_student_type || null,
                university: profile.university || null,
                graduation_year: profile.graduation_year || null,
                course: profile.course || null,
                major: profile.major || null,
                major_other: profile.major_other || null,
                study_area: profile.study_area || null,
                availability_date: profile.availability_date || null,
                availability_time: profile.availability_time || null,
                is_available: profile.is_available ?? null,
            };
        }),

    getMentorProfile: protectedProcedure.query(async ({ ctx }) => {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser || !sessionUser?.email) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "You must be logged in to access this data.",
            });
        }

        const user = await User.findOne({ email: sessionUser.email }).populate("mentor_profile").lean() as any;
        if (!user || !user.mentor_profile) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Mentor profile not found.",
            });
        }

        return {
            ...user.mentor_profile,
            name: user.name,
            email: user.email,
            image: user.image,
        };
    }),

    updateMentorProfile: protectedProcedure
        .input(mentorProfileValidation.updateMentorProfileSchema)
        .mutation(async ({ ctx, input }) => {
            const sessionUser = ctx.user as JwtPayload;
            if (!sessionUser || !sessionUser?.email) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You must be logged in to update your profile.",
                });
            }

            const user = await User.findOne({ email: sessionUser.email });
            if (!user || !user.mentor_profile) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Mentor profile not found.",
                });
            }

            const { name, image, ...profileData } = input;

            if (name || image) {
                await User.updateOne(
                    { email: sessionUser.email },
                    { $set: { ...(name && { name }), ...(image && { image }) } }
                );
            }

            const updatedProfile = await MentorProfile.findByIdAndUpdate(
                user.mentor_profile,
                { $set: profileData },
                { new: true }
            );

            return updatedProfile;
        }),
});
