import { trpc } from "@/utils/trpc";

export function useRecruitmentStatus(applicationId: string, enabled: boolean = true) {
  const { data: recruitmentStatus, refetch: refetchRecruitmentStatus } =
    trpc.recruits.getRecruitmentStatus.useQuery(
      { applicationId },
      { enabled }
    );

  return {
    isRecruited: recruitmentStatus?.isRecruited ?? false,
    refetchRecruitmentStatus,
  };
} 