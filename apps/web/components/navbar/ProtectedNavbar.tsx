"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { UserMenu } from "@/components/navbar/UserMenu";
import { NotificationBell } from "@/components/ui/notification-bell";
import { SessionUser } from "@/types/navigation";
import { MobileMenu } from "@/components/navbar/MobileMenu";
import { isAuthPath, isProtectedPath } from "@/utils/helpers/pathCheck";
import { toast } from "react-hot-toast";
import KindoraLogo from "@/components/features/common/KindoraLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function ProtectedNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isAuthenticated } = useAuthCheck();

  const authPath = isAuthPath(pathname);
  const protectedPath = isProtectedPath(pathname);

  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  // Global message subscription to update unread counts in real-time via SSE
  useEffect(() => {
    if (!isAuthenticated || !(session?.user as any)?.api_token) return;

    const controller = new AbortController();
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    let buffer = "";
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const handleEvent = (event: {
      type: string;
      data?: {
        mentionData?: { senderName: string; roomId: string; isGroup: boolean };
      };
    }) => {
      if (event.type === 'new_message' || event.type === 'message_read' || event.type === 'mention') {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        queryClient.invalidateQueries({ queryKey: ["groups"] });
        queryClient.invalidateQueries({ queryKey: ["notificationsUnreadCount"] });

        if (event.type === 'mention' && event.data?.mentionData) {
          toast(`${event.data.mentionData.senderName} mentioned you!`, { icon: '🔔' });
        }
      }
    };

    const connect = async () => {
      try {
        const response = await fetch(`${baseURL}/api/v1/stream/messages`, {
          headers: { Authorization: `Bearer ${(session?.user as any)?.api_token}` },
          signal: controller.signal,
        });
        if (!response.ok || !response.body) return;
        reader = response.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";
          for (const chunk of parts) {
            const dataLines = chunk.split("\n").filter((l) => l.startsWith("data: "));
            for (const line of dataLines) {
              try {
                handleEvent(JSON.parse(line.slice(6)));
              } catch {
                // ignore malformed events
              }
            }
          }
        }
      } catch (error) {
        if ((error as any)?.name === "AbortError") return;
        // Connection dropped; effect cleanup re-runs will reconnect
      }
    };

    connect();

    return () => {
      controller.abort();
      reader?.cancel().catch(() => undefined);
    };
  }, [isAuthenticated, session, queryClient]);

  // Fetch conversations to get total unread count (relaxed polling as fallback)
  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await axiosAuth.get("/api/v1/messages/conversations");
      return res.data.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: 30000, // Poll every 30 seconds as fallback
  });

  // Fetch groups to get total unread count (relaxed polling as fallback)
  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const res = await axiosAuth.get("/api/v1/messages/groups");
      return res.data.data;
    },
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

  const userRole = (session?.user as any)?.role;
  const isSystemAdmin = userRole === "system_admin";
  const normalizedRole =
    userRole === "organization" || userRole === "admin" ? "organisation" : userRole;

  const isFindActive =
    (normalizedRole === "volunteer" && pathname.startsWith("/find-opportunity")) ||
    (normalizedRole === "mentor" && pathname.startsWith("/find-volunteer")) ||
    (normalizedRole === "organisation" && pathname.startsWith("/search/volunteers"));

  const isManageActive =
    (normalizedRole === "volunteer" && pathname.startsWith("/volunteer/manage-opportunities")) ||
    (normalizedRole === "mentor" && pathname.startsWith("/mentor/manage-opportunities")) ||
    (normalizedRole === "organisation" && pathname.startsWith("/organisation/opportunities"));

  const isDashboardActive = normalizedRole === "organisation" && pathname.startsWith("/organisation/dashboard");

  const messagesPath =
    normalizedRole === "volunteer"
      ? "/volunteer/messages"
      : normalizedRole === "mentor"
        ? "/mentor/messages"
        : "/organisation/messages";
  const isMessagesActive = pathname === messagesPath || pathname.startsWith(messagesPath + "/");

  return (
    <>
      <nav className="fixed top-0 left-0 w-full flex justify-center h-[72px] z-50 bg-background border-b border-border">
        <div className={`${isSystemAdmin ? "" : "max-w-[1280px]"} py-2 px-4 w-full flex items-center justify-between relative z-10`}>
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link
              href={
                isSystemAdmin
                  ? "/system-admin/dashboard"
                  : session
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

             {!isSystemAdmin && (
               <div className="hidden md:flex items-center space-x-2">
                 {normalizedRole === "organisation" && (
                   <Link
                     href="/organisation/dashboard"
                     className={`text-sm font-medium transition-colors px-2 py-2 ${isDashboardActive ? "text-primary border-b-2 border-primary rounded-none" : "text-foreground hover:text-primary"}`}
                   >
                     Dashboard
                   </Link>
                 )}
                 <NavigationMenu viewport={false}>
                  <NavigationMenuList className="gap-2">
                    <NavigationMenuItem>
                       <NavigationMenuTrigger className={`bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent data-[active]:bg-transparent text-sm font-medium transition-colors h-auto p-2 ${isFindActive ? "text-primary border-b-2 border-primary rounded-none" : "text-foreground hover:text-primary"}`}>
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
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground text-sm font-medium"
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
                       <NavigationMenuTrigger className={`bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent data-[active]:bg-transparent text-sm font-medium transition-colors h-auto p-2 ${isManageActive ? "text-primary border-b-2 border-primary rounded-none" : "text-foreground hover:text-primary"}`}>
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
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground text-sm font-medium"
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
                                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground text-sm font-medium"
                                  >
                                    Ongoing
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                              <li>
                                <NavigationMenuLink asChild>
                                  <Link
                                    href="/volunteer/manage-opportunities?tab=mentor"
                                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground text-sm font-medium"
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
                  <NavigationMenuIndicator />
                </NavigationMenu>

                <Link
                  href={`/${session?.user?.role === "volunteer"
                    ? "volunteer"
                    : session?.user?.role === "mentor"
                      ? "mentor"
                      : "organisation"
                    }/messages`}
                   className={`text-sm font-medium transition-colors relative px-2 py-2 ${isMessagesActive ? "text-primary border-b-2 border-primary rounded-none" : "text-foreground hover:text-primary"}`}
                >
                  Messages
                  {totalUnreadCount > 0 && (
                     <span className="absolute top-0 right-0 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center transform translate-x-1/4 -translate-y-1/4">
                      {totalUnreadCount}
                    </span>
                  )}
                </Link>
              </div>
            )}
          </div>

          {/* Right Side Actions - Protected features */}
          <div className="flex items-center space-x-4">
            {/* Messages link moved to main nav */}

            <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-background/60 transition-colors bg-background/40">
              <NotificationBell />
            </div>

            <ThemeToggle />

            {session?.user && <UserMenu user={session.user as SessionUser} />}

            {/* Mobile Menu Button */}
            <button
              id="hamburger-button"
              className="md:hidden p-2 rounded-md text-foreground hover:bg-background/20"
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
      <div className="h-[72px] w-full shrink-0" aria-hidden="true" />

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
