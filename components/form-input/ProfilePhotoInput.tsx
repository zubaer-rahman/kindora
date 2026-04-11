import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Camera, Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/utils/trpc';
import toast from 'react-hot-toast';

import { UseFormSetValue } from 'react-hook-form';

type ProfilePhotoInputProps<Ev extends Record<string, any>> = {
  name: any;
  customClassName?: string;
  setValue: UseFormSetValue<Ev>;
  defaultValue?: string;
  label?: string;
  onUploadStateChange?: (isUploading: boolean) => void;
};

export function ProfilePhotoInput<Ev extends Record<string, any>>({
  name,
  customClassName,
  defaultValue,
  setValue,
  onUploadStateChange,
}: ProfilePhotoInputProps<Ev>) {
  const [uploadedLink, setUploadedLink] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.upload.uploadFile.useMutation({
    onSuccess: (response) => {
      const link = response.data.link;
      setUploadedLink(link);
      setValue(name, link as any);
      onUploadStateChange?.(false);
      toast.success('Photo uploaded successfully');
    },
    onError: (error) => {
      onUploadStateChange?.(false);
      toast.error(error.message || 'Failed to upload photo');
    },
  });

  useEffect(() => {
    if (defaultValue) {
      setUploadedLink(defaultValue);
    }
  }, [defaultValue]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Profile photo should be less than 2MB');
      return;
    }

    onUploadStateChange?.(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      uploadMutation.mutate({
        base64File: base64String,
        fileName: file.name,
        fileType: file.type,
        folder: 'profiles',
      });
    };
    reader.readAsDataURL(file);
  };

  const imageSrc = uploadedLink || defaultValue;

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        "flex items-center justify-between w-full p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group",
        uploadMutation.isPending && "opacity-60 cursor-not-allowed pointer-events-none",
        customClassName
      )}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
          {uploadMutation.isPending ? (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          ) : imageSrc ? (
            <Image
              src={imageSrc}
              alt="Profile"
              fill
              className="object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700">Profile Photo</span>
          <span className="text-xs text-gray-500">Click to change</span>
        </div>
      </div>

      <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
        <Camera className="w-5 h-5" />
      </div>
    </div>
  );
}