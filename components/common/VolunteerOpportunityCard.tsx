"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Opportunity } from "@/types/opportunities";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { trpc } from "@/utils/trpc";
import { useOpportunityDrawer } from "./OpportunityDrawerProvider";
import { useVolunteerApplication } from "@/hooks/useVolunteerApplication";
import {
    Heart,
    MapPin,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface VolunteerOpportunityCardProps {
    opportunity: Opportunity;
    applicationStatus?: string;
    applicationDate?: string;
    onCardClick?: (opportunity: Opportunity) => void;
}

export default function VolunteerOpportunityCard({
    opportunity,
    applicationStatus,
    applicationDate,
    onCardClick
}: VolunteerOpportunityCardProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const { openDrawer } = useOpportunityDrawer();
    const { isApplied } = useVolunteerApplication(opportunity._id);
    const [isExpanded, setIsExpanded] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const utils = trpc.useContext();
    const { data: favoriteData } = trpc.volunteers.getFavoriteStatus.useQuery(
        { opportunityId: opportunity._id },
        { enabled: !!session?.user && !!opportunity._id }
    );

    const toggleFavoriteMutation = trpc.volunteers.toggleFavorite.useMutation({
        onSuccess: () => {
            utils.volunteers.getFavoriteStatus.invalidate({ opportunityId: opportunity._id });
        },
    });

    const isFavorite = favoriteData?.isFavorite;

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!session) {
            router.push(`/login?redirect=/find-opportunity`);
            return;
        }
        toggleFavoriteMutation.mutate({ opportunityId: opportunity._id });
    };

    const formatCommitmentType = (type: string | undefined) => {
        if (!type) return "";
        const typeMap: Record<string, string> = {
            workbased: "Work Based",
            eventbased: "Event Based",
            oneoff: "One off",
            regular: "Regular",
        };
        return typeMap[type] || type;
    };

    const commitmentType = formatCommitmentType(opportunity.commitment_type);

    const cleanDescription = (opportunity.description || "No description available.")
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();

    const params = useParams();
    const slug = params.slug as string[];
    const activeTab = slug?.[0] || "best-matches";

    const handleCardClick = () => {
        if (onCardClick) {
            onCardClick(opportunity);
            return;
        }
        if (session) {
            openDrawer(opportunity._id);
        } else {
            router.push(`/login?redirect=/opportunities/${opportunity._id}`);
        }
    };

    const displayDate = applicationDate ? new Date(applicationDate) : new Date(opportunity.createdAt);
    const dateLabel = applicationDate ? "Applied" : "Posted";
    const timeAgo = formatDistanceToNow(displayDate, { addSuffix: true });

    // Status visual configuration
    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Approved</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none">Pending</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Rejected</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const proposalsRange = opportunity.applicantCount !== undefined
        ? `${opportunity.applicantCount} to ${Math.max(opportunity.applicantCount + 5, 10)}`
        : "Less than 5";

    const checkScroll = () => {
        // ... existing checkScroll logic
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            const isAtStart = scrollLeft <= 5;
            const isAtEnd = Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 5;

            setCanScrollLeft(!isAtStart);
            setCanScrollRight(!isAtEnd);
        }
    };

    useEffect(() => {
        const timer = setTimeout(checkScroll, 100);
        window.addEventListener('resize', checkScroll);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', checkScroll);
        };
    }, [opportunity.category]);

    const scrollToExtreme = (direction: 'left' | 'right') => {
        const container = scrollRef.current;
        if (container) {
            const scrollTo = direction === 'left' ? 0 : container.scrollWidth;
            container.scrollTo({ left: scrollTo, behavior: 'smooth' });
            setTimeout(checkScroll, 100);
            setTimeout(checkScroll, 300);
            setTimeout(checkScroll, 600);
        }
    };

    return (
        <Card
            onClick={handleCardClick}
            className="group hover:bg-[#F9FAFB] transition-colors rounded-none border-x-0 p-0 border-t-0 border-b border-[#E9EAEB] bg-white cursor-pointer flex flex-col w-full shadow-none"
        >
            <CardContent className="px-4 py-6  flex flex-col flex-1">
                {/* Top: Posted/Applied Time & Status */}
                <div className="  flex items-center justify-between">
                    <span className="text-xs text-[#667085]">
                        {dateLabel} {timeAgo}
                    </span>
                    <div className="flex items-center gap-2">
                        {applicationStatus && getStatusBadge(applicationStatus)}
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-9 w-9 rounded-full border border-[#E9EAEB] hover:bg-white transition-colors",
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
                </div>

                {/* Title Row */}
                <div className="flex justify-between items-start ">
                    <h3 className="text-xl font-semibold text-[#101828] group-hover:text-[#1570EF] transition-colors line-clamp-2 flex-1 mr-4">
                        {opportunity.title}
                    </h3>
                </div>

                {/* Metadata Line */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-4 text-[13px] text-[#475467]">
                    <span className="font-medium">{commitmentType}</span>
                    <span className="text-[#D0D5DD]">•</span>
                    <span>Flexible</span>
                    <span className="text-[#D0D5DD]">•</span>
                    <span>Est. Time: {opportunity.commitment_type === 'regular' ? 'Long term' : 'Short term'}</span>
                </div>

                {/* Description with Expand/Collapse */}
                <div className="mb-4">
                    <p className={cn(
                        "text-base text-[#344054] leading-relaxed",
                        !isExpanded && "line-clamp-3"
                    )}>
                        {cleanDescription}
                    </p>
                    {cleanDescription.length > 200 && (
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

                {/* Skills/Categories - Flex Layout without placeholders */}
                <div className="flex items-center mb-4 gap-2">
                    {canScrollLeft && (
                        <button
                            onClick={(e) => { e.stopPropagation(); scrollToExtreme('left'); }}
                            className="flex-shrink-0 p-1 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
                        >
                            <ChevronLeft className="w-6 h-6 text-[#667085]" />
                        </button>
                    )}

                    <div
                        ref={scrollRef}
                        onScroll={checkScroll}
                        className="flex-1 flex gap-2 overflow-x-auto no-scrollbar px-1"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {opportunity.category?.map((cat, index) => (
                            <Badge
                                key={index}
                                variant="secondary"
                                className="bg-[#F2F4F7] text-[#344054] hover:bg-[#E4E7EB] border-none px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap"
                            >
                                {cat}
                            </Badge>
                        ))}
                    </div>

                    {canScrollRight && (
                        <button
                            onClick={(e) => { e.stopPropagation(); scrollToExtreme('right'); }}
                            className="flex-shrink-0 p-1 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
                        >
                            <ChevronRight className="w-6 h-6 text-[#667085]" />
                        </button>
                    )}
                </div>

                {/* Footer Row */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-2">
                    <div className="flex items-center gap-1 text-[13px] text-[#475467]">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{opportunity.location || "Australia"}</span>
                    </div>
                </div>

                {/* Proposals */}
                <div className="text-[13px] text-[#475467]">
                    Proposals: <span className="font-medium">{proposalsRange}</span>
                </div>
            </CardContent>
        </Card>
    );
}
