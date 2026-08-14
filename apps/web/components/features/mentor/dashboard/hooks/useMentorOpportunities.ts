import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { Opportunity } from "@/types/opportunities";
import { opportunityService } from "@/services/opportunity.service";

export function useMentorOpportunities() {
  const axiosAuth = useAxiosAuth();

  const {
    data: opportunities,
    isLoading: isLoadingOpportunities,
    isError: isOpportunitiesError,
  } = useQuery({
    queryKey: ["mentorOpportunities"],
    queryFn: async () => {
      const res = await opportunityService.getAllMentorOpportunities(axiosAuth);
      return (res?.opportunities ?? []) as Opportunity[];
    },
  });

  // Mentors may not have recruited applicants or available volunteers in the same way 
  // as organisations. For now, returning empty arrays to satisfy the SharedDashboard props.
  const recruitedApplicants: any[] = [];
  const availableVolunteers: any[] = [];

  return {
    opportunities,
    isLoadingOpportunities,
    isOpportunitiesError,
    recruitedApplicants,
    availableVolunteers,
    isLoadingVolunteers: false,
  };
}
