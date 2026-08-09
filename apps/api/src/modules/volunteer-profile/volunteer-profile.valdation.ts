import { z } from "zod";

const updateVolunteerProfileSchema = z.object({
  name: z.string().optional(),
  phone_number: z.string().optional(),
  bio: z.string().optional(),
  interested_on: z.array(z.string()).optional(),
  interested_categories: z.array(z.string()).optional(),
  state: z.string().optional(),
  area: z.string().optional(),
  postcode: z.string().optional(),
  // Academic fields
  student_type: z.string().optional(),
  home_country: z.string().optional(),
  course: z.string().optional(),
  major: z.string().optional(),
  major_other: z.string().optional(),
  is_currently_studying: z.string().optional(),
  non_student_type: z.string().optional(),
  university: z.string().optional(),
  graduation_year: z.string().optional(),
  study_area: z.string().optional(),
  availability_date: z.object({
    start_date: z.string().optional(),
    end_date: z.string().optional()
  }).optional(),
  is_available: z.boolean().optional(),
  image: z.string().optional(),
});

const applyToOpportunitySchema = z.object({
  opportunityId: z.string(),
});

const getApplicationStatusSchema = z.object({
  opportunityId: z.string(),
});

export const volunteerValidation = {
  updateVolunteerProfileSchema,
  applyToOpportunitySchema,
  getApplicationStatusSchema,
};
