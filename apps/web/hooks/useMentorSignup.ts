"use client";
import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import type { MentorSignupForm } from "@/types/auth";
import { authService, SIGNUP_SUCCESS_UNVERIFIED, EMAIL_ALREADY_REGISTERED } from "@/services/auth.service";

export type ProfileRedirectTarget = "profile" | "dashboard";

const PROFILE_REDIRECT_DESTINATIONS: Record<ProfileRedirectTarget, string> = {
  profile: "/mentor/profile",
  dashboard: "/mentor/dashboard",
};

export const DEFAULT_MENTOR_PROFILE = {
  bio: "",
  interested_on: ["Mentoring"] as [string, ...string[]],
  interested_categories: [] as string[],
  phone_number: "+61",
  state: "",
  area: "",
  postcode: "",
  is_currently_studying: "yes" as const,
  referral_source: "Other",
  student_type: "no" as const,
  course: "",
  home_country: "",
  major: "",
  non_student_type: "general_public" as const,
  is_available: true,
};

export function useMentorSignup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const axiosAuth = useAxiosAuth();
  const { updateSession } = useAuthCheck();

  const [isLoading, setIsLoading] = useState(false);
  const [isProfileSetupComplete, setIsProfileSetupComplete] = useState(false);
  const redirectTargetRef = useRef<ProfileRedirectTarget>("dashboard");

  const patchUserProfile = useMutation({
    mutationFn: (mentorProfileId: string) => authService.patchUserProfile(axiosAuth, { mentor_profile: mentorProfileId }),
  });

  const createMentorProfile = useMutation({
    mutationFn: (payload: typeof DEFAULT_MENTOR_PROFILE) => authService.createMentorProfile(axiosAuth, payload),
    onSuccess: async (data) => {
      try {
        await patchUserProfile.mutateAsync(data._id);
        await queryClient.invalidateQueries({ queryKey: ["profileCheckup"] });

        if (typeof updateSession === "function") {
          await updateSession();
        }

        const target = redirectTargetRef.current;
        const destination = PROFILE_REDIRECT_DESTINATIONS[target];
        const successMessage =
          target === "profile"
            ? "Profile created. Add your details below."
            : "Profile completed! Taking you to the app…";

        toast.success(successMessage);
        setIsProfileSetupComplete(true);

        setTimeout(() => router.push(destination), 800);
      } catch {
        toast.error("Failed to create account");
        setIsLoading(false);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? error.message ?? "Failed to create account");
      setIsLoading(false);
    },
  });

  const setupProfile = async (target: ProfileRedirectTarget) => {
    redirectTargetRef.current = target;
    setIsLoading(true);
    try {
      await createMentorProfile.mutateAsync(DEFAULT_MENTOR_PROFILE);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to complete profile");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    data: MentorSignupForm,
    options: { isTaken: boolean; setEmailTakenError: () => void; isSubmitting: boolean }
  ) => {
    if (options.isSubmitting) return;

    if (options.isTaken) {
      options.setEmailTakenError();
      return;
    }

    try {
      setIsLoading(true);
      const referral = searchParams?.get("referral") ?? undefined;

      const response = await authService.registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: "mentor",
        referred_by: referral,
      });

      if (response.data?.code === SIGNUP_SUCCESS_UNVERIFIED) {
        toast.success("Account created! Please check your email to verify your account.");
        router.push("/login");
        return;
      }

      await createMentorProfile.mutateAsync(DEFAULT_MENTOR_PROFILE);
    } catch (err) {
      const apiError = authService.getApiError(err);
      if (apiError.code === EMAIL_ALREADY_REGISTERED) {
        options.setEmailTakenError();
        return;
      }
      toast.error(apiError.message ?? "An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isProfileSetupComplete,
    setupProfile,
    signup,
  };
}
