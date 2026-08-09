import { z } from "zod";

export const skillsValidation = {
  createSkillSchema: z.object({
    name: z.string().min(1, "Skill name is required").max(50, "Skill name must be less than 50 characters"),
  }),

  getSkillsSchema: z.object({
    search: z.string().optional(),
    limit: z.number().min(1).max(100).default(50),
  }),

  updateSkillSchema: z.object({
    id: z.string().min(1, "Skill ID is required"),
    name: z.string().min(1, "Skill name is required").max(50, "Skill name must be less than 50 characters"),
  }),

  deleteSkillSchema: z.object({
    id: z.string().min(1, "Skill ID is required"),
  }),
}; 