"use client";

import { Search, History, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";



interface SearchBarProps {
    onSearch?: (query: string, location: string) => void;
    initialQuery?: string;
    initialLocation?: string;
    className?: string;
    borderRadius?: string;
    showClearButton?: boolean;
    onClear?: () => void;
    placeholder?: string;
}


export default function SearchBar({
    onSearch,
    initialQuery = "",
    initialLocation = "",
    className = "",
    borderRadius = "8px",
    showClearButton = false,
    onClear,
    placeholder = "Search for jobs",
    preventRedirect = false,
}: SearchBarProps & { preventRedirect?: boolean }) {

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { data: session } = useSession();


    // Sync with initialQuery prop
    useEffect(() => {
        setSearchQuery(initialQuery);
    }, [initialQuery]);


    // Load history from localStorage on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem("search_history");
        if (savedHistory) {
            try {
                const parsed = JSON.parse(savedHistory);
                if (Array.isArray(parsed)) {
                    setHistory(parsed.slice(0, 5));
                }
            } catch (e) {
                console.error("Failed to parse search history", e);
            }
        }
    }, []);

    // Handle click outside to close history
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowHistory(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const saveToHistory = (query: string) => {
        const trimmed = query.trim();
        if (!trimmed) return;

        const newHistory = [trimmed, ...history.filter((h) => h !== trimmed)].slice(0, 5);
        setHistory(newHistory);
        localStorage.setItem("search_history", JSON.stringify(newHistory));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery) {
            saveToHistory(trimmedQuery);

            if (!preventRedirect) {
                const role = session?.user?.role;
                const basePath = role === "volunteer" ? "/search/opportunities" : "/search/volunteers";
                const searchUrl = `${basePath}/?from_recent_search=true&q=${encodeURIComponent(trimmedQuery)}`;
                router.push(searchUrl);
            }
            onSearch?.(trimmedQuery, initialLocation);
        }
        setShowHistory(false);
    };


    const handleHistoryClick = (query: string) => {
        setSearchQuery(query);
        saveToHistory(query);

        if (!preventRedirect) {
            const role = session?.user?.role;
            const basePath = role === "volunteer" ? "/search/opportunities" : "/search/volunteers";
            const searchUrl = `${basePath}/?from_recent_search=true&q=${encodeURIComponent(query)}`;
            router.push(searchUrl);
        }
        onSearch?.(query, initialLocation);
        setShowHistory(false);
    };
    const handleClear = () => {
        setSearchQuery("");
        onClear?.();
    };


    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-center">
                    <Search className="absolute left-4 h-5 w-5 text-[#101828]" />
                    <Input
                        type="text"
                        placeholder={placeholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setShowHistory(true)}
                        className={cn(
                            "w-full pl-12 pr-12 py-3 h-[48px] bg-white border border-[#101828] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#101828] text-[#101828] placeholder:text-[#667085] text-base",
                            className
                        )}
                        style={{ borderRadius }}
                    />
                    {showClearButton && searchQuery && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="h-4 w-4 text-[#667085]" />
                        </button>
                    )}
                </div>

            </form>

            {showHistory && history.length > 0 && (
                <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-[#E9EAEB] rounded-xl shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)] z-50 overflow-hidden py-2">
                    {history.map((item, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleHistoryClick(item)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F9FAFB] transition-colors text-left group"
                        >
                            <History className="h-4 w-4 text-[#667085] group-hover:text-[#101828]" />
                            <span className="text-sm font-medium text-[#344054] group-hover:text-[#101828]">{item}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
