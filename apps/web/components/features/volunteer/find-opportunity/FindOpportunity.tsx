"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { Opportunity } from "@/types/opportunities";
import {
  VolunteerOpportunityCard,
  SearchBar,
  CustomTabs,
} from "@/components/common";
import { useSearch } from "@/components/providers/SearchProvider";
import VolunteerDashboardSidebar from "./VolunteerDashboardSidebar";
import { PaginationWrapper } from "@/components/common/PaginationWrapper";
import { Skeleton } from "@/components/ui/skeleton";

export default function FindOpportunity() {
  const router = useRouter();
  const { data: session } = useSession();
  const { filters } = useSearch();
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
  const isGenericTab =
    activeTab === "best-matches" || activeTab === "most-recent";
  const { data: opportunitiesData, isLoading: isLoadingOpportunities } =
    useQuery({
      queryKey: ["allOpportunities", isGenericTab ? currentPage : 1, filters, activeTab],
      queryFn: async () => {
        const res = await axiosAuth.get(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/opportunities`,
          {
            params: {
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
            },
          },
        );
        return res.data.data;
      },
      enabled: isGenericTab,
    });

  // Fetch total count for "Most recent" tab
  const { data: allCountData } = useQuery({
    queryKey: ["allOpportunitiesCount"],
    queryFn: async () => {
      const res = await axiosAuth.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/opportunities/count`,
      );
      return res.data.data;
    },
  });

  // Fetch user's favorite/saved opportunities (for "saved" tab)
  const { data: savedOpportunitiesData, isLoading: isLoadingSaved } = useQuery({
    queryKey: [
      "favoriteOpportunities",
      activeTab === "saved" ? currentPage : 1,
    ],
    queryFn: async () => {
      const res = await axiosAuth.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/volunteer-profiles/favorites/paginated`,
        {
          params: {
            page: activeTab === "saved" ? currentPage : 1,
            limit: activeTab === "saved" ? 6 : 1,
          },
        },
      );
      return res.data.data;
    },
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
      count: allCountData?.total || 0,
    },
    { label: "Best matches", value: "best-matches" },
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

  return (
    <div className="min-h-[calc(100vh-72px)] lg:h-[calc(100vh-72px)] flex flex-col">
      <div className="container max-w-[1280px] mx-auto px-4 pt-6 flex flex-col flex-1 min-h-0 lg:overflow-hidden">
        {/* Search Bar - half width on desktop */}
        <div className="w-full lg:w-1/2 shrink-0">
          <SearchBar
            initialQuery={filters.searchQuery}
            initialLocation={filters.location}
            placeholder="Search for opportunities"
          />
        </div>

        {/* Content Row */}
        <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0 mt-6">
          {/* Main Content Area */}
          <main className="flex-1 min-w-0 flex flex-col min-h-0">
            {/* Fixed Header Section */}
            <div className="shrink-0">
              {/* Header Section */}
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
                  Opportunities you might like
                </h1>
              </div>

              {/* Tabs Section */}
              <div className="pt-2 border-b border-border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CustomTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                  />
                </div>
              </div>
            </div>

            {/* Scrollable Cards Section */}
            <div className="flex-1 overflow-y-auto min-h-0 mt-6 no-scrollbar">
              {isLoading ? (
                <div>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="px-4 py-6 border-b border-border"
                    >
                      {/* Posted time + heart button */}
                      <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-9 w-9 rounded-full" />
                      </div>

                      {/* Title */}
                      <Skeleton className="h-6 w-3/4 mb-4" />

                      {/* Metadata line */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-4">
                        <Skeleton className="h-3.5 w-20" />
                        <Skeleton className="h-3.5 w-2 rounded-full" />
                        <Skeleton className="h-3.5 w-14" />
                        <Skeleton className="h-3.5 w-2 rounded-full" />
                        <Skeleton className="h-3.5 w-24" />
                      </div>

                      {/* Description */}
                      <div className="space-y-2 mb-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>

                      {/* Category badges */}
                      <div className="flex items-center gap-2 mb-4">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </div>

                      {/* Footer: location + proposals */}
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3.5 w-20" />
                      </div>
                    </div>
                  ))}

                  {/* Pagination Skeleton */}
                  <div className="p-6 border-t border-border flex justify-center gap-2">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                  </div>
                </div>
              ) : visibleOpportunities.filter((opp) => opp && !opp.is_archived)
                  .length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground">
                    No opportunities found.
                  </p>
                </div>
              ) : (
                <>
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="p-6 border-t border-border flex justify-center">
                      <PaginationWrapper
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        maxVisiblePages={5}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </main>

          {/* Right Sidebar */}
          <VolunteerDashboardSidebar className="w-full lg:w-[320px] flex-shrink-0 lg:sticky lg:top-6" />
        </div>
      </div>
    </div>
  );
}
