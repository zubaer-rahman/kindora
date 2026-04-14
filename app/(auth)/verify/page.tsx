"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { trpc } from "@/utils/trpc";
import toast from "react-hot-toast";
import Loading from "@/app/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const verifyMutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: (data) => {
      setStatus("success");
      if (data.alreadyVerified) {
        toast.success("Account was already verified. You can log in.");
      } else {
        toast.success("Email verified successfully. You can log in.");
      }
      setTimeout(() => router.push("/login?verified=1"), 2000);
    },
    onError: (err) => {
      setStatus("error");
      toast.error(err.message || "Verification failed.");
    },
  });

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    verifyMutation.mutate({ token });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when token is present
  }, [token]);

  if (!token) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid link</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No verification token was provided. Please use the link from your
              email or request a new verification email.
            </p>
            <Button asChild>
              <Link href="/login">Go to login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verifyMutation.isPending || status === "idle") {
    return (
      <Loading size="medium">
        <p className="text-gray-600 mt-2">Verifying your email...</p>
      </Loading>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === "success" ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Email verified
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-destructive" />
                Verification failed
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === "success" ? (
            <p className="text-muted-foreground">
              Redirecting you to login...
            </p>
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
        </CardContent>
      </Card>
    </div>
  );
}
