import { useState, useMemo } from "react";

export interface UsePaginationOptions {
  pageSize?: number;
  initialPage?: number;
}

export interface UsePaginationReturn<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  paginatedData: T[];
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

export function usePagination<T>(
  data: T[],
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { pageSize = 10, initialPage = 1 } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / currentPageSize);

  // Convert to 0-based for calculations, but keep 1-based for API
  const currentPageZeroBased = currentPage - 1;
  const validCurrentPageZeroBased = Math.min(
    Math.max(0, currentPageZeroBased),
    Math.max(0, totalPages - 1)
  );
  const validCurrentPage = validCurrentPageZeroBased + 1;

  const startIndex = validCurrentPageZeroBased * currentPageSize;
  const endIndex = Math.min(startIndex + currentPageSize, totalItems);

  const paginatedData = useMemo(() => {
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex]);

  const hasNextPage = validCurrentPage < totalPages;
  const hasPreviousPage = validCurrentPage > 1;

  const goToPage = (page: number) => {
    const validPage = Math.min(Math.max(1, page), Math.max(1, totalPages));
    setCurrentPage(validPage);
  };

  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(validCurrentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(validCurrentPage - 1);
    }
  };

  const handleSetPageSize = (size: number) => {
    setCurrentPageSize(size);
    setCurrentPage(1);
  };

  return {
    currentPage: validCurrentPage,
    pageSize: currentPageSize,
    totalPages,
    paginatedData,
    setCurrentPage: goToPage,
    setPageSize: handleSetPageSize,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    totalItems,
  };
}
