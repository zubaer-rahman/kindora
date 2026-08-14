"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { FormField } from "@/components/form-input/FormField";
import { AuthCard } from "@/components/layout/auth/AuthCard";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type ForgotFormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const form = useForm<ForgotFormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
    mode: "onChange",
  });

  const forgotMutation = useMutation({
    mutationFn: async (payload: { email: string }) => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/forgot-password`,
        payload
      );
      return res.data.data;
    },
    onSuccess: () => {
      setSent(true);
      toast.success("Check your email for the reset link.");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Something went wrong.");
    },
  });

  const onSubmit = (data: ForgotFormData) => {
    forgotMutation.mutate({ email: data.email });
  };

  if (sent) {
    return (
      <AuthCard
        title={
          <span className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Check your email
          </span>
        }
        description="If an account exists for that email, we've sent a password reset link. It may take a few minutes to arrive. The link expires in 24 hours."
      >
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Back to login</Link>
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot password"
      description="Enter your email and we'll send you a link to reset your password."
    >
      {forgotMutation.isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{forgotMutation.error.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          label="Email"
          id="email"
          type="email"
          placeholder="Enter your email"
          register={form.register}
          registerName="email"
          error={form.formState.errors.email?.message}
        />

        <LoadingButton
          type="submit"
          className="w-full h-10"
          isLoading={forgotMutation.isPending}
          loadingText="Sending..."
        >
          Send reset link
        </LoadingButton>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-4">
        <Link href="/login" className="text-primary hover:text-primary/80 underline-offset-2 hover:underline">
          Back to login
        </Link>
      </p>
    </AuthCard>
  );
}
