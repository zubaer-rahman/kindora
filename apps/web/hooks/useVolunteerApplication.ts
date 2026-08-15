import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { useState, useEffect, useMemo } from "react";

import { useSession } from "next-auth/react";
import { applicationService } from "@/services/application.service";

export const useVolunteerApplication = (opportunityId: string) => {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const [isApplied, setIsApplied] = useState(false);
  const [applicationStatusValue, setApplicationStatusValue] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  // Query to check if user has already applied
  const { data: applicationStatus, isPending: isStatusPending } = useQuery({
    queryKey: ["applicationStatus", opportunityId],
    queryFn: async () => {
      if (!opportunityId) return { status: null };
      return applicationService.getStatus(axiosAuth, opportunityId);
    },
    enabled: !!session?.user && !!opportunityId,
  });

  // Memoize the application state to prevent unnecessary re-renders
  const applicationState = useMemo(() => {
    if (!session?.user) {
      return { isApplied: false, isLoading: false, status: null };
    }

    if (isStatusPending) {
      return { isApplied: false, isLoading: true, status: null };
    }

    const status = applicationStatus?.status;
    const isApproved = status === "approved";
    const isPending = status === "pending";
    return {
      // Only "pending" means the user is still in the Apply flow.
      // If "approved", we switch the UI to roster actions instead.
      isApplied: isPending,
      isLoading: false,
      status: status ?? null,
    };
  }, [applicationStatus, isStatusPending, session]);

  useEffect(() => {
    setIsApplied(applicationState.isApplied);
    setApplicationStatusValue(applicationState.status);
    setIsLoading(applicationState.isLoading);
  }, [applicationState]);

  // Mutation to apply for opportunity
  const applyMutation = useMutation({
    mutationFn: (payload: { opportunityId: string }) => 
      applicationService.apply(axiosAuth, payload.opportunityId),
    onSuccess: () => {
      setIsApplied(true);
      // Invalidate all application-related queries to update dashboard tabs
      queryClient.invalidateQueries({ queryKey: ["applicationStatus"] });
      queryClient.invalidateQueries({ queryKey: ["applicationsActiveCount"] });
      queryClient.invalidateQueries({ queryKey: ["applicationsRecentCount"] });
      queryClient.invalidateQueries({ queryKey: ["activeApplications"] });
      queryClient.invalidateQueries({ queryKey: ["recentApplications"] });
      queryClient.invalidateQueries({ queryKey: ["approvedApplications"] });
      // Invalidate opportunities to update recruit counts
      queryClient.invalidateQueries({ queryKey: ["allOpportunities"] });
    },
  });

  const handleApply = () => {
    applyMutation.mutate({ opportunityId });
  };

  return {
    isApplied,
    isLoading,
    applicationStatus: applicationStatusValue,
    isApplying: applyMutation.isPending,
    handleApply,
  };
}; 
