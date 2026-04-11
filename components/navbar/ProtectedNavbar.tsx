"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { trpc } from "@/utils/trpc";
import { UserMenu } from "@/components/navbar/UserMenu";
import { NotificationBell } from "@/components/ui/notification-bell";
import { SessionUser } from "@/types/navigation";
import { MobileMenu } from "@/components/navbar/MobileMenu";
import { isAuthPath, isProtectedPath } from "@/utils/helpers/pathCheck";
import { toast } from "react-hot-toast";
import KindoraLogo from "@/components/common/KindoraLogo";

export default function ProtectedNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isAuthenticated } = useAuthCheck();

  const authPath = isAuthPath(pathname);
  const protectedPath = isProtectedPath(pathname);

  const utils = trpc.useUtils();

  // Global message subscription to update unread counts in real-time
  trpc.messages.subscribeToMessages.useSubscription(
    { isGroup: false },
    {
      enabled: isAuthenticated,
      onData: (event) => {
        if (event.type === 'new_message' || event.type === 'message_read' || event.type === 'mention') {
          utils.messages.getConversations.invalidate();
          utils.messages.getGroups.invalidate();
          utils.notifications.getUnreadCount.invalidate();
          
          if (event.type === 'mention' && event.data.mentionData) {
            toast(`${event.data.mentionData.senderName} mentioned you!`, { icon: '🔔' });
          }
        }
      },
    }
  );

  // Fetch conversations to get total unread count (relaxed polling as fallback)
  const { data: conversations } = trpc.messages.getConversations.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchInterval: 30000, // Poll every 30 seconds as fallback
    }
  );

  // Fetch groups to get total unread count (relaxed polling as fallback)
  const { data: groups } = trpc.messages.getGroups.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: 30000, // Poll every 30 seconds as fallback
  });

  // Calculate total unread messages from both conversations and groups
  const conversationsUnreadCount =
    conversations?.reduce(
      (total, conv) => total + (conv.unreadCount || 0),
      0
    ) || 0;

  const groupsUnreadCount =
    groups?.reduce((total, group) => total + (group.unreadCount || 0), 0) || 0;

  const totalUnreadCount = conversationsUnreadCount + groupsUnreadCount;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen]);

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
    <>
      <nav className="fixed top-0 left-0 w-full flex justify-center h-[72px] z-50 bg-white border-b border-gray-200">
        <div className="max-w-[1280px] py-2 px-4   w-full flex items-center justify-between relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link
              href={
                session
                  ? session.user?.role === "volunteer"
                    ? "/find-opportunity/most-recent"
                    : session.user?.role === "mentor"
                      ? "/mentor/dashboard"
                      : "/organisation/dashboard"
                  : "/"
              }
              className="flex items-center"
            >
              <KindoraLogo className="scale-110" />
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-2">
              <NavigationMenu viewport={false}>
                <NavigationMenuList className="gap-2">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent data-[active]:bg-transparent text-sm font-medium text-gray-700 hover:text-primary transition-colors h-auto p-2">
                      {session?.user?.role === "volunteer"
                        ? "Find opportunity"
                        : session?.user?.role === "mentor"
                          ? "Find volunteers"
                          : "Find Volunteer"}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className=" p-0">
                      <ul className="grid w-[200px] gap-1  ">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href={
                                session?.user?.role === "volunteer"
                                  ? "/find-opportunity/most-recent"
                                  : session?.user?.role === "mentor"
                                    ? "/find-volunteer"
                                    : "/search/volunteers"
                              }
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 text-sm font-medium"
                            >
                              {session?.user?.role === "volunteer"
                                ? "Find Opportunity"
                                : session?.user?.role === "mentor"
                                  ? "Find Volunteers"
                                  : "Find Volunteer"}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent data-[active]:bg-transparent text-sm font-medium text-gray-700 hover:text-primary transition-colors h-auto p-2">
                      {session?.user?.role === "mentor"
                        ? "My opportunities"
                        : "Manage opportunity"}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="p-0">
                      <ul className="grid w-[200px] gap-1   ">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href={
                                session?.user?.role === "volunteer"
                                  ? "/volunteer/manage-opportunities"
                                  : session?.user?.role === "mentor"
                                    ? "/mentor/manage-opportunities"
                                    : "/organisation/opportunities"
                              }
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 text-sm font-medium"
                            >
                              {session?.user?.role === "volunteer"
                                ? "My Opportunities"
                                : session?.user?.role === "mentor"
                                  ? "My Opportunities"
                                  : "Manage Opportunities"}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        {session?.user?.role === "volunteer" && (
                          <>
                            <li>
                              <NavigationMenuLink asChild>
                                <Link
                                  href="/volunteer/manage-opportunities?tab=approved"
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 text-sm font-medium"
                                >
                                  Ongoing
                                </Link>
                              </NavigationMenuLink>
                            </li>
                            <li>
                              <NavigationMenuLink asChild>
                                <Link
                                  href="/volunteer/manage-opportunities?tab=mentor"
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 text-sm font-medium"
                                >
                                  Mentor Assignments
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          </>
                        )}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              <Link
                href={`/${session?.user?.role === "volunteer"
                  ? "volunteer"
                  : session?.user?.role === "mentor"
                    ? "mentor"
                    : "organisation"
                  }/messages`}
                className="text-sm font-medium text-gray-700 hover:text-primary transition-colors relative px-2 py-2"
              >
                Messages
                {totalUnreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center transform translate-x-1/4 -translate-y-1/4">
                    {totalUnreadCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Right Side Actions - Protected features */}
          <div className="flex items-center space-x-4">
            {/* Messages link moved to main nav */}

            <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/60 transition-colors bg-white/40">
              <NotificationBell />
            </div>

            {session?.user && <UserMenu user={session.user as SessionUser} />}

            {/* Mobile Menu Button */}
            <button
              id="hamburger-button"
              className="md:hidden p-2 rounded-md text-gray-900 hover:bg-white/20"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        isAuthPath={authPath}
        isProtectedPath={protectedPath}
        session={session}
        totalUnreadCount={totalUnreadCount}
      />
    </>
  );
}
