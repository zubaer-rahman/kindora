import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  FileUser,
  MessageCircle,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { Session } from "next-auth";
import { SessionUser } from "@/types/navigation";
import kindoranewlogo from "../../public/images/logos/kindora-logo.png";
import { STATIC_LINKS } from "@/utils/constants/navigation";
import { UserMenu } from "./UserMenu";
import { GiBinoculars } from "react-icons/gi";
import { useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/ui/notification-bell";

interface TopBarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  showNav: boolean;
  isAuthPath: boolean;
  isProtectedPath: boolean;
  isResetPasswordPath: boolean;
  session: Session | null;
  totalUnreadCount: number;
}

export function TopBar({
  isMenuOpen,
  setIsMenuOpen,
  showNav,
  isAuthPath,
  isProtectedPath,
  isResetPasswordPath,
  session,
  totalUnreadCount,
}: TopBarProps) {
  const handleMenuToggle = () => setIsMenuOpen(!isMenuOpen);
  const searchParams = useSearchParams();
  const isSigninPath = usePathname().includes("login");
  const roleParam = searchParams?.get("role")?.toLowerCase();

  if (isResetPasswordPath) {
    return (
      <div className="bg-black text-white py-2 px-6 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/">
            <Image
              src={kindoranewlogo}
              alt="iLEAP Logo"
              width={150}
              height={40}
              className="h-10 w-auto bg-amber-200"
              style={{ width: "auto", height: "40px" }}
              priority
            />
          </Link>
          <Link
            href="/login"
            className="text-sm font-normal hover:text-blue-500"
          >
            Log in
          </Link>
        </div>
      </div>
    );
  }

  if (!showNav) return null;

  return (
    <div className="bg-black text-white py-2 px-6 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <button
            id="hamburger-button"
            className="md:hidden text-white focus:outline-none"
            onClick={handleMenuToggle}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          <Link
            href={
              session
                ? session.user?.role !== "volunteer"
                  ? "/organisation/dashboard"
                  : "/find-opportunity/most-recent"
                : "/"
            }
            className="flex items-center cursor-pointer"
          >
            <Image
              src={kindoranewlogo}
              alt="iLEAP Logo"
              width={150}
              height={40}
              className="h-10 w-auto cursor-pointer"
              style={{ width: "auto", height: "40px" }}
              priority
            />
          </Link>
          {isProtectedPath && (
            <Link
              href={
                session?.user?.role === "volunteer"
                  ? "/find-opportunity/most-recent"
                  : session?.user?.role === "mentor"
                    ? "/mentor/dashboard"
                    : "/organisation/dashboard"
              }
              className="text-xs items-center gap-2 py-[6px] px-3 bg-[#343434] rounded-md font-medium hover:text-blue-500 hidden md:flex"
            >
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
          )}
          {session?.user?.role !== "volunteer" && isProtectedPath && (
            <Link
              href={
                session?.user?.role === "mentor"
                  ? "/mentor/manage-opportunities"
                  : "/organisation/opportunities"
              }
              className="text-xs items-center gap-2 py-[6px] px-3 bg-[#343434] rounded-md font-medium hover:text-blue-500 hidden md:flex"
            >
              <FileUser className="h-4 w-4" /> Opportunities
            </Link>
          )}

          {isProtectedPath && (
            <Link
              href={
                session?.user?.role === "admin" ||
                  session?.user?.role === "mentor" ||
                  session?.user?.role === "organisation"
                  ? "/find-volunteer"
                  : "/find-opportunity/most-recent"
              }
              className="text-xs items-center gap-2 py-[6px] px-3 bg-[#343434] rounded-md font-medium hover:text-blue-500 hidden md:flex"
            >
              {session?.user?.role === "admin" ||
                session?.user?.role === "mentor" ||
                session?.user?.role === "organisation" ? (
                <Users className="h-4 w-4" />
              ) : (
                <GiBinoculars className="h-4 w-4" />
              )}{" "}
              {session?.user?.role === "admin" ||
                session?.user?.role === "mentor" ||
                session?.user?.role === "organisation"
                ? "Find volunteers"
                : "Find Opportunities"}
            </Link>
          )}
        </div>

        {isAuthPath ? (
          <div className="flex items-center space-x-2 sm:space-x-4">
            {session ? (
              <UserMenu user={session.user as SessionUser} />
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-6">
                {roleParam !== "mentor" && (
                  <div
                    className={cn(
                      "flex items-center gap-1 ms-2 sm:ms-0 sm:gap-3 px-2 sm:px-4 py-1 sm:py-2 bg-gray-800/50 rounded-lg border border-gray-700",
                      isSigninPath && "border-none bg-transparent"
                    )}
                  >
                    {!isSigninPath && (
                      <span className="text-xs sm:text-sm text-gray-300">
                        {roleParam !== "organisation"
                          ? "Wanna join as an organisation?"
                          : "Wanna join as a volunteer?"}
                      </span>
                    )}
                    <Link
                      href={
                        isSigninPath
                          ? "/signup"
                          : roleParam !== "organisation"
                            ? "/signup?role=organisation"
                            : "/signup"
                      }
                      className="text-xs sm:text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200 px-2 sm:px-3 py-1 bg-blue-600/20 rounded-md hover:bg-blue-600/30 whitespace-nowrap"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : isProtectedPath ? (
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <Link
                href={`/${session?.user?.role !== "volunteer"
                  ? "organisation"
                  : `${session?.user?.role}`
                  }/messages`}
                className="hidden md:flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-800 transition-colors relative"
              >
                <MessageCircle className="h-4 w-4" />
                {totalUnreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalUnreadCount}
                  </span>
                )}
              </Link>
              {session?.user?.role !== "volunteer" && (
                <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-800 transition-colors">
                  <NotificationBell />
                </div>
              )}
              {session?.user && <UserMenu user={session.user as SessionUser} />}
            </div>
          </div>
        ) : (
          <div className="hidden md:flex items-center space-x-6">
            {STATIC_LINKS.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-sm font-medium hover:text-blue-600"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
