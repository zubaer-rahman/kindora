"use client";

import { useEffect, useState } from "react";
import { FileSpreadsheet, MessageCircleCode, Hand, LayoutGrid } from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { DynamicTabs, TabItem } from "@/components/common/DynamicTabs";
import BackButton from "@/components/buttons/BackButton";
import { OpportunityDetail } from "@/components/features/volunteer/home-page/OpportunityDetail";
import { ApplicantsTab } from "./tabs/ApplicantsTab";
import { CreateGroupModal } from "./modals/CreateGroupModal";
import { RecruitsTab } from "./tabs/RecruitsTab";
import { GroupMessageModal } from "./modals/GroupMessageModal";
import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/modals/ConfirmationDialog";
import { toast } from "react-hot-toast";
import QueryStateWrapper from "@/components/common/QueryStateWrapper";
import OpportunityHeaderBanner from "./OpportunityHeaderBanner";
import { RosterTabContainer } from "./tabs/roster/RosterTabContainer";
import type { Volunteer } from "./tabs/roster/rosterUtils";
import { opportunityService } from "@/services/opportunity.service";
import { organizationService } from "@/services/organization.service";
import { applicationService } from "@/services/application.service";

interface OpportunityDetailContainerProps {
  userRole: "volunteer" | "organisation" | "mentor";
}

