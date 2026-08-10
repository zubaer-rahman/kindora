import { authValidation } from "@/server/validators/auth.validator";
import { userValidation } from "@/server/validators/user.validator";
import { z } from "zod";
import { volunteerValidation } from "@/server/validators/volunteer-profile.validator";
import { mentorProfileValidation } from "@/server/validators/mentor-profile.validator";
import { SKILL_OPTIONS, CATEGORIES_OPTIONS, STATES_OPTIONS, ORGANIZATION_TYPES } from "./select-options";

export const SignupFormSchema = authValidation.signupSchema;
export type SignupForm = z.infer<typeof SignupFormSchema>;

export const VolunteerProfileFormSchema = userValidation.volunteerProfileSchema;
export type VolunteerProfileForm = z.infer<typeof VolunteerProfileFormSchema>;

export const VolunteerProfileUpdateSchema =
  volunteerValidation.updateVolunteerProfileSchema;
export type VolunteerProfileUpdateData = z.infer<
  typeof VolunteerProfileUpdateSchema
>;

export const MentorProfileUpdateSchema =
  mentorProfileValidation.updateMentorProfileSchema;
export type MentorProfileUpdateData = z.infer<
  typeof MentorProfileUpdateSchema
>;

export const ResetPasswordSchema = userValidation.resetPasswordSchema;
export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;

export { SKILL_OPTIONS, CATEGORIES_OPTIONS, STATES_OPTIONS, ORGANIZATION_TYPES };