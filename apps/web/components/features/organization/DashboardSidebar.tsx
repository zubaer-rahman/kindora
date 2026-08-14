"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { LayoutDashboard, Briefcase, MessageSquare, Settings } from "lucide-react";
import { profileService } from "@/services/profile.service";
import BaseDashboardSidebar from "@/components/layout/BaseDashboardSidebar";

export default function OrganisationDashboardSidebar() {
  const pathname = usePathname();
  const axiosAuth = useAxiosAuth();

  const { data: organisation, isLoading } = useQuery({
    queryKey: ["organisationProfile"],
    queryFn: () => profileService.getOrganizationProfile(axiosAuth),
  });

  const links = [
    { name: "Overview", href: "/organisation/dashboard", icon: LayoutDashboard },
    { name: "Opportunities", href: "/organisation/opportunities", icon: Briefcase },
    { name: "Messages", href: "/organisation/messages", icon: MessageSquare },
    { name: "Settings", href: "/organisation/settings", icon: Settings },
  ];

  return (
    <BaseDashboardSidebar
      user={{
        name: organisation?.name,
        image: organisation?.image
      }}
      role="organisation"
      links={links}
      isLoading={isLoading}
    />
  );
}
