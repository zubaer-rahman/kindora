import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Camera, Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { useAxiosAuth } from '@/hooks/useAxiosAuth';
import toast from 'react-hot-toast';
import { UseFormSetValue } from 'react-hook-form';
import { uploadService } from '@/services/upload.service';

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
  const axiosAuth = useAxiosAuth();

  const uploadMutation = useMutation({
    mutationFn: async (payload: { base64File: string; fileName: string; fileType: string; folder: string }) => {
      const data = await uploadService.uploadImage(axiosAuth, payload);
      return data;
    },
    onSuccess: (data) => {
      const link = data.link;
      setUploadedLink(link);
      setValue(name, link as any);
      onUploadStateChange?.(false);
      toast.success('Photo uploaded successfully');
    },
    onError: (error: any) => {
      onUploadStateChange?.(false);
      toast.error(error?.response?.data?.message || 'Failed to upload photo');
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
        "flex items-center justify-between w-full p-2 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors group",
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

      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center border border-border flex-shrink-0">
          {uploadMutation.isPending ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : imageSrc ? (
            <Image
              src={imageSrc}
              alt="Profile"
              fill
              className="object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-foreground truncate">Profile Photo</span>
          <span className="text-xs text-muted-foreground">Click to change</span>
        </div>
      </div>

      <div className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0">
        <Camera className="w-5 h-5" />
      </div>
    </div>
  );
}