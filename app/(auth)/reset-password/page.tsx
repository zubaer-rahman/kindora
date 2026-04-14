"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PasswordField } from "@/components/form-input/PasswordField";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import Loading from "@/app/loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormField } from "@/components/form-input/FormField";
import { trpc } from "@/utils/trpc";
import toast from "react-hot-toast";
import { ResetPasswordFormData, ResetPasswordSchema } from "@/utils/constants";

const tokenResetSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
type TokenResetFormData = z.infer<typeof tokenResetSchema>;

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { isLoading, isAuthenticated, session } = useAuthCheck();
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated && session?.user?.role) {
      const role = session.user.role.toLowerCase();
      router.replace(
        role !== "volunteer"
          ? "/organisation/dashboard"
          : "/find-opportunity/most-recent"
      );
    }
  }, [isLoading, isAuthenticated, session, router]);

  const usersResetMutation = trpc.users.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("Password reset successfully!");
      router.push("/login?reset=success");
    },
    onError: (error) => {
      setFormError(error.message || "Failed to reset password");
      toast.error(error.message || "Failed to reset password");
    },
  });

  const authResetMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("Password reset successfully!");
      router.push("/login?reset=success");
    },
    onError: (error) => {
      setFormError(error.message || "Failed to reset password");
      toast.error(error.message || "Failed to reset password");
    },
  });

  const formWithEmail = useForm<ResetPasswordFormData>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const formWithToken = useForm<TokenResetFormData>({
    resolver: zodResolver(tokenResetSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const useTokenFlow = Boolean(token);
  const form = useTokenFlow ? formWithToken : formWithEmail;
  const resetMutation = useTokenFlow ? authResetMutation : usersResetMutation;
  const email = formWithEmail.watch("email");
  const password = formWithEmail.watch("password");
  const confirmPassword = formWithEmail.watch("confirmPassword");
  const tokenPassword = formWithToken.watch("password");
  const tokenConfirm = formWithToken.watch("confirmPassword");

  React.useEffect(() => {
    if (formError) setFormError(null);
  }, [email, password, confirmPassword, tokenPassword, tokenConfirm, formError]);

  const onSubmitWithEmail = async (data: ResetPasswordFormData) => {
    setFormError(null);
    if (data.password !== data.confirmPassword) {
      setFormError("Passwords don't match");
      return;
    }
    await usersResetMutation.mutateAsync({
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
    });
  };

  const onSubmitWithToken = async (data: TokenResetFormData) => {
    setFormError(null);
    if (!token) return;
    if (data.password !== data.confirmPassword) {
      setFormError("Passwords don't match");
      return;
    }
    await authResetMutation.mutateAsync({
      token,
      password: data.password,
    });
  };

  const onSubmit = useTokenFlow
    ? formWithToken.handleSubmit(onSubmitWithToken)
    : formWithEmail.handleSubmit(onSubmitWithEmail);

  const isPending = resetMutation.isPending;
  const tokenErrors = formWithToken.formState.errors;
  const emailErrors = formWithEmail.formState.errors;
  const isSubmitting = form.formState.isSubmitting;
  const disabled = useTokenFlow
    ? isSubmitting ||
      isPending ||
      Object.keys(tokenErrors).length > 0 ||
      !tokenPassword ||
      !tokenConfirm
    : isSubmitting ||
      isPending ||
      Object.keys(emailErrors).length > 0 ||
      !email ||
      !password ||
      !confirmPassword;

  if (isLoading) {
    return (
      <Loading size="medium">
        <p className="text-gray-600 mt-2">Wait a sec...</p>
      </Loading>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md border-none shadow-none">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            {useTokenFlow
              ? "Enter your new password below (link from email)"
              : "Enter your email and new password below"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {useTokenFlow ? (
            <Form {...formWithToken}>
              <form onSubmit={onSubmit} className="space-y-6">
                <PasswordField
                  label="New Password"
                  id="password"
                  register={formWithToken.register}
                  registerName="password"
                  error={tokenErrors.password?.message}
                  placeholder="Enter your new password"
                />

                <PasswordField
                  label="Confirm Password"
                  id="confirmPassword"
                  register={formWithToken.register}
                  registerName="confirmPassword"
                  error={tokenErrors.confirmPassword?.message}
                  placeholder="Confirm your new password"
                />

                <Button
                  type="submit"
                  className="w-full bg-blue-600 h-10"
                  disabled={disabled}
                >
                  {(isSubmitting || isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {isSubmitting || isPending ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...formWithEmail}>
              <form onSubmit={onSubmit} className="space-y-6">
                <FormField
                  label="Email"
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  register={formWithEmail.register}
                  registerName="email"
                  error={emailErrors.email?.message}
                />

                <PasswordField
                  label="New Password"
                  id="password"
                  register={formWithEmail.register}
                  registerName="password"
                  error={emailErrors.password?.message}
                  placeholder="Enter your new password"
                />

                <PasswordField
                  label="Confirm Password"
                  id="confirmPassword"
                  register={formWithEmail.register}
                  registerName="confirmPassword"
                  error={emailErrors.confirmPassword?.message}
                  placeholder="Confirm your new password"
                />

                <Button
                  type="submit"
                  className="w-full bg-blue-600 h-10"
                  disabled={disabled}
                >
                  {(isSubmitting || isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {isSubmitting || isPending ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
