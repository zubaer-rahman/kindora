import { AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import toast from "react-hot-toast";

export const useMessageActions = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const deleteGroupMutation = useMutation({
    mutationFn: async (payload: { groupId: string }) => {
      const res = await axiosAuth.delete(`/api/v1/messages/groups/${payload.groupId}`);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Group deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error?.response?.data?.message || "Failed to delete group");
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (payload: { conversationId: string }) => {
      const res = await axiosAuth.delete(`/api/v1/messages/conversation/${payload.conversationId}`);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Conversation deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error?.response?.data?.message || "Failed to delete conversation");
    },
  });

  return {
    deleteGroupMutation,
    deleteConversationMutation,
  };
};
