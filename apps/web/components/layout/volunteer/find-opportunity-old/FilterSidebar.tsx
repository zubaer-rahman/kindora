"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { CATEGORIES_OPTIONS } from "@/utils/constants";
import { useSearch } from "@/contexts/SearchContext";

export default function FilterSidebar() {
  const {
    filters,
    setCategories,
    setCommitmentType,
    setLocation,
    clearAllFilters,
  } = useSearch();

  const handleWorkBasedChange = (checked: boolean) => {
    if (checked) {
      setCommitmentType("workbased");
    } else if (filters.commitmentType === "workbased") {
      setCommitmentType("all");
    }
  };

  const handleEventBasedChange = (checked: boolean) => {
    if (checked) {
      setCommitmentType("eventbased");
    } else if (filters.commitmentType === "eventbased") {
      setCommitmentType("all");
    }
  };

  const handleCategoryChange = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    setCategories(newCategories);
  };

  const handleLocationChange = (location: string) => {
    setLocation(location);
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.commitmentType !== "all" ||
    filters.location;

  return (
    <div className="w-full md:w-[280px] bg-white rounded-lg shadow-sm p-4 md:h-[700px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-base">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs text-gray-500 hover:text-gray-700 p-1 h-auto"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-6">
            {/* Location */}
            <div>
              <h4 className="font-medium text-xs mb-3">Location</h4>
              <Input
                placeholder="Enter location..."
                value={filters.location}
                onChange={(e) => handleLocationChange(e.target.value)}
              />
            </div>

            <Separator />

            {/* Commitment Type */}
            <div>
              <h4 className="font-medium text-xs mb-4">Commitment Type</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="work-based"
                    checked={filters.commitmentType === "workbased"}
                    onCheckedChange={handleWorkBasedChange}
                  />
                  <Label htmlFor="work-based" className="text-xs">Work Based</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="event-based"
                    checked={filters.commitmentType === "eventbased"}
                    onCheckedChange={handleEventBasedChange}
                  />
                  <Label htmlFor="event-based" className="text-xs">Event Based</Label>
                </div>
              </div>
            </div>

            <Separator />

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