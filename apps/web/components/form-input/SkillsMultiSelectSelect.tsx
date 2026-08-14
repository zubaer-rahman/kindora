import React, { useState, useEffect } from "react";
import { MultiSelect } from "@/components/form-input/MultiSelect";
import { SKILL_OPTIONS } from "@/utils/constants";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { cn } from "@/lib/utils";

interface SkillsMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  className?: string;
}

export const SkillsMultiSelect: React.FC<SkillsMultiSelectProps> = ({
  value,
  onChange,
  placeholder = "Select skills...",
  disabled = false,
  error,
  label,
  className,
}) => {
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const axiosAuth = useAxiosAuth();

  const { data, refetch: refetchSkills } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const res = await axiosAuth.get("/api/v1/skills/multi-select", {
        params: { limit: 100 },
      });
      return res.data.data;
    },
  });

  const initializeMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosAuth.post("/api/v1/skills/initialize");
      return res.data.data;
    },
    onSuccess: () => {
      refetchSkills();
    },
  });

  useEffect(() => {
    if (data?.success && data.data) {
      const uniqueOptions = new Map<string, { value: string; label: string }>();

      SKILL_OPTIONS.forEach((option) => {
        uniqueOptions.set(option.value, option);
      });

      (data.data as { value: string; label: string }[]).forEach((option) => {
        uniqueOptions.set(option.value, option);
      });

      setOptions(Array.from(uniqueOptions.values()));
    } else {
      setOptions(SKILL_OPTIONS);
    }
    setIsLoading(false);
  }, [data]);

  useEffect(() => {
    if (options.length === 0 && !isLoading) {
      initializeMutation.mutate();
    }
  }, [options.length, isLoading, initializeMutation]);

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-sm font-medium">{label}</label>}
      <MultiSelect
        options={options}
        onValueChange={onChange}
        value={value}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        manualInputEnabled={true}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
