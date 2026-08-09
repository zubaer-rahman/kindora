import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Control, useController, Path, UseFormSetValue } from 'react-hook-form';
import { trpc } from '@/utils/trpc';
import toast from 'react-hot-toast';

type FormImageInputProps<T extends Record<string, unknown>> = {
  name: Path<T>;
  className?: string;
  setValue: UseFormSetValue<T>;
  defaultValue?: string;
  label?: string;
  control: Control<T>;
  onUploadStateChange?: (isUploading: boolean) => void;
};

export function FormImageInput<T extends Record<string, unknown>>({
  name,
  className,
  defaultValue,
  label,
  control,
  onUploadStateChange,
}: FormImageInputProps<T>) {
  const { field } = useController({
    name,
    control,
  });

  const [uploadedLink, setUploadedLink] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.upload.uploadFile.useMutation({
    onSuccess: (response) => {
      const link = response.data.link;
      setUploadedLink(link);
      field.onChange(link);
      onUploadStateChange?.(false);
      toast.success('Image uploaded successfully');
    },
    onError: (error) => {
      onUploadStateChange?.(false);
      toast.error(error.message || 'Failed to upload image');
    },
  });

  useEffect(() => {
    if (defaultValue) {
      setUploadedLink(defaultValue);
      field.onChange(defaultValue);
    }
  }, [defaultValue, field]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
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
        folder: 'opportunities',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedLink(null);
    field.onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const imageSrc = uploadedLink || defaultValue;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative rounded-lg border-2 border-dashed border-gray-300 p-6 transition-all cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 group',
          uploadMutation.isPending && 'opacity-60 cursor-not-allowed pointer-events-none',
          imageSrc && 'border-solid border-gray-200 p-2',
          className
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {uploadMutation.isPending ? (
          <div className="flex flex-col items-center justify-center p-4 space-y-2">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm font-medium text-gray-500">Uploading...</p>
          </div>
        ) : imageSrc ? (
          <div className="relative w-full aspect-video rounded-md overflow-hidden bg-gray-100">
            <Image
              alt="Uploaded image"
              src={imageSrc}
              fill
              className="object-cover"
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white rounded-full text-red-500 shadow-sm transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <p className="text-white text-sm font-medium">Click to change</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="p-2 bg-blue-50 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Click to upload banner
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG or WEBP (max. 5MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
