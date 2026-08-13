"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import UserAvatar from "@/components/ui/UserAvatar";
import { Users, BarChart3, ShieldAlert } from "lucide-react";

export default function SystemAdminDashboardSidebar() {
  const pathname = usePathname();
  const axiosAuth = useAxiosAuth();

  const { data: user, isLoading } = useQuery({
    queryKey: ["userMe"],
    queryFn: async () => {
      const res = await axiosAuth.get("/api/v1/users/me");
      return res.data.data;
    },
  });

  const links = [
    { name: "User Management", href: "/system-admin/dashboard", icon: Users },
    { name: "Platform Analytics", href: "/system-admin/analytics", icon: BarChart3 },
  ];

  if (isLoading) {
    return (
      <div className="bg-accent rounded-xl border border-border overflow-hidden w-full h-full flex flex-col animate-pulse">
        <div className="p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        </div>
        <div className="border-t border-border bg-background p-6 flex-1">
          <div className="h-5 w-28 bg-muted rounded mb-4" />
          <div className="flex flex-col gap-2">
            <div className="h-[44px] w-full bg-muted rounded-lg" />
            <div className="h-[44px] w-full bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-accent rounded-xl border border-border overflow-hidden w-full h-full flex flex-col">
      <div className="p-6 flex items-center gap-4">
        <UserAvatar user={{ name: user?.name || "System Admin", image: user?.image }} size={64} className="w-16 h-16 rounded-xl" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">{user?.name || "System Admin"}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <ShieldAlert className="w-3.5 h-3.5 text-primary" />
            <span>System Admin</span>
          </div>
        </div>
      </div>
      <div className="border-t border-border bg-background p-6 flex-1">
        <h3 className="text-base font-semibold text-foreground mb-4">Admin Tools</h3>
        <nav className="flex flex-col gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
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
