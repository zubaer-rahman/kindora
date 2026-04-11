import React from "react";
import RandomAvatar from "@/components/ui/random-avatar";

interface AvatarProps {
  name: string;
  image?: string | null;
  size?: number;
}

export const Avatar: React.FC<AvatarProps & { className?: string }> = ({ name, size = 40, className }) => {
  // Always use RandomAvatar
  return (
    <RandomAvatar
      name={name}
      size={size}
      className={className}
    />
  );
};

export default Avatar; 