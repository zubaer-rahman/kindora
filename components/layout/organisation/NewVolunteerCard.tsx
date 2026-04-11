import { Card, CardContent } from "@/components/ui/card";
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
        skills?: string[];
    };
}

interface NewVolunteerCardProps {
    volunteer: Volunteer;
    onConnect: (volunteer: Volunteer) => void;
}

export default function NewVolunteerCard({
    volunteer,
    onConnect,
}: NewVolunteerCardProps) {
    const router = useRouter();

    return (
        <Card
            className="group hover:bg-[#F9FAFB] transition-colors rounded-none border-x-0 p-0 border-t-0 border-b border-[#E9EAEB] bg-white cursor-pointer flex flex-col w-full shadow-none"
        >
            <CardContent className="px-4 py-6 flex flex-col flex-1">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Left: Avatar */}
                    <div className="flex-shrink-0">
                        <UserAvatar user={volunteer} size={64} className="w-16 h-16 rounded-full" />
                    </div>

                    {/* Right: Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-xl font-semibold text-[#101828] group-hover:text-[#1570EF] transition-colors cursor-pointer" onClick={() => router.push(`/find-volunteer/volunteer/details/${volunteer._id}`)}>
                                        {toTitleCase(volunteer.name)}
                                    </h3>
                                    {volunteer.volunteer_profile?.is_available && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                                            Open to Volunteer
                                        </span>
                                    )}
                                </div>
                                <p className="text-base text-[#344054] font-medium mt-1">
                                    {volunteer.volunteer_profile?.course || "Volunteer"}
                                </p>
                                <div className="flex items-center text-[13px] text-[#475467] mt-1">
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
                            </div>

                            <div className="flex-shrink-0">
                                <Button
                                    className="bg-[#1570EF] hover:bg-[#1056b3] text-white font-medium rounded-full px-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#1570EF]"
                                    onClick={() => onConnect(volunteer)}
                                    disabled={!volunteer.volunteer_profile?.is_available}
                                >
                                    Message
                                </Button>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4 mt-4">
                            {(() => {
                                const interests = volunteer.volunteer_profile?.interested_on || [];
                                const maxBadges = 5;
                                const shown = interests.slice(0, maxBadges);
                                const extra = interests.length - maxBadges;
                                return (
                                    <>
                                        {shown.map((interest, idx) => (
                                            <span
                                                key={idx}
                                                className="bg-[#F2F4F7] text-[#344054] hover:bg-[#E4E7EB] border-none px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                                            >
                                                {interest.replace(/_/g, " ")}
                                            </span>
                                        ))}
                                        {extra > 0 && (
                                            <span className="bg-[#F2F4F7] text-[#344054] px-3 py-1 rounded-full text-xs font-medium">
                                                +{extra}
                                            </span>
                                        )}
                                    </>
                                );
                            })()}
                        </div>

                        {/* Description */}
                        {volunteer.volunteer_profile?.bio && (
                            <p className="text-base text-[#344054] line-clamp-2 leading-relaxed">
                                {volunteer.volunteer_profile.bio}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
