"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface PasswordFieldProps {
  label: string;
  id: string;
  register: unknown;
  registerName?: string;
  error?: string;
  placeholder?: string;
  onFieldChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  customClass?: string;
}

export function PasswordField({
  label,
  id,
  register,
  registerName,
  error,
  placeholder,
  onFieldChange,
  customClass = "h-12"
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          className={customClass}
          id={id}
          type={show ? "text" : "password"}
          {...(typeof register === "function" && registerName
            ? register(registerName, {
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  if (onFieldChange) {
                    onFieldChange(e);
                  }
                },
              })
            : register)}
          placeholder={placeholder}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
          onClick={() => setShow((prev) => !prev)}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
