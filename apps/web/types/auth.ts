import { volunteerProfileSchema, organizationProfileSchema } from "@/server/validators/user.validator";
import { registerSchema } from "@/server/validators/auth.validator";
import { z } from "zod";

export const signupBaseSchema = registerSchema.pick({
  name: true,
  email: true,
  password: true,
});

export const orgProfileSchema = organizationProfileSchema;
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
      .min(6, "Please confirm your password"),
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
    .min(6, "Please confirm your password"),
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
