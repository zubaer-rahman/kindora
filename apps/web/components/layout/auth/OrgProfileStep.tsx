import { FormField } from "@/components/form-input/FormField";
import { PhoneField } from "@/components/form-input/PhoneField";
import { UseFormReturn } from "react-hook-form";
import { OrgFullSignupFormData } from "@/types/auth";
import { FormSelect } from "@/components/form-input/FormSelect";
import { STATES_OPTIONS } from "@/utils/constants";

interface OrgProfileStepProps {
  form: UseFormReturn<OrgFullSignupFormData>;
}

export function OrgProfileStep({ form }: OrgProfileStepProps) {

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">
          We&apos;re excited to have you on board!
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Please provide your organisation details so we can keep you updated on
          our efforts and ways you can get involved.
        </p>
      </div>

      <div className="space-y-6">
        <FormField
          label="Organisation Name"
          id="title"
          placeholder={`Enter your organisation name`}
          register={form.register}
          registerName="title"
          error={form.formState.errors.title?.message}
        />
        <FormField
          label="Contact email"
          id="contact_email"
          type="email"
          placeholder={`Enter your organisation email `}
          register={form.register}
          registerName="contact_email"
          error={form.formState.errors.contact_email?.message}
        />
        <FormField
          label="About us"
          id="bio"
          type="textarea"
          placeholder="We are a community-driven volunteer organisation dedicated to ....."
          register={form.register}
          registerName="bio"
          error={form.formState.errors.bio?.message}
        />

        <PhoneField
          label="Phone number"
          id="phone_number"
          placeholder="+61 1243 5978"
          register={form.register}
          registerName="phone_number"
          error={form.formState.errors.phone_number?.message}
          value={form.watch("phone_number")}
          setValue={form.setValue}
        />

        <FormSelect
          label="State"
          id="state"
          placeholder="Select your location"
          control={form.control}
          registerName="state"
          error={form.formState.errors.state?.message}
          options={STATES_OPTIONS}
          searchEnabled
        />

        {/* Suburb (as text input) */}
        <FormField
          label="Suburb"
          id="area"
          placeholder="Enter your suburb/area"
          register={form.register}
          registerName="area"
          error={form.formState.errors.area?.message}
        />

        <FormField
          label="ABN"
          id="abn"
          placeholder="e.g. 43 625 460 915"
          register={form.register}
          registerName="abn"
          error={form.formState.errors.abn?.message}
          className="h-12"
        />
      </div>
    </>
  );
}
