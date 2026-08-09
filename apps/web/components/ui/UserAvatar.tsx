"use client";

import React from "react";

import RandomAvatar from "./random-avatar";

interface UserAvatarProps {
  user: {
    name: string;
    image?: string | null;
  };
  size?: number;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 48,
  className,
}) => {
  // Use RandomAvatar with imageUrl if available
  return (
    <RandomAvatar
      name={user.name}
      imageUrl={user.image}
      size={size}
      className={className}
    />
  );
};

export default UserAvatar;
