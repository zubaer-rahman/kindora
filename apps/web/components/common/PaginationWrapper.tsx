import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface PaginationWrapperProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
  className?: string;
  disabled?: boolean;
}

export function PaginationWrapper({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  maxVisiblePages = 5,
  className = "",
  disabled = false,
}: PaginationWrapperProps) {
  if (totalPages <= 1) {
    return null;
  }

  // Convert to 0-based indexing for internal calculations
  const currentPageZeroBased = currentPage - 1;

  const getVisiblePageNumbers = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const halfVisible = Math.floor(maxVisiblePages / 2);
    let start = Math.max(0, currentPageZeroBased - halfVisible);
    const end = Math.min(totalPages - 1, start + maxVisiblePages - 1);

    if (end === totalPages - 1) {
      start = Math.max(0, end - maxVisiblePages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePageNumbers();

  const handlePrevious = () => {
    if (!disabled && currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (!disabled && currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (pageZeroBased: number) => {
    const pageOneBased = pageZeroBased + 1;
    if (!disabled && pageOneBased !== currentPage) {
      onPageChange(pageOneBased);
    }
  };

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePrevious();
            }}
            className={
              disabled || currentPage === 1
                ? "pointer-events-none opacity-50"
                : ""
            }
          />
        </PaginationItem>

        {showPageNumbers && (
          <>
            {visiblePages[0] > 0 && (
              <>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageClick(0);
                    }}
                    className={disabled ? "pointer-events-none opacity-50" : ""}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                {visiblePages[0] > 1 && (
                  <PaginationItem>
                    <span className="px-3 py-2 text-sm text-muted-foreground">
                      ...
                    </span>
                  </PaginationItem>
                )}
              </>
            )}

            {visiblePages.map((pageZeroBased) => (
              <PaginationItem key={pageZeroBased}>
                <PaginationLink
                  href="#"
                  isActive={pageZeroBased === currentPageZeroBased}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageClick(pageZeroBased);
                  }}
                  className={disabled ? "pointer-events-none opacity-50" : ""}
                >
                  {pageZeroBased + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <>
                {visiblePages[visiblePages.length - 1] < totalPages - 2 && (
                  <PaginationItem>
                    <span className="px-3 py-2 text-sm text-muted-foreground">
                      ...
                    </span>
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageClick(totalPages - 1);
                    }}
                    className={disabled ? "pointer-events-none opacity-50" : ""}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}
          </>
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleNext();
            }}
            className={
              disabled || currentPage === totalPages
                ? "pointer-events-none opacity-50"
                : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
