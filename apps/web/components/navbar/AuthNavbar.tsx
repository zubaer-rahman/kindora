"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserMenu } from "@/components/navbar/UserMenu";
import { SessionUser } from "@/types/navigation";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import KindoraLogo from "@/components/common/KindoraLogo";

export default function AuthNavbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const roleParam = searchParams?.get("role")?.toLowerCase();
  const isSigninPath = pathname?.includes("login");

  return (
    <nav className="flex justify-center py-3 px-4 sm:px-6 lg:px-8 h-[100px] relative">
      <div className="max-w-[1280px] w-full flex items-center justify-between relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <KindoraLogo className="ml-6" />
        </Link>

        {/* Right Side Actions - Auth specific */}
        <div className="flex items-center space-x-2 sm:space-x-4">

                  <div className="flex items-center space-x-2 sm:space-x-6 text-foreground">
                    {roleParam !== "mentor" && (
                      <div
                        className={cn(
                          "flex items-center gap-1 ms-2 sm:ms-0 sm:gap-3 px-2 sm:px-4 py-1 sm:py-2 bg-white/40 backdrop-blur-md rounded-full border border-border",
                          isSigninPath && "border-none bg-transparent"
                        )}
                      >
                        {!isSigninPath && (
                          <span className="text-xs sm:text-sm text-muted-foreground">
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
                            className="bg-primary hover:bg-primary/90 h-[49px] rounded-full px-8 text-white cursor-pointer shadow-lg shadow-primary/20"
                          >
                            <Link href="/signup">Sign up</Link>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

        </div>
      </div>
    </nav>
  );
}
