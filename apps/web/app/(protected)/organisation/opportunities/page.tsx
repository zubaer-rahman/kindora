"use client";

import React from "react";
import { useState, useEffect } from "react";
import { CreateOpportunityButton } from "@/components/buttons/CreateOpportunityButton";
import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import OpportunityTabs from "@/components/features/organization/opportunities/OpportunityTabs";
import OpportunityList from "@/components/features/organization/opportunities/OpportunityList";
import { PaginationWrapper } from "@/components/common/PaginationWrapper";
import { usePagination } from "@/hooks/usePagination";
import type { Opportunity } from "@/types/opportunities";

export default function OpportunitiesPage() {
  const [activeTab, setActiveTab] = useState("open");
  const axiosAuth = useAxiosAuth();

  const {
    data: opportunities,
    isLoading,
    refetch,
  } = useQuery<Opportunity[]>({
    queryKey: ["organizationOpportunities"],
    queryFn: async () => {
      const res = await axiosAuth.get("/api/v1/opportunities/my-org");
      return res.data.data;
    },
  });

  // Listen for notification changes and refetch opportunities
  const { data: unreadCount } = useQuery({
    queryKey: ["notificationsUnreadCount"],
    queryFn: async () => {
      const res = await axiosAuth.get("/api/v1/notifications/unread-count");
      return res.data.data;
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    refetch();
  }, [unreadCount?.count, refetch]);

  // Filter opportunities based on active tab
  const filteredOpportunities = React.useMemo(() => {
    if (!opportunities) return [];

    switch (activeTab) {
      case "open":
        return opportunities.filter((opp) => !opp.is_archived);
      case "draft":
        const now = new Date();
        return opportunities
          .filter((opp) => {
            if (opp.is_archived) return false;
            if (!opp.date?.end_date) return false;

            const endDate = new Date(opp.date.end_date);
            if (opp.time?.end_time) {
              const [hours, minutes] = opp.time.end_time.split(":").map(Number);
              endDate.setHours(hours, minutes, 0, 0);
            }

            return endDate < now;
          })
          .sort((a, b) => {
            const endDateA = new Date(a.date?.end_date || 0);
            const endDateB = new Date(b.date?.end_date || 0);
            return endDateB.getTime() - endDateA.getTime();
          });
      case "recruited":
        return opportunities.filter(
          (opp) => !opp.is_archived && opp.recruitCount && opp.recruitCount > 0,
        );
      case "archived":
        return opportunities.filter((opp) => opp.is_archived);
      default:
        return opportunities.filter((opp) => !opp.is_archived);
    }
  }, [opportunities, activeTab]);

  const { currentPage, totalPages, paginatedData, setCurrentPage } =
    usePagination(filteredOpportunities, {
      pageSize: 4,
      initialPage: 1,
    });

  const tabCounts = React.useMemo(() => {
    if (!opportunities) return { open: 0, draft: 0, recruited: 0, archived: 0 };

    const now = new Date();

    return {
      open: opportunities.filter((opp) => !opp.is_archived).length,
      draft: opportunities.filter((opp) => {
        if (opp.is_archived) return false;
        if (!opp.date?.end_date) return false;

        const endDate = new Date(opp.date.end_date);
        if (opp.time?.end_time) {
          const [hours, minutes] = opp.time.end_time.split(":").map(Number);
          endDate.setHours(hours, minutes, 0, 0);
        }

        return endDate < now;
      }).length,
      recruited: opportunities.filter(
        (opp) => !opp.is_archived && opp.recruitCount && opp.recruitCount > 0,
      ).length,
      archived: opportunities.filter((opp) => opp.is_archived).length,
    };
  }, [opportunities]);

  return (
    <ProtectedLayout>
      <div className="min-h-screen">
        <div className="max-w-7xl py-4 sm:py-8 px-4 mx-auto">
          <div className="rounded-lg flex flex-col min-h-[600px]">
            <div className="px-4 pt-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold mb-1">
                    Opportunities
                  </h1>
                  <p className="text-sm text-muted-foreground">Posted tasks</p>
                </div>
                <CreateOpportunityButton />
              </div>
              <OpportunityTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                openCount={tabCounts.open}
                draftCount={tabCounts.draft}
                recruitedCount={tabCounts.recruited}
                archivedCount={tabCounts.archived}
              />
            </div>

            <OpportunityList
              data={paginatedData}
              activeTab={activeTab}
              isLoading={isLoading}
              currentPage={currentPage}
              totalPages={totalPages}
            />

            <div className="px-4 flex items-center justify-center border-t bg-muted">
              <PaginationWrapper
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                maxVisiblePages={5}
              />
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
