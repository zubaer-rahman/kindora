"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { trpc } from "@/utils/trpc";
import {
    Heart,
    MapPin,
    Globe,
    Briefcase
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Image from "next/image";

interface OrganisationCardProps {
    organisation: any; // Using any for now to handle the trpc joined result
    onCardClick?: (organisation: any) => void;
}

export default function OrganisationCard({
    organisation,
    onCardClick
}: OrganisationCardProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [isExpanded, setIsExpanded] = useState(false);

    const utils = trpc.useUtils();
    const { data: favoriteData } = trpc.organizationProfile.getFavoriteStatus.useQuery(
        { organizationId: organisation._id },
        { enabled: !!session?.user && !!organisation._id }
    );

    const toggleFavoriteMutation = trpc.organizationProfile.toggleFavorite.useMutation({
        onSuccess: () => {
            utils.organizationProfile.getFavoriteStatus.invalidate({ organizationId: organisation._id });
            utils.organizationProfile.getFavoriteOrganizationsWithPagination.invalidate();
        },
    });

    const isFavorite = favoriteData?.isFavorite;

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!session) {
            router.push(`/login?redirect=/find-organisation`);
            return;
        }
        toggleFavoriteMutation.mutate({ organizationId: organisation._id });
    };

    const handleCardClick = () => {
        if (onCardClick) {
            onCardClick(organisation);
            return;
        }
        router.push(`/organisation/profile/${organisation._id}`);
    };

    const cleanBio = (organisation.bio || "No description available.")
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();

    return (
        <Card
            onClick={handleCardClick}
            className="group hover:bg-[#F9FAFB] transition-colors rounded-none border-x-0 p-0 border-t-0 border-b border-[#E9EAEB] bg-white cursor-pointer flex flex-col w-full shadow-none"
        >
            <CardContent className="px-4 py-6 flex flex-col flex-1">
                {/* Top Row: Logo and Actions */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#E9EAEB] flex-shrink-0 bg-gray-50">
                            {organisation.profile_img ? (
                                <Image
                                    src={organisation.profile_img}
                                    alt={organisation.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                                    {organisation.title?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-[#101828] group-hover:text-[#1570EF] transition-colors line-clamp-1">
                                {organisation.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-[#475467] mt-1">
                                <Badge variant="outline" className="capitalize">
                                    {organisation.type?.replace('_', ' ')}
                                </Badge>
                                {organisation.website && (
                                    <div className="flex items-center gap-1">
                                        <Globe className="w-3 h-3" />
                                        <span className="truncate max-w-[150px]">{organisation.website.replace(/^https?:\/\//, '')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-9 w-9 rounded-full border border-[#E9EAEB] hover:bg-white transition-colors flex-shrink-0",
                            isFavorite && "bg-[#FEF3F2] border-[#FECDCA]"
                        )}
                        onClick={handleFavoriteClick}
                    >
                        <Heart
                            className={cn(
                                "w-4 h-4 transition-colors",
                                isFavorite ? "fill-[#D92D20] text-[#D92D20]" : "text-[#667085]"
                            )}
                        />
                    </Button>
                </div>

                {/* Bio Section */}
                <div className="mb-4">
                    <p className={cn(
                        "text-base text-[#344054] leading-relaxed",
                        !isExpanded && "line-clamp-2"
                    )}>
                        {cleanBio}
                    </p>
                    {cleanBio.length > 150 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            className="text-[#1570EF] text-sm font-medium mt-1 hover:underline"
                        >
                            {isExpanded ? "less" : "more"}
                        </button>
                    )}
                </div>

                {/* Opportunity Types / Categories */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {organisation.opportunity_types?.slice(0, 4).map((type: string, index: number) => (
                        <Badge
                            key={index}
                            variant="secondary"
                            className="bg-[#F2F4F7] text-[#344054] hover:bg-[#E4E7EB] border-none px-3 py-1 text-xs font-medium rounded-full"
                        >
                            {type}
                        </Badge>
                    ))}
                    {organisation.opportunity_types?.length > 4 && (
                        <span className="text-xs text-[#667085] self-center">
                            +{organisation.opportunity_types.length - 4} more
                        </span>
                    )}
                </div>

                {/* Footer Metadata */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-[#475467]">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#667085]" />
                        <span>{organisation.area}, {organisation.state}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-[#667085]" />
                        <span>{organisation.opportunityCount || 0} active opportunities</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
