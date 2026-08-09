"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CATEGORIES_OPTIONS, STATES_OPTIONS } from "@/utils/constants";
import { cn } from "@/lib/utils";
import {
  Users,
  GraduationCap,
  HeartPulse,
  Briefcase,
  Monitor,
  PawPrint,
  Palette,
  Leaf,
  Home,
  User,
  Venus,
  Code,
  Heart,
  BookOpen,
  UserCog,
  FileStack,
  Building2,
  Globe,
  Activity,
  Smile,
  Handshake,
} from "lucide-react";
import { useSearch } from "@/contexts/SearchContext";
import { useState, useEffect } from "react";

// Map categories to icons
const getCategoryIcon = (categoryValue: string) => {
  const iconMap: Record<string, typeof Users> = {
    "Community & Social Services": Users,
    "Education & Mentorship": GraduationCap,
    "Healthcare & Medical Volunteering": HeartPulse,
    "Corporate & Skilled Volunteering": Briefcase,
    "Technology & Digital Volunteering": Monitor,
    "Animal Welfare": PawPrint,
    "Arts, Culture & Heritage": Palette,
    "Environmental & Conservation": Leaf,
    "homeless": Home,
    "education": BookOpen,
    "health": Heart,
    "seniors": User,
    "youth": Users,
    "disability_support": UserCog,
    "disaster_relief": FileStack,
    "technology": Code,
    "women_empowerment": Venus,
    // Bottom 4 categories - each with separate icon
    "refugees": Globe,
    "sports": Activity,
    "mental_health": Smile,
    "community_development": Handshake,
  };

  return iconMap[categoryValue] || Building2;
};

interface FilterSidebarProps {
  className?: string;
  variant?: "default" | "search" | "volunteer";
  // For volunteer variant
  onFilterChange?: (filters: VolunteerFilters) => void;
  currentFilters?: VolunteerFilters;
}

export interface VolunteerFilters {
  categories: string[];
  locations: string[];
}

