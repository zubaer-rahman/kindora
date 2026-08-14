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
import { RosterTab } from "./tabs/roster/RosterTab";
import type { Volunteer, Shift } from "./tabs/roster/rosterUtils";

interface OpportunityDetailContainerProps {
  userRole: "volunteer" | "organisation";
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

  // Roster state (local for instant UI feedback; synced from DB)
  const [rosterShifts, setRosterShifts] = useState<Shift[]>([]);

  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  // Queries
  const {
    data: opportunity,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["opportunity", opportunityId],
    queryFn: async () => {
      const res = await axiosAuth.get(`/api/v1/opportunities/${opportunityId}`);
      return res.data.data;
    },
    enabled: !!opportunityId,
  });

  const { data: opportunityMentors } = useQuery({
    queryKey: ["opportunityMentors", opportunityId],
    queryFn: async () => {
      const res = await axiosAuth.get(`/api/v1/organization-mentors/opportunity/${opportunityId}`);
      return res.data.data;
    },
    enabled: !!opportunityId,
  });

  const { data: applicants } = useQuery({
    queryKey: ["applicants", opportunityId],
    queryFn: async () => {
      const res = await axiosAuth.get(`/api/v1/applications/applicants/${opportunityId}`);
      return res.data.data;
    },
    enabled: !!opportunityId,
  });

  const { data: recruitedApplicants } = useQuery({
    queryKey: ["recruitments", opportunityId],
    queryFn: async () => {
      const res = await axiosAuth.get("/api/v1/recruitments", {
        params: { opportunityId },
      });
      return res.data.data;
    },
    enabled: !!opportunityId,
  });

  const { data: myApplicationStatus } = useQuery({
    queryKey: ["applicationStatus", opportunityId],
    queryFn: async () => {
      const res = await axiosAuth.get(`/api/v1/applications/status/${opportunityId}`);
      return res.data.data;
    },
    enabled: !!opportunityId && !!session?.user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosAuth.delete(`/api/v1/opportunities/${id}`);
      return res.data.data;
    },
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

  const invalidateRoster = () => {
    queryClient.invalidateQueries({ queryKey: ["rosterShifts", opportunityId] });
  };

  const createShiftMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosAuth.post("/api/v1/rosters/shifts", payload);
      return res.data.data;
    },
    onSuccess: invalidateRoster,
  });

  const updateShiftMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosAuth.patch(`/api/v1/rosters/shifts/${payload.shiftId}`, payload);
      return res.data.data;
    },
    onSuccess: invalidateRoster,
  });

  const deleteShiftMutation = useMutation({
    mutationFn: async (payload: { shiftId: string }) => {
      const res = await axiosAuth.delete(`/api/v1/rosters/shifts/${payload.shiftId}`);
      return res.data.data;
    },
    onSuccess: invalidateRoster,
  });

  const assignVolunteerMutation = useMutation({
    mutationFn: async (payload: { shiftId: string; volunteerId: string }) => {
      const res = await axiosAuth.post(`/api/v1/rosters/shifts/${payload.shiftId}/assign`, { volunteerId: payload.volunteerId });
      return res.data.data;
    },
    onSuccess: invalidateRoster,
  });

  const unassignVolunteerMutation = useMutation({
    mutationFn: async (payload: { shiftId: string; volunteerId: string }) => {
      const res = await axiosAuth.delete(`/api/v1/rosters/shifts/${payload.shiftId}/assign`, { data: { volunteerId: payload.volunteerId } });
      return res.data.data;
    },
    onSuccess: invalidateRoster,
  });

  const updateVolunteerStatusMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosAuth.patch(`/api/v1/rosters/shifts/${payload.shiftId}/status`, payload);
      return res.data.data;
    },
    onSuccess: invalidateRoster,
  });

  const signupForShiftMutation = useMutation({
    mutationFn: async (payload: { shiftId: string }) => {
      const res = await axiosAuth.post(`/api/v1/rosters/shifts/${payload.shiftId}/signup`);
      return res.data.data;
    },
    onSuccess: invalidateRoster,
  });

  const withdrawFromShiftMutation = useMutation({
    mutationFn: async (payload: { shiftId: string }) => {
      const res = await axiosAuth.post(`/api/v1/rosters/shifts/${payload.shiftId}/withdraw`);
      return res.data.data;
    },
    onSuccess: invalidateRoster,
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

  const { data: rosterShiftsFromDb } = useQuery({
    queryKey: ["rosterShifts", opportunityId],
    queryFn: async () => {
      const res = await axiosAuth.get(`/api/v1/rosters/opportunity/${opportunityId}/shifts`);
      return res.data.data;
    },
    enabled: !!opportunityId && !!canAccessRoster,
  });

  useEffect(() => {
    if (rosterShiftsFromDb) {
      setRosterShifts(rosterShiftsFromDb as unknown as Shift[]);
    }
  }, [rosterShiftsFromDb]);

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
    <RosterTab
      key={`roster-${opportunityId}`}
      postId={opportunityId}
      role={hasManagementAccess ? "organiser" : "volunteer"}
      recruits={rosterRecruits}
      shifts={rosterShifts}
      currentUserId={session?.user?.id}
      onShiftCreate={(data) => {
        const newShift: Shift = {
          ...data,
          id: `shift-${Date.now()}`,
          assignedVolunteers: [],
        };
        setRosterShifts((prev) => [...prev, newShift]);
        createShiftMutation.mutate({
          opportunityId,
          title: data.title,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          role: data.role,
          maxVolunteers: data.maxVolunteers,
        });
      }}
      onShiftUpdate={(shiftId, data) => {
        setRosterShifts((prev) =>
          prev.map((s) => (s.id === shiftId ? { ...s, ...data } : s))
        );
        updateShiftMutation.mutate({
          shiftId,
          title: (data as any).title,
          date: (data as any).date,
          startTime: (data as any).startTime,
          endTime: (data as any).endTime,
          role: (data as any).role,
          maxVolunteers: (data as any).maxVolunteers,
        });
      }}
      onUpdateVolunteerStatus={(shiftId, volunteerId, status) => {
        setRosterShifts((prev) =>
          prev.map((s) => {
            if (s.id !== shiftId) return s;
            return {
              ...s,
              assignedVolunteers: s.assignedVolunteers.map((v) =>
                v.id === volunteerId ? { ...v, status } : v
              ),
            };
          })
        );
        updateVolunteerStatusMutation.mutate({
          shiftId,
          volunteerId,
          status: status as any,
        });
      }}
      onAssign={(shiftId, volunteerId) => {
        setRosterShifts((prev) =>
          prev.map((s) => {
            if (s.id !== shiftId) return s;
            const volunteer = rosterRecruits.find((r) => r.id === volunteerId);
            if (
              !volunteer ||
              s.assignedVolunteers.some((v) => v.id === volunteerId)
            )
              return s;
            return {
              ...s,
              assignedVolunteers: [
                ...s.assignedVolunteers,
                { ...volunteer, status: "pending" as const },
              ],
            };
          })
        );
        assignVolunteerMutation.mutate({ shiftId, volunteerId });
      }}
      onUnassign={(shiftId, volunteerId) => {
        setRosterShifts((prev) =>
          prev.map((s) =>
            s.id === shiftId
              ? {
                ...s,
                assignedVolunteers: s.assignedVolunteers.filter(
                  (v) => v.id !== volunteerId
                ),
              }
              : s
          )
        );
        unassignVolunteerMutation.mutate({ shiftId, volunteerId });
      }}
      onSignup={(shiftId) => {
        if (!session?.user?.id) return;
        const userName = session.user.name ?? "Me";
        const me: Volunteer = {
          id: session.user.id,
          name: userName,
          initials: userName
            .split(" ")
            .map((w: string) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
          skills: [],
          status: "pending",
        };
        setRosterShifts((prev) =>
          prev.map((s) => {
            if (s.id !== shiftId) return s;
            if (s.assignedVolunteers.some((v) => v.id === me.id)) return s;
            if (s.assignedVolunteers.length >= s.maxVolunteers) return s;
            return { ...s, assignedVolunteers: [...s.assignedVolunteers, me] };
          })
        );
        signupForShiftMutation.mutate({ shiftId });
      }}
      onWithdraw={(shiftId) => {
        if (!session?.user?.id) return;
        const userId = session.user.id;
        setRosterShifts((prev) =>
          prev.map((s) =>
            s.id === shiftId
              ? {
                ...s,
                assignedVolunteers: s.assignedVolunteers.filter(
                  (v) => v.id !== userId
                ),
              }
              : s
          )
        );
        withdrawFromShiftMutation.mutate({ shiftId });
      }}
      onDeleteShift={(shiftId) => {
        setRosterShifts((prev) => prev.filter((s) => s.id !== shiftId));
        deleteShiftMutation.mutate({ shiftId });
      }}
      onExport={() => toast.success("Roster export coming soon")}
      onSendReminders={() => toast.success("Reminders sent!")}
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
          count: rosterShifts.length || undefined,
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
