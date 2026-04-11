"use client";

import { PostSidebar } from "../../shared/PostSidebar";
import { PostContent } from "./PostContent";

type Opportunity = {
  _id: string;
  title: string;
  description: string;
  category: string[];
  required_skills: string[];
  requirements?: string[];
  commitment_type: string;
  location: string;
  number_of_volunteers: number;
  date: {
    start_date: Date;
    end_date?: Date;
  };
  time: {
    start_time: string;
    end_time?: string;
  };
  organization_profile: {
    _id: string;
    title: string;
    profile_img?: string;
    contact_email?: string;
    phone_number?: string;
    website?: string;
    area?: string;
    state?: string;
    bio?: string;
  };
  created_by?: {
    _id: string;
    name: string;
  };
  banner_img?: string;
  external_event_link?: string;
  email_contact?: string;
  phone_contact?: string;
  createdAt: Date;
};

interface OpportunityDetailProps {
  opportunity: Opportunity;
  userRole?: "volunteer" | "organisation";
}

export function OpportunityDetail({ opportunity }: OpportunityDetailProps) {
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <PostContent opportunity={opportunity} />
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block w-[1px] bg-gray-200"></div>
        <div className="lg:w-[350px] lg:flex-shrink-0">
          <PostSidebar
            organization_profile={
              opportunity.organization_profile as unknown as import("@/server/db/interfaces/organization-profile").IOrgnizationPofile
            }
            userRole="volunteer"
          />
        </div>
      </div>
    </div>
  );
}
