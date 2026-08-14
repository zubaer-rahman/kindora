"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Opportunity } from "@/types/opportunities";
import { toast } from "react-hot-toast";
import { getGreeting } from "@/utils/helpers/getGreeting";
import { CreateOpportunityButton } from "@/components/buttons/CreateOpportunityButton";
import MobileTabsSlider from "@/components/common/MobileTabsSlider";
import { ORGANISATION_DASHBOARD_TABS, OrganisationDashboardTabKey } from "@/utils/constants/organization-dashboard-tabs";
import TabContent from "./TabContent";
import VolunteerCarousel from "./VolunteerCarousel";
import MessageDialog from "../MessageDialog";
import ConfirmationDialog from "@/components/modals/ConfirmationDialog";
import { useSessionRefresh } from "./hooks/useSessionRefresh";
import { useOrganizationOpportunities } from "./hooks/useOrganizationOpportunities";
import { useOpportunityMutations } from "./hooks/useOpportunityMutations";

import { Volunteer, ActiveContract } from "@/types/organization";

const OrganisationDashboard = () => {
  const router = useRouter();
  const { data: session } = useSession();

  useSessionRefresh();

  const {
    opportunities,
    isLoadingOpportunities,
    isOpportunitiesError,
    recruitedApplicants,
    availableVolunteers,
    isLoadingVolunteers,
  } = useOrganizationOpportunities();

  const { archiveMutation, unarchiveMutation, deleteMutation } = useOpportunityMutations();

  const [tab, setTab] = useState<OrganisationDashboardTabKey>("open");
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [opportunityToDelete, setOpportunityToDelete] = useState<Opportunity | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"archive" | "unarchive" | "delete" | null>(null);

  // ── Derived data ──────────────────────────────────────────────────────────

  const openOpportunities = opportunities?.filter((opp) => !opp.is_archived) ?? [];
  const archivedOpportunities = opportunities?.filter((opp) => opp.is_archived) ?? [];

  // O(n) contract grouping via Map
  const contractMap = new Map<string, ActiveContract>();
  for (const c of recruitedApplicants ?? []) {
    const existing = contractMap.get(c.id);
    if (existing) {
      if (c.opportunity?.id && !existing.opportunities.some((o) => o.id === c.opportunity!.id)) {
        existing.opportunities.push({ id: c.opportunity.id, title: c.opportunity.title });
      }
    } else {
      contractMap.set(c.id, {
        id: c.id,
        profileImg: c.profileImg,
        jobTitle: c.opportunity?.title || "Active Contract",
        freelancerName: c.name,
        startedAt: new Date().toISOString().split("T")[0],
        opportunityTitle: c.opportunity?.title,
        opportunityId: c.opportunity?.id,
        uniqueKey: `${c.id}-${c.opportunity?.id ?? ""}`,
        opportunities:
          c.opportunity?.id && c.opportunity?.title
            ? [{ id: c.opportunity.id, title: c.opportunity.title }]
            : [],
      });
    }
  }
  const activeContracts = Array.from(contractMap.values());

  const previousVolunteers = availableVolunteers.map((v) => ({
    _id: v._id || (v.id as string),
    name: v.name || "Anonymous",
    image: v.image,
    role: v.role || "Volunteer",
    area: v.area,
    state: v.state,
    volunteer_profile: v.volunteer_profile,
  }));

  // ── Action handlers ───────────────────────────────────────────────────────

  const openConfirmDialog = (opportunity: Opportunity, action: "archive" | "unarchive" | "delete") => {
    setOpportunityToDelete(opportunity);
    setPendingAction(action);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirm = () => {
    if (!opportunityToDelete) return;
    const id = opportunityToDelete._id;

    const closeDialog = () => {
      setIsDeleteDialogOpen(false);
      setOpportunityToDelete(null);
      setPendingAction(null);
    };

    if (pendingAction === "delete") {
      deleteMutation.mutate(id, { onSettled: closeDialog });
    } else if (pendingAction === "archive") {
      archiveMutation.mutate(id, { onSettled: closeDialog });
    } else if (pendingAction === "unarchive") {
      unarchiveMutation.mutate(id, { onSettled: closeDialog });
    }
  };

  const currentTabConfig = ORGANISATION_DASHBOARD_TABS.find((t) => t.key === tab);

  const mobileTabs = ORGANISATION_DASHBOARD_TABS.map((t) => ({
    label: t.label,
    value: t.key,
    count:
      t.key === "open"
        ? openOpportunities.length
        : t.key === "active"
          ? activeContracts.length
          : archivedOpportunities.length,
  }));

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-12 bg-background min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-bold tracking-tight">
          {getGreeting()}, {session?.user?.name || "Org Name"}
        </h2>
        <CreateOpportunityButton />
      </div>

      <h2 className="text-xl md:text-2xl font-semibold mb-4">Overview</h2>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <MobileTabsSlider
          tabs={mobileTabs}
          activeTab={tab}
          onTabChange={(value) => setTab(value as OrganisationDashboardTabKey)}
          className="md:hidden"
        />

        <div className="hidden md:flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {ORGANISATION_DASHBOARD_TABS.map((t) => (
            <button
              key={t.key}
              className={`px-4 md:px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 whitespace-nowrap shadow-sm hover:shadow-md
                ${tab === t.key
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-background text-muted-foreground border-border hover:bg-muted"
                }
              `}
              onClick={() => setTab(t.key)}
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
          className="flex items-center gap-1 text-primary font-semibold hover:underline text-sm transition-colors whitespace-nowrap hover:text-primary/80"
          onClick={() => router.push("/organisation/opportunities")}
        >
          View all opportunities{" "}
          <ChevronRight className="inline h-4 w-4 ml-1 text-primary transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {isOpportunitiesError && (
        <div className="text-center py-12 text-red-500 text-sm">
          Failed to load opportunities. Please refresh the page.
        </div>
      )}

      <div className="transition-all duration-300 ease-in-out">
        <div className="min-h-[400px]">
          <TabContent
            tab={tab}
            activeContracts={activeContracts}
            openOpportunities={openOpportunities}
            archivedOpportunities={archivedOpportunities}
            currentTabConfig={currentTabConfig}
            onDeleteOpportunity={(opp) => openConfirmDialog(opp, "delete")}
            onArchiveOpportunity={(opp) => openConfirmDialog(opp, "archive")}
            onUnarchiveOpportunity={(opp) => openConfirmDialog(opp, "unarchive")}
            isLoading={isLoadingOpportunities}
          />
        </div>
      </div>

      <div className="py-8 mt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <h3 className="text-lg md:text-xl font-semibold">
            Work together again on something new
          </h3>
          <button
            className="flex items-center gap-1 text-primary font-semibold hover:underline text-sm transition-colors whitespace-nowrap hover:text-primary/80"
            onClick={() => router.push("/find-volunteer")}
          >
            View All volunteers{" "}
            <ChevronRight className="inline h-4 w-4 ml-1 text-primary transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
        <VolunteerCarousel
          volunteers={previousVolunteers}
          isLoading={isLoadingVolunteers}
          onConnect={(v) => {
            setSelectedVolunteer(v);
            setIsMessageDialogOpen(true);
          }}
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
          if (!open) setPendingAction(null);
          setIsDeleteDialogOpen(open);
        }}
        title="Are you sure?"
        description={
          pendingAction === "delete"
            ? "This action cannot be undone. This will permanently delete the opportunity."
            : pendingAction === "unarchive"
              ? "This will restore the opportunity from the archive and make it visible again."
              : "This will move the opportunity to the archive. You can delete it permanently from there."
        }
        confirmText={
          pendingAction === "delete" ? "Delete" : pendingAction === "unarchive" ? "Unarchive" : "Archive"
        }
        onConfirm={handleConfirm}
        variant="destructive"
        isLoading={archiveMutation.isPending || unarchiveMutation.isPending || deleteMutation.isPending}
      />
    </div>
  );
};

export default OrganisationDashboard;
