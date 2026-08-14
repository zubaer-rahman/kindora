"use client";

import { UseFormReturn } from "react-hook-form";
import StepOne from "../../../create/_components/StepOne";
import { OpportunityFormValues } from "../../../create/_components/types";

interface EditBasicInformationProps {
  form: UseFormReturn<OpportunityFormValues>;
  onImageUploadStateChange?: (isUploading: boolean) => void;
}

export default function EditBasicInformation({
  form,
  onImageUploadStateChange,
}: EditBasicInformationProps) {
  return (
    <StepOne
      form={form}
      onImageUploadStateChange={onImageUploadStateChange}
    />
  );
}