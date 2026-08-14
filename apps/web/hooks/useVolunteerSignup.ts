"use client";
import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import {
  registerUser,
  SIGNUP_SUCCESS_UNVERIFIED,
  EMAIL_ALREADY_REGISTERED,
  getApiError,
} from "@/lib/auth-api";
import type { VolunteerSignupForm } from "@/types/auth";

export type ProfileRedirectTarget = "profile" | "dashboard";

const PROFILE_REDIRECT_DESTINATIONS: Record<ProfileRedirectTarget, string> = {
  profile: "/volunteer/profile",
  dashboard: "/find-opportunity/most-recent",
};

export const DEFAULT_VOLUNTEER_PROFILE = {
  bio: "",
  interested_on: ["General Support"] as [string, ...string[]],
  interested_categories: [] as string[],
  phone_number: "+61",
  state: "",
  area: "",
  postcode: "",
  is_currently_studying: "yes" as const,
  referral_source: "Other",
  student_type: "no",
  course: "",
  home_country: "",
  major: "",
  non_student_type: "general_public" as const,
  is_available: true,
};

export function useVolunteerSignup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const axiosAuth = useAxiosAuth();
  const { updateSession } = useAuthCheck();

  const [isLoading, setIsLoading] = useState(false);
  const [isProfileSetupComplete, setIsProfileSetupComplete] = useState(false);
  const redirectTargetRef = useRef<ProfileRedirectTarget>("dashboard");

  const patchUserProfile = useMutation({
    mutationFn: async (volunteerProfileId: string) => {
      const res = await axiosAuth.patch("/api/v1/users/me", {
        volunteer_profile: volunteerProfileId,
      });
      return res.data;
    },
  });

  const createVolunteerProfile = useMutation({
    mutationFn: async (payload: typeof DEFAULT_VOLUNTEER_PROFILE) => {
      const res = await axiosAuth.post("/api/v1/users/me/volunteer-profile", payload);
      return res.data.data;
    },
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
      await createVolunteerProfile.mutateAsync(DEFAULT_VOLUNTEER_PROFILE);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to complete profile");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    data: VolunteerSignupForm,
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

      const response = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: "volunteer",
        referred_by: referral,
      });

      if (response.data?.code === SIGNUP_SUCCESS_UNVERIFIED) {
        toast.success("Account created! Please check your email to verify your account.");
        router.push("/login");
        return;
      }

      await createVolunteerProfile.mutateAsync(DEFAULT_VOLUNTEER_PROFILE);
    } catch (err) {
      const apiError = getApiError(err);
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
