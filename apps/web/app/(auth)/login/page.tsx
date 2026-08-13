"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { signIn } from "next-auth/react";
import { Loader2, Lock, Mail, Building2, User, Sparkles } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import Loading from "@/app/loading";
import { Button } from "@/components/ui/button";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInForm = z.infer<typeof signInSchema>;

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoading, isAuthenticated, session, hasProfile } = useAuthCheck();
  const queryClient = useQueryClient();
  const error = searchParams.get("error");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hasRedirected = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignInForm>({
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
        let destination = "/find-opportunity/most-recent";
        if (role === "system_admin") {
          destination = "/system-admin/dashboard";
        } else if (role === "mentor") {
          destination = "/mentor/dashboard";
        } else if (role !== "volunteer") {
          destination = "/organisation/dashboard";
        }

        router.replace(destination);
      } else if (!isAuthenticated && session?.user?.role && !hasProfile) {
        hasRedirected.current = true;
        const role = session.user.role.toLowerCase();

        // System admin needs no profile — go straight to dashboard
        if (role === "system_admin") {
          router.replace("/system-admin/dashboard");
          return;
        }

        // Map backend roles to frontend route slugs/role params
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
        let errorMessage = result.error;
        if (errorMessage === "CredentialsSignin") {
          errorMessage = "Invalid email or password.";
        }
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

            <div className="mb-6 p-5 rounded-xl border border-border border-t-2 border-t-primary bg-card shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Sparkles size={64} />
              </div>
              <div className="mb-4 text-center relative z-10">
                <h3 className="text-sm font-bold flex items-center justify-center gap-2">
                  <Sparkles size={16} className="text-primary" />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                    Want to explore as a guest?
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Experience the platform instantly without creating an account.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleGuestLogin('guest_org@kindora.com')}
                  className="group relative flex items-center gap-3 p-3 rounded-lg border border-primary/10 bg-card hover:bg-accent hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden text-left"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shrink-0">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <span className="block font-semibold text-sm text-foreground">Organisation</span>
                    <span className="block text-[10px] text-muted-foreground">Guest Access</span>
                  </div>
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleGuestLogin('guest_vol@kindora.com')}
                  className="group relative flex items-center gap-3 p-3 rounded-lg border border-primary/10 bg-card hover:bg-accent hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden text-left"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shrink-0">
                    <User size={16} />
                  </div>
                  <div>
                    <span className="block font-semibold text-sm text-foreground">Volunteer</span>
                    <span className="block text-[10px] text-muted-foreground">Guest Access</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground font-medium">Or continue manually</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm text-muted-foreground font-medium">New to Kindora?</span>
              <Link
                href="/signup"
                className="text-sm text-primary hover:text-primary/80 font-bold transition-all px-1"
              >
                Sign up
              </Link>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="Enter your email address"
                    className="w-full border border-input rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-muted-foreground" />
                  </div>
                </div>
                {errors.email && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Enter your password"
                    className="w-full border border-input rounded-lg p-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-muted-foreground" />
                  </div>
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 font-medium transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : null}
                Log in
              </button>
            </form>

          </div>

          <div className="px-8 py-4 border-t border-border text-center text-sm text-muted-foreground">
            <p>
              By continuing, you agree to Kindora&apos;s{" "}
              <Link
                href="/terms"
                prefetch={false}
                className="text-primary hover:underline transition-colors"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                prefetch={false}
                className="text-primary hover:underline transition-colors"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
