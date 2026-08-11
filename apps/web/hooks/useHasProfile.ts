import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "./useAxiosAuth";

export function useHasProfile() {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null); // null = not checked yet
  const axiosAuth = useAxiosAuth();

  const query = useQuery({
    queryKey: ["profileCheckup"],
    queryFn: async () => {
      const res = await axiosAuth.get("/api/v1/users/me/profile-checkup");
      return res.data.data;
    },
    enabled: false,
  });

  const checkProfile = async () => {
    try {
      const result = await query.refetch();
      const hasProfile = !!result.data;
      setHasProfile(hasProfile);
      return hasProfile;
    } catch (error) {
      console.error("Failed to check profile", error);
      setHasProfile(false);
      return false;
    }
  };

  return {
    hasProfile,
    isLoading: query.isLoading || query.isRefetching,
    error: query.error,
    checkProfile,
  };
}
