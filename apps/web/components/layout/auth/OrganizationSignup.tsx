"use client";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { OrgSignupFormData, orgSignupSchema } from "@/types/auth";
import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import toast from "react-hot-toast";
import { OrgSignupStep } from "./OrgSignupStep";
import { Loader2 } from "lucide-react";
import { UserRole } from "@/server/db/interfaces/user";

export default function OrganizationSignup() {
  const router = useRouter();
  const { isLoading, isAuthenticated, session } = useAuthCheck();
  const utils = trpc.useUtils();

  const [error, setError] = useState<string | null>(null);
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

  const checkEmail = trpc.auth.checkEmail.useQuery(
    { email: form.getValues("email") },
    { enabled: false }
  );

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

    const password = data.password;
    const confirmPassword = data.confirm_password;
    if (password !== confirmPassword) {
      setError("Please confirm your password");
      return;
    }

    try {
      setIsSignupLoading(true);
      setError(null);

      // Check if email is already taken
      const emailCheck = await utils.auth.checkEmail.fetch({ email: data.email });
      if (emailCheck.exists) {
        toast.error("This email is already registered. Please use a different email or log in.");
        setIsSignupLoading(false);
        return;
      }

      const response = await signIn("credentials", {
        name: data.name,
        email: data.email,
        password: data.password,
        role: UserRole.ORGANIZATION, // Set role for organizations
        action: "signup",
        redirect: false,
      });

      if (response?.error) {
        const msg = response.error;
        if (msg.includes("check your email") || msg.includes("Registration successful")) {
          toast.success("Account created! Please check your email to verify.");
          router.push("/login");
          return;
        }
        setError(msg);
        toast.error(msg);
        return;
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("An error occurred during signup");
      toast.error("Something went wrong. Please try again.");
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
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 pb-24">
      {error && (
        <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg mx-auto max-w-xl">
          {error}
        </div>
      )}

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
