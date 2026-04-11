import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import UserAvatar from "@/components/ui/UserAvatar";
import { formatText } from "@/utils/helpers/formatText";
import { MapPin } from "lucide-react";
import { toTitleCase } from '@/utils/helpers/toTitleCase';

interface Volunteer {
  _id: string;
  name: string;
  image?: string;
  role: string;
  area?: string;
  state?: string;
  volunteer_profile?: {
    student_type?: "yes" | "no";
    course?: string;
    availability_date?: {
      start_date?: string;
      end_date?: string;
    };
    interested_on?: string[];
    bio?: string;
    is_available?: boolean;
  };
}

interface VolunteerCardProps {
  volunteer: Volunteer;
  onConnect: (volunteer: Volunteer) => void;
  onCardClick?: (volunteer: Volunteer) => void;
  isPublic?: boolean;
}

export default function VolunteerCard({
  volunteer,
  onConnect,
  onCardClick,
  isPublic = false,
}: VolunteerCardProps) {
  const router = useRouter();

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCardClick) {
      onCardClick(volunteer);
    } else {
      router.push(`/find-volunteer/volunteer/details/${volunteer._id}`);
    }
  };

  return (
    <Card
      className="hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden w-full h-[340px] py-0 relative bg-white border border-gray-100 flex flex-col justify-between"
      onClick={() => {
        if (onCardClick) {
          onCardClick(volunteer);
        } else {
          router.push(`/find-volunteer/volunteer/details/${volunteer._id}`);
        }
      }}
    >
      <CardContent className="p-4 flex cursor-pointer flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <UserAvatar user={volunteer} size={44} className="rounded-full w-11 h-11" />
            <div className="flex flex-col">
              <h3 className="text-base font-semibold text-gray-900 mb-0.5 line-clamp-1">{toTitleCase(volunteer.name)}</h3>
              {volunteer.volunteer_profile?.is_available ? (
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium mt-1 w-fit">✓ Available</span>
              ) : (
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium mt-1 w-fit">Unavailable</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="w-4 h-4 mr-1 text-pink-500" />
          <span className="truncate">
            {volunteer.area && volunteer.state
              ? `${formatText(volunteer.area)}, ${formatText(volunteer.state)}`
              : volunteer.state
                ? formatText(volunteer.state)
                : volunteer.area
                  ? formatText(volunteer.area)
                  : "Location not specified"}
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mb-2">
          {(() => {
            const interests = volunteer.volunteer_profile?.interested_on || [];
            const maxBadges = 3;
            const shown = interests.slice(0, maxBadges);
            const extra = interests.length - maxBadges;
            return (
              <>
                {shown.map((interest, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-normal"
                  >
                    {interest.replace(/_/g, " ")}
                  </span>
                ))}
                {extra > 0 && (
                  <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs font-normal">
                    +{extra} more
                  </span>
                )}
              </>
            );
          })()}
        </div>

        {volunteer.volunteer_profile?.bio && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {volunteer.volunteer_profile.bio}
          </p>
        )}

        <div className="flex gap-2 mt-auto w-full">
          {isPublic ? (
            <Button
              variant="default"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1 text-sm h-9 cursor-pointer"
              onClick={handleViewProfile}
            >
              View Profile
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex-1 flex items-center justify-center gap-1 text-sm h-9 border-gray-200 cursor-pointer"
                onClick={handleViewProfile}
              >
                View Profile
              </Button>
              <Button
                variant="default"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1 text-sm h-9 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onConnect(volunteer);
                }}
              >
                <MessageCircle className="h-4 w-4" />
                Send Message
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
