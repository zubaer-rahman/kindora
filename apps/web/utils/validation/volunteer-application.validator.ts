import { z } from 'zod';

export const opportunityIdSchema = z.object({
  opportunityId: z.string(),
});

export const getApplicationStatusSchema = opportunityIdSchema;
export const applyToOpportunitySchema = opportunityIdSchema;
export const getOpportunityApplicantsSchema = opportunityIdSchema;

export const volunteerIdParamSchema = z.string();

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(6),
});

export const completedOpportunitiesQuerySchema = z.object({
  volunteerId: z.string(),
  currentOpportunityId: z.string(),
});

export type OpportunityIdInput = z.infer<typeof opportunityIdSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type CompletedOpportunitiesQuery = z.infer<
  typeof completedOpportunitiesQuerySchema
>;