import React from "react";
import { Calendar, Users, UserCheck } from "lucide-react";
import type { Opportunity } from "@/types/opportunities";
import OrganizationAvatar from "@/components/ui/OrganizationAvatar";
import OpportunityActionsDropdown from "./OpportunityActionsDropdown";
import { formatTimeToAMPM } from "@/utils/helpers/formatTime";

interface OpportunityMobileCardProps {
  opportunity: Opportunity;
  activeTab: string;
}

export default function OpportunityMobileCard({ opportunity, activeTab }: OpportunityMobileCardProps) {
  const org = opportunity.organization_profile;
  const startDate = opportunity.date?.start_date
    ? new Date(opportunity.date.start_date)
    : null;
  const formattedDate = startDate?.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <OrganizationAvatar
            organization={{
              title: org?.title || "Organization",
              profile_img: org?.profile_img,
            }}
            size={40}
            className="size-10 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-gray-900 break-words leading-tight mb-1">
              {opportunity.title}
            </h3>
            <p className="text-sm text-[#246BFD] font-medium truncate">
              {org?.title || "Organization"}
            </p>
          </div>
        </div>
        <OpportunityActionsDropdown
          opportunityId={opportunity._id}
          activeTab={activeTab}
          size="sm"
          className="shrink-0"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-gray-500 text-xs">Start Date</p>
            <p className="font-medium text-sm">
              {formattedDate || "Not set"}
            </p>
            {opportunity.time?.start_time && (
              <p className="text-xs text-gray-400">
                {formatTimeToAMPM(opportunity.time.start_time)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Users className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-gray-500 text-xs">Applicants</p>
            <p className="font-medium text-sm">
              {opportunity.applicantCount || 0}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <UserCheck className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-gray-500 text-xs">Recruits</p>
            <p className="font-medium text-sm">
              {opportunity.recruitCount || 0}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="w-4 h-4 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-gray-500 text-xs">Posted</p>
            <p className="font-medium text-sm">
              {new Date(opportunity.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
