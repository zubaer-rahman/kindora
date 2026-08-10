import { registerSchema } from "@/server/validators/auth.validator";
import { volunteerProfileSchema, resetPasswordSchema } from "@/server/validators/user.validator";
import { z } from "zod";
import { updateVolunteerProfileSchema } from "@/server/validators/volunteer-profile.validator";
import { updateMentorProfileSchema } from "@/server/validators/mentor-profile.validator";
import { SKILL_OPTIONS, CATEGORIES_OPTIONS, STATES_OPTIONS, ORGANIZATION_TYPES } from "./select-options";

export const SignupFormSchema = registerSchema;
export type SignupForm = z.infer<typeof SignupFormSchema>;

export const VolunteerProfileFormSchema = volunteerProfileSchema;
export type VolunteerProfileForm = z.infer<typeof VolunteerProfileFormSchema>;

export const VolunteerProfileUpdateSchema = updateVolunteerProfileSchema;
export type VolunteerProfileUpdateData = z.infer<
  typeof VolunteerProfileUpdateSchema
>;

export const MentorProfileUpdateSchema = updateMentorProfileSchema;
export type MentorProfileUpdateData = z.infer<
  typeof MentorProfileUpdateSchema
>;

export const ResetPasswordSchema = resetPasswordSchema;
export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;

export { SKILL_OPTIONS, CATEGORIES_OPTIONS, STATES_OPTIONS, ORGANIZATION_TYPES };