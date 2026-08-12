"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { OrgSignupFormData, orgSignupSchema } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useEmailUniqueness } from "@/hooks/useEmailUniqueness";
import {
  registerUser,
  SIGNUP_SUCCESS_UNVERIFIED,
  EMAIL_ALREADY_REGISTERED,
  getApiError,
} from "@/lib/auth-api";
import toast from "react-hot-toast";
import { OrgSignupStep } from "./OrgSignupStep";
import { Loader2 } from "lucide-react";
import { UserRole } from "@/server/db/interfaces/user";

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
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirm_password: "",
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

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && session?.user?.role) {
        const role = session.user.role.toLowerCase();
        router.replace(
          (role === "admin" || role === "organisation" || role === "organization")
            ? "/organisation/dashboard"
            : "/find-opportunity/most-recent"
        );
      }
    }
  }, [isLoading, isAuthenticated, session, router]);

  const onSubmit = async (data: OrgSignupFormData) => {
    if (isSignupLoading) return;

    if (!termsAccepted) {
      setTermsError("You must accept the terms and conditions");
      return;
    }

    if (isTaken) {
      form.setError("email", {
        type: "manual",
        message: EMAIL_TAKEN_MESSAGE,
      });
      return;
    }

    try {
      setIsSignupLoading(true);

      const response = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: UserRole.ORGANIZATION,
      });

      if (response.data?.code === SIGNUP_SUCCESS_UNVERIFIED) {
        toast.success(
          "Account created! Please check your email to verify your account."
        );
        router.push("/login");
        return;
      }

      toast.error("Something went wrong. Please try again.");
    } catch (err) {
      console.error("Signup error:", err);
      const apiError = getApiError(err);
      if (apiError.code === EMAIL_ALREADY_REGISTERED) {
        form.setError("email", {
          type: "manual",
          message: EMAIL_TAKEN_MESSAGE,
        });
        return;
      }
      toast.error(apiError.message || "Something went wrong. Please try again.");
    } finally {
      setIsSignupLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 pb-32">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <OrgSignupStep
            form={form}
            termsAccepted={termsAccepted}
            setTermsAccepted={setTermsAccepted}
            termsError={termsError}
            setTermsError={setTermsError}
          />

          <div className="fixed bottom-0 left-0 right-0 bg-gray-50 py-4 px-6 border-t border-gray-200">
            <div className="container mx-auto px-4">
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSignupLoading}
                  className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
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
      </div>
    </div>
  );
}
