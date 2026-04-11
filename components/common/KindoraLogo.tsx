"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface KindoraLogoProps {
  className?: string;
  imageClassName?: string;
  hideText?: boolean; // Kept for API compatibility, but we always show the full logo image
  variant?: "light" | "dark" | "primary";
}

const KindoraLogo: React.FC<KindoraLogoProps> = ({
  className,
  imageClassName,
  variant = "primary",
}) => {
  return (
    <div className={cn("flex items-center relative z-50", className)}>
      <div className={cn(
        "relative transition-all duration-300 rounded-lg overflow-hidden",
        // White pill for dark backgrounds to handle non-transparent logo gracefully
        variant === "light" && "bg-transparent", 
        imageClassName
      )}>
        <Image
          src="/images/logos/kindora-logo.png"
          alt="Kindora Logo"
          width={180}
          height={60}
          className="h-8 md:h-10 w-auto object-contain"
          priority
        />
      </div>
    </div>
  );
};

export default KindoraLogo;
