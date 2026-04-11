"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { trpc } from "@/utils/trpc";
import {
  AUTH_PATHS,
  PROTECTED_PATHS,
  PUBLIC_NAV_OPTIONS,
} from "@/utils/constants/navigation";
import { MobileMenu } from "@/components/navbar/MobileMenu";
import { TopBar } from "@/components/navbar/TopBar";

export default function TopNavigationBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isAuthenticated } = useAuthCheck();

  const isAuthPath = AUTH_PATHS.some((path) => pathname?.includes(path));
  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname?.includes(path)
  );
  const isResetPasswordPath = pathname?.endsWith("reset-password");

  // Fetch conversations to get total unread count with polling
  const { data: conversations } = trpc.messages.getConversations.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchInterval: 5000, // Poll every 5 seconds for new conversations
    }
  );

  // Fetch groups to get total unread count with polling
  const { data: groups } = trpc.messages.getGroups.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchInterval: 5000, // Poll every 5 seconds for new groups
    }
  );

  // Calculate total unread messages from both conversations and groups
  const conversationsUnreadCount = conversations?.reduce(
    (total, conv) => total + (conv.unreadCount || 0),
    0
  ) || 0;

  const groupsUnreadCount = groups?.reduce(
    (total, group) => total + (group.unreadCount || 0),
    0
  ) || 0;

  const totalUnreadCount = conversationsUnreadCount + groupsUnreadCount;

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle navigation visibility
  useEffect(() => {
    setShowNav(!isProtectedPath || (isProtectedPath && isAuthenticated));
  }, [isProtectedPath, isAuthenticated]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const mobileMenu = document.getElementById("mobile-menu");
      const hamburgerButton = document.getElementById("hamburger-button");

      if (
        mobileMenu &&
        hamburgerButton &&
        !mobileMenu.contains(event.target as Node) &&
        !hamburgerButton.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div>
     

      <TopBar
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        showNav={showNav}
        isAuthPath={isAuthPath}
        isProtectedPath={isProtectedPath}
        isResetPasswordPath={isResetPasswordPath}
        session={session}
        totalUnreadCount={totalUnreadCount}
      />
      <MobileMenu
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        isAuthPath={isAuthPath}
        isProtectedPath={isProtectedPath}
        session={session}
        totalUnreadCount={totalUnreadCount}
      />
       {!isAuthPath && !isProtectedPath && !isResetPasswordPath && (
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-1 px-4">
          <div className="container mx-auto flex justify-end space-x-4 text-sm">
            {PUBLIC_NAV_OPTIONS.map((option, index) => (
              <Link key={index} href={option.href} className={option.className}>
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}