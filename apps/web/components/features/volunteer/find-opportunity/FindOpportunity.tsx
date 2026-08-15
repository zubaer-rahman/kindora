"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { Opportunity } from "@/types/opportunities";
import {
} from "@/components/common";
import VolunteerOpportunityCard from "@/components/features/opportunities/VolunteerOpportunityCard";
import { useSearch } from "@/components/providers/SearchProvider";
import UnifiedFindPage from "@/components/features/shared/UnifiedFindPage";
import VolunteerDashboardSidebar from "./VolunteerDashboardSidebar";
import { PaginationWrapper } from "@/components/common/PaginationWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { opportunityService } from "@/services/opportunity.service";
import { favoriteService } from "@/services/favorite.service";

export default function FindOpportunity() {
  const router = useRouter();
  const { data: session } = useSession();
  const { filters, setSearchQuery } = useSearch();
  const [currentPage, setCurrentPage] = useState(1);
  const axiosAuth = useAxiosAuth();
  const params = useParams();
  const slugStr = (params.slug?.[0] as string) || "most-recent";
  const [activeTab, setActiveTab] = useState(slugStr);

  useEffect(() => {
    setActiveTab(slugStr);
  }, [slugStr]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters.categories,
    filters.commitmentType,
    filters.location,
    filters.searchQuery,
    activeTab,
  ]);

  // Fetch opportunities with filters (for "best-matches" and "most-recent" tabs)
  const isGenericTab = activeTab === "best-matches" || activeTab === "most-recent";
  const { data: opportunitiesData, isLoading: isLoadingOpportunities } =
    useQuery({
      queryKey: ["allOpportunities", isGenericTab ? currentPage : 1, filters, activeTab],
      queryFn: () =>
        opportunityService.getAll(axiosAuth, {
          page: isGenericTab ? currentPage : 1,
          limit: isGenericTab ? 6 : 1,
          search: filters.searchQuery || undefined,
          categories:
            filters.categories.length > 0
              ? filters.categories.join(",")
              : undefined,
          commitmentType: filters.commitmentType,
          location: filters.location || undefined,
          sortBy:
            activeTab === "best-matches"
              ? "best_matches"
              : "recently_added",
        }),
      enabled: true,
    });

  // Fetch user's favorite/saved opportunities (for "saved" tab)
  const { data: savedOpportunitiesData, isLoading: isLoadingSaved } = useQuery({
    queryKey: [
      "favoriteOpportunities",
      activeTab === "saved" ? currentPage : 1,
    ],
    queryFn: () =>
      favoriteService.getPaginatedFavorites(
        axiosAuth,
        activeTab === "saved" ? currentPage : 1,
        activeTab === "saved" ? 6 : 1
      ),
    enabled: !!session?.user,
  });

  // Determine which data to use based on active tab
  const isLoading = isGenericTab
    ? isLoadingOpportunities
    : activeTab === "saved"
      ? isLoadingSaved
      : false;

  let visibleOpportunities: any[] = [];
  let totalOpportunities = 0;
  let totalPages = 1;

  if (isGenericTab) {
    visibleOpportunities = (opportunitiesData?.opportunities ||
      []) as unknown as Opportunity[];
    totalOpportunities = opportunitiesData?.total || 0;
    totalPages = opportunitiesData?.totalPages || 1;
  } else if (activeTab === "saved") {
    visibleOpportunities = (savedOpportunitiesData?.opportunities ||
      []) as unknown as Opportunity[];
    totalOpportunities = savedOpportunitiesData?.total || 0;
    totalPages = savedOpportunitiesData?.totalPages || 1;
  }

  const tabs = [
    {
      label: "Most recent",
      value: "most-recent",
      count: opportunitiesData?.total || 0,
    },
    { 
      label: "Best matches", 
      value: "best-matches",
      count: opportunitiesData?.total || 0,
    },
    {
      label: "Saved",
      value: "saved",
      count: savedOpportunitiesData?.total || 0,
    },
  ];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.history.pushState(null, "", `/find-opportunity/${tab}`);
  };

  const renderList = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="px-4 py-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
          <Skeleton className="h-6 w-3/4 mb-4" />
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-4">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-2 rounded-full" />
            <Skeleton className="h-3.5 w-14" />
            <Skeleton className="h-3.5 w-2 rounded-full" />
            <Skeleton className="h-3.5 w-24" />
          </div>
          <div className="space-y-2 mb-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        </div>
      ));
    }

    if (visibleOpportunities.filter((opp) => opp && !opp.is_archived).length === 0) {
      return (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No opportunities found.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        {visibleOpportunities
          .filter((opp) => opp && !opp.is_archived)
          .map((opportunity) => (
            <VolunteerOpportunityCard
              key={opportunity._id}
              opportunity={opportunity}
            />
          ))}
      </div>
    );
  };

  return (
    <UnifiedFindPage
      title="Opportunities you might like"
      type="opportunity"
      isLoading={isLoading}
      totalItems={totalOpportunities}
      totalPages={totalPages}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      searchPlaceholder="Search for opportunities"
      onSearch={(q) => setSearchQuery(q)}
      preventRedirect={false}
      redirectBasePath="/search/opportunities"
      sidebarPosition="right"
      sidebarContent={<VolunteerDashboardSidebar />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      renderList={renderList}
    />
  );
}
