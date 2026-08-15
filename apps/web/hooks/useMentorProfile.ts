import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { profileService } from "@/services/profile.service";
import { IMentorProfile } from "@/types/api/mentor-profile";
import { MentorProfileUpdateData } from "@/utils/constants";
import toast from "react-hot-toast";

export const useMentorProfile = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['mentorProfile'],
    queryFn: () => profileService.getMentorProfile(axiosAuth),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: MentorProfileUpdateData) => 
      profileService.updateMentorProfile(axiosAuth, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorProfile'] });
      toast.success("Mentor profile updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    },
  });

  return {
    profile,
    isLoading,
    updateProfileMutation,
  };
};
