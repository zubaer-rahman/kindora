import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import RandomAvatar from "@/components/common/RandomAvatar";

export function ProfileSkeleton() {
  return (
    <div className="w-full h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 overflow-hidden">
      <div className="w-full h-full border border-border rounded-lg overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Profile header skeleton */}
          <div className="flex-shrink-0 flex items-center gap-4 p-4 sm:p-6 border-b border-border">
            <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-full flex-shrink-0" />
            <div className="space-y-3 min-w-0 flex-1">
              <Skeleton className="h-6 sm:h-7 w-48 sm:w-64 max-w-full" />
              <Skeleton className="h-4 w-32 sm:w-40 max-w-full" />
            </div>
          </div>

          {/* Profile content skeleton */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-44" />
                <Skeleton className="h-9 w-16" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-36" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-40" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-28" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-7 w-24 rounded-full" />
                  <Skeleton className="h-7 w-20 rounded-full" />
                  <Skeleton className="h-7 w-28 rounded-full" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-7 w-32 rounded-full" />
                  <Skeleton className="h-7 w-24 rounded-full" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProfileLayoutContainerProps {
  children: React.ReactNode;
}

export function ProfileLayoutContainer({ children }: ProfileLayoutContainerProps) {
  return (
    <div className="w-full h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 overflow-hidden">
      <div className="w-full h-full border border-border rounded-lg overflow-hidden">
        <div className="flex flex-col h-full">{children}</div>
      </div>
    </div>
  );
}

interface ProfileHeaderProps {
  name: string;
  imageUrl?: string | null;
  subtitle?: string | null;
}

export function ProfileHeader({ name, imageUrl, subtitle }: ProfileHeaderProps) {
  return (
    <div className="flex-shrink-0 flex items-center gap-4 p-4 sm:p-6 border-b border-border">
      <RandomAvatar
        name={name}
        imageUrl={imageUrl}
        size={72}
        className="h-16 w-16 sm:h-20 sm:w-20 ring-3 ring-border flex-shrink-0"
      />
      <div className="text-left min-w-0">
        <h3 className="text-lg sm:text-xl font-bold text-foreground break-words">{name}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

interface ProfileContentProps {
  children: React.ReactNode;
}

export function ProfileContent({ children }: ProfileContentProps) {
  return <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">{children}</div>;
}
