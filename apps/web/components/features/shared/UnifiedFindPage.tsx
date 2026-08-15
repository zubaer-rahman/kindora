"use client";

import { ReactNode } from "react";
import { SearchBar } from "@/components/common";
import { useSearch } from "@/components/providers/SearchProvider";
import { PaginationWrapper } from "@/components/common/PaginationWrapper";
import { CustomTabs } from "@/components/common";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface UnifiedFindPageProps {
  title?: string;
  type: "opportunity" | "volunteer" | "organization";
  isLoading: boolean;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  
  // Search
  searchPlaceholder?: string;
  onSearch: (query: string) => void;
  preventRedirect?: boolean;
  redirectBasePath?: string;
  
  // Sidebar
  sidebarPosition?: "left" | "right";
  sidebarContent?: ReactNode;
  
  // Tabs
  tabs?: { label: string; value: string; count: number }[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  
  // Controls (like sorting)
  controlsContent?: ReactNode;
  
  // List
  renderList: () => ReactNode;
  
  // Mobile Filter
  onMobileFilterClick?: () => void;
}

export default function UnifiedFindPage({
  title,
  isLoading,
  totalItems,
  totalPages,
  currentPage,
  onPageChange,
  searchPlaceholder = "Search...",
  onSearch,
  preventRedirect = true,
  redirectBasePath,
  sidebarPosition = "left",
  sidebarContent,
  tabs,
  activeTab,
  onTabChange,
  controlsContent,
  renderList,
  onMobileFilterClick,
}: UnifiedFindPageProps) {
  const { searchQuery, setSearchQuery } = useSearch();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    onSearch("");
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] overflow-hidden bg-background">
      <div className="container max-w-[1280px] mx-auto px-4 pt-6 md:pt-8 flex flex-col h-full lg:overflow-hidden min-h-0">
        
        {/* Top Search Bar Row */}
        <div className="flex items-center gap-4 mb-6 flex-shrink-0">
          <div className="flex-1 max-w-2xl">
            <SearchBar
              onSearch={handleSearch}
              initialQuery={searchQuery}
              borderRadius="100px"
              showClearButton={true}
              onClear={handleClearSearch}
              placeholder={searchPlaceholder}
              preventRedirect={preventRedirect}
              redirectBasePath={redirectBasePath}
            />
          </div>
          {onMobileFilterClick && (
            <Button
              variant="outline"
              onClick={onMobileFilterClick}
              className="lg:hidden flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          )}
        </div>

        {/* Content Row */}
        <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0 mt-2">
          
          {/* Left Sidebar */}
          {sidebarPosition === "left" && sidebarContent && (
            <aside className="hidden lg:block w-[280px] flex-shrink-0 overflow-y-auto no-scrollbar">
              {sidebarContent}
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0 flex flex-col min-h-0">
            {/* Header / Tabs / Controls */}
            <div className="shrink-0">
              {title && (
                <h1 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
                  {title}
                </h1>
              )}

              {tabs && tabs.length > 0 && activeTab && onTabChange && (
                <div className="pt-2 border-b border-border mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CustomTabs
                      tabs={tabs}
                      activeTab={activeTab}
                      onTabChange={onTabChange}
                    />
                  </div>
                </div>
              )}

              {controlsContent && (
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-border flex-shrink-0">
                  <div className="flex items-center gap-6">
                    {!isLoading && totalItems > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Showing {totalItems} results
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {controlsContent}
                  </div>
                </div>
              )}
            </div>

            {/* List and Pagination Area */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 pb-8 no-scrollbar">
              {renderList()}

              {!isLoading && totalPages > 1 && (
                <div className="pt-6 flex justify-center border-t border-border mt-4">
                  <PaginationWrapper
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                    maxVisiblePages={5}
                  />
                </div>
              )}
            </div>
          </main>

          {/* Right Sidebar */}
          {sidebarPosition === "right" && sidebarContent && (
            <aside className="w-full lg:w-[320px] flex-shrink-0 lg:sticky lg:top-6 overflow-y-auto no-scrollbar hidden lg:block">
              {sidebarContent}
            </aside>
          )}
          
        </div>
      </div>
    </div>
  );
}
