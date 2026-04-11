"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { ApplyButton } from "@/components/buttons/ApplyButton";
import { FavoriteButton } from "@/components/buttons/FavoriteButton";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { trpc } from "@/utils/trpc";
import fileIcon from "../../../../public/icons/file-icon.svg";
import mapPinIcon from "../../../../public/icons/map-pin-icon.svg";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { formatTimeToAMPM } from "@/utils/helpers/formatTime";
import OrganizationAvatar from "@/components/ui/OrganizationAvatar";

export type OpportunityDetails = {
  id: string;
  title: string;
  organization: {
    title: string;
    id: string;
  };
  location: string;
};

interface OpportunityData {
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
    title: string;
    profile_img?: string;
  };
  created_by?: {
    _id: string;
    name: string;
  };
  recurrence?: {
    date_range: {
      start_date: Date;
      end_date?: Date;
    };
  };
  spotsAvailable?: number;
  formattedDates?: {
    start_date: string;
    end_date?: string;
  };
  [key: string]: unknown; // Allow additional properties from tRPC response
}

export default function Categories() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const { data: session } = useSession();
  const volunteerId = session?.user?.id;

  // Fetch all opportunities
  const { data: opportunitiesData } = trpc.opportunities.getAllOpportunities.useQuery({
    page: 1,
    limit: 50,
  });

  // Fetch all applications to calculate available spots
  const { data: applications } = trpc.applications.getVolunteerApplications.useQuery(
    volunteerId!,
    { enabled: !!volunteerId }
  );

  // Fetch user's favorite opportunities
  const { data: favoriteOpportunities } = trpc.volunteers.getFavoriteOpportunities.useQuery();

  // Calculate available spots for each opportunity
  const opportunitiesWithSpots = opportunitiesData?.opportunities?.map((opportunity) => {
    const opp = opportunity as unknown as OpportunityData;
    const appliedCount = (applications as Array<{ opportunity: string; status: string }> | undefined)?.filter(
      (app) =>
        app.opportunity === opp._id.toString() &&
        (app.status === 'pending' || app.status === 'approved')
    ).length || 0;

    const spotsAvailable = Math.max(0, opp.number_of_volunteers - appliedCount);

    // Format dates if they exist
    const formattedDates = opp.recurrence?.date_range ? {
      start_date: format(new Date(opp.recurrence.date_range.start_date), 'MMM d'),
      end_date: opp.recurrence.date_range.end_date ? format(new Date(opp.recurrence.date_range.end_date), 'MMM d') : undefined
    } : undefined;

    return {
      ...opp,
      spotsAvailable,
      formattedDates
    };
  }) || [];

  const filteredOpportunities = activeTab === "favorites"
    ? opportunitiesWithSpots.filter((opp) =>
      favoriteOpportunities?.some(fav => fav.opportunity === opp._id.toString())
    )
    : opportunitiesWithSpots;

  return (
    <section className="w-full md:w-[57%] relative">
      <h1 className="text-[#101010] font-inter text-xxl font-bold text-center mt-8 mb-5">
        Volunteering Opportunities
      </h1>

      <Tabs defaultValue="all" className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="all"
            onClick={() => setActiveTab("all")}
          >
            All Opportunities
          </TabsTrigger>
          <TabsTrigger
            value="favorites"
            onClick={() => setActiveTab("favorites")}
          >
            Favorites ({favoriteOpportunities?.length || 0})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-6">
        {filteredOpportunities.map((opportunity) => (
          <Card
            key={opportunity._id}
            className="rounded-lg overflow-hidden w-full py-0 h-[340px] cursor-pointer hover:shadow-lg transition-shadow relative"
            onClick={() =>
              router.push(`/find-opportunity/opportunity/details/${opportunity._id}`)
            }
          >
            <CardContent className="px-4 pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <OrganizationAvatar
                    organization={{
                      title: opportunity?.organization_profile?.title || "Organization",
                      profile_img: opportunity?.organization_profile?.profile_img
                    }}
                    size={40}
                  />
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-gray-600">
                      <Users className="h-5 w-5 mr-1" />
                      <span className="text-sm">
                        <span className="font-medium text-green-600">
                          {opportunity.spotsAvailable}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {opportunity.number_of_volunteers}
                        </span>{" "}
                        spots left
                      </span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold line-clamp-1">
                  {opportunity.title}
                </h3>

                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Image
                      src={mapPinIcon}
                      height={16}
                      width={16}
                      className="mr-1"
                      alt="Map pin icon"
                    />
                    <span className="">{opportunity.location}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Image
                      src={fileIcon}
                      height={16}
                      width={16}
                      className="mr-1"
                      alt="File icon"
                    />
                    <p className="text-sm text-gray-500">
                      {opportunity.commitment_type === "workbased"
                        ? "Work based"
                        : "Event based"}
                    </p>
                  </div>
                  {opportunity.formattedDates && (
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="text-sm text-gray-500">
                        {opportunity.formattedDates.start_date}
                        {opportunity.formattedDates.end_date ? ` - ${opportunity.formattedDates.end_date}` : ''}
                      </span>
                    </div>
                  )}
                  {!opportunity.formattedDates && opportunity.date?.start_date && (
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="text-sm text-gray-500">
                        {format(new Date(opportunity.date.start_date), 'MMM d')} at {opportunity.time?.start_time ? formatTimeToAMPM(opportunity.time.start_time) : 'Time TBD'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {opportunity.category.slice(0, 1).map((category: string, idx: number) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="text-sm bg-[#F0F0F0] rounded-[4px] font-normal"
                    >
                      {category}
                    </Badge>
                  ))}
                  {opportunity.category.length > 1 && (
                    <Badge
                      variant="secondary"
                      className="text-sm bg-[#F0F0F0] rounded-[4px] font-normal text-gray-500"
                    >
                      +{opportunity.category.length - 1} more
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  <div
                    className="text-sm text-gray-600 line-clamp-3 overflow-hidden"
                    dangerouslySetInnerHTML={{
                      __html: opportunity.description.replace(/<[^>]*>/g, ''),
                    }}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="absolute bottom-0 left-0 right-0 flex items-center px-4 pb-5">
              <div onClick={(e) => e.stopPropagation()} className="flex items-center  gap-2">
                <div onClick={(e) => e.stopPropagation()}>
                  <ApplyButton
                    opportunityId={opportunity._id.toString()}
                    opportunityDetails={{
                      id: opportunity._id.toString(),
                      title: opportunity.title,
                      organization: {
                        title: opportunity.organization_profile?.title || "",
                        id: opportunity.organization_profile?._id || "",
                      },
                      location: opportunity.location,
                    }}
                    opportunityDate={opportunity.date}
                  />
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <FavoriteButton opportunityId={opportunity._id} />
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
