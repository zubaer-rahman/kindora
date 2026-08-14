import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { AvailableUser } from "@/types/message";
import { userService } from "@/services/user.service";

export const useAvailableUsers = (enabled: boolean) => {
  const axiosAuth = useAxiosAuth();

  const { data, isLoading } = useQuery<{ users: AvailableUser[] }>({
    queryKey: ["availableUsers"],
    queryFn: () => userService.getAvailableUsers(axiosAuth, 1, 200, true),
    enabled,
  });

  return {
    availableUsers: data?.users ?? [],
    isLoadingUsers: isLoading,
  };
};
