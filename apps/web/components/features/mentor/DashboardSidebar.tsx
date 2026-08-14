"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { LayoutDashboard, Briefcase, MessageSquare, Settings } from "lucide-react";
import { profileService } from "@/services/profile.service";
import BaseDashboardSidebar from "@/components/layout/BaseDashboardSidebar";

export default function MentorDashboardSidebar() {
  const pathname = usePathname();
  const axiosAuth = useAxiosAuth();

  const { data: mentor, isLoading } = useQuery({
    queryKey: ["mentorProfile"],
    queryFn: () => profileService.getMentorProfile(axiosAuth),
  });

  const links = [
    { name: "Overview", href: "/mentor/dashboard", icon: LayoutDashboard },
    { name: "Opportunities", href: "/mentor/manage-opportunities", icon: Briefcase },
    { name: "Messages", href: "/mentor/messages", icon: MessageSquare },
    { name: "Settings", href: "/mentor/settings", icon: Settings },
  ];

  return (
    <BaseDashboardSidebar
      user={{
        name: mentor?.name,
        image: mentor?.image
      }}
      role="mentor"
      links={links}
      isLoading={isLoading}
    />
  );
}
