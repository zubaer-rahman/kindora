import { z } from 'zod';

export const createSkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required').max(50, 'Skill name must be less than 50 characters'),
});

export const getSkillsSchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export const incrementUsageSchema = z.object({
  skillIds: z.array(z.string()),
});

export const getForMultiSelectSchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type GetSkillsQuery = z.infer<typeof getSkillsSchema>;
export type IncrementUsageInput = z.infer<typeof incrementUsageSchema>;
export type GetForMultiSelectQuery = z.infer<typeof getForMultiSelectSchema>;