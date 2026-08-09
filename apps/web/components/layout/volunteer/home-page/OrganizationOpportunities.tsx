"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { Loader2, Heart, Briefcase } from "lucide-react";
import { VolunteerOpportunityCard as OpportunityCard, CustomTabs } from "@/components/common";
import { Opportunity } from "@/types/opportunities";
import EmptyState from "@/components/layout/shared/EmptyState";
import { PaginationWrapper } from "@/components/PaginationWrapper";

interface OrganizationOpportunitiesProps {
  organizationId: string;
}

export default function OrganizationOpportunities({
  organizationId,
}: OrganizationOpportunitiesProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { data: session } = useSession();
  const { profileCheck } = useAuthCheck();
  const volunteerId = session?.user?.id;

  const ITEMS_PER_PAGE = 6;

  const {
    data: opportunitiesData,
    isLoading,
    error,
  } = trpc.opportunities.getAllOpportunities.useQuery({
    page: 1,
    limit: 50,
  });

  const { data: applications } =
    trpc.applications.getVolunteerApplications.useQuery(volunteerId!, {
      enabled: !!volunteerId,
    });

  const { data: favoriteOpportunities } =
    trpc.volunteers.getFavoriteOpportunities.useQuery();

  const isOrgAdminOrMentor =
    session?.user?.role === "admin" || session?.user?.role === "mentor" ||
    session?.user?.role === "organization" || session?.user?.role === "organisation";
  const userOrgId = session?.user?.organization_profile?._id;
  const isUserFromThisOrg = userOrgId === organizationId;
  const hasOrgProfile = !!profileCheck?.hasOrganizationProfile;
  const canCreateForOrg = isUserFromThisOrg && (session?.user?.role === "mentor" || hasOrgProfile);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">
          Error loading opportunities
        </h1>
        <p className="text-gray-600 mt-2">{error.message}</p>
      </div>
    );
  }

  const organizationOpportunities =
    opportunitiesData?.opportunities?.filter(
      (opp) =>
        (opp as unknown as Opportunity).organization_profile?._id ===
        organizationId
    ) || [];

  const opportunitiesWithSpots = organizationOpportunities.map(
    (opportunity) => {
      const opp = opportunity as unknown as Opportunity;
      const appliedCount =
        (
          applications as
          | Array<{ opportunity: string; status: string }>
          | undefined
        )?.filter(
          (app) =>
            app.opportunity === opp._id.toString() &&
            (app.status === "pending" || app.status === "approved")
        ).length || 0;

      const spotsAvailable = Math.max(
        0,
        opp.number_of_volunteers - appliedCount
      );

      return {
        ...opp,
        recruitCount: opp.number_of_volunteers - spotsAvailable,
      };
    }
  );

  const filteredOpportunities =
    activeTab === "favorites"
      ? opportunitiesWithSpots.filter((opp) =>
        favoriteOpportunities?.some(
          (fav) => fav.opportunity === opp._id.toString()
        )
      )
      : opportunitiesWithSpots;

  // Pagination logic
  const totalItems = filteredOpportunities.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedOpportunities = filteredOpportunities.slice(startIndex, endIndex);

  // Reset to page 1 when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const tabs = [
    {
      label: "Posted Opportunities",
      value: "all",
      count: opportunitiesWithSpots.length,
    },
    {
      label: "Your Favourites",
      value: "favorites",
      count: favoriteOpportunities?.filter((fav) =>
        opportunitiesWithSpots.some(
          (opp) => opp._id.toString() === fav.opportunity
        )
      ).length || 0,
    },
  ];

  return (
    <section className="w-full relative">
      <div className="border-b border-[#E9EAEB] mb-6">
        <CustomTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      {filteredOpportunities.length === 0 ? (
        <EmptyState
          icon={activeTab === "favorites" ? Heart : Briefcase}
          title={
            activeTab === "favorites"
              ? "No Favourite Opportunities"
              : "No Opportunities Available"
          }
          description={
            activeTab === "favorites"
              ? "You haven't favourited any opportunities from this organisation yet. Browse all opportunities and add some to your favourites!"
              : isOrgAdminOrMentor && isUserFromThisOrg
                ? (canCreateForOrg
                    ? "Your organisation hasn't posted any opportunities yet. Create your first opportunity to get started!"
                    : "Complete your organisation profile first to post opportunities.")
                : "This organisation hasn't posted any opportunities yet."
          }
          actionLabel={
            activeTab === "all" && canCreateForOrg
              ? "Create Opportunity"
              : activeTab === "all" && isOrgAdminOrMentor && isUserFromThisOrg && !hasOrgProfile
                ? "Complete your profile"
                : undefined
          }
          onAction={
            activeTab === "all" && (canCreateForOrg || (isOrgAdminOrMentor && isUserFromThisOrg && !hasOrgProfile))
              ? () => router.push(canCreateForOrg ? "/organisation/opportunities/create" : "/organisation/profile")
              : undefined
          }
          variant="card"
          showAction={activeTab === "all" && (canCreateForOrg || (isOrgAdminOrMentor && isUserFromThisOrg && !hasOrgProfile))}
          className="min-h-[400px]"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity._id}
                opportunity={opportunity}
              />
            ))}
          </div>

          {/* Pagination - only show if more than 6 items */}
          {totalItems > ITEMS_PER_PAGE && (
            <div className="mt-8 flex justify-center">
              <PaginationWrapper
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </section>
  );
}
