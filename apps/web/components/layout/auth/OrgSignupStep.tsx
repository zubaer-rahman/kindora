import { FormField } from "@/components/form-input/FormField";
import { PasswordField } from "@/components/form-input/PasswordField";
import { UseFormReturn } from "react-hook-form";
import { OrgSignupFormData } from "@/types/auth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { SignupHeader } from "./SignupHeader";

interface OrgSignupStepProps {
  form: UseFormReturn<OrgSignupFormData>;
  termsAccepted: boolean;
  setTermsAccepted: (value: boolean) => void;
  termsError: string | null;
  setTermsError: (value: string | null) => void;
}

export function OrgSignupStep({
  form,
  termsAccepted,
  setTermsAccepted,
  termsError,
  setTermsError,
}: OrgSignupStepProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms and Conditions</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-600 space-y-4">
            <p>
              Welcome to our platform! By using our services, you agree to the
              following terms:
            </p>

            <h4 className="font-medium">1. Account Responsibilities</h4>
            <p>
              You are responsible for maintaining the confidentiality of your
              account and password.
            </p>

            <h4 className="font-medium">2. User Conduct</h4>
            <p>
              You agree not to use the service for any illegal or unauthorized
              purpose.
            </p>

            <h4 className="font-medium">3. Content Ownership</h4>
            <p>
              You retain ownership of any content you submit, but grant us a
              license to use it.
            </p>

            <h4 className="font-medium">4. Termination</h4>
            <p>
              We may terminate or suspend access to our service immediately,
              without prior notice.
            </p>

            <h4 className="font-medium">5. Changes to Terms</h4>
            <p>
              We reserve the right to modify these terms at any time. Continued
              use constitutes acceptance.
            </p>

            <p>
              By clicking &quot;Agree&quot;, you acknowledge that you have read
              and understood these terms.
            </p>
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SignupHeader role="organization" />

      <div className="space-y-6">
        <FormField
          label="Name"
          id="name"
          placeholder={`Enter your name `}
          register={form.register}
          registerName="name"
          error={form.formState.errors.name?.message}
        />
        <FormField
          label="Email"
          id="email"
          type="email"
          placeholder={`Enter your email `}
          register={form.register}
          registerName="email"
          error={form.formState.errors.email?.message}
        />
        <PasswordField
          label="Password"
          id="password"
          placeholder="Enter your password"
          register={form.register}
          registerName="password"
          error={form.formState.errors.password?.message}
          onFieldChange={() => {
            form.trigger("password");
            form.trigger("confirm_password");
          }}
        />
        <div className="space-y-2">
          <PasswordField
            label="Confirm Password"
            id="confirm_password"
            placeholder="Re-enter your password"
            register={form.register}
            registerName="confirm_password"
            error={form.formState.errors.confirm_password?.message}
            onFieldChange={() => {
              form.trigger("confirm_password");
            }}
          />
          {form.getValues("password") &&
            form.getValues("confirm_password") &&
            form.getValues("password") !==
            form.getValues("confirm_password") && (
              <p className="text-sm text-red-600 mt-1">
                Passwords do not match
              </p>
            )}
        </div>

        <div className="flex flex-col items-center sm:flex-row    sm:justify-between">

          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked);
                if (!e.target.checked) {
                  setTermsError("You must accept the terms and conditions");
                } else {
                  setTermsError(null);
                }
              }}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
              I agree to the{" "}
              <a
                href="#"
                className="text-indigo-600 hover:text-indigo-500"
                onClick={(e) => {
                  e.preventDefault();
                  setIsModalOpen(true);
                }}
              >
                Terms and Conditions
              </a>
            </label>
          </div>
          <div className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-indigo-600 underline font-medium hover:text-indigo-500"
            >
              Log In
            </Link>
          </div>
        </div>
        {termsError && <p className="text-sm text-red-600">{termsError}</p>}
      </div>
    </>
  );
}
