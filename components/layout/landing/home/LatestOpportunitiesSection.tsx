"use client";

import { Button } from "@/components/ui/button";
import {
  BsChevronLeft as ChevronLeft,
  BsChevronRight as ChevronRight,
} from "react-icons/bs";
import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { Opportunity } from "@/types/opportunities";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { OpportunityCard } from "@/components/common";

interface LatestOpportunitiesSectionProps {
  limit?: number;
  title?: string;
  showPagination?: boolean;
  showSeeAllButton?: boolean;
}

export default function LatestOpportunitiesSection({
  limit = 6,
  title = "Unlock the Latest Opportunity for faster success",
  showPagination = true,
  showSeeAllButton = true,
}: LatestOpportunitiesSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch opportunities using public endpoint (works for both authenticated and unauthenticated users)
  const { data: opportunitiesData, isLoading, error } =
    trpc.opportunities.getPublicOpportunities.useQuery({
      page: currentPage,
      limit: limit,
      sortBy: "recently_added",
    });

  const opportunities = (opportunitiesData?.opportunities ||
    []) as unknown as Opportunity[];
  const totalOpportunities = opportunitiesData?.total || 0;
  const totalPages = opportunitiesData?.totalPages || 1;
  const showingCount = opportunities.length;

  // Generate pagination pages
  const getPaginationPages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages - 1);
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push(2);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(2);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages - 1);
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pagesToShow = getPaginationPages();

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto max-w-[1170px]">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto max-w-[1170px]">
          <div className="text-center py-12">
            <p className="text-red-600">Error loading opportunities</p>
            <p className="text-gray-600 mt-2">{error.message}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto max-w-[1170px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div className="flex-1">
            <h2 className="text-2xl max-w-[588px] sm:text-3xl md:text-[40px] font-semibold text-[#0A0D12] mb-8">
              {title}
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
              <p className="text-base sm:text-lg text-[#6A7282]">
                Showing {showingCount} {showingCount === 1 ? "Opportunity" : "Opportunities"} of{" "}
                {totalOpportunities.toLocaleString()} {totalOpportunities === 1 ? "total" : "totals"}
              </p>
              {showSeeAllButton && (
                <Button
                  variant="outline"
                  asChild
                  className="border-gray-300 !rounded-full text-[#414651] hover:bg-gray-50 rounded-lg px-[30px] py-[15px] h-auto w-fit"
                >
                  <Link href="/find-opportunity/most-recent">See all</Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        {opportunities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No opportunities available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px] mb-12">
            {opportunities.map((opportunity) => (
              <OpportunityCard key={opportunity._id} opportunity={opportunity} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {showPagination && totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 mt-8">
            <div className="flex items-center gap-1 sm:gap-2">
              {pagesToShow.map((page, index) => {
                if (page === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-1 sm:px-2 text-base sm:text-lg text-[#99A1AF]"
                    >
                      ...
                    </span>
                  );
                }
                return (
                  <Button
                    key={page}
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(page as number)}
                    className={`rounded-[10px] w-8 h-8 sm:w-[40px] sm:h-[40px] cursor-pointer text-sm sm:text-base ${currentPage === page
                      ? "bg-[#EFF8FF] text-[#1570EF] border-none"
                      : "border-[#E9EAEB] text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 ml-0 sm:ml-4 md:ml-[25px]">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-[10px] cursor-pointer bg-[#EFF8FF] w-8 h-8 sm:w-[40px] sm:h-[40px] border-none text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6 text-[#6A7282]" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="rounded-[10px] cursor-pointer bg-[#EFF8FF] w-8 h-8 sm:w-[40px] sm:h-[40px] border-none text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6 text-[#6A7282]" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
