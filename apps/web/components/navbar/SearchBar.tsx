"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchInput, MobileSearch, DesktopSearch } from "./search";
import { useSearch } from "@/contexts/SearchContext";

interface SearchBarProps {
  role: "mentor" | "volunteer" | "admin" | "organization";
  disableOverlay?: boolean;
}

export function SearchBar({ role, disableOverlay = false }: SearchBarProps) {
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useSearch();
  const [overlay, setOverlay] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchHistory = [
    "environmental cleanup",
    "event volunteer",
    "nonprofit marketing",
    "youth mentor",
  ];

  const allSuggestions = [
    "environmental cleanup",
    "event volunteer",
    "nonprofit marketing",
    "youth mentor",
    "fundraising assistant",
    "community outreach",
    "social media for NGOs",
  ];

  const suggestions = searchQuery
    ? allSuggestions.filter((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    if (overlay) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [overlay]);

  useEffect(() => {
    if (overlay) {
      const timeout = setTimeout(() => {
        setShowDropdown(true);
      }, 600);
      return () => clearTimeout(timeout);
    } else {
      setShowDropdown(false);
    }
  }, [overlay]);

  const placeholder =
    role !== "volunteer" ? "Search for volunteers" : "Search for opportunities";
  const type = role !== "volunteer" ? "volunteer" : "opportunity";

  const PANEL_HEIGHT = 380;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      if (!disableOverlay) {
        router.push(
          `/search?type=${type}&q=${encodeURIComponent(searchQuery)}`
        );
      }
      setOverlay(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSelect = (item: string) => {
    setSearchQuery(item);
    router.push(`/search?type=${type}&q=${encodeURIComponent(item)}`);
    setOverlay(false);
  };

  return (
    <>
      <AnimatePresence>
        {overlay && !disableOverlay && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 bg-black/30 w-full z-40"
              onClick={() => setOverlay(false)}
            />
            <motion.div
              initial={{ height: 160, opacity: 0 }}
              animate={{ height: PANEL_HEIGHT, opacity: 1 }}
              exit={{ height: 160, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="fixed top-0 left-0 w-full z-50 bg-white origin-top overflow-hidden"
            >
              <div className="w-full h-full flex flex-col overflow-hidden">
                <MobileSearch
                  query={searchQuery}
                  placeholder={placeholder}
                  onInput={handleInput}
                  onSearch={handleSearch}
                  searchHistory={searchHistory}
                  suggestions={suggestions}
                  showDropdown={showDropdown}
                  onSelect={handleSelect}
                  onClose={() => setOverlay(false)}
                />
                <DesktopSearch
                  query={searchQuery}
                  placeholder={placeholder}
                  onInput={handleInput}
                  onSearch={handleSearch}
                  searchHistory={searchHistory}
                  suggestions={suggestions}
                  showDropdown={showDropdown}
                  onSelect={handleSelect}
                  onClose={() => setOverlay(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {!disableOverlay && (
        <button
          type="button"
          className="flex md:hidden items-center justify-center cursor-pointer h-10 w-10"
          onClick={() => setOverlay(true)}
          aria-label="Open search"
        >
          <Search className="h-6 w-6" />
        </button>
      )}

      <div
        className={`relative ${
          disableOverlay ? "flex w-full" : "hidden md:flex w-[340px]"
        } h-[40px] items-center rounded-md border border-input bg-background overflow-visible group focus-within:ring-2 focus-within:ring-blue-500`}
        style={{ boxShadow: "none" }}
        onClick={disableOverlay ? undefined : () => setOverlay(true)}
      >
        <span className="pl-3 flex items-center text-muted-foreground">
          <Search className="h-4 w-4" />
        </span>
        <SearchInput
          query={searchQuery}
          placeholder={placeholder}
          onInput={handleInput}
          onSearch={handleSearch}
          readOnly={!disableOverlay}
          className={`border-none bg-transparent focus:ring-0 focus-visible:ring-0 px-2 text-sm flex-1 placeholder:text-muted-foreground ${
            !disableOverlay ? "cursor-pointer" : ""
          }`}
        />
      </div>
    </>
  );
}
