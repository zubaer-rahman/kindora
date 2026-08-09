"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import VolunteerSignup from "@/components/layout/auth/VolunteerSignup";
import OrganizationSignup from "@/components/layout/auth/OrganizationSignup";
import MentorSignup from "@/components/layout/auth/MentorSignup";
import Loading from "@/app/loading";

export default function SignupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoading, isAuthenticated, session } = useAuthCheck();
  const paramRole = searchParams?.get("role")?.toLowerCase();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Only redirect once when authenticated and not already redirecting
    if (!isLoading && isAuthenticated && session?.user?.role && !hasRedirected.current) {
      hasRedirected.current = true;
      const role = session.user.role.toLowerCase();
      let destination = "/organisation/dashboard";
      if (role === "volunteer") {
        destination = "/find-opportunity/most-recent";
      } else if (role === "mentor") {
        destination = "/mentor/dashboard";
      }

      router.replace(destination);
    }
  }, [isLoading, isAuthenticated, session, router]);

  if (isLoading) {
    return (
      <Loading size="medium">
        <p className="text-gray-600 mt-2">Wait a sec...</p>
      </Loading>
    );
  }

  if (isAuthenticated) return null;

  // Priority: 
  // 1. URL parameter (for new signups)
  // 2. Session role (for users who just verified or have partial session)
  // 3. Default to volunteer
  let role = paramRole || session?.user?.role?.toLowerCase() || "volunteer";

  if (role === "admin" || role === "organization") {
    role = "organisation";
  }

  if (role === "organisation") {
    return <OrganizationSignup />;
  }
  if (role === "mentor") {
    return <MentorSignup />;
  }
  return <VolunteerSignup />;
}
