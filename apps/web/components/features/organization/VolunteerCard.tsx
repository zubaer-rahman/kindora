import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UserAvatar from "@/components/common/UserAvatar";
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

  return (
    <Card
      className="hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden w-full h-[340px] py-0 relative bg-card border border-border text-card-foreground flex flex-col justify-between"
      onClick={(e) => {
        e.preventDefault();
        if (onCardClick) {
          onCardClick(volunteer);
        } else {
          const targetUrl = `/find-volunteer/volunteer/details/${volunteer._id || (volunteer as any).id}`;

          router.push(targetUrl);
        }
      }}
    >
      <CardContent className="p-4 flex cursor-pointer flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <UserAvatar user={volunteer} size={44} className="rounded-full w-11 h-11" />
            <div className="flex flex-col">
              <h3 className="text-base font-semibold text-foreground mb-0.5 line-clamp-1">{toTitleCase(volunteer.name)}</h3>
              {volunteer.volunteer_profile?.is_available ? (
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-xs font-medium mt-1 w-fit">✓ Available</span>
              ) : (
                <span className="bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-full text-xs font-medium mt-1 w-fit">Unavailable</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <MapPin className="w-4 h-4 mr-1 text-pink-500 flex-shrink-0" />
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
                    className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs font-normal"
                  >
                    {interest.replace(/_/g, " ")}
                  </span>
                ))}
                {extra > 0 && (
                  <span className="bg-muted text-muted-foreground/80 px-2 py-0.5 rounded-full text-xs font-normal">
                    +{extra} more
                  </span>
                )}
              </>
            );
          })()}
        </div>

        {volunteer.volunteer_profile?.bio && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {volunteer.volunteer_profile.bio}
          </p>
        )}

        <div className="flex gap-2 mt-auto w-full">
          {isPublic ? (
            <Button
              variant="default"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-1 text-sm h-9 cursor-pointer"
              asChild
            >
              <Link 
                href={`/find-volunteer/volunteer/details/${volunteer._id || (volunteer as any).id}`}
                onClick={(e) => e.stopPropagation()}
              >
                View Profile
              </Link>
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex-1 flex items-center justify-center gap-1 text-sm h-9 border-border cursor-pointer"
                asChild
              >
                <Link 
                  href={`/find-volunteer/volunteer/details/${volunteer._id || (volunteer as any).id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  View Profile
                </Link>
              </Button>
              <Button
                variant="default"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-1 text-sm h-9 cursor-pointer"
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
