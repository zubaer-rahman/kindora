"use client";

import React from "react";
import { ProfileCard } from "./ProfileCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatText } from "@/utils/helpers/formatText";

interface InformationCardProps {
  title: string;
  editMode: string;
  onEditClick: () => void;
  onCancelClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function InformationCard({
  title,
  editMode,
  onEditClick,
  onCancelClick,
  children,
  className = "",
}: InformationCardProps) {
  return (
    <ProfileCard
      title={title}
      editMode={editMode === 'active' || editMode === 'inactive' ? editMode : undefined}
      onEditClick={onEditClick}
      onCancelClick={onCancelClick}
      className={className}
    >
      {children}
    </ProfileCard>
  );
}

interface InfoFieldProps {
  label: string;
  value?: string;
  className?: string;
}

export function InfoField({ label, value, className = "" }: InfoFieldProps) {
  return (
    <div className={className}>
      <p className="text-sm font-medium text-gray-500 mb-2">{label}</p>
      <p className="text-gray-900 font-medium text-base">{value || "Not specified"}</p>
    </div>
  );
}

interface InfoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function InfoGrid({ children, className = "" }: InfoGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 ${className}`}>
      {children}
    </div>
  );
}

interface BadgeListProps {
  label: string;
  items?: string[];
  badgeColor?: "blue" | "green" | "purple" | "orange";
  emptyMessage?: string;
  className?: string;
}

export function BadgeList({ 
  label, 
  items, 
  badgeColor = "blue", 
  emptyMessage = "No items specified",
  className = "" 
}: BadgeListProps) {
  const getBadgeClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors";
      case "green":
        return "px-3 py-1.5 text-sm bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors";
      case "purple":
        return "px-3 py-1.5 text-sm bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors";
      case "orange":
        return "px-3 py-1.5 text-sm bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-colors";
      default:
        return "px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors";
    }
  };

  return (
    <div className={className}>
      <p className="text-sm font-medium text-gray-500 mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items && items.length > 0 ? (
          items.map((item: string, index: number) => (
            <Badge
              key={index}
              variant="secondary"
              className={getBadgeClasses(badgeColor)}
            >
              {formatText(item)}
            </Badge>
          ))
        ) : (
          <p className="text-gray-500 italic text-sm">{emptyMessage}</p>
        )}
      </div>
    </div>
  );
}

interface SubmitButtonProps {
  isPending: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function SubmitButton({ 
  isPending, 
  children = "Save Changes",
  className = "" 
}: SubmitButtonProps) {
  return (
    <div className="flex justify-end pt-4 border-t border-gray-200">
      <Button 
        type="submit" 
        className={`bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer w-full sm:w-auto text-base ${className}`}
        disabled={isPending}
      >
        {isPending ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </span>
        ) : (
          children
        )}
      </Button>
    </div>
  );
}