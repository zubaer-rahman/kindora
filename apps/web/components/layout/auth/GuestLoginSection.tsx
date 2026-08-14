"use client";
import { type LucideIcon, Building2, User, Sparkles } from "lucide-react";

interface GuestRoleButtonProps {
  icon: LucideIcon;
  label: string;
  email: string;
  disabled: boolean;
  onLogin: (email: string) => void;
}

function GuestRoleButton({ icon: Icon, label, email, disabled, onLogin }: GuestRoleButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onLogin(email)}
      className="group relative flex items-center gap-3 p-3 rounded-lg border border-primary/10 bg-card hover:bg-accent hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden text-left"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <span className="block font-semibold text-sm text-foreground">{label}</span>
        <span className="block text-[10px] text-muted-foreground">Guest Access</span>
      </div>
    </button>
  );
}

interface GuestLoginSectionProps {
  isLoading: boolean;
  onGuestLogin: (email: string) => void;
}

export function GuestLoginSection({ isLoading, onGuestLogin }: GuestLoginSectionProps) {
  return (
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
        <p className="text-xs text-muted-foreground mt-1">
          Experience the platform instantly without creating an account.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <GuestRoleButton
          icon={Building2}
          label="Organisation"
          email="guest_org@kindora.com"
          disabled={isLoading}
          onLogin={onGuestLogin}
        />
        <GuestRoleButton
          icon={User}
          label="Volunteer"
          email="guest_vol@kindora.com"
          disabled={isLoading}
          onLogin={onGuestLogin}
        />
      </div>
    </div>
  );
}
