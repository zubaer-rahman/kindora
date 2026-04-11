"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import MentorDashboardSidebar from "@/components/layout/find-organisation/MentorDashboardSidebar";
import { MentorOpportunityCard } from "@/components/layout/mentor/MentorOpportunityCard";
import { PaginationWrapper } from "@/components/PaginationWrapper";
import { Users } from "lucide-react";

export default function MentorDashboard() {
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 6;

    const { data, isLoading } = trpc.opportunities.getMentorOpportunities.useQuery({
        page: currentPage,
        limit,
    });

    const opportunities = data?.opportunities || [];
    const totalPages = data?.totalPages || 1;

    return (
        <div className="min-h-screen bg-white">
            <div className="container max-w-[1280px] mx-auto px-4 py-6 md:py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <main className="flex-1 min-w-0">
                        <div className="mb-6">
                            <h1 className="text-xl md:text-2xl font-semibold text-[#101828] mb-2">
                                My opportunities
                            </h1>
                            <p className="text-[#667085] text-sm">
                                Opportunities you are mentoring for organisations
                            </p>
                        </div>

                        <div className="overflow-hidden">
                            <div className="divide-y divide-[#E9EAEB]">
                                {isLoading ? (
                                    <div className="p-6 space-y-6">
                                        {Array.from({ length: 3 }).map((_, index) => (
                                            <div
                                                key={index}
                                                className="h-[220px] bg-gray-50 rounded-lg animate-pulse"
                                            />
                                        ))}
                                    </div>
                                ) : opportunities.length === 0 ? (
                                    <div className="text-center py-20">
                                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-[#667085] text-lg font-medium mb-2">
                                            No opportunities yet
                                        </p>
                                        <p className="text-[#667085] text-sm">
                                            You haven&apos;t been assigned as a mentor for any
                                            opportunities yet. Organisations will assign you when
                                            they need mentorship support.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col">
                                            {opportunities.map((opportunity: any) => (
                                                <MentorOpportunityCard
                                                    key={opportunity._id}
                                                    opportunity={opportunity}
                                                />
                                            ))}
                                        </div>

                                        {totalPages > 1 && (
                                            <div className="p-6 border-t border-[#E9EAEB] flex justify-center">
                                                <PaginationWrapper
                                                    currentPage={currentPage}
                                                    totalPages={totalPages}
                                                    onPageChange={setCurrentPage}
                                                    maxVisiblePages={5}
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </main>

                    <aside className="w-full lg:w-[320px] flex-shrink-0">
                        <MentorDashboardSidebar />
                    </aside>
                </div>
            </div>
        </div>
    );
}
