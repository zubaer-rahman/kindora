"use client";

import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateFooterProps {
  isLoading: boolean;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
}

export default function CreateFooter({
  isLoading,
  currentStep,
  totalSteps,
  onNext,
  onBack,
}: CreateFooterProps) {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex justify-between items-center mt-10 px-4 sm:px-6">
      <Button
        key="back-button"
        type="button"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onBack();
        }}
        disabled={currentStep === 1 || isLoading}
        className={cn(
          "px-6 py-2 h-11 transition-all duration-200 flex items-center gap-2",
          currentStep === 1 ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </Button>

      <div className="flex gap-4">
        {!isLastStep ? (
          <Button
            key="next-button"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onNext();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 h-11 min-w-[120px] flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            key="submit-button"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 h-11 min-w-[160px]"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Creating...
              </>
            ) : (
              "Create Opportunity"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
