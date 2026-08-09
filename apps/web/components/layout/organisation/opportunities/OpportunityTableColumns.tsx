import React from "react";
import { createColumnHelper } from "@tanstack/react-table";
import type { Opportunity } from "@/types/opportunities";
import OrganizationAvatar from "@/components/ui/OrganizationAvatar";
import OpportunityActionsDropdown from "./OpportunityActionsDropdown";
import { formatTimeToAMPM } from "@/utils/helpers/formatTime";

const columnHelper = createColumnHelper<Opportunity>();

interface OpportunityTableColumnsProps {
  activeTab: string;
  onTitleClick: (opportunityId: string) => void;
  actionsMode?: "organisation" | "mentor";
}

export const createOpportunityTableColumns = ({ activeTab, onTitleClick, actionsMode = "organisation" }: OpportunityTableColumnsProps) => [
  columnHelper.display({
    id: "opportunity",
    header: () => <span>Opportunity</span>,
    cell: (info) => {
      const org = info.row.original.organization_profile;
      return (
        <div className="flex items-center gap-3 min-h-[64px]">
          <OrganizationAvatar
            organization={{
              title: org?.title || "Organization",
              profile_img: org?.profile_img,
            }}
            size={32}
            className="size-8"
          />
          <div>
            <div className="font-medium text-[15px]">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTitleClick(info.row.original._id);
                }}
                className="text-left hover:text-[#246BFD] hover:scale-105 transition-all duration-200 cursor-pointer"
              >
                {info.row.original.title}
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-[#246BFD]">
                {org?.title || "Organization"}
              </span>
              <span className="text-gray-400">•</span>
              <span>
                Posted –{" "}
                {new Date(info.row.original.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "startDateTime",
    header: () => <span>Start Date & Time</span>,
    cell: (info) => {
      const opportunity = info.row.original;
      if (!opportunity.date?.start_date) {
        return (
          <div className="w-full text-center text-gray-400">Not set</div>
        );
      }

      const startDate = new Date(opportunity.date.start_date);
      const formattedDate = startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      return (
        <div className="w-full text-center">
          <div className="text-sm font-medium">{formattedDate}</div>
          <div className="text-xs text-gray-500">
            {opportunity.time?.start_time
              ? formatTimeToAMPM(opportunity.time.start_time)
              : "Time TBD"}
          </div>
        </div>
      );
    },
  }),
  columnHelper.accessor("applicantCount", {
    header: "Applicants",
    cell: (info) => (
      <div className="w-full text-center">{info.getValue() || 0}</div>
    ),
  }),
  columnHelper.accessor("recruitCount", {
    header: "Recruits",
    cell: (info) => (
      <div className="w-full text-center">{info.getValue() || 0}</div>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    cell: (info) => (
      <div className="w-[60px] text-center">
        <OpportunityActionsDropdown
          opportunityId={info.row.original._id}
          activeTab={activeTab}
          className="ml-auto"
          actionsMode={actionsMode}
        />
      </div>
    ),
  }),
];
