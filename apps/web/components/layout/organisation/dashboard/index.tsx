"use client";
import { useState } from "react";
// import { Card } from "@/components/ui/card";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import VolunteerCarousel from "./VolunteerCarousel";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import MessageDialog from "../MessageDialog";
import { Opportunity } from "@/types/opportunities";
import ConfirmationDialog from "@/components/modals/ConfirmationDialog";
import { toast } from "react-hot-toast";
import { getGreeting } from "@/utils/helpers/getGreeting";
import { CreateOpportunityButton } from "@/components/buttons/CreateOpportunityButton";
import MobileTabsSlider from "@/components/layout/shared/MobileTabsSlider";
import { ORGANISATION_DASHBOARD_TABS, OrganisationDashboardTabKey } from "@/utils/constants/organisation-dashboard-tabs";
import TabContent from "./TabContent";

interface Volunteer {
  _id: string;
  name: string;
  image?: string;
  role: string;
  area?: string;
  state?: string;
  volunteer_profile?: {
    student_type?: "yes" | "no";
    course?: string;
    availability_date?: {
      start_date?: string;
      end_date?: string;
    };
    interested_on?: string[];
    bio?: string;
  };
}

interface RecruitedApplicant {
  readonly name: string;
  readonly email: string;
  readonly bio: string;
  readonly id: string;
  readonly location: string;
  readonly applicationId: string;
  readonly profileImg: string;
  readonly skills: string[];
  readonly completedProjects: number;
  readonly availability: string;
  readonly opportunity?: {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly category: string[];
    readonly location: string;
    readonly commitment_type: string;
  } | null;
}

interface ActiveContract {
  id: string;
  profileImg?: string;
  jobTitle: string;
  freelancerName: string;
  startedAt: string;
  opportunityTitle?: string;
  opportunityId?: string;
  uniqueKey: string; // Combined key for React rendering
  opportunities: Array<{
    id: string;
    title: string;
  }>;
}

