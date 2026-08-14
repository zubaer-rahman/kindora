import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

export function useUserMutations() {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const updateRoleMutation = useMutation({
    mutationFn: async (payload: { userId: string; role: "admin" | "mentor" }) => {
      const res = await axiosAuth.patch(`/api/v1/users/${payload.userId}/role`, { role: payload.role });
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("User role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["organizationUsers"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update user role");
    },
  });

  const demoteMentorMutation = useMutation({
    mutationFn: async (payload: { userId: string }) => {
      const res = await axiosAuth.post(`/api/v1/users/${payload.userId}/demote`);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Mentor role removed successfully");
      queryClient.invalidateQueries({ queryKey: ["organizationUsers"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to remove mentor role");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (payload: { userId: string }) => {
      const res = await axiosAuth.delete(`/api/v1/users/${payload.userId}`);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["organizationUsers"] });
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete user");
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    },
  });

  const handleUpdateRole = (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "mentor" : "admin";
    updateRoleMutation.mutate({ userId, role: newRole as "admin" | "mentor" });
  };

  const handleToggleMentor = (userId: string, currentRole: string) => {
    if (currentRole === "mentor") {
      demoteMentorMutation.mutate({ userId });
    } else if (currentRole === "volunteer") {
      updateRoleMutation.mutate({ userId, role: "mentor" });
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate({ userId: userToDelete });
    }
  };

  return {
    updateRoleMutation,
    demoteMentorMutation,
    deleteUserMutation,
    handleUpdateRole,
    handleToggleMentor,
    handleDeleteUser,
    confirmDeleteUser,
    userToDelete,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    session,
  };
}
