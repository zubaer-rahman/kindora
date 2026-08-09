"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { useSession } from "next-auth/react";
import { Opportunity } from "@/types/opportunities";
import { VolunteerOpportunityCard, SearchBar, CustomTabs } from "@/components/common";
import { useSearch } from "@/contexts/SearchContext";
import VolunteerDashboardSidebar from "./VolunteerDashboardSidebar";
import { PaginationWrapper } from "@/components/PaginationWrapper";

export default function FindOpportunity() {
  const router = useRouter();
  const { data: session } = useSession();
  const { filters } = useSearch();
  const [currentPage, setCurrentPage] = useState(1);
  const params = useParams();
  const slug = params.slug as string[];
  const activeTab = slug?.[0] || "most-recent";

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
    trpc.opportunities.getAllOpportunities.useQuery(
      {
        page: isGenericTab ? currentPage : 1,
        limit: isGenericTab ? 6 : 1,
        search: filters.searchQuery || undefined,
        categories: filters.categories.length > 0 ? filters.categories : undefined,
        commitmentType: filters.commitmentType,
        location: filters.location || undefined,
        sortBy: activeTab === "best-matches" ? "best_matches" : "recently_added",
      },
      {
        enabled: isGenericTab
      }
    );

  // Fetch total count for "Most recent" tab
  const { data: allCountData } = trpc.opportunities.getAllOpportunitiesCount.useQuery();

  // Fetch user's favorite/saved opportunities (for "saved" tab)
  const { data: savedOpportunitiesData, isLoading: isLoadingSaved } =
    trpc.volunteers.getFavoriteOpportunitiesWithPagination.useQuery(
      {
        page: activeTab === "saved" ? currentPage : 1,
        limit: activeTab === "saved" ? 6 : 1,
      },
      {
        enabled: !!session?.user
      }
    );

  // Determine which data to use based on active tab
  const isLoading =
    isGenericTab ? isLoadingOpportunities :
    activeTab === "saved" ? isLoadingSaved :
    false;


  let visibleOpportunities: any[] = [];
  let totalOpportunities = 0;
  let totalPages = 1;

  if (isGenericTab) {
    visibleOpportunities = (opportunitiesData?.opportunities || []) as unknown as Opportunity[];
    totalOpportunities = opportunitiesData?.total || 0;
    totalPages = opportunitiesData?.totalPages || 1;
  } else if (activeTab === "saved") {
    visibleOpportunities = (savedOpportunitiesData?.opportunities || []) as unknown as Opportunity[];
    totalOpportunities = savedOpportunitiesData?.total || 0;
    totalPages = savedOpportunitiesData?.totalPages || 1;
  }

  const tabs = [
    { label: "Most recent", value: "most-recent", count: allCountData?.total || 0 },
    { label: "Best matches", value: "best-matches" },
    { label: "Saved", value: "saved", count: savedOpportunitiesData?.total || 0 },
  ];

  const handleTabChange = (tab: string) => {
    router.push(`/find-opportunity/${tab}`);
  };


  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-[1280px] mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Search Bar */}
            <div className="mb-6 w-full flex justify-end">
              <div className="w-full">
                <SearchBar
                  initialQuery={filters.searchQuery}
                  initialLocation={filters.location}
                  placeholder="Search for opportunities"
                />
              </div>
            </div>

            {/* Header Section */}
            <div className="mb-6">
              <h1 className="text-xl md:text-2xl font-semibold text-[#101828] mb-2">
                Opportunities you might like
              </h1>
            </div>

            {/* Main Content Container */}
            <div className="overflow-hidden">
              {/* Tabs Section */}
              <div className="  pt-2 border-b border-[#E9EAEB]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CustomTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}

                  />
                </div>
              </div>

              {/* Opportunities List */}
              <div className="divide-y divide-[#E9EAEB]">
                {isLoading ? (
                  <div className="p-6 space-y-6 ">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-[200px] bg-gray-50 rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : visibleOpportunities.filter(opp => opp && !opp.is_archived).length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-[#667085]">No opportunities found.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col">
                      {visibleOpportunities
                        .filter(opp => opp && !opp.is_archived)
                        .map((opportunity) => (
                          <VolunteerOpportunityCard
                            key={opportunity._id}
                            opportunity={opportunity}
                          />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="p-6 border-t border-[#E9EAEB] flex justify-center">
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
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-[320px] flex-shrink-0">
            <VolunteerDashboardSidebar />
          </aside>
        </div>
      </div>
    </div>
  );
}
