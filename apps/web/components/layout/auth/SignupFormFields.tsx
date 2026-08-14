"use client";
import { useState } from "react";
import Link from "next/link";
import { UseFormReturn, FieldValues, Path } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/form-input/FormField";
import { PasswordField } from "@/components/form-input/PasswordField";
import { TermsDialog } from "@/components/layout/auth/TermsDialog";

interface SignupFormFieldsProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  isOrg?: boolean;
  termsAccepted: boolean;
  setTermsAccepted: (value: boolean) => void;
  termsError: string | null;
  setTermsError: (value: string | null) => void;
}

export function SignupFormFields<T extends FieldValues>({
  form,
  isOrg = false,
  termsAccepted,
  setTermsAccepted,
  termsError,
  setTermsError,
}: SignupFormFieldsProps<T>) {
  const [termsOpen, setTermsOpen] = useState(false);

  const nameLabel = isOrg ? "Organisation name" : "Name";
  const emailLabel = isOrg ? "Organisation email" : "Email";

  return (
    <>
      <TermsDialog open={termsOpen} onOpenChange={setTermsOpen} />

      <div className="space-y-6">
        <FormField
          label={nameLabel}
          id="name"
          placeholder={`Enter your ${isOrg ? "organisation name" : "name"}`}
          register={form.register}
          registerName={"name" as Path<T>}
          error={form.formState.errors["name"]?.message as string | undefined}
        />
        <FormField
          label={emailLabel}
          id="email"
          type="email"
          placeholder={`Enter your ${isOrg ? "organisation email" : "email"}`}
          register={form.register}
          registerName={"email" as Path<T>}
          error={form.formState.errors["email"]?.message as string | undefined}
        />
        <PasswordField
          label="Password"
          id="password"
          placeholder="Enter your password"
          register={form.register}
          registerName="password"
          error={form.formState.errors["password"]?.message as string | undefined}
          onFieldChange={() => {
            form.trigger("password" as Path<T>);
            form.trigger("confirm_password" as Path<T>);
          }}
        />
        <PasswordField
          label="Confirm Password"
          id="confirm_password"
          placeholder="Re-enter your password"
          register={form.register}
          registerName="confirm_password"
          error={form.formState.errors["confirm_password"]?.message as string | undefined}
          onFieldChange={() => {
            form.trigger("confirm_password" as Path<T>);
          }}
        />

        <div className="flex flex-col items-center sm:flex-row sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => {
                const accepted = checked === true;
                setTermsAccepted(accepted);
                setTermsError(accepted ? null : "You must accept the terms and conditions");
              }}
            />
            <Label htmlFor="terms" className="text-sm text-muted-foreground font-normal cursor-pointer">
              I agree to the{" "}
              <button
                type="button"
                onClick={() => setTermsOpen(true)}
                className="text-primary hover:text-primary/80 underline-offset-2 hover:underline"
              >
                Terms and Conditions
              </button>
            </Label>
          </div>
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-medium underline-offset-2 hover:underline"
            >
              Log In
            </Link>
          </div>
        </div>
        {termsError && <p className="text-sm text-destructive">{termsError}</p>}
      </div>
    </>
  );
}
