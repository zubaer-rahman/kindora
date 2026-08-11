import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";

export function useRecruitmentStatus(applicationId: string, enabled: boolean = true) {
  const axiosAuth = useAxiosAuth();

  const { data: recruitmentStatus, refetch: refetchRecruitmentStatus } =
    useQuery({
      queryKey: ["recruitmentStatus", applicationId],
      queryFn: async () => {
        const res = await axiosAuth.get(`/api/v1/recruitments/status/${applicationId}`);
        return res.data.data;
      },
      enabled: enabled && !!applicationId,
    });

  return {
    isRecruited: recruitmentStatus?.isRecruited ?? false,
    refetchRecruitmentStatus,
  };
} 
