import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const FindOpportunityLoading = () => {
  return (
    <div className="min-h-[calc(100vh-72px)] lg:h-[calc(100vh-72px)] flex flex-col">
      <div className="container max-w-[1280px] mx-auto px-4 pt-6 flex flex-col flex-1 min-h-0 lg:overflow-hidden">
        {/* Search Bar Skeleton - mirrors SearchBar (h-[48px], icon inset left) */}
        <div className="w-full lg:w-1/2 shrink-0">
          <div className="relative">
            <Skeleton className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 rounded-md" />
            <Skeleton className="w-full h-[48px] rounded-lg" />
          </div>
        </div>

        {/* Content Row */}
        <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0 mt-6">
          {/* Main Content Skeleton */}
          <main className="flex-1 min-w-0 flex flex-col min-h-0">
            {/* Heading Skeleton */}
            <div className="shrink-0">
              <Skeleton className="h-7 w-72 max-w-full mb-2" />
            </div>

            {/* Tabs Skeleton */}
            <div className="pt-2 border-b border-border">
              <div className="flex items-center gap-8 pb-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-6" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-14" />
                  <Skeleton className="h-4 w-6" />
                </div>
              </div>
            </div>

            {/* Cards Skeleton - mirrors VolunteerOpportunityCard */}
            <div className="flex-1 overflow-y-auto min-h-0 mt-6 no-scrollbar">
              <div>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="px-4 py-6 border-b border-border">
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
            </div>
          </main>

          {/* Sidebar Skeleton - mirrors VolunteerDashboardSidebar */}
          <aside className="w-full lg:w-[320px] flex-shrink-0">
            <div className="bg-background rounded-[24px] border border-border p-6">
              {/* Profile */}
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3.5 w-20" />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2 mb-6">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-2/3" />
              </div>

              {/* Preferences */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-28" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>

              {/* Proposals */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-28" />
                </div>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index}>
                      <Skeleton className="h-4 w-full mb-2" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-16 rounded-full" />
                        <Skeleton className="h-3 w-14" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default FindOpportunityLoading;
