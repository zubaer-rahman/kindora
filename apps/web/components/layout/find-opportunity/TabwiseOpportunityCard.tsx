"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  Clock as ClockIcon,
  XCircle,
  Users,
} from "lucide-react";
import { formatTimeToAMPM } from "@/utils/helpers/formatTime";
import { Opportunity } from "@/types/opportunities";
import OrganizationAvatar from "@/components/ui/OrganizationAvatar";

interface Application {
  _id: string;
  status: "pending" | "approved" | "rejected";
  opportunity: {
    _id: string;
    title: string;
    description: string;
    category: string[];
    location: string;
    commitment_type: string;
    organization_profile?: {
      _id: string;
      title: string;
      profile_img?: string;
    };
    createdAt: string;
    date?: {
      start_date?: string;
      end_date?: string;
    };
    time?: {
      start_time?: string;
      end_time?: string;
    };
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface TabwiseOpportunityCardProps {
  item: Application | Opportunity;
  type: "application" | "opportunity";
  tabType: "active" | "recent" | "mentor" | "favorites";
}

export default function TabwiseOpportunityCard({
  item,
  type,
  tabType,
}: TabwiseOpportunityCardProps) {
  const router = useRouter();

  const isApplication = type === "application";
  const application = isApplication ? (item as Application) : null;
  const opportunity = isApplication
    ? application?.opportunity
    : (item as Opportunity);

  if (!opportunity) return null;

  const getBadgeConfig = () => {
    if (tabType === "mentor") {
      return {
        className: "bg-purple-100 text-purple-700 border-purple-200",
        icon: <Users className="h-3 w-3 mr-1" />,
        text: "Mentor",
      };
    }

    if (tabType === "favorites") {
      const now = new Date();
      const startDate = opportunity.date?.start_date ? new Date(opportunity.date.start_date) : null;
      const endDate = opportunity.date?.end_date ? new Date(opportunity.date.end_date) : null;

      // Check if opportunity is open (hasn't started yet)
      if (startDate && startDate > now) {
        return {
          className: "bg-green-100 text-green-700 border-green-200",
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          text: "Open",
        };
      }

      // Check if opportunity is closed (has ended)
      if (startDate && startDate < now && endDate && endDate < now) {
        return {
          className: "bg-gray-100 text-gray-700 border-gray-200",
          icon: <XCircle className="h-3 w-3 mr-1" />,
          text: "Closed",
        };
      }

      // If no specific date, consider it open
      if (!startDate) {
        return {
          className: "bg-green-100 text-green-700 border-green-200",
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          text: "Open",
        };
      }

      // For ongoing opportunities (has started but not ended)
      return {
        className: "bg-blue-100 text-blue-700 border-blue-200",
        icon: <ClockIcon className="h-3 w-3 mr-1" />,
        text: "Ongoing",
      };
    }

    if (tabType === "recent") {
      const isCompleted = application?.status === "approved";
      return {
        className: isCompleted
          ? "bg-green-100 text-green-700 border-green-200"
          : "bg-gray-100 text-gray-700 border-gray-200",
        icon: isCompleted ? (
          <CheckCircle className="h-3 w-3 mr-1" />
        ) : (
          <XCircle className="h-3 w-3 mr-1" />
        ),
        text: isCompleted ? "Completed" : "Not completed",
      };
    }

    // Active tab - dynamic based on application status
    if (application) {
      const statusConfig = {
        approved: {
          className: "bg-green-100 text-green-700 border-green-200",
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          text: "Approved",
        },
        pending: {
          className: "bg-yellow-100 text-yellow-700 border-yellow-200",
          icon: <ClockIcon className="h-3 w-3 mr-1" />,
          text: "Pending",
        },
        rejected: {
          className: "bg-red-100 text-red-700 border-red-200",
          icon: <XCircle className="h-3 w-3 mr-1" />,
          text: "Rejected",
        },
      };
      return statusConfig[application.status];
    }

    return {
      className: "bg-blue-100 text-blue-700 border-blue-200",
      icon: <CheckCircle className="h-3 w-3 mr-1" />,
      text: "Active",
    };
  };

  const getTimestampText = () => {
    if (tabType === "mentor") {
      return "Posted";
    }
    if (tabType === "favorites") {
      return "Saved";
    }
    if (tabType === "recent") {
      return "Applied";
    }
    return "Applied";
  };

  const badgeConfig = getBadgeConfig();

  return (
    <div
      className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow relative h-[300px] cursor-pointer"
      onClick={() =>
        router.push(`/opportunities/${opportunity._id}`)
      }
    >
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div className="w-14 h-14 mr-3 flex-shrink-0">
              <OrganizationAvatar
                organization={{
                  title: opportunity?.organization_profile?.title || "Organization",
                  profile_img: opportunity?.organization_profile?.profile_img
                }}
                size={56}
                className="w-full h-full"
              />
            </div>
            <h3 className="text-lg font-semibold hover:text-blue-600 line-clamp-2 flex-1 min-w-0">
              {opportunity.title}
            </h3>
          </div>
          <Badge className={badgeConfig.className}>
            {badgeConfig.icon}
            {badgeConfig.text}
          </Badge>
        </div>

        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin className="w-4 h-4 mr-1 text-blue-500" />
          <span>{opportunity.location}</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          <Badge variant="outline" className="px-2 py-0.5 text-xs border-blue-200 text-blue-700 bg-blue-50">
            {opportunity.commitment_type === "workbased"
              ? "Work based"
              : "Event based"}
          </Badge>
          {opportunity.category
            ?.slice(0, 1)
            .map((cat: string, index: number) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs font-normal"
              >
                {cat}
              </Badge>
            ))}
          {opportunity.category && opportunity.category.length > 1 && (
            <Badge
              variant="secondary"
              className="text-xs font-normal text-gray-500"
            >
              +{opportunity.category.length - 1} more
            </Badge>
          )}
        </div>

        <div className="flex-1">
          <div
            className="text-sm text-gray-600 line-clamp-3"
            dangerouslySetInnerHTML={{
              __html: opportunity.description,
            }}
          />
        </div>

        <div className="mt-auto pt-4">
          <div className="text-xs text-gray-500 mb-2">
            {getTimestampText()}{" "}
            {formatDistanceToNow(
              new Date(
                isApplication ? application!.createdAt : opportunity.createdAt
              ),
              {
                addSuffix: true,
              }
            )}
          </div>
          {opportunity.date?.start_date && (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(opportunity.date.start_date).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                }
              )}
              {opportunity.time?.start_time && (
                <>
                  <Clock className="h-3 w-3 ml-2" />
                  {formatTimeToAMPM(opportunity.time.start_time)}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
