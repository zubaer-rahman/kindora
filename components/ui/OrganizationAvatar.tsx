"use client"

import React from "react";
import RandomAvatar from "./random-avatar";

interface OrganizationAvatarProps {
  organization: {
    title: string;
    profile_img?: string | null;
  };
  size?: number;
  className?: string;
  shape?: 'circle' | 'square' | 'rounded';
  objectFit?: 'cover' | 'contain';
}

export const OrganizationAvatar: React.FC<OrganizationAvatarProps> = ({
  organization,
  size = 48,
  className,
  shape = 'rounded',
  objectFit = 'contain'
}) => {
  // Always use RandomAvatar
  return (
    <RandomAvatar
      name={organization.title}
      imageUrl={organization.profile_img}
      size={size}
      className={className}
      shape={shape}
      objectFit={objectFit}
    />
  );
};

export default OrganizationAvatar;