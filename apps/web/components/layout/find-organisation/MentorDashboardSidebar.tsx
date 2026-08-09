"use client";

import Link from "next/link";
import { trpc } from "@/utils/trpc";
import UserAvatar from "@/components/ui/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Heart, AlertCircle } from "lucide-react";

const isPlaceholder = (val: string | undefined): boolean =>
    !val || val.trim() === "" || val.trim().toLowerCase() === "to be updated";

export default function MentorDashboardSidebar() {
    const { data: mentor, isLoading: isLoadingMentor } = trpc.mentorProfile.getMentorProfile.useQuery();

    if (isLoadingMentor) {
        return (
            <div className="w-full lg:w-[320px] space-y-6">
                <div className="h-[200px] bg-gray-100 animate-pulse rounded-2xl" />
                <div className="h-[150px] bg-gray-100 animate-pulse rounded-2xl" />
            </div>
        );
    }

    if (!mentor) return null;

    const areaCompleted = !isPlaceholder(mentor.area);
    const stateCompleted = !isPlaceholder(mentor.state);
    const locationCompleted = areaCompleted || stateCompleted;
    const profileIncomplete = !locationCompleted;

    const getStudentStatusDisplay = (): string => {
        if (mentor.is_currently_studying === "yes") return "Currently Studying";
        if (mentor.is_currently_studying === "no") {
            if (mentor.non_student_type === "staff") return "Staff Member";
            if (mentor.non_student_type === "alumni") return "Alumni";
            if (mentor.non_student_type === "general_public" || mentor.non_student_type === "general") return "General Public";
            return "Not Currently Studying";
        }
        return mentor.student_type === "yes" ? "Student" : "Non-Student";
    };

    const studentStatus = getStudentStatusDisplay();
    const showStudentStatus = mentor.is_currently_studying === "yes" || mentor.is_currently_studying === "no";

    return (
        <div className="w-full lg:w-[320px] flex flex-col gap-6">
            {/* Mentor Profile Section */}
            <div className="bg-[#F5FAFF] rounded-[24px] p-6 border border-[#E9EAEB]">
                {profileIncomplete && (
                    <Link
                        href="/mentor/settings"
                        className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm"
                    >
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Complete your profile so volunteers and organisations can find you.</span>
                    </Link>
                )}
                <div className="flex items-center gap-4 mb-6">
                    <UserAvatar user={mentor} size={64} className="w-16 h-16 rounded-2xl" />
                    <div>
                        <h3 className="text-lg font-semibold text-[#0A0D12]">{mentor.name}</h3>
                        {!profileIncomplete && showStudentStatus && (
                            <div className="flex items-center gap-1 text-sm text-[#6A7282] mt-1">
                                <User className="w-3.5 h-3.5" />
                                <span>{studentStatus}</span>
                            </div>
                        )}
                        {!profileIncomplete && locationCompleted && (
                            <div className="flex items-center gap-1 text-sm text-[#6A7282] mt-0.5">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>
                                    {[mentor.area, mentor.state].filter((v) => !isPlaceholder(v)).join(", ")}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {mentor.bio && mentor.bio.trim() !== "" && (
                    <div className="mt-4">
                        <p className="text-sm text-[#414651] line-clamp-3 leading-relaxed">
                            {mentor.bio}
                        </p>
                    </div>
                )}
            </div>

            {/* Post Opportunity Button */}
            <div className="bg-white rounded-[24px] p-6 border border-[#E9EAEB]">
                <a
                    href="/mentor/opportunities/create"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#1570EF] hover:bg-[#1266D9] text-white font-semibold py-3 px-4 rounded-xl transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Post an Opportunity
                </a>
            </div>

            {/* Preferences Section */}
            <div className="bg-white rounded-[24px] p-6 border border-[#E9EAEB]">
                <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-[#1570EF]" />
                    <h3 className="text-base font-semibold text-[#0A0D12]">Interests</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {mentor.interested_on && mentor.interested_on.length > 0 ? (
                        mentor.interested_on.map((category: string, index: number) => (
                            <Badge
                                key={index}
                                variant="secondary"
                                className="bg-[#F5FAFF] text-[#1570EF] border-none px-3 py-1 text-xs font-medium rounded-full"
                            >
                                {category}
                            </Badge>
                        ))
                    ) : (
                        <p className="text-sm text-[#6A7282]">No interests set</p>
                    )}
                </div>
            </div>
        </div>
    );
}
