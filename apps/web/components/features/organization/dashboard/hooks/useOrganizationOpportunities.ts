import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { Opportunity } from "@/types/opportunities";
import { Volunteer, RecruitedApplicant } from "@/types/organization";
import { opportunityService } from "@/services/opportunity.service";
import { applicationService } from "@/services/application.service";
import { userService } from "@/services/user.service";

export type { Volunteer, RecruitedApplicant };

export function useOrganizationOpportunities() {
  const axiosAuth = useAxiosAuth();

  const {
    data: opportunities,
    isLoading: isLoadingOpportunities,
    isError: isOpportunitiesError,
  } = useQuery({
    queryKey: ["organizationOpportunities"],
    queryFn: async () => {
      const res = await opportunityService.getMyOrgOpportunities(axiosAuth);
      return res as Opportunity[];
    },
  });

  const { data: recruitedApplicants } = useQuery({
    queryKey: ["recruitments"],
    queryFn: async () => {
      const res = await applicationService.getRecruitments(axiosAuth);
      return res as RecruitedApplicant[];
    },
    enabled: !!opportunities?.length,
  });

  const { data: availableVolunteersData, isLoading: isLoadingVolunteers } = useQuery({
    queryKey: ["availableUsers"],
    queryFn: async () => {
      const res = await userService.getAvailableUsers(axiosAuth, 1, 10);
      return (res?.users ?? []) as Volunteer[];
    },
  });

  return {
    opportunities,
    isLoadingOpportunities,
    isOpportunitiesError,
    recruitedApplicants,
    availableVolunteers: Array.isArray(availableVolunteersData) 
      ? availableVolunteersData 
      : (availableVolunteersData as any)?.users ?? [],
    isLoadingVolunteers,
  };
}
