"use client";

import { trpc } from "@/utils/trpc";
import { useSession } from "next-auth/react";
import UserAvatar from "@/components/ui/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { MapPin, User, Heart, FileText } from "lucide-react";
import Loading from "@/app/loading";

export default function VolunteerDashboardSidebar() {
    const { data: session } = useSession();
    const { data: volunteer, isLoading: isLoadingVolunteer } = trpc.volunteers.getVolunteerProfile.useQuery();
    const { data: applicationsData, isLoading: isLoadingApplications } = trpc.applications.getCurrentUserApplications.useQuery({
        page: 1,
        limit: 5,
    });

    if (isLoadingVolunteer || isLoadingApplications) {
        return (
            <div className="w-full lg:w-[350px] space-y-6">
                <div className="h-[200px] bg-gray-100 animate-pulse rounded-2xl" />
                <div className="h-[150px] bg-gray-100 animate-pulse rounded-2xl" />
                <div className="h-[250px] bg-gray-100 animate-pulse rounded-2xl" />
            </div>
        );
    }

    if (!volunteer) return null;

    const getStudentStatusDisplay = () => {
        if (volunteer.is_currently_studying === "yes") {
            return "Currently Studying";
        } else if (volunteer.is_currently_studying === "no") {
            if (volunteer.non_student_type === "staff") return "Staff Member";
            if (volunteer.non_student_type === "alumni") return "Alumni";
            if (volunteer.non_student_type === "general") return "General Public";
            return "Not Currently Studying";
        }
        return volunteer.student_type === "yes" ? "Student" : "Non-Student";
    };

    return (
        <div className="w-full lg:w-[350px] flex flex-col gap-6">
            {/* Volunteer Profile Section */}
            <div className="bg-[#F5FAFF] rounded-[24px] p-6 border border-[#E9EAEB]">
                <div className="flex items-center gap-4 mb-6">
                    <UserAvatar user={volunteer} size={64} className="w-16 h-16 rounded-2xl" />
                    <div>
                        <h3 className="text-lg font-semibold text-[#0A0D12]">{volunteer.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-[#6A7282] mt-1">
                            <User className="w-3.5 h-3.5" />
                            <span>{getStudentStatusDisplay()}</span>
                        </div>
                        {(volunteer.area || volunteer.state) && (
                            <div className="flex items-center gap-1 text-sm text-[#6A7282] mt-0.5">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{volunteer.area}{volunteer.area && volunteer.state ? ", " : ""}{volunteer.state}</span>
                            </div>
                        )}
                    </div>
                </div>

                {volunteer.bio && (
                    <div className="mt-4">
                        <p className="text-sm text-[#414651] line-clamp-3 leading-relaxed">
                            {volunteer.bio}
                        </p>
                    </div>
                )}
            </div>

            {/* Preferences Section */}
            <div className="bg-white rounded-[24px] p-6 border border-[#E9EAEB]">
                <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-[#1570EF]" />
                    <h3 className="text-base font-semibold text-[#0A0D12]">Preferences</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {volunteer.interested_categories && volunteer.interested_categories.length > 0 ? (
                        volunteer.interested_categories.map((category: string, index: number) => (
                            <Badge
                                key={index}
                                variant="secondary"
                                className="bg-[#F5FAFF] text-[#1570EF] border-none px-3 py-1 text-xs font-medium rounded-full"
                            >
                                {category}
                            </Badge>
                        ))
                    ) : (
                        <p className="text-sm text-[#6A7282]">No preferences set</p>
                    )}
                </div>
            </div>

            {/* Proposals Section */}
            <div className="bg-white rounded-[24px] p-6 border border-[#E9EAEB] flex-1">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-[#1570EF]" />
                    <h3 className="text-base font-semibold text-[#0A0D12]">My Proposals</h3>
                </div>
                <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                        {applicationsData?.applications && applicationsData.applications.length > 0 ? (
                            applicationsData.applications.map((app: any) => (
                                <div key={app._id} className="group cursor-pointer">
                                    <h4 className="text-sm font-medium text-[#0A0D12] group-hover:text-[#1570EF] transition-colors line-clamp-1">
                                        {app.opportunity?.title || "Untitled Opportunity"}
                                    </h4>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${app.status === 'approved' ? 'bg-green-50 text-green-700' :
                                                app.status === 'rejected' ? 'bg-red-50 text-red-700' :
                                                    'bg-yellow-50 text-yellow-700'
                                            }`}>
                                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                        </span>
                                        <span className="text-[10px] text-[#6A7282]">
                                            {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <div className="mt-3 border-b border-[#E9EAEB] group-last:border-none" />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-sm text-[#6A7282]">No proposals yet</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
