"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Form } from "@/components/ui/form";
import { SignupStep } from "@/components/features/auth/SignupStep";
import { SignupActionBar } from "@/components/features/auth/SignupActionBar";
import { ProfileSetupPrompt } from "@/components/features/auth/ProfileSetupPrompt";
import { MentorSignupForm, mentorSignupSchema } from "@/types/auth";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useEmailUniqueness } from "@/hooks/useEmailUniqueness";
import { useMentorSignup } from "@/hooks/useMentorSignup";

const EMAIL_TAKEN_MESSAGE =
  "This email is already registered. Please use a different email or log in.";

const ROLE_REDIRECT: Record<string, string> = {
  mentor: "/mentor/dashboard",
  volunteer: "/find-opportunity/most-recent",
};

export default function MentorSignup() {
  const router = useRouter();
  const { isLoading: isSessionLoading, isAuthenticated, session } = useAuthCheck();
  const { isLoading, isProfileSetupComplete, setupProfile, signup } = useMentorSignup();

  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);

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
      form.setError("email", { type: "manual", message: EMAIL_TAKEN_MESSAGE });
    } else {
      const current = form.formState.errors.email;
      if (current?.type === "manual" && current?.message === EMAIL_TAKEN_MESSAGE) {
        form.clearErrors("email");
      }
    }
  }, [isTaken, form]);

  useEffect(() => {
    if (isSessionLoading) return;

    if (isAuthenticated && session?.user?.role) {
      const role = session.user.role.toLowerCase();
      const destination = ROLE_REDIRECT[role] ?? "/organisation/dashboard";
      router.replace(destination);
      return;
    }

    if (session?.user && !isAuthenticated) {
      setNeedsProfileSetup(true);
    }
  }, [isSessionLoading, isAuthenticated, session, router]);

  const handleSignup = async () => {
    if (!termsAccepted) {
      setTermsError("You must accept the terms and conditions");
      return;
    }

    const fieldsToValidate: Array<keyof MentorSignupForm> = [
      "name",
      "email",
      "password",
      "confirm_password",
    ];
    const isValid = await form.trigger(fieldsToValidate);
    if (!isValid) return;

    await signup(form.getValues(), {
      isTaken,
      isSubmitting: form.formState.isSubmitting,
      setEmailTakenError: () =>
        form.setError("email", { type: "manual", message: EMAIL_TAKEN_MESSAGE }),
    });
  };

  if (needsProfileSetup && !isAuthenticated && !isProfileSetupComplete) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 pb-32">
        <ProfileSetupPrompt role="mentor" isLoading={isLoading} onSetupProfile={setupProfile} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 pb-32">
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
              isLoading={isLoading || isProfileSetupComplete}
            />
          </form>
        </Form>
      </div>
    </div>
  );
}
