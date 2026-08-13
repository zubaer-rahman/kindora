"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { VolunteerOpportunityCard, CustomTabs } from "@/components/common";
import { MentorOpportunityCard } from "@/components/layout/mentor/MentorOpportunityCard";
import VolunteerDashboardSidebar from "../../find-opportunity/VolunteerDashboardSidebar";
import { PaginationWrapper } from "@/components/PaginationWrapper";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

    const axiosAuth = useAxiosAuth();

    // 1. Active Applications
    const {
        data: activeData,
        isLoading: isLoadingActive
    } = useQuery({
        queryKey: ['applications', 'active', currentPage, limit],
        queryFn: async () => {
            const res = await axiosAuth.get('/api/v1/applications/me/active', { params: { page: currentPage, limit } });
            return res.data.data;
        },
        enabled: activeTab === "active",
    });

    // 2. Approved Applications
    const {
        data: approvedData,
        isLoading: isLoadingApproved
    } = useQuery({
        queryKey: ['applications', 'approved', currentPage, limit],
        queryFn: async () => {
            const res = await axiosAuth.get('/api/v1/applications/me/approved', { params: { page: currentPage, limit } });
            return res.data.data;
        },
        enabled: activeTab === "approved",
    });

    // 3. Recent/History
    const {
        data: recentData,
        isLoading: isLoadingRecent
    } = useQuery({
        queryKey: ['applications', 'recent', currentPage, limit],
        queryFn: async () => {
            const res = await axiosAuth.get('/api/v1/applications/me/recent', { params: { page: currentPage, limit } });
            return res.data.data;
        },
        enabled: activeTab === "recent",
    });

    // 4. Mentor Opportunities
    const {
        data: mentorOpportunitiesData,
        isLoading: isLoadingMentorOpportunities
    } = useQuery({
        queryKey: ['mentorOpportunities', currentPage, limit],
        queryFn: async () => {
            const res = await axiosAuth.get('/api/v1/opportunities/mentor', { params: { page: currentPage, limit } });
            return res.data.data;
        },
        enabled: activeTab === "mentor",
    });

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
        <div className="min-h-[calc(100vh-72px)] lg:h-[calc(100vh-72px)] flex flex-col">
            <div className="container max-w-[1280px] mx-auto px-4 pt-6 flex flex-col flex-1 min-h-0 lg:overflow-hidden">
                <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0 flex flex-col min-h-0">
                        {/* Fixed Header Section */}
                        <div className="shrink-0">
                            {/* Header Section */}
                            <div className="mb-4">
                                <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
                                    My Opportunities
                                </h1>
                                <p className="text-muted-foreground">
                                    Manage your applications and track your volunteer journey.
                                </p>
                            </div>

                            {/* Tabs Section */}
                            <div className="pt-2 border-b border-border">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <CustomTabs
                                        tabs={tabs}
                                        activeTab={activeTab}
                                        onTabChange={(value) => {
                                            setActiveTab(value);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Cards Section */}
                        <div className="flex-1 overflow-y-auto min-h-0 mt-6 no-scrollbar">
                            <div className="divide-y divide-border">
                                {isLoading ? (
                                    <div>
                                        {/* Loading Skeletons */}
                                        {Array.from({ length: 3 }).map((_, index) => (
                                            <div key={index} className="px-4 py-6">
                                                {/* Posted time + status + heart */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <Skeleton className="h-3.5 w-24" />
                                                    <div className="flex items-center gap-2">
                                                        <Skeleton className="h-5 w-20 rounded-full" />
                                                        <Skeleton className="h-9 w-9 rounded-full" />
                                                    </div>
                                                </div>

                                                {/* Title */}
                                                <Skeleton className="h-6 w-3/4 mb-4" />

                                                {/* Metadata line */}
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-4">
                                                    <Skeleton className="h-3.5 w-20" />
                                                    <Skeleton className="h-3.5 w-2 rounded-full" />
                                                    <Skeleton className="h-3.5 w-14" />
                                                    <Skeleton className="h-3.5 w-2 rounded-full" />
                                                    <Skeleton className="h-3.5 w-24" />
                                                </div>

                                                {/* Description */}
                                                <div className="space-y-2 mb-4">
                                                    <Skeleton className="h-4 w-full" />
                                                    <Skeleton className="h-4 w-full" />
                                                    <Skeleton className="h-4 w-2/3" />
                                                </div>

                                                {/* Category badges */}
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Skeleton className="h-6 w-20 rounded-full" />
                                                    <Skeleton className="h-6 w-16 rounded-full" />
                                                    <Skeleton className="h-6 w-24 rounded-full" />
                                                </div>

                                                {/* Footer: location + proposals */}
                                                <div className="flex items-center justify-between">
                                                    <Skeleton className="h-3.5 w-32" />
                                                    <Skeleton className="h-3.5 w-20" />
                                                </div>
                                            </div>
                                        ))}

                                        {/* Pagination Skeleton */}
                                        <div className="p-6 border-t border-border flex justify-center gap-2">
                                            <Skeleton className="h-9 w-9 rounded-md" />
                                            <Skeleton className="h-9 w-9 rounded-md" />
                                            <Skeleton className="h-9 w-9 rounded-md" />
                                            <Skeleton className="h-9 w-9 rounded-md" />
                                            <Skeleton className="h-9 w-9 rounded-md" />
                                        </div>
                                    </div>
                                ) : activeTab === "mentor" ? (
                                    <>
                                        {mentorOpportunities.length === 0 ? (
                                            <div className="text-center py-20">
                                                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                                <p className="text-muted-foreground text-lg font-medium mb-2">
                                                    No Mentor Assignments
                                                </p>
                                                <p className="text-muted-foreground text-sm">
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
                                                    <div className="p-6 border-t border-border flex justify-center mt-6">
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
                                        <p className="text-muted-foreground">No applications found in this category.</p>
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
                                            <div className="p-6 border-t border-border flex justify-center">
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
                    <VolunteerDashboardSidebar className="w-full lg:w-[320px] flex-shrink-0 lg:sticky lg:top-6" />
                </div>
            </div>
        </div>
    );
}
