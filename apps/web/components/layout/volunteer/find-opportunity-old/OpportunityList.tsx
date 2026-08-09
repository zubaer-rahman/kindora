"use client";

import OpportunityCard from "./OpportunityCard";
import OpportunityCardSkeleton from "./OpportunityCardSkeleton";
import { Opportunity } from "@/types/opportunities";

interface OpportunityListProps {
  opportunities: Opportunity[];
  isLoading: boolean;
}

export default function OpportunityList({
  opportunities,
  isLoading,
}: OpportunityListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3  gap-4 sm:gap-5 md:gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <OpportunityCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (opportunities.length === 0) {
    return null; // Return null instead of showing empty state - parent component handles this
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3  gap-4 sm:gap-5 md:gap-6">
      {opportunities.map((opportunity) => (
        <OpportunityCard key={opportunity._id} opportunity={opportunity} />
      ))}
    </div>
  );
}
