import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { formatTimeToAMPM } from "@/utils/helpers/formatTime";
import OrganizationAvatar from "@/components/ui/OrganizationAvatar";

type Opportunity = {
  _id: string;
  title: string;
  description: string;
  category: string[];
  required_skills: string[];
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
    name: string;
    profile_img?: string;
  };
  created_by?: {
    _id: string;
    name: string;
  };
  banner_img?: string;
};

export function Sidebar({ opportunity }: { opportunity: Opportunity }) {
  return (
    <div className="w-[350px] space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <OrganizationAvatar
            organization={{
              title: opportunity?.organization_profile?.name || "Organization",
              profile_img: opportunity?.organization_profile?.profile_img
            }}
            size={48}
            className="w-12 h-12"
          />
          <div>
            <h3 className="font-semibold">{opportunity.organization_profile.name}</h3>
            <p className="text-sm text-gray-500">
              {opportunity.commitment_type === 'workbased' ? 'Work based' : 'Event based'} Opportunity
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-1">Location</h4>
            <p className="text-sm text-gray-600">{opportunity.location}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Available Spots</h4>
            <p className="text-sm text-gray-600">{opportunity.number_of_volunteers} spots</p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Start Date</h4>
            <p className="text-sm text-gray-600">
              {new Date(opportunity.date.start_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Start Time</h4>
            <p className="text-sm text-gray-600">{formatTimeToAMPM(opportunity.time.start_time)}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
                      <Link href={`/view-profile/organisation/details/${opportunity.organization_profile._id}`}>
            <Button variant="outline" className="w-full">
              View Organization Profile
            </Button>
          </Link>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Similar Opportunities</h3>
        <div className="space-y-3">
          {/* Similar opportunities will be populated dynamically */}
          <p className="text-sm text-gray-600">No similar opportunities found.</p>
        </div>
      </Card>
    </div>
  );
}