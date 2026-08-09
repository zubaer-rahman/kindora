"use client";

import { FavoriteButton } from "@/components/buttons/FavoriteButton";
import { ApplyButton } from "@/components/buttons/ApplyButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Opportunity } from "@/types/opportunities";
import {
  MapPin,
  Users,
  Calendar,
  Clock,
  Star,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import OrganizationAvatar from "@/components/ui/OrganizationAvatar";

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const router = useRouter();
  const spotsLeft =
    opportunity.number_of_volunteers - (opportunity.applicantCount || 0);
  const isUrgent = spotsLeft <= 2;
  const isPopular =
    (opportunity.applicantCount || 0) > opportunity.number_of_volunteers * 0.7;

  const handleCardClick = () => {
    router.push(`/find-opportunity/opportunity/details/${opportunity._id}`);
  };

  // Convert 24-hour format to 12-hour format
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  // Prepare opportunity details for ApplyButton
  const opportunityDetails = {
    id: opportunity._id,
    title: opportunity.title,
    organization: {
      title: opportunity.organization_profile?.title || "",
      id: opportunity.organization_profile?._id || "",
    },
    location: opportunity.location,
  };

  return (
    <Card
      className="group hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden w-full h-[380px] py-0 cursor-pointer relative bg-white border border-gray-100 hover:border-blue-200"
      onClick={handleCardClick}
    >
      <CardContent className="p-4 flex flex-col h-full space-y-3">
        {/* Title and Favorite Button Row */}
        <div className="flex justify-between items-start   flex-shrink-0">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors flex-1 pr-2">
            {opportunity.title
              ? opportunity.title.charAt(0).toUpperCase() +
                opportunity.title.slice(1)
              : "Untitled Opportunity"}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isPopular && (
              <div className="flex items-center gap-1 text-amber-600">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-xs font-medium hidden sm:inline">
                  Popular
                </span>
              </div>
            )}
            <div onClick={(e) => e.stopPropagation()}>
              <FavoriteButton opportunityId={opportunity._id} />
            </div>
          </div>
        </div>

        {/* Posted by section */}
        <div className="flex items-center gap-2   flex-shrink-0">
          <div className="p-1.5 bg-blue-50 rounded-lg flex-shrink-0">
            <OrganizationAvatar
              organization={{
                title:
                  opportunity?.organization_profile?.title || "Organization",
                profile_img: opportunity?.organization_profile?.profile_img,
              }}
              size={28}
              className="w-7 h-7"
            />
          </div>
          <div className="text-sm text-gray-600 min-w-0">
            <span className="text-gray-500 text-xs">Posted by: </span>
            <Link
              href={`/view-profile/organisation/details/${opportunity.organization_profile?._id}`}
              className="text-blue-600 font-medium hover:text-blue-800 transition-colors block truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {opportunity.organization_profile?.title}
            </Link>
          </div>
        </div>

        {/* Location and Spots */}
        <div className="space-y-1.5   flex-shrink-0">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <span className="text-sm font-medium truncate">
              {opportunity.location}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
            <span
              className={`text-sm font-medium ${
                isUrgent ? "text-red-600" : "text-green-600"
              }`}
            >
              {spotsLeft} spots left
            </span>
            {isUrgent && (
              <Badge
                variant="destructive"
                className="text-xs px-1 py-0 h-4 ml-2"
              >
                Urgent
              </Badge>
            )}
          </div>
        </div>

        {/* Categories */}
        {(() => {
          const categories = opportunity.category || [];
          const visibleCategories = categories.slice(0, 2);
          const hiddenCount = categories.length - 2;

          return (
            <div className="flex flex-wrap gap-1.5 flex-shrink-0">
              {visibleCategories.map((category, idx) => (
                <span
                  key={idx}
                  className="bg-blue-50 text-blue-700 px-3 py-0.5 rounded-full text-xs font-medium border border-blue-100 max-w-[160px] truncate"
                  title={category}
                >
                  {category}
                </span>
              ))}
              {hiddenCount > 0 && (
                <span className="bg-gray-50 text-gray-600 px-3 py-0.5 rounded-full text-xs font-medium border border-gray-100 max-w-[110px] truncate">
                  +{hiddenCount} more
                </span>
              )}
            </div>
          );
        })()}

        {/* Description */}
        <div className="text-sm text-gray-600 line-clamp-2 leading-relaxed flex-shrink-0">
          {opportunity.description ? (
            <div
              dangerouslySetInnerHTML={{ __html: opportunity.description }}
            />
          ) : (
            <span className="text-gray-400 italic">
              No description available
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="!mt-auto flex-shrink-0">
          {/* Date, Time and Type - Always on same line */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-3">
              {opportunity.date?.start_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-500" />
                  <span className="font-medium">
                    {format(new Date(opportunity.date.start_date), "MMM d")}
                  </span>
                </div>
              )}
              {opportunity.time?.start_time && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-500" />
                  <span className="font-medium">
                    {formatTime(opportunity.time.start_time)}
                  </span>
                </div>
              )}
            </div>
            <Badge
              variant="outline"
              className="text-xs font-medium w-fit border-blue-200 text-blue-700 bg-blue-50"
            >
              {opportunity.commitment_type === "workbased"
                ? "Work Based"
                : "Event Based"}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex  gap-2">
            <div onClick={(e) => e.stopPropagation()} className="flex-1">
              <Link
                href={`/find-opportunity/opportunity/details/${opportunity._id}`}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 block flex items-center justify-center gap-2"
              >
                <span className="whitespace-nowrap">View Details</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <ApplyButton
                opportunityId={opportunity._id}
                opportunityDetails={opportunityDetails}
                opportunityDate={opportunity.date}
                className="bg-blue-500 hover:bg-blue-600 text-white h-10 px-4 rounded-lg text-sm font-medium min-w-[100px]"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
