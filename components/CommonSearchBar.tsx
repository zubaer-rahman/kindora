"use client";

import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface CommonSearchBarProps {
  onSearch?: (query: string, location: string) => void;
  initialQuery?: string;
  initialLocation?: string;
  className?: string;
}

export default function CommonSearchBar({
  onSearch,
  initialQuery = "",
  initialLocation = "",
  className = "",
}: CommonSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery, location);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white rounded-2xl shadow-xl border border-gray-100 w-full p-4 sm:p-5 md:py-8 md:px-[27px] md:mx-auto ${className}`}
      style={{
        boxShadow: "0 9px 32px 0 rgba(0, 0, 0, 0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "10px",
        borderRadius: "24px",
        background: "#FFF",
        maxWidth: "813px",
      }}
    >
      {/* Desktop Labels Row - positioned horizontally at the top */}
      <div className="hidden md:flex flex-row pb-3 w-full">
        <label className="text-sm font-medium text-gray-900 text-left flex-1">
          What
        </label>
        <label className="text-sm font-medium text-gray-900 text-left flex-1 translate-x-[-50px]">
          Where
        </label>
      </div>

      {/* Mobile Layout - Simple Vertical Stack */}
      <div className="flex flex-col md:hidden gap-3 w-full">
        {/* What Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-900">
            What
          </label>
          <div className="flex items-center gap-3 border border-[#A4A7AE] rounded-lg px-4 py-3 min-h-[48px]">
            <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <Input
              type="text"
              placeholder="Keywords (e.g., food bank, mentor)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 text-base p-0 placeholder:text-gray-400 bg-transparent flex-1 min-w-0 shadow-none"
            />
          </div>
        </div>

        {/* Where Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-900">
            Where
          </label>
          <div className="flex items-center gap-3 border border-[#A4A7AE] rounded-lg px-4 py-3 min-h-[48px]">
            <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <Input
              type="text"
              placeholder="Suburb, city or postcode"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 text-base p-0 placeholder:text-gray-400 bg-transparent flex-1 min-w-0 shadow-none"
            />
          </div>
        </div>

        {/* Search Button */}
        <Button
          type="submit"
          className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-6 py-3 h-[48px] w-full text-base font-bold border-none rounded-lg whitespace-nowrap mt-2"
        >
          Search
        </Button>
      </div>

      {/* Desktop Layout - Horizontal Row */}
      <div className="hidden md:flex flex-row items-center gap-0 border border-[#A4A7AE] p-1 rounded-full w-full">
        {/* What Input */}
        <div className="flex-1 flex items-center gap-3 px-4 py-0 min-h-[48px]">
          <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
          <Input
            type="text"
            placeholder="Keywords(e.g.,food bank,mentor)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 text-base p-0 placeholder:text-gray-400 bg-transparent flex-1 min-w-0 shadow-none"
          />
        </div>

        {/* Vertical Separator */}
        <div className="w-px h-[24px] bg-[#A4A7AE80] mr-7"></div>

        {/* Where Input */}
        <div className="flex-1 flex items-center gap-3 px-4 py-0 min-h-[48px]">
          <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
          <Input
            type="text"
            placeholder="Suburb, city or postcode"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 text-base p-0 placeholder:text-gray-400 bg-transparent flex-1 min-w-0 shadow-none"
          />
        </div>

        {/* Search Button */}
        <Button
          type="submit"
          className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-8 py-3 h-[48px] w-[142px] text-base font-bold border-none rounded-full whitespace-nowrap"
        >
          Search
        </Button>
      </div>
    </form>
  );
}

