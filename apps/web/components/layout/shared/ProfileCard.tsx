"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, X } from "lucide-react";
import RandomAvatar from "@/components/ui/random-avatar";

interface ProfileCardProps {
  title: string;
  editMode: "active" | "inactive";
  onEditClick: () => void;
  onCancelClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ProfileCard({
  title,
  editMode,
  onEditClick,
  onCancelClick,
  children,
  className = "",
}: Partial<ProfileCardProps>) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {(title || editMode) && (
        <div className="flex items-center justify-between mb-6">
          {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
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

interface ProfilePictureCardProps {
  editMode: "active" | "inactive";
  onEditClick: () => void;
  onCancelClick: () => void;
  onImageChange: (imageUrl: string) => void;
  userName: string;
  userRole?: string;
  userEmail?: string;
  className?: string;
}

export function ProfilePictureCard({
  editMode,
  onEditClick,
  onCancelClick,
  userName,
  userRole = "User",
  userEmail,
  className = "",
}: ProfilePictureCardProps) {
  return (
    <ProfileCard
      title="Profile Picture"
      editMode={editMode}
      onEditClick={onEditClick}
      onCancelClick={onCancelClick}
      className={className}
    >
      {editMode === "active" ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <RandomAvatar
            name={userName}
            size={80}
            className="h-16 w-16 sm:h-20 sm:w-20 ring-3 ring-gray-100"
          />
          <div>
            <p className="text-base text-gray-600 font-medium">Random Avatar</p>
            <p className="text-sm text-gray-500 mt-1">Your avatar is automatically generated based on your name</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-8">
          <RandomAvatar
            name={userName}
            size={80}
            className="h-16 w-16 sm:h-20 sm:w-20 ring-3 ring-gray-100"
          />
          <div className="text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              {userName}
            </h3>
            <p className="text-base sm:text-lg text-gray-600 font-medium">{userRole}</p>
            {userEmail && (
              <p className="text-sm sm:text-base text-gray-500 mt-1">{userEmail}</p>
            )}
          </div>
        </div>
      )}
    </ProfileCard>
  );
} 