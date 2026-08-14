import { z } from 'zod';

export const updateMentorProfileSchema = z.object({
  name: z.string().optional(),
  image: z.string().optional(),
  bio: z.string().optional(),
  phone_number: z.string().optional(),
  state: z.string().optional(),
  area: z.string().optional(),
  postcode: z.string().optional(),
  interested_on: z.array(z.string()).optional(),
  interested_categories: z.array(z.string()).optional(),
  is_currently_studying: z.string().optional(),
  non_student_type: z.string().optional(),
  university: z.string().optional(),
  graduation_year: z.string().optional(),
  study_area: z.string().optional(),
  student_type: z.string().optional(),
  home_country: z.string().optional(),
  course: z.string().optional(),
  major: z.string().optional(),
  major_other: z.string().optional(),
});

export const getPublicMentorsSchema = z
  .object({
    limit: z.coerce.number().min(1).max(100).default(50),
  })
  .optional();

export const publicMentorProfileSchema = z.object({
  userId: z.string(),
});

export type UpdateMentorProfileInput = z.infer<typeof updateMentorProfileSchema>;
export type GetPublicMentorsQuery = z.infer<typeof getPublicMentorsSchema>;
export type PublicMentorProfileInput = z.infer<typeof publicMentorProfileSchema>;