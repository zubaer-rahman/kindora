import { z } from "zod";

const applyToOpportunitySchema = z.object({
  opportunityId: z.string(),
});

const getApplicationStatusSchema = z.object({
  opportunityId: z.string(),
});
const getOpportunityApplicantsSchema = z.object({
  opportunityId: z.string(),
});

export const volunteerApplicationValidation = {
  applyToOpportunitySchema,
  getApplicationStatusSchema,
  getOpportunityApplicantsSchema,
}; 