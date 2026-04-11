"use client";

import { Separator } from "@/components/ui/separator";
import { MapPin, Globe } from "lucide-react";
import { IOpportunity } from "@/server/db/interfaces/opportunity";
import OrganizationAvatar from "@/components/ui/OrganizationAvatar";
import { formatText } from "@/utils/helpers/formatText";
import { IOrgnizationPofile } from "@/server/db/interfaces/organization-profile";

interface SidebarProps {
  opportunity: IOpportunity & {
    organization_profile: IOrgnizationPofile;
  };
}

export function Sidebar({ opportunity }: SidebarProps) {
  return (
    <div className="w-[300px]">
      {/* Organization Logo at Top */}
      <div className="py-4 rounded-lg mb-4">
        <div className="flex flex-col items-center text-center">
          <OrganizationAvatar
            organization={{
              title: opportunity.organization_profile.title ?? "",
              profile_img: opportunity.organization_profile.profile_img
            }}
            size={80}
            className="rounded-full mb-3"
          />
          <h3 className="font-semibold text-lg">{opportunity.organization_profile.title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {opportunity.organization_profile.bio || "Organization"}
          </p>
        </div>
      </div>

      <Separator />

      {/* <div className="py-4 rounded-lg mb-4 space-y-3 gap-y-3">
        {opportunity.date?.start_date && (
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <span className="font-medium">Start Date:</span>
              <span className="ml-2">
                {new Date(opportunity.date.start_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <span className="font-medium">Start Time:</span>
              <span className="ml-2">{formatTimeToAMPM(opportunity.time?.start_time || '')}</span>
            </div>
          </div>
        )}
      </div> */}

      <Separator />

      <div className="py-4 rounded-lg">
        <h3 className="font-semibold mb-3 text-center">Organisation Information</h3>
        <div className="space-y-3 text-center">
          {/* {opportunity.organization_profile.contact_email && (
            <div className="flex items-center justify-center text-sm">
              <Mail className="w-4 h-4 mr-2 text-gray-500" />
              <span>{opportunity.organization_profile.contact_email}</span>
            </div>
          )}
          
          {opportunity.organization_profile.phone_number && (
            <div className="flex items-center justify-center text-sm">
              <Phone className="w-4 h-4 mr-2 text-gray-500" />
              <span>{opportunity.organization_profile.phone_number}</span>
            </div>
          )} */}
          
          {opportunity.organization_profile.website && (
            <div className="flex items-center justify-center text-sm">
              <Globe className="w-4 h-4 mr-2 text-gray-500" />
              <a 
                href={opportunity.organization_profile.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {opportunity.organization_profile.website}
              </a>
            </div>
          )}
          
          {opportunity.organization_profile.area && (
            <div className="flex items-start justify-center text-sm">
              <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
              <span>{formatText(opportunity.organization_profile.area, opportunity.organization_profile.state)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
