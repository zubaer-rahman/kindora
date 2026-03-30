import { z } from "zod";

export const organisationRecruitmentValidation = {
  recruitApplicantSchema: z.object({
    applicationId: z.string(),
  }),
}; 