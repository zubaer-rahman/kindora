"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { Heart, MapPin, Globe, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Image from "next/image";
import { profileService } from "@/services/profile.service";
import { useUnifiedDrawer } from "@/components/providers/UnifiedDrawerProvider";
import OrganizationAvatar from "@/components/common/OrganizationAvatar";

interface OrganizationCardProps {
    organisation: any;
    onCardClick?: (organisation: any) => void;
}

export default function OrganizationCard({
    organisation,
    onCardClick
}: OrganizationCardProps) {
    const router = useRouter();
    const { openDrawer } = useUnifiedDrawer();
    const { data: session } = useSession();
    const [isExpanded, setIsExpanded] = useState(false);
    const axiosAuth = useAxiosAuth();
    const queryClient = useQueryClient();

    const { data: favoriteData } = useQuery({
        queryKey: ["organizationFavoriteStatus", organisation._id],
        queryFn: () => profileService.getFavoriteStatus(axiosAuth, organisation._id),
        enabled: !!session?.user && !!organisation._id,
    });

    const toggleFavoriteMutation = useMutation({
        mutationFn: (payload: { organizationId: string }) =>
            profileService.toggleFavorite(axiosAuth, payload.organizationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["organizationFavoriteStatus", organisation._id] });
            queryClient.invalidateQueries({ queryKey: ["favoriteOrganizations"] });
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
        openDrawer("organization", organisation._id);
    };

    const cleanBio = (organisation.bio || "No description available.")
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();

    return (
        <Card
            onClick={handleCardClick}
            className="group hover:bg-muted/50 transition-colors rounded-none border-x-0 p-0 border-t-0 border-b border-border bg-background cursor-pointer flex flex-col w-full shadow-none"
        >
            <CardContent className="px-4 py-6 flex flex-col flex-1">
                {/* Top Row: Logo and Actions */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0">
                            <OrganizationAvatar 
                                organization={organisation} 
                                size={48} 
                                shape="rounded"
                                objectFit="cover"
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {organisation.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Badge variant="outline" className="capitalize">
                                    {organisation.type?.replace('_', ' ')}
                                </Badge>
                                {organisation.website && (
                                    <div className="flex items-center gap-1">
                                        <Globe className="w-3 h-3" />
                                        <span className="truncate max-w-[150px]">
                                            {organisation.website.replace(/^https?:\/\//, '')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-9 w-9 rounded-full border border-border hover:bg-background transition-colors flex-shrink-0",
                            isFavorite && "bg-destructive/10 border-destructive/20"
                        )}
                        onClick={handleFavoriteClick}
                    >
                        <Heart
                            className={cn(
                                "w-4 h-4 transition-colors",
                                isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"
                            )}
                        />
                    </Button>
                </div>

                {/* Bio Section */}
                <div className="mb-4">
                    <p className={cn(
                        "text-base text-foreground leading-relaxed",
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
                            className="text-primary text-sm font-medium mt-1 hover:underline"
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
                            className="bg-muted text-foreground hover:bg-muted/80 border-none px-3 py-1 text-xs font-medium rounded-full"
                        >
                            {type}
                        </Badge>
                    ))}
                    {organisation.opportunity_types?.length > 4 && (
                        <span className="text-xs text-muted-foreground self-center">
                            +{organisation.opportunity_types.length - 4} more
                        </span>
                    )}
                </div>

                {/* Footer Metadata */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{organisation.area}, {organisation.state}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        <span>{organisation.opportunityCount || 0} active opportunities</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
