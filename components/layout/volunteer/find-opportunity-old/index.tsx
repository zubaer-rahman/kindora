"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { useSearch } from "@/contexts/SearchContext";
import { PaginationWrapper } from "@/components/PaginationWrapper";
import FilterSidebar from "./FilterSidebar";
import FilterDialog from "./FilterDialog";
import OpportunitiesHeader from "./OpportunitiesHeader";
import OpportunityList from "./OpportunityList";
import { Opportunity } from "@/types/opportunities";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";
import EmptyState from "@/components/layout/shared/EmptyState";

export default function FindOpportunityOld() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"recently_added" | "start_date">("recently_added");
  const { filters, clearAllFilters } = useSearch();

  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters.searchQuery,
    filters.categories,
    filters.commitmentType,
    filters.location,
    filters.availability,
    sortBy,
  ]);

  const { data: opportunitiesData, isLoading } =
    trpc.opportunities.getAllOpportunities.useQuery({
      page: currentPage,
      limit: 6,
      search: filters.searchQuery || undefined,
      categories:
        filters.categories.length > 0 ? filters.categories : undefined,
      commitmentType: filters.commitmentType,
      location: filters.location || undefined,
      availability: filters.availability || undefined,
      sortBy: sortBy,
    });

  // Debug logging
  console.log("Current filters:", filters);
  console.log("Query result:", opportunitiesData);

  const opportunities = (opportunitiesData?.opportunities ||
    []) as unknown as Opportunity[];
  // Server already filters out archived opportunities
  const visibleOpportunities = opportunities;
  const totalItems = opportunitiesData?.total || 0;
  const totalPages = opportunitiesData?.totalPages || 0;

  const startIndex = (currentPage - 1) * 6;
  const endIndex = Math.min(startIndex + 6, totalItems);

  // Count active filters for mobile display
  const activeFiltersCount =
    filters.categories.length +
    (filters.commitmentType !== "all" ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.searchQuery ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Opportunity
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover meaningful volunteer opportunities that match your skills, interests, and schedule. Make a difference in your community today.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden md:block sticky top-4">
            <FilterSidebar />
          </div>

          <div className="flex-1 min-w-0">
            {/* Mobile Filter Button */}
            <div className="md:hidden mb-4 flex items-center justify-between">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsFilterModalOpen(true)}
                  className="flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => clearAllFilters()}
                  className="px-4 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Reset
                </Button>
              </div>
            </div>

            <OpportunitiesHeader
              totalItems={totalItems}
              startIndex={startIndex}
              endIndex={endIndex}
              sortBy={sortBy}
              onSortChange={(value) => setSortBy(value as "recently_added" | "start_date")}
            />

            <div className="w-full">
              <OpportunityList
                opportunities={visibleOpportunities}
                isLoading={isLoading}
              />

              {totalItems > 0 ? (
                <div className="mt-8 flex justify-center">
                  <PaginationWrapper
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    maxVisiblePages={5}
                  />
                </div>
              ) : !isLoading ? (
                <EmptyState
                  icon={Search}
                  title="No opportunities found"
                  description="Try adjusting your filters or search terms to find more opportunities."
                  actionLabel="Clear All Filters"
                  onAction={() => clearAllFilters()}
                  variant="default"
                />
              ) : null}
            </div>
          </div>

          <FilterDialog
            isOpen={isFilterModalOpen}
            onOpenChange={setIsFilterModalOpen}
            activeFiltersCount={activeFiltersCount}
            onClearAllFilters={clearAllFilters}
          />
        </div>
      </div>
    </div>
  );
}
