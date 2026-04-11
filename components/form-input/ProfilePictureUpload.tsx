import React from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import RandomAvatar from '@/components/ui/random-avatar';

type ProfilePictureUploadProps = {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  userName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  uniqueId?: string;
};

export function ProfilePictureUpload({
  userName,
  size = 'md',
  className,
}: ProfilePictureUploadProps) {
  const sizeMap = {
    sm: 64,
    md: 96,
    lg: 128
  };

  return (
    <div className={cn("flex flex-col items-center space-y-4 opacity-60", className)}>
      <div className="relative">
        <RandomAvatar
          name={userName}
          size={sizeMap[size]}
          className="ring-4 ring-gray-200 shadow-lg"
        />
        
        {/* Disabled overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full">
          <Lock className="h-6 w-6 text-white" />
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