export default function OpportunityDetailContainer({
  userRole,
}: OpportunityDetailContainerProps) {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const opportunityId = params.id as string;
  const searchParams = useSearchParams();

  // State management
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isGroupMessageModalOpen, setIsGroupMessageModalOpen] = useState(false);
  const [createdGroupId, setCreatedGroupId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rosterShiftCount, setRosterShiftCount] = useState<number | undefined>(undefined);

  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  // Queries
  const {
    data: opportunity,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["opportunity", opportunityId],
    queryFn: () => opportunityService.getById(axiosAuth, opportunityId),
    enabled: !!opportunityId,
  });

  const { data: opportunityMentors } = useQuery({
    queryKey: ["opportunityMentors", opportunityId],
    queryFn: () => organizationService.getOpportunityMentors(axiosAuth, opportunityId),
    enabled: !!opportunityId,
  });

  const { data: applicants } = useQuery({
    queryKey: ["applicants", opportunityId],
    queryFn: () => applicationService.getApplicants(axiosAuth, opportunityId),
    enabled: !!opportunityId,
  });

  const { data: recruitedApplicants } = useQuery({
    queryKey: ["recruitments", opportunityId],
    queryFn: () => applicationService.getRecruitments(axiosAuth, opportunityId),
    enabled: !!opportunityId,
  });

  const { data: myApplicationStatus } = useQuery({
    queryKey: ["applicationStatus", opportunityId],
    queryFn: () => applicationService.getStatus(axiosAuth, opportunityId),
    enabled: !!opportunityId && !!session?.user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => opportunityService.delete(axiosAuth, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizationOpportunities"] });
      setIsDeleteDialogOpen(false);
      toast.success("Opportunity deleted successfully");
      router.push("/organisation/opportunities");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete opportunity");
      setIsDeleteDialogOpen(false);
    },
  });

  // Check if current user is a mentor for this opportunity
  const isCurrentUserMentor = opportunityMentors?.some(
    (mentor) => mentor.volunteer._id === session?.user?.id
  );

  const isCurrentUserRecruited = recruitedApplicants?.some(
    (app) => app.id === session?.user?.id
  );

  const isCurrentUserApproved = myApplicationStatus?.status === "approved";

  const isCurrentUserFromOpportunityOrg =
    userRole === "organisation" &&
    session?.user?.organization_profile?._id ===
    opportunity?.organization_profile?._id;

  const hasManagementAccess =
    (userRole === "volunteer" && isCurrentUserMentor) ||
    isCurrentUserFromOpportunityOrg;

  const canAccessRoster =
    hasManagementAccess || isCurrentUserRecruited || isCurrentUserApproved;

  // ── Tab content ──────────────────────────────────────────────────────────

  const postContent = (
    <OpportunityDetail opportunity={opportunity} userRole={userRole} />
  );

  const applicantsContent = (
    <ApplicantsTab
      key={`applicants-${opportunityId}`}
      opportunityId={opportunityId}
      userRole={userRole}
      isCurrentUserMentor={isCurrentUserMentor || false}
      currentUserId={session?.user?.id}
      opportunity={opportunity}
    />
  );

  const recruitsContent = (
    <RecruitsTab
      key={`recruits-${opportunityId}`}
      opportunityId={opportunityId}
      userRole={userRole}
      isCurrentUserMentor={isCurrentUserMentor || false}
      currentUserId={session?.user?.id}
      onCreateGroup={() => setIsCreateGroupModalOpen(true)}
      opportunity={opportunity}
    />
  );

  // Convert recruitedApplicants to the Volunteer shape used by RosterTab
  const rosterRecruits: Volunteer[] = (recruitedApplicants ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    initials: a.name
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
    skills: a.skills ?? [],
    status: "confirmed" as const,
  }));

  const rosterContent = (
    <RosterTabContainer
      key={`roster-${opportunityId}`}
      opportunityId={opportunityId}
      role={hasManagementAccess ? "organiser" : "volunteer"}
      recruits={rosterRecruits}
      canAccessRoster={canAccessRoster}
      onUpdateShiftCount={setRosterShiftCount}
    />
  );

  const tabs: TabItem[] = [
    {
      value: "post",
      label: "Post Details",
      icon: <FileSpreadsheet />,
      content: postContent,
    },
    ...(hasManagementAccess
      ? [
        {
          value: "review",
          label: "Applicants",
          icon: <MessageCircleCode />,
          count: applicants?.length || 0,
          content: applicantsContent,
        },
        {
          value: "recruits",
          label: "Recruits",
          icon: <Hand />,
          count: recruitedApplicants?.length || 0,
          content: recruitsContent,
        },
      ]
      : []),
    ...(canAccessRoster
      ? [
        {
          value: "roster",
          label: "Roster",
          icon: <LayoutGrid />,
          count: rosterShiftCount,
          content: rosterContent,
        },
      ]
      : []),
  ];

  const shouldShowTabs = canAccessRoster;

  const requestedTab = searchParams.get("tab");
  const defaultTab =
    requestedTab === "roster" && canAccessRoster ? "roster" : "post";

  return (
    <ProtectedLayout>
      <QueryStateWrapper
        isLoading={isLoading}
        error={error}
        data={opportunity}
        notFound={!opportunityId}
        loadingMessage="Wait a sec..."
        notFoundTitle="Opportunity not found"
        notFoundDescription="The opportunity you're looking for doesn't exist."
      >
        {opportunity && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <BackButton />
            <OpportunityHeaderBanner
              opportunity={opportunity}
              userRole={userRole}
              isCurrentUserFromOpportunityOrg={isCurrentUserFromOpportunityOrg}
              onDelete={() => setIsDeleteDialogOpen(true)}
            />

            <div className="">
              <div className="pb-8">
                {shouldShowTabs ? (
                  <DynamicTabs
                    key={`tabs-${opportunityId}-${defaultTab}`}
                    defaultValue={defaultTab}
                    tabs={tabs}
                    className="mb-6 sm:mb-8"
                  />
                ) : (
                  <OpportunityDetail
                    opportunity={opportunity}
                    userRole={userRole}
                  />
                )}
              </div>
            </div>

            <CreateGroupModal
              isOpen={isCreateGroupModalOpen}
              onClose={() => setIsCreateGroupModalOpen(false)}
              onGroupCreated={(groupId) => {
                setCreatedGroupId(groupId);
                setIsGroupMessageModalOpen(true);
              }}
              recruitedApplicants={
                recruitedApplicants?.map((applicant) => ({
                  id: applicant.id,
                  name: applicant.name,
                })) || []
              }
              opportunityTitle={opportunity?.title || ""}
              opportunityId={opportunityId}
            />

            <GroupMessageModal
              isOpen={isGroupMessageModalOpen}
              onClose={() => setIsGroupMessageModalOpen(false)}
              groupId={createdGroupId}
              onMessageSent={() => {
                setIsGroupMessageModalOpen(false);
                router.push(
                  userRole === "organisation"
                    ? "/organisation/messages"
                    : `/${userRole}/messages`
                );
              }}
            />

            <ConfirmationDialog
              isOpen={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
              title="Delete Opportunity"
              description="This will delete the opportunity. The data will be preserved but not visible to anyone."
              confirmText="Delete"
              onConfirm={() => deleteMutation.mutate(opportunityId)}
              variant="destructive"
              isLoading={deleteMutation.isPending}
            />
          </div>
        )}
      </QueryStateWrapper>
    </ProtectedLayout>
  );
}