const OrganisationDashboard = () => {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof updateSession === 'function') {
      if (localStorage.getItem('shouldRefreshSession') === 'true') {
        updateSession()
          .catch((err) => {
            console.warn('Session update failed on dashboard mount:', err);
          })
          .finally(() => {
            localStorage.removeItem('shouldRefreshSession');
          });
      }
    }
  }, [updateSession]);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(
    null
  );
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [opportunityToDelete, setOpportunityToDelete] =
    useState<Opportunity | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'archive' | 'unarchive' | 'delete' | null>(null);

  // Fetch opportunities
  const { data: opportunities, isLoading: isLoadingOpportunities } =
    trpc.opportunities.getOrganizationOpportunities.useQuery(undefined, {
      select: (data) => data as Opportunity[],
    });
  // Fetch recruited applicants for 'active' tab
  const { data: recruitedApplicants } =
    trpc.recruits.getRecruitedApplicants.useQuery(
      { opportunityId: "" }, // Empty string to get all recruited applicants
      {
        enabled: !!opportunities?.length,
        select: (data) => data as RecruitedApplicant[],
      }
    );
  // Fetch available volunteers
  const { data: availableVolunteersData, isLoading: isLoadingVolunteers } =
    trpc.users.getAvailableUsers.useQuery(
      {
        page: 1,
        limit: 10, // Get fewer volunteers for dashboard
      },
      {
        select: (data) => data.users as Volunteer[],
      }
    );

  const availableVolunteers = availableVolunteersData || [];

  // Tab state
  const [tab, setTab] = useState<OrganisationDashboardTabKey>("open");

  // Map recruited applicants to active contracts grouped by volunteer
  const activeContracts: ActiveContract[] = (recruitedApplicants || []).reduce((acc, c) => {
    const existingContract = acc.find(contract => contract.id === c.id);

    if (existingContract) {
      // If volunteer already exists, add the opportunity to their list
      if (c.opportunity?.title && c.opportunity?.id) {
        const opportunityExists = existingContract.opportunities.some(opp => opp.id === c.opportunity?.id);
        if (!opportunityExists && c.opportunity?.id) {
          existingContract.opportunities.push({
            id: c.opportunity.id,
            title: c.opportunity.title
          });
        }
      }
    } else {
      // Create new contract for this volunteer
      acc.push({
        id: c.id,
        profileImg: c.profileImg,
        jobTitle: c.opportunity?.title || "Active Contract",
        freelancerName: c.name,
        startedAt: new Date().toISOString().split("T")[0],
        opportunityTitle: c.opportunity?.title,
        opportunityId: c.opportunity?.id,
        uniqueKey: `${c.id}-${c.opportunity?.id || ''}`,
        opportunities: c.opportunity?.id && c.opportunity?.title ? [{
          id: c.opportunity.id,
          title: c.opportunity.title
        }] : [],
      });
    }

    return acc;
  }, [] as ActiveContract[]);

  // Filtered data for tabs
  const openOpportunities =
    opportunities?.filter((opp) => !opp.is_archived) || [];
  const archivedOpportunities =
    opportunities?.filter((opp) => opp.is_archived) || [];

  // Transform available volunteers data for the carousel
  const previousVolunteers =
    availableVolunteers?.map((volunteer) => ({
      _id: volunteer._id,
      name: volunteer.name || "Anonymous",
      image: volunteer.image,
      role: volunteer.role || "Volunteer",
      area: volunteer.area,
      state: volunteer.state,
      volunteer_profile: volunteer.volunteer_profile,
    })) || [];

  const utils = trpc.useUtils();
  const archiveMutation = trpc.opportunities.archiveOpportunity.useMutation({
    onSuccess: () => {
      utils.opportunities.getOrganizationOpportunities.invalidate();
      setIsDeleteDialogOpen(false);
      setOpportunityToDelete(null);
      toast.success("Opportunity archived successfully");
    },
    onError: (error) => {
      console.error("Failed to archive opportunity:", error);
      toast.error(error.message || "Failed to archive opportunity");
      setIsDeleteDialogOpen(false);
      setOpportunityToDelete(null);
    },
  });

  const deleteMutation = trpc.opportunities.deleteOpportunity.useMutation({
    onSuccess: () => {
      utils.opportunities.getOrganizationOpportunities.invalidate();
      setIsDeleteDialogOpen(false);
      setOpportunityToDelete(null);
      toast.success("Opportunity deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete opportunity:", error);
      toast.error(error.message || "Failed to delete opportunity");
      setIsDeleteDialogOpen(false);
      setOpportunityToDelete(null);
    },
  });

  const unarchiveMutation = trpc.opportunities.unarchiveOpportunity.useMutation({
    onSuccess: () => {
      utils.opportunities.getOrganizationOpportunities.invalidate();
      setIsDeleteDialogOpen(false);
      setOpportunityToDelete(null);
      toast.success("Opportunity unarchived successfully");
    },
    onError: (error) => {
      console.error("Failed to unarchive opportunity:", error);
      toast.error(error.message || "Failed to unarchive opportunity");
      setIsDeleteDialogOpen(false);
      setOpportunityToDelete(null);
    },
  });

  const handleArchive = async (opportunity: Opportunity) => {
    try {
      await archiveMutation.mutateAsync(opportunity._id);
    } catch (error) {
      console.error("Failed to archive opportunity:", error);
    }
  };

  const handleDelete = async (opportunity: Opportunity) => {
    try {
      await deleteMutation.mutateAsync(opportunity._id);
    } catch (error) {
      console.error("Failed to delete opportunity:", error);
    }
  };

  const handleUnarchive = async (opportunity: Opportunity) => {
    try {
      await unarchiveMutation.mutateAsync(opportunity._id);
    } catch (error) {
      console.error("Failed to unarchive opportunity:", error);
    }
  };

  const handleSendMessage = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setIsMessageDialogOpen(true);
  };

  // Get current tab config
  const currentTabConfig = ORGANISATION_DASHBOARD_TABS.find(t => t.key === tab);

  // Handle opportunity actions
  const handleDeleteOpportunity = (opportunity: Opportunity) => {
    setOpportunityToDelete(opportunity);
    setPendingAction('delete');
    setIsDeleteDialogOpen(true);
  };

  const handleArchiveOpportunity = (opportunity: Opportunity) => {
    setOpportunityToDelete(opportunity);
    setPendingAction('archive');
    setIsDeleteDialogOpen(true);
  };

  const handleUnarchiveOpportunity = (opportunity: Opportunity) => {
    setOpportunityToDelete(opportunity);
    setPendingAction('unarchive');
    setIsDeleteDialogOpen(true);
  };

  // Prepare mobile tabs data
  const mobileTabs = ORGANISATION_DASHBOARD_TABS.map((t) => ({
    label: t.label,
    value: t.key,
    count: t.key === "open"
      ? openOpportunities.length
      : t.key === "active"
        ? activeContracts.length
        : archivedOpportunities.length,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-bold tracking-tight">
          {getGreeting()}, {session?.user?.name || "Org Name"}
        </h2>
        <CreateOpportunityButton />

      </div>
      {/* Overview Section */}
      <h2 className="text-xl md:text-2xl font-semibold mb-4">Overview</h2>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        {/* Mobile Tabs Slider */}
        <MobileTabsSlider
          tabs={mobileTabs}
          activeTab={tab}
          onTabChange={(value) => setTab(value as OrganisationDashboardTabKey)}
          className="md:hidden"
        />

        {/* Desktop Tabs */}
        <div className="hidden md:flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {ORGANISATION_DASHBOARD_TABS.map((t) => (
            <button
              key={t.key}
              className={`px-4 md:px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 whitespace-nowrap shadow-sm hover:shadow-md
                ${tab === t.key
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                }
              `}
              onClick={() => setTab(t.key)}
              style={{ minWidth: "auto" }}
            >
              {t.label} (
              {t.key === "open"
                ? openOpportunities.length
                : t.key === "active"
                  ? activeContracts.length
                  : archivedOpportunities.length}
              )
            </button>
          ))}
        </div>
        <button
          className="flex items-center gap-1 text-blue-700 font-semibold hover:underline text-sm transition-colors whitespace-nowrap hover:text-blue-800"
          onClick={() => router.push("/organisation/opportunities")}
        >
          View all opportunities{" "}
          <ChevronRight className="inline h-4 w-4 ml-1 text-blue-700 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
      {/* Tab Content */}
      <div className="transition-all duration-300 ease-in-out">
        <div className="min-h-[400px]">
          <TabContent
            tab={tab}
            activeContracts={activeContracts}
            openOpportunities={openOpportunities}
            archivedOpportunities={archivedOpportunities}
            currentTabConfig={currentTabConfig}
            onDeleteOpportunity={handleDeleteOpportunity}
            onArchiveOpportunity={handleArchiveOpportunity}
            onUnarchiveOpportunity={handleUnarchiveOpportunity}
            isLoading={isLoadingOpportunities}
          />
        </div>
      </div>
      {/* Work together again section */}
      <div className="py-8 mt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <h3 className="text-lg md:text-xl font-semibold">
            Work together again on something new
          </h3>
          <button
            className="flex items-center gap-1 text-blue-700 font-semibold hover:underline text-sm transition-colors whitespace-nowrap hover:text-blue-800"
            onClick={() => router.push("/find-volunteer")}
          >
            View All volunteers{" "}
            <ChevronRight className="inline h-4 w-4 ml-1 text-blue-700 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
        <VolunteerCarousel
          volunteers={previousVolunteers}
          isLoading={isLoadingVolunteers}
          onConnect={handleSendMessage}
        />
      </div>

      <MessageDialog
        isOpen={isMessageDialogOpen}
        onOpenChange={setIsMessageDialogOpen}
        volunteer={selectedVolunteer}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAction(null);
          }
          setIsDeleteDialogOpen(open);
        }}
        title="Are you sure?"
        description={
          pendingAction === 'delete'
            ? "This action cannot be undone. This will permanently delete the opportunity."
            : pendingAction === 'unarchive'
              ? "This will restore the opportunity from the archive and make it visible again."
              : "This will move the opportunity to the archive. You can delete it permanently from there."
        }
        confirmText={
          pendingAction === 'delete'
            ? "Delete"
            : pendingAction === 'unarchive'
              ? "Unarchive"
              : "Archive"
        }
        onConfirm={() => {
          if (opportunityToDelete) {
            if (pendingAction === 'delete') {
              handleDelete(opportunityToDelete);
            } else if (pendingAction === 'archive') {
              handleArchive(opportunityToDelete);
            } else if (pendingAction === 'unarchive') {
              handleUnarchive(opportunityToDelete);
            }
          }
        }}
        variant="destructive"
        isLoading={archiveMutation.isPending || unarchiveMutation.isPending || deleteMutation.isPending}
      />
    </div>
  );
};

export default OrganisationDashboard;
