"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";

import { Skeleton } from "@/components/ui/skeleton";
import FilterSidebar, { VolunteerFilters } from "@/components/features/search/FilterSidebar";
import { OrganizationCard, SearchBar } from "@/components/common";
import { useSearch } from "@/components/providers/SearchProvider";

import { profileService } from "@/services/profile.service";
import { PaginationWrapper } from "@/components/common/PaginationWrapper";
import { Button } from "@/components/ui/button";
import { Filter, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EmptyState from "@/components/common/EmptyState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SearchOrganization() {
  const [filters, setFilters] = useState<VolunteerFilters>({
    categories: [],
    locations: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sortBy, setSortBy] = useState<"name" | "updated">("updated");
  const axiosAuth = useAxiosAuth();

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams, setSearchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery, sortBy]);

  const { data: orgsData, isLoading } = useQuery({
    queryKey: ["allOrganizations", currentPage, filters, searchQuery, sortBy],
    queryFn: () => profileService.getAllOrganizations(axiosAuth, {
      page: currentPage,
      limit: 10,
      search: searchQuery || undefined,
      category: filters.categories.length > 0 ? filters.categories[0] : undefined,
      sortBy: sortBy,
    }),
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const organizations = orgsData?.organizations || [];
  const totalItems = orgsData?.total || 0;
  const totalPages = orgsData?.totalPages || 0;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background">
      <div className="container max-w-[1280px] mx-auto px-4 pt-6 md:pt-8 flex flex-col h-full">

        {/* Top Search Bar Row — stays fixed */}
        <div className="flex items-center gap-4 mb-6 flex-shrink-0">
          <div className="flex-1 max-w-2xl">
            <SearchBar
              onSearch={(q) => handleSearch(q)}
              initialQuery={searchQuery}
              borderRadius="100px"
              showClearButton={true}
              onClear={handleClearSearch}
              placeholder="Search for organisations"
              preventRedirect={true}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setIsFilterModalOpen(true)}
            className="lg:hidden flex items-center gap-2 h-[48px]"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Body row — fills remaining height, no overflow on this level */}
        <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">

          {/* Left Sidebar — fixed, scrolls internally if needed */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0 overflow-y-auto">
            <FilterSidebar variant="volunteer" onFilterChange={setFilters} currentFilters={filters} />
          </aside>

          {/* Main Content — fixed controls + scrollable cards */}
          <main className="flex-1 min-w-0 flex flex-col min-h-0">

            {/* Controls Row — stays fixed */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-6">
                {!isLoading && organizations.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Showing {organizations.length} of {totalItems} organisations
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <Select
                    value={sortBy}
                    onValueChange={(value: "name" | "updated") => setSortBy(value)}
                  >
                    <SelectTrigger className="w-[140px] h-9 border-input rounded-lg text-sm font-medium text-foreground focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      <SelectItem value="updated">Recently Updated</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Organization Cards — ONLY this area scrolls */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 pb-8">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="w-full">
                    <div className="border border-border rounded-xl p-6 bg-card">
                      <div className="flex flex-col md:flex-row gap-6">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="flex-1 space-y-4">
                          <div className="flex justify-between">
                            <div className="space-y-2">
                              <Skeleton className="h-6 w-48" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-10 w-24 rounded-full" />
                          </div>
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : organizations.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No organisations found"
                  description="Try adjusting your search criteria to find more organisations that match your requirements."
                  variant="default"
                  showAction={false}
                />
              ) : (
                <div className="flex flex-col gap-4">
                  {organizations.map((org: any) => (
                    <OrganizationCard
                      key={org._id}
                      organisation={org}
                      onCardClick={(organisation) => router.push(`/organisations/${organisation._id}`)}
                    />
                  ))}
                </div>
              )}

              {/* Pagination inside scroll area */}
              {!isLoading && organizations.length > 0 && totalPages > 1 && (
                <div className="pt-4 flex justify-center">
                  <PaginationWrapper
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    maxVisiblePages={5}
                  />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent
          className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto [&>button]:hidden bg-background"
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Filter Organisations</DialogTitle>
          </DialogHeader>
          <div className="p-2">
            <FilterSidebar
              variant="volunteer"
              onFilterChange={setFilters}
              currentFilters={filters}
            />
          </div>
          <div className="px-4 pb-2 flex justify-center">
            <Button onClick={() => setIsFilterModalOpen(false)} className="px-6">
              Show Results
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
