"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
 import { SearchBar } from "@/components/navbar/SearchBar";

interface OpportunitiesHeaderProps {
  totalItems: number;
  startIndex: number;
  endIndex: number;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export default function OpportunitiesHeader({
  totalItems,
  startIndex,
  endIndex,
  sortBy,
  onSortChange,
}: OpportunitiesHeaderProps) {
   
  
  return (
    <div className="w-full mb-6">
      {/* Full Width Search Bar */}
      <div className="mb-6 w-full">
        <SearchBar role="volunteer" disableOverlay />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          
          <p className="text-gray-600">
            {totalItems > 0
              ? `Showing ${startIndex + 1} - ${endIndex} of ${totalItems} opportunities`
              : totalItems === 0
                ? "No opportunities found"
                : "Loading opportunities..."
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 font-medium">Sort by:</span>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-auto min-w-[160px] bg-white border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recently_added">Recently Added</SelectItem>
              <SelectItem value="start_date">Start Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="border-b border-gray-200 mt-4"></div>
    </div>
  );
}