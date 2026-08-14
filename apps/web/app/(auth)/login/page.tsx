"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { Lock, Mail } from "lucide-react";
import { FormField } from "@/components/form-input/FormField";
import { PasswordField } from "@/components/form-input/PasswordField";
import { GuestLoginSection } from "@/components/features/auth/GuestLoginSection";
import { LoadingButton } from "@/components/buttons/LoadingButton";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import Loading from "@/app/loading";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInForm = z.infer<typeof signInSchema>;

const ROLE_DESTINATIONS: Record<string, string> = {
  system_admin: "/system-admin/dashboard",
  mentor: "/mentor/dashboard",
  volunteer: "/find-opportunity/most-recent",
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoading, isAuthenticated, session, hasProfile } = useAuthCheck();
  const queryClient = useQueryClient();
  const error = searchParams.get("error");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasRedirected = useRef(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  });

  const handleGuestLogin = (email: string) => {
    setValue("email", email);
    setValue("password", "guestpassword");
    handleSubmit(onSubmit)();
  };

  useEffect(() => {
    if (!isLoading && !hasRedirected.current) {
      if (isAuthenticated && session?.user?.role) {
        hasRedirected.current = true;
        const role = session.user.role.toLowerCase();
        const destination = ROLE_DESTINATIONS[role] ?? "/organisation/dashboard";
        router.replace(destination);
      } else if (!isAuthenticated && session?.user?.role && !hasProfile) {
        hasRedirected.current = true;
        const role = session.user.role.toLowerCase();

        if (role === "system_admin") {
          router.replace("/system-admin/dashboard");
          return;
        }

        let roleParam = "volunteer";
        if (role === "organisation" || role === "organization" || role === "admin") {
          roleParam = "organisation";
        } else if (role === "mentor") {
          roleParam = "mentor";
        }

        setTimeout(() => {
          router.replace(`/signup?role=${roleParam}`);
        }, 100);
      }
    }
  }, [isLoading, isAuthenticated, hasProfile, session, router]);

  const onSubmit = async (data: SignInForm) => {
    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        action: "signin",
      });
      if (result?.error) {
        const errorMessage =
          result.error === "CredentialsSignin"
            ? "Invalid email or password."
            : result.error;
        toast.error(errorMessage, { duration: 4000 });
        setIsSubmitting(false);
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["profileCheckup"] });
    } catch (error) {
      toast.error(`An unexpected error occurred: ${error}`, { duration: 4000 });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Loading size="medium">
        <p className="text-muted-foreground mt-2">Wait a sec...</p>
      </Loading>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Log in to Kindora
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-background border-l-4 border-destructive text-destructive">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <GuestLoginSection isLoading={isSubmitting} onGuestLogin={handleGuestLogin} />

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground font-medium">Or continue manually</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm text-muted-foreground font-medium">New to Kindora?</span>
              <Link href="/signup" className="text-sm text-primary hover:text-primary/80 font-bold transition-all px-1">
                Sign up
              </Link>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                label="Email"
                id="email"
                type="email"
                placeholder="Enter your email address"
                register={register}
                registerName="email"
                error={errors.email?.message}
                startIcon={<Mail size={18} className="text-muted-foreground" />}
                className="h-12"
              />

              <PasswordField
                label="Password"
                id="password"
                placeholder="Enter your password"
                register={register}
                registerName="password"
                error={errors.password?.message}
                startIcon={<Lock size={18} className="text-muted-foreground" />}
                customClass="h-12"
              />

              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <LoadingButton
                type="submit"
                isLoading={isSubmitting}
                className="w-full py-3 h-auto rounded-lg font-medium"
              >
                Log in
              </LoadingButton>
            </form>
          </div>

          <div className="px-8 py-4 border-t border-border text-center text-sm text-muted-foreground">
            <p>
              By continuing, you agree to Kindora&apos;s{" "}
              <Link href="/terms" prefetch={false} className="text-primary hover:underline transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" prefetch={false} className="text-primary hover:underline transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
