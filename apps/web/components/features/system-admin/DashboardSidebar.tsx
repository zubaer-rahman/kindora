"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { Users, BarChart3 } from "lucide-react";
import { userService } from "@/services/user.service";
import BaseDashboardSidebar from "@/components/layout/BaseDashboardSidebar";

export default function SystemAdminDashboardSidebar() {
  const pathname = usePathname();
  const axiosAuth = useAxiosAuth();

  const { data: user, isLoading } = useQuery({
    queryKey: ["userMe"],
    queryFn: () => userService.getMe(axiosAuth),
  });

  const links = [
    { name: "User Management", href: "/system-admin/dashboard", icon: Users },
    { name: "Platform Analytics", href: "/system-admin/analytics", icon: BarChart3 },
  ];

  return (
    <BaseDashboardSidebar
      user={{
        name: user?.name,
        image: user?.image
      }}
      role="system-admin"
      links={links}
      isLoading={isLoading}
      navigationTitle="Admin Tools"
      className="h-full"
    />
  );
}
