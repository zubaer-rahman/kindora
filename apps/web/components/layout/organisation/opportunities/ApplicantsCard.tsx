"use client";

import { Button } from "@/components/ui/button";
import { MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { HiClipboardDocumentList } from "react-icons/hi2";
import { useRecruitmentStatus } from "@/hooks/useRecruitmentStatus";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ApplicantActionsDropdown } from "./ApplicantActionsDropdown";
import UserAvatar from "@/components/ui/UserAvatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import toast from "react-hot-toast";

export interface Applicant {
  id: string;
  name: string;
  profileImg: string | null;
  location: string;
  bio: string;
  skills: string[];
  completedProjects: number;
  availability: string;
  applicationId: string;
}

export function ApplicantsCard({
  setIsModalOpen,
  hideRecruitButton = false,
  applicant,
  onMessageClick,
  opportunityId,
  showMarkAsMentor = false,
  isCurrentUser = false,
  opportunity,
  isCurrentUserMentor = false,
}: {
  setIsModalOpen?: (isOpen: boolean) => void;
  hideRecruitButton?: boolean;
  applicant: Applicant;
  onMessageClick: () => void;
  opportunityId?: string;
  showMarkAsMentor?: boolean;
  isCurrentUser?: boolean;
  opportunity?: {
    created_by?: { _id: string };
    organization_profile?: { _id: string };
  };
  isCurrentUserMentor?: boolean;
}) {
  const queryClient = useQueryClient();
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();
  const [isMentorForOpportunity, setIsMentorForOpportunity] = useState(false);
  const { isRecruited, refetchRecruitmentStatus } = useRecruitmentStatus(
    applicant.applicationId,
    !hideRecruitButton
  );

  const { data: opportunityMentors } = useQuery({
    queryKey: ['opportunityMentors', opportunityId],
    queryFn: async () => {
      const res = await axiosAuth.get(`/api/v1/organization-mentors/opportunity/${opportunityId}`);
      return res.data.data;
    },
    enabled: !!opportunityId && showMarkAsMentor,
  });

  // Get dynamic completed opportunities count
  const { data: dynamicCompletedCount } = useQuery({
    queryKey: ['dynamicCompletedCount', applicant.id, opportunityId],
    queryFn: async () => {
      const res = await axiosAuth.get('/api/v1/applications/completed/count', {
        params: { volunteerId: applicant.id, currentOpportunityId: opportunityId || '' }
      });
      return res.data.data;
    },
    enabled: !!opportunityId && !!applicant.id,
  });

  useEffect(() => {
    if (opportunityMentors) {
      const isMentor = opportunityMentors.some(
        (mentor: { volunteer: { _id: string } }) =>
          mentor.volunteer._id === applicant.id
      );
      setIsMentorForOpportunity(isMentor);
    }
  }, [opportunityMentors, applicant.id]);

  const invalidateApplications = () => {
    queryClient.invalidateQueries({ queryKey: ['recruitedApplicants'] });
    queryClient.invalidateQueries({ queryKey: ['opportunityApplicants'] });
    queryClient.invalidateQueries({ queryKey: ['applicationStatus'] });
    queryClient.invalidateQueries({ queryKey: ['applications'] });
    queryClient.invalidateQueries({ queryKey: ['organizationOpportunities'] });
    queryClient.invalidateQueries({ queryKey: ['dynamicCompletedCount'] });
  };

  const recruitMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosAuth.post('/api/v1/recruitment', {
        applicationId: applicant.applicationId,
      });
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Applicant has been recruited successfully.');
      setIsModalOpen?.(false);
      refetchRecruitmentStatus();
      invalidateApplications();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error.message);
    },
  });

  const toggleMentorMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosAuth.patch('/api/v1/organization-mentors/toggle', {
        volunteerId: applicant.id,
        opportunityId: opportunityId,
      });
      return res.data.data;
    },
    onSuccess: (data) => {
      if (data.action === 'added') {
        toast.success('Volunteer has been marked as mentor for this opportunity successfully.');
        setIsMentorForOpportunity(true);
      } else {
        toast.success('Mentor has been removed from this opportunity successfully.');
        setIsMentorForOpportunity(false);
      }
      queryClient.invalidateQueries({ queryKey: ['opportunityMentors', opportunityId] });
      queryClient.invalidateQueries({ queryKey: ['mentorOpportunities'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error.message);
    },
  });

  const handleRecruit = () => {
    recruitMutation.mutate();
  };

  const handleToggleMentor = () => {
    if (!opportunityId) {
      toast.error("Opportunity ID is required");
      return;
    }

    toggleMentorMutation.mutate();
  };

  const canMarkAsMentor =
    session?.user?.role === "admin" ||
    session?.user?.role === "mentor" ||
    session?.user?.role === "organisation" ||
    (session?.user?.role === "volunteer" && isCurrentUserMentor) ||
    opportunity?.created_by?._id === session?.user?.id ||
    opportunity?.organization_profile?._id ===
      session?.user?.organization_profile?._id;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-lg p-4 sm:p-6 border space-y-4 cursor-pointer hover:shadow-md transition-shadow relative">
        {/* Dropdown Menu */}
        {showMarkAsMentor && canMarkAsMentor && (
          <ApplicantActionsDropdown
            isMentorForOpportunity={isMentorForOpportunity}
            isMarkingAsMentor={toggleMentorMutation.isPending}
            onToggleMentor={handleToggleMentor}
          />
        )}

        <Link
          href={`/view-profile/volunteer/details/${applicant.id}`}
          className="block"
        >
          <div className="flex gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <UserAvatar
                  user={{
                    name: applicant.name,
                    image: applicant.profileImg,
                  }}
                  size={34}
                  className="w-[34px] h-[34px] shrink-0"
                />
                <h3 className="font-medium truncate">{applicant.name}</h3>

                {isMentorForOpportunity && (
                  <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded flex-shrink-0">
                    Mentor
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{applicant.location}</span>
                </div>
                {((dynamicCompletedCount?.count !== undefined && dynamicCompletedCount.count > 0) || 
                  (dynamicCompletedCount?.count === undefined && applicant.completedProjects > 0)) && (
                  <div className="flex items-center gap-1">
                    <HiClipboardDocumentList className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                      <span>
                    {dynamicCompletedCount?.count !== undefined 
                      ? `${dynamicCompletedCount.count} ${dynamicCompletedCount.count === 1 ? 'opportunity' : 'opportunities'} completed`
                      : `${applicant.completedProjects} ${applicant.completedProjects === 1 ? 'opportunity' : 'opportunities'} completed`
                    }
                  </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {applicant.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs bg-gray-100 px-2 py-1 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                {applicant.bio}
              </p>
            </div>
          </div>
        </Link>

        <div className={cn("flex flex-col sm:flex-row space-x-3 mt-4 ")}>
          {!hideRecruitButton && (
            <Button
              variant="ghost"
              size="lg"
              className={`rounded-[6px] px-4 sm:px-6 font-normal w-full sm:w-auto ${
                isRecruited
                  ? "bg-green-50 text-green-600 hover:bg-green-100"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={handleRecruit}
              disabled={recruitMutation.isPending || isRecruited}
            >
              {recruitMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Recruiting...
                </div>
              ) : isRecruited ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Recruited
                </div>
              ) : (
                "Recruit"
              )}
            </Button>
          )}

          <Button
            size="lg"
            className="bg-[#246BFD] hover:bg-[#246BFD]/90 text-white px-4 sm:px-6 rounded-[6px] w-full sm:w-auto disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={onMessageClick}
            disabled={isCurrentUser}
          >
            Send message
          </Button>
        </div>
      </div>
    </div>
  );
}
