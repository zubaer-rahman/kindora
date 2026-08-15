"use client";

import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface SearchBarProps {
  onSearch?: (query: string, location: string) => void;
  initialQuery?: string;
  initialLocation?: string;
  className?: string;
}

export default function LandingSearchBar({
  onSearch,
  initialQuery = "",
  initialLocation = "",
  className = "",
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery, location);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-card rounded-2xl sm:rounded-3xl border border-border w-full p-4 sm:p-6 md:py-8 md:px-[27px] shadow-2xl flex flex-col gap-2 md:gap-[10px] ${className}`}
    >
      {/* Desktop Labels Row - positioned horizontally at the top */}
      <div className="hidden md:flex flex-row pb-3 w-full">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-left flex-1 px-4">
          What
        </label>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-left flex-1 px-4">
          Where
        </label>
      </div>

      {/* Mobile Layout - Simple Vertical Stack */}
      <div className="flex flex-col md:hidden gap-3 w-full">
        {/* What Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">What</label>
          <div className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 min-h-[48px] bg-transparent">
            <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <Input
              type="text"
              placeholder="Keywords (e.g., mentor)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 text-sm p-0 placeholder:text-muted-foreground bg-transparent dark:bg-transparent flex-1 min-w-0 shadow-none"
            />
          </div>
        </div>

        {/* Where Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Where</label>
          <div className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 min-h-[48px] bg-transparent">
            <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <Input
              type="text"
              placeholder="Suburb, city or postcode"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 text-sm p-0 placeholder:text-muted-foreground bg-transparent dark:bg-transparent flex-1 min-w-0 shadow-none"
            />
          </div>
        </div>

        {/* Search Button */}
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 h-[48px] w-full text-sm font-semibold border-none rounded-lg whitespace-nowrap mt-2"
        >
          Search
        </Button>
      </div>

      {/* Desktop Layout - Horizontal Row */}
      <div className="hidden md:flex flex-row items-center gap-0 border border-border p-1 rounded-full w-full bg-transparent">
        {/* What Input */}
        <div className="flex-1 flex items-center gap-3 px-4 py-0 min-h-[48px]">
          <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <Input
            type="text"
            placeholder="Keywords (e.g., mentor)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 text-base p-0 placeholder:text-muted-foreground bg-transparent dark:bg-transparent flex-1 min-w-0 shadow-none"
          />
        </div>

        {/* Vertical Separator */}
        <div className="w-px h-[24px] bg-border mr-7"></div>

        {/* Where Input */}
        <div className="flex-1 flex items-center gap-3 px-4 py-0 min-h-[48px]">
          <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <Input
            type="text"
            placeholder="Suburb, city or postcode"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 text-base p-0 placeholder:text-muted-foreground bg-transparent dark:bg-transparent flex-1 min-w-0 shadow-none"
          />
        </div>

        {/* Search Button */}
        <Button
          type="submit"
          className="bg-primary cursor-pointer hover:bg-primary/90 text-primary-foreground px-8 py-3 h-[48px] w-[142px] text-sm font-semibold border-none rounded-full whitespace-nowrap"
        >
          Search
        </Button>
      </div>
    </form>
  );
}
