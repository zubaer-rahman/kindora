"use client";

import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import UserAvatar from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { MapPin, User, Heart, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface VolunteerDashboardSidebarProps {
    className?: string;
}

export default function VolunteerDashboardSidebar({ className }: VolunteerDashboardSidebarProps) {
    const { data: session } = useSession();
    const axiosAuth = useAxiosAuth();
    const { data: volunteer, isLoading: isLoadingVolunteer } = useQuery({
        queryKey: ["volunteerProfile"],
        queryFn: async () => {
            const res = await axiosAuth.get("/api/v1/volunteer-profiles/me");
            return res.data.data;
        },
    });
    const { data: applicationsData, isLoading: isLoadingApplications } = useQuery({
        queryKey: ["applications", "currentUser"],
        queryFn: async () => {
            const res = await axiosAuth.get("/api/v1/applications/me", {
                params: { page: 1, limit: 5 },
            });
            return res.data.data;
        },
    });

    if (isLoadingVolunteer || isLoadingApplications) {
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

                {/* Proposals */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-5 w-28" />
                    </div>
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index}>
                                <Skeleton className="h-4 w-full mb-2" />
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-16 rounded-full" />
                                    <Skeleton className="h-3 w-14" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
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
        <div className={cn("bg-background rounded-[24px] border border-border p-6 flex flex-col gap-6", className)}>
            {/* Volunteer Profile Section */}
            <div className="flex items-center gap-4">
                <UserAvatar user={volunteer} size={64} className="w-16 h-16 rounded-2xl" />
                <div>
                    <h3 className="text-lg font-semibold text-foreground">{volunteer.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <User className="w-3.5 h-3.5 text-primary" />
                        <span>{getStudentStatusDisplay()}</span>
                    </div>
                    {(volunteer.area || volunteer.state) && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{volunteer.area}{volunteer.area && volunteer.state ? ", " : ""}{volunteer.state}</span>
                        </div>
                    )}
                </div>
            </div>

            {volunteer.bio && (
                <p className="text-sm text-foreground line-clamp-3 leading-relaxed">
                    {volunteer.bio}
                </p>
            )}

            {/* Preferences Section */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-primary" />
                    <h3 className="text-base font-semibold text-foreground">Preferences</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {volunteer.interested_categories && volunteer.interested_categories.length > 0 ? (
                        volunteer.interested_categories.map((category: string, index: number) => (
                            <Badge
                                key={index}
                                variant="secondary"
                                className="bg-accent text-primary border-none px-3 py-1 text-xs font-medium rounded-full"
                            >
                                {category}
                            </Badge>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">No preferences set</p>
                    )}
                </div>
            </div>

            {/* Proposals Section */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-primary" />
                    <h3 className="text-base font-semibold text-foreground">My Proposals</h3>
                </div>
                <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                        {applicationsData?.applications && applicationsData.applications.length > 0 ? (
                            applicationsData.applications.map((app: any) => (
                                <div key={app._id} className="group cursor-pointer">
                                    <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                        {app.opportunity?.title || "Untitled Opportunity"}
                                    </h4>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${app.status === 'approved' ? 'bg-success/10 text-success' :
                                                app.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                                                    'bg-amber-100 text-amber-700'
                                            }`}>
                                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <div className="mt-3 border-b border-border group-last:border-none" />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-sm text-muted-foreground">No proposals yet</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
