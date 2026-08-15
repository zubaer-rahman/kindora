import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { profileService } from "@/services/profile.service";
import { IVolunteerProfile } from "@/types/api/volunteer-profile";
import { VolunteerProfileUpdateData } from "@/utils/constants";
import toast from "react-hot-toast";

export const useVolunteerProfile = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['volunteerProfile'],
    queryFn: () => profileService.getVolunteerProfile(axiosAuth),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: VolunteerProfileUpdateData) => 
      profileService.updateVolunteerProfile(axiosAuth, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteerProfile'] });
      toast.success("Volunteer profile updated successfully!");
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
