import { useSession, signOut } from "next-auth/react";
import { trpc } from "@/utils/trpc";
import { useEffect, useState, useMemo } from "react";

export function useAuthCheck() {
  const { data: session, status, update: updateSession } = useSession();
  const { data: profileCheck, isLoading: isProfileLoading, error: profileError } = trpc.users.profileCheckup.useQuery(undefined, {
    enabled: status === "authenticated",
    retry: false, // Don't retry if it fails (e.g. user deleted)
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  // Memoize the authentication state to prevent unnecessary re-renders
  const authState = useMemo(() => {
    // If we're loading session or the profile check is in progress, we're loading
    if (status === "loading" || (status === "authenticated" && isProfileLoading)) {
      return { isLoading: true, isAuthenticated: false, hasProfile: false };
    }

    // If session is not authenticated, we're not loading and not authenticated
    if (status === "unauthenticated") {
      return { isLoading: false, isAuthenticated: false, hasProfile: false };
    }

    // If we have an error fetching profile, we're not loading and probably not authenticated (user might be gone)
    if (profileError) {
      console.error("Profile check failed:", profileError);

      // If the error indicates the user is gone or session is invalid, ensure we report as unauthenticated
      const isSessionInvalid = profileError.data?.code === 'NOT_FOUND' || profileError.data?.code === 'UNAUTHORIZED';

      return {
        isLoading: false,
        isAuthenticated: false,
        hasProfile: false,
        error: isSessionInvalid ? 'session_invalid' : 'error'
      };
    }

    const isSessionAuthenticated = status === "authenticated" && !!session?.user && !!session?.user?.email;
    const hasValidProfile = Boolean(profileCheck?.hasVolunteerProfile || profileCheck?.hasOrganizationProfile || profileCheck?.hasMentorProfile);

    return {
      isLoading: false,
      isAuthenticated: isSessionAuthenticated && hasValidProfile,
      hasProfile: hasValidProfile,
    };
  }, [status, session, profileCheck, isProfileLoading, profileError]);

  useEffect(() => {
    setIsLoading(authState.isLoading);
    setIsAuthenticated(authState.isAuthenticated);
    setHasProfile(authState.hasProfile);

    // If the session is invalid (e.g. user deleted), force a sign out to clear cookies
    if (authState.error === 'session_invalid') {
      signOut({ redirect: true, callbackUrl: '/login' });
    }
  }, [authState]);

  return {
    isLoading,
    isAuthenticated,
    hasProfile,
    session,
    profileCheck,
    updateSession,
  };
}