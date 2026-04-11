"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Users, MapPin } from "lucide-react";

interface MentorOpportunityCardProps {
    opportunity: any;
}

export function MentorOpportunityCard({ opportunity }: MentorOpportunityCardProps) {
    const router = useRouter();
    const { data: session } = useSession();

    const handleCardClick = () => {
        if (session) {
            router.push(`/volunteer/mentor-opportunity/${opportunity._id}`);
        } else {
            router.push(`/login?redirect=/volunteer/mentor-opportunity/${opportunity._id}`);
        }
    };

    return (
        <Card
            onClick={handleCardClick}
            className="group hover:bg-[#F9FAFB] transition-colors rounded-none border-x-0 p-0 border-t-0 border-b border-[#E9EAEB] bg-white cursor-pointer flex flex-col w-full shadow-none"
        >
            <CardContent className="px-4 py-6 flex flex-col flex-1">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-[#667085]">
                        Posted {formatDistanceToNow(new Date(opportunity.createdAt), { addSuffix: true })}
                    </span>
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none">
                        <Users className="w-3 h-3 mr-1" />
                        Mentor
                    </Badge>
                </div>

                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-[#101828] group-hover:text-[#1570EF] transition-colors line-clamp-2 flex-1 mr-4">
                        {opportunity.title}
                    </h3>
                </div>

                {opportunity.organization_profile && (
                    <div className="mb-3">
                        <span className="text-sm font-semibold text-[#1570EF]">
                            {(opportunity.organization_profile as { title?: string })?.title || "Organization"}
                        </span>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-4 text-[13px] text-[#475467]">
                    <span className="font-medium">{opportunity.commitment_type || "N/A"}</span>
                    <span className="text-[#D0D5DD]">•</span>
                    <span>Flexible</span>
                    <span className="text-[#D0D5DD]">•</span>
                    <span>
                        Est. Time:{" "}
                        {opportunity.commitment_type === "regular" ? "Long term" : "Short term"}
                    </span>
                </div>

                <div className="mb-4">
                    <p className="text-base text-[#344054] leading-relaxed line-clamp-3">
                        {(opportunity.description || "No description available.")
                            .replace(/<[^>]*>/g, "")
                            .replace(/&nbsp;/g, " ")
                            .trim()}
                    </p>
                </div>

                <div className="flex items-center mb-6 gap-2">
                    <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar px-1">
                        {opportunity.category?.slice(0, 3).map((cat: string, index: number) => (
                            <Badge
                                key={index}
                                variant="secondary"
                                className="bg-[#F2F4F7] text-[#344054] hover:bg-[#E4E7EB] border-none px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap"
                            >
                                {cat}
                            </Badge>
                        ))}
                        {opportunity.category && opportunity.category.length > 3 && (
                            <Badge
                                variant="secondary"
                                className="bg-[#F2F4F7] text-[#344054] border-none px-3 py-1 text-xs font-medium rounded-full"
                            >
                                +{opportunity.category.length - 3} more
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-2">
                    <div className="flex items-center gap-1 text-[13px] text-[#475467]">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{opportunity.location || "Australia"}</span>
                    </div>
                </div>

                <div className="text-[13px] text-[#475467]">Click to manage volunteers</div>
            </CardContent>
        </Card>
    );
}
