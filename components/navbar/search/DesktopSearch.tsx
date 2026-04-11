import { motion } from "framer-motion";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { SearchInput } from "./SearchInput";
import { SearchSuggestions } from "./SearchSuggestions";
import Logo from "../../../public/Kindora.png";

interface DesktopSearchProps {
  query: string;
  placeholder: string;
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: (e?: React.FormEvent) => void;
  searchHistory: string[];
  suggestions: string[];
  showDropdown: boolean;
  onSelect: (item: string) => void;
  onClose: () => void;
}

export const DesktopSearch = ({ query, placeholder, onInput, onSearch, searchHistory, suggestions, showDropdown, onSelect, onClose }: DesktopSearchProps) => (
  <div className="hidden md:flex flex-col w-full h-full">
    <div className="flex items-center justify-between w-full max-w-[1240px] gap-x-24 mx-auto pt-4">
      <Image
        src={Logo}
        alt="Logo"
        width={120}
        height={40}
        className="h-10 w-auto"
        priority
      />
      <div className="flex items-center justify-end gap-x-24 flex-1">
        <motion.div
          initial={{ width: 340 }}
          animate={{ width: '100%' }}
          exit={{ width: 340 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="relative origin-right"
          style={{ transformOrigin: 'right', marginLeft: 'auto' }}
        >
          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none pl-2">
            <Search className="h-5 w-5" />
          </span>
          <SearchInput
            query={query}
            placeholder={placeholder}
            onInput={onInput}
            onSearch={onSearch}
            autoFocus
            className="w-full text-black pl-10 pr-2 text-[20px] font-normal border-0 border-b-2 border-black bg-transparent placeholder:text-gray-400 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none shadow-none rounded-none"
            />
          <SearchSuggestions
            query={query}
            searchHistory={searchHistory}
            suggestions={suggestions}
            onSelect={onSelect}
            showDropdown={showDropdown}
          />
        </motion.div>
        <button
          type="button"
          className="text-black hover:text-gray-600 focus:outline-none z-50 cursor-pointer"
          onClick={onClose}
          aria-label="Close search"
          style={{ fontSize: 28, background: 'none', border: 'none', padding: 0, height: 80 }}
        >
          <X className="h-6 w-6 text-gray-500" />
        </button>
      </div>
    </div>
  </div>
); 