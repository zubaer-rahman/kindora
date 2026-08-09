"use client";

import Image from "next/image";
import { MapPin, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import UserAvatar from "@/components/ui/UserAvatar";
import { formatText } from "@/utils/helpers/formatText";
import { Button } from "@/components/ui/button";

interface VolunteerProfileBannerProps {
    volunteer: any;
    getStudentStatusDisplay: () => string;
}

export default function VolunteerProfileBanner({
    volunteer,
    getStudentStatusDisplay
}: VolunteerProfileBannerProps) {
    return (
        <div className="relative w-full rounded-[24px] overflow-hidden shadow-sm mb-8 min-h-[140px] md:min-h-[160px]">
            {/* Background Image - SAME BG AS ORGANISATION */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/bg/bg_organisation_profile_banner.png"
                    alt="Banner Background"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* Top Bar: Badge - SAME STYLE AS ORGANISATION */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30 flex justify-end items-center">
                <Badge
                    variant="secondary"
                    className="bg-[#F2F4F7]/90 backdrop-blur-md text-[#344054] hover:bg-[#F2F4F7] px-4 py-1.5 rounded-full text-sm font-medium border-none whitespace-nowrap shadow-sm"
                >
                    {getStudentStatusDisplay()}
                </Badge>
            </div>

            {/* Content Container */}
            <div className="relative z-10 p-5 pt-14 sm:p-6 sm:pt-14 md:p-8 md:pt-10 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 h-full">
                {/* Avatar - SAME SIZE AND STYLE AS ORGANISATION */}
                <div className="flex-shrink-0 w-15 h-15 sm:w-19 sm:h-19 md:w-23 md:h-23 rounded-[16px] sm:rounded-[18px] overflow-hidden shadow-sm">
                    <UserAvatar
                        user={volunteer}
                        size={96}
                        className="w-full h-full object-cover rounded-[16px] sm:rounded-[18px] border-none !bg-transparent"
                    />
                </div>

                {/* Info Section - SAME TYPOGRAPHY AS ORGANISATION */}
                <div className="flex-1 flex flex-col justify-center min-w-0">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#101828] mb-1 sm:mb-2 break-words">
                        {volunteer.name}
                    </h1>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-start text-[#475467] gap-2">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 text-[#667085]" />
                            <span className="text-xs sm:text-sm md:text-base leading-tight break-words font-medium">
                                {volunteer.area && volunteer.state
                                    ? formatText(volunteer.area, volunteer.state)
                                    : volunteer.state || formatText(volunteer.area)
                                }
                            </span>
                        </div>
                    </div>


                </div>
            </div>




        </div>
    );
}
