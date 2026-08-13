"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { Opportunity } from "@/types/opportunities";
import { FilterSidebar, SearchBar, VolunteerOpportunityCard } from "@/components/common";
import { useSearch } from "@/contexts/SearchContext";
import { PaginationWrapper } from "@/components/PaginationWrapper";
import { Heart, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Link from "next/link";


export default function SearchOpportunity() {
  const router = useRouter();
  const { data: session } = useSession();
  const { setSearchQuery, setLocation, setSaved, filters } = useSearch();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"best_matches" | "most_recent">("most_recent");


  const searchParams = useSearchParams();

  // Sync with URL search params
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams, setSearchQuery]);

  // Reset page when filters change

  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters.searchQuery,
    filters.categories,
    filters.commitmentType,
    filters.location,
    filters.saved,
    sortBy,
  ]);


  // Fetch opportunities with filters
  const axiosAuth = useAxiosAuth();
  const { data: opportunitiesData, isLoading: isLoadingOpportunities } = useQuery({
    queryKey: ['opportunities', 'search', currentPage, filters, sortBy],
    queryFn: async () => {
      const res = await axiosAuth.get('/api/v1/opportunities', {
        params: {
          page: currentPage,
          limit: 6,
          search: filters.searchQuery || undefined,
          categories: filters.categories.length > 0 ? filters.categories : undefined,
          commitmentType: filters.commitmentType,
          location: filters.location || undefined,
          sortBy: sortBy === "most_recent" ? "recently_added" : "best_matches",
          saved: filters.saved || undefined,
        }
      });
      return res.data.data;
    },
  });


  const isLoading = isLoadingOpportunities;


  const displayItems = (opportunitiesData?.opportunities || [])
    .map(opp => ({ opportunity: opp as unknown as Opportunity }));
  const totalOpportunities = opportunitiesData?.total || 0;
  const totalPages = opportunitiesData?.totalPages || 1;


  const visibleItems = displayItems.filter((item) => !item.opportunity.is_archived);

  const handleSearch = (query: string, location: string) => {
    setSearchQuery(query);
    setLocation(location);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };



  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Fixed Search Bar */}
      <div className="flex-shrink-0 px-4 py-6 md:py-8">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-2xl">
            <SearchBar
              onSearch={handleSearch}
              initialQuery={filters.searchQuery}
              borderRadius="100px"
              showClearButton={true}
              onClear={handleClearSearch}
              placeholder="Search for opportunities"
            />
          </div>
        </div>
      </div>

      {/* Fixed Sidebar + Scrollable Cards */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - fixed on desktop, hidden on mobile */}
        <aside className="hidden lg:block w-[280px] flex-shrink-0 overflow-hidden p-4 pt-0">
          <FilterSidebar variant="search" />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Fixed Controls Row */}
          <div className="flex-shrink-0 px-4 pb-4">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E9EAEB]">
              <div className="flex items-center gap-6">
                {/* Left side empty or for future use */}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSaved(!filters.saved)}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors",
                    filters.saved
                      ? "text-[#1570EF]"
                      : "text-[#667085] hover:text-[#1570EF]"
                  )}
                >
                  <Heart
                    className={cn("h-4 w-4", filters.saved && "fill-[#1570EF]")}
                  />
                  Saved jobs
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#667085]">Sort by:</span>
                  <Select
                    value={sortBy}
                    onValueChange={(value: "best_matches" | "most_recent") => setSortBy(value)}
                  >
                    <SelectTrigger className="w-[140px] h-9 border-[#D0D5DD] rounded-lg text-sm font-medium text-[#344054] focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      <SelectItem value="best_matches">Best Matches</SelectItem>
                      <SelectItem value="most_recent">Most Recent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
            </div>
          </div>

          {/* Scrollable Opportunity Cards */}
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            {isLoading ? (
              <div className="p-6 space-y-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[300px] bg-gray-50 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-[#667085]">No opportunities found.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col">
                  {visibleItems.map((item) => (
                    <VolunteerOpportunityCard
                      key={item.opportunity._id}
                      opportunity={item.opportunity}
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
        </main>
      </div>
    </div>
  );
}
