"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { Opportunity } from "@/types/opportunities";
import { DashboardLayout } from "./index";
import { useSearch } from "@/contexts/SearchContext";

interface OpportunityDashboardViewProps {
  title?: string;
  tabs?: Array<{ label: string; value: string }>;
  activeTab?: string;
  onTabChange?: (value: string) => void;
  className?: string;
}

export default function OpportunityDashboardView({
  title = "Opportunity in Australia",
  tabs = [
    { label: "Opportunity", value: "opportunity" },
    { label: "Subject 2", value: "subject2" },
    { label: "My proposal", value: "proposal" },
  ],
  activeTab = "opportunity",
  onTabChange,
  className = "",
}: OpportunityDashboardViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"recently_added" | "start_date">("recently_added");
  const { filters } = useSearch();

  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters.searchQuery,
    filters.categories,
    filters.commitmentType,
    filters.location,
    sortBy,
  ]);

  const { data: opportunitiesData, isLoading } =
    trpc.opportunities.getAllOpportunities.useQuery({
      page: currentPage,
      limit: 6,
      search: filters.searchQuery || undefined,
      categories:
        filters.categories.length > 0 ? filters.categories : undefined,
      commitmentType: filters.commitmentType,
      location: filters.location || undefined,
      sortBy: sortBy,
    });

  const opportunities = (opportunitiesData?.opportunities ||
    []) as unknown as Opportunity[];
  const totalOpportunities = opportunitiesData?.total || 0;

  // Filter out archived opportunities
  const visibleOpportunities = opportunities.filter((opp) => !opp.is_archived);

  const handleTabChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value);
    }
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as "recently_added" | "start_date");
  };

  return (
    <DashboardLayout
      title={title}
      resultsCount={totalOpportunities}
      opportunities={visibleOpportunities}
      isLoading={isLoading}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      sortOptions={[
        { label: "Recent", value: "recently_added" },
        { label: "Start Date", value: "start_date" },
      ]}
      sortBy={sortBy}
      onSortChange={handleSortChange}
      className={className}
    />
  );
}

