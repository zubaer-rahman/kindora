"use client";

import Image from "next/image";
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface OpportunityHeaderBannerProps {
    opportunity: any;
    userRole: string;
    isCurrentUserFromOpportunityOrg: boolean;
    onDelete: () => void;
}

export default function OpportunityHeaderBanner({
    opportunity,
    userRole,
    isCurrentUserFromOpportunityOrg,
    onDelete
}: OpportunityHeaderBannerProps) {
    const router = useRouter();

    return (
        <div className="relative w-full rounded-[24px] overflow-hidden shadow-sm mb-8 min-h-[140px] md:min-h-[160px]">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/bg/bg_organisation_profile_banner.png"
                    alt="Banner Background"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* Top Bar: Badge (Organisation Name or Type) */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30 flex justify-end items-center">
                <Badge
                    variant="secondary"
                    className="bg-[#F2F4F7]/90 backdrop-blur-md text-[#344054] hover:bg-[#F2F4F7] px-4 py-1.5 rounded-full text-sm font-medium border-none whitespace-nowrap shadow-sm"
                >
                    {opportunity?.organization_profile?.title || "Community Opportunity"}
                </Badge>
            </div>

            {/* Content Container */}
            <div className="relative z-10 p-5 pt-14 sm:p-6 sm:pt-14 md:p-8 md:pt-10 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 h-full">
                {/* Opportunity Thumbnail (treated like the logo) */}
                <div className="flex-shrink-0 w-15 h-15 sm:w-19 sm:h-19 md:w-23 md:h-23 rounded-[16px] sm:rounded-[18px] overflow-hidden shadow-sm bg-white p-1">
                    <div className="relative w-full h-full rounded-[14px] sm:rounded-[16px] overflow-hidden">
                        <Image
                            src={opportunity?.banner_img || "/images/banners/cover_placeholder.png"}
                            alt={opportunity?.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 flex flex-col justify-center min-w-0">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#101828] mb-1 sm:mb-2 break-words">
                        {opportunity?.title}
                    </h1>
                    <p className="text-[#475467] text-xs sm:text-sm md:text-base font-medium">
                        {opportunity?.location || "Location not specified"}
                    </p>
                </div>

                {/* Action Buttons for Organisation */}
                {userRole === "organisation" && isCurrentUserFromOpportunityOrg && (
                    <div className="flex-shrink-0 md:ml-auto w-full md:w-auto mt-6 md:mt-0 flex items-center gap-3">
                        <Button
                            onClick={() => router.push(`/organisation/opportunities/${opportunity._id}/edit`)}
                            className="bg-white hover:bg-gray-50 text-blue-600 px-5 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold shadow-sm border border-gray-100 transition-all duration-200"
                        >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                        </Button>
                        {opportunity.is_archived && (
                            <Button
                                onClick={onDelete}
                                variant="destructive"
                                className="px-5 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold shadow-sm transition-all duration-200"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
