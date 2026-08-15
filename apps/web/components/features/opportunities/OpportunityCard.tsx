"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Opportunity } from "@/types/opportunities";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import OrganizationAvatar from "@/components/common/OrganizationAvatar";
import { useUnifiedDrawer } from "@/components/providers/UnifiedDrawerProvider";
import { useVolunteerApplication } from "@/hooks/useVolunteerApplication";
import SignupModal from "@/components/features/opportunities/SignupModal";
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
  const { openDrawer } = useUnifiedDrawer();
  const [isSignupOpen, setIsSignupOpen] = useState(false);
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
      openDrawer("opportunity", opportunity._id);
    } else {
      setIsSignupOpen(true);
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
      openDrawer("opportunity", opportunity._id);
    } else {
      setIsSignupOpen(true);
    }
  };

  return (
    <>
      <Card
        onClick={handleCardClick}
        className="hover:shadow-lg transition-shadow py-0 rounded-[12px] h-full flex flex-col cursor-pointer border-border bg-card"
      >
      <CardContent className="p-4 flex flex-col flex-1">
        {/* Logo and Organization */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0 overflow-hidden border border-border">
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
            <h4 className="text-base font-semibold text-muted-foreground truncate">
              {org?.title || "Organization"}
            </h4>
            <p className="text-xs text-muted-foreground/70">
              {opportunity.location || "Location not specified"}
            </p>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[18px] text-foreground mb-2">
          {opportunity.title}
        </h3>

        {/* Description */}
        <p className="text-base text-muted-foreground mb-[20px] line-clamp-2">
          {cleanDescription}
        </p>

        {/* Not disclosed text */}
        <p className="text-xs font-medium text-foreground mb-2">
          Not disclosed
        </p>

        {/* Details - matching the exact design */}
        <div className="flex flex-wrap items-center gap-x-1 gap-y-1 mb-4 text-xs text-muted-foreground">
          {/* Spots left - always show, even if 0 */}
          <span className="px-[6px] py-1 bg-muted rounded-full">
            {spotsAvailable} {spotsAvailable === 1 ? "spot" : "spots"} left
          </span>

          {/* Commitment type - show if available */}
          {commitmentType && (
            <span className="px-[6px] py-1 bg-muted rounded-full">
              {commitmentType}
            </span>
          )}

          {/* Date - show if available */}
          {startDate && (
            <span className="px-[6px] py-1 bg-muted rounded-full">
              {startDate}
            </span>
          )}

          {/* Work Based badge - show if workbased */}
          {isWorkBased && (
            <span className="px-[6px] py-1 bg-primary/10 rounded-full text-primary">
              Work Based
            </span>
          )}
        </div>

        {/* Apply Button - push to bottom */}
        <div className="mt-auto">
          {isApplicationLoading ? (
            <Button
              disabled
              className="bg-primary cursor-not-allowed !h-[35px] text-lg font-normal text-primary-foreground rounded-full px-[20px] h-auto w-auto opacity-70"
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
              className="bg-primary cursor-pointer !h-[35px] text-lg font-normal hover:bg-primary/90 text-primary-foreground rounded-full px-[20px] h-auto w-auto"
            >
              View roster shifts
            </Button>
          ) : isApplied ? (
            <Button
              disabled
              className="bg-success hover:bg-success/90 cursor-not-allowed !h-[35px] text-lg font-normal text-success-foreground rounded-full px-[20px] h-auto w-auto"
            >
              Applied
            </Button>
          ) : (
            <Button
              onClick={handleApplyClick}
              className="bg-primary cursor-pointer !h-[35px] text-lg font-normal hover:bg-primary/90 text-primary-foreground rounded-full px-[20px] h-auto w-auto"
            >
              Apply now
            </Button>
          )}
        </div>
      </CardContent>
      </Card>

      <SignupModal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} />
    </>
  );
}

