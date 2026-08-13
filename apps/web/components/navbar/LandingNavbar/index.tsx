"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { UserMenu } from "@/components/navbar/UserMenu";
import { NotificationBell } from "@/components/ui/notification-bell";
import { SessionUser } from "@/types/navigation";
import { cn } from "@/lib/utils";
import { MobileMenu } from "@/components/navbar/MobileMenu";
import {
  isAuthPath,
  isProtectedPath,
  isResetPasswordPath,
} from "@/utils/helpers/pathCheck";
import KindoraLogo from "@/components/common/KindoraLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { isAuthenticated } = useAuthCheck();
  const axiosAuth = useAxiosAuth();

  const authPath = isAuthPath(pathname);
  const protectedPath = isProtectedPath(pathname);
  const resetPasswordPath = isResetPasswordPath(pathname);
  const roleParam = searchParams?.get("role")?.toLowerCase();
  const isSigninPath = pathname?.includes("login");

  // Fetch conversations to get total unread count with polling
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
    refetchInterval: 5000,
  });

  // Fetch groups to get total unread count with polling
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
    refetchInterval: 5000,
  });

  // Calculate total unread messages from both conversations and groups
  const conversationsUnreadCount =
    conversations?.reduce(
      (total, conv) => total + (conv.unreadCount || 0),
      0,
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

  // Determine navigation links based on path - only functional links
  const getNavLinks = () => {
    if (protectedPath && session) {
      return [];
    }
    return [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Gallery", href: "/kindora/gallery" },
      { label: "FAQ", href: "/faq" },
      { label: "Opportunities", href: "/opportunities" },
      { label: "Volunteers", href: "/volunteers" },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <>
      <nav className="flex justify-center py-3 px-4 sm:px-6 lg:px-8 h-[100px] fixed top-0 left-0 w-full z-50">
        <div className="max-w-[1170px] flex items-center justify-between relative z-[60] bg-background/80 backdrop-blur-lg border border-border w-full rounded-full shadow-lg h-20">
          {/* Logo */}
          <Link
            href={
              session
                ? session.user?.role !== "volunteer"
                  ? "/organisation/dashboard"
                  : "/find-opportunity/most-recent"
                : "/"
            }
            className="flex items-center"
          >
            <KindoraLogo className="ml-8" />
          </Link>

          {/* Desktop Navigation */}
          {!protectedPath && (
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition-colors ${isActive ? "text-primary border-b-2 border-primary rounded-none" : "text-muted-foreground hover:text-primary"}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4 pr-6">
            {authPath ? (
              <div className="flex items-center space-x-2 sm:space-x-4">
                {session ? (
                  <>
                    <ThemeToggle />
                    <UserMenu user={session.user as SessionUser} />
                  </>
                ) : (
                  <div className="flex items-center space-x-2 sm:space-x-6">
                    <ThemeToggle />
                    {roleParam !== "mentor" && (
                      <div
                        className={cn(
                          "flex items-center gap-1 ms-2 sm:ms-0 sm:gap-3 px-2 sm:px-4 py-1 sm:py-2 bg-background/60 backdrop-blur-md rounded-full border border-primary/20",
                          isSigninPath && "border-none bg-transparent",
                        )}
                      >
                        {!isSigninPath && (
                          <span className="text-xs sm:text-sm text-foreground">
                            {roleParam !== "organisation"
                              ? "Wanna join as an organisation?"
                              : "Wanna join as a volunteer?"}
                          </span>
                        )}
                        {!isSigninPath ? (
                          <Link
                            href={
                              roleParam !== "organisation"
                                ? "/signup?role=organisation"
                                : "/signup"
                            }
                            className="text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors duration-200 px-3 py-1 bg-primary/10 rounded-full whitespace-nowrap"
                          >
                            Sign up
                          </Link>
                        ) : (
                          <Button
                            asChild
                            className="bg-primary hover:bg-primary/90 h-10 rounded-full px-6 text-primary-foreground cursor-pointer shadow-lg shadow-primary/20"
                          >
                            <Link href="/signup">Sign up</Link>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : protectedPath ? (
              <div className="flex items-center space-x-4">
                <Link
                  href={`/${
                    session?.user?.role !== "volunteer"
                      ? "organisation"
                      : `${session?.user?.role}`
                  }/messages`}
                  className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-background/60 transition-colors relative bg-background/40"
                >
                  <MessageCircle className="h-5 w-5 text-foreground" />
                  {totalUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalUnreadCount}
                    </span>
                  )}
                </Link>
                {session?.user?.role !== "volunteer" && (
                  <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-background/60 transition-colors bg-background/40">
                    <NotificationBell />
                  </div>
                )}
                <ThemeToggle />
                {session?.user && (
                  <UserMenu user={session.user as SessionUser} />
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {session ? (
                  <>
                    <ThemeToggle />
                    <UserMenu user={session.user as SessionUser} />
                  </>
                ) : (
                  <>
                    <ThemeToggle />
                    <Button
                      asChild
                      variant="ghost"
                      className="text-sm font-medium text-foreground hover:text-primary"
                    >
                      <Link href="/login">Log in</Link>
                    </Button>
                    <Button
                      asChild
                      className="bg-primary hover:bg-primary/90 h-10 rounded-full px-6 text-primary-foreground text-sm font-medium shadow-md shadow-primary/20"
                    >
                      <Link href="/signup">Sign up</Link>
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              id="hamburger-button"
              className="md:hidden p-2 rounded-full text-foreground hover:bg-muted transition-colors"
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
