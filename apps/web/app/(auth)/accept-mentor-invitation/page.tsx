"use client";

import { useState } from "react";
import {   useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";

export default function AcceptMentorInvitationPage() {
   const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const axiosAuth = useAxiosAuth();

  const acceptInvitation = useMutation({
    mutationFn: async (payload: { token: string; name: string; password: string }) => {
      const res = await axiosAuth.post("/api/v1/organization-mentors/accept-invitation", payload);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Invitation accepted successfully! You can now log in.");
      signOut({ callbackUrl: "/login" })
     },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to accept invitation");
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid invitation link");
      return;
    }
    if (!name || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    acceptInvitation.mutate({
      token,
      name,
      password,
    });
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Accept Mentor Invitation</CardTitle>
          <CardDescription>
            Set up your account to join as a mentor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                minLength={6}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                "Accept Invitation"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 