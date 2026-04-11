"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, ExternalLink, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import OrganizationAvatar from "@/components/ui/OrganizationAvatar";
import { formatText } from "@/utils/helpers/formatText";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface OrganisationProfileBannerProps {
    organizationProfile: any;
}

export default function OrganisationProfileBanner({
    organizationProfile,
}: OrganisationProfileBannerProps) {
    const router = useRouter();
    const formatOrgType = (type: string) =>
        type
            ? type
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())
            : "";

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

            {/* Top Bar: Badge */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30 flex justify-end items-center">
                {/* Badge Section */}
                <Badge
                    variant="secondary"
                    className="bg-[#F2F4F7]/90 backdrop-blur-md text-[#344054] hover:bg-[#F2F4F7] px-4 py-1.5 rounded-full text-sm font-medium border-none whitespace-nowrap shadow-sm"
                >
                    {organizationProfile && formatOrgType(organizationProfile.type)}
                </Badge>
            </div>

            {/* Content Container */}
            <div className="relative z-10 p-5 pt-6 sm:p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 h-full">
                {/* Logo/Avatar - Slightly larger to exceed content height a little */}
                <div className="flex-shrink-0   w-15 h-15 sm:w-19 sm:h-19 md:w-23 md:h-23 rounded-[16px] sm:rounded-[18px] overflow-hidden shadow-sm">
                    <OrganizationAvatar
                        organization={{
                            title: organizationProfile?.title || "",
                            profile_img: organizationProfile?.profile_img,
                        }}
                        size={96}
                        className="w-full h-full object-cover rounded-[16px] sm:rounded-[18px] border-none !bg-transparent"
                        objectFit="cover"
                    />
                </div>

                {/* Info Section */}
                <div className="flex-1 flex flex-col justify-center min-w-0">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#101828] mb-1 sm:mb-2 break-words">
                        {organizationProfile?.title}
                    </h1>

                    <div className="space-y-1.5 sm:space-y-1">
                        <div className="flex items-start text-[#475467] gap-2">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 text-[#667085]" />
                            <span className="text-xs sm:text-sm md:text-base leading-tight break-words">
                                {organizationProfile &&
                                    formatText(organizationProfile.area, organizationProfile.state)}
                            </span>
                        </div>

                        {organizationProfile?.website && (
                            <Link
                                href={organizationProfile.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-[#475467] hover:text-blue-600 transition-colors gap-2"
                            >
                                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-[#667085]" />
                                <span className="text-xs sm:text-sm md:text-base font-medium break-all">Visit Website</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
