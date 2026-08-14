import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { Opportunity } from "@/types/opportunities";
import { Volunteer, RecruitedApplicant } from "@/types/organization";

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
      const res = await axiosAuth.get("/api/v1/opportunities/my-org");
      return res.data.data as Opportunity[];
    },
  });

  const { data: recruitedApplicants } = useQuery({
    queryKey: ["recruitments"],
    queryFn: async () => {
      const res = await axiosAuth.get("/api/v1/recruitments");
      return res.data.data as RecruitedApplicant[];
    },
    enabled: !!opportunities?.length,
  });

  const { data: availableVolunteersData, isLoading: isLoadingVolunteers } = useQuery({
    queryKey: ["availableUsers"],
    queryFn: async () => {
      const res = await axiosAuth.get("/api/v1/users/available", {
        params: { page: 1, limit: 10 },
      });
      return (res.data.data?.users ?? []) as Volunteer[];
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
