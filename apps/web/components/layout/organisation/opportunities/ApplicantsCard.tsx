"use client";

import { Button } from "@/components/ui/button";
import { MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { HiClipboardDocumentList } from "react-icons/hi2";
import { trpc } from "@/utils/trpc";
import toast from "react-hot-toast";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@/server";
import { useRecruitmentStatus } from "@/hooks/useRecruitmentStatus";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ApplicantActionsDropdown } from "./ApplicantActionsDropdown";
import UserAvatar from "@/components/ui/UserAvatar";

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
  const utils = trpc.useUtils();
  const { data: session } = useSession();
  const [isMentorForOpportunity, setIsMentorForOpportunity] = useState(false);
  const { isRecruited, refetchRecruitmentStatus } = useRecruitmentStatus(
    applicant.applicationId,
    !hideRecruitButton
  );

  const { data: opportunityMentors } =
    trpc.mentors.getOpportunityMentors.useQuery(
      { opportunityId: opportunityId || "" },
      {
        enabled: !!opportunityId && showMarkAsMentor,
      }
    );

  // Get dynamic completed opportunities count
  const { data: dynamicCompletedCount } = trpc.applications.getDynamicCompletedOpportunities.useQuery(
    {
      volunteerId: applicant.id,
      currentOpportunityId: opportunityId || "",
    },
    {
      enabled: !!opportunityId && !!applicant.id,
    }
  );

  useEffect(() => {
    if (opportunityMentors) {
      const isMentor = opportunityMentors.some(
        (mentor: { volunteer: { _id: string } }) =>
          mentor.volunteer._id === applicant.id
      );
      setIsMentorForOpportunity(isMentor);
    }
  }, [opportunityMentors, applicant.id]);

  const recruitMutation = trpc.recruits.recruitApplicant.useMutation({
    onSuccess: () => {
      toast.success("Applicant has been recruited successfully.");
      setIsModalOpen?.(false);
      refetchRecruitmentStatus();
      utils.recruits.getRecruitedApplicants.invalidate();
      utils.applications.getOpportunityApplicants.invalidate();
      utils.applications.getApplicationStatus.invalidate();
      utils.applications.getCurrentUserActiveApplicationsCount.invalidate();
      utils.applications.getCurrentUserRecentApplicationsCount.invalidate();
      utils.applications.getCurrentUserActiveApplications.invalidate();
      utils.applications.getCurrentUserRecentApplications.invalidate();
      utils.applications.getCurrentUserApprovedApplications.invalidate();
      utils.applications.getDynamicCompletedOpportunities.invalidate();
      utils.opportunities.getOrganizationOpportunities.invalidate();
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      toast.error(error.message);
    },
  });

  const toggleMentorMutation = trpc.mentors.toggleMentor.useMutation({
    onSuccess: (data) => {
      if (data.action === "added") {
        toast.success(
          "Volunteer has been marked as mentor for this opportunity successfully."
        );
        setIsMentorForOpportunity(true);
      } else {
        toast.success(
          "Mentor has been removed from this opportunity successfully."
        );
        setIsMentorForOpportunity(false);
      }
      utils.mentors.getOpportunityMentors.invalidate();
      // Invalidate dashboard mentor opportunities queries
      utils.opportunities.getMentorOpportunities.invalidate();
      utils.opportunities.getMentorOpportunitiesCount.invalidate();
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      toast.error(error.message);
    },
  });

  const handleRecruit = () => {
    recruitMutation.mutate({
      applicationId: applicant.applicationId,
    });
  };

  const handleToggleMentor = () => {
    if (!opportunityId) {
      toast.error("Opportunity ID is required");
      return;
    }

    toggleMentorMutation.mutate({
      volunteerId: applicant.id,
      opportunityId: opportunityId,
    });
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
