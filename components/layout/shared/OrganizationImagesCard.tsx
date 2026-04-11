"use client";

import React from "react";
import Image from "next/image";
import { ProfileCard } from "./ProfileCard";
import { ProfilePictureUpload } from "@/components/form-input/ProfilePictureUpload";
import OrganizationAvatar from "@/components/ui/OrganizationAvatar";
import { Lock } from "lucide-react";
import placeholder_image from "../../../public/images/banners/cover_placeholder.png"

// Cover Image Upload Component
function CoverImageUpload({
  currentImage,
  organizationName,
}: {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  organizationName: string;
  uniqueId?: string;
}) {
  return (
    <div className="flex flex-col items-center space-y-3 opacity-60">
      <div className="relative">
        <div 
          className="w-56 h-28 overflow-hidden border-2 border-gray-200 shadow-lg"
          style={{ borderRadius: '12px' }}
        >
          {currentImage ? (
            <Image
              src={currentImage}
              alt={`${organizationName} cover`}
              fill
              className="object-cover rounded-xl"
            />
          ) : (
            <Image
              src={placeholder_image}
              alt="Placeholder cover image"
              fill
              className="object-cover rounded-xl"
            />
          )}
        </div>
        
        {/* Disabled overlay */}
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30"
          style={{ borderRadius: '12px' }}
        >
          <div className="text-white text-center">
            <Lock className="h-6 w-6 mx-auto mb-1" />
            <div className="text-xs">Uploads Disabled</div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-sm text-gray-500 font-medium">
          Uploads temporarily disabled
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Please try again later
        </div>
      </div>
    </div>
  );
}

interface OrganizationImagesCardProps {
  editMode: "active" | "inactive";
  onEditClick: () => void;
  onCancelClick: () => void;
  profileImage?: string;
  coverImage?: string;
  organizationName: string;
  onProfileImageChange: (imageUrl: string) => void;
  onCoverImageChange: (imageUrl: string) => void;
  className?: string;
}

export function OrganizationImagesCard({
  editMode,
  onEditClick,
  onCancelClick,
  profileImage,
  coverImage,
  organizationName,
  onProfileImageChange,
  onCoverImageChange,
  className = "",
}: OrganizationImagesCardProps) {
  return (
    <ProfileCard
      title="Organization Images"
      editMode={editMode}
      onEditClick={onEditClick}
      onCancelClick={onCancelClick}
      className={className}
    >
      {editMode === "active" ? (
        <div className="space-y-6">
          {/* Organization Profile Picture Upload */}
          <div className="space-y-4">
                      <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Organisation Logo</h3>
            <p className="text-sm text-gray-500">This will be displayed as your organisation&apos;s logo across the platform</p>
          </div>
            <div className="flex justify-center">
              <ProfilePictureUpload
                currentImage={profileImage}
                onImageChange={onProfileImageChange}
                userName={organizationName}
                size="lg"
                uniqueId="organization"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Organization Cover Image Upload */}
          <div className="space-y-4">
                      <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Organisation Cover Image</h3>
            <p className="text-sm text-gray-500">This will be displayed as your organisation&apos;s banner image on your profile</p>
          </div>
            <div className="flex justify-center">
              <CoverImageUpload
                currentImage={coverImage}
                onImageChange={onCoverImageChange}
                organizationName={organizationName}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
          {/* Organization Logo Section */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
              <OrganizationAvatar 
                organization={{
                  title: organizationName,
                  profile_img: profileImage
                }}
                size={80}
                className="h-24 w-24 lg:h-28 lg:w-28 ring-3 ring-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 relative z-10"
              />
              {!profileImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-full">
                  <div className="text-center">
                    <div className="text-blue-400 text-2xl mb-1">🏢</div>
                    <div className="text-xs text-blue-600 font-semibold">Add Logo</div>
                  </div>
                </div>
              )}
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Organisation Logo</h3>
              <p className="text-sm text-gray-500">Your brand identity</p>
            </div>
          </div>
          
          {/* Organization Cover Image */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
              <div className="relative w-64 h-32 lg:w-72 lg:h-36 rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
                {coverImage ? (
                  <Image
                    src={coverImage}
                    alt={`${organizationName} cover`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Image
                    src="/images/banners/cover_placeholder.png"
                    alt="Placeholder cover image"
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Cover Image</h3>
              <p className="text-sm text-gray-500">Your organisation banner</p>
            </div>
          </div>
        </div>
      )}
    </ProfileCard>
  );
} 