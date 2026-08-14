"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { OrgSignupFormData, orgSignupSchema } from "@/types/auth";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useEmailUniqueness } from "@/hooks/useEmailUniqueness";
import {
  registerUser,
  SIGNUP_SUCCESS_UNVERIFIED,
  EMAIL_ALREADY_REGISTERED,
  getApiError,
} from "@/lib/auth-api";
import toast from "react-hot-toast";
import { UserRole } from "@/server/db/interfaces/user";
import { Form } from "@/components/ui/form";
import { SignupStep } from "@/components/features/auth/SignupStep";
import { SignupActionBar } from "@/components/features/auth/SignupActionBar";
import Loading from "@/app/loading";

const EMAIL_TAKEN_MESSAGE =
  "This email is already registered. Please use a different email or log in.";

export default function OrganizationSignup() {
  const router = useRouter();
  const { isLoading, isAuthenticated, session } = useAuthCheck();

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [isSignupLoading, setIsSignupLoading] = useState(false);

  const form = useForm<OrgSignupFormData>({
    resolver: zodResolver(orgSignupSchema),
    mode: "onChange",
    defaultValues: { name: "", email: "", password: "", confirm_password: "" },
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
    if (!isLoading && isAuthenticated && session?.user?.role) {
      const role = session.user.role.toLowerCase();
      const destination =
        role === "admin" || role === "organisation" || role === "organization"
          ? "/organisation/dashboard"
          : "/find-opportunity/most-recent";
      router.replace(destination);
    }
  }, [isLoading, isAuthenticated, session, router]);

  const handleSignup = async () => {
    if (!termsAccepted) {
      setTermsError("You must accept the terms and conditions");
      return;
    }

    if (isTaken) {
      form.setError("email", { type: "manual", message: EMAIL_TAKEN_MESSAGE });
      return;
    }

    const isValid = await form.trigger(["name", "email", "password", "confirm_password"]);
    if (!isValid) return;

    const data = form.getValues();

    try {
      setIsSignupLoading(true);

      const response = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: UserRole.ORGANIZATION,
      });

      if (response.data?.code === SIGNUP_SUCCESS_UNVERIFIED) {
        toast.success("Account created! Please check your email to verify your account.");
        router.push("/login");
        return;
      }

      toast.error("Something went wrong. Please try again.");
    } catch (err) {
      const apiError = getApiError(err);
      if (apiError.code === EMAIL_ALREADY_REGISTERED) {
        form.setError("email", { type: "manual", message: EMAIL_TAKEN_MESSAGE });
        return;
      }
      toast.error(apiError.message ?? "Something went wrong. Please try again.");
    } finally {
      setIsSignupLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Loading size="medium">
        <p className="text-muted-foreground mt-2">Wait a sec...</p>
      </Loading>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 pb-32">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <Form {...form}>
          <form className="space-y-6">
            <SignupStep
              form={form as any}
              isOrg
              termsAccepted={termsAccepted}
              setTermsAccepted={setTermsAccepted}
              termsError={termsError}
              setTermsError={setTermsError}
              role="organization"
            />
            <SignupActionBar onClick={handleSignup} isLoading={isSignupLoading} />
          </form>
        </Form>
      </div>
    </div>
  );
}