export default function FilterSidebar({
  className = "",
  variant = "default",
  onFilterChange,
  currentFilters
}: FilterSidebarProps) {

  const {
    filters,
    setCategories,
    setCommitmentType,
    setLocation,
    clearAllFilters,
  } = useSearch();

  // Local state for volunteer variant
  const [volunteerFilters, setVolunteerFilters] = useState<VolunteerFilters>(
    currentFilters || {
      categories: [],
      locations: [],
    }
  );

  // Update volunteer filters when prop changes
  useEffect(() => {
    if (currentFilters && variant === "volunteer") {
      setVolunteerFilters(currentFilters);
    }
  }, [currentFilters, variant]);

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
    if (variant === "volunteer") {
      const newCategories = volunteerFilters.categories.includes(category)
        ? volunteerFilters.categories.filter((c) => c !== category)
        : [...volunteerFilters.categories, category];

      const newFilters = { ...volunteerFilters, categories: newCategories };
      setVolunteerFilters(newFilters);
      onFilterChange?.(newFilters);
    } else {
      const newCategories = filters.categories.includes(category)
        ? filters.categories.filter((c) => c !== category)
        : [...filters.categories, category];
      setCategories(newCategories);
    }
  };

  const handleLocationChange = (location: string) => {
    if (variant === "volunteer") {
      const newLocations = volunteerFilters.locations.includes(location)
        ? volunteerFilters.locations.filter((l) => l !== location)
        : [...volunteerFilters.locations, location];

      const newFilters = { ...volunteerFilters, locations: newLocations };
      setVolunteerFilters(newFilters);
      onFilterChange?.(newFilters);
    } else {
      setLocation(location);
    }
  };

  const hasActiveFilters =
    filters.categories.length > 0 || filters.commitmentType !== "all";

  if (variant === "search") {
    return (
      <div className={cn("w-full min-h-[calc(100vh-200px)] bg-[#F7F7F7] rounded-2xl p-4", className)}>
        <Accordion type="multiple" defaultValue={["categories", "experience"]} className="w-full border-none">
          {/* Categories Section */}
          <AccordionItem value="categories" className="border-none">
            <AccordionTrigger className="hover:no-underline py-2">
              <span className="text-base font-semibold text-[#101828]">Category</span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
              <Select
                onValueChange={(value) => {
                  if (value && !filters.categories.includes(value)) {
                    handleCategoryChange(value);
                  }
                }}
              >
                <SelectTrigger className="w-full border-[#D0D5DD] rounded-lg h-11">
                  <SelectValue placeholder="Select Categories" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES_OPTIONS.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {filters.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {filters.categories.map((catValue) => {
                    const label = CATEGORIES_OPTIONS.find(c => c.value === catValue)?.label || catValue;
                    return (
                      <div
                        key={catValue}
                        className="flex items-center gap-1 px-2 py-1 bg-[#F2F4F7] rounded-md text-xs font-medium text-[#344054]"
                      >
                        {label}
                        <button
                          onClick={() => handleCategoryChange(catValue)}
                          className="hover:text-[#101828]"
                        >
                          <ChevronRight className="h-3 w-3 rotate-45" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <Separator className="bg-[#E9EAEB] my-2" />

          {/* Experience Level (Commitment Type) Section */}
          <AccordionItem value="experience" className="border-none">
            <AccordionTrigger className="hover:no-underline py-2">
              <span className="text-base font-semibold text-[#101828]">Experience level</span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="search-work-based"
                  checked={filters.commitmentType === "workbased"}
                  onCheckedChange={handleWorkBasedChange}
                  className="h-5 w-5 border-[#D0D5DD] data-[state=checked]:bg-[#1570EF] data-[state=checked]:border-[#1570EF] rounded"
                />
                <Label
                  htmlFor="search-work-based"
                  className="text-sm text-[#344054] font-normal cursor-pointer"
                >
                  Work based
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="search-event-based"
                  checked={filters.commitmentType === "eventbased"}
                  onCheckedChange={handleEventBasedChange}
                  className="h-5 w-5 border-[#D0D5DD] data-[state=checked]:bg-[#1570EF] data-[state=checked]:border-[#1570EF] rounded"
                />
                <Label
                  htmlFor="search-event-based"
                  className="text-sm text-[#344054] font-normal cursor-pointer"
                >
                  Event based
                </Label>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }

  if (variant === "volunteer") {
    const activeCategories = volunteerFilters.categories;
    const activeLocations = volunteerFilters.locations;

    return (
      <div className={cn("w-full min-h-[calc(100vh-200px)] bg-[#F7F7F7] rounded-lg p-4", className)}>
        <Accordion type="multiple" defaultValue={["location", "categories"]} className="w-full border-none">
          {/* Location Section */}
          <AccordionItem value="location" className="border-none">
            <AccordionTrigger className="hover:no-underline py-2">
              <span className="text-base font-semibold text-[#101828]">Location</span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
              <Select
                onValueChange={(value) => {
                  if (value && !activeLocations.includes(value)) {
                    handleLocationChange(value);
                  }
                }}
              >
                <SelectTrigger className="w-full bg-white border-[#D0D5DD] rounded-lg h-11">
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  {STATES_OPTIONS.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {activeLocations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {activeLocations.map((locValue) => {
                    const label = STATES_OPTIONS.find(s => s.value === locValue)?.label || locValue;
                    return (
                      <div
                        key={locValue}
                        className="flex items-center gap-1 px-2 py-1 bg-[#F2F4F7] rounded-md text-xs font-medium text-[#344054]"
                      >
                        {label}
                        <button
                          onClick={() => handleLocationChange(locValue)}
                          className="hover:text-[#101828]"
                        >
                          <ChevronRight className="h-3 w-3 rotate-45" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <Separator className="bg-[#E9EAEB] my-2" />

          {/* Categories Section */}
          <AccordionItem value="categories" className="border-none">
            <AccordionTrigger className="hover:no-underline py-2">
              <span className="text-base font-semibold text-[#101828]">Category</span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
              <Select
                onValueChange={(value) => {
                  if (value && !activeCategories.includes(value)) {
                    handleCategoryChange(value);
                  }
                }}
              >
                <SelectTrigger className="w-full bg-white border-[#D0D5DD] rounded-lg h-11">
                  <SelectValue placeholder="Select Categories" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES_OPTIONS.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {activeCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {activeCategories.map((catValue) => {
                    const label = CATEGORIES_OPTIONS.find(c => c.value === catValue)?.label || catValue;
                    return (
                      <div
                        key={catValue}
                        className="flex items-center gap-1 px-2 py-1 bg-[#F2F4F7] rounded-md text-xs font-medium text-[#344054]"
                      >
                        {label}
                        <button
                          onClick={() => handleCategoryChange(catValue)}
                          className="hover:text-[#101828]"
                        >
                          <ChevronRight className="h-3 w-3 rotate-45" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }

  return (

    <div
      className={cn("w-full sm:w-[320px] flex flex-col gap-[10px] p-[24px_25px_32px_20px] rounded-[24px] bg-[#F5FAFF]", className)}
    >
      <div className="w-full pb-4 border-b border-[#E9EAEB]">
        <h3 className="font-semibold text-base text-[#414651]">Filter</h3>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)] w-full flex-1">
        <div className="space-y-6 pt-4 w-full">
          {/* Commitment Type */}
          <div>
            <h4 className="font-medium text-xs text-[#414651] mb-4">Commitment Type</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="work-based"
                  checked={filters.commitmentType === "workbased"}
                  onCheckedChange={handleWorkBasedChange}
                  className="border-[#A4A7AE] data-[state=checked]:bg-[#2563EB] data-[state=checked]:border-[#2563EB]"
                />
                <Label
                  htmlFor="work-based"
                  className="text-xs text-[#414651] font-normal cursor-pointer"
                >
                  Work based
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="event-based"
                  checked={filters.commitmentType === "eventbased"}
                  onCheckedChange={handleEventBasedChange}
                  className="border-[#A4A7AE] data-[state=checked]:bg-[#2563EB] data-[state=checked]:border-[#2563EB]"
                />
                <Label
                  htmlFor="event-based"
                  className="text-xs text-[#414651] font-normal cursor-pointer"
                >
                  Event based
                </Label>
              </div>
            </div>
          </div>

          <Separator className="bg-[#E9EAEB]" />

          {/* Categories */}
          <div className="w-full">
            <h4 className="font-medium text-xs text-[#414651] mb-3">Categories</h4>
            <div className="flex flex-col gap-2">
              {CATEGORIES_OPTIONS.map((category) => {
                const isSelected = filters.categories.includes(category.value);

                return (
                  <div
                    key={category.value}
                    className="flex items-center space-x-2 py-1"
                  >
                    <Checkbox
                      id={category.value}
                      checked={isSelected}
                      onCheckedChange={() => handleCategoryChange(category.value)}
                      className="border-[#A4A7AE] data-[state=checked]:bg-[#2563EB] data-[state=checked]:border-[#2563EB]"
                    />
                    <Label
                      htmlFor={category.value}
                      className="text-xs text-[#414651] font-normal cursor-pointer flex-1"
                    >
                      {category.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
