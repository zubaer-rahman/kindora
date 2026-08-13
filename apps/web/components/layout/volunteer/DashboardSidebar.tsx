"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import UserAvatar from "@/components/ui/UserAvatar";
import { LayoutDashboard, Briefcase, MessageSquare, Settings, User } from "lucide-react";

export default function VolunteerDashboardSidebar() {
  const pathname = usePathname();
  const axiosAuth = useAxiosAuth();

  const { data: volunteer, isLoading } = useQuery({
    queryKey: ["volunteerProfile"],
    queryFn: async () => {
      const res = await axiosAuth.get("/api/v1/users/me/volunteer-profile");
      return res.data.data;
    },
  });

  const links = [
    { name: "Overview", href: "/volunteer/dashboard", icon: LayoutDashboard },
    { name: "Opportunities", href: "/volunteer/manage-opportunities", icon: Briefcase },
    { name: "Messages", href: "/volunteer/messages", icon: MessageSquare },
    { name: "Settings", href: "/volunteer/settings", icon: Settings },
  ];

  if (isLoading) {
    return (
      <div className="w-full lg:w-[350px] flex flex-col gap-6">
        <div className="h-[200px] bg-muted animate-pulse rounded-[24px]" />
        <div className="h-[250px] bg-muted animate-pulse rounded-[24px]" />
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[350px] flex flex-col gap-6">
      {/* Profile Card */}
      <div className="bg-accent rounded-[24px] p-6 border border-border">
        <div className="flex items-center gap-4 mb-4">
          <UserAvatar user={{ name: volunteer?.name || "Volunteer", image: volunteer?.image }} size={64} className="w-16 h-16 rounded-2xl" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">{volunteer?.name || "Volunteer"}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>Volunteer Account</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Card */}
      <div className="bg-background rounded-[24px] p-6 border border-border">
        <h3 className="text-base font-semibold text-foreground mb-4">Navigation</h3>
        <nav className="flex flex-col gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
