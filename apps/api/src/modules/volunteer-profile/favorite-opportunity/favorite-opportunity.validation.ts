import { z } from "zod";

export const favoriteOpportunityValidation = {
  getFavoriteStatusSchema: z.object({
    opportunityId: z.string(),
  }),

  toggleFavoriteSchema: z.object({
    opportunityId: z.string(),
  }),
}; 