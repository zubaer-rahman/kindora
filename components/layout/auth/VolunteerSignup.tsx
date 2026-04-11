"use client";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";
import { SignupStep } from "@/components/layout/auth/SignupStep";
import { VolunteerSignupForm, volunteerSignupSchema } from "@/types/auth";
import { useSearchParams, useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import toast from "react-hot-toast";
import { Form } from "@/components/ui/form";
import { UserRole } from "@/server/db/interfaces/user";
import { Loader2 } from "lucide-react";

export default function VolunteerSignup() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: session } = useSession();
  const { isLoading, isAuthenticated, updateSession } = useAuthCheck();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [isProfileSetupComplete, setIsProfileSetupComplete] = useState(false);
  const redirectAfterProfileRef = useRef<"profile" | "dashboard">("dashboard");

  const updateUser = trpc.users.updateUser.useMutation();
  const setupVolunteerProfile = trpc.users.setupVolunteerProfile.useMutation({
    onSuccess: async (data) => {
      try {
        await updateUser.mutateAsync({
          volunteer_profile: data._id,
        });

        await utils.users.profileCheckup.invalidate();
        await utils.users.profileCheckup.refetch();

        // Update session to avoid stale data
        if (typeof updateSession === 'function') {
          await updateSession();
        }

        const goToProfile = redirectAfterProfileRef.current === "profile";
        toast.success(goToProfile ? "Profile created. Add your details below." : "Profile completed! Taking you to the app…");
        setIsProfileSetupComplete(true);
        setIsLoggedIn(true);

        setTimeout(() => {
          if (goToProfile) {
            router.push("/volunteer/profile");
          } else {
            router.push("/find-opportunity/most-recent");
          }
        }, 800);
      } catch (error) {
        console.error("Error updating user with profile:", error);
        toast.error("Failed to create account");
        setIsSignupLoading(false);
      }
    },
    onError: (error) => {
      setError(error.message || "Failed to create account");
      setIsSignupLoading(false);
    },
  });

  const form = useForm<VolunteerSignupForm>({
    resolver: zodResolver(volunteerSignupSchema),
    mode: "onChange",
    defaultValues: {
      is_currently_studying: "yes",
      interested_on: [],
      interested_categories: [],
    },
  });

  const handleSignup = async () => {
    if (!termsAccepted) {
      setTermsError("You must accept the terms and conditions");
      return;
    }

    const password = form.getValues("password");
    const confirmPassword = form.getValues("confirm_password");
    if (password !== confirmPassword) {
      setError("Please confirm your password");
      return;
    }

    const fieldsToValidate: Array<keyof VolunteerSignupForm> = ["name", "email", "password", "confirm_password"];
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      await onSubmit(form.getValues());
    }
  };

  useEffect(() => {
    const handleRedirection = async () => {
      if (!isLoading) {
        if (isAuthenticated && session?.user?.role) {
          const role = session.user.role.toLowerCase();
          let destination = "/find-opportunity/most-recent";
          if (role === "mentor") {
            destination = "/mentor/dashboard";
          } else if (role !== "volunteer") {
            destination = "/organisation/dashboard";
          }
          await router.replace(destination);
        } else if (session?.user && !isAuthenticated) {
          setIsLoggedIn(true);
        }
      }
    };

    handleRedirection();
  }, [isLoading, isAuthenticated, session, router]);

  const defaultProfilePayload = {
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

  const handleCompleteProfileOnly = async () => {
    setError(null);
    redirectAfterProfileRef.current = "profile";
    setIsSignupLoading(true);
    try {
      await setupVolunteerProfile.mutateAsync(defaultProfilePayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete profile");
    } finally {
      setIsSignupLoading(false);
    }
  };

  const handleSkipToDashboard = async () => {
    setError(null);
    redirectAfterProfileRef.current = "dashboard";
    setIsSignupLoading(true);
    try {
      await setupVolunteerProfile.mutateAsync(defaultProfilePayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete profile");
    } finally {
      setIsSignupLoading(false);
    }
  };

  const onSubmit = async (data: VolunteerSignupForm) => {
    if (form.formState.isSubmitting) return;
    try {
      setError(null);
      setIsSignupLoading(true);

      const referral = searchParams?.get("referral");

      // Check if email is already taken
      const emailCheck = await utils.auth.checkEmail.fetch({ email: data.email });
      if (emailCheck.exists) {
        toast.error("This email is already registered. Please use a different email or log in.");
        setIsSignupLoading(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        name: data.name,
        role: UserRole.VOLUNTEER,
        redirect: false,
        action: "signup",
        referred_by: referral || undefined,
      });

      if (signInResult?.error) {
        const msg = signInResult.error;
        // Signup succeeded but email verification required (no session created)
        if (msg.includes("check your email") || msg.includes("Registration successful")) {
          toast.success(msg);
          router.push("/login");
          setIsSignupLoading(false);
          return;
        }
        toast.error(msg || "Account with this email already exists. Please provide the correct password.");
        setIsSignupLoading(false);
        return;
      }

      // After successful signup, automatically create volunteer profile with valid default values
      await setupVolunteerProfile.mutateAsync(defaultProfilePayload);

      setIsSignupLoading(false);
    } catch (err: unknown) {
      console.error("Error during signup:", err);
      setError(
        err instanceof Error ? err.message : "An error occurred during signup"
      );
    } finally {
      setIsSignupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 pb-24">
      {error && (
        <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg mx-auto max-w-xl">
          {error}
        </div>
      )}

      {/* Already logged in but no volunteer profile: show only "Complete profile" (no name/email/password) */}
      {isLoggedIn && !isAuthenticated && !isProfileSetupComplete && (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl space-y-6">
          <div className="p-4 text-sm text-green-700 bg-green-100 rounded-lg">
            Welcome! Your email is verified. Complete your volunteer profile below to start finding opportunities.
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Complete your profile</h2>
            <p className="text-sm text-gray-600 mb-6">
              You can add more details later in settings. Click below to create your volunteer profile with default options.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                onClick={handleCompleteProfileOnly}
                disabled={isSignupLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSignupLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Completing...
                  </div>
                ) : (
                  "Complete my profile"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSkipToDashboard}
                disabled={isSignupLoading}
                className="border-gray-300"
              >
                Skip for now
              </Button>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500">
            Already have a profile?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-blue-600 hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
      )}

      {/* New user: full signup form (name, email, password) */}
      {!isLoggedIn && (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
          <Form {...form}>
            <form className="space-y-6">
              <SignupStep
                form={form as any}
                termsAccepted={termsAccepted}
                setTermsAccepted={setTermsAccepted}
                termsError={termsError}
                setTermsError={setTermsError}
                role="volunteer"
              />

              <div className="fixed bottom-0 left-0 right-0 bg-gray-50 py-4 px-6 border-t border-gray-200">
                <div className="container mx-auto px-4">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={handleSignup}
                      disabled={isSignupLoading || isProfileSetupComplete}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSignupLoading ? (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Creating account...
                        </div>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
