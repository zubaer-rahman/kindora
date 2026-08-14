"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, X } from "lucide-react";

interface ProfileCardProps {
  title: string;
  editMode: "active" | "inactive";
  onEditClick: () => void;
  onCancelClick: () => void;
  children: React.ReactNode;
  className?: string;
  noBg?: boolean;
}

export function ProfileCard({
  title,
  editMode,
  onEditClick,
  onCancelClick,
  children,
  className = "",
  noBg = false,
}: Partial<ProfileCardProps>) {
  return (
    <div className={`${noBg ? "" : "bg-card rounded-lg shadow-sm border border-border"} p-4 sm:p-6 ${className}`}>
      {(title || editMode) && (
        <div className="flex items-center justify-between gap-3 mb-6">
          {title && <h2 className="text-base sm:text-lg font-semibold text-foreground">{title}</h2>}
          {editMode === "inactive" && onEditClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditClick}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
          {editMode === "active" && onCancelClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelClick}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      )}
      {children}
    </div>
  );
} 