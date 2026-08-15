import { z } from 'zod';

export const getAvailableUsersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(200).default(6),
  search: z.string().optional(),
  categories: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(',').filter(Boolean) : undefined)),
  studentType: z.enum(['all', 'yes', 'no']).default('all'),
  memberType: z.enum(['all', 'staff', 'alumni', 'general_public']).default('all'),
  availability: z
    .string()
    .optional()
    .transform((v) => {
      if (!v) return undefined;
      try {
        return JSON.parse(v) as { startDate?: string; endDate?: string };
      } catch {
        return undefined;
      }
    }),
  location: z.string().optional(),
  sortBy: z
    .enum(['best_matches', 'recently_added', 'available', 'not_available'])
    .optional(),
  includeMentors: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
});

export const onlineStatusQuerySchema = z.object({
  userIds: z.string().transform((v) => (v ? v.split(',').filter(Boolean) : [])),
});

export const getOrganizationUsersSchema = z.object({
  organizationId: z.string(),
});

export const userIdParamSchema = z.object({
  userId: z.string(),
});

export const updateUserRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(['admin', 'mentor']),
});

export const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
  provider: z.enum(['credentials', 'google']).optional(),
  role: z.enum(['admin', 'volunteer', 'mentor', 'organization']).optional(),
  image: z.string().optional(),
  referred_by: z.string().optional(),
  is_verified: z.boolean().optional(),
  volunteer_profile: z.string().optional(),
  mentor_profile: z.string().optional(),
  organization_profile: z.string().optional(),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const volunteerProfileSchema = z.object({
  bio: z.string().optional(),
  interested_on: z.array(z.string()).min(1, 'Please select at least one interest'),
  interested_categories: z.array(z.string()).optional(),
  phone_number: z.string().min(1, 'Phone number is required'),
  country: z.string().optional(),
  state: z.string().optional(),
  area: z.string().optional(),
  postcode: z.string().optional(),
  student_type: z.string().optional(),
  course: z.string().optional(),
  major: z.string().optional(),
  major_other: z.string().optional(),
  referral_source: z.string().min(1, 'Please select a referral source'),
  home_country: z.string().optional(),
  referral_source_other: z.string().optional(),
  is_currently_studying: z.string().optional(),
  non_student_type: z.string().optional(),
  university: z.string().optional(),
  graduation_year: z.string().optional(),
  study_area: z.string().optional(),
  is_available: z.boolean().optional(),
  user: z.string().optional(),
});

export const mentorProfileSchema = volunteerProfileSchema;

export const organizationProfileSchema = z.object({
  title: z.string().optional(),
  contact_email: z.string().email('Invalid email address').optional(),
  phone_number: z.string().optional(),
  bio: z.string().optional(),
  type: z
    .string()
    .min(1, 'Organisation type is required')
    .refine(
      (val) =>
        [
          'ngo',
          'nonprofit',
          'community_group',
          'social_enterprise',
          'charity',
          'educational_institution',
          'healthcare_provider',
          'religious_institution',
          'environmental_group',
          'youth_organization',
          'arts_culture_group',
          'disaster_relief_agency',
          'advocacy_group',
          'international_aid',
          'sports_club',
          'animal_shelter',
        ].includes(val),
      'Please select a valid organisation type',
    ),
  opportunity_types: z
    .array(z.string())
    .min(1, 'Please select at least one opportunity type')
    .refine(
      (arr) => arr.every((item) => item.length > 0),
      'All opportunity types must be valid',
    ),
  required_skills: z
    .array(z.string())
    .min(1, 'Please select at least one required skill')
    .refine(
      (arr) => arr.every((item) => item.length > 0),
      'All required skills must be valid',
    ),
  state: z.string().optional(),
  area: z.string().optional(),
  abn: z.string().optional(),
  website: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        val === '' ||
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(val),
      'Please enter a valid website URL or leave it empty',
    ),
  profile_img: z.string().optional(),
  cover_img: z.string().optional(),
  user: z.string().optional(),
});

export type AvailableUsersQuery = z.infer<typeof getAvailableUsersSchema>;
export type OnlineStatusQuery = z.infer<typeof onlineStatusQuerySchema>;
export type OrganizationUsersInput = z.infer<typeof getOrganizationUsersSchema>;
export type UserIdInput = z.infer<typeof userIdParamSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VolunteerProfileInput = z.infer<typeof volunteerProfileSchema>;
export type OrganizationProfileInput = z.infer<typeof organizationProfileSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;