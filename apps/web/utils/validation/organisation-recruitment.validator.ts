import { z } from 'zod';

export const recruitApplicantSchema = z.object({
  applicationId: z.string(),
});

export const recruitedApplicantsQuerySchema = z.object({
  opportunityId: z.string().optional(),
});

export type RecruitApplicantInput = z.infer<typeof recruitApplicantSchema>;
export type RecruitedApplicantsQuery = z.infer<typeof recruitedApplicantsQuerySchema>;