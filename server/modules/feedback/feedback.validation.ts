import { z } from "zod";

export const createFeedbackSchema = z.object({
  message: z
    .string()
    .min(1, "Feedback message is required")
    .max(1000, "Feedback message must be less than 1000 characters")
    .trim(),
});

export const getFeedbackSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
export type GetFeedbackInput = z.infer<typeof getFeedbackSchema>;