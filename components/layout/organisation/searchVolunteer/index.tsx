"use client";

import { trpc } from "@/utils/trpc";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import FilterSidebar, { VolunteerFilters } from "@/components/common/FilterSidebar";
import NewVolunteerCard from "@/components/layout/organisation/NewVolunteerCard";
import MessageDialog from "../MessageDialog";
import { SearchBar } from "@/components/common";
import { useSearch } from "@/contexts/SearchContext";

import { PaginationWrapper } from "@/components/PaginationWrapper";
import { Button } from "@/components/ui/button";
import { Filter, Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EmptyState from "@/components/layout/shared/EmptyState";
import { Users } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    is_available?: boolean;
    skills?: string[];
  };
}

export default function SearchVolunteer() {
  const [filters, setFilters] = useState<VolunteerFilters>({
    categories: [],
    locations: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(
    null
  );
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState<"available" | "not_available" | "best_matches">("available");

  // Sync with URL search params
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams, setSearchQuery]);


  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery, sortBy]);

  const { data: volunteersData, isLoading } =
    trpc.users.getAvailableUsers.useQuery({
      page: currentPage,
      limit: 6,
      search: searchQuery || undefined,
      categories:
        filters.categories.length > 0 ? filters.categories : undefined,
      location: filters.locations.length > 0 ? filters.locations.join(", ") : undefined,
      sortBy: sortBy === "best_matches" ? undefined : sortBy,
    });

  const handleConnect = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setIsMessageDialogOpen(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const volunteers = volunteersData?.users || [];
  const totalItems = volunteersData?.total || 0;
  const totalPages = volunteersData?.totalPages || 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-[1280px] mx-auto px-4 py-6 md:py-8">
        {/* Top Search Bar Row */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 max-w-2xl">
            <SearchBar
              onSearch={(q) => handleSearch(q)}
              initialQuery={searchQuery}
              borderRadius="100px"
              showClearButton={true}
              onClear={handleClearSearch}
              placeholder="Search for volunteers"
              preventRedirect={true}
            />
          </div>
          {/* Mobile Filter Button */}
          <Button
            variant="outline"
            onClick={() => setIsFilterModalOpen(true)}
            className="lg:hidden flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filter */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0">
            <FilterSidebar variant="volunteer" onFilterChange={setFilters} currentFilters={filters} />
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Controls Row */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E9EAEB]">
              <div className="flex items-center gap-6">
                {/* Left side empty or for future use */}
                {!isLoading && volunteers.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Showing {volunteers.length} of {totalItems} volunteers
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#667085]">Sort by:</span>
                  <Select
                    value={sortBy}
                    onValueChange={(value: "available" | "not_available" | "best_matches") => setSortBy(value)}
                  >
                    <SelectTrigger className="w-[140px] h-9 border-[#D0D5DD] rounded-lg text-sm font-medium text-[#344054] focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="not_available">Not Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Volunteers List */}
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="w-full">
                    <div className="border border-gray-100 rounded-xl p-6 bg-white">
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
              ) : volunteers.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No volunteers found"
                  description="Try adjusting your search criteria to find more volunteers that match your requirements."
                  variant="default"
                  showAction={false}
                />
              ) : (
                volunteers.map((volunteer: Record<string, unknown>) => (
                  <NewVolunteerCard
                    key={volunteer._id as string}
                    volunteer={volunteer as unknown as Volunteer}
                    onConnect={handleConnect}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {!isLoading && volunteers.length > 0 && totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <PaginationWrapper
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  maxVisiblePages={5}
                />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent
          className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto [&>button]:hidden"
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Filter Volunteers</DialogTitle>
          </DialogHeader>
          <div className="p-2">
            <FilterSidebar
              variant="volunteer"
              onFilterChange={setFilters}
              currentFilters={filters}
            />
          </div>
          <div className="px-4 pb-2 flex justify-center">
            <Button
              onClick={() => setIsFilterModalOpen(false)}
              className="px-6"
            >
              Show Results
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MessageDialog
        isOpen={isMessageDialogOpen}
        onOpenChange={setIsMessageDialogOpen}
        volunteer={selectedVolunteer}
      />
    </div>
  );
}
