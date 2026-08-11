import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { SKILL_OPTIONS } from "@/utils/constants";

export interface SkillOption {
  value: string;
  label: string;
}

export const useSkills = () => {
  const axiosAuth = useAxiosAuth();
  const [skillOptions, setSkillOptions] = useState<SkillOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Query to get skills for MultiSelect
  const { data, refetch: refetchSkills } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const res = await axiosAuth.get("/api/v1/skills/multi-select", {
        params: { limit: 100 },
      });
      return res.data.data;
    },
  });

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
  const createSkillMutation = useMutation({
    mutationFn: async (payload: { name: string }) => {
      const res = await axiosAuth.post("/api/v1/skills", payload);
      return res.data.data;
    },
    onSuccess: () => {
      refetchSkills();
    },
  });

  // Mutation to increment usage count
  const incrementUsageMutation = useMutation({
    mutationFn: async (payload: { skillIds: string[] }) => {
      const res = await axiosAuth.post("/api/v1/skills/increment-usage", payload);
      return res.data.data;
    },
  });

  // Initialize predefined skills (run once)
  const initializePredefinedMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosAuth.post("/api/v1/skills/initialize");
      return res.data.data;
    },
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
