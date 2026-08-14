"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { OrganizationCard, SearchBar, CustomTabs } from "@/components/common";
import MentorFindSidebar from "./MentorFindSidebar";
import { PaginationWrapper } from "@/components/common/PaginationWrapper";
import { profileService } from "@/services/profile.service";
import { useSearch } from "@/components/providers/SearchProvider";
import { Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function FindOrganisation() {
    const router = useRouter();
    const { filters, setSearchQuery } = useSearch();
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<"name" | "updated">("updated");
    const axiosAuth = useAxiosAuth();
    const params = useParams();
    const slug = params.slug as string[];
    const activeTab = slug?.[0] || "best-matches";

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters.categories, filters.location, sortBy, activeTab]);

    // Fetch organisations with filters via service
    const { data: orgsData, isLoading: isLoadingOrgs } = useQuery({
        queryKey: ["allOrganizations", activeTab === "best-matches" ? currentPage : 1, filters, sortBy],
        queryFn: () => profileService.getAllOrganizations(axiosAuth, {
            page: activeTab === "best-matches" ? currentPage : 1,
            limit: activeTab === "best-matches" ? 6 : 1,
            search: filters.searchQuery || undefined,
            category: filters.categories.length > 0 ? filters.categories[0] : undefined,
            sortBy,
        }),
        enabled: true,
    });

    // Fetch user's saved organisations via service
    const { data: savedOrgsData, isLoading: isLoadingSaved } = useQuery({
        queryKey: ["favoriteOrganizations", activeTab === "saved" ? currentPage : 1],
        queryFn: () => profileService.getFavorites(axiosAuth, { 
            page: activeTab === "saved" ? currentPage : 1, 
            limit: activeTab === "saved" ? 6 : 1 
        }),
        enabled: true,
    });

    const isLoading = activeTab === "best-matches" ? isLoadingOrgs : isLoadingSaved;

    let organizations: any[] = [];
    let totalPages = 1;

    if (activeTab === "best-matches") {
        organizations = orgsData?.organizations || [];
        totalPages = orgsData?.totalPages || 1;
    } else if (activeTab === "saved") {
        organizations = savedOrgsData?.organizations || [];
        totalPages = savedOrgsData?.totalPages || 1;
    }

    const tabs = [
        { label: "Best matches", value: "best-matches", count: orgsData?.total || 0 },
        { label: "Saved organisation", value: "saved", count: savedOrgsData?.total || 0 },
    ];

    const handleTabChange = (tab: string) => {
        router.push(`/find-organisation/${tab}`);
    };

    return (
        <div className="min-h-[calc(100vh-72px)] lg:h-[calc(100vh-72px)] flex flex-col bg-background">
            <div className="container max-w-[1280px] mx-auto px-4 pt-6 flex flex-col flex-1 min-h-0 lg:overflow-hidden">
                {/* Search Bar - half width on desktop */}
                <div className="w-full lg:w-1/2 shrink-0">
                    <SearchBar
                        initialQuery={filters.searchQuery}
                        initialLocation={filters.location}
                        placeholder="Search for organisations"
                        preventRedirect={true}
                        showClearButton={true}
                        onClear={() => setSearchQuery("")}
                        onSearch={(query) => setSearchQuery(query)}
                    />
                </div>

                {/* Content Row */}
                <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0 mt-6">
                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0 flex flex-col min-h-0">
                        {/* Fixed Header Section */}
                        <div className="shrink-0">
                            {/* Header Section */}
                            <div>
                                <h1 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
                                    Organisations you might like to mentor
                                </h1>
                            </div>

                            {/* Tabs Section */}
                            <div className="pt-2 border-b border-border">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <CustomTabs
                                        tabs={tabs}
                                        activeTab={activeTab}
                                        onTabChange={handleTabChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Cards Section */}
                        <div className="flex-1 overflow-y-auto min-h-0 mt-6 no-scrollbar">
                            <div className="divide-y divide-border">
                                {isLoading ? (
                                    <div className="space-y-6">
                                        {Array.from({ length: 3 }).map((_, index) => (
                                            <div
                                                key={index}
                                                className="px-4 py-6 border-b border-border flex flex-col"
                                            >
                                                {/* Top Row: Logo and Actions */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex gap-4">
                                                        <Skeleton className="w-12 h-12 rounded-lg" />
                                                        <div className="space-y-2">
                                                            <Skeleton className="h-6 w-48" />
                                                            <div className="flex gap-2">
                                                                <Skeleton className="h-5 w-20 rounded-full" />
                                                                <Skeleton className="h-5 w-32" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Skeleton className="h-9 w-9 rounded-full" />
                                                </div>
                                                
                                                {/* Bio Section */}
                                                <div className="space-y-2 mb-4">
                                                    <Skeleton className="h-4 w-full" />
                                                    <Skeleton className="h-4 w-5/6" />
                                                </div>

                                                {/* Categories */}
                                                <div className="flex gap-2 mb-4">
                                                    <Skeleton className="h-6 w-24 rounded-full" />
                                                    <Skeleton className="h-6 w-20 rounded-full" />
                                                    <Skeleton className="h-6 w-28 rounded-full" />
                                                </div>

                                                {/* Footer metadata */}
                                                <div className="flex gap-6 mt-auto">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-4 w-40" />
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
                                ) : organizations.length === 0 ? (
                                    <div className="text-center py-20 flex flex-col items-center gap-3">
                                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                                            <Building2 className="w-7 h-7 text-muted-foreground" />
                                        </div>
                                        <p className="text-muted-foreground font-medium">
                                            {activeTab === "saved"
                                                ? "No saved organisations yet."
                                                : "No organisations found."}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col">
                                            {organizations.map((org) => (
                                                <OrganizationCard
                                                    key={org._id}
                                                    organisation={org}
                                                />
                                            ))}
                                        </div>

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

                    {/* Right Sidebar */}
                    <MentorFindSidebar className="w-full lg:w-[320px] flex-shrink-0 lg:sticky lg:top-6" />
                </div>
            </div>
        </div>
    );
}
