"use client";
import { Fragment, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import ProtectedNavbar from "@/components/navbar/ProtectedNavbar";
import NewFooter from "@/components/layout/landing/home/NewFooter";
import Loading from "@/app/loading";
import { FeedbackButton } from "@/components/FeedbackButton";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const router = useRouter();
  const { isLoading, isAuthenticated, profileCheck, session } = useAuthCheck();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      if (session?.user) {
        // Logged in but profile is missing or session is stale
        let role = "volunteer";
        const userRole = session.user.role?.toLowerCase();
        if (userRole === "organization" || userRole === "admin" || userRole === "organisation") {
          role = "organisation";
        } else if (userRole === "mentor") {
          role = "mentor";
        }
        router.push(`/signup?role=${role}`);
      } else {
        // Not logged in at all
        router.push("/login");
      }
    }
  }, [isLoading, isAuthenticated, router, profileCheck, session]);

  if (isLoading || !isAuthenticated) {
    return (
      <Loading size="medium">
        <p className="text-gray-600 mt-2">Wait a sec...</p>
      </Loading>
    );
  }

  return (
    <Fragment>
      <div className="flex flex-col min-h-screen">
        <ProtectedNavbar />
        <main className="flex-1 relative pt-[72px]">{children}</main>
        <NewFooter containerClassName="max-w-[1280px] mx-auto" paddingClassName="px-4" />
      </div>
      <FeedbackButton />
    </Fragment>
  );
}
