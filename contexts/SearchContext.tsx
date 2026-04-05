"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface FilterState {
  searchQuery: string;
  categories: string[];
  commitmentType: "all" | "workbased" | "eventbased";
  location: string;
  availability: {
    startDate: string;
    endDate: string;
  } | null;
}

interface SearchContextType {
  filters: FilterState;
  setSearchQuery: (query: string) => void;
  setCategories: (categories: string[]) => void;
  setCommitmentType: (type: "all" | "workbased" | "eventbased") => void;
  setLocation: (location: string) => void;
  setAvailability: (availability: { startDate: string; endDate: string } | null) => void;
  clearAllFilters: () => void;
  // Legacy support
  searchQuery: string;
}

const defaultFilters: FilterState = {
  searchQuery: "",
  categories: [],
  commitmentType: "all",
  location: "",
  availability: null,
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const setSearchQuery = useCallback((query: string) => {
    setFilters(prev => {
      if (prev.searchQuery === query) return prev;
      return { ...prev, searchQuery: query };
    });
  }, []);

  const setCategories = useCallback((categories: string[]) => {
    setFilters(prev => {
      if (JSON.stringify(prev.categories) === JSON.stringify(categories)) return prev;
      return { ...prev, categories };
    });
  }, []);

  const setCommitmentType = useCallback((type: "all" | "workbased" | "eventbased") => {
    setFilters(prev => {
      if (prev.commitmentType === type) return prev;
      return { ...prev, commitmentType: type };
    });
  }, []);

  const setLocation = useCallback((location: string) => {
    setFilters(prev => {
      if (prev.location === location) return prev;
      return { ...prev, location };
    });
  }, []);

  const setAvailability = useCallback((availability: { startDate: string; endDate: string } | null) => {
    setFilters(prev => {
      if (JSON.stringify(prev.availability) === JSON.stringify(availability)) return prev;
      return { ...prev, availability };
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);


  return (
    <SearchContext.Provider value={{
      filters,
      setSearchQuery,
      setCategories,
      setCommitmentType,
      setLocation,
      setAvailability,
      clearAllFilters,
      // Legacy support
      searchQuery: filters.searchQuery,
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
} 