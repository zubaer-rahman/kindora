"use client";

import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import UserAvatar from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { profileService } from "@/services/profile.service";

interface MentorFindSidebarProps {
    className?: string;
}

export default function MentorFindSidebar({ className }: MentorFindSidebarProps) {
    const { data: session } = useSession();
    const axiosAuth = useAxiosAuth();
    const { data: mentor, isLoading } = useQuery({
        queryKey: ["mentorProfile"],
        queryFn: () => profileService.getMentorProfile(axiosAuth),
    });

    if (isLoading) {
        return (
            <div className={cn("bg-background rounded-[24px] border border-border p-6", className)}>
                {/* Profile */}
                <div className="flex items-center gap-4 mb-6">
                    <Skeleton className="w-16 h-16 rounded-2xl" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-3.5 w-20" />
                    </div>
                </div>

                {/* Bio */}
                <div className="space-y-2 mb-6">
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-2/3" />
                </div>

                {/* Preferences */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-5 w-28" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!mentor) return null;

    const getStudentStatusDisplay = () => {
        if (mentor.is_currently_studying === "yes") {
            return "Currently Studying";
        } else if (mentor.is_currently_studying === "no") {
            if (mentor.non_student_type === "staff") return "Staff Member";
            if (mentor.non_student_type === "alumni") return "Alumni";
            if (mentor.non_student_type === "general_public") return "General Public";
            return "Not Currently Studying";
        }
        return mentor.student_type === "yes" ? "Student" : "Non-Student";
    };

    return (
        <div className={cn("bg-background rounded-[24px] border border-border p-6 flex flex-col gap-6", className)}>
            {/* Profile Section */}
            <div className="flex items-center gap-4">
                <UserAvatar user={{ name: mentor.name || "Mentor", image: mentor.profile_img }} size={64} className="w-16 h-16 rounded-2xl" />
                <div>
                    <h3 className="text-lg font-semibold text-foreground">{mentor.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <User className="w-3.5 h-3.5 text-primary" />
                        <span>{getStudentStatusDisplay()}</span>
                    </div>
                    {(mentor.area || mentor.state) && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{mentor.area}{mentor.area && mentor.state ? ", " : ""}{mentor.state}</span>
                        </div>
                    )}
                </div>
            </div>

            {mentor.bio && (
                <p className="text-sm text-foreground line-clamp-3 leading-relaxed">
                    {mentor.bio}
                </p>
            )}

            {/* Preferences Section */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-primary" />
                    <h3 className="text-base font-semibold text-foreground">Interests</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {mentor.interested_categories && mentor.interested_categories.length > 0 ? (
                        mentor.interested_categories.map((category: string, index: number) => (
                            <Badge
                                key={index}
                                variant="secondary"
                                className="bg-accent text-primary border-none px-3 py-1 text-xs font-medium rounded-full"
                            >
                                {category}
                            </Badge>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">No interests set</p>
                    )}
                </div>
            </div>
        </div>
    );
}
