import { FormField } from "@/components/form-input/FormField";
import { PasswordField } from "@/components/form-input/PasswordField";
import { UseFormReturn } from "react-hook-form";
import { VolunteerSignupForm } from "@/types/auth";
import { useState } from "react";
import Link from "next/link";
import { SignupHeader, SignupRole } from "./SignupHeader";

interface SignupStepProps {
  form: UseFormReturn<VolunteerSignupForm>;
  termsAccepted: boolean;
  setTermsAccepted: (value: boolean) => void;
  termsError: string | null;
  setTermsError: (value: string | null) => void;
  customORG?: boolean;
  role: SignupRole;
}

export function SignupStep({
  form,
  termsAccepted,
  setTermsAccepted,
  termsError,
  setTermsError,
  customORG = false,
  role,
}: SignupStepProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Terms and Conditions</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
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
                We reserve the right to modify these terms at any time.
                Continued use constitutes acceptance.
              </p>

              <p>
                By clicking &quot;Agree&quot;, you acknowledge that you have
                read and understood these terms.
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <SignupHeader role={role} />

      <div className="space-y-6">
        <FormField
          label={customORG ? "Organisation name" : "Name"}
          id="name"
          placeholder={`Enter your ${customORG ? "organisation name" : "name"}`}
          register={form.register}
          registerName="name"
          error={form.formState.errors.name?.message}
        />
        <FormField
          label={customORG ? "Organisation email" : "Email"}
          id="email"
          type="email"
          placeholder={`Enter your ${customORG ? "organisation email" : "email"
            }`}
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
                onClick={openModal}
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
