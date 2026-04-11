"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Opportunity } from "@/types/opportunities";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import OrganizationAvatar from "@/components/ui/OrganizationAvatar";
import { useOpportunityDrawer } from "./OpportunityDrawerProvider";
import { useVolunteerApplication } from "@/hooks/useVolunteerApplication";
import { Loader2 } from "lucide-react";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onCardClick?: () => void;
  onApplyClick?: () => void;
}

export default function OpportunityCard({
  opportunity,
  onCardClick,
  onApplyClick
}: OpportunityCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { openDrawer } = useOpportunityDrawer();
  const { isApplied, isLoading: isApplicationLoading, applicationStatus } =
    useVolunteerApplication(opportunity._id);

  // Format date helper
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return null;
    try {
      return format(new Date(date), "MMM d");
    } catch {
      return null;
    }
  };

  // Format commitment type
  const formatCommitmentType = (type: string | undefined) => {
    if (!type) return "";
    const typeMap: Record<string, string> = {
      workbased: "Work Based",
      eventbased: "Event Based",
      oneoff: "One off - an event",
      regular: "Regular",
    };
    return typeMap[type] || type;
  };

  // Calculate spots available
  const getSpotsAvailable = (opportunity: Opportunity) => {
    const spotsLeft =
      opportunity.number_of_volunteers - (opportunity.applicantCount || 0);
    return Math.max(0, spotsLeft);
  };

  const spotsAvailable = getSpotsAvailable(opportunity);
  const org = opportunity.organization_profile;
  const startDate = formatDate(opportunity.date?.start_date);
  const commitmentType = formatCommitmentType(opportunity.commitment_type);
  const isWorkBased = opportunity.commitment_type === "workbased" || opportunity.commitment_type === "regular";

  // Clean description - remove HTML tags and extra whitespace
  const cleanDescription = (opportunity.description || "No description available.")
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .trim();

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick();
      return;
    }
    if (session) {
      // Open drawer instead of navigating
      openDrawer(opportunity._id);
    } else {
      router.push(`/login?redirect=/opportunities/${opportunity._id}`);
    }
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from firing
    if (onApplyClick) {
      onApplyClick();
      return;
    }
    if (session) {
      // Open drawer instead of navigating
      openDrawer(opportunity._id);
    } else {
      router.push(`/login?redirect=/opportunities/${opportunity._id}`);
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      style={{
        border: "1px solid rgba(164, 167, 174, 0.20) !important",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.10)",
      }}
      className="hover:shadow-lg transition-shadow py-0 rounded-[12px] h-full flex flex-col cursor-pointer"
    >
      <CardContent className="p-4 flex flex-col flex-1">
        {/* Logo and Organization */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
            <OrganizationAvatar
              organization={{
                title: org?.title || "Organization",
                profile_img: org?.profile_img,
              }}
              size={48}
              className="w-[48px] h-[48px]"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-[#414651] truncate">
              {org?.title || "Organization"}
            </h4>
            <p className="text-xs text-[#A4A7AE]">
              {opportunity.location || "Australia"}
            </p>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[18px] text-[#414651] mb-2">
          {opportunity.title}
        </h3>

        {/* Description */}
        <p className="text-base text-[#717680] mb-[20px] line-clamp-2">
          {cleanDescription}
        </p>

        {/* Not disclosed text */}
        <p className="text-xs font-medium text-[#414651] mb-2">
          Not disclosed
        </p>

        {/* Details - matching the exact design */}
        <div className="flex flex-wrap items-center gap-x-1 gap-y-1 mb-4 text-xs text-[#717680]">
          {/* Spots left - always show, even if 0 */}
          <span className="px-[6px] py-1 bg-[#FAFAFA] rounded-full">
            {spotsAvailable} {spotsAvailable === 1 ? "spot" : "spots"} left
          </span>

          {/* Commitment type - show if available */}
          {commitmentType && (
            <span className="px-[6px] py-1 bg-[#FAFAFA] rounded-full">
              {commitmentType}
            </span>
          )}

          {/* Date - show if available */}
          {startDate && (
            <span className="px-[6px] py-1 bg-[#FAFAFA] rounded-full">
              {startDate}
            </span>
          )}

          {/* Work Based badge - show if workbased */}
          {isWorkBased && (
            <span className="px-[6px] py-1 bg-[#EFF8FF] rounded-full text-[#1447E6]">
              Work Based
            </span>
          )}
        </div>

        {/* Apply Button - push to bottom */}
        <div className="mt-auto">
          {isApplicationLoading ? (
            <Button
              disabled
              className="bg-[#1570EF] cursor-not-allowed !h-[35px] text-lg font-normal text-[#F5FAFF] rounded-full px-[20px] h-auto w-auto opacity-70"
            >
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </Button>
          ) : applicationStatus === "approved" ? (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/opportunities/${opportunity._id}?tab=roster`);
              }}
              className="bg-[#1570EF] cursor-pointer !h-[35px] text-lg font-normal hover:bg-[#1d4ed8] text-[#F5FAFF] rounded-full px-[20px] h-auto w-auto"
            >
              View roster shifts
            </Button>
          ) : isApplied ? (
            <Button
              disabled
              className="bg-green-600 hover:bg-green-700 cursor-not-allowed !h-[35px] text-lg font-normal text-white rounded-full px-[20px] h-auto w-auto"
            >
              Applied
            </Button>
          ) : (
            <Button
              onClick={handleApplyClick}
              className="bg-[#1570EF] cursor-pointer !h-[35px] text-lg font-normal hover:bg-[#1d4ed8] text-[#F5FAFF] rounded-full px-[20px] h-auto w-auto"
            >
              Apply now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

