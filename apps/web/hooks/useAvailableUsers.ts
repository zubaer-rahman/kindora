import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { AvailableUser } from "@/types/message";

export const useAvailableUsers = (enabled: boolean) => {
  const axiosAuth = useAxiosAuth();

  const { data, isLoading } = useQuery<{ users: AvailableUser[] }>({
    queryKey: ["availableUsers"],
    queryFn: async () => {
      const res = await axiosAuth.get("/api/v1/users/available", {
        params: {
          page: 1,
          limit: 200,
          includeMentors: true,
        },
      });
      return res.data.data;
    },
    enabled,
  });

  return {
    availableUsers: data?.users ?? [],
    isLoadingUsers: isLoading,
  };
};
