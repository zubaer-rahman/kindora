import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "./useAxiosAuth";

export function useAuthCheck() {
  const { data: session, status, update: updateSession } = useSession();
  const axiosAuth = useAxiosAuth();

  // If there's a session but no api_token, the cookie is stale (pre-migration).
  // Skip the profile query entirely — we'll handle sign-out below.
  const hasApiToken = !!(session?.user as any)?.api_token;

  const { data: profileCheck, isLoading: isProfileLoading, error: profileError } = useQuery({
    queryKey: ['profileCheckup'],
    queryFn: async () => {
      const res = await axiosAuth.get('/api/v1/users/me/profile-checkup');
      return res.data.data;
    },
    enabled: status === "authenticated" && hasApiToken,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  // Memoize the authentication state to prevent unnecessary re-renders
  const authState = useMemo(() => {
    // Stale session (pre-migration): has session but no api_token
    if (status === "authenticated" && !hasApiToken) {
      return { isLoading: false, isAuthenticated: false, hasProfile: false, error: 'session_invalid' };
    }

    // If session is loading or profile check is in progress, we're loading
    if (status === "loading" || (status === "authenticated" && hasApiToken && isProfileLoading)) {
      return { isLoading: true, isAuthenticated: false, hasProfile: false };
    }

    // If session is not authenticated, we're not loading and not authenticated
    if (status === "unauthenticated") {
      return { isLoading: false, isAuthenticated: false, hasProfile: false };
    }

    // If profile check errored, treat as session invalid (401/404 from Axios)
    if (profileError) {
      console.error("Profile check failed:", profileError);
      const status401or404 = [401, 403, 404].includes((profileError as any)?.response?.status);
      return {
        isLoading: false,
        isAuthenticated: false,
        hasProfile: false,
        error: status401or404 ? 'session_invalid' : 'error',
      };
    }

    const isSessionAuthenticated = status === "authenticated" && !!session?.user && !!session?.user?.email;
    const userRole = (session?.user as any)?.role;

    // System admins have no profile — treat them as always authenticated
    if (isSessionAuthenticated && userRole === 'system_admin') {
      return { isLoading: false, isAuthenticated: true, hasProfile: true };
    }

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