"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function OpportunityCardSkeleton() {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden w-full h-[340px] py-0 relative bg-white border border-gray-200 flex flex-col justify-between">
      <CardContent className="p-4 flex flex-col h-full">
        {/* Top: Avatar, Name, Status */}
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex flex-col min-w-0 flex-1">
            <Skeleton className="h-5 w-24 mb-1" /> {/* Name */}
            <Skeleton className="h-4 w-20 rounded-full" /> {/* Status */}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Skeleton className="w-4 h-4 mr-1 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Skills/Interests */}
        <div className="flex flex-wrap gap-1 mb-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>

        {/* Bio/Description */}
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mb-3" />

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto w-full">
          <Skeleton className="flex-1 h-10 rounded-md" />
          <Skeleton className="flex-1 h-10 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

