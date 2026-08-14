import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { messageService } from "@/services/message.service";

export const useConversations = () => {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  // Initial load of conversations and groups with polling
  const { data: conversations, isLoading: isLoadingConversations } =
    useQuery({
      queryKey: ["conversations"],
      queryFn: () => messageService.getConversations(axiosAuth),
      enabled: !!session?.user?.id,
      staleTime: 5 * 1000, // 5 seconds
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchInterval: 30000, // Poll every 30 seconds for new conversations
    });

  const { data: groups, isLoading: isLoadingGroups } =
    useQuery({
      queryKey: ["groups"],
      queryFn: () => messageService.getGroups(axiosAuth),
      enabled: !!session?.user?.id,
      staleTime: 5 * 1000, // 5 seconds
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchInterval: 30000, // Poll every 30 seconds for new groups
    });

  const markAsReadMutation = useMutation({
    mutationFn: (payload: { conversationId: string }) => 
      messageService.markAsRead(axiosAuth, payload.conversationId),
    onSuccess: () => {
      // Only invalidate the necessary queries
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  const invalidateGroups = () => {
    queryClient.invalidateQueries({ queryKey: ["groups"] });
  };

  return {
    conversations,
    groups,
    isLoadingConversations,
    isLoadingGroups,
    markAsReadMutation,
    invalidateGroups,
  };
};
