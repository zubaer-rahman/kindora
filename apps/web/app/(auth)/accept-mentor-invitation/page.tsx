"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AuthCard } from "@/components/layout/auth/AuthCard";
import { LoadingButton } from "@/components/buttons/LoadingButton";
import toast from "react-hot-toast";
import { signOut } from "next-auth/react";
import { organizationService } from "@/services/organization.service";

export default function AcceptMentorInvitationPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const axiosAuth = useAxiosAuth();

  const acceptInvitation = useMutation({
    mutationFn: (payload: { token: string; name: string; password: string }) => {
      return organizationService.acceptMentorInvitation(axiosAuth, payload);
    },
    onSuccess: () => {
      toast.success("Invitation accepted successfully! You can now log in.");
      signOut({ callbackUrl: "/login" });
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
    acceptInvitation.mutate({ token, name, password });
  };

  if (!token) {
    return (
      <AuthCard
        title="Invalid Invitation"
        description="This invitation link is invalid or has expired."
        cardClassName="w-[400px]"
      />
    );
  }

  return (
    <AuthCard
      title="Accept Mentor Invitation"
      description="Set up your account to join as a mentor"
      cardClassName="w-[400px]"
    >
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
        <LoadingButton
          type="submit"
          className="w-full"
          isLoading={isSubmitting}
          loadingText="Accepting..."
        >
          Accept Invitation
        </LoadingButton>
      </form>
    </AuthCard>
  );
}