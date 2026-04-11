"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CATEGORIES_OPTIONS } from "@/utils/constants";
import { useState, useEffect } from "react";

interface FilterSidebarProps {
  onFilterChange: (filters: VolunteerFilters) => void;
  currentFilters?: VolunteerFilters;
}

export interface VolunteerFilters {
  categories: string[];
  studentType: "yes" | "no" | "all";
  memberType: "staff" | "alumni" | "general_public" | "all";
  availability: {
    startDate: string | null;
    endDate: string | null;
  };
  location?: string;
}

export default function FilterSidebar({ onFilterChange, currentFilters }: FilterSidebarProps) {
  const [filters, setFilters] = useState<VolunteerFilters>(
    currentFilters || {
      categories: [],
      studentType: "all",
      memberType: "all",
      availability: {
        startDate: null,
        endDate: null,
      },
      location: "",
    }
  );

  // Update internal state when currentFilters prop changes
  useEffect(() => {
    if (currentFilters) {
      setFilters(currentFilters);
    }
  }, [currentFilters]);

  const handleCategoryChange = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];

    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, location: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="w-full md:w-[280px] bg-white rounded-lg shadow-sm p-4 md:h-[800px] flex flex-col">
      <h3 className="font-semibold text-base mb-4">Filters</h3>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-6">
            {/* Location */}
            <div>
              <h4 className="font-medium text-xs mb-3">Location</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.location || ""}
                  onChange={handleLocationChange}
                />
              </div>
            </div>

            <Separator className="my-6" />

            {/* Categories */}
            <div>
              <h4 className="font-medium text-xs mb-3">Categories</h4>
              <div className="space-y-2">
                {CATEGORIES_OPTIONS.map((category) => (
                  <div key={category.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.value}
                      checked={filters.categories.includes(category.value)}
                      onCheckedChange={() => handleCategoryChange(category.value)}
                    />
                    <Label htmlFor={category.value} className="text-xs">{category.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
} 