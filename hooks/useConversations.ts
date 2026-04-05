import { trpc } from "@/utils/trpc";
import { useSession } from "next-auth/react";

export const useConversations = () => {
  const { data: session } = useSession();
  const utils = trpc.useUtils();

  // Initial load of conversations and groups with polling
  const { data: conversations, isLoading: isLoadingConversations } =
    trpc.messages.getConversations.useQuery(undefined, {
      enabled: !!session?.user?.id,
      staleTime: 5 * 1000, // 5 seconds
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchInterval: 30000, // Poll every 30 seconds for new conversations
    });

  const { data: groups, isLoading: isLoadingGroups } =
    trpc.messages.getGroups.useQuery(undefined, {
      enabled: !!session?.user?.id,
      staleTime: 5 * 1000, // 5 seconds
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchInterval: 30000, // Poll every 30 seconds for new groups
    });

  const markAsReadMutation = trpc.messages.markAsRead.useMutation({
    onSuccess: () => {
      // Only invalidate the necessary queries
      utils.messages.getConversations.invalidate();
      utils.messages.getGroups.invalidate();
    },
  });

  return {
    conversations,
    groups,
    isLoadingConversations,
    isLoadingGroups,
    markAsReadMutation,
  };
};
