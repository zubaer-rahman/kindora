"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: { title: string; description: string }[];
  onStepClick?: (step: number) => void;
}

export default function StepIndicator({
  currentStep,
  totalSteps,
  steps,
  onStepClick,
}: StepIndicatorProps) {
  const handleStepClick = (stepNumber: number) => {
    // Linear stepper: only allow clicking on completed steps or current step
    // Future steps cannot be clicked
    if (stepNumber <= currentStep && onStepClick) {
      onStepClick(stepNumber);
    }
  };

  return (
    <div className="w-full ">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;
          const isDisabled = currentStep < stepNumber; // Future steps are disabled
          const isLast = index === steps.length - 1;
          const isClickable = !isDisabled && onStepClick;

          return (
            <React.Fragment key={index}>
              {/* Step Content - Circle and Text in same line */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Step Circle */}
                <button
                  type="button"
                  onClick={() => handleStepClick(stepNumber)}
                  disabled={isDisabled}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2",
                    isCompleted
                      ? "bg-[#1570EF] border-[#1570EF] text-white"
                      : isActive
                      ? "border-[#1570EF] text-[#1570EF] bg-white"
                      : "border-gray-300 text-gray-400 bg-white",
                    isClickable &&
                      !isDisabled &&
                      "cursor-pointer hover:border-[#1570EF]/70",
                    isDisabled && "cursor-not-allowed opacity-60"
                  )}
                  aria-label={`Step ${stepNumber}: ${step.title}`}
                  aria-current={isActive ? "step" : undefined}
                  aria-disabled={isDisabled}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" strokeWidth={3} />
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}
                </button>

                {/* Step Label - on same line */}
                <div className="flex flex-col">
                  <p
                    className={cn(
                      "text-sm font-normal transition-colors duration-300",
                      isActive
                        ? "text-[#1570EF]"
                        : isCompleted
                        ? "text-gray-900"
                        : "text-gray-500"
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 relative flex items-center mx-4 min-w-[50px]">
                  <div className="w-full relative h-8 flex items-center">
                    {/* Background line */}
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] -translate-y-1/2 bg-gray-300" />
                    {/* Active/Completed line - filled if next step is reached */}
                    <div
                      className={cn(
                        "absolute top-1/2 left-0 h-[1px] -translate-y-1/2 bg-[#1570EF] transition-all duration-500 ease-in-out",
                        currentStep > stepNumber ? "right-0" : "w-0"
                      )}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
