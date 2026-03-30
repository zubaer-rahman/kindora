import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { JwtPayload } from "jsonwebtoken";
import { publicProcedure, router } from "../../trpc";
import { skillsValidation } from "./skills.validation";
import Skill from "../../db/models/skill";
import { SKILL_OPTIONS } from "../../../utils/constants";
import { protectedProcedure } from "../../middlewares/with-auth";

export const skillsRouter = router({
  // Get all skills (predefined + custom)
  getAll: publicProcedure
    .input(skillsValidation.getSkillsSchema)
    .query(async ({ input }) => {
      try {
        const { search, limit } = input;
        
        let query = {};
        if (search) {
          query = {
            name: { $regex: search, $options: "i" }
          };
        }

        const skills = await Skill.find(query)
          .sort({ usage_count: -1, name: 1 })
          .limit(limit);

        return {
          success: true,
          data: skills,
        };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch skills",
        });
      }
    }),

  // Create a new custom skill (ignores duplicates)
  create: protectedProcedure
    .input(skillsValidation.createSkillSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { name } = input;
        const sessionUser = ctx.user as JwtPayload;
        const userId = sessionUser?.id || sessionUser?._id;

        if (!userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User must be logged in to create skills",
          });
        }

        const trimmedName = name.trim();

        // Check if skill already exists (case-insensitive)
        const existingSkill = await Skill.findOne({ 
          name: { $regex: new RegExp(`^${trimmedName}$`, "i") } 
        });

        if (existingSkill) {
          // Return existing skill instead of throwing error
          return {
            success: true,
            data: existingSkill,
            message: "Skill already exists, returning existing skill",
          };
        }

        const skill = new Skill({
          name: trimmedName,
          is_custom: true,
          created_by: userId,
          usage_count: 0,
        });

        await skill.save();

        return {
          success: true,
          data: skill,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create skill",
        });
      }
    }),

  // Update skill usage count
  incrementUsage: publicProcedure
    .input(z.object({ skillIds: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      try {
        const { skillIds } = input;

        await Skill.updateMany(
          { _id: { $in: skillIds } },
          { $inc: { usage_count: 1 } }
        );

        return {
          success: true,
          message: "Usage count updated",
        };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update usage count",
        });
      }
    }),

  // Initialize predefined skills (run once, ignores duplicates)
  initializePredefined: publicProcedure
    .mutation(async () => {
      try {
        const existingSkills = await Skill.find({ is_custom: false });
        
        if (existingSkills.length > 0) {
          return {
            success: true,
            message: "Predefined skills already initialized",
            count: existingSkills.length,
          };
        }

        const predefinedSkills = SKILL_OPTIONS.map(skill => ({
          name: skill.value,
          is_custom: false,
          usage_count: 0,
        }));

        // Use insertMany with ordered: false to ignore duplicates
        try {
          await Skill.insertMany(predefinedSkills, { ordered: false });
        } catch (error) {
          // If error is due to duplicates, that's fine - we just want to ensure skills exist
          if (error && typeof error === 'object' && 'code' in error && error.code !== 11000) {
            throw error;
          }
        }

        const finalCount = await Skill.countDocuments({ is_custom: false });

        return {
          success: true,
          message: "Predefined skills initialized",
          count: finalCount,
        };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to initialize predefined skills",
        });
      }
    }),

  // Get skills for MultiSelect (combines predefined + custom)
  getForMultiSelect: publicProcedure
    .input(z.object({ 
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(50)
    }))
    .query(async ({ input }) => {
      try {
        const { search, limit } = input;
        
        let query = {};
        if (search) {
          query = {
            name: { $regex: search, $options: "i" }
          };
        }

        const skills = await Skill.find(query)
          .sort({ createdAt: -1, usage_count: -1, name: 1 })
          .limit(limit);

        // Ensure unique skills by name (case-insensitive)
        const uniqueSkills = new Map<string, typeof skills[0]>();
        skills.forEach(skill => {
          const normalizedName = skill.name.toLowerCase();
          if (!uniqueSkills.has(normalizedName)) {
            uniqueSkills.set(normalizedName, skill);
          }
        });

        // Format for MultiSelect component - use skill name as value for volunteer profile compatibility
        const options = Array.from(uniqueSkills.values()).map(skill => ({
          value: skill.name,
          label: skill.name,
        }));

        return {
          success: true,
          data: options,
        };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch skills for MultiSelect",
        });
      }
    }),
}); 