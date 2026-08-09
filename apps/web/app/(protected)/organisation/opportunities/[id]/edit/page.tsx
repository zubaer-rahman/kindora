"use client";

import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { OpportunityFormValues } from "../../create/_components/types";
import EditFooter from "./_components/EditFooter";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { useEditOpportunity } from "@/hooks/useEditOpportunity";
import Loading from "@/app/loading";
import NotFound from "@/app/not-found";
import { opportunityValidationSchema } from "@/utils/validation/opportunity";
import toast from "react-hot-toast";
import StepIndicator from "../../create/_components/StepIndicator";
import StepOne from "../../create/_components/StepOne";
import StepTwo from "../../create/_components/StepTwo";
import BackButton from "@/components/buttons/BackButton";
import { Card } from "@/components/ui/card";

const EditOpportunityPage = () => {
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const steps = [
    { title: "Opportunity Details", description: "General information and role description" },
    { title: "Logistics & Contact", description: "Schedule, requirements and contact info" },
  ];

  const {
    opportunity,
    isLoadingOpportunity,
    handleUpdate,
    getDefaultValues,
    isUpdating,
  } = useEditOpportunity();

  const form = useForm<OpportunityFormValues>({
    defaultValues: getDefaultValues(),
    mode: "onChange",
    resolver: zodResolver(opportunityValidationSchema),
  });

  // Update form values when opportunity data is loaded
  useEffect(() => {
    if (opportunity) {
      const defaultValues = getDefaultValues();
      form.reset(defaultValues);
    }
  }, [opportunity, form, getDefaultValues]);

  const nextStep = async () => {
    if (currentStep === 1) {
      const fieldsToValidate: any[] = ["title", "description", "category", "required_skills", "location"];
      const isValid = await form.trigger(fieldsToValidate);
      if (isValid) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setCurrentStep(2);
      } else {
        toast.error("Please fill in all required fields correctly before proceeding.");
      }
    }
  };

  const prevStep = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentStep(1);
  };

  const handleStepClick = (step: number) => {
    // Linear stepper: only allow navigation to completed steps or current step
    // Cannot skip ahead to future steps
    if (step <= currentStep) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setCurrentStep(step);
    }
  };

  const onSubmit = async (data: OpportunityFormValues) => {
    if (isImageUploading) {
      toast.error("Please wait for image upload to complete");
      return;
    }
    try {
      console.log("Form data being submitted:", data);
      await handleUpdate(data);
    } catch (error) {
      console.error("Error updating opportunity:", error);
    }
  };

  if (isLoadingOpportunity) {
    return (
      <ProtectedLayout>
        <div className="bg-[#F5F7FA] min-h-screen flex items-center justify-center">
          <Loading size="large">
            <p className="text-gray-600 mt-4">Loading opportunity...</p>
          </Loading>
        </div>
      </ProtectedLayout>
    );
  }

  if (!opportunity) {
    return (
      <ProtectedLayout>
        <div className="bg-[#F5F7FA] min-h-screen flex items-center justify-center">
          <NotFound />
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gray-50/30">
        <div className="max-w-[1240px] mx-auto pt-6 px-4">
          <BackButton />
        </div>

        <div className="max-w-[1240px] mx-auto px-2 sm:px-4 pb-12">
          <Card className="p-4 sm:p-8 border-none shadow-sm bg-white">
            <StepIndicator
              currentStep={currentStep}
              totalSteps={totalSteps}
              steps={steps}
              onStepClick={handleStepClick}
            />
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {currentStep === 1 ? (
                  <StepOne
                    form={form}
                    onImageUploadStateChange={setIsImageUploading}
                  />
                ) : (
                  <StepTwo form={form} />
                )}

                <EditFooter
                  isLoading={isUpdating || isImageUploading}
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  );
};

export default EditOpportunityPage;
