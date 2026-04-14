"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { signIn } from "next-auth/react";
import { Loader2, Lock, Mail } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { trpc } from "@/utils/trpc";
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
  const utils = trpc.useUtils();
  const error = searchParams.get("error");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hasRedirected = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  });

  useEffect(() => {
    if (!isLoading && !hasRedirected.current) {
      if (isAuthenticated && session?.user?.role) {
        hasRedirected.current = true;
        const role = session.user.role.toLowerCase();
        let destination = "/find-opportunity/most-recent";
        if (role === "mentor") {
          destination = "/mentor/dashboard";
        } else if (role !== "volunteer") {
          destination = "/organisation/dashboard";
        }

        router.replace(destination);
      } else if (!isAuthenticated && session?.user?.role && !hasProfile) {
        hasRedirected.current = true;
        const role = session.user.role.toLowerCase();
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
        toast.error("Invalid email or password", { duration: 4000 });
        setIsSubmitting(false);
      }
      await utils.users.profileCheckup.invalidate();
    } catch (error) {
      toast.error(`An unexpected error occurred: ${error}`, { duration: 4000 });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Loading size="medium">
        <p className="text-gray-600 mt-2">Wait a sec...</p>
      </Loading>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Log in to Kindora
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-white border-l-4 border-red-500 text-red-700">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm text-gray-600 font-medium">New to Kindora?</span>
              <Link
                href="/signup"
                className="text-sm text-blue-600 hover:text-blue-700 font-bold transition-all px-1"
              >
                Sign up
              </Link>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="Enter your email address"
                    className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} />
                  </div>
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Enter your password"
                    className="w-full border border-gray-300 rounded-lg p-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} />
                  </div>
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : null}
                Log in
              </button>
            </form>
          </div>

          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center text-sm text-gray-600">
            <p>
              By continuing, you agree to Kindora&apos;s{" "}
              <Link
                href="/terms"
                prefetch={false}
                className="text-blue-600 hover:underline transition-colors"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                prefetch={false}
                className="text-blue-600 hover:underline transition-colors"
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
