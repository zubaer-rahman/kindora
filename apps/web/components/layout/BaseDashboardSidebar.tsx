"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserAvatar from "@/components/common/UserAvatar";
import { User, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarLink {
  name: string;
  href: string;
  icon: LucideIcon;
}

export interface BaseDashboardSidebarProps {
  user: {
    name?: string;
    image?: string;
  } | null;
  role: string;
  links: SidebarLink[];
  isLoading?: boolean;
  className?: string;
  navigationTitle?: string;
}

export default function BaseDashboardSidebar({
  user,
  role,
  links,
  isLoading = false,
  className,
  navigationTitle = "Navigation",
}: BaseDashboardSidebarProps) {
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className={cn("w-full lg:w-[350px] flex flex-col gap-6", className)}>
        <div className="h-[200px] bg-muted animate-pulse rounded-[24px]" />
        <div className="h-[250px] bg-muted animate-pulse rounded-[24px]" />
      </div>
    );
  }

  return (
    <div className={cn("w-full lg:w-[350px] flex flex-col gap-6", className)}>
      {/* Profile Card */}
      <div className="bg-accent rounded-[24px] p-6 border border-border">
        <div className="flex items-center gap-4 mb-4">
          <UserAvatar
            user={{ name: user?.name || role, image: user?.image }}
            size={64}
            className="w-16 h-16 rounded-2xl"
          />
          <div>
            <h3 className="text-lg font-semibold text-foreground capitalize">
              {user?.name || role}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 capitalize">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>{role} Account</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Card */}
      <div className="bg-background rounded-[24px] p-6 border border-border">
        <h3 className="text-base font-semibold text-foreground mb-4">
          {navigationTitle}
        </h3>
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
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-primary-foreground" : "text-primary"
                  }`}
                />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
