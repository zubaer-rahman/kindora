import { useState } from "react";
import { trpc } from "../utils/trpc";

export function useHasProfile() {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null); // null = not checked yet

  const query = trpc.users.profileCheckup.useQuery(undefined, {
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
