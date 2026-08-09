import { userValidation } from "@/server/modules/users/users.validation";
import { z } from "zod";

export const signupBaseSchema = userValidation.userSchema.pick({
  name: true,
  email: true,
  password: true,
});

export const profileBasicSchema = userValidation.volunteerProfileSchema.pick({
  bio: true,
  interested_on: true,
  interested_categories: true,
  phone_number: true,
  state: true,
  area: true,
  postcode: true,
});

export const profileDetailSchema = userValidation.volunteerProfileSchema.pick({
  student_type: true,
  home_country: true,
  course: true,
  major: true,
  major_other: true,
  referral_source: true,
  referral_source_other: true,
  is_currently_studying: true,
  non_student_type: true,
  university: true,
  graduation_year: true,
  study_area: true,
});

export const orgProfileSchema = userValidation.organizationProfileSchema;
export const volunteerSignupSchema = z
  .object({
    ...signupBaseSchema.shape,
    // Make profile fields optional during signup for instant experience
    bio: z.string().optional(),
    interested_on: z.array(z.string()).optional(),
    interested_categories: z.array(z.string()).optional(),
    phone_number: z.string().optional(),
    state: z.string().optional(),
    area: z.string().optional(),
    postcode: z.string().optional(),
    student_type: z.string().optional(),
    home_country: z.string().optional(),
    course: z.string().optional(),
    major: z.string().optional(),
    major_other: z.string().optional(),
    referral_source: z.string().optional(),
    referral_source_other: z.string().optional(),
    is_currently_studying: z.string().optional(),
    non_student_type: z.string().optional(),
    university: z.string().optional(),
    graduation_year: z.string().optional(),
    study_area: z.string().optional(),
    confirm_password: z
      .string()
      .min(6, "")
      .nonempty("Please confirm your password"),
    media_consent: z.boolean().default(false).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirm_password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirm_password"],
      });
    }
  });
export const orgSignupSchema = z.object({
  ...signupBaseSchema.shape,
  confirm_password: z
    .string()
    .min(6, "")
    .nonempty("Please confirm your password"),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirm_password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["confirm_password"],
    });
  }
});
export type VolunteerSignupForm = z.infer<typeof volunteerSignupSchema>;
export const mentorSignupSchema = volunteerSignupSchema;
export type MentorSignupForm = z.infer<typeof mentorSignupSchema>;
export type OrgSignupFormData = z.infer<typeof orgSignupSchema>;
export const orgFullSignupSchema = z.object({
  ...signupBaseSchema.shape,
  ...orgProfileSchema.shape,
  confirm_password: z.string(),
});
export type OrgFullSignupFormData = z.infer<typeof orgFullSignupSchema>;
export type SignupFormData = z.infer<typeof signupBaseSchema>;
