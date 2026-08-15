"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";

import { Skeleton } from "@/components/ui/skeleton";
import FilterSidebar, { VolunteerFilters } from "@/components/features/search/FilterSidebar";
import NewVolunteerCard from "@/components/features/organization/NewVolunteerCard";
import MessageDialog from "../MessageDialog";
import { useSearch } from "@/components/providers/SearchProvider";
import UnifiedFindPage from "@/components/features/shared/UnifiedFindPage";
import QueryStateWrapper from "@/components/common/QueryStateWrapper";
import { userService } from "@/services/user.service";
import { PaginationWrapper } from "@/components/common/PaginationWrapper";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EmptyState from "@/components/common/EmptyState";
import { Users } from "lucide-react";
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
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState<"available" | "not_available" | "best_matches">("available");
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

  const { data: volunteersData, isLoading } = useQuery({
    queryKey: ["availableUsers", currentPage, filters, searchQuery, sortBy],
    queryFn: () => userService.getAvailableUsers(axiosAuth, {
      page: currentPage,
      limit: 10,
      search: searchQuery,
      categories: filters.categories.length > 0 ? filters.categories : undefined,
      location: filters.locations.length > 0 ? filters.locations.join(", ") : undefined,
      sortBy: sortBy === "best_matches" ? undefined : sortBy,
    }),
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

  const renderList = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, index) => (
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
      ));
    }

    if (volunteers.length === 0) {
      return (
        <EmptyState
          icon={Users}
          title="No volunteers found"
          description="Try adjusting your search criteria to find more volunteers that match your requirements."
          variant="default"
          showAction={false}
        />
      );
    }

    return volunteers.map((volunteer: Record<string, unknown>) => (
      <NewVolunteerCard
        key={volunteer._id as string}
        volunteer={volunteer as unknown as Volunteer}
        onConnect={handleConnect}
      />
    ));
  };

  const controlsContent = (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Sort by:</span>
      <Select
        value={sortBy}
        onValueChange={(value: "available" | "not_available" | "best_matches") => setSortBy(value)}
      >
        <SelectTrigger className="w-[140px] h-9 border-input rounded-lg text-sm font-medium text-foreground focus:ring-0 focus:ring-offset-0">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="available">Available</SelectItem>
          <SelectItem value="not_available">Not Available</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <>
      <UnifiedFindPage
        type="volunteer"
        isLoading={isLoading}
        totalItems={totalItems}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        searchPlaceholder="Search for volunteers"
        onSearch={handleSearch}
        preventRedirect={false}
        redirectBasePath="/search/volunteers"
        sidebarPosition="left"
        sidebarContent={
          <FilterSidebar variant="volunteer" onFilterChange={setFilters} currentFilters={filters} />
        }
        controlsContent={controlsContent}
        renderList={renderList}
        onMobileFilterClick={() => setIsFilterModalOpen(true)}
      />

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
            <Button onClick={() => setIsFilterModalOpen(false)} className="px-6">
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
    </>
  );
}
