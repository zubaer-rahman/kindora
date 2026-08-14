"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { LayoutDashboard, Briefcase, MessageSquare, Settings } from "lucide-react";
import { profileService } from "@/services/profile.service";
import BaseDashboardSidebar from "@/components/layout/BaseDashboardSidebar";

export default function VolunteerDashboardSidebar() {
  const pathname = usePathname();
  const axiosAuth = useAxiosAuth();

  const { data: volunteer, isLoading } = useQuery({
    queryKey: ["volunteerProfile"],
    queryFn: () => profileService.getVolunteerProfile(axiosAuth),
  });

  const links = [
    { name: "Overview", href: "/volunteer/dashboard", icon: LayoutDashboard },
    { name: "Opportunities", href: "/volunteer/manage-opportunities", icon: Briefcase },
    { name: "Messages", href: "/volunteer/messages", icon: MessageSquare },
    { name: "Settings", href: "/volunteer/settings", icon: Settings },
  ];

  return (
    <BaseDashboardSidebar
      user={{
        name: volunteer?.name,
        image: volunteer?.image
      }}
      role="volunteer"
      links={links}
      isLoading={isLoading}
    />
  );
}
