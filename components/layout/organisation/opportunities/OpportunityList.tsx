import React from "react";
import { useRouter } from "next/navigation";
import type { Opportunity } from "@/types/opportunities";
import OpportunityTable from "./OpportunityTable";
import OpportunityMobileCard from "./OpportunityMobileCard";
import Loading from "@/app/loading";

interface OpportunityListProps {
  data: Opportunity[];
  activeTab: string;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  /** Base path for opportunity detail link. Default: /organisation/opportunities. Use /volunteer/mentor-opportunity for mentor. */
  detailPathPrefix?: string;
  /** When "mentor", view links go to mentor opportunity page and edit is hidden. */
  actionsMode?: "organisation" | "mentor";
}

export default function OpportunityList({
  data,
  activeTab,
  isLoading,
  currentPage,
  totalPages,
  detailPathPrefix = "/organisation/opportunities",
  actionsMode = "organisation",
}: OpportunityListProps) {
  const router = useRouter();

  const handleTitleClick = (opportunityId: string) => {
    router.push(`${detailPathPrefix}/${opportunityId}`);
  };
  return (
    <div className="flex-1 flex flex-col">
      {/* Desktop Table View */}
      <OpportunityTable
        data={data}
        activeTab={activeTab}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onTitleClick={handleTitleClick}
        actionsMode={actionsMode}
      />

      {/* Mobile Card View */}
      <div className="md:hidden px-4 flex-1 min-h-[400px]">
        {isLoading ? (
          <Loading size="medium">
            <p className="text-gray-600 mt-2">Wait a sec...</p>
          </Loading>
        ) : data.length === 0 ? (
          <div className="flex justify-center items-center py-10 text-gray-500 min-h-[300px]">
            No opportunities found.
          </div>
        ) : (
          <div className="space-y-4 min-h-[300px]">
            {data.map((opportunity) => (
              <OpportunityMobileCard
                key={opportunity._id}
                opportunity={opportunity}
                activeTab={activeTab}
                onTitleClick={handleTitleClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
