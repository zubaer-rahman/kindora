"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FilterSidebar from "./FilterSidebar";
import SearchBar from "./SearchBar-old-ref";
import OpportunityCard from "./OpportunityCard";
import { Opportunity } from "@/types/opportunities";
import { useRouter } from "next/navigation";
import { useSearch } from "@/contexts/SearchContext";
import { PaginationWrapper } from "@/components/PaginationWrapper";

interface DashboardLayoutProps {
  title?: string;
  resultsCount?: number;
  opportunities: Opportunity[];
  isLoading?: boolean;
  tabs?: Array<{ label: string; value: string; count?: number }>;
  activeTab?: string;
  onTabChange?: (value: string) => void;
  sortOptions?: Array<{ label: string; value: string }>;
  sortBy?: string;
  onSortChange?: (value: string) => void;
  onSearch?: (query: string, location: string) => void;
  className?: string;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  // New props
  rightSidebar?: React.ReactNode;
  renderCard?: (opportunity: Opportunity) => React.ReactNode;
  layout?: "grid" | "list";
  showFilterSidebar?: boolean;
}

export default function DashboardLayout({
  title = "Opportunity in Australia",
  resultsCount = 0,
  opportunities = [],
  isLoading = false,
  tabs = [
    { label: "Opportunity", value: "opportunity" },
    { label: "My proposal", value: "proposal" },
  ],
  activeTab = "opportunity",
  onTabChange,
  sortOptions = [
    { label: "Recent", value: "recent" },
    { label: "Oldest", value: "oldest" },
    { label: "Most Popular", value: "popular" },
  ],
  sortBy = "recent",
  onSortChange,
  onSearch,
  className = "",
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  rightSidebar,
  renderCard,
  layout = "grid",
  showFilterSidebar = false,
}: DashboardLayoutProps) {
  const router = useRouter();
  const { setSearchQuery, setLocation } = useSearch();

  const handleSearch = (query: string, location: string) => {
    setSearchQuery(query);
    setLocation(location);
    if (onSearch) {
      onSearch(query, location);
    } else {
      router.push("/find-opportunity");
    }
  };

  return (
    <div className={`min-h-screen bg-white ${className}`}>
      <div className="container max-w-[1280px] mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filter */}
          {showFilterSidebar && (
            <aside className="w-full lg:w-[320px] flex-shrink-0">
              <FilterSidebar />
            </aside>
          )}

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Search Bar - Positioned on Right */}
            <div className="mb-6 w-full flex justify-end">
              <div className="w-full">
                <SearchBar onSearch={handleSearch} />
              </div>
            </div>

            {/* Header Section */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-[#101828] mb-2">
                {title}
              </h1>
            </div>

            {/* Main Content Container */}
            <div className="border border-[#E9EAEB] rounded-xl overflow-hidden">
              {/* Tabs and Sort Section */}
              <div className="px-6 pt-2 border-b border-[#E9EAEB]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Tabs */}
                  <Tabs
                    value={activeTab}
                    onValueChange={(value) => onTabChange?.(value)}
                    className="w-full sm:w-auto"
                  >
                    <TabsList className="bg-transparent p-0 h-auto rounded-none w-full justify-start gap-8">
                      {tabs.map((tab) => (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          className="px-0 py-4 text-sm text-[#5E6D55] font-medium data-[state=active]:text-[#101828] rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:border-[#14a800] shadow-none hover:text-[#101828] focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:shadow-none transition-all"
                        >
                          {tab.label}
                          {tab.count !== undefined && ` (${tab.count})`}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {/* Opportunities List */}
              <div className="divide-y divide-[#E9EAEB]">
                {isLoading ? (
                  <div className="p-6 space-y-6">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-[200px] bg-gray-50 rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : opportunities.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-[#667085]">No opportunities found.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col">
                      {opportunities.map((opportunity) => (
                        renderCard ? renderCard(opportunity) : (
                          <OpportunityCard
                            key={opportunity._id}
                            opportunity={opportunity}
                          />
                        )
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && onPageChange && (
                      <div className="p-6 border-t border-[#E9EAEB] flex justify-center">
                        <PaginationWrapper
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={onPageChange}
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
          {rightSidebar && (
            <aside className="w-full lg:w-[320px] flex-shrink-0">
              {rightSidebar}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

