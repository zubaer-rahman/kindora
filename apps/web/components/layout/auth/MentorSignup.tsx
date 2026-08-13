"use client";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { SignupStep } from "@/components/layout/auth/SignupStep";
import { SignupActionBar } from "@/components/layout/auth/SignupActionBar";
import { MentorSignupForm, mentorSignupSchema } from "@/types/auth";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { useEmailUniqueness } from "@/hooks/useEmailUniqueness";
import {
  registerUser,
  SIGNUP_SUCCESS_UNVERIFIED,
  EMAIL_ALREADY_REGISTERED,
  getApiError,
} from "@/lib/auth-api";
import toast from "react-hot-toast";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const EMAIL_TAKEN_MESSAGE =
  "This email is already registered. Please use a different email or log in.";

export default function MentorSignup() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const axiosAuth = useAxiosAuth();
    const { isLoading, isAuthenticated, session, updateSession } = useAuthCheck();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [termsError, setTermsError] = useState<string | null>(null);
    const [isSignupLoading, setIsSignupLoading] = useState(false);
    const [isProfileSetupComplete, setIsProfileSetupComplete] = useState(false);
    const redirectAfterProfileRef = useRef<"profile" | "dashboard">("dashboard");

    const updateUser = useMutation({
        mutationFn: async (payload: { mentor_profile: string }) => {
            const res = await axiosAuth.patch("/api/v1/users/me", payload);
            return res.data;
        },
    });

    const setupMentorProfile = useMutation({
        mutationFn: async (payload: any) => {
            const res = await axiosAuth.post("/api/v1/users/me/mentor-profile", payload);
            return res.data.data;
        },
        onSuccess: async (data) => {
            try {
                await updateUser.mutateAsync({ mentor_profile: data._id });
                await queryClient.invalidateQueries({ queryKey: ["profileCheckup"] });
                if (typeof updateSession === "function") await updateSession();
                const goToProfile = redirectAfterProfileRef.current === "profile";
                toast.success(goToProfile ? "Profile created. Add your details below." : "Profile completed! Taking you to the app…");
                setIsProfileSetupComplete(true);
                setIsLoggedIn(true);
                setTimeout(() => {
                    router.push(goToProfile ? "/mentor/profile" : "/mentor/dashboard");
                }, 800);
            } catch (error) {
                console.error("Error updating user with profile:", error);
                toast.error("Failed to create mentor account");
                setIsSignupLoading(false);
            }
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error.message || "Failed to create mentor account");
            setIsSignupLoading(false);
        },
    });

    const form = useForm<MentorSignupForm>({
        resolver: zodResolver(mentorSignupSchema),
        mode: "onChange",
        defaultValues: {
            is_currently_studying: "yes",
            interested_on: [],
            interested_categories: [],
        },
    });

    const email = form.watch("email");
    const { isTaken } = useEmailUniqueness(email);

    useEffect(() => {
        if (isTaken) {
            form.setError("email", {
                type: "manual",
                message: EMAIL_TAKEN_MESSAGE,
            });
        }
    }, [isTaken, form]);

    const handleSignup = async () => {
        if (!termsAccepted) {
            setTermsError("You must accept the terms and conditions");
            return;
        }

        const fieldsToValidate: Array<keyof MentorSignupForm> = ["name", "email", "password", "confirm_password"];
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
                    let destination = "/mentor/dashboard";
                    if (role === "mentor") {
                        destination = "/mentor/dashboard";
                    } else if (role === "volunteer") {
                        destination = "/find-opportunity/most-recent";
                    } else {
                        destination = "/organisation/dashboard";
                    }
                    await router.replace(destination);
                } else if (session?.user && !isAuthenticated) {
                    // This block is for when a user is logged in via next-auth but their profile isn't fully set up
                    // We want to ensure setIsLoggedIn is true here so the "complete your profile" message shows
                    setIsLoggedIn(true);
                }
            }
        };

        handleRedirection();
    }, [isLoading, isAuthenticated, session, router]);

    const defaultMentorProfilePayload = {
        bio: "",
        interested_on: ["Mentoring"] as [string, ...string[]],
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
        redirectAfterProfileRef.current = "profile";
        setIsSignupLoading(true);
        try {
            await setupMentorProfile.mutateAsync(defaultMentorProfilePayload);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to complete profile");
        } finally {
            setIsSignupLoading(false);
        }
    };

    const handleSkipToDashboard = async () => {
        redirectAfterProfileRef.current = "dashboard";
        setIsSignupLoading(true);
        try {
            await setupMentorProfile.mutateAsync(defaultMentorProfilePayload);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to complete profile");
        } finally {
            setIsSignupLoading(false);
        }
    };

    const onSubmit = async (data: MentorSignupForm) => {
        if (form.formState.isSubmitting) return;

        if (isTaken) {
            form.setError("email", {
                type: "manual",
                message: EMAIL_TAKEN_MESSAGE,
            });
            return;
        }

        try {
            setIsSignupLoading(true);

            const referral = searchParams?.get("referral");

            const response = await registerUser({
                name: data.name,
                email: data.email,
                password: data.password,
                role: "mentor",
                referred_by: referral || undefined,
            });

            if (response.data?.code === SIGNUP_SUCCESS_UNVERIFIED) {
                toast.success(
                    "Account created! Please check your email to verify your account."
                );
                router.push("/login");
                return;
            }

            await setupMentorProfile.mutateAsync(defaultMentorProfilePayload);
        } catch (err) {
            console.error("Error during signup:", err);
            const apiError = getApiError(err);
            if (apiError.code === EMAIL_ALREADY_REGISTERED) {
                form.setError("email", {
                    type: "manual",
                    message: EMAIL_TAKEN_MESSAGE,
                });
                return;
            }
            toast.error(apiError.message || "An error occurred during signup");
        } finally {
            setIsSignupLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 pb-32">
            {isLoggedIn && !isAuthenticated && !isProfileSetupComplete && (
                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl space-y-6">
                    <div className="p-4 text-sm text-green-700 bg-green-100 rounded-lg">
                        Welcome! Your email is verified. Complete your mentor profile to get started.
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Complete your mentor profile</h2>
                        <p className="text-sm text-gray-600 mb-6">
                            You can add more details later in settings. Click below to create your mentor profile with default options.
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
                                role="mentor"
                            />

                            <SignupActionBar
                              onClick={handleSignup}
                              isLoading={isSignupLoading || isProfileSetupComplete}
                            />
                        </form>
                    </Form>
                </div>
            )}
        </div>
    );
}
