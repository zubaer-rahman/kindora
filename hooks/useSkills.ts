import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { SKILL_OPTIONS } from "@/utils/constants";

export interface SkillOption {
  value: string;
  label: string;
}

export const useSkills = () => {
  const [skillOptions, setSkillOptions] = useState<SkillOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Query to get skills for MultiSelect
  const { data, refetch: refetchSkills } = trpc.skills.getForMultiSelect.useQuery(
    { limit: 100 }
  );

  // Update options when data changes
  useEffect(() => {
    if (data?.success && data.data) {
      // Use API data - handle the type safely
      const apiOptions: SkillOption[] = [];
      for (const item of data.data) {
        if (item && typeof item === 'object' && 'label' in item) {
          apiOptions.push({
            value: String(item.value || item.label),
            label: String(item.label),
          });
        }
      }
      setSkillOptions(apiOptions);
    } else {
      // Fallback to predefined skills
      setSkillOptions(SKILL_OPTIONS);
    }
    setIsLoading(false);
  }, [data]);

  // Mutation to create new skill
  const createSkillMutation = trpc.skills.create.useMutation({
    onSuccess: () => {
      refetchSkills();
    },
  });

  // Mutation to increment usage count
  const incrementUsageMutation = trpc.skills.incrementUsage.useMutation();

  // Initialize predefined skills (run once)
  const initializePredefinedMutation = trpc.skills.initializePredefined.useMutation({
    onSuccess: () => {
      refetchSkills();
    },
  });

  // Create a new skill
  const createSkill = async (skillName: string) => {
    try {
      const result = await createSkillMutation.mutateAsync({ name: skillName });
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Increment usage count for skills
  const incrementUsage = async (skillIds: string[]) => {
    try {
      await incrementUsageMutation.mutateAsync({ skillIds });
    } catch (error) {
      console.error("Failed to increment usage count:", error);
    }
  };

  // Initialize predefined skills
  const initializePredefined = async () => {
    try {
      await initializePredefinedMutation.mutate();
    } catch (error) {
      console.error("Failed to initialize predefined skills:", error);
    }
  };

  return {
    skillOptions,
    isLoading,
    createSkill,
    incrementUsage,
    initializePredefined,
    refetchSkills,
    isCreating: createSkillMutation.isPending,
    isInitializing: initializePredefinedMutation.isPending,
  };
}; 