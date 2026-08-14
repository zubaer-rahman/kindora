"use client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProfileRedirectTarget } from "@/hooks/useVolunteerSignup";

const ROLE_COPY: Record<"volunteer" | "mentor", { banner: string; heading: string; body: string }> = {
  volunteer: {
    banner: "Welcome! Your email is verified. Complete your volunteer profile below to start finding opportunities.",
    heading: "Complete your profile",
    body: "You can add more details later in settings. Click below to create your volunteer profile with default options.",
  },
  mentor: {
    banner: "Welcome! Your email is verified. Complete your mentor profile to get started.",
    heading: "Complete your mentor profile",
    body: "You can add more details later in settings. Click below to create your mentor profile with default options.",
  },
};

interface ProfileSetupPromptProps {
  role: "volunteer" | "mentor";
  isLoading: boolean;
  onSetupProfile: (target: ProfileRedirectTarget) => void;
}

export function ProfileSetupPrompt({ role, isLoading, onSetupProfile }: ProfileSetupPromptProps) {
  const router = useRouter();
  const copy = ROLE_COPY[role];

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl space-y-6">
      <div className="p-4 text-sm text-foreground bg-primary/10 rounded-lg border border-primary/20">
        {copy.banner}
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-2">{copy.heading}</h2>
        <p className="text-sm text-muted-foreground mb-6">{copy.body}</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            onClick={() => onSetupProfile("profile")}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Completing…
              </span>
            ) : (
              "Complete my profile"
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => onSetupProfile("dashboard")}
            disabled={isLoading}
          >
            Skip for now
          </Button>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have a profile?{" "}
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="text-primary hover:text-primary/80 underline-offset-2 hover:underline"
        >
          Log in
        </button>
      </p>
    </div>
  );
}
