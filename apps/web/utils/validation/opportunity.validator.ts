import { z } from 'zod';

const recurrenceSchema = z.object({
  type: z.string(),
  days: z.array(z.string()).optional(),
  date_range: z.object({
    start_date: z.string(),
    end_date: z.string().optional(),
  }),
  time_range: z.object({
    start_time: z.string(),
    end_time: z.string(),
  }),
  occurrences: z.number().optional(),
});

export const createOpportunitySchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    category: z.array(z.string()).min(1),
    required_skills: z.array(z.string()).min(1),
    requirements: z.array(z.string()).optional(),
    commitment_type: z.string().min(1),
    location: z.string().min(1),
    number_of_volunteers: z.coerce.number().min(1),
    email_contact: z.string().email().optional().or(z.literal('')),
    phone_contact: z.string().optional(),
    internal_reference: z.string().optional(),
    external_event_link: z.string().url().optional().or(z.literal('')),
    start_date: z.string().optional(),
    start_time: z.string().optional(),
    end_date: z.string().optional(),
    end_time: z.string().optional(),
    is_recurring: z.boolean().default(false),
    recurrence: recurrenceSchema.optional(),
    banner_img: z.string().optional(),
    organization_id: z.string().optional(),
  })
  .refine(
    (d) => (d.commitment_type === 'workbased' ? !!(d.end_date && d.end_date.trim()) : true),
    { message: 'End date is required for work-based opportunities', path: ['end_date'] },
  )
  .refine(
    (d) => {
      if (d.start_date && d.end_date && d.start_date.trim() && d.end_date.trim()) {
        return new Date(d.end_date) >= new Date(d.start_date);
      }
      return true;
    },
    { message: 'End date must be on or after start date', path: ['end_date'] },
  );

export const updateOpportunitySchema = createOpportunitySchema;

export const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(6),
  search: z.string().optional(),
  categories: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(',') : undefined)),
  commitmentType: z.enum(['all', 'workbased', 'eventbased']).default('all'),
  location: z.string().optional(),
  sortBy: z.enum(['recently_added', 'start_date', 'best_matches']).default('recently_added'),
  saved: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean().default(false)
  ),
});

export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;
export type ListOpportunitiesQuery = z.infer<typeof listQuerySchema>;