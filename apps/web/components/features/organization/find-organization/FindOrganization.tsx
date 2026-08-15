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
import UnifiedFindPage from "@/components/features/shared/UnifiedFindPage";

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

    const renderList = () => {
        if (isLoading) {
            return (
                <div className="space-y-6">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="px-4 py-6 border-b border-border flex flex-col">
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
                            <div className="space-y-2 mb-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                            </div>
                            <div className="flex gap-2 mb-4">
                                <Skeleton className="h-6 w-24 rounded-full" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-6 w-28 rounded-full" />
                            </div>
                            <div className="flex gap-6 mt-auto">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (organizations.length === 0) {
            return (
                <div className="text-center py-20 flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                        <Building2 className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">
                        {activeTab === "saved" ? "No saved organisations yet." : "No organisations found."}
                    </p>
                </div>
            );
        }

        return (
            <div className="flex flex-col">
                {organizations.map((org) => (
                    <OrganizationCard key={org._id} organisation={org} />
                ))}
            </div>
        );
    };

    return (
        <UnifiedFindPage
            title="Organisations you might like to mentor"
            type="organization"
            isLoading={isLoading}
            totalItems={orgsData?.total || savedOrgsData?.total || 0}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            searchPlaceholder="Search for organisations"
            onSearch={(q) => setSearchQuery(q)}
            preventRedirect={false}
            redirectBasePath="/search/organizations"
            sidebarPosition="right"
            sidebarContent={<MentorFindSidebar />}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            renderList={renderList}
        />
    );
}
