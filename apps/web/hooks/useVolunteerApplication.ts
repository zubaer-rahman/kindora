import { trpc } from "@/utils/trpc";
import { useState, useEffect, useMemo } from "react";

import { useSession } from "next-auth/react";

export const useVolunteerApplication = (opportunityId: string) => {
  const { data: session } = useSession();
  const [isApplied, setIsApplied] = useState(false);
  const [applicationStatusValue, setApplicationStatusValue] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const utils = trpc.useUtils();

  // Query to check if user has already applied
  const { data: applicationStatus, isPending: isStatusPending } = trpc.applications.getApplicationStatus.useQuery(
    { opportunityId },
    { enabled: !!session?.user }
  );

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
  const applyMutation = trpc.applications.applyToOpportunity.useMutation({
    onSuccess: () => {
      setIsApplied(true);
      // Invalidate all application-related queries to update dashboard tabs
      utils.applications.getApplicationStatus.invalidate();
      utils.applications.getCurrentUserActiveApplicationsCount.invalidate();
      utils.applications.getCurrentUserRecentApplicationsCount.invalidate();
      utils.applications.getCurrentUserActiveApplications.invalidate();
      utils.applications.getCurrentUserRecentApplications.invalidate();
      utils.applications.getCurrentUserApprovedApplications.invalidate();
      // Invalidate opportunities to update recruit counts
      utils.opportunities.getAllOpportunities.invalidate();
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