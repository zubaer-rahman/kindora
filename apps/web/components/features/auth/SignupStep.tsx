"use client";
import { UseFormReturn, FieldValues } from "react-hook-form";
import { SignupHeader, SignupRole } from "./SignupHeader";
import { SignupFormFields } from "./SignupFormFields";

interface SignupStepProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  isOrg?: boolean;
  termsAccepted: boolean;
  setTermsAccepted: (value: boolean) => void;
  termsError: string | null;
  setTermsError: (value: string | null) => void;
  role: SignupRole;
}

export function SignupStep<T extends FieldValues>({
  form,
  isOrg = false,
  termsAccepted,
  setTermsAccepted,
  termsError,
  setTermsError,
  role,
}: SignupStepProps<T>) {
  return (
    <>
      <SignupHeader role={role} />
      <SignupFormFields
        form={form}
        isOrg={isOrg}
        termsAccepted={termsAccepted}
        setTermsAccepted={setTermsAccepted}
        termsError={termsError}
        setTermsError={setTermsError}
      />
    </>
  );
}
