"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { useSession } from "next-auth/react";
import { OrganisationCard, SearchBar, CustomTabs } from "@/components/common";
import MentorDashboardSidebar from "./MentorDashboardSidebar";
import { PaginationWrapper } from "@/components/PaginationWrapper";
import { useSearch } from "@/contexts/SearchContext";

export default function FindOrganisation() {
    const router = useRouter();
    const { data: session } = useSession();
    const { filters } = useSearch();
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<"name" | "updated">("updated");
    const params = useParams();
    const slug = params.slug as string[];
    const activeTab = slug?.[0] || "best-matches";

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [
        filters.categories,
        filters.location,
        sortBy,
        activeTab,
    ]);

    // Fetch organisations with filters
    const { data: orgsData, isLoading: isLoadingOrgs } =
        trpc.organizationProfile.getAllOrganizations.useQuery(
            {
                page: (activeTab === "best-matches") ? currentPage : 1,
                limit: (activeTab === "best-matches") ? 6 : 1,
                search: filters.searchQuery || undefined,
                category: filters.categories.length > 0 ? filters.categories[0] : undefined,
                sortBy: sortBy,
            },
            { enabled: activeTab === "best-matches" }
        );

    // Fetch user's saved organisations
    const { data: savedOrgsData, isLoading: isLoadingSaved } =
        trpc.organizationProfile.getFavoriteOrganizationsWithPagination.useQuery(
            {
                page: activeTab === "saved" ? currentPage : 1,
                limit: activeTab === "saved" ? 6 : 1,
            },
            { enabled: activeTab === "saved" }
        );

    const isLoading = activeTab === "best-matches" ? isLoadingOrgs : isLoadingSaved;

    let organizations: any[] = [];
    let totalOrganizations = 0;
    let totalPages = 1;

    if (activeTab === "best-matches") {
        organizations = orgsData?.organizations || [];
        totalOrganizations = orgsData?.total || 0;
        totalPages = orgsData?.totalPages || 1;
    } else if (activeTab === "saved") {
        organizations = savedOrgsData?.organizations || [];
        totalOrganizations = savedOrgsData?.total || 0;
        totalPages = savedOrgsData?.totalPages || 1;
    }

    const tabs = [
        { label: "Best matches", value: "best-matches" },
        { label: "Saved organisation", value: "saved", count: savedOrgsData?.total || 0 },
    ];

    const handleTabChange = (tab: string) => {
        router.push(`/find-organisation/${tab}`);
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="container max-w-[1280px] mx-auto px-4 py-6 md:py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0">
                        {/* Search Bar */}
                        <div className="mb-6 w-full flex justify-end">
                            <div className="w-full">
                                <SearchBar
                                    initialQuery={filters.searchQuery}
                                    initialLocation={filters.location}
                                    placeholder="Search for organisations"
                                />
                            </div>
                        </div>

                        {/* Header Section */}
                        <div className="mb-6">
                            <h1 className="text-xl md:text-2xl font-semibold text-[#101828] mb-2">
                                Organisations you might like to mentor
                            </h1>
                        </div>

                        {/* Content Container */}
                        <div className="overflow-hidden">
                            {/* Tabs Section */}
                            <div className="pt-2 border-b border-[#E9EAEB]">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <CustomTabs
                                        tabs={tabs}
                                        activeTab={activeTab}
                                        onTabChange={handleTabChange}
                                    />
                                </div>
                            </div>

                            {/* Organisations List */}
                            <div className="divide-y divide-[#E9EAEB]">
                                {isLoading ? (
                                    <div className="p-6 space-y-6">
                                        {Array.from({ length: 3 }).map((_, index) => (
                                            <div
                                                key={index}
                                                className="h-[180px] bg-gray-50 rounded-lg animate-pulse"
                                            />
                                        ))}
                                    </div>
                                ) : organizations.length === 0 ? (
                                    <div className="text-center py-20">
                                        <p className="text-[#667085]">No organisations found.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col">
                                            {organizations.map((org) => (
                                                <OrganisationCard
                                                    key={org._id}
                                                    organisation={org}
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

                    {/* Right Sidebar */}
                    <aside className="w-full lg:w-[320px] flex-shrink-0">
                        <MentorDashboardSidebar />
                    </aside>
                </div>
            </div>
        </div>
    );
}
