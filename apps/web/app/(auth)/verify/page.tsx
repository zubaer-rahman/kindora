"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Loading from "@/app/loading";
import { AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/layout/auth/AuthCard";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const verifyMutation = useMutation({
    mutationFn: async (payload: { token: string }) => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/verify-email`,
        payload
      );
      return res.data.data;
    },
    onSuccess: (data) => {
      setStatus("success");
      if (data.alreadyVerified) {
        toast.success("Account was already verified. You can log in.");
      } else {
        toast.success("Email verified successfully. You can log in.");
      }
      setTimeout(() => router.push("/login?verified=1"), 2000);
    },
    onError: (err: any) => {
      setStatus("error");
      toast.error(err?.response?.data?.message || "Verification failed.");
    },
  });

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    verifyMutation.mutate({ token });
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!token) {
    return (
      <AuthCard title="Invalid link">
        <p className="text-muted-foreground mb-4">
          No verification token was provided. Please use the link from your
          email or request a new verification email.
        </p>
        <Button asChild>
          <Link href="/login">Go to login</Link>
        </Button>
      </AuthCard>
    );
  }

  if (verifyMutation.isPending || status === "idle") {
    return (
      <Loading size="medium">
        <p className="text-muted-foreground mt-2">Verifying your email...</p>
      </Loading>
    );
  }

  return (
    <AuthCard
      title={
        <span className="flex items-center gap-2">
          {status === "success" ? (
            <><CheckCircle className="h-5 w-5 text-green-600" />Email verified</>
          ) : (
            <><AlertCircle className="h-5 w-5 text-destructive" />Verification failed</>
          )}
        </span>
      }
    >
      {status === "success" ? (
        <p className="text-muted-foreground">Redirecting you to login...</p>
      ) : (
        <>
          <p className="text-muted-foreground mb-4">
            The link may be invalid or expired. You can try logging in or
            sign up again to receive a new verification email.
          </p>
          <Button asChild>
            <Link href="/login">Go to login</Link>
          </Button>
        </>
      )}
    </AuthCard>
  );
}
