import { FormField } from "@/components/form-input/FormField";
import { MultiSelectField } from "@/components/form-input/MultiSelectField";
import { PhoneField } from "@/components/form-input/PhoneField";
import { UseFormReturn } from "react-hook-form";
import { VolunteerSignupForm } from "@/types/auth";
import { FormSelect } from "@/components/form-input/FormSelect";
import { useEffect } from "react";
import { suburbs } from "@/utils/constants/suburb";
import { CATEGORIES_OPTIONS, STATES_OPTIONS } from "@/utils/constants";
import { SkillsMultiSelect } from "@/components/form-input/SkillsMultiSelectSelect";

interface BasicProfileStepProps {
  form: UseFormReturn<VolunteerSignupForm>;
}

export function BasicProfileStep({ form }: BasicProfileStepProps) {
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "area" && value.area) {
        const areaInfo = suburbs.find((area) => area.value === value.area);
        if (areaInfo) {
          if (areaInfo.postcodes.length > 1) {
            form.setValue("postcode", "");
          } else {
            form.setValue("postcode", areaInfo.postcodes[0]);
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);


  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">
          We&apos;re excited to have you on board!
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Please provide your details so we can keep you updated on our efforts
          and ways you can get involved.
        </p>
      </div>

      <div className="space-y-6">
        <FormField
          label="We'd love to hear what motivates you to volunteer (optional)"
          id="bio"
          type="textarea"
          placeholder="e.g. Being a student and passionate about protecting our environment, I ..."
          register={form.register}
          registerName="bio"
          error={form.formState.errors.bio?.message}
        />

        <SkillsMultiSelect
          label="What skills do you have?"
          placeholder="Select your skills"
          error={form.formState.errors.interested_on?.message}
          value={form.watch("interested_on") || []}
          onChange={(value: string[]) => form.setValue("interested_on", value as [string, ...string[]])}
        />

        <MultiSelectField
          label="What types of volunteer work are you interested in?"
          id="interested_categories"
          placeholder="Select opportunity categories"
          register={form.register}
          registerName="interested_categories"
          error={form.formState.errors.interested_categories?.message}
          options={CATEGORIES_OPTIONS}
          setValue={form.setValue}
          value={form.watch("interested_categories")}
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
        />

        <FormField
          label="Suburb"
          id="area"
          placeholder="Enter your suburb"
          register={form.register}
          registerName="area"
          error={form.formState.errors.area?.message}
        />

        <FormField
          label="Postcode"
          id="postcode"
          placeholder="e.g. 2000"
          register={form.register}
          registerName="postcode"
          error={form.formState.errors.postcode?.message}
        />
      </div>
    </>
  );
}
