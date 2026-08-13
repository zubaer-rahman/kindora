"use client";

import { useForm, Resolver } from "react-hook-form";
import { Form } from "@/components/ui/form";
import toast from "react-hot-toast";
import { OpportunityFormValues } from "./_components/types";
import CreateFooter from "./_components/CreateFooter";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { opportunityValidationSchema } from "@/utils/validation/opportunity";
import { SKILL_OPTIONS } from "@/utils/constants";
import { useState, useEffect } from "react";
import StepIndicator from "./_components/StepIndicator";
import StepOne from "./_components/StepOne";
import StepTwo from "./_components/StepTwo";
import BackButton from "@/components/buttons/BackButton";
import { Card } from "@/components/ui/card";
import { useAuthCheck } from "@/hooks/useAuthCheck";

export default function CreateOpportunityPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { profileCheck } = useAuthCheck();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const role = session?.user?.role as string | undefined;
  const isOrgRole = role === "organization" || role === "organisation" || role === "admin";

  useEffect(() => {
    if (session && isOrgRole && !profileCheck?.hasOrganizationProfile) {
      router.replace("/organisation/profile");
    }
  }, [session, role, profileCheck?.hasOrganizationProfile, router, isOrgRole]);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const steps = [
    { title: "Opportunity Details", description: "General information and role description" },
    { title: "Logistics & Contact", description: "Schedule, requirements and contact info" },
  ];

  const createSkillMutation = useMutation({
    mutationFn: async (payload: { name: string }) => {
      const res = await axiosAuth.post("/api/v1/skills", payload);
      return res.data.data;
    },
  });
  const createOpportunity = useMutation({
    mutationFn: async (payload: OpportunityFormValues) => {
      const res = await axiosAuth.post("/api/v1/opportunities", payload);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Opportunity created successfully!");
      queryClient.invalidateQueries({ queryKey: ["organizationOpportunities"] });
      const dashboardPath = role === "mentor" ? "/mentor/dashboard" : "/organisation/dashboard";
      router.push(dashboardPath);
    },
    onError: (error: any) => {
      let msg = "Failed to create opportunity. Please check all required fields and try again.";
      msg = error?.response?.data?.message || msg;
      toast.error(msg);
    },
  });

  const form = useForm<OpportunityFormValues>({
    defaultValues: {
      title: "",
      description: "",
      category: [],
      required_skills: [],
      commitment_type: "workbased",
      location: "",
      number_of_volunteers: 1,
      email_contact: "",
      phone_contact: "",
      external_event_link: "",
      start_date: "",
      start_time: "",
      end_date: "",
      end_time: "",
      is_recurring: false,
      recurrence: {
        type: "weekly",
        days: [],
        date_range: { start_date: "", end_date: "" },
        time_range: { start_time: "", end_time: "" },
        occurrences: undefined,
      },
      banner_img: "",
      requirements: [],
    },
    mode: "onChange",
    resolver: zodResolver(opportunityValidationSchema) as Resolver<OpportunityFormValues>,
  });

  const nextStep = async () => {
    if (currentStep === 1) {
      const fieldsToValidate: any[] = ["title", "description", "category", "required_skills", "location"];

      // If user is a mentor, also validate organization_id
      if (session?.user?.role === "mentor") {
        fieldsToValidate.push("organization_id");
      }

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

  const onSubmit = (data: OpportunityFormValues) => {
    if (isImageUploading) {
      toast.error("Please wait for image upload to complete");
      return;
    }

    // Create new skills that don't exist in SKILL_OPTIONS
    const newSkills = data.required_skills?.filter(skill =>
      !SKILL_OPTIONS.find((opt: { value: string; label: string }) => opt.value === skill)
    ) || [];

    // Create new skills in the database
    newSkills.forEach(async (skillName) => {
      try {
        await createSkillMutation.mutateAsync({ name: skillName });
      } catch (error) {
        console.error("Failed to create skill:", error);
      }
    });

    const formattedData = {
      ...data,
      email_contact: data.email_contact || "",
      phone_contact: data.phone_contact || "",
      internal_reference: data.internal_reference || "",
      external_event_link: data.external_event_link || "",
      end_date: data.end_date || "",
      end_time: data.end_time || "",
      banner_img: data.banner_img || "",
    };
    createOpportunity.mutate(formattedData);
  };

  return (
    <ProtectedLayout>
      <div className="min-h-screen ">
        <div className="max-w-[1280px] mx-auto pt-6 px-4">
          <BackButton />
        </div>

        <div className="max-w-[1280px] mx-auto px-2 sm:px-4 pb-12">
          <Card className="p-4 sm:p-8 border-none shadow-sm bg-card">
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
                    userRole={session?.user?.role as string}
                  />
                ) : (
                  <StepTwo form={form} />
                )}

                <CreateFooter
                  isLoading={createOpportunity.isPending || isImageUploading}
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
}
