"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useSearchParams } from "next/navigation";

const BackButton = ({ className, fallbackUrl }: { className?: string; fallbackUrl?: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [canGoBack, setCanGoBack] = React.useState(false);

  // Check for referrer in URL params
  const referrer = searchParams.get("referrer_url_path");
  const finalFallback = fallbackUrl || referrer;

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      // Show if there's history OR a fallback/referrer to go to
      if (window.history.length > 1 || finalFallback) {
        setCanGoBack(true);
      }
    }
  }, [finalFallback]);

  if (!canGoBack) return null;

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else if (finalFallback) {
      router.push(finalFallback);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleBack}
      variant="ghost"
      size="sm"
      className={cn(
        "group flex my-4 items-center gap-2 text-[#475467] cursor-pointer hover:text-[#101828] hover:bg-gray-50 transition-all duration-200 h-9 px-3 rounded-lg",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
      <span className="text-sm font-medium">Back</span>
    </Button>
  );
};

export default BackButton;
