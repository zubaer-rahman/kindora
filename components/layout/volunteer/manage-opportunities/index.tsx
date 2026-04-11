"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { useSession } from "next-auth/react";
import { VolunteerOpportunityCard } from "@/components/common";
import { MentorOpportunityCard } from "@/components/layout/mentor/MentorOpportunityCard";
import VolunteerDashboardSidebar from "../../find-opportunity/VolunteerDashboardSidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaginationWrapper } from "@/components/PaginationWrapper";
import { Users } from "lucide-react";
import { useEffect } from "react";

interface Application {
    _id: string;
    status: string;
    opportunity: any;
    createdAt: string;
    updatedAt: string;
}

export default function ManageOpportunities() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");
    const { data: session } = useSession();
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState(tabParam || "active");

    useEffect(() => {
        if (tabParam && ["active", "approved", "recent", "mentor"].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    const limit = 6;

    // 1. Active Applications
    const {
        data: activeData,
        isLoading: isLoadingActive
    } = trpc.applications.getCurrentUserActiveApplications.useQuery(
        { page: currentPage, limit },
        { enabled: activeTab === "active" }
    );

    // 2. Approved Applications
    const {
        data: approvedData,
        isLoading: isLoadingApproved
    } = trpc.applications.getCurrentUserApprovedApplications.useQuery(
        { page: currentPage, limit },
        { enabled: activeTab === "approved" }
    );

    // 3. Recent/History
    const {
        data: recentData,
        isLoading: isLoadingRecent
    } = trpc.applications.getCurrentUserRecentApplications.useQuery(
        { page: currentPage, limit },
        { enabled: activeTab === "recent" }
    );

    // 4. Mentor Opportunities
    const {
        data: mentorOpportunitiesData,
        isLoading: isLoadingMentorOpportunities
    } = trpc.opportunities.getMentorOpportunities.useQuery(
        { page: currentPage, limit },
        { enabled: activeTab === "mentor" }
    );

    const isLoading =
        activeTab === "active" ? isLoadingActive :
            activeTab === "approved" ? isLoadingApproved :
                activeTab === "mentor" ? isLoadingMentorOpportunities :
                    isLoadingRecent;

    let applications: any[] = [];
    let total = 0;
    let totalPages = 1;
    let mentorOpportunities: any[] = [];

    if (activeTab === "active") {
        applications = activeData?.applications || [];
        total = activeData?.total || 0;
        totalPages = activeData?.totalPages || 1;
    } else if (activeTab === "approved") {
        applications = approvedData?.applications || [];
        total = approvedData?.total || 0;
        totalPages = approvedData?.totalPages || 1;
    } else if (activeTab === "recent") {
        applications = recentData?.applications || [];
        total = recentData?.total || 0;
        totalPages = recentData?.totalPages || 1;
    } else if (activeTab === "mentor") {
        mentorOpportunities = mentorOpportunitiesData?.opportunities || [];
        total = mentorOpportunitiesData?.total || 0;
        totalPages = mentorOpportunitiesData?.totalPages || 1;
    }

    const tabs = [
        { label: "Active Applications", value: "active" },
        { label: "Ongoing", value: "approved" },
        { label: "History", value: "recent" },
        { label: "Mentor Assignments", value: "mentor" },
    ];

    return (
        <div className="min-h-screen bg-white">
            <div className="container max-w-[1280px] mx-auto px-4 py-6 md:py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0">
                        {/* Header Section */}
                        <div className="mb-6">
                            <h1 className="text-2xl md:text-3xl font-semibold text-[#101828] mb-2">
                                My Opportunities
                            </h1>
                            <p className="text-gray-500">
                                Manage your applications and track your volunteer journey.
                            </p>
                        </div>

                        {/* Main Content Container */}
                        <div className="overflow-hidden">
                            {/* Tabs Section */}
                            <div className="pt-2 border-b border-[#E9EAEB]">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <Tabs
                                        value={activeTab}
                                        onValueChange={(value) => {
                                            setActiveTab(value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full sm:w-auto"
                                    >
                                        <TabsList className="bg-transparent p-0 h-auto rounded-none w-full justify-start border-none shadow-none">
                                            {tabs.map((tab) => (
                                                <TabsTrigger
                                                    key={tab.value}
                                                    value={tab.value}
                                                    className="px-5 py-2 text-sm text-[#5E6D55] font-medium data-[state=active]:text-[#101828] rounded-none bg-transparent border-b-[3px] border-transparent data-[state=active]:border-b-[#1570EF] shadow-none hover:text-[#101828] focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:shadow-none transition-all"
                                                >
                                                    {tab.label}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                    </Tabs>
                                </div>
                            </div>

                            {/* Applications List */}
                            <div className="divide-y divide-[#E9EAEB]">
                                {isLoading ? (
                                    <div className="p-6 space-y-6">
                                        {/* Loading Skeletons */}
                                        {Array.from({ length: 3 }).map((_, index) => (
                                            <div
                                                key={index}
                                                className="h-[200px] bg-gray-50 rounded-lg animate-pulse"
                                            />
                                        ))}
                                    </div>
                                ) : activeTab === "mentor" ? (
                                    <>
                                        {mentorOpportunities.length === 0 ? (
                                            <div className="text-center py-20">
                                                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-[#667085] text-lg font-medium mb-2">
                                                    No Mentor Assignments
                                                </p>
                                                <p className="text-[#667085] text-sm">
                                                    You haven't been assigned as a mentor for any opportunities yet.
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex flex-col">
                                                    {mentorOpportunities.map((opportunity: any) => (
                                                        <MentorOpportunityCard
                                                            key={opportunity._id}
                                                            opportunity={opportunity}
                                                        />
                                                    ))}
                                                </div>

                                                {/* Pagination */}
                                                {totalPages > 1 && (
                                                    <div className="p-6 border-t border-[#E9EAEB] flex justify-center mt-6">
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
                                    </>
                                ) : applications.length === 0 ? (
                                    <div className="text-center py-20">
                                        <p className="text-[#667085]">No applications found in this category.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col">
                                            {applications.map((app) => (
                                                <VolunteerOpportunityCard
                                                    key={app._id}
                                                    opportunity={app.opportunity}
                                                    applicationStatus={app.status}
                                                    applicationDate={app.createdAt}
                                                />
                                            ))}
                                        </div>

                                        {/* Pagination */}
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

                    {/* Right Sidebar - Reusing Dashboard Sidebar */}
                    <aside className="w-full lg:w-[320px] flex-shrink-0">
                        <VolunteerDashboardSidebar />
                    </aside>
                </div>
            </div>
        </div>
    );
}
