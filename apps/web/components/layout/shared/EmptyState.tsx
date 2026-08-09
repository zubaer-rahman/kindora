import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExternalLink, LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  iconClassName?: string;
  showAction?: boolean;
  variant?: "default" | "minimal" | "card";
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  iconClassName,
  showAction = true,
  variant = "default",
}: EmptyStateProps) {
  const baseClasses = "flex flex-col items-center justify-center text-center";

  const variantClasses = {
    default: "py-12 px-4",
    minimal: "py-8 px-4",
    card: "py-16 px-6 bg-white rounded-xl ",
  };

  const iconClasses = cn(
    "text-gray-400 mb-4",
    variant === "default" ? "h-16 w-16" : "h-12 w-12 ",
    iconClassName
  );

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      {Icon && <Icon className={iconClasses} strokeWidth={1.5} />}

      <div className="max-w-sm mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          {description}
        </p>

        {showAction && actionLabel && onAction && (
          <Button
            onClick={onAction}
            variant="secondary"
            size="sm"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 gap-2 cursor-pointer group"
          >
            {actionLabel}
            <ExternalLink className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
